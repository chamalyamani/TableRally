import os
from django.shortcuts import render
from django.shortcuts import redirect
import requests
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from .models import CustomUser
from django.views.generic import ListView
import jwt
from django.conf import settings
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.contrib.auth.models import User
from .serializers import RegistrationSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.views.decorators.csrf import csrf_exempt
from django_otp.plugins.otp_totp.models import TOTPDevice
from datetime import datetime, timedelta
import qrcode
from io import BytesIO
from django.db import IntegrityError
import base64
from datetime import datetime, timedelta
from django.views.generic.base import RedirectView

class Initiate42LoginView(RedirectView):
    permanent = False  # Indicates this is a temporary redirect

    def get_redirect_url(self, *args, **kwargs):
        return (
            f"https://api.intra.42.fr/oauth/authorize?client_id={settings.CLIENT_ID}"
            f"&redirect_uri={settings.REDIRECT_URI}&response_type=code&scope=public"
        )

class FortyTwoOAuthService:
    """
    A service class to handle 42 API authentication and user data retrieval.
    """

    @staticmethod
    def exchange_authorization_code(authorization_code):
        """
        Exchange an authorization code for an access token using 42 API.
        """
        token_url = "https://api.intra.42.fr/oauth/token"
        token_data = {
            "grant_type": "authorization_code",
            "client_id": settings.CLIENT_ID,
            "client_secret": settings.CLIENT_SECRET,
            "code": authorization_code,
            "redirect_uri": settings.REDIRECT_URI,
        }
        try:
            response = requests.post(token_url, data=token_data)
            if response.status_code == 200:
                return response.json().get("access_token")
            else:
                print(f"Token exchange failed: {response.text}")
                return None
        except requests.RequestException as e:
            print(f"Exception during token exchange: {e}")
            return None

    @staticmethod
    def get_user_info(access_token):
        """
        Fetch user information from the 42 API using an access token.
        """
        user_info_url = "https://api.intra.42.fr/v2/me"
        headers = {"Authorization": f"Bearer {access_token}"}
        try:
            response = requests.get(user_info_url, headers=headers)
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Failed to fetch user information: {response.text}")
                return None
        except requests.RequestException as e:
            print(f"Exception during user info retrieval: {e}")
            return None

class UserAuthenticationView(APIView):
    """ 
    Handles user authentication via the 42 API and integrates 2FA checks.
    """
    def get(self, request):
        authorization_code = request.GET.get("code")
        
        if not authorization_code:
            return Response({"error": "Authorization code not provided"}, status=status.HTTP_400_BAD_REQUEST)
    
        try:
            access_token = FortyTwoOAuthService.exchange_authorization_code(authorization_code)
        except Exception as e:
            return Response({"error": "Failed to exchange authorization code for tokennnn"}, status=status.HTTP_400_BAD_REQUEST)
    
        if not access_token:
            return Response({"error": "Failed to exchange authorization code for token"}, status=status.HTTP_400_BAD_REQUEST)
    
        try:
            user_info = FortyTwoOAuthService.get_user_info(access_token)
        except Exception as e:
            return Response({"error": "Failed to fetch user information"}, status=status.HTTP_400_BAD_REQUEST)
     
        if not user_info:
            return Response({"error": "Failed to fetch user information"}, status=status.HTTP_400_BAD_REQUEST)

        specific_user_infos = {
            "external_image_url": user_info.get("image", {}).get("versions", {}).get("large", ""),
            "username":  user_info.get("login"),
            "email": user_info.get("email"),
            "first_name": user_info.get("first_name"),
            "last_name": user_info.get("last_name"),
        }
        
        email = specific_user_infos['email']
        username = specific_user_infos['username']

        # Step 1: Check if username already exists and is not associated with the same email
        if CustomUser.objects.filter(username=username).exclude(email=email).exists():
            return Response({'error': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if the user exists by email
        try:
            user, created = CustomUser.objects.get_or_create(
                email=email,
                defaults={
                    'username': username,
                    'external_image_url': specific_user_infos['external_image_url'],
                    'first_name': specific_user_infos['first_name'],
                    'last_name': specific_user_infos['last_name']
                } 
            )
        except IntegrityError as e:
            return Response({'error': 'Failed to create user due to a database error.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        
        # Update `external_image_url` if the user already exists and doesn't have a `local_image`
        if not created:
            if not user.image:
                user.external_image_url = specific_user_infos['external_image_url']
                user.save()

        has_2fa = TOTPDevice.objects.filter(user=user, confirmed=True).exists()
        if has_2fa:
            temp_payload = {
                'user_id': user.id,
                'requires_2fa': True, 
                'exp': datetime.utcnow() + timedelta(minutes=5)  # Temporary expiration time
            }
            temporary_token = jwt.encode(temp_payload, settings.SECRET_KEY, algorithm='HS256')

            # Store the data in the session
            request.session['auth_data'] = {
                'temporary_token': temporary_token,
                'message': "2FA is required",
            }

            request.session['is_42_logged_in'] = True

            return HttpResponseRedirect(os.getenv('DOMAIN_NAME'))
        request.session['is_42_logged_in'] = True
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        image_url = request.build_absolute_uri(user.image_url)
        response = JsonResponse({
            'username': user.username,
            'email': user.email,
            'image': image_url,
            'first_name': user.first_name,
            'last_name': user.last_name
        })

        response.set_cookie(key='access_token', value=access_token, httponly=True, secure=True, samesite='Lax' )# Set to True in production
        response.set_cookie( key='refresh_token', value=str(refresh), httponly=True, secure=True, samesite='Lax') # Set to True in production

        return response

class tokenHolderFor2faWith_42API(APIView):
    """
    Retrieves authentication data stored in the session and returns it as JSON.
    """
    def get(self, request):
        auth_data = request.session.get('auth_data')
        is_42_logged_in = request.session.get('is_42_logged_in', False)

        if auth_data:
            del request.session['auth_data']
        if is_42_logged_in:
            del request.session['is_42_logged_in']

        if auth_data and is_42_logged_in:
            return JsonResponse({
                'temporary_token': auth_data.get('temporary_token'),
                'message': auth_data.get('message', ''),
                'is_42_logged_in': True,
            })

        return JsonResponse({'is_42_logged_in': False, 'message': 'No 2FA required'}, status=200)
        # if not auth_data:
        #     return JsonResponse({"error": "No authentication data found"}, status=400)

        # del request.session['auth_data']

        # return JsonResponse(auth_data, status=200)

class RefreshAccessTokenView(APIView):
    permission_classes = [AllowAny]  # No authentication needed since JWT handles security

    def post(self, request, *args, **kwargs):
        # Get the refresh token from the cookie
        refresh_token = request.COOKIES.get('refresh_token')

        if not refresh_token:
            return Response({"error": "Refresh token not provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Create a new access token using the refresh token
            token = RefreshToken(refresh_token)
            new_access_token = str(token.access_token)

            # Respond with the new access token
            response = Response({"message": "Token refreshed successfully"}, status=status.HTTP_200_OK)
            response.set_cookie(
                key='access_token',
                value=new_access_token,
                httponly=True,
                secure=True,
                samesite='Lax'
            )
            return response

        except Exception as e:
            return Response({"error": "Invalid refresh token or token expired"}, status=status.HTTP_400_BAD_REQUEST)

class GetAccessTokenView(APIView):
    permission_classes = [AllowAny]  # No authentication needed since JWT handles security

    def get(self, request, *args, **kwargs):
        # Get the access token from the cookie
        access_token = request.COOKIES.get('access_token')

        if access_token:
            return Response({"access_token": access_token}, status=status.HTTP_200_OK)
        return Response({"access_token": None}, status=status.HTTP_401_UNAUTHORIZED)


# Authenticaion using JWT concept with credentials
class RegisterView(APIView):
    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            try: 
                serializer.save()
                return Response({"message": "Registration successful. You can now sign in."}, status=status.HTTP_201_CREATED)
            except IntegrityError:
                return Response({"error": "A user with this username or email already exists."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        """Handle user login."""
        username = request.data.get('username')
        password = request.data.get('password')

        # Validate input
        if not username or not password:
            return Response(
                {"error": "Username and password are required."},
                status=status.HTTP_400_BAD_REQUEST  # Changed to 400 as it's a bad request
            )

        # Authenticate user
        user = authenticate(username=username, password=password)
        if user is None:
            return Response(
                {"error": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Redirect staff or superuser to the admin panel
        if user.is_staff or user.is_superuser:
            login(request, user)
            return Response(
                {"redirect_to": "/admin/"},
                status=status.HTTP_200_OK
            )

        # Handle 2FA
        if TOTPDevice.objects.filter(user=user, confirmed=True).exists():
            temp_payload = {
                'user_id': user.id,
                'requires_2fa': True,
                'exp': datetime.utcnow() + timedelta(minutes=10)  # Temporary expiration time
            }
            temporary_token = jwt.encode(temp_payload, settings.SECRET_KEY, algorithm='HS256')

            return Response({
                "message": "2FA is required.",
                "temporary_token": temporary_token,
            }, status=status.HTTP_200_OK)

        # Issue tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        # Create response with user details
        response = Response({
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'image': user.image.url if user.image else None,  # Handle users without images
        }, status=status.HTTP_200_OK)

        # Set cookies for access and refresh tokens
        cookie_settings = {
            'httponly': True,
            'secure': settings.DEBUG is False,  # Secure cookies only in production
            'samesite': 'Lax'
        }
        response.set_cookie(key='access_token', value=access_token, **cookie_settings)
        response.set_cookie(key='refresh_token', value=str(refresh), **cookie_settings)

        return response

class LogoutAndBlacklistView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response({"error": "Refresh token not provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Blacklist the refresh token
            token = RefreshToken(refresh_token)
            token.blacklist()

            # Clear access and refresh tokens from cookies
            response = Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
            response.delete_cookie('access_token')
            response.delete_cookie('refresh_token')

            return response

        except Exception as e:
            return Response({"error": "Failed to blacklist token"}, status=status.HTTP_400_BAD_REQUEST)

class CheckTwoFactorStatusView(APIView):
    """
    Check if the logged-in user has 2FA enabled.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request): 
        user = request.user
        has_2fa = TOTPDevice.objects.filter(user=user, confirmed=True).exists()
        return Response({'two_fa_enabled': has_2fa})

class EnableTwoFactorView(APIView):
    """
    This view generates the 2FA setup QR code for the user.
    """

    # Ensure the user is authenticated
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Check if the user already has a confirmed TOTP device
        if TOTPDevice.objects.filter(user=user, confirmed=True).exists():
            return JsonResponse({"error": "2FA is already enabled for this user."}, status=400)
        
        # Optional: Delete any existing unconfirmed devices before creating a new one
        TOTPDevice.objects.filter(user=user, confirmed=False).delete()

        # Create a new TOTP device for the user
        device = TOTPDevice.objects.create(user=user, confirmed=False)
        secret = device.config_url

        # Generate a QR code
        qr = qrcode.make(secret)
        buffer = BytesIO()
        qr.save(buffer, format="PNG")
        qr_code_data = base64.b64encode(buffer.getvalue()).decode("utf-8")

        # Create a temporary JWT for 2FA verification
        temp_payload = {
            'user_id': user.id,
            'requires_2fa': True,
            'exp': datetime.utcnow() + timedelta(minutes=10) # Temporary expiration time
        }
        temporary_token = jwt.encode(temp_payload, settings.SECRET_KEY, algorithm='HS256')

        return JsonResponse({
            'username': user.username,
            'email': user.email,
            'image': user.image.url if user.image else None,
            "temporary_token": temporary_token,
            "qr_code": f"data:image/png;base64,{qr_code_data}",
            "message": "Scan the QR code with your authenticator app.",
        })

class DisableTwoFactorView(APIView):
    """
    Disable 2FA for the logged-in user by deleting their confirmed TOTP device.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        TOTPDevice.objects.filter(user=user, confirmed=True).delete()
        return Response({'success': True})

class TwoFactorVerifyViewNewUser(APIView):
    """
    Verifies the 2FA token after login and issues the full JWT.
    """

    def post(self, request):
        temporary_token = request.data.get('temporary_token')
        two_fa_token = request.data.get('two_fa_token')
        try:
            # Decode the temporary JWT token
            decoded_token = jwt.decode(temporary_token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = decoded_token.get('user_id')
            requires_2fa = decoded_token.get('requires_2fa')
        except jwt.ExpiredSignatureError:
            return JsonResponse({"error": "Temporary token expired"}, status=status.HTTP_400_BAD_REQUEST)
        except jwt.InvalidTokenError:
            return JsonResponse({"error": "Invalid temporary token"}, status=status.HTTP_400_BAD_REQUEST)

        if not requires_2fa:
            return JsonResponse({"error": "2FA is not required for this user"}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch the user and verify the 2FA token
        try:
            user = CustomUser.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=status.HTTP_400_BAD_REQUEST)

        devices = TOTPDevice.objects.filter(user=user, confirmed=False)

        for device in devices:
            if device.verify_token(two_fa_token):
                device.confirmed = True
                device.save()
                
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)

                response = JsonResponse({
                    'username': user.username,
                    'email': user.email,
                    'image': user.image.url if user.image else None
                }, status=status.HTTP_200_OK)

                # Set the JWT tokens in cookies (secure and HTTP-only)
                response.set_cookie('access_token', access_token, httponly=True, secure=False, samesite='Lax')
                response.set_cookie('refresh_token', str(refresh), httponly=True, secure=False, samesite='Lax')

                return response

        return JsonResponse({"error": "Invalid 2FA token"}, status=status.HTTP_400_BAD_REQUEST)

class TwoFactorVerifyViewForOldUser(APIView):
    """
    Verifies the 2FA token after login and issues the full JWT.
    """

    def post(self, request):
        temporary_token = request.data.get('temporary_token')
        two_fa_token = request.data.get('two_fa_token')
        
        try:
            # Decode the temporary JWT token
            decoded_token = jwt.decode(temporary_token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = decoded_token.get('user_id')
            requires_2fa = decoded_token.get('requires_2fa')
        except jwt.ExpiredSignatureError:
            return JsonResponse({"error": "Temporary token expired"}, status=status.HTTP_400_BAD_REQUEST)
        except jwt.InvalidTokenError:
            return JsonResponse({"error": "Invalid temporary token"}, status=status.HTTP_400_BAD_REQUEST)

        if not requires_2fa:
            return JsonResponse({"error": "2FA is not required for this user"}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch the user and verify the 2FA token
        try:
            user = CustomUser.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=status.HTTP_400_BAD_REQUEST)

        devices = TOTPDevice.objects.filter(user=user, confirmed=True)
        
        for device in devices:
            if device.verify_token(two_fa_token):
                # 2FA token is valid, issue full JWT tokens
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)

                response = JsonResponse({
                    'username': user.username,
                    'email': user.email,
                    'image': user.image.url if user.image else None
                }, status=status.HTTP_200_OK)

                # Set the JWT tokens in cookies (secure and HTTP-only)
                response.set_cookie('access_token', access_token, httponly=True, secure=False, samesite='Lax')
                response.set_cookie('refresh_token', str(refresh), httponly=True, secure=False, samesite='Lax')

                return response

        return JsonResponse({"error": "Invalid 2FA token"}, status=status.HTTP_400_BAD_REQUEST)

def health_checker(request):
    return HttpResponse("Service ready", status=status.HTTP_200_OK)