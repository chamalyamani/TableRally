from django.urls import path
from authentication.views import *
from django.conf import settings
from django.conf.urls.static import static
from CRUDOps.views import *
from django.shortcuts import render
import requests
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('<str:username>/profile/', SearchedProfileView.as_view(), name='user_profile'),
    path('get-csrf-token/', get_csrf_token, name='get_csrf_token'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('delete-account/', DeleteAccountView.as_view(), name='delete-account'),
    path('update-profile/', UpdateProfileView.as_view(), name='update-account'),
    path('password_reset/', auth_views.PasswordResetView.as_view(
        email_template_name='password_reset/password_reset_email.txt',  # Plain text email template
        subject_template_name='password_reset/password_reset_subject.txt',  # Email subject
    ), name='password_reset'),
    path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(template_name='password_reset/password_reset_done.html'), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(template_name='password_reset/password_reset_confirm.html'), name='password_reset_confirm'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(template_name='password_reset/password_reset_complete.html'), name='password_reset_complete'),
    path('search/', UserSearchView.as_view(), name='user_search'),
    path('password-reset-template/', password_reset_template, name='password_reset_template'),
    path('anonymize/', AnonymizeUserDataView.as_view(), name='anonymize-user'),
    path('download-data/', DownloadUserDataView.as_view(), name='download-user-data'),

]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
