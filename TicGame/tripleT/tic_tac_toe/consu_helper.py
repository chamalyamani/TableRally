from collections import deque
import copy

empty_board = list("." * 9)
empty_board_ft4 = list("." * 25)

game_setup  = "setup"
in_gaming   = "in_game"
game_reslt  = "windrawloose"
wait4Match  = "waiting"
rePlay_req  = "inform"
# party_reslt = "partyResult"
re_setup = "re_setup"
err_handle = "error_handle"
T_ON    = True
A_ON    = True
T_OFF   = False
A_OFF   = False

X_CHAR = 'x'
O_CHAR = 'o'

expected_types = ["ft_classic", "ft4", "leaveGame", "in_game"]
# codeToMsg = {
#     4001 : "You are not athenticated !",
#     4002 : "Parse error !",
#     4003 : "You are already in waiting list !",
# }

# game mode groups
grp_m = deque()
grp_m3 = deque()
grp_m5 = deque()
grp_m7 = deque()

# game mode ft4 
ft4_m = deque()
ft4_m3 = deque()
ft4_m5 = deque()
ft4_m7 = deque()

friends_grp = deque()

game_box = {}
# ft4_game_box = {}

player_game_map = {} # map the player to the game
# ft4_player_game_map = {} # map the player to the game
# grp_m2 = deque()
# grp_m3 = deque()
msgsDic = {
    game_setup         : {
        "type": "setup",
        "player": "",
        "ina_game": 0,
        # "opwins": 0,
        "turn": T_OFF,
        "board" : copy.deepcopy(empty_board),
        "him": {
            "fname": "abbass",
            "lname": "lamba",
            "pic"  : "",
            "lvl"  : 0,
        },
        "me": {
            "fname": "hmida",
            "lname": "lourim",
            "pic"  : "",
            "lvl"  : 0,
        }
    },
    re_setup            :{
        "type": "re_setup",
        "player": "",
        "wins" : 0,
        "opwins": 0,
        "turn": T_OFF,
        "message": 0,
        "board" : copy.deepcopy(empty_board),
        "winLms" : []
    },
    in_gaming       : {
        "type"      : "in_game",
        "turn"      : T_OFF,
        "valid"     : "y",
        "wins"     : 0,
        # "played_now": "",
        "board"     : copy.deepcopy(empty_board)
    },
    game_reslt  :   {
        "type"      : "windrawloose",
        "msg"       : "",
        "nbGames"   : 0,
        "wins"      : 0,
        "opwins"    : 0,
        "message"   : 0,
        "board"     : [],
        "combo"     : []
    },
    err_handle        :   {
        "type"  : "error_handle",
        "code"   : 0,
        "msg"   : ""
    }
    ,
    wait4Match       :   {
        "type": "waiting",
        "message": "en couuuurs. ."
    }
}

class player:
    def __init__(self, name, bSize):
        self.channel_name = name[1]
        self.ina_game = ["",1]
        self.game_id = ''
        self.user_id = name[0]
        self.is_inGame = False
        self._char = ''
        self._turn = T_OFF
        self.moves = 0
        self.name = 'reda'
        self.lvl = 0.55
        self.nbGames = 0
        self._wins = 0
        # self.again = A_OFF 
        self._res = 'Draw Match !'
        self.winBoards = []
        self.board_type = bSize[0]
        self._board = copy.deepcopy(self.init_board())

        self.setup  = copy.deepcopy(msgsDic[game_setup])
        self.err  = copy.deepcopy(msgsDic[err_handle])
        self.re_setup  = copy.deepcopy(msgsDic[re_setup])
        self.inGame = copy.deepcopy(msgsDic[in_gaming])
        self.gameResult = copy.deepcopy(msgsDic[game_reslt])
        # self.partyResult = copy.deepcopy(msgsDic[party_reslt])
        # self.playAgainMsg   = copy.deepcopy(msgsDic[rePlay_req])
        self.waitingMsg = copy.deepcopy(msgsDic[wait4Match])
    
    # Update board for all message dictionaries

        if bSize[0] == "ft4":
            self.setup["ina_game"] = 5
            # print("bSize ::: ",bSize)
        else:
            self.setup["ina_game"] = 3
        # print("khrejt b hadi  ",self.setup["ina_game"])
            

        self.setup["board"] = copy.deepcopy(self.init_board())
        # print("setup board inside class : ",self.setup["board"])
        self.re_setup["board"] = copy.deepcopy(self.init_board())
        self.inGame["board"] = copy.deepcopy(self.init_board())
        self.gameResult["board"] = copy.deepcopy(self.init_board())

    def init_board(self):
        """Return the appropriate board template based on board size."""
        if self.board_type == "ft4":
            return empty_board_ft4
        return empty_board
    @property
    def wins(self):
        return self._wins
    @wins.setter
    def wins(self, value):
        self._wins = value
        # self.partyResult["myscore"] = value
        self.inGame["wins"] = value
        self.re_setup["wins"] = value
        # self.setup["wins"] = value
        self.gameResult["wins"] = value

    @property
    def turn(self):
        return self._turn
    @turn.setter
    def turn(self, value):
        self._turn = value
        self.setup["turn"] = value
        self.re_setup["turn"] = value
        self.inGame["turn"] = value

    @property
    def char(self):
        return self._char
    @char.setter
    def char(self,value):
        self._char = value
        self.gameResult["player"] = value
        self.setup["player"] = value
        self.re_setup["player"] = value

    @property
    def res(self):
        return self._res
    @res.setter
    def res(self, value):
        self._res = value
        self.gameResult["msg"] = value

    @property
    def board(self):
        return self._board
    @board.setter
    def board(self, value):
        self._board = value
        self.inGame["board"] = value
        self.gameResult["board"] = value
        self.re_setup["board"] = value





        # -----------------------------------------------------------------------------------------
        # -----------------------------------------------------------------------------------------
        # -----------------------------------------------------------------------------------------

        # import export js for sending wherever the user is
        # new general socket
        # new js static file that manages the notifications
