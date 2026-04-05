"""
Document Management System Models
Handles document upload, versioning, sharing, and digital signatures
"""
from django.db import models
from django.utils import timezone
from django.core.validators import FileExtensionValidator
from apps.authentication.models import BaseModel, User
import os


class DocumentCategory(BaseModel):
    """Document categories for organization"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#3b82f6')  # Hex color
    icon = models.CharField(max_length=50, default='file')  # Icon name

    class Meta:
        verbose_name = 'Document Category'
        verbose_name_plural = 'Document Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class DocumentTag(BaseModel):
    """Tags for document organization"""
    name = models.CharField(max_length=50, unique=True)
    color = models.CharField(max_length=7, default='#10b981')

    class Meta:
        verbose_name = 'Document Tag'
        verbose_name_plural = 'Document Tags'
        ordering = ['name']

    def __str__(self):
        return self.name


class Document(BaseModel):
    """Main document model with versioning"""
    # Basic info
    title = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True)
    file = models.FileField(
        upload_to='documents/%Y/%m/%d/',
        validators=[FileExtensionValidator(
            allowed_extensions=['pdf', 'docx', 'xlsx', 'txt', 'doc', 'xls', 'ppt', 'pptx', 'jpg', 'png', 'jpeg', 'gif', 'zip']
        )]
    )

    # File metadata
    file_type = models.CharField(max_length=10)  # pdf, docx, xlsx, etc.
    file_size = models.BigIntegerField()  # In bytes
    file_hash = models.CharField(max_length=64, unique=True, db_index=True)  # SHA256

    # Organization
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_documents')
    category = models.ForeignKey(DocumentCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='documents')
    tags = models.ManyToManyField(DocumentTag, blank=True, related_name='documents')

    # Access control
    is_public = models.BooleanField(default=False, db_index=True)
    is_archived = models.BooleanField(default=False, db_index=True)
    archived_at = models.DateTimeField(null=True, blank=True)

    # Signature requirement
    requires_signature = models.BooleanField(default=False)
    signature_deadline = models.DateTimeField(null=True, blank=True)

    # Versioning
    current_version = models.IntegerField(default=1)

    # Soft delete
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='deleted_documents')

    class Meta:
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['owner', 'is_deleted']),
            models.Index(fields=['category', 'is_deleted']),
            models.Index(fields=['is_public', 'is_deleted']),
            models.Index(fields=['created_at', 'is_deleted']),
        ]

    def __str__(self):
        return f"{self.title} (v{self.current_version})"

    @property
    def extension(self):
        """Get file extension"""
        return os.path.splitext(self.file.name)[1].lower().lstrip('.')

    def get_file_size_display(self):
        """Return human-readable file size"""
        size = self.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024:
                return f"{size:.1f}{unit}"
            size /= 1024
        return f"{size:.1f}TB"

    def soft_delete(self, user):
        """Soft delete the document"""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.deleted_by = user
        self.save()

    def restore(self):
        """Restore soft deleted document"""
        self.is_deleted = False
        self.deleted_at = None
        self.deleted_by = None
        self.save()


class DocumentVersion(BaseModel):
    """Keep track of document versions"""
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='versions')
    version_number = models.IntegerField()
    file = models.FileField(upload_to='documents/versions/%Y/%m/%d/')

    # Version metadata
    file_type = models.CharField(max_length=10)
    file_size = models.BigIntegerField()
    file_hash = models.CharField(max_length=64, unique=True)

    # Who uploaded it
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='uploaded_versions')
    change_description = models.TextField()

    # Activity logging
    downloads_count = models.IntegerField(default=0)
    views_count = models.IntegerField(default=0)

    class Meta:
        verbose_name = 'Document Version'
        verbose_name_plural = 'Document Versions'
        ordering = ['-version_number']
        unique_together = ['document', 'version_number']
        indexes = [
            models.Index(fields=['document', 'version_number']),
        ]

    def __str__(self):
        return f"{self.document.title} - v{self.version_number}"


class DocumentShare(BaseModel):
    """Share documents with users or groups"""
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='shares')

    # Share target (either user or group, not both)
    shared_with_user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='shared_documents')
    shared_with_group = models.ForeignKey('auth.Group', on_delete=models.CASCADE, null=True, blank=True, related_name='shared_documents')

    shared_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='documents_shared')

    # Permission level
    PERMISSION_CHOICES = [
        ('view', 'View Only'),
        ('download', 'Download'),
        ('comment', 'Comment'),
        ('edit', 'Edit'),
    ]
    permission = models.CharField(max_length=20, choices=PERMISSION_CHOICES, default='view')

    # Expiration
    expires_at = models.DateTimeField(null=True, blank=True)
    is_expired = models.BooleanField(default=False, db_index=True)

    # Access tracking
    first_accessed_at = models.DateTimeField(null=True, blank=True)
    last_accessed_at = models.DateTimeField(null=True, blank=True)
    access_count = models.IntegerField(default=0)

    class Meta:
        verbose_name = 'Document Share'
        verbose_name_plural = 'Document Shares'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['document', 'shared_with_user']),
            models.Index(fields=['document', 'shared_with_group']),
        ]

    def __str__(self):
        target = self.shared_with_user.email if self.shared_with_user else self.shared_with_group.name
        return f"{self.document.title} -> {target} ({self.permission})"

    def is_valid(self):
        """Check if share is still valid"""
        if self.expires_at and timezone.now() > self.expires_at:
            self.is_expired = True
            self.save()
            return False
        return True


class DocumentLink(BaseModel):
    """Public/temporary document sharing links"""
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='links')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_document_links')

    # Link properties
    token = models.CharField(max_length=64, unique=True, db_index=True)
    title = models.CharField(max_length=255, blank=True)  # Custom link name

    # Permissions
    LINK_PERMISSION_CHOICES = [
        ('view', 'View Only'),
        ('download', 'Download'),
    ]
    permission = models.CharField(max_length=20, choices=LINK_PERMISSION_CHOICES, default='view')

    # Expiration
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)

    # Access tracking
    access_count = models.IntegerField(default=0)
    accessed_ips = models.JSONField(default=list)  # List of IPs that accessed

    class Meta:
        verbose_name = 'Document Link'
        verbose_name_plural = 'Document Links'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.document.title} - {self.token[:8]}..."

    def is_valid(self):
        """Check if link is still valid"""
        if not self.is_active:
            return False
        if self.expires_at and timezone.now() > self.expires_at:
            self.is_active = False
            self.save()
            return False
        return True


class DocumentSignature(BaseModel):
    """Digital signatures on documents"""
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='signatures')
    signed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='document_signatures')

    # Signature image/data
    signature_image = models.ImageField(upload_to='signatures/%Y/%m/%d/')
    signature_data = models.JSONField()  # Canvas coordinates and points

    # Signature timestamp
    signed_at = models.DateTimeField()
    timezone_offset = models.IntegerField()  # Timezone offset in minutes

    # Status
    SIGNATURE_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('signed', 'Signed'),
        ('rejected', 'Rejected'),
    ]
    status = models.CharField(max_length=20, choices=SIGNATURE_STATUS_CHOICES, default='signed')
    rejection_reason = models.TextField(blank=True, null=True)

    # IP and user agent
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    # Verification
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_signatures')
    verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Document Signature'
        verbose_name_plural = 'Document Signatures'
        ordering = ['-signed_at']
        indexes = [
            models.Index(fields=['document', 'signed_by']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.document.title} - Signed by {self.signed_by.email if self.signed_by else 'Unknown'}"


class DocumentActivity(BaseModel):
    """Audit trail for document actions"""
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='activities')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='document_activities')

    # Action details
    ACTION_CHOICES = [
        ('upload', 'Upload'),
        ('download', 'Download'),
        ('view', 'View'),
        ('share', 'Share'),
        ('unshare', 'Unshare'),
        ('sign', 'Sign'),
        ('reject', 'Reject Signature'),
        ('comment', 'Comment'),
        ('version_create', 'Create Version'),
        ('archive', 'Archive'),
        ('restore', 'Restore'),
        ('delete', 'Delete'),
        ('link_create', 'Create Link'),
        ('link_revoke', 'Revoke Link'),
    ]
    action = models.CharField(max_length=20, choices=ACTION_CHOICES, db_index=True)

    # Additional details
    details = models.JSONField(default=dict, blank=True)
    
    # Request info
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Document Activity'
        verbose_name_plural = 'Document Activities'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['document', 'action']),
            models.Index(fields=['user', 'action']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        user_display = self.user.email if self.user else 'Anonymous'
        return f"{user_display} - {self.get_action_display()} - {self.document.title}"


class DocumentComment(BaseModel):
    """Comments on documents"""
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='document_comments')

    # Comment content
    text = models.TextField()
    is_pinned = models.BooleanField(default=False)

    # Mention and reply
    mentions = models.ManyToManyField(User, related_name='mentioned_in_comments', blank=True)
    reply_to = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')

    # Edit tracking
    edited_at = models.DateTimeField(null=True, blank=True)
    edit_count = models.IntegerField(default=0)

    class Meta:
        verbose_name = 'Document Comment'
        verbose_name_plural = 'Document Comments'
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.author.email} on {self.document.title}"
