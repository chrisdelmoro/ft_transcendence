from django.db import models
import uuid

class Game(models.Model):
    game_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    player1_id = models.UUIDField()
    player2_id = models.UUIDField()
    score_player1 = models.IntegerField(default=0)
    score_player2 = models.IntegerField(default=0)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=50)
    type = models.CharField(max_length=50)

    def __str__(self):
        return f"Game {self.game_id}"