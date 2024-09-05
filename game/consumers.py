from django.contrib.auth.models import User
from .models import Room
import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
import json
from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from channels.db import database_sync_to_async
from django.shortcuts import get_object_or_404
from login.models import Profile
import asyncio
from asgiref.sync import sync_to_async
from django.utils import timezone

class JoinGame(WebsocketConsumer):

    def connect(self):
        self.user = self.scope["user"]
        self.accept()

    def receive(self, text_data=None, bytes_data=None):
        if text_data:
            try:
                data = json.loads(text_data)
            except json.JSONDecodeError as e:
                print("For Join leave : JSON decoding error:", e)
                return
            type = data.get("type")
            if type:
                data = data.get("data")
            if type == "leave_room":
                self.leave_room(data)
            elif type == "join_room":
                self.join_room(data)
            elif type == "add_room":
                self.add_room(data)
            elif type == "delete_room":
                self.delete_room(data)

    def leave_room(self, room_uuid):
        room = Room.objects.get(uuid=room_uuid)
        room.remove_user_from_room(self.user)
        data = {
            "type": "leave_room",
            "data": room_uuid
        }
        self.send(json.dumps(data))

    def join_room(self, room_uuid):
        room = Room.objects.get(uuid=room_uuid)
        room.add_user_to_room(self.user)
        data = {
            "type": "join_room",
            "data": room_uuid
        }
        self.send(json.dumps(data))

    def add_room(self, room_name):
        new_room = Room.objects.create(name=room_name)
        uuid = str(new_room.uuid)
        data = {
            "type": "add_room",
            "data": {
                "uuid": uuid,
                "name": new_room.name
            }
        }
        self.send(json.dumps(data))

    def delete_room(self, room_uuid):
        room = Room.objects.get(uuid=room_uuid)
        if self.user in room.members.all():
            room.delete()
            data = {
                "type": "delete_room",
                "data": room_uuid
            }
            self.send(json.dumps(data))

class PongConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.group_uuid = str(self.scope["url_route"]["kwargs"]["uuid"])
        try:
            self.group = await sync_to_async(Room.objects.get)(uuid=self.group_uuid)
        except Room.DoesNotExist:
            await self.close()
            return

        await self.channel_layer.group_add(self.group_uuid, self.channel_name)
        self.user = self.scope["user"]

        if not hasattr(self.channel_layer, "game_state"):
            self.channel_layer.game_state = {
                'game_finished': 0,
                'player1_score': 0,
                'player2_score': 0,
                'paddle_height': 100,
                'canvas_height': 500,
                'canvas_width': 775,
                'ball_speed_x': 5,
                'ball_speed_y': 5,
                'ball_x': 400,
                'ball_y': 200,
                'ball_radius': 10,
                'player1_y': 200 - 50,
                'player2_y': 200 - 50,
                'player1_up': False,
                'player1_down': False,
                'player2_up': False,
                'player2_down': False,
            }

        if not hasattr(self.channel_layer, "player1"):
            self.channel_layer.player1 = self.user
            self.player = 'player1'
            self.start = 0
        elif not hasattr(self.channel_layer, "player2"):
            self.channel_layer.player2 = self.user
            self.player = 'player2'
            self.start = 1
        else:
            await self.close()
            return
        self.game_task = asyncio.create_task(self.game_loop())
        await self.accept()

    async def disconnect(self, close_code):
        user = self.scope['user']
        await self.add_history(user, "win")
        await self.channel_layer.group_discard(self.group_uuid, self.channel_name)
        self.game_task.cancel()
        if self.player == 'player1':
            del self.channel_layer.player1
            del self.channel_layer.game_state
        elif self.player == 'player2':
            del self.channel_layer.player2

    async def receive(self, text_data=None, bytes_data=None):
        if text_data:
            data = json.loads(text_data)
            action = data['action']
            if self.player == 'player1':
                if action == 'up':
                    self.channel_layer.game_state['player1_up'] = True
                elif action == 'down':
                    self.channel_layer.game_state['player1_down'] = True
                elif action == 'stop_up':
                    self.channel_layer.game_state['player1_up'] = False
                elif action == 'stop_down':
                    self.channel_layer.game_state['player1_down'] = False
            elif self.player == 'player2':
                if action == 'up':
                    self.channel_layer.game_state['player2_up'] = True
                elif action == 'down':
                    self.channel_layer.game_state['player2_down'] = True
                elif action == 'stop_up':
                    self.channel_layer.game_state['player2_up'] = False
                elif action == 'stop_down':
                    self.channel_layer.game_state['player2_down'] = False

    async def game_loop(self):
        while True:
            if self.start == 1:
                self.update_game_state()
                await self.channel_layer.group_send(
                    self.group_uuid,
                    {
                        'type': 'game_state',
                        'player1_y': self.channel_layer.game_state['player1_y'],
                        'player2_y': self.channel_layer.game_state['player2_y'],
                        'ball_x': self.channel_layer.game_state['ball_x'],
                        'ball_y': self.channel_layer.game_state['ball_y'],
                    }
                )
                if self.channel_layer.game_state['game_finished'] == 1:
                    break
            await asyncio.sleep(1 / 30)

    def update_game_state(self):
        state = self.channel_layer.game_state

        if state['player1_up'] and state['player1_y'] > 0:
            state['player1_y'] -= 7
        if state['player1_down'] and state['player1_y'] < state['canvas_height'] - state['paddle_height']:
            state['player1_y'] += 7
        if state['player2_up'] and state['player2_y'] > 0:
            state['player2_y'] -= 7
        if state['player2_down'] and state['player2_y'] < state['canvas_height'] - state['paddle_height']:
            state['player2_y'] += 7

        state['ball_x'] += state['ball_speed_x']
        state['ball_y'] += state['ball_speed_y']

        if state['ball_y'] + state['ball_radius'] > state['canvas_height'] or state['ball_y'] - state['ball_radius'] < 0:
            state['ball_speed_y'] = -state['ball_speed_y']

        if state['ball_x'] + state['ball_radius'] > state['canvas_width']:
            if state['ball_y'] > state['player2_y'] and state['ball_y'] < state['player2_y'] + state['paddle_height']:
                state['ball_speed_x'] = -state['ball_speed_x'] * 1.1
            else:
                self.channel_layer.game_state['player1_score'] += 1
                if self.channel_layer.game_state['player1_score'] >= 3:
                    asyncio.create_task(self.stop_ball())
                else:
                    self.reset_ball()

        if state['ball_x'] - state['ball_radius'] < 0:
            if state['ball_y'] > state['player1_y'] and state['ball_y'] < state['player1_y'] + state['paddle_height']:
                state['ball_speed_x'] = -state['ball_speed_x'] * 1.1
            else:
                self.channel_layer.game_state['player2_score'] += 1
                if self.channel_layer.game_state['player2_score'] >= 3:
                    asyncio.create_task(self.stop_ball())
                else:
                    self.reset_ball()

    async def stop_ball(self):
        state = self.channel_layer.game_state
        state['ball_x'] = state['canvas_width'] / 2
        state['ball_y'] = state['canvas_height'] / 2
        state['ball_speed_x'] = 0
        state['ball_speed_y'] = 0
        state['game_finished'] = 1


    async def add_history(self, user, result):
        try:
            resultp2 = 'lose'
            if self.channel_layer.game_state['player2_score'] >= 3 and self.player == 'player2':
                resultp2 = 'win'
            if self.channel_layer.game_state['player1_score'] >= 3 and self.player == 'player1':
                resultp2 = 'win'
            profile = await sync_to_async(Profile.objects.get)(user=user)
            current_time = timezone.now()
            new_entry = f"{resultp2} on {current_time.strftime('%Y-%m-%d %H:%M:%S')}\n"
            if profile.history:
                profile.history += new_entry
            else:
                profile.history = new_entry
            await sync_to_async(profile.save)()
            print(f"Historique mis à jour pour {user.username}")
        except Profile.DoesNotExist:
            print(f"Aucun profil trouvé pour l'utilisateur : {user}")
        except Exception as e:
            print(f"Erreur lors de la mise à jour de l'historique : {e}")

    def reset_ball(self):
        state = self.channel_layer.game_state
        state['ball_x'] = state['canvas_width'] / 2
        state['ball_y'] = state['canvas_height'] / 2
        if self.channel_layer.game_state['player2_score'] < 3 and self.channel_layer.game_state['player1_score'] < 3:
            state['ball_speed_x'] = -(state['ball_speed_x'] / abs(state['ball_speed_x'])) * 5

    async def game_state(self, event):
        await self.send(text_data=json.dumps({
            'game_finished': self.channel_layer.game_state['game_finished'],
            'player1_score': self.channel_layer.game_state['player1_score'],
            'player2_score': self.channel_layer.game_state['player2_score'],
            'player1_y': event['player1_y'],
            'player2_y': event['player2_y'],
            'ball_x': event['ball_x'],
            'ball_y': event['ball_y'],
        }))

class PongLocalConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        username = self.scope['user'].username
        self.group_name = f"pong_game_{username}"

        await self.channel_layer.group_add(self.group_name, self.channel_name)

        if not hasattr(self.channel_layer, "game_state"):
            self.channel_layer.game_state = {}


        if self.group_name not in self.channel_layer.game_state:
            self.channel_layer.game_state[self.group_name] = {
                'game_finished': 0,
                'player1_score': 0,
                'player2_score': 0,
                'paddle_height': 100,
                'canvas_height': 500,
                'canvas_width': 775,
                'ball_speed_x': 0,
                'ball_speed_y': 0,
                'ball_x': 400,
                'ball_y': 200,
                'ball_radius': 10,
                'player1_y': 200 - 50,
                'player2_y': 200 - 50,
                'player1_up': False,
                'player1_down': False,
                'player2_up': False,
                'player2_down': False,
            }


        if 'player1' not in self.channel_layer.game_state[self.group_name]:
            self.channel_layer.game_state[self.group_name]['player1'] = self.scope['user']
            self.player = 'player1'
        elif 'player2' not in self.channel_layer.game_state[self.group_name]:
            self.channel_layer.game_state[self.group_name]['player2'] = self.scope['user']
            self.player = 'player2'
        else:
            await self.close()
            return

        self.game_task = asyncio.create_task(self.game_loop())
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        self.game_task.cancel()
        if self.player == 'player1':
            del self.channel_layer.game_state[self.group_name]['player1']
        elif self.player == 'player2':
            del self.channel_layer.game_state[self.group_name]['player2']
        if 'player1' not in self.channel_layer.game_state[self.group_name] and 'player2' not in self.channel_layer.game_state[self.group_name]:
            del self.channel_layer.game_state[self.group_name]

    async def receive(self, text_data=None, bytes_data=None):
        if text_data:
            data = json.loads(text_data)
            action = data['action']
            state = self.channel_layer.game_state[self.group_name]
            if data['player'] == 'player1':
                if action == 'upl':
                    state['player1_up'] = True
                elif action == 'downl':
                    state['player1_down'] = True
                elif action == 'stop_upl':
                    state['player1_up'] = False
                elif action == 'stop_downl':
                    state['player1_down'] = False
            elif data['player'] == 'player2':
                if action == 'upl':
                    state['player2_up'] = True
                elif action == 'downl':
                    state['player2_down'] = True
                elif action == 'stop_upl':
                    state['player2_up'] = False
                elif action == 'stop_downl':
                    state['player2_down'] = False

    async def game_loop(self):
        await asyncio.sleep(1)
        while True:
            try:
                self.update_game_state()
                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        'type': 'game_state',
                        'player1_y': self.channel_layer.game_state[self.group_name]['player1_y'],
                        'player2_y': self.channel_layer.game_state[self.group_name]['player2_y'],
                        'ball_x': self.channel_layer.game_state[self.group_name]['ball_x'],
                        'ball_y': self.channel_layer.game_state[self.group_name]['ball_y'],
                    }
                )
            except Exception as e:
                print(f"Exception in game_loop: {e}")
            if self.channel_layer.game_state[self.group_name]['game_finished'] == 1:
                break
            await asyncio.sleep(1/30)

    def update_game_state(self):
        state = self.channel_layer.game_state[self.group_name]
        if state['ball_speed_x'] == 0:
            state['ball_speed_x'] = 5
            state['ball_speed_y'] = 5
        if state['player1_up'] and state['player1_y'] > 0:
            state['player1_y'] -= 7
        if state['player1_down'] and state['player1_y'] < state['canvas_height'] - state['paddle_height']:
            state['player1_y'] += 7
        if state['player2_up'] and state['player2_y'] > 0:
            state['player2_y'] -= 7
        if state['player2_down'] and state['player2_y'] < state['canvas_height'] - state['paddle_height']:
            state['player2_y'] += 7

        state['ball_x'] += state['ball_speed_x']
        state['ball_y'] += state['ball_speed_y']

        if state['ball_y'] + state['ball_radius'] > state['canvas_height'] or state['ball_y'] - state['ball_radius'] < 0:
            state['ball_speed_y'] = -state['ball_speed_y']

        if state['ball_x'] + state['ball_radius'] > state['canvas_width']:
            if state['ball_y'] > state['player2_y'] and state['ball_y'] < state['player2_y'] + state['paddle_height']:
                state['ball_speed_x'] = -state['ball_speed_x'] * 1.1
            else:
                state['player1_score'] += 1
                if state['player1_score'] >= 3:
                    self.stop_ball()
                else:
                    self.reset_ball()

        if state['ball_x'] - state['ball_radius'] < 0:
            if state['ball_y'] > state['player1_y'] and state['ball_y'] < state['player1_y'] + state['paddle_height']:
                state['ball_speed_x'] = -state['ball_speed_x'] * 1.1
            else:
                state['player2_score'] += 1
                if state['player2_score'] >= 3:
                    self.stop_ball()
                else:
                    self.reset_ball()

    def stop_ball(self):
        state = self.channel_layer.game_state[self.group_name]
        state['ball_x'] = state['canvas_width'] / 2
        state['ball_y'] = state['canvas_height'] / 2
        state['ball_speed_x'] = 0
        state['ball_speed_y'] = 0
        state['game_finished'] = 1

    def reset_ball(self):
        state = self.channel_layer.game_state[self.group_name]
        state['ball_x'] = state['canvas_width'] / 2
        state['ball_y'] = state['canvas_height'] / 2
        if state['player2_score'] < 3 and state['player1_score'] < 3:
            state['ball_speed_x'] = -state['ball_speed_x'] if state['ball_speed_x'] else 5

    async def game_state(self, event):
        await self.send(text_data=json.dumps({
            'game_finished': self.channel_layer.game_state[self.group_name]['game_finished'],
            'player1_score': self.channel_layer.game_state[self.group_name]['player1_score'],
            'player2_score': self.channel_layer.game_state[self.group_name]['player2_score'],
            'player1_y': event['player1_y'],
            'player2_y': event['player2_y'],
            'ball_x': event['ball_x'],
            'ball_y': event['ball_y'],
        }))


class PongLocalAiConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        username = self.scope['user'].username
        self.group_name = f"pong_game_{username}"

        await self.channel_layer.group_add(self.group_name, self.channel_name)

        if not hasattr(self.channel_layer, "game_state"):
            self.channel_layer.game_state = {}

        if self.group_name not in self.channel_layer.game_state:
            self.channel_layer.game_state[self.group_name] = {
                'game_finished': 0,
                'player1_score': 0,
                'player2_score': 0,
                'paddle_height': 100,
                'canvas_height': 500,
                'canvas_width': 775,
                'ball_speed_x': 0,
                'ball_speed_y': 0,
                'ball_x': 400,
                'ball_y': 200,
                'ball_radius': 10,
                'player1_y': 200 - 50,
                'player2_y': 200 - 50,
                'player1_up': False,
                'player1_down': False,
                'player2_up': False,
                'player2_down': False,
            }

        if 'player1' not in self.channel_layer.game_state[self.group_name]:
            self.channel_layer.game_state[self.group_name]['player1'] = self.scope['user']
            self.player = 'player1'
        elif 'player2' not in self.channel_layer.game_state[self.group_name]:
            self.channel_layer.game_state[self.group_name]['player2'] = self.scope['user']
            self.player = 'player2'
        else:
            await self.close()
            return

        self.game_task = asyncio.create_task(self.game_loop())
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        self.game_task.cancel()
        if self.player == 'player1':
            del self.channel_layer.game_state[self.group_name]['player1']
        elif self.player == 'player2':
            del self.channel_layer.game_state[self.group_name]['player2']
        if 'player1' not in self.channel_layer.game_state[self.group_name] and 'player2' not in self.channel_layer.game_state[self.group_name]:
            del self.channel_layer.game_state[self.group_name]

    async def receive(self, text_data=None, bytes_data=None):
        if text_data and self.channel_layer.game_state:
            data = json.loads(text_data)
            action = data['action']
            state = self.channel_layer.game_state[self.group_name]
            if data['player'] == 'player1':
                if action == 'up':
                    state['player1_up'] = True
                elif action == 'down':
                    state['player1_down'] = True
                elif action == 'stop_up':
                    state['player1_up'] = False
                elif action == 'stop_down':
                    state['player1_down'] = False
            elif data['player'] == 'player2':
                self.update_ai()


    def update_ai(self):
        state = self.channel_layer.game_state[self.group_name]
        paddle_height = state['paddle_height']
        ball_radius = state['ball_radius']
        distance_to_ai = state['canvas_width'] - state['ball_x']
        delta = 0
        paddle_center_y = state['player2_y'] + paddle_height / 2
        if state['ball_speed_x'] != 0:
            delta = state['ball_y'] + distance_to_ai * state['ball_speed_y'] / state['ball_speed_x']
        while delta < 0 or delta > state['canvas_height']:
            if delta < 0:
                delta = -delta
            elif delta > state['canvas_height']:
                delta = 2 * state['canvas_height'] - delta
        if abs(delta - paddle_center_y) < 30:
            state['player2_up'] = False
            state['player2_down'] = False
        elif delta > paddle_center_y:
            state['player2_up'] = False
            state['player2_down'] = True
            state['player2_y'] += 7
        else:
            state['player2_down'] = False
            state['player2_up'] = True
            state['player2_y'] -= 7
        if state['player2_y'] < 0:
            state['player2_y'] = 0
        elif state['player2_y'] > state['canvas_height'] - paddle_height:
            state['player2_y'] = state['canvas_height'] - paddle_height

    async def game_loop(self):
        while True:
            try:
                self.update_game_state()
                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        'type': 'game_state',
                        'player1_y': self.channel_layer.game_state[self.group_name]['player1_y'],
                        'player2_y': self.channel_layer.game_state[self.group_name]['player2_y'],
                        'ball_x': self.channel_layer.game_state[self.group_name]['ball_x'],
                        'ball_y': self.channel_layer.game_state[self.group_name]['ball_y'],
                    }
                )
            except Exception as e:
                print(f"Exception in game_loop: {e}")
            if self.channel_layer.game_state[self.group_name]['game_finished'] == 1:
                break
            await asyncio.sleep(1/30)

    def update_game_state(self):
        state = self.channel_layer.game_state[self.group_name]
        if state['ball_speed_x'] == 0:
            state['ball_speed_x'] = 5
            state['ball_speed_y'] = 5
        if state['player1_up'] and state['player1_y'] > 0:
            state['player1_y'] -= 7
        if state['player1_down'] and state['player1_y'] < state['canvas_height'] - state['paddle_height']:
            state['player1_y'] += 7
        if state['player2_up'] and state['player2_y'] > 0:
            state['player2_y'] -= 7
        if state['player2_down'] and state['player2_y'] < state['canvas_height'] - state['paddle_height']:
            state['player2_y'] += 7

        state['ball_x'] += state['ball_speed_x']
        state['ball_y'] += state['ball_speed_y']

        if state['ball_y'] + state['ball_radius'] > state['canvas_height'] or state['ball_y'] - state['ball_radius'] < 0:
            state['ball_speed_y'] = -state['ball_speed_y']

        if state['ball_x'] + state['ball_radius'] > state['canvas_width']:
            if state['ball_y'] > state['player2_y'] and state['ball_y'] < state['player2_y'] + state['paddle_height']:
                state['ball_speed_x'] = -state['ball_speed_x'] * 1.1
            else:
                state['player1_score'] += 1
                if state['player1_score'] >= 3:
                    self.stop_ball()
                else:
                    self.reset_ball()

        if state['ball_x'] - state['ball_radius'] < 0:
            if state['ball_y'] > state['player1_y'] and state['ball_y'] < state['player1_y'] + state['paddle_height']:
                state['ball_speed_x'] = -state['ball_speed_x'] * 1.1
            else:
                state['player2_score'] += 1
                if state['player2_score'] >= 3:
                    self.stop_ball()
                else:
                    self.reset_ball()

    def stop_ball(self):
        state = self.channel_layer.game_state[self.group_name]
        state['ball_x'] = state['canvas_width'] / 2
        state['ball_y'] = state['canvas_height'] / 2
        state['ball_speed_x'] = 0
        state['ball_speed_y'] = 0
        state['game_finished'] = 1

    def reset_ball(self):
        state = self.channel_layer.game_state[self.group_name]
        state['ball_x'] = state['canvas_width'] / 2
        state['ball_y'] = state['canvas_height'] / 2
        if state['player2_score'] < 3 and state['player1_score'] < 3:
            state['ball_speed_x'] = -state['ball_speed_x'] if state['ball_speed_x'] else 5

    async def game_state(self, event):
        await self.send(text_data=json.dumps({
            'game_finished': self.channel_layer.game_state[self.group_name]['game_finished'],
            'player1_score': self.channel_layer.game_state[self.group_name]['player1_score'],
            'player2_score': self.channel_layer.game_state[self.group_name]['player2_score'],
            'player1_y': event['player1_y'],
            'player2_y': event['player2_y'],
            'ball_x': event['ball_x'],
            'ball_y': event['ball_y'],
        }))
