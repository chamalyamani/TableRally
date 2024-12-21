# myapp/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('myview/', views.my_view, name='my_view'),
]
