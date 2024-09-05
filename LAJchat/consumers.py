from django.contrib.auth.models import User
from .models import Event, Message, Group
import json
from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
from channels.layers import channel_layers
from channels.db import database_sync_to_async
import asyncio
from game.models import Room

class JoinAndLeave(WebsocketConsumer):
    
    def connect(self):
        self.user = self.scope["user"]
        self.accept()

    def receive(self, text_data=None, bytes_data=None):
        if text_data:
            try:
                print(text_data)
                data = json.loads(text_data)
            except json.JSONDecodeError as e:
                print("For Join leave : JSON decoding error:", e)
                return
            type = data.get("type")
            if type:
                data = data.get("data")
            if type == "leave_group":
                self.leave_group(data)
            elif type == "join_group":
                self.join_group(data)
            elif type == "add_group":
                self.add_group(data)
            elif type == "delete_group":
                self.delete_group(data)

    def leave_group(self, group_uuid):
        group = Group.objects.get(uuid=group_uuid)
        group.remove_user_from_group(self.user)
        room = Room.objects.get(uuid=group_uuid)
        room.remove_user_from_room(self.user)
        data = {
            "type": "leave_group",
            "data": group_uuid
        }
        self.send(json.dumps(data))

    def join_group(self, group_uuid):
        group = Group.objects.get(uuid=group_uuid)
        group.add_user_to_group(self.user)
        room = Room.objects.get(uuid=group_uuid)
        room.add_user_to_room(self.user)
        data = {
            "type": "join_group",
            "data": group_uuid
        }
        self.send(json.dumps(data))

    def add_group(self, group_name):
        new_group = Group.objects.create(name=group_name)
        uuid = str(new_group.uuid)
        data = {
            "type": "add_group",
            "data": {
                "uuid": uuid,
                "name": new_group.name
            }
        }
        Room.objects.create(name=group_name,uuid=uuid,hiden=1)
        self.send(json.dumps(data))

    def delete_group(self, group_uuid):
        group = Group.objects.get(uuid=group_uuid)
        if self.user in group.members.all():
            group.delete()
            room = Room.objects.get(uuid=group_uuid)
            room.delete()
            data = {
                "type": "delete_group",
                "data": group_uuid
            }
            self.send(json.dumps(data))

class GroupConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_uuid = str(self.scope["url_route"]["kwargs"]["uuid"])
        self.group = await database_sync_to_async(Group.objects.get)(uuid=self.group_uuid)
        await self.channel_layer.group_add(self.group_uuid, self.channel_name)
        self.user = self.scope["user"]
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_uuid, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        if text_data:
            data = json.loads(text_data)
            type = data.get("type", None)
            message = data.get("message", None)
            author = data.get("author", None)
            if type == "text_message":
                try:
                    user = await database_sync_to_async(User.objects.get)(username=author)
                    message_instance = await database_sync_to_async(Message.objects.create)(
                        author=user,
                        content=message,
                        group=self.group
                    )
                    await self.channel_layer.group_send(
                        self.group_uuid,
                        {
                            "type": "text_message",
                            "message": message_instance.content,
                            "author": author
                        }
                    )
                except User.DoesNotExist:
                    print(f"User {author} does not exist.")
                except Exception as e:
                    print(f"Error creating message: {e}")

    async def text_message(self, event):
        message = event["message"]
        author = event["author"]
        returned_data = {
            "type": "text_message",
            "message": message,
            "author": author,
            "group_uuid": self.group_uuid
        }
        await self.send(json.dumps(returned_data))

    async def event_message(self, event):
        message = event.get("message")
        user = event.get("user", None)
        await self.send(json.dumps({
            "type": "event_message",
            "message": message,
            "status": event.get("status", None),
            "user": user
        }))