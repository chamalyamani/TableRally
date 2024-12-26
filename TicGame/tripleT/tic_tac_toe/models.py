from django.db import models
from authentication.models import CustomUser as User

# Create your models here.
class games(models.Model):
    game_id = models.CharField(max_length=255, unique=True)
    # win_id = models.CharField(max_length=100)
    # los_id = models.CharField(max_length=100)
    p1id = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player1')
    p2id = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player2')
    winid = models.ForeignKey(User, on_delete=models.CASCADE, related_name='win_id')
    # los_id = models.ForeignKey('authentication.CustomUser', on_delete=models.CASCADE, related_name='games_lost')
    winner_boards = models.JSONField(default=list)
    num_of_games = models.IntegerField(default=0)
    game_type_db = models.JSONField(default=list) 
    


    # must know how to not register quited games or not finished games
    # should i create and save after finding a winner ?