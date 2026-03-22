"""
Request logging middleware for University LMS.
"""
import logging
import time
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Middleware to log all incoming requests and their processing time.
    """

    def process_request(self, request):
        """Store start time of request processing."""
        request.start_time = time.time()
        return None

    def process_response(self, request, response):
        """Log request details and processing time."""
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            logger.info(
                f"{request.method} {request.path} - "
                f"Status: {response.status_code} - "
                f"Duration: {duration:.2f}s - "
                f"User: {request.user if request.user.is_authenticated else 'Anonymous'}"
            )
        return response
