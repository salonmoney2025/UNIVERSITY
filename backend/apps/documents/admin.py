"""
Document Admin Configuration
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Document, DocumentVersion, DocumentCategory, DocumentTag,
    DocumentShare, DocumentLink, DocumentSignature, DocumentActivity, DocumentComment
)


@admin.register(DocumentCategory)
class DocumentCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'document_count', 'created_at']
    search_fields = ['name']

    def document_count(self, obj):
        return obj.documents.count()
    document_count.short_description = 'Documents'


@admin.register(DocumentTag)
class DocumentTagAdmin(admin.ModelAdmin):
    list_display = ['name', 'color_display', 'document_count']
    search_fields = ['name']

    def color_display(self, obj):
        return format_html(
            '<div style="background-color: {}; width: 20px; height: 20px; border-radius: 3px;"></div>',
            obj.color
        )
    color_display.short_description = 'Color'

    def document_count(self, obj):
        return obj.documents.count()


class DocumentVersionInline(admin.TabularInline):
    model = DocumentVersion
    extra = 0
    fields = ['version_number', 'file_type', 'uploaded_by', 'created_at']
    readonly_fields = ['version_number', 'created_at']


class DocumentShareInline(admin.TabularInline):
    model = DocumentShare
    extra = 0
    fields = ['shared_with_user', 'shared_with_group', 'permission', 'expires_at']


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner', 'file_type', 'file_size_display', 'is_public', 'current_version', 'status_display', 'created_at']
    list_filter = ['is_public', 'is_archived', 'is_deleted', 'category', 'created_at']
    search_fields = ['title', 'owner__email', 'description']
    readonly_fields = ['file_hash', 'current_version', 'created_at', 'updated_at']
    inlines = [DocumentVersionInline, DocumentShareInline]

    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'file')
        }),
        ('Metadata', {
            'fields': ('file_type', 'file_size', 'file_hash', 'category', 'tags')
        }),
        ('Owner & Permissions', {
            'fields': ('owner', 'is_public')
        }),
        ('Status', {
            'fields': ('is_archived', 'archived_at', 'is_deleted', 'deleted_at', 'deleted_by', 'current_version')
        }),
        ('Signature', {
            'fields': ('requires_signature', 'signature_deadline'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def file_size_display(self, obj):
        return obj.get_file_size_display()
    file_size_display.short_description = 'File Size'

    def status_display(self, obj):
        if obj.is_deleted:
            return format_html('<span style="color: red;">Deleted</span>')
        elif obj.is_archived:
            return format_html('<span style="color: orange;">Archived</span>')
        return format_html('<span style="color: green;">Active</span>')
    status_display.short_description = 'Status'


@admin.register(DocumentVersion)
class DocumentVersionAdmin(admin.ModelAdmin):
    list_display = ['document', 'version_number', 'uploaded_by', 'file_size_display', 'created_at']
    list_filter = ['created_at', 'document']
    search_fields = ['document__title', 'uploaded_by__email']
    readonly_fields = ['version_number', 'file_hash', 'created_at']

    def file_size_display(self, obj):
        size = obj.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024:
                return f"{size:.1f}{unit}"
            size /= 1024
        return f"{size:.1f}TB"
    file_size_display.short_description = 'File Size'


@admin.register(DocumentShare)
class DocumentShareAdmin(admin.ModelAdmin):
    list_display = ['document', 'shared_with_target', 'permission', 'expires_at', 'access_count', 'created_at']
    list_filter = ['permission', 'expires_at', 'created_at']
    search_fields = ['document__title', 'shared_with_user__email', 'shared_with_group__name']
    readonly_fields = ['access_count', 'first_accessed_at', 'last_accessed_at', 'created_at']

    def shared_with_target(self, obj):
        if obj.shared_with_user:
            return f"User: {obj.shared_with_user.email}"
        return f"Group: {obj.shared_with_group.name}"
    shared_with_target.short_description = 'Shared With'


@admin.register(DocumentLink)
class DocumentLinkAdmin(admin.ModelAdmin):
    list_display = ['document', 'title', 'permission', 'is_active', 'expires_at', 'access_count', 'created_at']
    list_filter = ['permission', 'is_active', 'created_at']
    search_fields = ['document__title', 'token', 'title']
    readonly_fields = ['token', 'access_count', 'created_at']


@admin.register(DocumentSignature)
class DocumentSignatureAdmin(admin.ModelAdmin):
    list_display = ['document', 'signed_by', 'status', 'signed_at', 'is_verified']
    list_filter = ['status', 'is_verified', 'signed_at']
    search_fields = ['document__title', 'signed_by__email']
    readonly_fields = ['signed_at', 'created_at']


@admin.register(DocumentActivity)
class DocumentActivityAdmin(admin.ModelAdmin):
    list_display = ['document', 'user', 'action', 'created_at']
    list_filter = ['action', 'created_at']
    search_fields = ['document__title', 'user__email']
    readonly_fields = ['created_at']


@admin.register(DocumentComment)
class DocumentCommentAdmin(admin.ModelAdmin):
    list_display = ['document', 'author', 'text_preview', 'created_at']
    list_filter = ['created_at']
    search_fields = ['document__title', 'author__email', 'text']
    readonly_fields = ['created_at', 'edited_at']

    def text_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    text_preview.short_description = 'Comment'
