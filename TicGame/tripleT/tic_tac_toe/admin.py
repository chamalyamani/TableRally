from django.contrib import admin

# Register your models here.
from .models import games

class GameAdmin(admin.ModelAdmin):
    list_display = ('game_id', 'win_id', 'los_id','winner_boards','num_of_games','game_type_db')  # Adjust as needed
    # search_fields = ('single_value',)

admin.site.register(games, GameAdmin)