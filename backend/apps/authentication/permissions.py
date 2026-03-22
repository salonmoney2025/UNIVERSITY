from rest_framework import permissions
from functools import wraps
from django.http import JsonResponse


# Role groups for easy permission checking
ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'CAMPUS_ADMIN', 'CHANCELLOR']
REGISTRY_ROLES = ['REGISTRY_ADMIN', 'REGISTRY', 'REGISTRY_ADMISSION', 'REGISTRY_HR', 'REGISTRY_ACADEMIC']
FINANCE_ROLES = ['FINANCE', 'FINANCE_STAFF', 'FINANCE_SECRETARIAT', 'FINANCE_SECRETARIAT_STAFF', 'ACCOUNTANT']
ACADEMIC_ROLES = ['DEAN', 'HEAD_OF_DEPARTMENT', 'LECTURER', 'PART_TIME_LECTURER', 'FACULTY_ADMIN', 'FACULTY_EXAM']
BUSINESS_ROLES = ['BUSINESS_CENTER', 'CAMPUS_BUSINESS_CENTER']
STUDENT_SERVICE_ROLES = ['STUDENT_SECTION', 'STUDENT_SECTION_STAFF', 'STUDENT_WARDEN']
SUPPORT_ROLES = ['LIBRARY', 'ID_CARD_PRINTING', 'HELP_DESK', 'HUMAN_RESOURCES']
SPECIALIZED_ROLES = ['ELEARNING_ADMIN', 'SPS_ADMIN', 'SPS_STAFF', 'EXTRAMURAL_STUDIES']


class IsSuperAdmin(permissions.BasePermission):
    """
    Custom permission to only allow super admins access
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'SUPER_ADMIN'
        )


class IsAdmin(permissions.BasePermission):
    """
    Custom permission to only allow admins access (SUPER_ADMIN, ADMIN, CAMPUS_ADMIN)
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ['SUPER_ADMIN', 'ADMIN', 'CAMPUS_ADMIN']
        )


class IsLecturer(permissions.BasePermission):
    """
    Custom permission to only allow lecturers access
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'LECTURER'
        )


class IsStudent(permissions.BasePermission):
    """
    Custom permission to only allow students access
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'STUDENT'
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admins to edit/view it
    """
    def has_object_permission(self, request, view, obj):
        # Admin users have full access
        if request.user.role in ['SUPER_ADMIN', 'ADMIN', 'CAMPUS_ADMIN']:
            return True

        # Check if the object has a 'user' attribute and if it matches the request user
        if hasattr(obj, 'user'):
            return obj.user == request.user

        # If object is the user itself
        if obj == request.user:
            return True

        return False


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow read-only access to everyone but write access only to admins
    """
    def has_permission(self, request, view):
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated

        # Write permissions are only allowed to admins
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ['SUPER_ADMIN', 'ADMIN', 'CAMPUS_ADMIN']
        )


class IsSameCampusOrAdmin(permissions.BasePermission):
    """
    Permission to only allow users from the same campus or admins to access
    """
    def has_object_permission(self, request, view, obj):
        # Admin users have full access
        if request.user.role in ['SUPER_ADMIN', 'ADMIN']:
            return True

        # Campus admins can only access objects from their campus
        if request.user.role == 'CAMPUS_ADMIN':
            if hasattr(obj, 'campus'):
                return obj.campus == request.user.campus

        # Check if object belongs to the same campus
        if hasattr(obj, 'campus') and request.user.campus:
            return obj.campus == request.user.campus

        return False


# ==================== NEW COMPREHENSIVE PERMISSIONS ====================

class IsAdminRole(permissions.BasePermission):
    """Any admin-level role"""
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ADMIN_ROLES
        )


class IsRegistryRole(permissions.BasePermission):
    """Any registry role"""
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.role in REGISTRY_ROLES or request.user.role in ADMIN_ROLES)
        )


class IsFinanceRole(permissions.BasePermission):
    """Any finance role"""
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.role in FINANCE_ROLES or request.user.role in ADMIN_ROLES)
        )


class IsAcademicStaff(permissions.BasePermission):
    """Any academic staff role"""
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.role in ACADEMIC_ROLES or request.user.role in ADMIN_ROLES)
        )


class IsBusinessCenter(permissions.BasePermission):
    """Business center roles"""
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.role in BUSINESS_ROLES or request.user.role in ADMIN_ROLES)
        )


class IsStudentServices(permissions.BasePermission):
    """Student services roles"""
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.role in STUDENT_SERVICE_ROLES or request.user.role in ADMIN_ROLES)
        )


class CanManageStudents(permissions.BasePermission):
    """Roles that can manage student records"""
    def has_permission(self, request, view):
        allowed_roles = ADMIN_ROLES + REGISTRY_ROLES + STUDENT_SERVICE_ROLES + [
            'DEAN', 'HEAD_OF_DEPARTMENT'
        ]
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in allowed_roles
        )


class CanManageExams(permissions.BasePermission):
    """Roles that can manage examinations"""
    def has_permission(self, request, view):
        allowed_roles = ADMIN_ROLES + [
            'EXAMS', 'FACULTY_EXAM', 'DEAN', 'HEAD_OF_DEPARTMENT', 'REGISTRY_ACADEMIC'
        ]
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in allowed_roles
        )


class CanManageFinance(permissions.BasePermission):
    """Roles that can manage financial operations"""
    def has_permission(self, request, view):
        allowed_roles = ADMIN_ROLES + FINANCE_ROLES + BUSINESS_ROLES
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in allowed_roles
        )


class CanViewFinancialReports(permissions.BasePermission):
    """Roles that can view financial reports"""
    def has_permission(self, request, view):
        allowed_roles = [
            'SUPER_ADMIN', 'ADMIN', 'CHANCELLOR', 'FINANCE',
            'FINANCE_SECRETARIAT', 'ACCOUNTANT', 'BUSINESS_CENTER'
        ]
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in allowed_roles
        )


class CanGenerateLetters(permissions.BasePermission):
    """Roles that can generate official letters"""
    def has_permission(self, request, view):
        allowed_roles = ADMIN_ROLES + REGISTRY_ROLES + ['DEAN']
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in allowed_roles
        )


class CanSignLetters(permissions.BasePermission):
    """Roles that can sign official letters"""
    def has_permission(self, request, view):
        allowed_roles = [
            'SUPER_ADMIN', 'ADMIN', 'CHANCELLOR', 'DEAN',
            'HEAD_OF_DEPARTMENT', 'REGISTRY_ADMIN'
        ]
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in allowed_roles
        )


class CanManagePins(permissions.BasePermission):
    """Roles that can manage application pins"""
    def has_permission(self, request, view):
        allowed_roles = ADMIN_ROLES + BUSINESS_ROLES + FINANCE_ROLES[:2]
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in allowed_roles
        )


class CanEnterGrades(permissions.BasePermission):
    """Roles that can enter student grades"""
    def has_permission(self, request, view):
        allowed_roles = ['LECTURER', 'PART_TIME_LECTURER', 'DEAN', 'HEAD_OF_DEPARTMENT']
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in allowed_roles
        )


class CanApproveGrades(permissions.BasePermission):
    """Roles that can approve student grades"""
    def has_permission(self, request, view):
        allowed_roles = [
            'SUPER_ADMIN', 'ADMIN', 'DEAN', 'HEAD_OF_DEPARTMENT', 'REGISTRY_ACADEMIC'
        ]
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in allowed_roles
        )


# ==================== DECORATOR-BASED PERMISSIONS ====================

def require_roles(allowed_roles):
    """
    Decorator to require specific roles for view access
    Usage: @require_roles(['SUPER_ADMIN', 'ADMIN'])
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return JsonResponse({'error': 'Authentication required'}, status=401)

            if request.user.role not in allowed_roles:
                return JsonResponse({
                    'error': 'Insufficient permissions',
                    'required_roles': allowed_roles,
                    'your_role': request.user.role
                }, status=403)

            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def campus_required(view_func):
    """
    Decorator to ensure user has campus assigned
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.campus and request.user.role != 'SUPER_ADMIN':
            return JsonResponse({'error': 'Campus assignment required'}, status=403)
        return view_func(request, *args, **kwargs)
    return wrapper


def same_campus_or_admin(view_func):
    """
    Decorator to ensure user is from same campus or is admin
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if request.user.role in ADMIN_ROLES:
            return view_func(request, *args, **kwargs)

        # Get campus from request object/params
        obj_campus = kwargs.get('campus') or request.GET.get('campus')
        if obj_campus and str(request.user.campus.id) != str(obj_campus):
            return JsonResponse({'error': 'Access denied to different campus'}, status=403)

        return view_func(request, *args, **kwargs)
    return wrapper


# ==================== UTILITY FUNCTIONS ====================

def has_role(user, roles):
    """
    Check if user has one of the specified roles
    """
    if not isinstance(roles, list):
        roles = [roles]
    return user.is_authenticated and user.role in roles


def can_manage_user(requesting_user, target_user):
    """
    Check if requesting user can manage target user
    """
    # Super admin can manage anyone
    if requesting_user.role == 'SUPER_ADMIN':
        return True

    # Admin can manage non-super-admin users in their campus
    if requesting_user.role == 'ADMIN':
        if target_user.role != 'SUPER_ADMIN':
            if requesting_user.campus == target_user.campus:
                return True

    # Campus admin can manage campus users (limited roles)
    if requesting_user.role == 'CAMPUS_ADMIN':
        limited_roles = ['STUDENT', 'PARENT', 'LECTURER', 'PART_TIME_LECTURER']
        if target_user.role in limited_roles and requesting_user.campus == target_user.campus:
            return True

    return False


def get_accessible_campuses(user):
    """
    Get list of campuses user can access
    """
    from apps.campuses.models import Campus

    if user.role in ['SUPER_ADMIN', 'CHANCELLOR', 'FINANCE_SECRETARIAT', 'ELEARNING_ADMIN', 'SPS_ADMIN']:
        # System-wide roles can access all campuses
        return Campus.objects.all()

    if user.campus:
        # Campus-specific roles can only access their campus
        return Campus.objects.filter(id=user.campus.id)

    return Campus.objects.none()


def can_access_module(user, module_name):
    """
    Check if user can access a specific module
    """
    module_permissions = {
        'students': ADMIN_ROLES + REGISTRY_ROLES + ACADEMIC_ROLES + STUDENT_SERVICE_ROLES,
        'finance': ADMIN_ROLES + FINANCE_ROLES + BUSINESS_ROLES,
        'exams': ADMIN_ROLES + ACADEMIC_ROLES + REGISTRY_ROLES + ['EXAMS'],
        'letters': ADMIN_ROLES + REGISTRY_ROLES + ['DEAN'],
        'business_center': ADMIN_ROLES + BUSINESS_ROLES + FINANCE_ROLES,
        'hr': ADMIN_ROLES + ['HUMAN_RESOURCES', 'REGISTRY_HR'],
        'library': ADMIN_ROLES + ['LIBRARY'],
        'help_desk': ADMIN_ROLES + ['HELP_DESK'],
        'elearning': ADMIN_ROLES + ['ELEARNING_ADMIN'] + ACADEMIC_ROLES,
        'sps': ADMIN_ROLES + SPECIALIZED_ROLES,
    }

    allowed_roles = module_permissions.get(module_name, ADMIN_ROLES)
    return user.role in allowed_roles
