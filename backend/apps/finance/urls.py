from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    FeeStructureViewSet, StudentFeeViewSet, PaymentViewSet,
    ScholarshipViewSet, StudentScholarshipViewSet
)

app_name = 'finance'

router = DefaultRouter()
router.register(r'fee-structures', FeeStructureViewSet, basename='fee_structure')
router.register(r'student-fees', StudentFeeViewSet, basename='student_fee')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'scholarships', ScholarshipViewSet, basename='scholarship')
router.register(r'student-scholarships', StudentScholarshipViewSet, basename='student_scholarship')

urlpatterns = [
    path('', include(router.urls)),
]
