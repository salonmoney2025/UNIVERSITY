"""
Letters Management Admin
"""
from django.contrib import admin
from .models import LetterTemplate, GeneratedLetter, LetterSignature, LetterLog


@admin.register(LetterTemplate)
class LetterTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'letter_type', 'campus', 'is_active', 'created_at']
    list_filter = ['letter_type', 'is_active', 'campus', 'created_at']
    search_fields = ['name', 'subject']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'letter_type', 'campus', 'is_active')
        }),
        ('Content', {
            'fields': ('subject', 'body', 'header_html', 'footer_html')
        }),
        ('Signature Settings', {
            'fields': ('requires_signature', 'signature_roles')
        }),
        ('Metadata', {
            'fields': ('available_variables', 'created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(GeneratedLetter)
class GeneratedLetterAdmin(admin.ModelAdmin):
    list_display = ['reference_number', 'template', 'recipient_name', 'status', 'campus', 'created_at']
    list_filter = ['status', 'campus', 'template__letter_type', 'created_at']
    search_fields = ['reference_number', 'recipient_name', 'subject']
    readonly_fields = ['id', 'reference_number', 'created_at', 'updated_at', 'signed_at', 'issued_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('template', 'campus', 'reference_number', 'status')
        }),
        ('Recipient', {
            'fields': ('student', 'staff', 'recipient_name', 'recipient_email')
        }),
        ('Content', {
            'fields': ('subject', 'content', 'rendered_html')
        }),
        ('Signature', {
            'fields': ('signed_by', 'signed_at', 'digital_signature')
        }),
        ('Issuance', {
            'fields': ('issued_by', 'issued_at', 'pdf_file')
        }),
        ('Metadata', {
            'fields': ('metadata', 'notes', 'created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(LetterSignature)
class LetterSignatureAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'campus', 'is_active', 'created_at']
    list_filter = ['is_active', 'campus', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'title']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(LetterLog)
class LetterLogAdmin(admin.ModelAdmin):
    list_display = ['letter', 'action', 'performed_by', 'created_at']
    list_filter = ['action', 'created_at']
    search_fields = ['letter__reference_number']
    readonly_fields = ['id', 'created_at']
