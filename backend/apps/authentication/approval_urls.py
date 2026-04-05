"""
URL routing for Approval Workflow System
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .approval_views import (
    ApprovalChainViewSet,
    ApprovalLevelViewSet,
    ApprovalRequestViewSet,
    ApprovalActionViewSet,
    ApprovalCommentViewSet,
    ApprovalTemplateViewSet
)

router = DefaultRouter()
router.register(r'chains', ApprovalChainViewSet, basename='approval-chain')
router.register(r'levels', ApprovalLevelViewSet, basename='approval-level')
router.register(r'requests', ApprovalRequestViewSet, basename='approval-request')
router.register(r'actions', ApprovalActionViewSet, basename='approval-action')
router.register(r'comments', ApprovalCommentViewSet, basename='approval-comment')
router.register(r'templates', ApprovalTemplateViewSet, basename='approval-template')

urlpatterns = [
    path('', include(router.urls)),
]
