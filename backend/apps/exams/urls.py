from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ExamViewSet, GradeViewSet, TranscriptViewSet

app_name = 'exams'

router = DefaultRouter()
router.register(r'exams', ExamViewSet, basename='exam')
router.register(r'grades', GradeViewSet, basename='grade')
router.register(r'transcripts', TranscriptViewSet, basename='transcript')

urlpatterns = [
    path('', include(router.urls)),
]
