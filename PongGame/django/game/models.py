from django.db import models

# Create your models here
class Score(models.Model):
  user1_id = models.CharField(max_length=255)
  user2_id = models.CharField(max_length=255)
  score1 = models.CharField(max_length=255)
  score2 = models.CharField(max_length=255)