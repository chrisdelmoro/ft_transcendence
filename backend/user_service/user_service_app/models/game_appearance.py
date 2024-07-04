
from django.db import models
from .user import User
import uuid


class GameAppearance(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    theme = models.TextField(default='original')
    user_id = models.ForeignKey(User, related_name='game_appearance', on_delete=models.CASCADE)
    paddle_color = models.TextField(default='#FFF')
    ball_color = models.TextField(default='#FFF')
    background_color = models.TextField(default='#000')

    def __str__(self):
        return f"{self.user_id} - GameAppearance"

