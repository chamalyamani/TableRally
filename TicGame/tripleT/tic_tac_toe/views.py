
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import games
from .serializers import gamesSerializer
from django.db.models import Q


class gamesByWinId(APIView):
    def get(self, request):
            # user_id = request.user
            # print("________________",user_id)
        game_records = games.objects.filter(
            Q(p1id=request.user.id) | Q(p2id=request.user.id)
        )
        serializer = gamesSerializer(game_records, many=True, context={'request': request})
        return Response(serializer.data)
        