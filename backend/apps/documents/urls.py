"""
Document URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DocumentViewSet, DocumentCategoryViewSet, DocumentTagViewSet,
    DocumentCommentViewSet
)

app_name = 'documents'

router = DefaultRouter()
router.register(r'categories', DocumentCategoryViewSet, basename='category')
router.register(r'tags', DocumentTagViewSet, basename='tag')
router.register(r'', DocumentViewSet, basename='document')
router.register(r'comments', DocumentCommentViewSet, basename='comment')

urlpatterns = [
    path('', include(router.urls)),
]
