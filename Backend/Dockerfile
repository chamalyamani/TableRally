FROM python:3.8

RUN apt-get update && apt-get install -y build-essential libpq-dev && apt-get clean
 
WORKDIR /app

COPY --chmod=755 runtimeScript.sh /bin

EXPOSE 8000

CMD ["sh", "/bin/runtimeScript.sh"]
