# your_app/management/commands/update_site.py

from django.core.management.base import BaseCommand
from django.contrib.sites.models import Site
from django.conf import settings
import os

class Command(BaseCommand):
    help = 'Updates the Site object with domain and name from environment variables'

    def handle(self, *args, **kwargs):
        domain = os.getenv('DJANGO_SITE_DOMAIN')
        name = os.getenv('DJANGO_SITE_NAME')

        try:
            site = Site.objects.get(id=settings.SITE_ID)
            site.domain = domain
            site.name = name
            site.save()
            self.stdout.write(self.style.SUCCESS(f'Successfully updated Site: {domain}'))
        except Site.DoesNotExist:
            self.stderr.write(self.style.ERROR(f'Site with id {settings.SITE_ID} does not exist.'))
