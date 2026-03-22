from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ProgramViewSet, CourseViewSet, CourseOfferingViewSet

app_name = 'courses'

router = DefaultRouter()
router.register(r'programs', ProgramViewSet, basename='program')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'course-offerings', CourseOfferingViewSet, basename='course_offering')

urlpatterns = [
    path('', include(router.urls)),
]
