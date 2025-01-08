from rest_framework import serializers
from .models import games

# class gamesSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = games
#         fields = '__all__'

class gamesSerializer(serializers.ModelSerializer):
    winner_or_loser = serializers.SerializerMethodField()
    w_username = serializers.SerializerMethodField()
    w_image = serializers.SerializerMethodField()
    l_username = serializers.SerializerMethodField()
    l_image = serializers.SerializerMethodField()

    class Meta:
        model = games
        fields = [
            'winner_boards',
            'num_of_games',
            'game_type_db',
            'winner_or_loser',
            'w_username',
            'w_image',
            'l_username',
            'l_image',
            'l_score'
            ]

    def get_winner_or_loser(self, obj):
        request_user = self.context.get('request').user
        if obj.winid == request_user:
            return 'W'
        elif obj.p1id == request_user or obj.p2id == request_user:
            return 'L'
        return 'Not a participant'
    # protections  
    # if obj.p1id else None
    #  if obj.p1id and hasattr(obj.p1id, 'image_url') else None
    #  if obj.p2id else None
    #  if obj.p2id and hasattr(obj.p2id, 'image_url') else None
    def get_l_username(self, obj):
        if obj.p1id == obj.winid:
            return obj.p2id.username
        else:
            return obj.p1id.username
        # return obj.p1id.username

    def get_l_image(self, obj):
        if obj.p1id == obj.winid:
            return obj.p2id.image_url
        else:
            return obj.p1id.image_url
        # return obj.p1id.image_url

    def get_w_username(self, obj):
        if obj.p1id == obj.winid:
            return obj.p1id.username
        else:
            return obj.p2id.username
        # return obj.p2id.username

    def get_w_image(self, obj):
        if obj.p1id == obj.winid:
            return obj.p1id.image_url
        else:
            return obj.p2id.image_url
        # return obj.p2id.image_url