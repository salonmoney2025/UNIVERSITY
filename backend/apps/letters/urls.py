"""
Letters Management URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LetterTemplateViewSet, GeneratedLetterViewSet, LetterSignatureViewSet

app_name = 'letters'

router = DefaultRouter()
router.register(r'templates', LetterTemplateViewSet, basename='template')
router.register(r'generated', GeneratedLetterViewSet, basename='generated')
router.register(r'signatures', LetterSignatureViewSet, basename='signature')

urlpatterns = [
    path('', include(router.urls)),
]
