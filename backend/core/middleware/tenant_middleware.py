"""
Multi-campus/tenant middleware for University LMS.
"""
from django.utils.deprecation import MiddlewareMixin
from apps.campuses.models import Campus


class TenantMiddleware(MiddlewareMixin):
    """
    Middleware to set the current campus/tenant based on request.
    """

    def process_request(self, request):
        """
        Set the current campus based on subdomain or header.

        Priority:
        1. X-Campus-ID header
        2. campus_id query parameter
        3. Default campus
        """
        campus_id = None

        # Check for campus ID in header
        if 'HTTP_X_CAMPUS_ID' in request.META:
            campus_id = request.META['HTTP_X_CAMPUS_ID']

        # Check for campus ID in query params
        elif 'campus_id' in request.GET:
            campus_id = request.GET.get('campus_id')

        # Set campus on request
        if campus_id:
            try:
                request.campus = Campus.objects.get(id=campus_id, is_active=True)
            except Campus.DoesNotExist:
                request.campus = None
        else:
            request.campus = None

        return None
