import json
from channels.generic.websocket import AsyncWebsocketConsumer
from queue import Queue
import time
import asyncio
from .models import Score  # Import your model
from asgiref.sync import sync_to_async
from authentication.models import CustomUser as User
from channels.db import database_sync_to_async
import time

waiting_list = Queue()
player_wait_for_group = []
main_player = []
groups = []
GamePlay = []
second_player = False
LiveGameArr = []
acepted_users = []
x = 0

def CreateGameName():
    global second_player, x
    if second_player == False :
        name =  "pair" + str(x)
        GamePlay.append(name)
        second_player = True
        return GamePlay[x]
    else :
        second_player = False
        x += 1
        return GamePlay[x - 1]


class Player:
    def __init__(self):
        self.y = 150
        self.speed = 5
    def Up(self):
        if self.y > 0:
            self.y -= self.speed

    def Down(self):
        if self.y < 280:
            self.y += self.speed

class Ball:
    def __init__(self):
        self.x = 350
        self.y = 150
        self.speed = 5
    def IncrementX(self, stepx):
        self.x +=  stepx * self.speed
    def IncrementY(self,stepy):
        self.y += stepy * self.speed

class LiveGame:
    def __init__(self):
        self.player1 = Player()
        self.player2 = Player()
        self.ball = Ball()
        self.score1 = 0
        self.score2 = 0
        self.stepx = 1
        self.stepy = 1
    def RunGame(self):
        if self.ball.x >= 680 and self.ball.y > self.player2.y  and self.ball.y < self.player2.y + 65:
            self.stepx *= -1
        elif self.ball.x  > 680 : 
            self.score2 += 1 
            self.ball.x = 350
            self.ball.y = 150
            self.player1.y = 150 
            self.player2.y = 150 
            return
        if self.ball.y > 350:
            self.stepy *= - 1
        if self.ball.x <= 15 and self.ball.y > self.player1.y - 5 and self.ball.y < self.player1.y + 65:
            self.stepx *= -1
        elif self.ball.x < 15:
            self.score1 += 1
            self.ball.x = 350
            self.ball.y = 150
            self.player1.y = 150 
            self.player2.y = 150 
            return
        if self.ball.y < 0:
            self.stepy *= - 1
        self.ball.IncrementX(self.stepx)
        self.ball.IncrementY(self.stepy)




class ChatConsumer(AsyncWebsocketConsumer):

    def __init__(self):
        super().__init__()
        self.player1 = None
        self.player2 = None
    
    async def connect(self):
        
        self.user = self.scope['user']
        print(">>>>>>>>", self.user.external_image_url)
        if (self.user in acepted_users) == False:
            print("user self == ",self.user)
            await self.accept()
            acepted_users.append(self.user)
            await self.send(text_data=json.dumps({"TITLE": "wait", "image": self.user.external_image_url}))
            await self.add_to_waiting_list()
        else :
            print("alredy exist ",self.user)
            print(acepted_users)
            await self.close()
            return 
        


    async def add_to_waiting_list(self):
        waiting_list.put(self.channel_name)
        await self.match_players()
        
    async def match_players(self):
        index = 0
        while True:
            if waiting_list.qsize() == 2:
                self.player1 = waiting_list.get()
                self.player2 = waiting_list.get()
                if self.channel_name == self.player1:
                    self.game = LiveGame()
                    self.group_name = CreateGameName()
                    await self.channel_layer.group_add(
                        self.group_name,
                        self.channel_name
                    )
                    player_wait_for_group.append(self.player2)
                    index = player_wait_for_group.index(self.player1)
                    main_player.append(self.channel_name)
                    LiveGameArr.append(self.game)
                    groups.append(CreateGameName())
                else:
                    self.group_name = CreateGameName()
                    self.game = LiveGame()
                    await self.channel_layer.group_add(
                        self.group_name,
                        self.channel_name
                    )
                    player_wait_for_group.append(self.player1)
                    index = player_wait_for_group.index(self.player1)
                    main_player.append(self.channel_name)
                    groups.append(CreateGameName())
                    LiveGameArr.append(self.game)

                break
            else:
                await asyncio.sleep(0.25)
                try:
                    index = player_wait_for_group.index(self.channel_name)
                    self.player1 = self.channel_name
                    self.player2 = main_player[index]
                    if index > -1:
                        self.group_name = groups[index]
                        self.game = LiveGameArr[index]
                        await self.channel_layer.group_add(
                            self.group_name,
                            self.channel_name
                        )
                        break
                except ValueError:
                    pass
        await asyncio.sleep(1)
        await self.channel_layer.group_send(
        self.group_name,
        {
            "type" : "start",
            "group" : self.group_name,
            "TITLE" : "start",
            "player2_image" : self.user.external_image_url
            
        }
        )

        task = asyncio.create_task(self.GameLoop(index))
        



    async def disconnect(self, code):
        # player_wait_for_group.remove(self.player2)
        # main_player.remove(self.channel_name)
        # LiveGameArr.remove(self.game)
        # acepted_users.remove(self.user)
        pass

    async def start(self, event):
        TITLE = event["TITLE"]

        await self.send(text_data=json.dumps({"TITLE": TITLE, "image2": event["player2_image"]}))

    async def loopsend(self, event):
        TITLE = event["TITLE"]
        ballx = event["ballx"]
        bally = event["bally"]
        player1 = event["player1"]
        player2 = event["player2"]
        score1 = event["score1"]
        score2 = event["score2"]

        await self.send(text_data=json.dumps({"TITLE": TITLE,
        "ballx" : ballx,
        "bally" : bally,
        "player1" : player1,
        "player2": player2,
        "score1" : score1,
        "score2" : score2}))

    async def GameLoop(self, index):
        while True:
            if self.channel_name == player_wait_for_group[index]:
                self.game.RunGame()
                await self.channel_layer.group_send(
                self.group_name,
                {
                    "type" : "loopsend",
                    "group" : self.group_name,
                    "TITLE" : "gameloop",
                    "ballx" : self.game.ball.x,
                    "bally" : self.game.ball.y,
                    "player1" : self.game.player1.y,
                    "player2" : self.game.player2.y,
                    "score1" : self.game.score1,
                    "score2" : self.game.score2,
                }
                )
            await asyncio.sleep(0.03)
            if self.game.score1  == 3 or self.game.score2 == 3:
                if self.channel_name == self.player1:
                    await self.create_score_entry()
                break
    @sync_to_async
    def create_score_entry(self):
        Score.objects.create(
            user1_id=self.channel_name,
            user2_id=self.channel_name,
            score1=self.game.score1,
            score2= self.game.score2
        )
        

    async def receive(self, text_data):
        game = json.loads(text_data)
        if game["TITLE"] == "move_player":
            if game["player_direction"] == "up":
                if self.channel_name == self.player1:
                    self.game.player1.Up()
                else :
                    self.game.player2.Up()
            else :
                if self.channel_name == self.player1:
                    self.game.player1.Down()
                else:
                    self.game.player2.Down()
