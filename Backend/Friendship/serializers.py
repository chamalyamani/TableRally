# serializers.py

from rest_framework import serializers
from authentication.models import CustomUser
from .models import Friendship, Block
from django.contrib.auth import get_user_model


class FriendshipSerializer(serializers.ModelSerializer):
    from_user = serializers.ReadOnlyField(source='from_user.username')
    to_user = serializers.ReadOnlyField(source='to_user.username')

    class Meta:
        model = Friendship
        fields = ['id', 'from_user', 'to_user', 'status', 'created_at']

class BlockedUserSerializer(serializers.ModelSerializer):
    blocked_username = serializers.CharField(source='blocked.username')
    blocked_email = serializers.EmailField(source='blocked.email')
    blocked_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Block
        fields = ['blocked_username', 'blocked_email', 'blocked_image_url']

    def get_blocked_image_url(self, obj):
        return obj.blocked.image_url 


# class UserProfileSerializer(serializers.ModelSerializer):
#     is_friend = serializers.SerializerMethodField()
#     has_sent_request = serializers.SerializerMethodField()
#     has_received_request = serializers.SerializerMethodField()
#     is_blocked_by_user = serializers.SerializerMethodField()
#     is_blocked_by_other = serializers.SerializerMethodField()

#     class Meta:
#         model = CustomUser
#         fields = ['username', 'email', 'image_url', 'is_friend', 'has_sent_request', 'has_received_request', 'is_blocked_by_user', 'is_blocked_by_other']

#     def get_is_friend(self, obj):
#         request_user = self.context['request'].user
#         return Friendship.objects.filter(
#             (models.Q(from_user=request_user, to_user=obj) | models.Q(from_user=obj, to_user=request_user)),
#             status='A'
#         ).exists()

#     def get_has_sent_request(self, obj):
#         request_user = self.context['request'].user
#         return Friendship.objects.filter(from_user=request_user, to_user=obj, status='P').exists()

#     def get_has_received_request(self, obj):
#         request_user = self.context['request'].user
#         return Friendship.objects.filter(from_user=obj, to_user=request_user, status='P').exists()

#     def get_is_blocked_by_user(self, obj):
#         request_user = self.context['request'].user
#         return Block.objects.filter(blocker=request_user, blocked=obj).exists()

#     def get_is_blocked_by_other(self, obj):
#         request_user = self.context['request'].user
#         return Block.objects.filter(blocker=obj, blocked=request_user).exists()