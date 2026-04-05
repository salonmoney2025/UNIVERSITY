"""
API Views for Bulk Operations
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from .models import User
from .bulk_operations import BulkImporter, BulkExporter


class BulkOperationsViewSet(viewsets.ViewSet):
    """
    ViewSet for bulk import/export operations
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    @action(detail=False, methods=['post'])
    def import_users_csv(self, request):
        """
        Import users from CSV file
        """
        # Check permissions
        if request.user.role not in ['SUPER_ADMIN', 'ADMIN', 'REGISTRY_ADMIN']:
            return Response(
                {'error': 'Only administrators can import users'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get file
        file = request.FILES.get('file')
        if not file:
            return Response(
                {'error': 'No file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get role (default to STUDENT)
        role = request.data.get('role', 'STUDENT')

        # Validate role
        valid_roles = [choice[0] for choice in User.ROLE_CHOICES]
        if role not in valid_roles:
            return Response(
                {'error': f'Invalid role. Must be one of: {", ".join(valid_roles)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Import
        results = BulkImporter.import_users_csv(file, role=role)

        return Response({
            'message': f'Import completed. {len(results["success"])} users imported successfully, {len(results["errors"])} errors.',
            'results': results
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def import_users_excel(self, request):
        """
        Import users from Excel file
        """
        # Check permissions
        if request.user.role not in ['SUPER_ADMIN', 'ADMIN', 'REGISTRY_ADMIN']:
            return Response(
                {'error': 'Only administrators can import users'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get file
        file = request.FILES.get('file')
        if not file:
            return Response(
                {'error': 'No file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get role (default to STUDENT)
        role = request.data.get('role', 'STUDENT')

        # Validate role
        valid_roles = [choice[0] for choice in User.ROLE_CHOICES]
        if role not in valid_roles:
            return Response(
                {'error': f'Invalid role. Must be one of: {", ".join(valid_roles)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Import
        results = BulkImporter.import_users_excel(file, role=role)

        return Response({
            'message': f'Import completed. {len(results["success"])} users imported successfully, {len(results["errors"])} errors.',
            'results': results
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def export_users_csv(self, request):
        """
        Export users to CSV
        """
        # Check permissions
        if request.user.role not in ['SUPER_ADMIN', 'ADMIN', 'REGISTRY_ADMIN']:
            return Response(
                {'error': 'Only administrators can export users'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get queryset
        queryset = User.objects.all()

        # Filter by role if specified
        role = request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)

        # Filter by active status
        is_active = request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        # Export
        return BulkExporter.export_users_csv(queryset)

    @action(detail=False, methods=['get'])
    def export_users_excel(self, request):
        """
        Export users to Excel
        """
        # Check permissions
        if request.user.role not in ['SUPER_ADMIN', 'ADMIN', 'REGISTRY_ADMIN']:
            return Response(
                {'error': 'Only administrators can export users'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get queryset
        queryset = User.objects.all()

        # Filter by role if specified
        role = request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)

        # Filter by active status
        is_active = request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        # Export
        return BulkExporter.export_users_excel(queryset)

    @action(detail=False, methods=['get'])
    def download_template_csv(self, request):
        """
        Download CSV template for user import
        """
        return BulkExporter.get_import_template_csv()

    @action(detail=False, methods=['get'])
    def download_template_excel(self, request):
        """
        Download Excel template for user import
        """
        return BulkExporter.get_import_template_excel()

    @action(detail=False, methods=['get'])
    def available_roles(self, request):
        """
        Get list of available roles for import
        """
        roles = [
            {'value': choice[0], 'label': choice[1]}
            for choice in User.ROLE_CHOICES
        ]

        return Response({'roles': roles})
