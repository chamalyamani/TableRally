from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Friendship
from django.contrib.auth import get_user_model
from .serializers import FriendshipSerializer
from authentication.serializers import CustomUserSerializer
from django.db import models
from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from Friendship.models import Friendship, Block, Notification
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.db.models import Q
from rest_framework.views import APIView
from .serializers import BlockedUserSerializer
from rest_framework import status
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

User = get_user_model()

class SendFriendRequestView(APIView):
    """
    Handles sending a friend request from the authenticated user to another user.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        to_username = request.data.get('to_username')
        
        to_user = get_object_or_404(User, username=to_username)

        if Block.objects.filter(blocker=request.user, blocked=to_user).exists():
            return Response({'error': 'Can`t send request. User is blocked'}, status=status.HTTP_400_BAD_REQUEST)
        
        Friendship.objects.filter(from_user=request.user, to_user=to_user, status='R').delete()

        if Friendship.objects.filter(from_user=request.user, to_user=to_user, status='P').exists():
            return Response({'error': 'Friend request already sent and pending'}, status=status.HTTP_400_BAD_REQUEST)

        friendship = Friendship.objects.create(from_user=request.user, to_user=to_user, status='P')

        notification = Notification.objects.create(
            recipient=to_user,
            sender=request.user,
            action='FRIEND_REQUEST_SENT',
        )
        
        # Send WebSocket notification
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"user_{to_user.id}",
            {
                "type": "send_notification",
                "notification": {
                    "type": "Friend Request",
                    "message": f"{request.user.username} sent you a friend request.",
                    "timestamp": notification.timestamp.isoformat(),
                }
            }
        )
        
        return Response({'message': 'Friend request sent successfully', 'friendship_id': friendship.id}, status=status.HTTP_200_OK)

class AcceptFriendRequestView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, friendship_id):
        friendship = get_object_or_404(Friendship, id=friendship_id, to_user=request.user, status='P')
        friendship.status = 'A'
        friendship.save()
        Notification.objects.create(
            recipient=friendship.from_user,
            sender=request.user,
            action='FRIEND_REQUEST_ACCEPTED',
        )
        return Response({'message': 'Friend request accepted'}, status=status.HTTP_200_OK)

class RejectFriendRequestView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, friendship_id):
        friendship = get_object_or_404(Friendship, id=friendship_id, to_user=request.user, status='P')
        friendship.status = 'R'
        friendship.save()
        # Notification.objects.create(
        #     recipient=friendship.from_user,
        #     sender=request.user,
        #     action='FRIEND_REQUEST_REJECTED',
        # )
        return Response({'message': 'Friend request rejected'}, status=status.HTTP_200_OK)

class FriendsListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        current_user = request.user
        friendships = Friendship.objects.filter(
            (Q(from_user=current_user) | Q(to_user=current_user)),
            status='A'
        )

        friends_data = [
            {
                'username': friend.username,
                'email': friend.email,
                'image': friend.image.url if friend.image else None,
                'friendship_id': friendship.id,
                'is_friend': True,
                'is_blocked': False,  # Adjust if blocking logic is implemented
            }
            for friendship in friendships
            for friend in [friendship.to_user if friendship.from_user == current_user else friendship.from_user]
        ]

        return Response(friends_data, status=status.HTTP_200_OK)

class CancelFriendRequestView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, friendship_id):
        friendship = get_object_or_404(Friendship, id=friendship_id, from_user=request.user, status='P')
        friendship.delete()
        # Notification.objects.create(
        #     recipient=friendship.to_user,
        #     sender=request.user,
        #     action='FRIEND_REQUEST_CANCELED',
        # )
        return Response({'message': 'Friend request canceled'}, status=status.HTTP_200_OK)

class RemoveFriendView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, friendship_id):
        friendship = get_object_or_404(
            Friendship,
            Q(from_user=request.user) | Q(to_user=request.user),
            id=friendship_id,
            status='A'
        )
        other_user = friendship.to_user if friendship.from_user == request.user else friendship.from_user
        friendship.delete()

        # Create notification
        # Notification.objects.create(
        #     recipient=other_user,
        #     sender=request.user,
        #     action='FRIEND_REMOVED',
        # )
        return Response({'message': 'Friend removed successfully'}, status=status.HTTP_200_OK)

class BlockUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        blocker = request.user
        blocked = get_object_or_404(User, username=username)

        if Block.objects.filter(blocker=blocker, blocked=blocked).exists():
            return Response({"error": "User is already blocked"}, status=status.HTTP_400_BAD_REQUEST)

        Block.objects.create(blocker=blocker, blocked=blocked)
        Friendship.objects.filter(
            (models.Q(from_user=blocker, to_user=blocked) | models.Q(from_user=blocked, to_user=blocker))
        ).delete()
        
        return Response({"message": "User blocked successfully"}, status=status.HTTP_200_OK)

class UnblockUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        blocker = request.user
        blocked = get_object_or_404(User, username=username)

        block_instance = Block.objects.filter(blocker=blocker, blocked=blocked).first()
        if not block_instance:
            return Response({"error": "User is not blocked"}, status=status.HTTP_400_BAD_REQUEST)

        block_instance.delete()
        return Response({"message": "User unblocked successfully"}, status=status.HTTP_200_OK)

class BlockedUsersListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Retrieve all blocks where the current user is the blocker
        blocked_users = Block.objects.filter(blocker=request.user)
        serializer = BlockedUserSerializer(blocked_users, many=True)
        return Response(serializer.data)

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
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)

        notifications = Notification.objects.filter(recipient=request.user, is_read=False)
        data = [
            {
                'id': notification.id,
                'sender': notification.sender.username,
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
