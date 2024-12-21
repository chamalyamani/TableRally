FROM python:bullseye

COPY req.txt /


RUN pip install -r req.txt

WORKDIR /PongGame/django/

CMD [ "sh", "-c", "python manage.py makemigrations && python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]