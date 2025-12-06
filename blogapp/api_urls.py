from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import (
    ArticleViewSet, CategoryViewSet,
    TagViewSet, CommentViewSet
)

# DefaultRouter автоматично створює API root view на '/'
router = DefaultRouter()
router.register(r'articles', ArticleViewSet, basename='article')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'comments', CommentViewSet, basename='comment')

urlpatterns = [
    path('', include(router.urls)),
]

