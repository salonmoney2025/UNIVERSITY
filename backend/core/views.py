from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.db import connection
from django.core.cache import cache
import time


@require_http_methods(["GET"])
def health_check(request):
    """
    Health check endpoint for Docker health monitoring
    Checks database and cache connectivity
    """
    status = {
        'status': 'healthy',
        'timestamp': time.time(),
        'checks': {}
    }

    # Check database connectivity
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        status['checks']['database'] = 'ok'
    except Exception as e:
        status['checks']['database'] = f'error: {str(e)}'
        status['status'] = 'unhealthy'

    # Check cache connectivity
    try:
        cache.set('health_check', 'ok', 10)
        cache_value = cache.get('health_check')
        status['checks']['cache'] = 'ok' if cache_value == 'ok' else 'error'
    except Exception as e:
        status['checks']['cache'] = f'error: {str(e)}'
        status['status'] = 'unhealthy'

    response_status = 200 if status['status'] == 'healthy' else 503
    return JsonResponse(status, status=response_status)


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
