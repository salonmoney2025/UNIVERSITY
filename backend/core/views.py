from django.http import JsonResponse
from django.views.decorators.http import require_http_methods


@require_http_methods(["GET"])
def api_root(request):
    """
    Welcome page for the University LMS API
    """
    return JsonResponse({
        'message': 'Welcome to EBKUST University Management System API',
        'version': '1.0.0',
        'status': 'operational',
        'documentation': {
            'swagger': request.build_absolute_uri('/api/docs/'),
            'redoc': request.build_absolute_uri('/api/redoc/'),
            'schema': request.build_absolute_uri('/api/schema/'),
        },
        'endpoints': {
            'authentication': '/api/v1/auth/',
            'campuses': '/api/v1/campuses/',
            'students': '/api/v1/students/',
            'staff': '/api/v1/staff/',
            'courses': '/api/v1/courses/',
            'exams': '/api/v1/exams/',
            'finance': '/api/v1/finance/',
            'communications': '/api/v1/communications/',
            'analytics': '/api/v1/analytics/',
            'admin_panel': '/admin/',
        },
        'quick_links': {
            'login': request.build_absolute_uri('/api/v1/auth/login/'),
            'register': request.build_absolute_uri('/api/v1/auth/register/'),
            'api_docs': request.build_absolute_uri('/api/docs/'),
        },
        'frontend_url': 'http://localhost:3000',
    })
