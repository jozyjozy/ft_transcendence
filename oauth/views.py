from django.shortcuts import render, redirect
from django.http import HttpResponse
import requests
from django.contrib.auth.models import User
from django.http import JsonResponse
from login.models import Profile
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
import os
from django.conf import settings
from django.db import transaction
from urllib.parse import quote

def get_coa(datacoa):
    for elem in datacoa:
        if elem["coalition_id"] == 45:
           return("The Federation")
        if elem["coalition_id"] == 46:
            return("The Alliance")
        if elem["coalition_id"] == 47: 
            return("The Order")
        if elem["coalition_id"] == 48:
            return("The Assembly")

def oauth42(request):
    code = request.GET.get('code', None)
    params = {
            'grant_type': 'authorization_code',
            'client_id': settings.CLIENTID,
            'client_secret': settings.CLIENTSECRET,
            'code': request.GET.get('code'),
            'redirect_uri': settings.ID_SERVER + '/oauth42/'
        }
    response = requests.post('https://api.intra.42.fr/oauth/token', json=params)
    if response.status_code == 200:
        data = response.json()
        headers ={
            'accept': 'application/json',
            'Authorization': 'Bearer ' + data["access_token"],
        }
        response = requests.get('https://api.intra.42.fr/v2/me', headers=headers)
        if response.status_code == 200:
            data = response.json()
            user, created = User.objects.get_or_create(username=data["login"], email=data["email"])
            if created:
                profile_picture = data["image"]["link"]
                response = requests.get("https://api.intra.42.fr/v2/users/" + data["login"] + "/coalitions_users", headers=headers)
                if response.status_code == 200:
                    datacoa = response.json()
                    coalition = get_coa(datacoa)
                response = requests.get(profile_picture)
                profile_picture = data["login"]
                if response.status_code == 200:
                    base_dir = os.path.dirname(__file__)
                    parent_dir = os.path.dirname(base_dir)
                    parent_dir += "/media"
                    destination = os.path.join(parent_dir, profile_picture)
                    destination += ".jpg"
                    os.makedirs(os.path.dirname(destination), exist_ok=True)
                    with open(destination, 'wb') as f:
                        f.write(response.content)
            user.backend = 'sesame.backends.ModelBackend'
            profile = Profile.objects.get(user=user)
            profile.status = 'online'
            profile.save()
            login(request, user)
            if created:
                profile, created = Profile.objects.get_or_create(user=user)
                profile.refresh_from_db()
                profile.coalition = coalition
                profile.status = 'online'
                profile.profile_picture = profile_picture + ".jpg"
                profile.save()
                profile.refresh_from_db()
            return render(request, 'homepage.html')
        else:
            return JsonResponse({'error': 'Failed to fetch user data'}, status=response.status_code)
    else:
        print(response.json())
        return JsonResponse({'error': 'Failed to fetch token'}, status=response.status_code)
    



def Oauth_link(request):
    url = "https://api.intra.42.fr/oauth/authorize?client_id=" + settings.CLIENTID + "&redirect_uri=" + quote(settings.ID_SERVER + "/oauth42/", safe='') + "&response_type=code"
    return redirect(url)