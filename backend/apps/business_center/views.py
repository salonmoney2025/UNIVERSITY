"""
Business Center Views
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q, Sum, Count

from .models import PinBatch, ApplicationPin, Receipt, SalesReport, PinVerification
from .serializers import (
    PinBatchSerializer, PinBatchCreateSerializer,
    ApplicationPinSerializer, ReceiptSerializer, ReceiptCreateSerializer,
    SalesReportSerializer, PinVerificationSerializer,
    PinVerifySerializer, PinUseSerializer
)
from apps.authentication.permissions import CanManagePins, CanManageFinance, IsBusinessCenter
from .utils import verify_pin, generate_sales_report


class PinBatchViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Pin Batches
    """
    queryset = PinBatch.objects.all()
    permission_classes = [IsAuthenticated, CanManagePins]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['pin_type', 'status', 'campus']
    search_fields = ['batch_number', 'description']
    ordering_fields = ['created_at', 'valid_until', 'quantity']

    def get_serializer_class(self):
        if self.action == 'create':
            return PinBatchCreateSerializer
        return PinBatchSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = PinBatch.objects.filter(is_deleted=False)

        # Filter by role
        if user.role == 'SUPER_ADMIN':
            return queryset
        elif user.role in ['ADMIN', 'BUSINESS_CENTER', 'FINANCE']:
            return queryset
        elif user.role in ['CAMPUS_ADMIN', 'CAMPUS_BUSINESS_CENTER', 'FINANCE_STAFF']:
            return queryset.filter(campus=user.campus)
        else:
            return queryset.none()

    @action(detail=True, methods=['get'])
    def pins(self, request, pk=None):
        """Get all pins for a batch"""
        batch = self.get_object()
        pins = ApplicationPin.objects.filter(batch=batch)

        # Apply filters
        status_filter = request.query_params.get('status')
        if status_filter:
            pins = pins.filter(status=status_filter)

        serializer = ApplicationPinSerializer(pins, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get statistics for a batch"""
        batch = self.get_object()
        stats = {
            'total_pins': batch.quantity,
            'used_pins': batch.used_count,
            'remaining_pins': batch.remaining_count,
            'usage_percentage': round((batch.used_count / batch.quantity * 100), 2) if batch.quantity > 0 else 0,
            'total_value': float(batch.total_value),
            'realized_value': float(batch.price_per_pin * batch.used_count),
            'pending_value': float(batch.price_per_pin * batch.remaining_count),
            'status': batch.status,
            'is_expired': timezone.now() > batch.valid_until
        }
        return Response(stats)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a pin batch"""
        batch = self.get_object()

        # Only SUPER_ADMIN and ADMIN can cancel batches
        if request.user.role not in ['SUPER_ADMIN', 'ADMIN', 'BUSINESS_CENTER']:
            return Response(
                {'error': 'Insufficient permissions to cancel batch'},
                status=status.HTTP_403_FORBIDDEN
            )

        batch.status = 'CANCELLED'
        batch.save()

        # Cancel all unused pins in this batch
        ApplicationPin.objects.filter(
            batch=batch,
            status='UNUSED'
        ).update(status='CANCELLED')

        return Response(
            PinBatchSerializer(batch).data,
            status=status.HTTP_200_OK
        )


class ApplicationPinViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing Application Pins (read-only for most users)
    """
    queryset = ApplicationPin.objects.all()
    serializer_class = ApplicationPinSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'batch__pin_type', 'batch__campus']
    search_fields = ['pin_number', 'serial_number', 'used_by_email']
    ordering_fields = ['created_at', 'used_at', 'valid_until']

    def get_queryset(self):
        user = self.request.user
        queryset = ApplicationPin.objects.filter(is_deleted=False)

        # Filter by role
        if user.role == 'SUPER_ADMIN':
            return queryset
        elif user.role in ['ADMIN', 'BUSINESS_CENTER', 'FINANCE']:
            return queryset
        elif user.role in ['CAMPUS_ADMIN', 'CAMPUS_BUSINESS_CENTER', 'FINANCE_STAFF']:
            return queryset.filter(batch__campus=user.campus)
        else:
            # Other users can only see pins they've used
            return queryset.filter(used_by=user)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def verify(self, request):
        """Verify a pin without using it"""
        serializer = PinVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        pin_number = serializer.validated_data['pin_number']
        serial_number = serializer.validated_data['serial_number']

        success, message, pin = verify_pin(pin_number, serial_number)

        # Log verification attempt
        if pin:
            PinVerification.objects.create(
                pin=pin,
                verified_by_email=serializer.validated_data.get('email', ''),
                verified_by_phone=serializer.validated_data.get('phone', ''),
                verification_ip=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT'),
                was_successful=success,
                failure_reason='' if success else message
            )

        if success:
            return Response({
                'valid': True,
                'message': message,
                'pin_type': pin.batch.get_pin_type_display(),
                'valid_until': pin.valid_until,
                'batch': pin.batch.batch_number
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'valid': False,
                'message': message
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def use(self, request):
        """Use a pin (mark as used)"""
        serializer = PinUseSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        pin_number = serializer.validated_data['pin_number']
        serial_number = serializer.validated_data['serial_number']
        email = serializer.validated_data.get('email')
        phone = serializer.validated_data.get('phone')
        metadata = serializer.validated_data.get('metadata', {})

        success, message, pin = verify_pin(pin_number, serial_number)

        if not success:
            return Response({
                'success': False,
                'message': message
            }, status=status.HTTP_400_BAD_REQUEST)

        # Use the pin
        try:
            user = request.user if request.user.is_authenticated else None
            pin.use_pin(
                user=user,
                email=email,
                phone=phone,
                ip_address=request.META.get('REMOTE_ADDR'),
                metadata=metadata
            )

            return Response({
                'success': True,
                'message': 'Pin used successfully',
                'pin_type': pin.batch.get_pin_type_display(),
                'used_at': pin.used_at
            }, status=status.HTTP_200_OK)

        except ValueError as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class ReceiptViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Receipts
    """
    queryset = Receipt.objects.all()
    permission_classes = [IsAuthenticated, CanManageFinance]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['receipt_type', 'payment_method', 'campus', 'is_cancelled']
    search_fields = ['receipt_number', 'payer_name', 'payer_email', 'transaction_reference']
    ordering_fields = ['created_at', 'payment_date', 'amount']

    def get_serializer_class(self):
        if self.action == 'create':
            return ReceiptCreateSerializer
        return ReceiptSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Receipt.objects.filter(is_deleted=False)

        # Filter by role
        if user.role == 'SUPER_ADMIN':
            return queryset
        elif user.role in ['ADMIN', 'FINANCE', 'FINANCE_SECRETARIAT', 'BUSINESS_CENTER']:
            return queryset
        elif user.role in ['CAMPUS_ADMIN', 'FINANCE_STAFF', 'ACCOUNTANT', 'CAMPUS_BUSINESS_CENTER']:
            return queryset.filter(campus=user.campus)
        else:
            # Users can see their own receipts
            return queryset.filter(payer_user=user)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a receipt"""
        receipt = self.get_object()

        # Check permissions
        if request.user.role not in ['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'ACCOUNTANT']:
            return Response(
                {'error': 'Insufficient permissions to cancel receipts'},
                status=status.HTTP_403_FORBIDDEN
            )

        if receipt.is_cancelled:
            return Response(
                {'error': 'Receipt is already cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )

        receipt.is_cancelled = True
        receipt.cancelled_at = timezone.now()
        receipt.cancelled_by = request.user
        receipt.cancellation_reason = request.data.get('reason', '')
        receipt.save()

        return Response(
            ReceiptSerializer(receipt).data,
            status=status.HTTP_200_OK
        )


class SalesReportViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Sales Reports
    """
    queryset = SalesReport.objects.all()
    serializer_class = SalesReportSerializer
    permission_classes = [IsAuthenticated, CanManageFinance]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['report_type', 'campus']
    search_fields = ['report_date']
    ordering_fields = ['report_date', 'total_revenue']

    def get_queryset(self):
        user = self.request.user
        queryset = SalesReport.objects.filter(is_deleted=False)

        # Filter by role
        if user.role in ['SUPER_ADMIN', 'CHANCELLOR', 'FINANCE_SECRETARIAT']:
            return queryset
        elif user.role in ['ADMIN', 'FINANCE', 'BUSINESS_CENTER']:
            return queryset
        elif user.role in ['CAMPUS_ADMIN', 'FINANCE_STAFF', 'CAMPUS_BUSINESS_CENTER']:
            return queryset.filter(campus=user.campus)
        else:
            return queryset.none()

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate a new sales report"""
        report_type = request.data.get('report_type')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        campus_id = request.data.get('campus')

        if not all([report_type, start_date, end_date]):
            return Response(
                {'error': 'report_type, start_date, and end_date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get campus if specified
        campus = None
        if campus_id:
            from apps.campuses.models import Campus
            try:
                campus = Campus.objects.get(id=campus_id)
            except Campus.DoesNotExist:
                return Response(
                    {'error': 'Invalid campus ID'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Generate report
        report = generate_sales_report(report_type, start_date, end_date, campus)
        report.generated_by = request.user
        report.save()

        return Response(
            SalesReportSerializer(report).data,
            status=status.HTTP_201_CREATED
        )


class PinVerificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing Pin Verification logs
    """
    queryset = PinVerification.objects.all()
    serializer_class = PinVerificationSerializer
    permission_classes = [IsAuthenticated, IsBusinessCenter]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['was_successful', 'pin__batch__pin_type']
    search_fields = ['verified_by_email', 'verified_by_phone', 'verification_ip']
    ordering_fields = ['created_at']

    def get_queryset(self):
        user = self.request.user
        queryset = PinVerification.objects.filter(is_deleted=False)

        # Only business center and admins can view verification logs
        if user.role in ['SUPER_ADMIN', 'BUSINESS_CENTER']:
            return queryset
        elif user.role in ['ADMIN', 'CAMPUS_BUSINESS_CENTER']:
            return queryset.filter(pin__batch__campus=user.campus)
        else:
            return queryset.none()
