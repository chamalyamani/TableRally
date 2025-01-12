import json
from channels.generic.websocket import AsyncWebsocketConsumer
from authentication.models import CustomUser as User
from channels.db import database_sync_to_async

class   NotificationsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        self.user_notification_id = f'user_notification_{self.user.id}'

        if not self.user.is_authenticated:
            print ("USER is NOT authenticated")
            await self.close()
        else:
            await self.channel_layer.group_add(self.user_notification_id, self.channel_name)
            await self.accept()
    
    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            self.user_notification_id, self.channel_name,
        )

    async def receive(self, text_data):
        text_data_dic = json.loads(text_data)

        if text_data_dic['type'] == 'message_notification':
            receiver_id = text_data_dic['receiver_id']
            await self.channel_layer.group_send(
                f'user_notification_{receiver_id}',
                {
                    'type': 'send_message_notification',
                    'receiver': receiver_id,
                }
            )

        elif text_data_dic['type'] == 'game_request_notification':
            receiver_id = text_data_dic['receiver_username']
            try:
                receiver_id = await database_sync_to_async(User.objects.get)(username=receiver_id)
            except User.DoesNotExist:
                print("User does not exist")
                await self.close()
            sender_id = text_data_dic['sender_id']

            await self.channel_layer.group_send(
                f'user_notification_{receiver_id.id}',
                {
                    'type': 'game_request_notification',
                    'receiver': receiver_id.id,
                    'sender': sender_id,
                    'username': self.user.username,
                    'gameType': text_data_dic['gameType']
                }
            )
        elif text_data_dic['type'] == 'game_resp':
            receiver_id = text_data_dic['receiver_id']
            sender_id = text_data_dic['sender_id']
            await self.channel_layer.group_send(
                f'user_notification_{receiver_id}',
               {
                    'type': 'game_resp',
                    'receiver': receiver_id,
                    'sender': sender_id,
                    'gameType': text_data_dic['gameType']
                }
            )

    async def send_message_notification(self, event):
        await self.send(text_data=json.dumps(
            {
                'type': 'send_message_notification',
                'receiver': event['receiver']
            }
        ))

    async def game_request_notification(self, event):
        await self.send(text_data=json.dumps(
            {
                'type': 'game_request_notification',
                'receiver': event['receiver'],
                'sender': event['sender'],
                'username': event['username'],
                'gameType': event['gameType']
            }
        ))

    async def game_resp(self, event):
        await self.send(text_data=json.dumps(
            {
                'type': 'game_resp',
                'receiver': event['receiver'],
                'sender': event['sender'],
                'gameType': event['gameType']
            }
        ))