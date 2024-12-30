from django.db import models
from django.contrib.auth.models import AbstractUser
from main_backend import settings

# Create your models here.

class CustomUser(AbstractUser):
    username = models.CharField(unique=True, default='', max_length=50)
    first_name = models.CharField(default='', max_length=50)
    last_name = models.CharField(default='', max_length=50)
    email = models.EmailField(unique=True, default='', max_length=254)
    image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    external_image_url = models.CharField(blank=True, null=True)
    password = models.CharField(default='', max_length=255)

    def save(self, *args, **kwargs):
        # Leave the image field blank unless explicitly set
        if not self.image and not self.external_image_url:
            self.image = 'profile_images/Default-welcomer.png'
        super().save(*args, **kwargs)

    @property
    def image_url(self):
        """Return the image URL, prefer local image if available."""
        if self.image:  # Check if an image is set (user-uploaded or default)
            return f"{settings.MEDIA_URL}{self.image.name}"
        elif self.external_image_url:  # If there's an external URL
            return self.external_image_url
        else:  # Use default static path
            return f"{settings.STATIC_URL}profile_images/Default-welcomer.png"

    def anonymize(self):
        self.first_name = "Anonymous"
        self.last_name = ""
        self.email = f"anon_{self.id}@example.com"
        self.username = f"anon_{self.id}"
        self.image = f"profile_images/Default-welcomer.png"
        self.save()
    
    def __str__(self):
        return self.username