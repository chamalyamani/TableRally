from django.db import models
from authentication.models import CustomUser as User

class games(models.Model):
    p1id = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player1')
    p2id = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player2')
    winid = models.ForeignKey(User, on_delete=models.CASCADE, related_name='win_id')
    l_score = models.IntegerField(default=0)
    winner_boards = models.JSONField(default=list)
    num_of_games = models.IntegerField(default=0)
    game_type_db = models.JSONField(default=list)
