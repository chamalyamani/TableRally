from django.contrib import admin
from django.contrib import admin
from .models import Friendship

# Register your models here.

class FriendshipAdmin(admin.ModelAdmin):
    list_display = ('user', 'friend', 'created_at')  # Customize fields to display in the list view
    search_fields = ('user__username', 'friend__username')  # Add search functionality
    list_filter = ('created_at',)  # Add filters for easy navigation
    ordering = ('-created_at',)  # Default ordering in the admin list view

admin.site.register(Friendship)