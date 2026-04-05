"""
API Views for Approval Workflow System
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q, Count, Prefetch

from .approval_models import (
    ApprovalChain, ApprovalLevel, ApprovalRequest,
    ApprovalAction, ApprovalComment, ApprovalTemplate
)
from .approval_serializers import (
    ApprovalChainSerializer, ApprovalLevelSerializer,
    ApprovalRequestSerializer, ApprovalRequestCreateSerializer,
    ApprovalActionSerializer, ApprovalActionCreateSerializer,
    ApprovalCommentSerializer, ApprovalTemplateSerializer
)


class ApprovalChainViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing approval chains
    """
    queryset = ApprovalChain.objects.all()
    serializer_class = ApprovalChainSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ApprovalChain.objects.prefetch_related('levels')

        # Filter by active status
        if self.request.query_params.get('is_active'):
            queryset = queryset.filter(is_active=True)

        return queryset

    @action(detail=True, methods=['post'])
    def add_level(self, request, pk=None):
        """Add a new approval level to the chain"""
        chain = self.get_object()

        serializer = ApprovalLevelSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            serializer.save(approval_chain=chain)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get statistics for this approval chain"""
        chain = self.get_object()

        stats = {
            'total_requests': chain.requests.count(),
            'pending_requests': chain.requests.filter(status=ApprovalRequest.STATUS_PENDING).count(),
            'approved_requests': chain.requests.filter(status=ApprovalRequest.STATUS_APPROVED).count(),
            'rejected_requests': chain.requests.filter(status=ApprovalRequest.STATUS_REJECTED).count(),
            'average_completion_days': self._calculate_average_completion(chain),
            'requests_by_status': self._get_requests_by_status(chain)
        }

        return Response(stats)

    def _calculate_average_completion(self, chain):
        """Calculate average days to complete requests"""
        completed = chain.requests.filter(
            status__in=[ApprovalRequest.STATUS_APPROVED, ApprovalRequest.STATUS_REJECTED],
            completed_at__isnull=False
        )

        if not completed.exists():
            return 0

        total_days = 0
        for req in completed:
            delta = req.completed_at - req.submitted_at
            total_days += delta.days

        return round(total_days / completed.count(), 2)

    def _get_requests_by_status(self, chain):
        """Get request counts grouped by status"""
        return list(
            chain.requests.values('status')
            .annotate(count=Count('id'))
            .order_by('status')
        )


class ApprovalLevelViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing approval levels
    """
    queryset = ApprovalLevel.objects.all()
    serializer_class = ApprovalLevelSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ApprovalLevel.objects.select_related('approval_chain')

        # Filter by approval chain
        chain_id = self.request.query_params.get('approval_chain')
        if chain_id:
            queryset = queryset.filter(approval_chain_id=chain_id)

        return queryset.order_by('approval_chain', 'level_number')


class ApprovalRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing approval requests
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return ApprovalRequestCreateSerializer
        return ApprovalRequestSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = ApprovalRequest.objects.select_related(
            'approval_chain', 'submitted_by', 'final_decision_by'
        ).prefetch_related(
            'actions__approver',
            'comments__user'
        )

        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by user role
        view_type = self.request.query_params.get('view')

        if view_type == 'my_requests':
            # Requests submitted by current user
            queryset = queryset.filter(submitted_by=user)
        elif view_type == 'pending_approval':
            # Requests awaiting approval from current user
            queryset = self._get_pending_for_user(queryset, user)
        elif view_type == 'all':
            # Super admin can see all
            if user.role != 'SUPER_ADMIN':
                # Others see requests they submitted or can approve
                queryset = queryset.filter(
                    Q(submitted_by=user) |
                    Q(id__in=self._get_approvable_request_ids(user))
                )

        return queryset.order_by('-submitted_at')

    def _get_pending_for_user(self, queryset, user):
        """Get requests pending approval from specific user"""
        approvable_ids = self._get_approvable_request_ids(user)
        return queryset.filter(
            status=ApprovalRequest.STATUS_PENDING,
            id__in=approvable_ids
        )

    def _get_approvable_request_ids(self, user):
        """Get IDs of requests the user can approve"""
        pending_requests = ApprovalRequest.objects.filter(
            status=ApprovalRequest.STATUS_PENDING
        )

        approvable_ids = []
        for req in pending_requests:
            current_approvers = req.get_current_approvers()
            if user in current_approvers:
                approvable_ids.append(req.id)

        return approvable_ids

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve the current level of the request"""
        approval_request = self.get_object()

        # Check if user can approve
        current_approvers = approval_request.get_current_approvers()
        if request.user not in current_approvers:
            return Response(
                {'error': 'You are not authorized to approve this request at this level.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Validate action data
        action_serializer = ApprovalActionCreateSerializer(
            data=request.data,
            context={'approval_request': approval_request}
        )

        if not action_serializer.is_valid():
            return Response(
                action_serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get client IP and user agent
        ip_address = self._get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')

        # Approve the level
        notes = action_serializer.validated_data.get('notes', '')
        is_final = approval_request.approve_level(request.user, notes)

        # Get updated request
        approval_request.refresh_from_db()
        serializer = self.get_serializer(approval_request)

        return Response({
            'message': 'Request approved successfully' if is_final else 'Level approved, moved to next level',
            'is_final_approval': is_final,
            'request': serializer.data
        })

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject the approval request"""
        approval_request = self.get_object()

        # Check if user can approve/reject
        current_approvers = approval_request.get_current_approvers()
        if request.user not in current_approvers:
            return Response(
                {'error': 'You are not authorized to reject this request.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Validate action data
        action_serializer = ApprovalActionCreateSerializer(
            data=request.data,
            context={'approval_request': approval_request}
        )

        if not action_serializer.is_valid():
            return Response(
                action_serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        # Reject the request
        notes = action_serializer.validated_data.get('notes', '')
        approval_request.reject(request.user, notes)

        # Get updated request
        approval_request.refresh_from_db()
        serializer = self.get_serializer(approval_request)

        return Response({
            'message': 'Request rejected',
            'request': serializer.data
        })

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel the approval request (only by submitter or admin)"""
        approval_request = self.get_object()

        # Check if user can cancel
        if request.user != approval_request.submitted_by and request.user.role != 'SUPER_ADMIN':
            return Response(
                {'error': 'Only the submitter or admin can cancel this request.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if already completed
        if approval_request.is_completed:
            return Response(
                {'error': 'Cannot cancel a completed request.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Cancel the request
        reason = request.data.get('reason', 'Cancelled by user')
        approval_request.cancel(request.user, reason)

        # Get updated request
        approval_request.refresh_from_db()
        serializer = self.get_serializer(approval_request)

        return Response({
            'message': 'Request cancelled',
            'request': serializer.data
        })

    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        """Add a comment to the approval request"""
        approval_request = self.get_object()

        serializer = ApprovalCommentSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            serializer.save(
                approval_request=approval_request,
                user=request.user
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get dashboard statistics for current user"""
        user = request.user

        # Count pending approvals
        pending_approval_ids = self._get_approvable_request_ids(user)
        pending_approval_count = len(pending_approval_ids)

        # Count user's submitted requests
        my_requests = ApprovalRequest.objects.filter(submitted_by=user)

        stats = {
            'pending_my_approval': pending_approval_count,
            'my_pending_requests': my_requests.filter(status=ApprovalRequest.STATUS_PENDING).count(),
            'my_approved_requests': my_requests.filter(status=ApprovalRequest.STATUS_APPROVED).count(),
            'my_rejected_requests': my_requests.filter(status=ApprovalRequest.STATUS_REJECTED).count(),
            'total_my_requests': my_requests.count(),
        }

        # Recent requests pending approval
        recent_pending = ApprovalRequest.objects.filter(
            id__in=pending_approval_ids,
            status=ApprovalRequest.STATUS_PENDING
        ).order_by('-submitted_at')[:5]

        stats['recent_pending'] = ApprovalRequestSerializer(
            recent_pending,
            many=True,
            context={'request': request}
        ).data

        return Response(stats)

    def _get_client_ip(self, request):
        """Extract client IP from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class ApprovalActionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing approval actions (read-only)
    """
    queryset = ApprovalAction.objects.all()
    serializer_class = ApprovalActionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ApprovalAction.objects.select_related('approver', 'approval_request')

        # Filter by approval request
        request_id = self.request.query_params.get('approval_request')
        if request_id:
            queryset = queryset.filter(approval_request_id=request_id)

        # Filter by approver
        approver_id = self.request.query_params.get('approver')
        if approver_id:
            queryset = queryset.filter(approver_id=approver_id)

        return queryset.order_by('-acted_at')


class ApprovalCommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing approval comments
    """
    queryset = ApprovalComment.objects.all()
    serializer_class = ApprovalCommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = ApprovalComment.objects.select_related('user', 'approval_request')

        # Filter by approval request
        request_id = self.request.query_params.get('approval_request')
        if request_id:
            queryset = queryset.filter(approval_request_id=request_id)

        # Hide internal comments from non-approvers
        if user.role not in ['SUPER_ADMIN', 'ADMIN']:
            queryset = queryset.filter(
                Q(is_internal=False) |
                Q(user=user) |
                Q(mentioned_users=user)
            )

        return queryset.order_by('created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ApprovalTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing approval templates
    """
    queryset = ApprovalTemplate.objects.all()
    serializer_class = ApprovalTemplateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ApprovalTemplate.objects.select_related('approval_chain')

        # Filter by active status
        if self.request.query_params.get('is_active'):
            queryset = queryset.filter(is_active=True)

        # Filter by approval chain
        chain_id = self.request.query_params.get('approval_chain')
        if chain_id:
            queryset = queryset.filter(approval_chain_id=chain_id)

        return queryset.order_by('name')
