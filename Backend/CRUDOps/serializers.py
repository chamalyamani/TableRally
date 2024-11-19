# api/serializers.py
from rest_framework import serializers
from authentication.models import CustomUser

class UserSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'image']  # Add 'image' or other fields as needed

