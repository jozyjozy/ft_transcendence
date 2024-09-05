from django.urls import path
from .views import oauth42, Oauth_link

urlpatterns = [
    path('oauth42/', oauth42, name='oauth42'),
    path('Oauth_link', Oauth_link, name='Oauth_link')
]