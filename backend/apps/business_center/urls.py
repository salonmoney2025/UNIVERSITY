"""
Business Center URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PinBatchViewSet, ApplicationPinViewSet,
    ReceiptViewSet, SalesReportViewSet,
    PinVerificationViewSet
)

app_name = 'business_center'

router = DefaultRouter()
router.register(r'pin-batches', PinBatchViewSet, basename='pin-batch')
router.register(r'pins', ApplicationPinViewSet, basename='pin')
router.register(r'receipts', ReceiptViewSet, basename='receipt')
router.register(r'sales-reports', SalesReportViewSet, basename='sales-report')
router.register(r'verifications', PinVerificationViewSet, basename='verification')

urlpatterns = [
    path('', include(router.urls)),
]
