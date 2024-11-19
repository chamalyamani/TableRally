mkdir -p /etc/nginx/ssl

openssl req -x509 -nodes -out \
     /etc/nginx/ssl/trandandan.crt -keyout \
     /etc/nginx/ssl/trandandan.key -subj \
     "/C=FR/ST=IDF/L=Benguerir/O=1337/OU=42/CN=localhost/UID=smounafi"

nginx -g "daemon off;"