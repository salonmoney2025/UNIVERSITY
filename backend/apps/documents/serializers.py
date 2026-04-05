"""
Document Serializers
"""
from rest_framework import serializers
from django.contrib.auth.models import Group
from .models import (
    Document, DocumentVersion, DocumentCategory, DocumentTag,
    DocumentShare, DocumentLink, DocumentSignature, DocumentActivity, DocumentComment
)
from apps.authentication.models import User


class UserBasicSerializer(serializers.ModelSerializer):
    """Minimal user info for documents"""
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'avatar']
        read_only_fields = fields


class DocumentCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentCategory
        fields = ['id', 'name', 'description', 'color', 'icon', 'created_at']


class DocumentTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentTag
        fields = ['id', 'name', 'color']


class DocumentVersionSerializer(serializers.ModelSerializer):
    uploaded_by = UserBasicSerializer(read_only=True)
    file_size_display = serializers.SerializerMethodField()

    class Meta:
        model = DocumentVersion
        fields = [
            'id', 'version_number', 'file', 'file_type', 'file_size',
            'file_size_display', 'uploaded_by', 'change_description',
            'downloads_count', 'views_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'downloads_count', 'views_count']

    def get_file_size_display(self, obj):
        return obj.get_file_size_display() if hasattr(obj, 'get_file_size_display') else f"{obj.file_size} B"


class DocumentShareSerializer(serializers.ModelSerializer):
    shared_with_user = UserBasicSerializer(read_only=True)
    shared_by = UserBasicSerializer(read_only=True)
    shared_with_group_name = serializers.CharField(source='shared_with_group.name', read_only=True)
    is_valid = serializers.SerializerMethodField()

    class Meta:
        model = DocumentShare
        fields = [
            'id', 'shared_with_user', 'shared_with_group_name', 'shared_by',
            'permission', 'expires_at', 'is_expired', 'is_valid',
            'first_accessed_at', 'last_accessed_at', 'access_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'first_accessed_at', 'last_accessed_at', 'access_count']

    def get_is_valid(self, obj):
        return obj.is_valid()


class DocumentLinkSerializer(serializers.ModelSerializer):
    created_by = UserBasicSerializer(read_only=True)
    is_valid = serializers.SerializerMethodField()

    class Meta:
        model = DocumentLink
        fields = [
            'id', 'token', 'title', 'permission', 'expires_at', 'is_active',
            'is_valid', 'access_count', 'created_by', 'created_at'
        ]
        read_only_fields = ['id', 'token', 'created_at', 'access_count']

    def get_is_valid(self, obj):
        return obj.is_valid()


class DocumentSignatureSerializer(serializers.ModelSerializer):
    signed_by = UserBasicSerializer(read_only=True)
    verified_by = UserBasicSerializer(read_only=True)

    class Meta:
        model = DocumentSignature
        fields = [
            'id', 'signed_by', 'signature_image', 'signed_at',
            'status', 'rejection_reason', 'is_verified', 'verified_by',
            'verified_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'verified_at']


class DocumentActivitySerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = DocumentActivity
        fields = ['id', 'user', 'action', 'action_display', 'details', 'created_at']
        read_only_fields = fields


class DocumentCommentSerializer(serializers.ModelSerializer):
    author = UserBasicSerializer(read_only=True)
    mentions = UserBasicSerializer(many=True, read_only=True)

    class Meta:
        model = DocumentComment
        fields = [
            'id', 'author', 'text', 'is_pinned', 'mentions',
            'reply_to', 'edited_at', 'edit_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'edited_at', 'edit_count']


class DocumentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for document lists"""
    owner = UserBasicSerializer(read_only=True)
    category = DocumentCategorySerializer(read_only=True)
    tags = DocumentTagSerializer(many=True, read_only=True)
    file_size_display = serializers.SerializerMethodField()
    share_count = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            'id', 'title', 'description', 'owner', 'category', 'tags',
            'file_type', 'file_size', 'file_size_display', 'is_public',
            'is_archived', 'requires_signature', 'current_version',
            'share_count', 'created_at', 'updated_at'
        ]
        read_only_fields = fields

    def get_file_size_display(self, obj):
        return obj.get_file_size_display()

    def get_share_count(self, obj):
        return obj.shares.filter(is_expired=False).count()


class DocumentDetailSerializer(serializers.ModelSerializer):
    """Full serializer with all related data"""
    owner = UserBasicSerializer(read_only=True)
    category = DocumentCategorySerializer(read_only=True)
    tags = DocumentTagSerializer(many=True, read_only=True)
    versions = DocumentVersionSerializer(many=True, read_only=True)
    shares = DocumentShareSerializer(many=True, read_only=True)
    signatures = DocumentSignatureSerializer(many=True, read_only=True)
    comments = DocumentCommentSerializer(many=True, read_only=True)
    activity = DocumentActivitySerializer(many=True, read_only=True)
    file_size_display = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            'id', 'title', 'description', 'file', 'file_type', 'file_size',
            'file_size_display', 'file_hash', 'owner', 'category', 'tags',
            'is_public', 'is_archived', 'requires_signature', 'signature_deadline',
            'current_version', 'versions', 'shares', 'links', 'signatures',
            'comments', 'activity', 'is_deleted', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'file_hash', 'versions', 'shares', 'signatures', 'comments', 'activity', 'created_at', 'updated_at']

    def get_file_size_display(self, obj):
        return obj.get_file_size_display()


class DocumentCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating documents"""
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=DocumentCategory.objects.all(),
        source='category',
        required=False,
        allow_null=True
    )
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=DocumentTag.objects.all(),
        source='tags',
        many=True,
        required=False
    )

    class Meta:
        model = Document
        fields = [
            'title', 'description', 'file', 'category_id', 'tag_ids',
            'is_public', 'requires_signature', 'signature_deadline'
        ]
