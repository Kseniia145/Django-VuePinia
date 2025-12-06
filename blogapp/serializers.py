from rest_framework import serializers
from .models import Article, Category, Tag, Comment
from django.contrib.auth.models import User


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'title']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'title', 'description', 'icon']


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    user_id = serializers.IntegerField(source='user.id', read_only=True, allow_null=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'text', 'author', 'author_name', 'publication_date', 'article', 'user_id']
        read_only_fields = ['publication_date', 'article', 'user_id']
    
    def get_author_name(self, obj):
        return obj.get_author_name()


class ArticleSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        source='tag',
        many=True,
        write_only=True,
        required=False
    )
    author_name = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'author', 'author_name', 'text', 'image',
            'publication_date', 'is_published', 'category', 'category_id',
            'tags', 'tag_ids', 'comments_count'
        ]
        read_only_fields = ['publication_date']
    
    def get_author_name(self, obj):
        return obj.get_author_name()
    
    def get_comments_count(self, obj):
        return obj.comment_set.count()


class ArticleListSerializer(serializers.ModelSerializer):
    """Спрощений серіалізатор для списку статей"""
    category = CategorySerializer(read_only=True)
    author_name = serializers.SerializerMethodField()
    tags = TagSerializer(many=True, read_only=True)
    
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'author_name', 'image',
            'publication_date', 'category', 'tags'
        ]
    
    def get_author_name(self, obj):
        return obj.get_author_name()

