from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()

class Friendship(models.Model):
    STATUS_CHOICES = [
        ('A', 'Accepted'),
        ('P', 'Pending'),
        ('B', 'Blocked'),
        ('R', 'Rejected'),  # For rejected requests
    ]

    from_user = models.ForeignKey(User, related_name='friendship_requests_sent', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='friendship_requests_received', on_delete=models.CASCADE)
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default='P')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('from_user', 'to_user')

    def __str__(self):
        return f"{self.from_user} -> {self.to_user} : {self.get_status_display()}"

class Notification(models.Model):
    RECIPIENT_ACTIONS = [
        ('FRIEND_REQUEST_SENT', 'sent you a friend request'),
        ('FRIEND_REQUEST_ACCEPTED', 'accepted your friend request'),
    ]

    recipient = models.ForeignKey(User, related_name='notifications', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, related_name='sent_notifications', on_delete=models.CASCADE)
    action = models.CharField(max_length=50, choices=RECIPIENT_ACTIONS)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender} -> {self.recipient}: {self.action}"