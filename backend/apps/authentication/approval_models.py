"""
Approval Workflow System Models
Multi-level approval chains for permission-protected actions
"""
import uuid
from django.db import models
from django.utils import timezone
from .models import BaseModel, User


class ApprovalChain(BaseModel):
    """
    Defines multi-level approval chains for different types of requests
    Example: Grade Change -> Lecturer -> HOD -> Dean
    """
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=100, unique=True, db_index=True)
    description = models.TextField(blank=True, null=True)
    permission_required = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)

    # Auto-escalation settings
    escalation_hours = models.IntegerField(
        default=48,
        help_text="Hours before auto-escalation to next approver"
    )
    notify_on_submission = models.BooleanField(default=True)
    notify_on_approval = models.BooleanField(default=True)
    notify_on_rejection = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Approval Chain"
        verbose_name_plural = "Approval Chains"
        ordering = ['name']

    def __str__(self):
        return self.name


class ApprovalLevel(BaseModel):
    """
    Individual levels within an approval chain
    """
    approval_chain = models.ForeignKey(
        ApprovalChain,
        on_delete=models.CASCADE,
        related_name='levels'
    )
    level_number = models.IntegerField()
    role = models.CharField(max_length=50, help_text="Role required to approve at this level")

    # Alternative: specific users who can approve
    specific_approvers = models.ManyToManyField(
        User,
        blank=True,
        related_name='approval_levels'
    )

    # Require all approvers or any one?
    require_all_approvers = models.BooleanField(
        default=False,
        help_text="If true, all specific_approvers must approve. Otherwise, any one can approve."
    )

    can_skip = models.BooleanField(
        default=False,
        help_text="Can this level be skipped if approver is unavailable?"
    )

    class Meta:
        verbose_name = "Approval Level"
        verbose_name_plural = "Approval Levels"
        ordering = ['approval_chain', 'level_number']
        unique_together = ['approval_chain', 'level_number']

    def __str__(self):
        return f"{self.approval_chain.name} - Level {self.level_number} ({self.role})"


class ApprovalRequest(BaseModel):
    """
    Individual approval request instance
    """
    STATUS_PENDING = 'PENDING'
    STATUS_APPROVED = 'APPROVED'
    STATUS_REJECTED = 'REJECTED'
    STATUS_CANCELLED = 'CANCELLED'
    STATUS_EXPIRED = 'EXPIRED'

    STATUS_CHOICES = (
        (STATUS_PENDING, 'Pending'),
        (STATUS_APPROVED, 'Approved'),
        (STATUS_REJECTED, 'Rejected'),
        (STATUS_CANCELLED, 'Cancelled'),
        (STATUS_EXPIRED, 'Expired'),
    )

    # Request details
    approval_chain = models.ForeignKey(
        ApprovalChain,
        on_delete=models.PROTECT,
        related_name='requests'
    )
    submitted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='approval_requests_submitted'
    )
    title = models.CharField(max_length=255)
    description = models.TextField()

    # Request data (JSON field for flexibility)
    request_data = models.JSONField(
        blank=True,
        null=True,
        help_text="Additional data related to the request"
    )

    # Status tracking
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
        db_index=True
    )
    current_level = models.IntegerField(default=1)

    # Timestamps
    submitted_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Auto-reject after this date"
    )

    # Final decision
    final_decision_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approval_requests_decided'
    )
    final_decision_at = models.DateTimeField(null=True, blank=True)
    final_decision_notes = models.TextField(blank=True, null=True)

    # Attachments
    attachments = models.JSONField(
        blank=True,
        null=True,
        help_text="List of file URLs or document IDs"
    )

    class Meta:
        verbose_name = "Approval Request"
        verbose_name_plural = "Approval Requests"
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['status', 'current_level']),
            models.Index(fields=['submitted_by', 'status']),
            models.Index(fields=['approval_chain', 'status']),
        ]

    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"

    @property
    def is_pending(self):
        return self.status == self.STATUS_PENDING

    @property
    def is_completed(self):
        return self.status in [self.STATUS_APPROVED, self.STATUS_REJECTED, self.STATUS_CANCELLED, self.STATUS_EXPIRED]

    @property
    def is_expired(self):
        if self.expires_at and timezone.now() > self.expires_at:
            return True
        return False

    def get_current_approvers(self):
        """Get users who can approve at current level"""
        try:
            level = self.approval_chain.levels.get(level_number=self.current_level)

            # If specific approvers are defined, return them
            if level.specific_approvers.exists():
                return level.specific_approvers.all()

            # Otherwise, return all users with the required role
            from .models import User
            return User.objects.filter(role=level.role, is_active=True)
        except ApprovalLevel.DoesNotExist:
            return User.objects.none()

    def approve_level(self, approver, notes=""):
        """Approve current level and move to next or complete"""
        # Create approval action record
        ApprovalAction.objects.create(
            approval_request=self,
            level_number=self.current_level,
            approver=approver,
            action=ApprovalAction.ACTION_APPROVED,
            notes=notes
        )

        # Check if this is the last level
        max_level = self.approval_chain.levels.aggregate(models.Max('level_number'))['level_number__max']

        if self.current_level >= max_level:
            # Final approval
            self.status = self.STATUS_APPROVED
            self.completed_at = timezone.now()
            self.final_decision_by = approver
            self.final_decision_at = timezone.now()
            self.final_decision_notes = notes
        else:
            # Move to next level
            self.current_level += 1

        self.save()
        return self.status == self.STATUS_APPROVED

    def reject(self, rejecter, notes=""):
        """Reject the approval request"""
        ApprovalAction.objects.create(
            approval_request=self,
            level_number=self.current_level,
            approver=rejecter,
            action=ApprovalAction.ACTION_REJECTED,
            notes=notes
        )

        self.status = self.STATUS_REJECTED
        self.completed_at = timezone.now()
        self.final_decision_by = rejecter
        self.final_decision_at = timezone.now()
        self.final_decision_notes = notes
        self.save()

    def cancel(self, cancelled_by, reason=""):
        """Cancel the approval request"""
        ApprovalAction.objects.create(
            approval_request=self,
            level_number=self.current_level,
            approver=cancelled_by,
            action=ApprovalAction.ACTION_CANCELLED,
            notes=reason
        )

        self.status = self.STATUS_CANCELLED
        self.completed_at = timezone.now()
        self.final_decision_by = cancelled_by
        self.final_decision_at = timezone.now()
        self.final_decision_notes = reason
        self.save()


class ApprovalAction(BaseModel):
    """
    Individual approval actions at each level
    """
    ACTION_APPROVED = 'APPROVED'
    ACTION_REJECTED = 'REJECTED'
    ACTION_COMMENTED = 'COMMENTED'
    ACTION_REQUESTED_INFO = 'REQUESTED_INFO'
    ACTION_CANCELLED = 'CANCELLED'
    ACTION_ESCALATED = 'ESCALATED'

    ACTION_CHOICES = (
        (ACTION_APPROVED, 'Approved'),
        (ACTION_REJECTED, 'Rejected'),
        (ACTION_COMMENTED, 'Commented'),
        (ACTION_REQUESTED_INFO, 'Requested More Information'),
        (ACTION_CANCELLED, 'Cancelled'),
        (ACTION_ESCALATED, 'Auto-Escalated'),
    )

    approval_request = models.ForeignKey(
        ApprovalRequest,
        on_delete=models.CASCADE,
        related_name='actions'
    )
    level_number = models.IntegerField()
    approver = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='approval_actions'
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    notes = models.TextField(blank=True, null=True)

    # Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    acted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Approval Action"
        verbose_name_plural = "Approval Actions"
        ordering = ['-acted_at']
        indexes = [
            models.Index(fields=['approval_request', 'level_number']),
            models.Index(fields=['approver', 'action']),
        ]

    def __str__(self):
        return f"{self.approval_request.title} - {self.get_action_display()} by {self.approver}"


class ApprovalComment(BaseModel):
    """
    Comments and discussions on approval requests
    """
    approval_request = models.ForeignKey(
        ApprovalRequest,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='approval_comments'
    )
    comment = models.TextField()
    is_internal = models.BooleanField(
        default=False,
        help_text="Internal comments only visible to approvers"
    )

    # Mentions
    mentioned_users = models.ManyToManyField(
        User,
        blank=True,
        related_name='approval_mentions'
    )

    class Meta:
        verbose_name = "Approval Comment"
        verbose_name_plural = "Approval Comments"
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.user} on {self.approval_request}"


class ApprovalTemplate(BaseModel):
    """
    Predefined templates for common approval requests
    """
    name = models.CharField(max_length=200)
    approval_chain = models.ForeignKey(
        ApprovalChain,
        on_delete=models.CASCADE,
        related_name='templates'
    )
    title_template = models.CharField(
        max_length=255,
        help_text="Template with placeholders like {student_name}, {course_code}"
    )
    description_template = models.TextField()

    # Form fields (JSON schema)
    form_schema = models.JSONField(
        help_text="JSON schema defining required fields for this template"
    )

    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Approval Template"
        verbose_name_plural = "Approval Templates"
        ordering = ['name']

    def __str__(self):
        return self.name
