from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import StaffMemberViewSet, StaffAttendanceViewSet

app_name = 'staff'

router = DefaultRouter()
router.register(r'staff-members', StaffMemberViewSet, basename='staff_member')
router.register(r'staff-attendance', StaffAttendanceViewSet, basename='staff_attendance')

urlpatterns = [
    path('', include(router.urls)),
]
