from rest_framework import serializers
from chat.models import Messages, Conversations
from authentication.models import CustomUser as User

class   ChatOverviewSerializer(serializers.ModelSerializer):
    conversation = serializers.SerializerMethodField()
    currentUser = serializers.SerializerMethodField()
    userImage = serializers.SerializerMethodField()

    class   Meta:
        model = Conversations
        fields = ['id', 'conversation', 'currentUser', 'userImage']
    
    def get_conversation(self, conversation):
        selfuser = self.context['request'].user
        if selfuser.username == conversation.user1_id.username:
            return conversation.user2_id.username
        else:
            return conversation.user1_id.username

    def get_currentUser(self, conversation):
        selfuser = self.context['request'].user
        return selfuser.id
    
    def get_userImage(self, conversation):
        selfuser = self.context['request'].user
        if selfuser.username == conversation.user1_id.username:
            return conversation.user2_id.image_url
        else:
            return conversation.user1_id.image_url

class   ConversationDetailSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()
    userImage = serializers.SerializerMethodField()

    class   Meta:
        model = Messages
        fields = ['sender', 'content', 'timestamp', 'sender_id', 'userImage']

    def get_sender(self, messages):
        return messages.sender_id.username
    
    def get_userImage(self, messages):
        selfuser = self.context['request'].user
        return selfuser.image_url
    
class   CreateConversationSerializer(serializers.ModelSerializer):

    class   Meta:
        model = Conversations
        fields = ['user1_id', 'user2_id', 'id']

class   ListUsersSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class   Meta:
        model = User
        fields = ['username', 'id', 'image_url']

    def get_image_url(self, user):
        return user.image_url
