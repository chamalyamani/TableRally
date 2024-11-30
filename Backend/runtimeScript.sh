pip install --upgrade pip --root-user-action=ignore

pip install -r requirements.txt --root-user-action=ignore

# Collect static files (optional)
python manage.py collectstatic --noinput
python manage.py makemigrations
python manage.py migrate
python manage.py update_site
python manage.py runserver 0.0.0.0:8000
# daphne -b 0.0.0.0 -p 8000 main_backend.asgi:application