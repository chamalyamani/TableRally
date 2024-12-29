from django.shortcuts import render
from django.shortcuts import redirect
from django.http import HttpResponseRedirect, JsonResponse
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.core.files.storage import default_storage
import uuid
from django.contrib.auth.views import PasswordResetConfirmView
from django.contrib.auth.forms import SetPasswordForm
from django.urls import reverse_lazy
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.middleware.csrf import get_token
from django.contrib.auth import get_user_model
from .serializers import UserSearchSerializer
from django.db.models import Q
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from Friendship.models import Friendship, Block
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.contrib.auth.views import PasswordResetView
from django.urls import reverse_lazy
from django.contrib.sites.shortcuts import get_current_site

User = get_user_model()
    
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "username": user.username,
            "email": user.email,
            "image": user.image_url,
        })


class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        try:
            user = request.user
            user.delete()  # Delete the user from the database
            return Response({"message": "Your account has been deleted successfully."}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=400)


class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        data = request.data
        try:
            # Update user profile fields
            anythingModified = False

            anythingModified |= self.update_username(user, data)
            anythingModified |= self.update_email(user, data)
            anythingModified |= self.update_password(user, data)
            anythingModified |= self.update_image(user, request)

            if anythingModified:
                # image_url = request.build_absolute_uri(user.image.url) if user.image else None
                user.save()
                return Response({"message": "Profile updated successfully!"}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "No changes detected."}, status=status.HTTP_200_OK)

        except ValidationError as e:
            return Response({'error': e.messages}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': 'An unexpected error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update_username(self, user, data):
        new_username = data.get('username', user.username)
        if new_username != user.username:
            user.username = new_username
            return True 
        return False 

    def update_email(self, user, data):
        new_email = data.get('email', user.email)
        if new_email != user.email:
            user.email = new_email
            return True
        return False
    
    def update_password(self, user, data):
        old_password = data.get('OldPassword')
        new_password = data.get('password')
        confirm_password = data.get('confirm_password')

        if new_password:
            if not old_password or not user.check_password(old_password):
                raise ValidationError("Old password is incorrect or missing.")
            if new_password != confirm_password:
                raise ValidationError("Passwords do not match.")
            validate_password(new_password, user=user)
            user.set_password(new_password)
            return True
        return False

    def update_image(self, user, request):
        new_image = request.FILES.get('image')
        max_file_size = 2 * 1024 * 1024  # 2 MB

        if new_image:
            if new_image.size > max_file_size:
                raise ValidationError("Image size should not exceed 2 MB.")
            new_filename = f'{uuid.uuid4()}_{new_image.name}'
            image_path = default_storage.save(f'profile_images/{new_filename}', new_image)
            if not user.image or user.image.url != image_path:
                user.image = image_path
                return True
        return False

def get_csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})

class UserSearchView(APIView):
    """
    API endpoint that allows users to search for other users.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response({"error": "No search query provided."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Search across multiple fields using Q objects
        users = User.objects.filter(
            Q(username__icontains=query)
        ).exclude(id=request.user.id).distinct()

        serializer = UserSearchSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class SearchedProfileView(APIView):
    authentication_classes = [JWTAuthentication]  # Use JWT authentication
    permission_classes = [IsAuthenticated]  # Ensure only authenticated users can access this view

    def get(self, request, username):
        # Get the user being searched
        searched_user = get_object_or_404(User, username=username)

        # The current user making the request
        current_user = request.user

        if current_user == searched_user:
            return Response({'error': 'Cannot perform actions on your own profile.'}, status=HTTP_400_BAD_REQUEST)

        # Check friendship status
        friendship = Friendship.objects.filter(
            (Q(from_user=current_user, to_user=searched_user) | 
             Q(from_user=searched_user, to_user=current_user)),
            status__in=['A', 'P']  # Check for active or pending friendships only
        ).first()

        is_friend = False
        has_sent_request = False
        has_received_request = False
        friendship_id = None

        if friendship:
            friendship_id = friendship.id
            if friendship.status == 'A':
                is_friend = True
            elif friendship.status == 'P':
                if friendship.from_user == current_user:
                    has_sent_request = True
                else:
                    has_received_request = True

        # Check block status
        is_blocked_by_user = Block.objects.filter(blocker=current_user, blocked=searched_user).exists()
        is_blocked_by_other = Block.objects.filter(blocker=searched_user, blocked=current_user).exists()

        # If blocked, limit access
        if is_blocked_by_user or is_blocked_by_other:
            return Response({"error": "User is blocked"}, status=status.HTTP_403_FORBIDDEN)

        # Return the profile data along with relationship status
        image_url = searched_user.image_url

        user_data = {
            'username': searched_user.username,
            'email': searched_user.email,
            'image': image_url,
            'is_friend': is_friend,
            'has_sent_request': has_sent_request,
            'has_received_request': has_received_request,
            'friendship_id': friendship_id,
            'is_blocked_by_user': is_blocked_by_user,
            'is_blocked_by_other': is_blocked_by_other,
        }

        return Response(user_data)

def password_reset_template(request):
    return render(request, 'password_reset/password_reset_form.html')