# api/serializers.py
from rest_framework import serializers
from authentication.models import CustomUser

class UserSearchSerializer(serializers.ModelSerializer):
    image_url = serializers.ReadOnlyField()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'image_url']


