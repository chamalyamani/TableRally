from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()

class Friendship(models.Model):
    REQUEST_STATUS_CHOICES = [
        ('P', 'Pending'),
        ('A', 'Accepted'),
        ('R', 'Rejected'),
    ]
    
    from_user = models.ForeignKey(User, related_name='sent_requests', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='received_requests', on_delete=models.CASCADE)
    status = models.CharField(max_length=1, choices=REQUEST_STATUS_CHOICES, default='P')
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        unique_together = ('from_user', 'to_user')  # Prevent duplicate requests

    def __str__(self):
        return f"{self.from_user} -> {self.to_user} ({self.status})"


class Block(models.Model):
    blocker = models.ForeignKey(User, related_name='blocker', on_delete=models.CASCADE)
    blocked = models.ForeignKey(User, related_name='blocked', on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('blocker', 'blocked')

    def __str__(self):
        return f"{self.blocker} blocked {self.blocked}"

class Notification(models.Model):
    RECIPIENT_ACTIONS = [
        ('FRIEND_REQUEST_SENT', 'sent you a friend request'),
        ('FRIEND_REQUEST_ACCEPTED', 'accepted your friend request'),
        # ('FRIEND_REQUEST_REJECTED', 'Reject your friend request'),
        # ('FRIEND_REMOVED', 'Removed your friend request'),
        # ('FRIEND_REQUEST_CANCELED', 'Friend Request Canceled'),
    ]

    recipient = models.ForeignKey(User, related_name='notifications', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, related_name='sent_notifications', on_delete=models.CASCADE)
    action = models.CharField(max_length=50, choices=RECIPIENT_ACTIONS)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender} -> {self.recipient}: {self.action}"