FROM nginx:1.27.2

RUN apt update -y
RUN   apt install openssl -y

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --chmod=755 script.sh /

CMD ["sh", "/script.sh"]