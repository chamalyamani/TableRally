# api/serializers.py
from django.conf import settings
from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth.hashers import make_password


class RegistrationSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password', 'confirm_password', 'image_url', 'first_name', 'last_name']
        
    def validate(self, data):
        # Validate username
        username = data.get('username')
        if not username:
            raise serializers.ValidationError({"username": "Username is required."})
        if CustomUser.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError({"username": "Username already exists. Please choose another."})
        if not username.isalpha():
            raise serializers.ValidationError({"username": "Username must only contain letters."})
        if len(username) > 50:
            raise serializers.ValidationError({"username": "Username must not exceed 50 characters."})
        
        # Validate email
        email = data.get('email')
        if not email:
            raise serializers.ValidationError({"email": "Email is required."})
        if CustomUser.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({"email": "Email is already in use."})

        # Validate passwords
        password = data.get('password')
        confirm_password = data.get('confirm_password')
        if not password:
            raise serializers.ValidationError({"password": "Password is required."})
        if not confirm_password:
            raise serializers.ValidationError({"confirm_password": "Confirmed password is required."})
        if len(password) < 8 :
            raise serializers.ValidationError({"password": "Password should at least have 8 characters!"})
        if password.isdigit() :
            raise serializers.ValidationError({"password": "Password shouldn't contain only numbers!"})
        if password != confirm_password:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        # Validate firstname
        first_name = data.get('first_name', '').strip()
        if not first_name:
            raise serializers.ValidationError({"first_name": "First name is required."})
        if not first_name.isalpha():
            raise serializers.ValidationError({"first_name": "First name must only contain letters."})
        if len(first_name) > 50:
            raise serializers.ValidationError({"first_name": "First name must not exceed 50 characters."})

        # Validate lastname
        last_name = data.get('last_name', '').strip()
        if not last_name:
            raise serializers.ValidationError({"last_name": "Last name is required."})
        if not last_name.isalpha():
            raise serializers.ValidationError({"last_name": "Last name must only contain letters."})
        if len(last_name) > 50:
            raise serializers.ValidationError({"last_name": "Last name must not exceed 50 characters."})
        
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        user.first_name = validated_data.get('first_name', '')
        user.last_name = validated_data.get('last_name', '') 
        user.image = validated_data.get('image', None)
        user.save()
        return user

    # def get_image_url(self, obj):
    #     request = self.context.get('request')
    #     return request.build_absolute_uri(obj.image_url)