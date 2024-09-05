from django.urls import path
from .views import login_page, login_api, register, profile_view, profile_update_view , CustomLogoutView,see_profile, list_users, add_friend,remove_friend,block_user,unblock_user
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('login/', login_page, name='login_page'),
    path('login_api/', login_api, name='login_api'),
    path('register/', register, name='register'),
    path('profile/', profile_view, name='profile'),
    path('profile/update/', profile_update_view, name='profile_update'),
    path('profile/<str:username>/', see_profile, name='profile of'),
    path('logout/', CustomLogoutView.as_view(), name='logout'),
    path('user_list/', list_users, name='list_user'),
    path('add_friend/', add_friend, name='add_friend'),
    path('remove_friend/', remove_friend, name='remove_friend'),
    path('block_user/', block_user, name='block_user'),
    path('unblock_user/', unblock_user, name='unblock_user'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
