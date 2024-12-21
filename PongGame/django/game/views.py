from django.shortcuts import render
from django.http import JsonResponse

def my_view(request):
    return JsonResponse({'message' : 'hello from HTTP'})
# Create your views here.
