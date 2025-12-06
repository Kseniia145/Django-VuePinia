from django.urls import path
from .api_views import (
    register_view, login_view, logout_view, current_user_view
)

urlpatterns = [
    path('register/', register_view, name='api-register'),
    path('login/', login_view, name='api-login'),
    path('logout/', logout_view, name='api-logout'),
    path('current-user/', current_user_view, name='api-current-user'),
]

