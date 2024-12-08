# from tokenize import TokenError
# import jwt
# from datetime import datetime
# from django.conf import settings
# from django.http import JsonResponse
# from rest_framework_simplejwt.tokens import RefreshToken
# from rest_framework.exceptions import AuthenticationFailed
# from django.http import JsonResponse
# from rest_framework.exceptions import AuthenticationFailed
# from datetime import datetime, timedelta
# import jwt
# from django.conf import settings


# class TokenRefreshMiddleware:
#     def __init__(self, get_response):
#         self.get_response = get_response

#     def __call__(self, request):
#         token = request.COOKIES.get('access_token')
#         refresh_token = request.COOKIES.get('refresh_token')

#         if token:
#             try:
#                 decoded_token = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.SIMPLE_JWT['ALGORITHM']])
#                 exp = decoded_token.get('exp')

#                 if exp and datetime.utcfromtimestamp(exp) < datetime.utcnow():
#                     self.refresh_access_token(request)

#             except jwt.ExpiredSignatureError:
#                 self.refresh_access_token(request)
#             except jwt.DecodeError:
#                 return JsonResponse({"error": "Invalid token"}, status=401)

#         response = self.get_response(request)

#         # If a new token was generated, attach it to the response
#         if hasattr(request, 'new_access_token'):
#             response.set_cookie(
#                 key='access_token',
#                 value=request.new_access_token,
#                 httponly=True,
#                 secure=True,
#                 samesite='Lax'
#             )

#         return response

#     def refresh_access_token(self, request):
#         refresh_token = request.COOKIES.get('refresh_token')
#         if not refresh_token:
#             # raise AuthenticationFailed('Refresh token not provided')
#             return

#         try:
#             token = RefreshToken(refresh_token)
#             new_access_token = str(token.access_token)
#             request.new_access_token = new_access_token
#         except TokenError as e:
#             # raise AuthenticationFailed("Token is invalid or expired")
#             return


from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import AuthenticationFailed
from datetime import datetime
import jwt
from django.conf import settings


class TokenRefreshMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Check if the request has an access token in cookies
        access_token = request.COOKIES.get('access_token')
        refresh_token = request.COOKIES.get('refresh_token')

        if access_token and refresh_token:
            try:
                # Decode access token to check its expiration
                decoded_token = jwt.decode(
                    access_token, settings.JWT_SECRET, algorithms=[settings.SIMPLE_JWT['ALGORITHM']]
                )
                exp = decoded_token.get('exp')

                # Check if the access token has expired
                if exp and datetime.utcfromtimestamp(exp) < datetime.utcnow():
                    # Attempt to refresh the token
                    self.refresh_access_token(request)

            except jwt.ExpiredSignatureError:
                # Refresh token expired or invalid
                return self.handle_expired_refresh_token()

            except jwt.DecodeError:
                # Access token is invalid
                return JsonResponse({"error": "Invalid token"}, status=401)

        # Process the request
        response = self.get_response(request)
        return response

    def refresh_access_token(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            raise AuthenticationFailed("Refresh token not provided")

        try:
            # Generate a new access token
            token = RefreshToken(refresh_token)
            new_access_token = str(token.access_token)

            # Set the new access token in the cookies
            response = JsonResponse({"message": "Access token refreshed"})
            response.set_cookie(key='access_token', value=new_access_token, httponly=True, secure=True, samesite='Lax')
            return response

        except Exception:
            raise AuthenticationFailed("Token refresh failed")

    def handle_expired_refresh_token(self):
        # Clear both tokens
        response = JsonResponse({"error": "Refresh token expired"}, status=401)
        response.delete_cookie("access_token")
        # response.delete_cookie("refresh_token")
        return response
