from rest_framework import serializers
from .models import games

class gamesSerializer(serializers.ModelSerializer):
    class Meta:
        model = games
        fields = '__all__'