from django.http import HttpResponseForbidden
from django.shortcuts import render, get_object_or_404
from .models import Group
from django.contrib.auth.decorators import login_required
from login.models import Profile

@login_required
def HomeView(request):
   groups = Group.objects.all()
   user = request.user
   context = {
       "groups":groups,
       "user":user
   }
   return render(request,template_name="chat/homechat.html",context=context)

@login_required
def GroupChatView(request, uuid):

   group = get_object_or_404(Group, uuid=uuid)
   if request.user not in group.members.all():
       return HttpResponseForbidden("You are not a member of this group.\
                                       Kindly use the join button")

   profile = Profile.objects.get(user=request.user)
   messages = group.message_set.all()

   events = group.event_set.all()

   message_and_event_list = [*messages, *events]

   sorted_message_event_list = sorted(message_and_event_list, key=lambda x :     x.timestamp)

   group_members = group.members.all()
   context ={
       "message_and_event_list":sorted_message_event_list,
       "group_members":group_members,
       }

   return render(request, template_name="chat/group.html", context=context)