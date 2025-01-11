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
        print("idx is out of range1  : ", idx)
        return 1
    elif( p1.ina_game[0] == "ft4" and ( idx > 24 or idx < 0 ) ):
        print("idx is out of range2  : ", idx)
        return 1
    if( p1.board[idx] != '.' or p2.board[idx] != '.' ):
        return 1
    if is_x_turn:
        p1.board[idx] = X_CHAR
        p2.board[idx] = X_CHAR
    else:
        p1.board[idx] = O_CHAR
        p2.board[idx] = O_CHAR
    # p1.board = p1.board
    # p2.board = p2.board
    # print("p1Board: ", p1.board)
    p1.turn, p2.turn = (T_OFF, T_ON) if is_x_turn else (T_ON, T_OFF)
    p1.moves  += 1 if is_x_turn else 0
    p2.moves += 0 if is_x_turn else 1
    return 0




class test(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.user = self.scope["user"]
            # print("Using dir()  -----> ",dir(self.user))
            # print("dict  -----> ",self.user.__dict__)
            if not self.user.is_authenticated:
                await self.close(code=4001)
                return
            await self.accept()
            print("ACCEPTED CNX FOR USER ID : ",self.user.id, 
                  "userName : ", self.user.username)
        except Exception as e:
            print("EXCEPTION : in connect", e)
            await self.close(code=4001)
        

    # def removeFromGrp(self, name, grp):
    #     if name in grp:
    #         grp.remove(name)
    #         print("REMOVE FROM GRP")
    async def disconnect(self, code):
        try:
            print("this is deco code : ", code)
            if code == 4005:
                print("i wont delete you from the grp")
                return
            # NOOOOO NEED TO DELETE THEM FROM GRP SiNCE THEY HAVE BEEN POPED OUT
            # BUT YES WHEN SOMEONE JUST ENTERED AND DISCONNECTED WITHOUT ANY MATCHING
            # HE MUST BE FREED FROM THE GRP THATS WHY THIS IS MADE

            grps_arr = [grp_m, grp_m3, grp_m5, grp_m7, ft4_m, ft4_m3, ft4_m5, ft4_m7, friends_grp]
            for grp in grps_arr:
                # print("len dyal grp ",len(grp_m))
                for item in grp:
                    print("ITEM : ")
                    if self.user.id in item:
                        grp.remove(item)
                        print(f"REMOVED {self.user} FROM GRP")
                        break

            guId = player_game_map.get(self.user.id, None)
            if guId == None:
                Exception("No game found for this user")
            players = game_box.get(guId, None)
            if players == None:
                print("players not found")
                Exception("No players found for this game")
            
            if code == 1006 or code == 1001:
                idxHim = 1 if players[0].user_id == self.user.id else 0
                await self.channel_layer.send(players[idxHim].channel_name, {
                    "type": "error_handle",
                    "code": 1,
                    "msg": "Your opponent has been disconnected unexpectedly."
                })
                print("code 1006 inform the other player that you left unexpectedly")
            # Remove both players from player_game_map
            for player in players:
                player_id = player.user_id
                if player_id in player_game_map:
                    del player_game_map[player_id]
                    print(f"{player_id} removed from player_game_map")

            # Remove the game from game_box
            if guId in game_box:
                del game_box[guId]
                print(f"Game with guId {guId} removed from game_box")
        except Exception as e:
            print("EXCEPTION : in disconnect", e)
            # await self.close(code=4001)
        # await self.channel_layer.send(self.channel_name, { "type" : "cnx_closed", "message" : code })

    async def handle_leaveGame(self, players):
        # players = game_box.get(self.channel_name)
        leave_message = {
        'type': 'error_handle',
        'code': 1,
        'msg' : "Your opponent has left the game.",
        }
        if ( players[0].channel_name == self.channel_name ):
            await self.channel_layer.send(players[1].channel_name, leave_message)
        else:
            await self.channel_layer.send(players[0].channel_name, leave_message)

        
        await self.channel_layer.send(self.channel_name, {
            "type": "error_handle",
            "code": 1,
            "msg" : "safi you left the game ? "
        })
        # await self.close(code=4011)
        # else:
        #     await self.close(code=1000)
    #function for initializing the game table
    async def resetMoves(self, players):
        players[0].moves = 0
        players[1].moves = 0
    async def dbInit(self, p1, p2, game_type):
        """Create a game record and save all necessary data with exception handling."""
        print("Saving Game Data...")

        from asgiref.sync import sync_to_async
        from .models import games
        from django.core.exceptions import ObjectDoesNotExist

        try:
            # Retrieve users
            p1_user = await sync_to_async(User.objects.get)(id=p1.user_id)
            p2_user = await sync_to_async(User.objects.get)(id=p2.user_id)
        except ObjectDoesNotExist as e:
            print(f"Error retrieving users: {e}")
            return  # Handle gracefully, e.g., log or notify

        # Determine the winner
        winner          = p1_user       if len(p1.winBoards) > len(p2.winBoards) else p2_user
        winner_boards   = p1.winBoards  if len(p1.winBoards) > len(p2.winBoards) else p2.winBoards
        loss_score = len(p1.winBoards) if len(p1.winBoards) < len(p2.winBoards) else len(p2.winBoards)
        try:
            # Create the game record
            game = await sync_to_async(games.objects.create)(
                # game_id=p1.game_id,
                game_type_db    = game_type,
                p1id            = p1_user,
                p2id            = p2_user,
                winid           = winner,
                winner_boards   = winner_boards,
                num_of_games    = p1.nbGames,
                l_score         = loss_score,
            )
            print(f"Game record created:")
        except Exception as e:
            print(f"Error creating game record: {e}")
        
    async def drawAnnounce(self, pf, ps):
        pf.re_setup["message"] = ps.re_setup["message"] = 2
        await self.initGame([pf, ps], False)

  
    async def checkft4Win(self, pf, ps, idx, bSize, winCount):
        board_2d = [pf.board[i:i + bSize] for i in range(0, len(pf.board), bSize)]
        print("ANA DABA F checkft4Win")
        # print("winComboArr : ",winComboArr)
        # Convert the 1D index to 2D coordinates
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
                    # print()

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
        # print("bts : ", bts)
        print("combo : ", combo)
        bts_list = list(bts)

        # Loop through the indexes in combo and make them uppercase
        for idx in combo:
            if 0 <= idx < len(bts):  # Ensure index is valid
                bts_list[idx] = bts_list[idx].upper()

        # Join the list back into a string
        bts = ''.join(bts_list)
        print("bts after applying combo : ", bts)
        if winner_char == pf.char:
            pf.wins += 1
            pf.winBoards.append(bts)
        else:
            ps.wins += 1
            ps.winBoards.append(bts)

        # Check if the game ends
        print("pf.wins : ", pf.wins, " pf.ina_game[1] : ", pf.ina_game[1])
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
        # if self.channel_name == pf.channel_name:
            print("hani dezt mn hna ---------")
            await self.dbInit(pf, ps, pf.ina_game)
            # await self.dbUpdate(pf, ps)

            # Send the final results
            await self.channel_layer.send(pf.channel_name, pf.gameResult)
            await self.channel_layer.send(ps.channel_name, ps.gameResult)

            await self.channel_layer.send(pf.channel_name, { "type" : "force_quit" })
            await self.channel_layer.send(ps.channel_name, { "type" : "force_quit" })
            #this code is for end of game

            # await self.close(code=4010)
            # Reset the game state
            # pf.is_inGame = ps.is_inGame = False
            # ps.nbGames = pf.nbGames = 0

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
            print("dkhlt hna 0")
            print("Entering get_players_data...")

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
            # what about the board inside the msgDic
            if players[0].ina_game[0] == "ft4":
                players[0].board = copy.deepcopy(empty_board_ft4)
                players[1].board = copy.deepcopy(empty_board_ft4)
                # print("iiiiiiiina game ???? ::: ", players[0].board)
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
            print("players[0].setup : ", players[0].setup)
            print("players[1].setup : ", players[1].setup)
            await self.channel_layer.send(players[0].channel_name, players[0].setup)
            await self.channel_layer.send(players[1].channel_name, players[1].setup)
        else:
            setup_turns()
            # initialize_boards()
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
        # here i must check if the grp is friend grp 
        # I think i wont need too if i send a deque directly
        check_Me = grp.popleft()
        check_Him = grp.popleft()

        check_Me_key = list(check_Me.keys())[0]  # Get the id of the user from the first dictionary
        check_Him_key = list(check_Him.keys())[0]
        print("IIIn setup playyyyyer ::: gameTYPE :::: ",game_type)
        # creating the players using the userID and the channel name
        # bingo ! 
        # check the next function where the players will have access to each others data
        if check_Me_key == self.user.id:
            player_me = player([check_Me_key,check_Me[check_Me_key]], game_type)
            player_him = player([check_Him_key, check_Him[check_Him_key]], game_type)
        else:
            player_me = player([check_Him_key, check_Him[check_Him_key]], game_type)
            player_him = player([check_Me_key,check_Me[check_Me_key]], game_type)
        # player(grp.popleft(), game_type[0])
        # player(grp.popleft(), game_type[0])
        # create or not db table for this game
        self.genIdGameAndSendToGameBox(player_me, player_him, game_type)
        # await self.dbInit(player_me, player_him, game_type)
        # here must get the data of each player to send it
        await self.initGame([player_me, player_him], True)


    async def quitGame(self):
        await self.close(code=1000)
        # players = game_box.get(self.channel_name)
        # if ( players[0].channel_name == self.channel_name ):

    # 
    async def distribute(self,content, grid_type):
        first_to = content.get('first_to', None)
    
        if first_to is None:
            raise ValueError("First_to value is missing", 1)
        if first_to not in ["1", "3", "5", "7"]:
            raise ValueError("First_to value is invalid", 1)
        
        #  two types of games here FT4 and CLASSIC 
        print("in distributeeeeeeeee : ", grid_type)
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
        # if any(self.user.id in entry for entry in grp):
        #     print("already in game of this type")
        #     await self.close(code=4003)
        #     return
        if self.user.id in player_game_map:
            raise ValueError("User is already in a game", 3)
            # await self.close(code=4005)
            # return
        # search in all the grps if the user is already in one of them
        for g in [grp_m, grp_m3, grp_m5, grp_m7, ft4_m, ft4_m3, ft4_m5, ft4_m7]:
            for item in g:
                if self.user.id in item:
                    raise ValueError("User is waiting for a game", 3)
                    # print("already in game of this type")
                    # await self.close(code=4005)
                    # return
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
            await self.close(code=4005)  # User is already in a game
            return
        if self.user.id in player_game_map:
            await self.close(code=4005)  # User is already in a game
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
    #         here you must normally send both players to the game box
    #         add each user into a deque with there id and channel name
    #         get the players channel name and id from the friends_grp
            print("your friend is here go PLAY . . .")
            await self.setupPlayersAndInit(two_friends, ["ft_classic", 1])
            return
        else:
            print("your friend is not here wait . . .")
            friends_grp.append({self.user.id:self.channel_name})
        


    async def receive(self, text_data):
        # data must be parsed here 
        # and then create the players
        try:
            txt_json = json.loads(text_data)
            print("RECEIVE : ", txt_json)
            msg_type = txt_json.get("type", None)
            print("msg_type :-------------------->>>>> ", msg_type)
            if msg_type == None:
                raise Exception("No type in the message", 1)
            if msg_type not in expected_types:
                raise Exception("Invalid message type", 1)
            
            # could receive a message that says there is two users that wants to play together
            # this current one will have the id or username of the one who wants to play with (self have username in the msg)
            # check if the other user is in the grp by his username or id
            # if he is in the grp then create the game and send the setup message
            # if he is not in the grp then add the user to the grp and wait for the other user
            # in the grp you will add the user id or username and the channel name

            # each player comes he must look for his opponent in that grp
            # if he finds him then he must create the game and send the setup message
            # if he doesnt he must set a timer for the other player to come
            # if the timer ends then he must remove himself from the grp
            if msg_type == 'friendGame':
                print("here in the COnsumer i received friend request ", txt_json)
                await self.friendGame(txt_json)
                return

            #must be handled if is already in game or is not in game 
            if msg_type == 'ft_classic' or msg_type == 'ft4':
                await self.distribute(txt_json, msg_type)
                return
            
            # this is for the 5/5 grid game first to four 
            # if msg_type == 'ft4':
            #     await self.distribute(txt_json, msg_type)
            
            # if msg_type == 'quitGame':
            #     await self.quitGame()
            guId = player_game_map.get(self.user.id, None)
            if guId == None:
                raise Exception("No game found for this user", 1)
            players = game_box.get(guId, None)
            if players == None:
                raise Exception("No players found for this game", 1)
            #prevent the other player from playing
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
            print("VAlueError : in receive : err_msg : ", err_msg, " err_code : ", err_code)
            await self.channel_layer.send(self.channel_name, {
                "type": "error_handle",
                "code": err_code,
                "msg": str(err_msg)
            })
            return
        # except Exception as e:
        #     print("EXCEPTION : in receive", e)
        #     await self.channel_layer.send(self.channel_name, {
        #         "type": "error_handle",
        #         "code": 1,
        #         "msg": str(e)
        #     })
        #     # await self.close(code=4004)
        #     return
            # here its the winner check for the 3/3 grid 
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
    # async def partyResult(self, event):
    #     await self.send(text_data=json.dumps({
    #         "type": event["type"],
    #         "player": event["player"],
    #         "msg" : event["msg"]
    #     }))
    async def setup(self, event):
        # Handle setup messages to send to the WebSocket client
        await self.send(text_data=json.dumps({
            "type": "setup",
            "player": event['player'],
            "ina_game": event['ina_game'],
            "turn": event['turn'],
            # "wins": event['wins'],
            # "opwins": event['opwins'],
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
            # "played_now": event.get("played_now"),
            "board": event["board"]
        }))
    async def error_handle(self, event):
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
    



#-------------------------------------------------------------------------------------------

# class test2(AsyncWebsocketConsumer):
#     async def connect(self):
#         await self.accept()
#     async def receive(self, text_data=None):
#         txt_json = json.loads(text_data)
#         msg_type = txt_json.get("type", None)
#         await self.channel_layer.send(self.channel_name, firstP.inGame)
        # await self.channel_layer.send(secondP.channel_name, secondP.inGame)

       