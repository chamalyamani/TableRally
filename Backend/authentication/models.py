from django.db import models
from django.contrib.auth.models import AbstractUser
from main_backend import settings
from cryptography.fernet import Fernet

# Create your models here.

class CustomUser(AbstractUser):
    username = models.CharField(unique=True, default='', max_length=50)
    first_name = models.CharField(default='', max_length=50)
    last_name = models.CharField(default='', max_length=50)
    email = models.EmailField(unique=True, default='', max_length=254)
    image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    external_image_url = models.CharField(blank=True, null=True)
    password = models.CharField(default='', max_length=255)
    external_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    is_anonymized = models.BooleanField(default=False)
    original_username = models.CharField(default='', max_length=50)
    original_first_name = models.CharField(default='', max_length=50)
    original_last_name = models.CharField(default='', max_length=50)
    original_email = models.EmailField(default='', blank=True)
    original_image = models.ImageField(blank=True, null=True)
    original_external_image_url = models.CharField(blank=True, null=True)


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
        self.original_username = self.username
        self.original_first_name = self.first_name
        self.original_last_name = self.last_name
        self.original_email = self.email
        self.original_image = self.image
        self.original_external_image_url = self.external_image_url

        if not self.is_anonymized:
            self.original_username = self.original_username or self.username
            self.original_first_name = self.original_first_name or self.first_name
            self.original_last_name = self.original_last_name or self.last_name
            self.original_email = self.original_email or self.email
            self.original_image = self.original_image or self.image

            self.username = f"anon_{self.id}"
            self.first_name = "Anonymous"
            self.last_name = ""
            self.email = f"anon_{self.id}@example.com"
            self.image = "profile_images/Default-welcomer.png"
            self.external_image_url = None
            self.is_anonymized = True
            self.save()

    def unanonymize(self):
        if self.is_anonymized:
            self.username = self.original_username or self.username
            self.first_name = self.original_first_name or self.first_name
            self.last_name = self.original_last_name or self.last_name
            self.email = self.original_email or self.email
            if self.original_image:  # Prefer the user-uploaded image
                self.image = self.original_image
                self.external_image_url = None  # Clear external URL since the local image takes priority
            elif self.original_external_image_url:  # Otherwise, restore the external image
                self.external_image_url = self.original_external_image_url
                self.image = None 

            self.is_anonymized = False
            self.save()
    
    def __str__(self):
        return self.username