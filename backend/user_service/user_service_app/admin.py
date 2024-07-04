# backend/user_service/user_service_app/admin.py

from django.contrib import admin
from user_service_app.models.user import User
from user_service_app.models.user_friends import UserFriends
from user_service_app.models.player_stats import PlayerStats

class UserAdmin(admin.ModelAdmin):
    list_display = ['user_id', 'username', 'email', 'status']
    list_filter = ['status']

admin.site.register(User)
admin.site.register(UserFriends)
admin.site.register(PlayerStats)

