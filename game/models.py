from django.db import models
from django.contrib.auth import get_user_model
from uuid import uuid4

from django.urls import reverse

User = get_user_model()

class Room(models.Model):
    uuid = models.UUIDField(default=uuid4, editable=False)
    name = models.CharField(max_length=30)
    hiden = models.IntegerField(default=0)
    members = models.ManyToManyField(User)

    def __str__(self) -> str:
        return f"Room {self.name}-{self.uuid}"

    def get_absolute_url(self):
        return reverse("Room", args=[str(self.uuid)])

    def add_user_to_room(self, user:User):
        self.members.add(user)
        self.event_set.create(type="Join", uuser=user)
        self.save()

    def remove_user_from_room(self, user:User):
        self.members.remove(user)
        self.event_set.create(type="Left", uuser=user)
        self.save()

class Event(models.Model):
    CHOICES = [
        ("Join", "join"),
        ("Left", "left")
        ]
    type = models.CharField(choices=CHOICES, max_length=10)
    description= models.CharField(help_text="A description of the event that occurred", max_length=50, editable=False)
    uuser = models.ForeignKey(User, on_delete=models.CASCADE, related_name='game_events')
    timestamp = models.DateTimeField(auto_now_add=True)
    room = models.ForeignKey(Room ,on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        self.description = f"{self.uuser} {self.type} the {self.room.name} room"
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.description}"
