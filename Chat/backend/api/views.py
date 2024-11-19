from django.shortcuts import render
from rest_framework.views import APIView
from chat.models import Messages, Conversations
from .serializers import ChatOverviewSerializer, ConversationDetailSerializer, CreateConversationSerializer
# from django.contrib.auth.models import User
from authentication.models import CustomUser as User
from rest_framework.response import Response
from django.db.models import Q
# from rest_framework.permissions import IsAuthenticated
# from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import status

class   ChatOverview(APIView):
    # permission_classes = [IsAuthenticated]
    print('lksdjljflkjsdlfjlajsdlf')
    # permission_classes = [JWTAuthentication]
    def get(self, request):
        conversations = Conversations.objects.filter(
            Q(user1_id=request.user.id) | Q(user2_id=request.user.id)
            )
        serializeChat = ChatOverviewSerializer(conversations, many=True, context={'request': request})
        data = {
            'conversations': serializeChat.data
            # Add conversations images
        }
        return Response(data)


class   ConversationDetail(APIView):
    def get(self, request, id):
        try:
            display_name = {}
            conversation = Conversations.objects.get(id=id)
            if request.user.id == conversation.user1_id.id:
                display_name = conversation.user2_id.get_full_name()
            elif request.user.id == conversation.user2_id.id:
                display_name = conversation.user1_id.get_full_name()
            else:
                raise conversation.DoesNotExist()
            messages = Messages.objects.filter(conversation_id=id).order_by('timestamp')
            serializeConv = ConversationDetailSerializer(messages, many=True)
            data = {
                'display_name': display_name,
                'messages' : serializeConv.data
                # Add conversations images
            }
            return Response(data)
        except Conversations.DoesNotExist:
            return Response({'error': 'Conversation Not Found'}, status=status.HTTP_404_NOT_FOUND)

class   CreateConversation(APIView):
    # permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.id != request.data.get('user1_id') \
            and request.user.id != request.data.get('user2_id'): # Check if user is in its friend list
            return Response({'error': 'You do not have permission to create this conversation.'}, status=status.HTTP_403_FORBIDDEN)
        SerializedUsers = CreateConversationSerializer(data=request.data)
        if SerializedUsers.is_valid():
            SerializedUsers.save()
            return Response(SerializedUsers.data, status=status.HTTP_201_CREATED)
        return Response(SerializedUsers.errors, status=status.HTTP_400_BAD_REQUEST)
