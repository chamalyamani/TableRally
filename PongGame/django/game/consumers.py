import json
from channels.generic.websocket import AsyncWebsocketConsumer
from queue import Queue
import time
import asyncio
from .models import Score  # Import your model
from asgiref.sync import sync_to_async
from authentication.models import CustomUser as User
from channels.db import database_sync_to_async

waiting_list = Queue()
player_wait_for_group = []
main_player = []
groups = []
GamePlay = []
second_player = False
LiveGameArr = []
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

# class ChatConsumer(AsyncWebsocketConsumer):
#     def __init__(self):
#         super().__init__()
#         self.index = x
#         self.info = None
#         self.BallStepX = 5
#         self.BallStepY = 5
#     async def connect(self):
#         channel_counter.put(self.channel_name)
#         self.group_name = CreateGameName()
#         await self.channel_layer.group_add(
#             self.group_name,
#             self.channel_name
#         )
#         await self.accept()
#         # print(channel_counter.qsize())
#         if channel_counter.qsize() == 2:
#             Game.append([channel_counter.get(), channel_counter.get()])
#             await self.channel_layer.group_send(
#             self.group_name,
#             {
#                 "type": "chat_message",
#                 "message": self.group_name,
#                 "TITLE" : "start",
#             }
#         )
#         else :
#             await self.channel_layer.group_send(
#             self.group_name,
#             {
#                 "type" : "chat_message", 
#                 "message" : self.group_name,
#                 "TITLE" : "wait",
#             }
#         )

#     async def disconnect(self,code):
#         # channel_counter.pop()
#         pass

#     async def receive(self, text_data):
#         game = json.loads(text_data)
#         if Game :
#             if game["TITLE"] == "move_ball" and Game[self.index][0] == self.channel_name:
#                 print("ballY = ", self.info["ball"]["y"], "player2Y = " ,self.info["player2"]["y"] )
#                 # time.sleep(1)
#                 if self.info["ball"]["x"] + self.BallStepX * 4 > self.info["canvas_width"] :
#                     if self.info["ball"]["y"] > self.info["player2"]["y"] and self.info["ball"]["y"] < self.info["player2"]["y"] + self.info["paddleHeight"]:
#                         self.BallStepX *= -1
#                     else :
#                         print("game over")
#                 if self.info["ball"]["x"] + self.BallStepX * 3 <= 0 :
#                     self.BallStepX *= -1
#                 self.info["ball"]["x"] += self.BallStepX
#                 if self.info["ball"]["y"] + self.BallStepY * 3 > self.info["canvas_height"] or self.info["ball"]["y"] + self.BallStepY * 1 <= 0 :
#                     self.BallStepY *= -1
#                 self.info["ball"]["y"] += self.BallStepY
#                 await self.channel_layer.group_send(
#                 self.group_name,
#                 {
#                     "type" : "move_ball",
#                     "group" : self.group_name,
#                     "TITLE" : "move_ball",
#                     "ballx" : self.info["ball"]["x"],
#                     "bally" : self.info["ball"]["y"] 
#                 }
#                 )
#             elif game["TITLE"] == "info":
#                 self.info = game
#             elif game["TITLE"] == "move_player":
#                 if "down" == game["player_direction"]:
#                     step = 5
#                 else :
#                     step = -5
#                 if Game[self.index][0] == self.channel_name:
#                     if step == 5:
#                         if self.info["player1"]["y"] < self.info["canvas_height"]- self.info["paddleHeight"]:
#                             self.info["player1"]["y"] += step
#                     else:
#                         if self.info["player1"]["y"] > 0:
#                             self.info["player1"]["y"] += step
#                     position = self.info["player1"]["y"] 
#                     player = "player1"
#                 else :
#                     if step == 5:
#                         if self.info["player2"]["y"] < self.info["canvas_height"] - self.info["paddleHeight"]:
#                             self.info["player2"]["y"] += step
#                     else:
#                         if self.info["player2"]["y"] > 0:
#                             self.info["player2"]["y"] += step
#                     position = self.info["player2"]["y"] 
#                     player = "playe2"
#                 await self.channel_layer.group_send(
#                 self.group_name,
#                 {
#                     "type" : "move_player",
#                     "group" : self.group_name,
#                     "TITLE" : "move_player",
#                     "player" : player,
#                     "position" : position,
#                 }
#                 )
#                 # print("-/-/-/-/-/-/", self.info["ball"]["y"], self.info["player2"]["y"])
                
    
#     async def move_player(self, event):
#         TITLE = event["TITLE"]
#         PLAYER = event["player"]
#         POSTION = event["position"]
#         await self.send(text_data=json.dumps({"TITLE": TITLE, "player" : PLAYER , "position" : POSTION}))
    
#     async def chat_message(self, event):
#         message = event["message"]
#         TITLE = event["TITLE"]

#         await self.send(text_data=json.dumps({"TITLE": TITLE,
#         "message" : message}))

#     async def move_ball(self, event) :
#         ballX = event["ballx"]
#         ballY = event["bally"]
#         TITLE =  event["TITLE"]

#         await self.send(text_data=json.dumps({ "ballX" : ballX, "ballY" : ballY, "TITLE" : TITLE}))










import time

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
        
        user = await database_sync_to_async(User.objects.get)(id=7)
        print('00000000000000000')
        print(user.id)
        await self.accept()
        await self.add_to_waiting_list()


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
                    print("pass!")
        await asyncio.sleep(1)
        await self.channel_layer.group_send(
        self.group_name,
        {
            "type" : "start",
            "group" : self.group_name,
            "TITLE" : "start",
        }
        )

        task = asyncio.create_task(self.GameLoop(index))
        



    async def disconnect(self, code):
        pass

    async def start(self, event):
        TITLE = event["TITLE"]

        await self.send(text_data=json.dumps({"TITLE": TITLE}))

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
