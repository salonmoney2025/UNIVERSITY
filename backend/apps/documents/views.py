"""
Document Management Views
"""
import hashlib
import os
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Count, Q, F
from django.core.files.base import ContentFile
from django.http import FileResponse, Http404

from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
import uuid

from .models import (
    Document, DocumentVersion, DocumentCategory, DocumentTag,
    DocumentShare, DocumentLink, DocumentSignature, DocumentActivity, DocumentComment
)
from .serializers import (
    DocumentListSerializer, DocumentDetailSerializer, DocumentCreateUpdateSerializer,
    DocumentVersionSerializer, DocumentShareSerializer, DocumentLinkSerializer,
    DocumentSignatureSerializer, DocumentActivitySerializer, DocumentCommentSerializer,
    DocumentCategorySerializer, DocumentTagSerializer
)
from apps.authentication.permissions import IsAdmin


class DocumentPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class DocumentCategoryViewSet(viewsets.ModelViewSet):
    """Manage document categories"""
    queryset = DocumentCategory.objects.all()
    serializer_class = DocumentCategorySerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]


class DocumentTagViewSet(viewsets.ModelViewSet):
    """Manage document tags"""
    queryset = DocumentTag.objects.all()
    serializer_class = DocumentTagSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ['name']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]


class DocumentViewSet(viewsets.ModelViewSet):
    """Main document management viewset"""
    serializer_class = DocumentDetailSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = DocumentPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'is_public', 'is_archived', 'requires_signature']
    search_fields = ['title', 'description', 'tags__name']
    ordering_fields = ['created_at', 'updated_at', 'title']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filter documents by ownership and permissions"""
        user = self.request.user
        
        # Admin sees all, users see their own + shared documents
        if user.is_staff or user.role == 'ADMIN':
            return Document.objects.filter(is_deleted=False).select_related(
                'owner', 'category'
            ).prefetch_related('tags', 'versions', 'shares')
        
        # Regular users see owned + shared + public
        return Document.objects.filter(
            Q(owner=user) |
            Q(shares__shared_with_user=user) |
            Q(shares__shared_with_group__user=user) |
            Q(is_public=True),
            is_deleted=False
        ).distinct().select_related(
            'owner', 'category'
        ).prefetch_related('tags', 'versions', 'shares')

    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'list':
            return DocumentListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return DocumentCreateUpdateSerializer
        return DocumentDetailSerializer

    def perform_create(self, serializer):
        """Handle file upload and hashing"""
        file = self.request.FILES.get('file')
        
        # Calculate file hash
        file_hash = hashlib.sha256()
        for chunk in file.chunks():
            file_hash.update(chunk)
        file_hash = file_hash.hexdigest()

        # Check if file already exists
        if Document.objects.filter(file_hash=file_hash).exists():
            raise serializers.ValidationError("This file has already been uploaded.")

        # Save document
        document = serializer.save(
            owner=self.request.user,
            file_type=file.name.split('.')[-1].lower(),
            file_size=file.size,
            file_hash=file_hash
        )

        # Create activity log
        DocumentActivity.objects.create(
            document=document,
            user=self.request.user,
            action='upload',
            ip_address=self.get_client_ip(),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )

    def perform_update(self, serializer):
        """Update document metadata"""
        serializer.save()
        DocumentActivity.objects.create(
            document=serializer.instance,
            user=self.request.user,
            action='version_create',
            ip_address=self.get_client_ip(),
            details={'change_description': self.request.data.get('change_description', '')}
        )

    @action(detail=True, methods=['post'])
    def upload_version(self, request, pk=None):
        """Upload new version of document"""
        document = self.get_object()
        
        # Check permission
        if document.owner != request.user and not request.user.is_staff:
            return Response(
                {'detail': 'You do not have permission to upload versions of this document.'},
                status=status.HTTP_403_FORBIDDEN
            )

        file = request.FILES.get('file')
        if not file:
            return Response(
                {'detail': 'No file provided.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate file hash
        file_hash = hashlib.sha256()
        for chunk in file.chunks():
            file_hash.update(chunk)
        file_hash = file_hash.hexdigest()

        # Create new version
        new_version_number = document.current_version + 1
        
        version = DocumentVersion.objects.create(
            document=document,
            version_number=new_version_number,
            file=file,
            file_type=file.name.split('.')[-1].lower(),
            file_size=file.size,
            file_hash=file_hash,
            uploaded_by=request.user,
            change_description=request.data.get('change_description', '')
        )

        # Update document's current version
        document.current_version = new_version_number
        document.file = file
        document.file_size = file.size
        document.file_hash = file_hash
        document.save()

        # Log activity
        DocumentActivity.objects.create(
            document=document,
            user=request.user,
            action='version_create',
            ip_address=self.get_client_ip(),
            details={'version_number': new_version_number}
        )

        return Response(
            DocumentVersionSerializer(version).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download document file"""
        document = self.get_object()

        # Check permission
        if not self.has_download_permission(request.user, document):
            return Response(
                {'detail': 'You do not have permission to download this document.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Log activity
        DocumentActivity.objects.create(
            document=document,
            user=request.user,
            action='download',
            ip_address=self.get_client_ip()
        )

        # Increment download count
        current_version = document.versions.filter(
            version_number=document.current_version
        ).first()
        if current_version:
            current_version.downloads_count += 1
            current_version.save()

        # Return file
        if not document.file:
            return Response(
                {'detail': 'File not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        return FileResponse(
            document.file.open('rb'),
            as_attachment=True,
            filename=document.file.name
        )

    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        """Get preview data for document"""
        document = self.get_object()

        # Check permission
        if not self.has_view_permission(request.user, document):
            return Response(
                {'detail': 'You do not have permission to view this document.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Log activity
        DocumentActivity.objects.create(
            document=document,
            user=request.user,
            action='view',
            ip_address=self.get_client_ip()
        )

        return Response({
            'id': document.id,
            'title': document.title,
            'file_type': document.file_type,
            'file_url': document.file.url if document.file else None,
            'file_size': document.file_size,
            'owner': {'email': document.owner.email},
            'created_at': document.created_at,
            'current_version': document.current_version,
        })

    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        """Share document with user or group"""
        document = self.get_object()

        # Check permission
        if document.owner != request.user and not request.user.is_staff:
            return Response(
                {'detail': 'You do not have permission to share this document.'},
                status=status.HTTP_403_FORBIDDEN
            )

        user_id = request.data.get('user_id')
        group_id = request.data.get('group_id')
        permission = request.data.get('permission', 'view')
        expires_at = request.data.get('expires_at')

        if not user_id and not group_id:
            return Response(
                {'detail': 'Provide either user_id or group_id.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        share = DocumentShare.objects.create(
            document=document,
            shared_with_user_id=user_id,
            shared_with_group_id=group_id,
            shared_by=request.user,
            permission=permission,
            expires_at=expires_at
        )

        # Log activity
        DocumentActivity.objects.create(
            document=document,
            user=request.user,
            action='share',
            ip_address=self.get_client_ip(),
            details={'shared_with': user_id or group_id, 'permission': permission}
        )

        return Response(
            DocumentShareSerializer(share).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'], url_path='shares/(?P<share_id>[^/.]+)/revoke')
    def revoke_share(self, request, pk=None, share_id=None):
        """Revoke document share"""
        document = self.get_object()
        share = get_object_or_404(DocumentShare, id=share_id, document=document)

        # Check permission
        if share.shared_by != request.user and not request.user.is_staff:
            return Response(
                {'detail': 'You do not have permission to revoke this share.'},
                status=status.HTTP_403_FORBIDDEN
            )

        share.delete()

        # Log activity
        DocumentActivity.objects.create(
            document=document,
            user=request.user,
            action='unshare',
            ip_address=self.get_client_ip()
        )

        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def generate_link(self, request, pk=None):
        """Generate temporary sharing link"""
        document = self.get_object()

        # Check permission
        if document.owner != request.user and not request.user.is_staff:
            return Response(
                {'detail': 'You do not have permission to create links for this document.'},
                status=status.HTTP_403_FORBIDDEN
            )

        permission = request.data.get('permission', 'view')
        expires_at = request.data.get('expires_at')
        title = request.data.get('title', document.title)

        token = str(uuid.uuid4()).replace('-', '')[:32]

        link = DocumentLink.objects.create(
            document=document,
            created_by=request.user,
            token=token,
            title=title,
            permission=permission,
            expires_at=expires_at
        )

        return Response(
            DocumentLinkSerializer(link).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def sign(self, request, pk=None):
        """Sign document"""
        document = self.get_object()

        signature_image = request.FILES.get('signature_image')
        signature_data = request.data.get('signature_data')

        if not signature_image or not signature_data:
            return Response(
                {'detail': 'Signature image and data are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        signature = DocumentSignature.objects.create(
            document=document,
            signed_by=request.user,
            signature_image=signature_image,
            signature_data=signature_data,
            signed_at=timezone.now(),
            timezone_offset=request.data.get('timezone_offset', 0),
            ip_address=self.get_client_ip(),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )

        # Log activity
        DocumentActivity.objects.create(
            document=document,
            user=request.user,
            action='sign',
            ip_address=self.get_client_ip()
        )

        return Response(
            DocumentSignatureSerializer(signature).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """Archive document"""
        document = self.get_object()

        if document.owner != request.user and not request.user.is_staff:
            return Response(
                {'detail': 'You do not have permission to archive this document.'},
                status=status.HTTP_403_FORBIDDEN
            )

        document.is_archived = True
        document.archived_at = timezone.now()
        document.save()

        # Log activity
        DocumentActivity.objects.create(
            document=document,
            user=request.user,
            action='archive',
            ip_address=self.get_client_ip()
        )

        return Response(DocumentDetailSerializer(document).data)

    @action(detail=True, methods=['post'])
    def delete_soft(self, request, pk=None):
        """Soft delete document"""
        document = self.get_object()

        if document.owner != request.user and not request.user.is_staff:
            return Response(
                {'detail': 'You do not have permission to delete this document.'},
                status=status.HTTP_403_FORBIDDEN
            )

        document.soft_delete(request.user)

        # Log activity
        DocumentActivity.objects.create(
            document=document,
            user=request.user,
            action='delete',
            ip_address=self.get_client_ip()
        )

        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Restore soft deleted document"""
        document = self.get_object()

        if document.owner != request.user and not request.user.is_staff:
            return Response(
                {'detail': 'You do not have permission to restore this document.'},
                status=status.HTTP_403_FORBIDDEN
            )

        document.restore()

        # Log activity
        DocumentActivity.objects.create(
            document=document,
            user=request.user,
            action='restore',
            ip_address=self.get_client_ip()
        )

        return Response(DocumentDetailSerializer(document).data)

    @action(detail=True, methods=['get'])
    def activity(self, request, pk=None):
        """Get document activity log"""
        document = self.get_object()
        
        activities = document.activities.all().order_by('-created_at')[:50]
        serializer = DocumentActivitySerializer(activities, many=True)
        
        return Response(serializer.data)

    def has_view_permission(self, user, document):
        """Check if user can view document"""
        if document.owner == user or user.is_staff:
            return True
        if document.is_public:
            return True
        return document.shares.filter(
            Q(shared_with_user=user) | Q(shared_with_group__user=user),
            is_expired=False
        ).exists()

    def has_download_permission(self, user, document):
        """Check if user can download document"""
        if document.owner == user or user.is_staff:
            return True
        return document.shares.filter(
            Q(shared_with_user=user) | Q(shared_with_group__user=user),
            permission__in=['download', 'comment', 'edit'],
            is_expired=False
        ).exists()

    def get_client_ip(self):
        """Get client IP address"""
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = self.request.META.get('REMOTE_ADDR')
        return ip


class DocumentCommentViewSet(viewsets.ModelViewSet):
    """Manage document comments"""
    serializer_class = DocumentCommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        document_id = self.request.query_params.get('document_id')
        if document_id:
            return DocumentComment.objects.filter(document_id=document_id).select_related('author')
        return DocumentComment.objects.all()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
