from django.urls import path, include
from .views import ChatOverview, ConversationDetail, CreateConversation, ListUsers

urlpatterns = [
    # path('auth/', include('djoser.urls')),
    # path('auth/', include('djoser.urls.jwt')),
    # path('auth/', include('djoser.urls')),
    # path('auth/', include('djoser.urls.authtoken')),
    path('get-access-token/', include('djoser.urls.authtoken')),

    path('chat/', ChatOverview.as_view()),
    path('chat/<int:id>/', ConversationDetail.as_view()),
    path('create-conv/', CreateConversation.as_view()),
    path('list-users/', ListUsers.as_view()),
    # path('delete-conv/', DeleteConversation.as_view()),
    # path('block-user/<int:username>/', BlockUser),
]
