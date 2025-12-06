"""
URL configuration for blog project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('blogapp.api_urls')),
    path('api/auth/', include('accounts.api_urls')),
    path('api-auth/', include('rest_framework.urls')),  # Для browsable API
    path('accounts/', include('accounts.urls')),
    path('', include('blogapp.urls')),
]

