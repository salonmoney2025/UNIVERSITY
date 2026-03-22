from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import User
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserLoginSerializer,
    ChangePasswordSerializer,
    ResetPasswordSerializer
)
from .permissions import IsSuperAdmin, IsAdmin, IsOwnerOrAdmin


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing users (CRUD operations)
    """
    queryset = User.objects.filter(is_deleted=False)
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'campus', 'is_active', 'gender']
    search_fields = ['email', 'first_name', 'last_name', 'phone']
    ordering_fields = ['created_at', 'email', 'first_name', 'last_name', 'date_joined']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Customize permissions based on action
        """
        if self.action in ['update', 'partial_update']:
            permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
        elif self.action == 'destroy':
            permission_classes = [IsAuthenticated, IsSuperAdmin]
        else:
            permission_classes = [IsAuthenticated, IsAdmin]
        return [permission() for permission in permission_classes]

    def destroy(self, request, *args, **kwargs):
        """
        Soft delete user instead of hard delete
        """
        instance = self.get_object()
        instance.soft_delete()
        return Response(
            {'message': 'User deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsSuperAdmin])
    def restore(self, request, pk=None):
        """
        Restore a soft-deleted user
        """
        user = self.get_object()
        user.restore()
        return Response(
            {'message': 'User restored successfully'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def deactivate(self, request, pk=None):
        """
        Deactivate a user account
        """
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response(
            {'message': 'User deactivated successfully'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def activate(self, request, pk=None):
        """
        Activate a user account
        """
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response(
            {'message': 'User activated successfully'},
            status=status.HTTP_200_OK
        )


class RegisterAPIView(generics.CreateAPIView):
    """
    API View for user registration
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)


class LoginAPIView(generics.GenericAPIView):
    """
    API View for user login with JWT
    """
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        # Update last login
        from django.utils import timezone
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])

        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)


class LogoutAPIView(generics.GenericAPIView):
    """
    API View for user logout (blacklist refresh token)
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response(
                    {'message': 'Logout successful'},
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {'error': 'Refresh token is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class ChangePasswordAPIView(generics.GenericAPIView):
    """
    API View for changing user password
    """
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {'message': 'Password changed successfully'},
            status=status.HTTP_200_OK
        )


class ResetPasswordAPIView(generics.GenericAPIView):
    """
    API View for resetting user password (admin functionality)
    """
    serializer_class = ResetPasswordSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {'message': 'Password reset successfully'},
            status=status.HTTP_200_OK
        )


class CurrentUserAPIView(generics.RetrieveUpdateAPIView):
    """
    API View for getting and updating current user details
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        """
        Allow users to update their own profile
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # Prevent users from changing their own role
        if 'role' in request.data and not request.user.is_admin_user:
            return Response(
                {'error': 'You cannot change your own role'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)
