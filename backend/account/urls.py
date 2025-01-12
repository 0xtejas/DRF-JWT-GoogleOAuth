from django.contrib import admin
from django.urls import path, include
from .views import *

urlpatterns = [
    path('google/login/', GoogleLoginView.as_view(), name='google-login'),
    path('google/callback/', GoogleCallbackView.as_view(), name='google-callback'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token-refresh'),
    path('admin/redirect/', AdminRedirectView.as_view(), name='admin-redirect'),
    path('admin/auto-login/', AdminAutoLoginView.as_view(), name='admin-auto-login'),
    path('verify-token/', VerifyTokenView.as_view(), name='verify-token'),
]
