"""
Custom exception handlers for University LMS.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that formats error responses consistently.

    Args:
        exc: The exception raised
        context: Context information about the exception

    Returns:
        Response object with formatted error message
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        # Customize the response data
        custom_response_data = {
            'success': False,
            'error': {
                'code': getattr(exc, 'default_code', 'error'),
                'message': str(exc.detail) if hasattr(exc, 'detail') else str(exc),
                'status_code': response.status_code,
            }
        }

        # Add field-specific errors if available
        if isinstance(response.data, dict):
            if 'detail' not in response.data:
                custom_response_data['error']['fields'] = response.data

        response.data = custom_response_data

        # Log the error
        logger.error(
            f"API Error: {custom_response_data['error']['message']} "
            f"[{custom_response_data['error']['code']}] "
            f"- Status: {response.status_code}"
        )
    else:
        # Handle unexpected errors
        logger.exception(f"Unhandled exception: {str(exc)}")
        response = Response(
            {
                'success': False,
                'error': {
                    'code': 'internal_server_error',
                    'message': 'An unexpected error occurred. Please try again later.',
                    'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR,
                }
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return response
