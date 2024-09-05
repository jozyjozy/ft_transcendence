from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
import json
from .models import Profile
from .forms import UserCreationForm, ProfileUpdateForm, UserUpdateForm
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.contrib.auth import views as auth_views
from django.shortcuts import resolve_url

@login_required
def see_profile(request, username):
    user = get_object_or_404(User, username=username)
    profile = get_object_or_404(Profile, user=user)
    return render(request, 'See_profile.html', {'profile': profile})

@login_required
def list_users(request):
    profiles = Profile.objects.all()
    return render(request, 'list_users.html', {'profiles': profiles})

@csrf_exempt
def login_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                profile = Profile.objects.get(user=user)
                profile.status = 'online'
                profile.save()
                return JsonResponse({'success': True})
            else:
                return JsonResponse({'success': False, 'message': 'Invalid credentials'})
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': 'Invalid JSON'})
    else:
        return JsonResponse({'success': False, 'message': 'Invalid request method'})

def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST, request.FILES)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password'])
            user.save()
            profile, created = Profile.objects.get_or_create(user=user)
            profile.refresh_from_db()
            profile.profile_picture = form.cleaned_data['profile_picture']
            profile.save()
            user.backend = 'sesame.backends.ModelBackend'
            login(request, user)
            profile = Profile.objects.get(user=user)
            profile.status = 'online'
            profile.save()
            return JsonResponse({'success': True, 'redirect_url': settings.ID_SERVER})
        else:
            errors = {field: form.errors[field].as_text() for field in form.errors}
            return JsonResponse({'success': False, 'errors': errors}, status=400)

    form = UserCreationForm()
    return render(request, 'register.html', {'user_form': form})

@login_required
def profile_view(request):
    profile = Profile.objects.get(user=request.user)
    return render(request, 'profile.html', {'profile': profile})

def login_page(request):
    return render(request, 'login.html')



class CustomLogoutView(auth_views.LogoutView):
    def dispatch(self, request, *args, **kwargs):
        profile = Profile.objects.get(user=self.request.user)
        profile.status = 'offline'
        profile.save()
        response = super().dispatch(request, *args, **kwargs)
        return redirect(settings.ID_SERVER)

@login_required
def profile_update_view(request):
    if request.method == 'POST':
        user_form = UserUpdateForm(request.POST, instance=request.user)
        profile_form = ProfileUpdateForm(request.POST, request.FILES, instance=request.user.profile)

        if user_form.is_valid() and profile_form.is_valid():
            user_form.save()
            profile_form.save()
            response_data = {
                'success': True,
            }
            return JsonResponse(response_data)
        else:
            errors = {}
            if user_form.errors:
                errors['user'] = user_form.errors.as_json()
            if profile_form.errors:
                errors['profile'] = profile_form.errors.as_json()

            response_data = {
                'success': False,
                'errors': errors
            }
            return JsonResponse(response_data, status=400)

    else:
        user_form = UserUpdateForm(instance=request.user)
        profile_form = ProfileUpdateForm(instance=request.user.profile)

    context = {
        'user_form': user_form,
        'profile_form': profile_form
    }
    return render(request, 'profile_update.html', context)

@login_required
def add_friend(request):
    userprofile = get_object_or_404(Profile, user=request.user)
    if request.method == 'GET' and 'profile_id' in request.GET:
        profile_id = request.GET['profile_id']
        profile = get_object_or_404(Profile, id=profile_id)
        if profile not in userprofile.friends.all():
            userprofile.friends.add(profile)
            return JsonResponse({'status': 'success', 'message': 'Friend added'})
    return JsonResponse({'status': 'error', 'message': 'Failed to add friend'})

@login_required
def remove_friend(request):
    userprofile = get_object_or_404(Profile, user=request.user)
    if request.method == 'GET' and 'profile_id' in request.GET:
        profile_id = request.GET['profile_id']
        profile = get_object_or_404(Profile, id=profile_id)
        if profile in userprofile.friends.all():
            userprofile.friends.remove(profile)
            return JsonResponse({'status': 'success', 'message': 'Friend removed'})
    return JsonResponse({'status': 'error', 'message': 'Failed to remove friend'})

@login_required
def block_user(request):
    userprofile = get_object_or_404(Profile, user=request.user)
    if request.method == 'GET' and 'profile_id' in request.GET:
        profile_id = request.GET['profile_id']
        profile = get_object_or_404(Profile, id=profile_id)
        if profile not in userprofile.blockers.all():
            userprofile.blockers.add(profile)
            if profile in userprofile.friends.all():
                userprofile.friends.remove(profile)
            return JsonResponse({'status': 'success', 'message': 'User blocked'})
    return JsonResponse({'status': 'error', 'message': 'Failed to block user'})

@login_required
def unblock_user(request):
    userprofile = get_object_or_404(Profile, user=request.user)
    if request.method == 'GET' and 'profile_id' in request.GET:
        profile_id = request.GET['profile_id']
        profile = get_object_or_404(Profile, id=profile_id)
        if profile in userprofile.blockers.all():
            userprofile.blockers.remove(profile)
            return JsonResponse({'status': 'success', 'message': 'User unblocked'})
    return JsonResponse({'status': 'error', 'message': 'Failed to unblock user'})