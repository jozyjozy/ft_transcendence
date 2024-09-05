from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt
import json

def homepage(request):
    return render(request, 'homepage.html')

def testws(request):
    return render(request, 'testws.html')

def get_user(request):
    user = request.user
    print(request)
    return JsonResponse(user.json())