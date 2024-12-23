from django.db import models
# from authentication.models import CustomUser as User

# Create your models here.
class games(models.Model):
    game_id = models.CharField(max_length=255, unique=True)
    win_id = models.CharField(max_length=100)
    los_id = models.CharField(max_length=100)
    winner_boards = models.JSONField(default=list)
    num_of_games = models.IntegerField(default=0)
    game_type_db = models.JSONField(default=list) 
    