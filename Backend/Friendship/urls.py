from django.urls import path
from Friendship.views import *
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import render
import requests

urlpatterns = [
    # path('status/<str:username>/', FriendshipStatusView.as_view(), name='friendship_status'),
    # path('send-request/', SendFriendRequestView.as_view(), name='send_friend_request'),
    # path('accept-request/<int:friendship_id>/', AcceptFriendRequestView.as_view(), name='accept_friend_request'),
    # path('reject-request/<int:friendship_id>/', RejectFriendRequestView.as_view(), name='reject_friend_request'),
    # path('', FriendsListView.as_view(), name='friends_list'),
    # path('cancel-outgoing-request/<int:friendship_id>/', CancelFriendRequestView.as_view(), name='cancel_friend_request'),
    # path('incoming-requests/', IncomingFriendRequestsView.as_view(), name='incoming_friend_requests'),
    # path('outgoing-requests/', OutgoingFriendRequestsView.as_view(), name='outgoing_friend_requests'),
    # path('remove/<str:username>/', RemoveFriendView.as_view(), name='remove_friend'),  # Updated URL
    # path('<str:username>/block/', BlockUserView.as_view(), name='block_user'),
    # path('<str:username>/unblock/', UnblockUserView.as_view(), name='unblock_user'),
    # path('is-blocked/<str:username>/', IsUserBlockedView.as_view(), name='is_user_blocked'),
    path('status/<str:username>/', FriendshipStatusView.as_view(), name='friendship_status'),
    path('send-request/', SendFriendRequestView.as_view(), name='send_friend_request'),
    path('accept-request/<int:friendship_id>/', AcceptFriendRequestView.as_view(), name='accept_friend_request'),
    path('reject-request/<int:friendship_id>/', RejectFriendRequestView.as_view(), name='reject_friend_request'),
    path('', FriendsListView.as_view(), name='friends_list'),
    path('cancel-outgoing-request/<int:friendship_id>/', CancelFriendRequestView.as_view(), name='cancel_friend_request'),
    path('remove/<str:username>/', RemoveFriendView.as_view(), name='remove_friend'),
    path('<str:username>/block/', BlockUserView.as_view(), name='block_user'),
    path('<str:username>/unblock/', UnblockUserView.as_view(), name='unblock_user'),
    path('is-blocked/<str:username>/', IsUserBlockedView.as_view(), name='is_user_blocked'),
    path('blocked/', BlockedUsersListView.as_view(), name='blocked_users_list'),
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('notifications/read/<int:id>/', MarkNotificationAsReadView.as_view(), name='mark_notification_as_read'),

]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)