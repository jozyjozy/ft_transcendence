from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(max_length=500, blank=True)
    profile_picture = models.ImageField(upload_to='media/', null=True, blank=True)
    coalition = models.CharField(max_length=100, null=True, blank=True)
    friends = models.ManyToManyField('self', blank=True)
    blockers = models.ManyToManyField('self', blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics', blank=True)
    history = models.TextField(null=True, blank=True)
    STATUS_CHOICES = [
        ('online', 'Online'),
        ('offline', 'Offline'),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='offline')

    def __str__(self):
        return f'{self.user.username} Profile'