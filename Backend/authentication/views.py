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
from .serializers import CustomUserSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.views.decorators.csrf import csrf_exempt
from django_otp.plugins.otp_totp.models import TOTPDevice
from datetime import datetime, timedelta
import qrcode
from io import BytesIO
from django.db import IntegrityError
import base64
from datetime import datetime, timedelta


class UsersInDB(ListView):
    model = CustomUser
    template_name = 'authentication/users_display.html'
    context_object_name = 'users_list'


def initiate_42_login(request):
    authorization_url = (
        f"https://api.intra.42.fr/oauth/authorize?client_id={settings.CLIENT_ID}"
        f"&redirect_uri={settings.REDIRECT_URI}&response_type=code&scope=public"
    )
    return redirect(authorization_url)

def save_user_info_to_database(infos):
    if not CustomUser.objects.filter(email=infos["email"]).exists():
        user_info = CustomUser(username=infos["username"], email=infos["email"],  external_image_url=infos["external_image_url"])
        user_info.save()

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    
    access_token = refresh.access_token
 
    return {
        'refresh': str(refresh),  # Convert the token to a string
        'access': str(access_token),  # Convert the access token to a string
    }
 
def exchange_authorization_code(authorization_code):
    token_url = "https://api.intra.42.fr/oauth/token"
    token_data = {
        "grant_type": "authorization_code",
        "client_id": settings.CLIENT_ID,
        "client_secret": settings.CLIENT_SECRET,
        "code": authorization_code,
        "redirect_uri": settings.REDIRECT_URI
    }
    try:
        response = requests.post(token_url, data=token_data)
        if response.status_code == 200:
            access_token = response.json().get("access_token")
            return access_token
        else:
            print(f"Token exchange failed: {response.text}")
            return None
    except requests.RequestException as e:
        print(f"Exception during token exchange: {e}")
        return None

def get_user_info(access_token):
    user_info_url = "https://api.intra.42.fr/v2/me"
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(user_info_url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to fetch user information: {response.text}")
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
            access_token = exchange_authorization_code(authorization_code)
        except Exception as e:
            return Response({"error": "Failed to exchange authorization code for token"}, status=status.HTTP_400_BAD_REQUEST)
    
        if not access_token:
            return Response({"error": "Failed to exchange authorization code for token"}, status=status.HTTP_400_BAD_REQUEST)
    
        try:
            user_info = get_user_info(access_token)
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
        

        # existing_user = CustomUser.objects.filter(email=specific_user_infos['email']).first()
     
        # if existing_user:
        #     user = existing_user
        # else:
        #     user, created = CustomUser.objects.get_or_create(
        #         email=specific_user_infos['email'],
        #         defaults={ 
        #             'username': specific_user_infos['username'],
        #             'external_image_url': specific_user_infos['external_image_url'],
        #         }
        #     )
        #     if created: 
        #         save_user_info_to_database(specific_user_infos)

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
            
            # Redirect back to the frontend index page
            return HttpResponseRedirect(os.getenv('DOMAIN_NAME'))

        else:
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

class HolderView(APIView):
    """
    Retrieves authentication data stored in the session and returns it as JSON.
    """
    def get(self, request):
        auth_data = request.session.get('auth_data')

        if not auth_data:
            return JsonResponse({"error": "No authentication data found"}, status=400)

        del request.session['auth_data']

        return JsonResponse(auth_data, status=200)


@csrf_exempt #no need to csrf because already the JWT are secured and stored in http-only cookies
def refresh_access_token(request):

    # Get the refresh token from the cookie
    refresh_token = request.COOKIES.get('refresh_token')
    if not refresh_token:
        return JsonResponse({"error": "Refresh token not provided"}, status=400)

    try:
        # Create a new access token using the refresh token
        token = RefreshToken(refresh_token)
        new_access_token = str(token.access_token)

        # Respond with the new access token
        response = JsonResponse({"message": "Token refreshed successfully"})
        response.set_cookie(key='access_token', value=new_access_token, httponly=True, secure=True, samesite='Lax')
        return response

    except Exception as e:
        return JsonResponse({"error": "Invalid refresh token or token expired"}, status=400)

def get_access_token(request):

    access_token = request.COOKIES.get('access_token')

    if access_token:
        return JsonResponse({"access_token": access_token})
    else:
        return JsonResponse({"error": "Access token not found"}, status=401)




# Authenticaion using JWT concept with credentials
class RegisterView(APIView):
    def get(self, request):
        return render(request, 'authentication/register.html')

    def post(self, request):
        serializer = CustomUserSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                messages.success(request, "Registration successful. You can now sign in.")
                return redirect(os.getenv('DOMAIN_NAME'))
            except IntegrityError:
                # This should rarely happen due to serializer validation, but handle just in case
                messages.error(request, "A user with this username or email already exists.")
                return render(request, 'authentication/register.html', {'serializer': serializer})
        else:
            # Collect all error messages
            for field, errors in serializer.errors.items():
                for error in errors:
                    messages.error(request, f"{field.capitalize()}: {error}")
            return render(request, 'authentication/register.html', {'serializer': serializer})

class LoginView(APIView):
    def get(self, request):
        return render(request, 'authentication/login.html')

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password: 
            return Response(
                {"error": "Username and password are required."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        user = authenticate(username=username, password=password)
        if user is None:
            return Response(
                {"error": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if user.is_staff or user.is_superuser:
            login(request, user)
            return redirect('/admin/')

        # Check if user has a confirmed 2FA device
        if TOTPDevice.objects.filter(user=user, confirmed=True).exists():
            # Create a temporary JWT for 2FA verification
            temp_payload = {
                'user_id': user.id,
                'requires_2fa': True,
                'exp': datetime.utcnow() + timedelta(minutes=10) # Temporary expiration time
            }
            temporary_token = jwt.encode(temp_payload, settings.SECRET_KEY, algorithm='HS256')

            return Response({
                "message": "2FA is required",
                "temporary_token": temporary_token,
            }, status=status.HTTP_200_OK)

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
    
        # image_url = request.build_absolute_uri(user.image) if user.image else request.build_absolute_uri(settings.MEDIA_URL + 'Default-welcomer.png')

        # response = JsonResponse({
        #     'username': user.username,
        #     'email': user.email,
        #     'image_url': image_url, 
        #     })

        # Use image_url to dynamically choose between local and external images
        print("----------------> ", user.image_url) 
        image_url = request.build_absolute_uri(user.image_url)
        response = Response({
            'username': user.username,
            'email': user.email,
            'image': image_url,
            'first_name': user.first_name,
            'last_name': user.last_name
        }, status=status.HTTP_200_OK)
        
        # # secure Should be True in production (use HTTPS)
        response.set_cookie(key='access_token', value=access_token, httponly=True, secure=False , samesite='Lax')
        response.set_cookie(key='refresh_token', value=refresh, httponly=True, secure=False, samesite='Lax')

        return response


@api_view(['POST'])
def logout_and_blacklist(request):
    try:
        refresh_token = request.COOKIES.get('refresh_token')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
                response = JsonResponse({"message": "Logged out successfully"})
                response.delete_cookie('access_token')
                response.delete_cookie('refresh_token')
                return response
            except Exception as e:
                return JsonResponse({"error": "Failed to blacklist token"}, status=400)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


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