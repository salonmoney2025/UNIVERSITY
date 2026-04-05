"""
API Views for Two-Factor Authentication
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta

from .twofa_models import TwoFactorAuth, TwoFactorVerification, TrustedDevice
from .twofa_serializers import (
    TwoFactorAuthSerializer, TwoFactorSetupSerializer,
    TwoFactorVerifySerializer, TwoFactorBackupCodeSerializer,
    TwoFactorVerificationSerializer, TrustedDeviceSerializer
)


class TwoFactorAuthViewSet(viewsets.ViewSet):
    """
    ViewSet for managing Two-Factor Authentication
    """
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def status(self, request):
        """Get 2FA status for current user"""
        try:
            twofa = TwoFactorAuth.objects.get(user=request.user)
            serializer = TwoFactorAuthSerializer(twofa)
            return Response(serializer.data)
        except TwoFactorAuth.DoesNotExist:
            return Response({
                'is_enabled': False,
                'message': '2FA is not set up'
            })

    @action(detail=False, methods=['post'])
    def setup(self, request):
        """Initialize 2FA setup for user"""
        # Check if already set up
        if hasattr(request.user, 'two_factor_auth'):
            if request.user.two_factor_auth.is_enabled:
                return Response(
                    {'error': '2FA is already enabled'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Delete existing setup if not enabled
            request.user.two_factor_auth.delete()

        # Create new 2FA setup
        twofa = TwoFactorAuth.create_for_user(request.user)

        response_data = {
            'secret_key': twofa.secret_key,
            'qr_code': twofa.get_qr_code(),
            'provisioning_uri': twofa.get_provisioning_uri(),
            'backup_codes': twofa.backup_codes,
            'message': 'Scan the QR code with your authenticator app'
        }

        serializer = TwoFactorSetupSerializer(response_data)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def verify_and_enable(self, request):
        """Verify setup code and enable 2FA"""
        try:
            twofa = TwoFactorAuth.objects.get(user=request.user)
        except TwoFactorAuth.DoesNotExist:
            return Response(
                {'error': '2FA setup not found. Please run setup first.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if twofa.is_enabled:
            return Response(
                {'error': '2FA is already enabled'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify code
        serializer = TwoFactorVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        code = serializer.validated_data['code']

        if twofa.verify_token(code):
            # Enable 2FA
            twofa.enable()

            # Log verification
            self._log_verification(
                request.user,
                success=True,
                method='TOTP',
                request_obj=request
            )

            return Response({
                'message': '2FA enabled successfully',
                'is_enabled': True
            })
        else:
            # Log failed verification
            self._log_verification(
                request.user,
                success=False,
                method='TOTP',
                request_obj=request,
                failure_reason='INVALID_CODE'
            )

            return Response(
                {'error': 'Invalid verification code'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def verify(self, request):
        """Verify 2FA code during login"""
        try:
            twofa = TwoFactorAuth.objects.get(user=request.user, is_enabled=True)
        except TwoFactorAuth.DoesNotExist:
            return Response(
                {'error': '2FA is not enabled'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = TwoFactorVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        code = serializer.validated_data['code']

        if twofa.verify_token(code):
            twofa.last_verified_at = timezone.now()
            twofa.save(update_fields=['last_verified_at', 'updated_at'])

            # Log successful verification
            self._log_verification(
                request.user,
                success=True,
                method='TOTP',
                request_obj=request
            )

            return Response({
                'verified': True,
                'message': '2FA verification successful'
            })
        else:
            # Log failed verification
            self._log_verification(
                request.user,
                success=False,
                method='TOTP',
                request_obj=request,
                failure_reason='INVALID_CODE'
            )

            return Response(
                {'error': 'Invalid verification code'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def verify_backup_code(self, request):
        """Verify using backup code"""
        try:
            twofa = TwoFactorAuth.objects.get(user=request.user, is_enabled=True)
        except TwoFactorAuth.DoesNotExist:
            return Response(
                {'error': '2FA is not enabled'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = TwoFactorBackupCodeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        backup_code = serializer.validated_data['backup_code']

        if twofa.use_backup_code(backup_code):
            twofa.last_verified_at = timezone.now()
            twofa.save(update_fields=['last_verified_at', 'updated_at'])

            # Log successful verification
            self._log_verification(
                request.user,
                success=True,
                method='BACKUP',
                request_obj=request
            )

            return Response({
                'verified': True,
                'message': 'Backup code verified successfully',
                'remaining_codes': len(twofa.backup_codes)
            })
        else:
            # Log failed verification
            self._log_verification(
                request.user,
                success=False,
                method='BACKUP',
                request_obj=request,
                failure_reason='INVALID_CODE'
            )

            return Response(
                {'error': 'Invalid backup code'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def disable(self, request):
        """Disable 2FA for current user"""
        try:
            twofa = TwoFactorAuth.objects.get(user=request.user)
        except TwoFactorAuth.DoesNotExist:
            return Response(
                {'error': '2FA is not enabled'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify current password or 2FA code for security
        serializer = TwoFactorVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        code = serializer.validated_data['code']

        if twofa.verify_token(code):
            twofa.disable()
            return Response({
                'message': '2FA disabled successfully',
                'is_enabled': False
            })
        else:
            return Response(
                {'error': 'Invalid verification code'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def regenerate_backup_codes(self, request):
        """Regenerate backup codes"""
        try:
            twofa = TwoFactorAuth.objects.get(user=request.user, is_enabled=True)
        except TwoFactorAuth.DoesNotExist:
            return Response(
                {'error': '2FA is not enabled'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify 2FA code for security
        serializer = TwoFactorVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        code = serializer.validated_data['code']

        if twofa.verify_token(code):
            new_codes = twofa.regenerate_backup_codes()
            return Response({
                'message': 'Backup codes regenerated successfully',
                'backup_codes': new_codes
            })
        else:
            return Response(
                {'error': 'Invalid verification code'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def verification_history(self, request):
        """Get 2FA verification history"""
        verifications = TwoFactorVerification.objects.filter(
            user=request.user
        ).order_by('-created_at')[:20]

        serializer = TwoFactorVerificationSerializer(verifications, many=True)
        return Response(serializer.data)

    def _log_verification(self, user, success, method, request_obj, failure_reason=None):
        """Log 2FA verification attempt"""
        ip_address = self._get_client_ip(request_obj)
        user_agent = request_obj.META.get('HTTP_USER_AGENT', '')

        TwoFactorVerification.objects.create(
            user=user,
            success=success,
            method=method,
            ip_address=ip_address,
            user_agent=user_agent,
            failure_reason=failure_reason
        )

    def _get_client_ip(self, request):
        """Extract client IP from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class TrustedDeviceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing trusted devices
    """
    serializer_class = TrustedDeviceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TrustedDevice.objects.filter(
            user=self.request.user,
            is_active=True
        ).order_by('-last_used_at')

    @action(detail=True, methods=['post'])
    def revoke(self, request, pk=None):
        """Revoke trust from a device"""
        device = self.get_object()
        device.revoke()

        return Response({
            'message': 'Device trust revoked',
            'device_id': str(device.id)
        })

    @action(detail=False, methods=['post'])
    def revoke_all(self, request):
        """Revoke trust from all devices"""
        count = TrustedDevice.objects.filter(
            user=request.user,
            is_active=True
        ).update(is_active=False)

        return Response({
            'message': f'Revoked trust from {count} devices',
            'count': count
        })

    @action(detail=False, methods=['post'])
    def trust_current_device(self, request):
        """Mark current device as trusted"""
        # Get device fingerprint from request
        fingerprint = request.data.get('device_fingerprint')
        device_name = request.data.get('device_name', 'Unknown Device')

        if not fingerprint:
            return Response(
                {'error': 'Device fingerprint required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create or update trusted device
        device, created = TrustedDevice.objects.update_or_create(
            user=request.user,
            device_fingerprint=fingerprint,
            defaults={
                'device_name': device_name,
                'ip_address': self._get_client_ip(request),
                'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                'is_active': True,
                'expires_at': timezone.now() + timedelta(days=30)
            }
        )

        serializer = self.get_serializer(device)
        return Response({
            'message': 'Device marked as trusted for 30 days',
            'device': serializer.data
        })

    def _get_client_ip(self, request):
        """Extract client IP from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
