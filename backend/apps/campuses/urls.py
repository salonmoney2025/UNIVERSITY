from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import CampusViewSet, DepartmentViewSet, FacultyViewSet

app_name = 'campuses'

router = DefaultRouter()
router.register(r'campuses', CampusViewSet, basename='campus')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'faculties', FacultyViewSet, basename='faculty')

urlpatterns = [
    path('', include(router.urls)),
]
