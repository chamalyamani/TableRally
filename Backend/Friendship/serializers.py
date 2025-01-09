# serializers.py

from rest_framework import serializers
from authentication.models import CustomUser
from .models import Friendship
# from .models import Block

from django.contrib.auth import get_user_model


class FriendshipSerializer(serializers.ModelSerializer):
    from_user = serializers.ReadOnlyField(source='from_user.username')
    to_user = serializers.ReadOnlyField(source='to_user.username')

    class Meta:
        model = Friendship
        fields = ['id', 'from_user', 'to_user', 'status', 'created_at']