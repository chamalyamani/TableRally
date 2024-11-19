from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class CustomUser(AbstractUser):
    username = models.CharField(unique=True, default='', max_length=50)
    email = models.EmailField(unique=True, default='', max_length=254)
    image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    external_image_url = models.CharField(blank=True, null=True)
    password = models.CharField(default='', max_length=255)

    def save(self, *args, **kwargs):
        # Set default image if none provided
        if not self.image and not self.external_image_url:
            self.image = 'Default-welcomer.png'
        super().save(*args, **kwargs)

    @property
    def image_url(self):
        """Returns the image URL, preferring the local image if available."""
        if self.image:
            return self.image.url  # Uses the local image if available
        elif self.external_image_url:
            return self.external_image_url  # Fallback to external URL
        else: 
            return 'Default-welcomer.png'  # Default image path
    
    def __str__(self):
        return self.username