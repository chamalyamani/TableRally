# api/serializers.py
from django.conf import settings
from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth.hashers import make_password


class CustomUserSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password', 'confirm_password', 'image_url']
        

    def validate(self, data):
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        confirm_password = data.get('confirm_password')
        if not username:
            raise serializers.ValidationError({"username": "Username is required."})
        if CustomUser.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError({"username": "Username already exists. Please choose another."})
        if not email:
            raise serializers.ValidationError({"email": "Email is required."})
        if CustomUser.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({"email": "Email already in use. Please use a different email address."})
        if not password:
            raise serializers.ValidationError({"password": "Password is required."})
        if not confirm_password:
            raise serializers.ValidationError({"confirm_password": "Confirm password is required."})
        if password != confirm_password:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        # Hash the password
        data['password'] = make_password(password)
        data.pop('confirm_password', None)

        return data
    
    def validate_username(self, value):
        if CustomUser.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username already exists. Please choose another.")
        return value

    def validate_email(self, value):
        if CustomUser.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already in use. Please use a different email address.")
        return value

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(settings.MEDIA_URL + obj.image.name)
        return request.build_absolute_uri(settings.MEDIA_URL + 'Default-welcomer.png')