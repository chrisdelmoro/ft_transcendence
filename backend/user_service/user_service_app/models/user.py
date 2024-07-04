
from django.db import models
import uuid

class User(models.Model):
    user_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=255, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_auth = models.BooleanField(default=False)
    profile_picture = models.TextField(null=True, blank=True, default='https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.webp')
    status = models.TextField(null=True, blank=True)
    otp_secret = models.CharField(max_length=32, blank=True, null=True)
    

    def __str__(self):
        return self.username
