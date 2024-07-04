
from django.db import models
from .user import User
import uuid


class PlayerStats(models.Model):
    stats_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.ForeignKey(User, related_name='stats', on_delete=models.CASCADE)
    games_played = models.IntegerField(default=0)
    games_won = models.IntegerField(default=0)
    games_lost = models.IntegerField(default=0)
    tournament_played = models.IntegerField(default=0)
    tournament_won = models.IntegerField(default=0)
    tournament_point_porcent = models.FloatField(default=100)

    def __str__(self):
        return f"{self.user_id} - Stats"

