from django.shortcuts import render, redirect , get_object_or_404
from django.http import JsonResponse, HttpResponseForbidden
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt
import json
from django.contrib.auth.decorators import login_required
from .models import Room

@login_required
def room_pong(request):
    rooms = Room.objects.filter(hiden=0)
    user = request.user
    context = {
     "rooms":rooms,
     "user":user
    }
    return render(request,template_name="homepageroom.html",context=context)


@login_required
def roomview(request, uuid):
    room = get_object_or_404(Room, uuid=uuid)
    if request.user not in room.members.all():
       return HttpResponseForbidden("You are not a member of this group.\
                                       Kindly use the join button")
    return render(request, 'game/pong.html')

def game(request):
    return render(request, 'game.html')

def pong_game(request):
    return render(request, 'pong_game.html')

def game_local(request, username):
    return render(request, 'game_local.html', {'username': username})


def game_tournement(request, username):
    return render(request, 'tournement.html', {'username': username})

def game_localAi(request, username):
    return render(request, 'game_localAi.html', {'username': username})
