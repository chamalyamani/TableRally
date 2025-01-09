from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Friendship
from django.contrib.auth import get_user_model
from .serializers import FriendshipSerializer
from authentication.serializers import RegistrationSerializer
from django.db import models
from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from Friendship.models import Friendship, Notification 
# from Friendship.models import Block
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.db.models import Q
from rest_framework.views import APIView
# from .serializers import BlockedUserSerializer
from rest_framework import status
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

User = get_user_model()

class FriendshipStatusView(APIView):
    """
    Retrieves the friendship status between the authenticated user and the target user.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        user = request.user
        target_user = get_object_or_404(User, username=username)

        if user == target_user:
            return Response({'status': 'self', 'blocked_by_me': False}, status=status.HTTP_200_OK)

        friendship = Friendship.objects.filter(
            Q(from_user=user, to_user=target_user) | Q(from_user=target_user, to_user=user)
        ).first()

        if friendship:
            if friendship.status == 'A':
                return Response({
                    'status': 'friends',
                    'friendship_id': friendship.id,
                    'blocked_by_me': False
                }, status=status.HTTP_200_OK)
            elif friendship.status == 'P':
                if friendship.from_user == user:
                    return Response({
                        'status': 'outgoing_request',
                        'friendship_id': friendship.id,
                        'blocked_by_me': False
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'status': 'incoming_request',
                        'friendship_id': friendship.id,
                        'blocked_by_me': False
                    }, status=status.HTTP_200_OK)
            elif friendship.status == 'B':
                if friendship.from_user == user:
                    return Response({
                        'status': 'blocked',
                        'blocked_by_me': True
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'status': 'blocked',
                        'blocked_by_me': False
                    }, status=status.HTTP_200_OK)
            elif friendship.status == 'R':
                return Response({
                    'status': 'rejected',
                    'blocked_by_me': False
                }, status=status.HTTP_200_OK)
        else:
            return Response({
                'status': 'no_relation',
                'blocked_by_me': False
            }, status=status.HTTP_200_OK)

class SendFriendRequestView(APIView):
    """
    Sends a friend request to a user.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        to_username = request.data.get('to_username')

        if not to_username:
            return Response({'error': 'to_username is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target_user = User.objects.get(username=to_username)
        except User.DoesNotExist:
            return Response({'error': 'Target user does not exist'}, status=status.HTTP_404_NOT_FOUND)

        if user == target_user:
            return Response({'error': 'You cannot send a friend request to yourself'}, status=status.HTTP_400_BAD_REQUEST)

        existing_friendship = Friendship.objects.filter(
            Q(from_user=user, to_user=target_user) | Q(from_user=target_user, to_user=user)
        ).first()

        if existing_friendship:
            if existing_friendship.status == 'A':
                return Response({'error': 'You are already friends with this user'}, status=status.HTTP_400_BAD_REQUEST)
            elif existing_friendship.status == 'P':
                if existing_friendship.from_user == user:
                    return Response({'error': 'Friend request already sent'}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    existing_friendship.status = 'A'
                    existing_friendship.save()
                    return Response({'message': 'Friend request accepted'}, status=status.HTTP_200_OK)
            elif existing_friendship.status == 'B':
                return Response({'error': 'Cannot send friend request. You have blocked this user.'}, status=status.HTTP_400_BAD_REQUEST)
            elif existing_friendship.status == 'R':
                existing_friendship.status = 'P'
                existing_friendship.from_user = user
                existing_friendship.to_user = target_user
                existing_friendship.save()
                return Response({'message': 'Friend request sent successfully', 'friendship_id': existing_friendship.id}, status=status.HTTP_201_CREATED)

        friendship = Friendship.objects.create(from_user=user, to_user=target_user, status='P')

        Notification.objects.create(
            recipient=target_user,
            sender=user,
            action='FRIEND_REQUEST_SENT'
        )

        return Response({'message': 'Friend request sent successfully', 'friendship_id': friendship.id}, status=status.HTTP_201_CREATED)

class CancelFriendRequestView(APIView):
    """
    Cancels an outgoing friend request.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, friendship_id):
        user = request.user

        try:
            friendship = Friendship.objects.get(id=friendship_id, from_user=user, status='P')
            friendship.delete()
            return Response({'message': 'Friend request cancelled successfully'}, status=status.HTTP_200_OK)
        except Friendship.DoesNotExist:
            return Response({'error': 'Friend request does not exist or cannot be cancelled'}, status=status.HTTP_400_BAD_REQUEST)

class AcceptFriendRequestView(APIView):
    """
    Accepts an incoming friend request.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, friendship_id):
        user = request.user

        try:
            friendship = Friendship.objects.get(id=friendship_id, to_user=user, status='P')
            friendship.status = 'A'
            friendship.save()
            Notification.objects.create(
                recipient=friendship.from_user,
                sender=user,
                action='FRIEND_REQUEST_ACCEPTED'
            )
            return Response({'message': 'Friend request accepted successfully'}, status=status.HTTP_200_OK)
        except Friendship.DoesNotExist:
            return Response({'error': 'Friend request does not exist or cannot be accepted'}, status=status.HTTP_400_BAD_REQUEST)

class RejectFriendRequestView(APIView):
    """
    Rejects an incoming friend request.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, friendship_id):
        user = request.user

        try:
            friendship = Friendship.objects.get(id=friendship_id, to_user=user, status='P')
            friendship.status = 'R'  # Rejected
            friendship.save()
            return Response({'message': 'Friend request rejected successfully'}, status=status.HTTP_200_OK)
        except Friendship.DoesNotExist:
            return Response({'error': 'Friend request does not exist or cannot be rejected'}, status=status.HTTP_400_BAD_REQUEST)

class RemoveFriendView(APIView):
    """
    Removes a friendship between the authenticated user and the specified user.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, username):
        user = request.user
        target_user = get_object_or_404(User, username=username)

        friendship = Friendship.objects.filter(
            Q(from_user=user, to_user=target_user) | Q(from_user=target_user, to_user=user),
            status='A'
        ).first()

        if not friendship:
            return Response({'error': 'You are not friends with this user'}, status=status.HTTP_400_BAD_REQUEST)

        friendship.delete()
        return Response({'message': 'Friend removed successfully'}, status=status.HTTP_200_OK)

class BlockUserView(APIView):
    """
    Blocks a user.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        user = request.user
        target_user = get_object_or_404(User, username=username)

        if user == target_user:
            return Response({'error': 'You cannot block yourself'}, status=status.HTTP_400_BAD_REQUEST)

        friendship, created = Friendship.objects.get_or_create(
            from_user=user,
            to_user=target_user,
            defaults={'status': 'B'}
        )

        if not created:
            if friendship.status == 'B':
                return Response({'error': 'User is already blocked'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                friendship.status = 'B'
                friendship.save()

        return Response({'message': 'User blocked successfully'}, status=status.HTTP_200_OK)

class UnblockUserView(APIView):
    """
    Unblocks a user.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        user = request.user
        target_user = get_object_or_404(User, username=username)

        try:
            friendship = Friendship.objects.get(from_user=user, to_user=target_user, status='B')
            friendship.delete()
            return Response({'message': 'User unblocked successfully'}, status=status.HTTP_200_OK)
        except Friendship.DoesNotExist:
            return Response({'error': 'User is not blocked'}, status=status.HTTP_400_BAD_REQUEST)

class IsUserBlockedView(APIView):
    """
    Checks if the authenticated user has blocked the specified user.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        user = request.user
        target_user = get_object_or_404(User, username=username)

        is_blocked = Friendship.objects.filter(from_user=user, to_user=target_user, status='B').exists()
        return Response({'is_blocked': is_blocked}, status=status.HTTP_200_OK)

class FriendsListView(APIView):
    """
    Retrieves the list of friends for the authenticated user.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        friendships = Friendship.objects.filter(
            Q(from_user=user, status='A') | Q(to_user=user, status='A')
        )
        friends = []
        for friendship in friendships:
            if friendship.from_user == user:
                friends.append({'username': friendship.to_user.username, 'image_url': friendship.to_user.image_url})
            else:
                friends.append({'username': friendship.from_user.username, 'image_url': friendship.from_user.image_url})
        return Response({'friends': friends}, status=status.HTTP_200_OK)

class BlockedUsersListView(APIView):
    """
    Retrieves the list of users blocked by the authenticated user.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        blocked_friendships = Friendship.objects.filter(
            from_user=user,
            status='B'
        )
        blocked_users = []
        for friendship in blocked_friendships:
            blocked_users.append({
                'username': friendship.to_user.username,
                'image_url': friendship.to_user.image_url
            })
        return Response({'blocked_users': blocked_users}, status=status.HTTP_200_OK)

class IncomingFriendRequestsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        current_user = request.user
        incoming_requests = Friendship.objects.filter(to_user=current_user, status='P')

        incoming_data = [
            {
                'username': req.from_user.username,
                'email': req.from_user.email,
                'image': req.from_user.image.url if req.from_user.image else None,
                'friendship_id': req.id,
            }
            for req in incoming_requests
        ]

        return Response(incoming_data, status=status.HTTP_200_OK)

class OutgoingFriendRequestsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        current_user = request.user
        outgoing_requests = Friendship.objects.filter(from_user=current_user, status='P')

        outgoing_data = [
            {
                'username': req.to_user.username,
                'email': req.to_user.email,
                'image': req.to_user.image.url if req.to_user.image else None,
                'friendship_id': req.id,
            }
            for req in outgoing_requests
        ]

        return Response(outgoing_data, status=status.HTTP_200_OK)

#       NOTIFICATIONS

class NotificationListView(APIView):
    """
    Retrieves the list of unread notifications for the authenticated user.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        notifications = Notification.objects.filter(recipient=user, is_read=False)
        data = [
            {
                'id': notification.id,
                'sender': notification.sender.username,
                'sender_avatar': notification.sender.image_url,
                'action': notification.get_action_display(),
                'created_at': notification.created_at,
            }
            for notification in notifications
        ]
        return Response(data, status=status.HTTP_200_OK)

class MarkNotificationAsReadView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, id):
        if not request.user.is_authenticated:
            return Response({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)

        notification = get_object_or_404(Notification, id=id, recipient=request.user)
        notification.is_read = True
        notification.save()
        return Response({'message': 'Notification marked as read.'}, status=status.HTTP_200_OK)
