from django.contrib import admin

# Register your models here.
from .models import games

class GameAdmin(admin.ModelAdmin):
    list_display = ('p1id', 'p2id', 'winid','winner_boards','num_of_games','game_type_db')  # Adjust as needed
    # search_fields = ('single_value',)'game_id', 


admin.site.register(games, GameAdmin)