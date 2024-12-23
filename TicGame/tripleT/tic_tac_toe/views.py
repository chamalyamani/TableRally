from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.template import loader

from rest_framework.views import APIView
from rest_framework.response import Response
from .models import games
from .serializers import gamesSerializer

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
    def get(self, request, user_win_id):
        game_records = games.objects.filter(win_id=user_win_id)
        if not game_records.exists():
            return Response({"message": "No games found for this user ID"}, status=404)
        
        serializer = gamesSerializer(game_records, many=True)
        return Response(serializer.data)