from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404
from datetime import date
from .models import Article, Category, Tag, Comment
from .serializers import (
    ArticleSerializer, ArticleListSerializer,
    CategorySerializer, TagSerializer, CommentSerializer
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet для перегляду категорій (тільки читання)
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet для перегляду тегів (тільки читання)
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [AllowAny]


@method_decorator(csrf_exempt, name='dispatch')
class ArticleViewSet(viewsets.ModelViewSet):
    """
    ViewSet для статей з підтримкою CRUD операцій
    """
    queryset = Article.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ArticleListSerializer
        return ArticleSerializer
    
    def get_queryset(self):
        queryset = Article.objects.all()
        # Фільтрація за категорією
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        # Фільтрація за тегом
        tag_id = self.request.query_params.get('tag', None)
        if tag_id:
            queryset = queryset.filter(tag__id=tag_id).distinct()
        # Фільтрація опублікованих статей
        published = self.request.query_params.get('published', None)
        if published == 'true':
            queryset = queryset.filter(is_published=True)
        elif published == 'false':
            queryset = queryset.filter(is_published=False)
        return queryset.order_by('-publication_date')
    
    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        """Отримати коментарі для статті"""
        article = self.get_object()
        comments = Comment.objects.filter(article=article).order_by('-publication_date')
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def add_comment(self, request, pk=None):
        """Додати коментар до статті"""
        article = self.get_object()
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            comment = serializer.save(
                article=article,
                publication_date=date.today(),
                user=request.user if request.user.is_authenticated else None
            )
            return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class CommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet для коментарів
    """
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Comment.objects.all()
        # Фільтрація за статтею
        article_id = self.request.query_params.get('article', None)
        if article_id:
            queryset = queryset.filter(article_id=article_id)
        return queryset.order_by('-publication_date')
    
    def perform_update(self, serializer):
        # Перевіряємо, чи користувач може редагувати коментар
        comment = self.get_object()
        if not self.request.user.is_authenticated:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Потрібна авторизація для редагування коментаря')
        if comment.user != self.request.user and not self.request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Ви не можете редагувати цей коментар')
        serializer.save()
    
    def perform_destroy(self, instance):
        # Перевіряємо, чи користувач може видаляти коментар
        if not self.request.user.is_authenticated:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Потрібна авторизація для видалення коментаря')
        if instance.user != self.request.user and not self.request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Ви не можете видаляти цей коментар')
        instance.delete()

