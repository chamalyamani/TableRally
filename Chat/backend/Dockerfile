FROM python:3.12

RUN mkdir Chat && mkdir Backend

WORKDIR /Chat/

RUN pip install pipenv

COPY ../Pipfile ../Pipfile.lock ./

RUN mkdir backend

COPY backend/ backend/

WORKDIR /Chat/backend/

RUN pipenv install --ignore-pipfile

EXPOSE 8000

WORKDIR /Chat/backend/

CMD ["pipenv", "run", "sh", "-c", "python manage.py makemigrations && python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]