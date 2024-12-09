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
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    image_url = user.image_url

    if user.is_authenticated:
        return Response({
            "username": user.username, 
            "email": user.email,
            "image": image_url, 
        })
    return Response({"error": "User is not authenticated"}, status=401)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account_view(request):
    try:
        user = request.user
        user.delete()  # Delete the user from the database
        return Response({"message": "Your account has been deleted successfully."}, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):

    try:
        user = request.user
        data = request.data
        new_username = data.get('username', user.username)
        new_email = data.get('email', user.email)
        old_password = data.get('OldPassword', None)
        new_password = data.get('password', None)
        confirm_password = data.get('confirm_password', None)
        new_image = request.FILES.get('image')

        if new_username:
            user.username = new_username

        if old_password:
            if not user.check_password(old_password):
                return Response({'error': 'Old password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            if new_password:
                return Response({'error': 'Old password is required to set a new password.'},
                                status=status.HTTP_400_BAD_REQUEST)

        if new_password:
            if new_password != confirm_password:
                return Response({'error': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                validate_password(new_password, user=user)
                user.set_password(new_password)
            except ValidationError as e:
                return Response({'error': e.messages}, status=status.HTTP_400_BAD_REQUEST)
        
        if not new_password and confirm_password:
            return Response({'error': 'New password is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if new_email:
            user.email = new_email

        max_file_size = 2 * 1024 * 1024  # 2 MB

        if new_image:
            if new_image.size > max_file_size:
                return Response({'error': 'Image size should not exceed 2 MB.'},
                                status=status.HTTP_400_BAD_REQUEST)
            # Generate a unique filename
            new_filename = f'{uuid.uuid4()}_{new_image.name}'
            # Save the image using default storage
            image_path = default_storage.save(f'profile_images/{new_filename}', new_image)
            user.image = image_path
        user.save()

        # Assuming you have MEDIA_URL configured to serve media files
        image_url = request.build_absolute_uri(user.image.url) if user.image else None

        return Response({
            'username': user.username,
            'email': user.email,
            'image': image_url,
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': 'An unexpected error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def get_csrf_token(request):
    # This will return the CSRF token to the frontend
    csrf_token = get_token(request)
    return JsonResponse({'csrfToken': csrf_token})

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


@api_view(['GET'])
@authentication_classes([JWTAuthentication])  # Use JWT authentication
@permission_classes([IsAuthenticated])  # Ensure only authenticated users can access this view
def user_profile_view(request, username):
    # Get the user being searched
    searched_user = get_object_or_404(User, username=username)

    # The current user making the request
    current_user = request.user

    if current_user == searched_user:
        return JsonResponse({'error': 'Cannot perform actions on your own profile.'}, status=400)
    
    # Check if the users are already friends
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

    is_blocked_by_user = Block.objects.filter(blocker=current_user, blocked=searched_user).exists()
    is_blocked_by_other = Block.objects.filter(blocker=searched_user, blocked=current_user).exists() 

    # If blocked by the user or the other user, limit access
    # if is_blocked_by_user or is_blocked_by_other:
    #     return JsonResponse({"error": "User is blocked"}, status=403)


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

    return JsonResponse(user_data)

def password_reset_template(request):
    return render(request, 'password_reset/password_reset_form.html')