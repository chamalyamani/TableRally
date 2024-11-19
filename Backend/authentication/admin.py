from django.contrib import admin
from .models import CustomUser
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin
from .forms import CustomUserCreationForm, CustomUserChangeForm

# Register your models here.

CustomUser = get_user_model()
class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser

    # Display fields in the admin list view
    list_display = ['id', 'username','first_name', 'last_name', 'email', 'image', 'external_image_url']

    # Fieldsets for the user detail page
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal Info', {'fields': ('email',)}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    # Fieldsets for the user creation page
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email','first_name', 'last_name', 'password1', 'password2')}
        ),
    )

    search_fields = ('username', 'email')
    ordering = ('username',)

# Register the customized admin
admin.site.register(CustomUser, CustomUserAdmin)