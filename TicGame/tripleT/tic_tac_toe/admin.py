from django.contrib import admin

# Register your models here.
from .models import games

class GameAdmin(admin.ModelAdmin):
    list_display = ('p1id', 'p2id', 'winid','winner_boards','num_of_games','game_type_db')


admin.site.register(games, GameAdmin)