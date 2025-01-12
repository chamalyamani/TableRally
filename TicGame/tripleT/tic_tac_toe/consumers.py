from channels.generic.websocket import AsyncWebsocketConsumer

from collections import defaultdict

from .models import games
from asgiref.sync import sync_to_async
#import the model games
#this for probably syncronizing server with database
from channels.db import database_sync_to_async
from authentication.models import CustomUser as User
import json

import random, time
from .consu_helper import *


#read me :
# I will need to create a list of all the communication strings for parsing
# 

def switchturnUpdtboardAddmoves(p1,p2,idx,is_x_turn):
    if( p1.ina_game[0] == "ft_classic" and ( idx > 8 or idx < 0 ) ):
        return 1
    elif( p1.ina_game[0] == "ft4" and ( idx > 24 or idx < 0 ) ):
        return 1
    if( p1.board[idx] != '.' or p2.board[idx] != '.' ):
        return 1
    if is_x_turn:
        p1.board[idx] = X_CHAR
        p2.board[idx] = X_CHAR
    else:
        p1.board[idx] = O_CHAR
        p2.board[idx] = O_CHAR
    p1.turn, p2.turn = (T_OFF, T_ON) if is_x_turn else (T_ON, T_OFF)
    p1.moves  += 1 if is_x_turn else 0
    p2.moves += 0 if is_x_turn else 1
    return 0




class test(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.user = self.scope["user"]
            if not self.user.is_authenticated:
                await self.close(code=4001)
                return
            await self.accept()
            print("ACCEPTED CNX FOR USER ID : ",self.user.id, 
                  "userName : ", self.user.username)
        except Exception as e:
            print("EXCEPTION : in connect", e)
            await self.close(code=4001)

    async def disconnect(self, code):
        try:
            print("this is deco code : ", code)
            if code == 4005:
                return

            grps_arr = [grp_m, grp_m3, grp_m5, grp_m7, ft4_m, ft4_m3, ft4_m5, ft4_m7, friends_grp]
            for grp in grps_arr:
                for item in grp:
                    if self.user.id in item:
                        grp.remove(item)
                        break

            guId = player_game_map.get(self.user.id, None)
            if guId == None:
                Exception("No game found for this user")
            players = game_box.get(guId, None)
            if players == None:
                Exception("No players found for this game")
            
            if code == 1006 or code == 1001 or code == None:
                idxHim = 1 if players[0].user_id == self.user.id else 0
                await self.channel_layer.send(players[idxHim].channel_name, {
                    "type": "error_handle",
                    "code": 1,
                    "msg": "Your opponent has been disconnected unexpectedly."
                })
            # Remove both players from player_game_map
            for player in players:
                player_id = player.user_id
                if player_id in player_game_map:
                    del player_game_map[player_id]

            # Remove the game from game_box
            if guId in game_box:
                del game_box[guId]
        except Exception as e:
            print("EXCEPTION : in disconnect", e)


    async def handle_leaveGame(self, players):
        leave_message = {
        'type': 'error_handle',
        'code': 1,
        'msg' : "Your opponent has left the game.",
        }
        if ( players[0].channel_name == self.channel_name ):
            await self.channel_layer.send(players[1].channel_name, leave_message)
        else:
            await self.channel_layer.send(players[0].channel_name, leave_message)

        await self.close(code=4011)

    async def resetMoves(self, players):
        players[0].moves = 0
        players[1].moves = 0
    async def dbInit(self, p1, p2, game_type):
        """Create a game record and save all necessary data with exception handling."""

        from asgiref.sync import sync_to_async
        from .models import games
        from django.core.exceptions import ObjectDoesNotExist

        try:
            # Retrieve users
            p1_user = await sync_to_async(User.objects.get)(id=p1.user_id)
            p2_user = await sync_to_async(User.objects.get)(id=p2.user_id)
        except ObjectDoesNotExist as e:
            return

        # Determine the winner
        winner          = p1_user       if len(p1.winBoards) > len(p2.winBoards) else p2_user
        winner_boards   = p1.winBoards  if len(p1.winBoards) > len(p2.winBoards) else p2.winBoards
        loss_score = len(p1.winBoards) if len(p1.winBoards) < len(p2.winBoards) else len(p2.winBoards)
        try:
            # Create the game record
            game = await sync_to_async(games.objects.create)(
                game_type_db    = game_type,
                p1id            = p1_user,
                p2id            = p2_user,
                winid           = winner,
                winner_boards   = winner_boards,
                num_of_games    = p1.nbGames,
                l_score         = loss_score,
            )
        except Exception as e:
            print(f"Error creating game record: {e}")
        
    async def drawAnnounce(self, pf, ps):
        pf.re_setup["message"] = ps.re_setup["message"] = 2
        await self.initGame([pf, ps], False)

  
    async def checkft4Win(self, pf, ps, idx, bSize, winCount):
        board_2d = [pf.board[i:i + bSize] for i in range(0, len(pf.board), bSize)]

        row = idx // bSize
        col = idx % bSize

        # Define all possible directions to check
        directions = [
            [(0, 1), (0, -1)],  # Horizontal
            [(1, 0), (-1, 0)],  # Vertical
            [(1, 1), (-1, -1)], # Diagonal 1
            [(1, -1), (-1, 1)]  # Diagonal 2
        ]

        for direction in directions:
            count = 1  # Include the starting position
            winComboArr = [idx]

            for dr, dc in direction:
                r, c = row, col
                while True:
                    # Move in the current direction
                    r += dr
                    c += dc

                    # Stop if out of bounds
                    if r < 0 or r >= bSize or c < 0 or c >= bSize:
                        break

                    # Stop if the character doesn't match
                    if board_2d[r][c] != pf.board[idx]:
                        break

                    # Increment the count if it matches
                    count += 1
                    winComboArr.append(r * bSize + c)

                    # If we've reached the win condition, handle the win
                    if count == winCount:
                        winner_char = pf.board[idx]
                        await self.handle_win(pf, ps, winner_char, combo=winComboArr)
                        return 1

        return 0


    async def handle_win(self, pf, ps, winner_char, combo=None):
        """
        Handles the win scenario, updates player stats, sends results,
        and manages game re-initialization.
        """
        bts = pf.board
        bts_list = list(bts)

        # Loop through the indexes in combo and make them uppercase
        for idx in combo:
            if 0 <= idx < len(bts):  # Ensure index is valid
                bts_list[idx] = bts_list[idx].upper()

        # Join the list back into a string
        bts = ''.join(bts_list)
        if winner_char == pf.char:
            pf.wins += 1
            pf.winBoards.append(bts)
        else:
            ps.wins += 1
            ps.winBoards.append(bts)

        # Check if the game ends
        if pf.wins == pf.ina_game[1] or ps.wins == ps.ina_game[1]:
            pf.res = "You won the game!" if winner_char == pf.char else "You lost the game!"
            ps.res = "You won the game!" if winner_char == ps.char else "You lost the game!"

            pf.gameResult.update({
                "opwins": ps.wins,
                "message": 1 if winner_char == pf.char else 0,
                "combo": combo,
                "nbGames": pf.nbGames
            })
            ps.gameResult.update({
                "opwins": pf.wins,
                "message": 1 if winner_char == ps.char else 0,
                "combo": combo,
                "nbGames": ps.nbGames
            })

            # Save the final state of the game in the database
            await self.dbInit(pf, ps, pf.ina_game)

            # Send the final results
            await self.channel_layer.send(pf.channel_name, pf.gameResult)
            await self.channel_layer.send(ps.channel_name, ps.gameResult)

            await self.channel_layer.send(pf.channel_name, { "type" : "force_quit" })
            await self.channel_layer.send(ps.channel_name, { "type" : "force_quit" })

        else:
            # Game hasn't ended, inform players of the current round result
            pf.re_setup.update({
                "message": 1 if winner_char == pf.char else 0,
                "winLms": combo,
                "board" : pf.board
            })
            ps.re_setup.update({
                "message": 1 if winner_char == ps.char else 0,
                "winLms": combo,
                "board" : ps.board
            })

            await self.initGame([pf, ps], False)

    async def initGame(self,players, rand):
        async def get_players_data():
            """ This function is used to get the data
            of each player to send it to the other player."""

    # Determine the index of the current user and the opponent
            if players[0].user_id == self.user.id:
                me_index, hi_index = 0, 1
            else:
                me_index, hi_index = 1, 0

            # Fetch opponent's data asynchronously
            try:
                him = await sync_to_async(User.objects.get)(id=players[hi_index].user_id)
            except Exception as e:
                print(f"Error fetching opponent's data in initGame: {e}")
                return
            # Update setup data for both players
            players[me_index].setup["me"].update({  "fname": self.user.username,"pic": self.user.image_url })
            players[hi_index].setup["him"].update({ "fname": self.user.username,"pic": self.user.image_url })

            players[me_index].setup["him"].update({ "fname": him.username, "pic": him.image_url })
            players[hi_index].setup["me"].update({  "fname": him.username, "pic": him.image_url })
            
            
        def initialize_boards():
            """Initialize players' boards and mark them as in-game."""
            if players[0].ina_game[0] == "ft4":
                players[0].board = copy.deepcopy(empty_board_ft4)
                players[1].board = copy.deepcopy(empty_board_ft4)
            elif players[0].ina_game[0] == "ft_classic":
                players[0].board = copy.deepcopy(empty_board)
                players[1].board = copy.deepcopy(empty_board)

        def update_opponent_wins(rand):
            """Update opponent wins based on whether it's a random game."""
            if rand:
                players[0].setup["opwins"] = players[1].wins
                players[1].setup["opwins"] = players[0].wins
            else:
                players[0].re_setup["opwins"] = players[1].wins
                players[1].re_setup["opwins"] = players[0].wins

        def randomize_turn_and_characters():
            """Randomly assign turn and characters to players."""
            players[0].char, players[1].char = (
                (O_CHAR, X_CHAR) if random.choice([True, False]) else (X_CHAR, O_CHAR)
            )
            players[0].turn, players[1].turn = (
                (T_OFF, T_ON) if random.choice([True, False]) else (T_ON, T_OFF)
            )

        def setup_turns():
            """Set up turns based on the current turn."""
            players[0].turn, players[1].turn = (
                (T_OFF, T_ON) if players[1].turn else (T_ON, T_OFF)
            )

        # Increment game count for both players
        players[0].nbGames += 1
        players[1].nbGames += 1

        # Update opponent wins
        update_opponent_wins(rand)

        if rand:
            await get_players_data()
            randomize_turn_and_characters()
            await self.channel_layer.send(players[0].channel_name, players[0].setup)
            await self.channel_layer.send(players[1].channel_name, players[1].setup)
        else:
            setup_turns()
            await self.channel_layer.send(players[0].channel_name, players[0].re_setup)
            await self.channel_layer.send(players[1].channel_name, players[1].re_setup)
        initialize_boards()
        players[0].is_inGame = True
        players[1].is_inGame = True

          




    def genIdGameAndSendToGameBox(self, pme, phim, game_type):
        gen_game_id = f"{pme.user_id}_{phim.user_id}_{int(time.time())}"
        pme.game_id = phim.game_id = gen_game_id
        pme.ina_game = phim.ina_game = game_type
        player_game_map[pme.user_id] = player_game_map[phim.user_id] = gen_game_id
        game_box[gen_game_id] = [pme, phim]

        return

    async def setupPlayersAndInit(self, grp, game_type):
        check_Me = grp.popleft()
        check_Him = grp.popleft()

        check_Me_key = list(check_Me.keys())[0]  # Get the id of the user from the first dictionary
        check_Him_key = list(check_Him.keys())[0]

        if check_Me_key == self.user.id:
            player_me = player([check_Me_key,check_Me[check_Me_key]], game_type)
            player_him = player([check_Him_key, check_Him[check_Him_key]], game_type)
        else:
            player_me = player([check_Him_key, check_Him[check_Him_key]], game_type)
            player_him = player([check_Me_key,check_Me[check_Me_key]], game_type)

        self.genIdGameAndSendToGameBox(player_me, player_him, game_type)

        await self.initGame([player_me, player_him], True)


    async def quitGame(self):
        await self.close(code=1000)

    async def distribute(self,content, grid_type):
        first_to = content.get('first_to', None)
    
        if first_to is None:
            raise ValueError("First_to value is missing", 1)
        if first_to not in ["1", "3", "5", "7"]:
            raise ValueError("First_to value is invalid", 1)
        
        #  two types of games here FT4 and CLASSIC 
        if grid_type == "ft4":
            game_type = ["ft4",int(first_to)]
            grp_map = {1: ft4_m, 3: ft4_m3, 5: ft4_m5, 7: ft4_m7}
        elif grid_type == "ft_classic":
            game_type = ["ft_classic",int(first_to)]
            grp_map = {1: grp_m, 3: grp_m3, 5: grp_m5, 7: grp_m7}

        grp = grp_map.get(game_type[1], None)
        if grp is None:
            raise ValueError("Error Not possible to find the group", 1) 
        await self.dist_help(grp, game_type)

    async def dist_help(self, grp, game_type):

        if self.user.id in player_game_map:
            raise ValueError("User is already in a game", 3)
        
        for g in [grp_m, grp_m3, grp_m5, grp_m7, ft4_m, ft4_m3, ft4_m5, ft4_m7]:
            for item in g:
                if self.user.id in item:
                    raise ValueError("User is waiting for a game", 3)

        grp.append({self.user.id:self.channel_name})
        if len(grp) >= 2:
            await self.setupPlayersAndInit(grp, game_type)
            return
        else:
            await self.channel_layer.send(self.channel_name, {
                "type": "waiting",
                "message": "en couuuurs. ."
            })

    async def friendGame(self, content):
        friend_id = content.get('friendId', None)
        if friend_id is None:
            await self.close(code=4001)  # Invalid or missing game type
            return
        if friend_id == self.user.id:
            await self.close(code=4001)  # Invalid or missing game type
            return
        if friend_id in player_game_map:
            await self.close(code=4006)  # User is already in a game
            return
        if self.user.id in player_game_map:
            await self.close(code=4006)  # User is already in a game
            return
        found = any(friend_id in d for d in friends_grp)
        if found:
            two_friends = deque()
            two_friends.append({self.user.id:self.channel_name})
            friend_channel = None
            for item in friends_grp:
                if friend_id in item:
                    friend_channel = item[friend_id]
                    break
            two_friends.append({friend_id:friend_channel})
            await self.setupPlayersAndInit(two_friends, ["ft_classic", 1])
            return
        else:
            friends_grp.append({self.user.id:self.channel_name})
        


    async def receive(self, text_data):
        try:
            txt_json = json.loads(text_data)
            msg_type = txt_json.get("type", None)
            if msg_type == None:
                raise Exception("No type in the message", 1)
            if msg_type not in expected_types:
                raise Exception("Invalid message type", 1)
            
            if msg_type == 'friendGame':
                await self.friendGame(txt_json)
                return

            if msg_type == 'ft_classic' or msg_type == 'ft4':
                await self.distribute(txt_json, msg_type)
                return

            guId = player_game_map.get(self.user.id, None)
            if guId == None:
                raise Exception("No game found for this user", 1)
            players = game_box.get(guId, None)
            if players == None:
                raise Exception("No players found for this game", 1)

            firstP ,secondP = (players[0], players[1]) if players[0].char == X_CHAR else (players[1], players[0])
            is_x_turn = firstP.turn

            if msg_type == 'leaveGame':
                await self.handle_leaveGame(players)
            if msg_type == in_gaming:
                if (firstP.turn and firstP.channel_name != self.channel_name) or \
                (secondP.turn and secondP.channel_name != self.channel_name):
                    raise ValueError("Not your turn", 2)
                if not firstP.is_inGame or not secondP.is_inGame:
                    raise ValueError("Not in game", 2)
                clickIdx = txt_json.get("clickIdx", None)
                if clickIdx == None:
                    raise ValueError("No click index", 2)
                
                # here its the board update and switch turn
                if switchturnUpdtboardAddmoves(firstP, secondP, clickIdx, is_x_turn):
                    raise ValueError("Invalid move")
        except ValueError as e:
            err_msg, err_code = e.args
            await self.channel_layer.send(self.channel_name, {
                "type": "error_handle",
                "code": err_code,
                "msg": str(err_msg)
            })
            return

        if firstP.ina_game[0] == "ft_classic":
            if firstP.moves >= 3 or secondP.moves >= 3:
                if await self.checkft4Win(firstP, secondP, clickIdx, 3, 3):
                    await self.resetMoves(players)
                    return
            # here its the draw check
            if firstP.moves + secondP.moves == 9:
                await self.drawAnnounce(firstP, secondP)
                await self.resetMoves(players)
                return
        # here its the winner check for the 5/5 grid
        elif firstP.ina_game[0] == "ft4":
            if firstP.moves >= 4 or secondP.moves >= 4:
                if await self.checkft4Win(firstP, secondP, clickIdx, 5, 4):
                    await self.resetMoves(players)
                    return
            # here its the draw check
            if firstP.moves + secondP.moves == 25:
                await self.drawAnnounce(firstP, secondP)
                await self.resetMoves(players)
                return
        await self.channel_layer.send(firstP.channel_name, firstP.inGame)
        await self.channel_layer.send(secondP.channel_name, secondP.inGame)



    
    

    async def chat_message(self, event):
        message = event['message']
        await self.send(text_data=message)

    #win and loose msgs
    async def windrawloose(self, event):
        await self.send(text_data=json.dumps({
            "type": event["type"],
            "msg" : event["msg"],
            "wins": event["wins"],
            "nbGames": event["nbGames"],
            "opwins": event["opwins"],
            "message": event["message"],
            "board": event["board"],
            "combo": event["combo"]
        }))

    async def setup(self, event):
        # Handle setup messages to send to the WebSocket client
        await self.send(text_data=json.dumps({
            "type": "setup",
            "player": event['player'],
            "ina_game": event['ina_game'],
            "turn": event['turn'],
            "board" : event['board'],
            "him": event.get('him'),
            "me": event.get('me')
        }))
    async def re_setup(self, event):
        await self.send(text_data=json.dumps({
            "type": "re_setup",
            "player": event['player'],
            "turn": event['turn'],
            "wins": event['wins'],
            "opwins": event['opwins'],
            "reslt": event['message'],
            "board": event['board'],
            "combo": event['winLms']
        }))
    
    async def waiting(self, event):
        # Handle waiting messages to send to the WebSocket client
        await self.send(text_data=json.dumps({
            "type": "waiting",
            "message": event['message']
        }))
    
    async def force_quit(self, event):
        await self.close(code=4010)

    async def opponentLeft(self, event):
        # Handle waiting messages to send to the WebSocket client
        await self.send(text_data=json.dumps({
            "type": "opponentLeft",
            "message": event['message']
        }))
        await self.close(code=4011)

    async def in_game(self, event):
        await self.send(text_data=json.dumps({
            "type": "in_game",
            "turn": event.get("turn"),
            "board": event["board"]
        }))
    async def error_handle(self, event):
        try:
            if self.channel_layer:
                await self.send(text_data=json.dumps({
                    "type": "error_handle",
                    "code": event["code"],
                    "msg": event["msg"]
                }))
            print("....................................", event["code"])
            if event["code"] == 1:
                await self.close(code=4004)
            elif event["code"] == 3:
                await self.close(code=4005)
        except Exception as e:
            print("EXCEPTION : in error_handle function", e)
