from django.urls import path
from authentication.views import *
from django.conf import settings
from django.conf.urls.static import static
from .views import UsersInDB

urlpatterns = [
    path('login/42-intra/', initiate_42_login, name='start_42_oauth'),
    path('login/credentials/', LoginView.as_view(), name='signin'),
    path('register/', RegisterView.as_view(), name='register'),
    path('logout/', logout_and_blacklist, name='logout'),
    path('callback/', UserAuthenticationView.as_view(), name='callback'),  # Where 42 will redirect back
    path('holder/', HolderView.as_view(), name='holder_view'),
    path('get-access-token/', get_access_token),
    path('users/', UsersInDB.as_view(), name='users'),
    path('health_checker/', health_checker, name='health_checker'),
    path('refresh/', refresh_access_token, name='refresh_access_token'),
    path('check-2fa-status/', CheckTwoFactorStatusView.as_view(), name='check_2fa_status'),
    path('enable-2fa/', EnableTwoFactorView.as_view(), name='enable_twoFA'),
    path('disable-2fa/', DisableTwoFactorView.as_view(), name='disable_twoFA'),
    path('verify-2fa/', TwoFactorVerifyViewNewUser.as_view(), name='verify_2fa_token'),
    path('verify-2fa-old/', TwoFactorVerifyViewForOldUser.as_view(), name='verify_2fa_token_old'),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)