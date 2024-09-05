from django.urls import path, include
from . import views

urlpatterns = [
   path("Chatroom/", views.HomeView, name="Chatroom"),
   path("groups/<uuid:uuid>/", views.GroupChatView, name="group")
]