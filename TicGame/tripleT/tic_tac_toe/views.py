from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.template import loader

from rest_framework.views import APIView
from rest_framework.response import Response
from .models import games
from .serializers import gamesSerializer
from django.db.models import Q
import json

def index(request):
    temp = loader.get_template("tic_tac_toe/index.html")
    return HttpResponse(temp.render({}, request))
# Create your views here.
def home(request):
    if request.method == "POST":
        data = json.loads(request.body)
        print(data.get('action'))
        return JsonResponse({"message":"hello world"})
        # print("here")
    else:
        temp = loader.get_template("tic_tac_toe/home.html")
        return HttpResponse(temp.render({}, request))
    
class gamesByWinId(APIView):
    def get(self, request):
            # user_id = request.user
            # print("________________",user_id)
        game_records = games.objects.filter(
            Q(p1id=request.user.id) | Q(p2id=request.user.id)
        )
        serializer = gamesSerializer(game_records, many=True, context={'request': request})
        return Response(serializer.data)
        