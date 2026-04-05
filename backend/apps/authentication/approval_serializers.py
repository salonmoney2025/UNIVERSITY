"""
Serializers for Approval Workflow System
"""
from rest_framework import serializers
from .approval_models import (
    ApprovalChain, ApprovalLevel, ApprovalRequest,
    ApprovalAction, ApprovalComment, ApprovalTemplate
)
from .serializers import UserSerializer


class ApprovalLevelSerializer(serializers.ModelSerializer):
    """Serializer for ApprovalLevel"""
    specific_approvers = UserSerializer(many=True, read_only=True)
    specific_approver_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = ApprovalLevel
        fields = [
            'id', 'approval_chain', 'level_number', 'role',
            'specific_approvers', 'specific_approver_ids',
            'require_all_approvers', 'can_skip',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        specific_approver_ids = validated_data.pop('specific_approver_ids', [])
        level = ApprovalLevel.objects.create(**validated_data)

        if specific_approver_ids:
            from .models import User
            approvers = User.objects.filter(id__in=specific_approver_ids)
            level.specific_approvers.set(approvers)

        return level


class ApprovalChainSerializer(serializers.ModelSerializer):
    """Serializer for ApprovalChain"""
    levels = ApprovalLevelSerializer(many=True, read_only=True)
    level_count = serializers.SerializerMethodField()

    class Meta:
        model = ApprovalChain
        fields = [
            'id', 'name', 'code', 'description', 'permission_required',
            'is_active', 'escalation_hours', 'notify_on_submission',
            'notify_on_approval', 'notify_on_rejection', 'levels',
            'level_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_level_count(self, obj):
        return obj.levels.count()


class ApprovalActionSerializer(serializers.ModelSerializer):
    """Serializer for ApprovalAction"""
    approver = UserSerializer(read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = ApprovalAction
        fields = [
            'id', 'approval_request', 'level_number', 'approver',
            'action', 'action_display', 'notes', 'ip_address',
            'user_agent', 'acted_at', 'created_at'
        ]
        read_only_fields = ['id', 'acted_at', 'created_at']


class ApprovalCommentSerializer(serializers.ModelSerializer):
    """Serializer for ApprovalComment"""
    user = UserSerializer(read_only=True)
    mentioned_users = UserSerializer(many=True, read_only=True)
    mentioned_user_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = ApprovalComment
        fields = [
            'id', 'approval_request', 'user', 'comment', 'is_internal',
            'mentioned_users', 'mentioned_user_ids', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def create(self, validated_data):
        mentioned_user_ids = validated_data.pop('mentioned_user_ids', [])
        comment = ApprovalComment.objects.create(**validated_data)

        if mentioned_user_ids:
            from .models import User
            users = User.objects.filter(id__in=mentioned_user_ids)
            comment.mentioned_users.set(users)

        return comment


class ApprovalRequestSerializer(serializers.ModelSerializer):
    """Serializer for ApprovalRequest"""
    submitted_by = UserSerializer(read_only=True)
    final_decision_by = UserSerializer(read_only=True)
    approval_chain_details = ApprovalChainSerializer(source='approval_chain', read_only=True)
    actions = ApprovalActionSerializer(many=True, read_only=True)
    comments = ApprovalCommentSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    current_approvers = serializers.SerializerMethodField()
    can_approve = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = ApprovalRequest
        fields = [
            'id', 'approval_chain', 'approval_chain_details', 'submitted_by',
            'title', 'description', 'request_data', 'status', 'status_display',
            'current_level', 'submitted_at', 'completed_at', 'expires_at',
            'final_decision_by', 'final_decision_at', 'final_decision_notes',
            'attachments', 'actions', 'comments', 'current_approvers',
            'can_approve', 'progress_percentage', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'submitted_by', 'status', 'current_level', 'submitted_at',
            'completed_at', 'final_decision_by', 'final_decision_at',
            'final_decision_notes', 'created_at', 'updated_at'
        ]

    def get_current_approvers(self, obj):
        if obj.is_completed:
            return []
        approvers = obj.get_current_approvers()
        return UserSerializer(approvers, many=True).data

    def get_can_approve(self, obj):
        """Check if current user can approve this request"""
        request = self.context.get('request')
        if not request or not request.user:
            return False

        if obj.is_completed:
            return False

        current_approvers = obj.get_current_approvers()
        return request.user in current_approvers

    def get_progress_percentage(self, obj):
        """Calculate approval progress"""
        if obj.is_completed:
            return 100

        total_levels = obj.approval_chain.levels.count()
        if total_levels == 0:
            return 0

        return int((obj.current_level - 1) / total_levels * 100)


class ApprovalRequestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating approval requests"""

    class Meta:
        model = ApprovalRequest
        fields = [
            'approval_chain', 'title', 'description',
            'request_data', 'attachments', 'expires_at'
        ]

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['submitted_by'] = request.user
        return super().create(validated_data)


class ApprovalTemplateSerializer(serializers.ModelSerializer):
    """Serializer for ApprovalTemplate"""
    approval_chain = ApprovalChainSerializer(read_only=True)

    class Meta:
        model = ApprovalTemplate
        fields = [
            'id', 'name', 'approval_chain', 'title_template',
            'description_template', 'form_schema', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ApprovalActionCreateSerializer(serializers.Serializer):
    """Serializer for taking approval actions"""
    action = serializers.ChoiceField(choices=ApprovalAction.ACTION_CHOICES)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate_action(self, value):
        """Ensure only valid actions are performed"""
        approval_request = self.context.get('approval_request')

        if approval_request.is_completed:
            raise serializers.ValidationError("This request has already been completed.")

        if approval_request.is_expired:
            raise serializers.ValidationError("This request has expired.")

        return value
