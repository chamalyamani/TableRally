from django.urls import path
from authentication.views import *
from django.conf import settings
from django.conf.urls.static import static
from CRUDOps.views import *
from django.shortcuts import render
import requests
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('<str:username>/profile/', user_profile_view, name='user_profile'),
    path('get-csrf-token/', get_csrf_token, name='get_csrf_token'),
    path('profile/', get_profile, name='user_profile'),
    path('delete-account/', delete_account_view, name='delete-account'),
    path('update-profile/', update_profile, name='update-account'),
    path('password_reset/', auth_views.PasswordResetView.as_view(
        template_name='password_reset/password_reset_form.html',  # Your frontend form template
        email_template_name='password_reset/password_reset_email.txt',  # Plain text email template
        subject_template_name='password_reset/password_reset_subject.txt',  # Email subject
    ), name='password_reset'),
    path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(template_name='password_reset/password_reset_done.html'), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(template_name='password_reset/password_reset_confirm.html'), name='password_reset_confirm'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(template_name='password_reset/password_reset_complete.html'), name='password_reset_complete'),
    path('search/', UserSearchView.as_view(), name='user_search'),
    
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
# here ana chaimaa kanktb lk hit bnacdm kishufni f[post dyalk] hh 