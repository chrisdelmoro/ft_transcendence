#!/bin/sh

# Substituir variáveis de ambiente no site.conf
envsubst '$$DOMAIN' < /etc/nginx/conf.d/site.template > /etc/nginx/conf.d/site.conf

# Parar o Nginx temporariamente para liberar a porta 80
nginx -s stop || true

# Obter o certificado SSL do Let's Encrypt ou gerar certificado autoassinado
if [ "$DOMAIN" == "localhost" ]; then
  mkdir -p /etc/letsencrypt/live/$DOMAIN
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
    -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
    -subj "/CN=$DOMAIN"
  chmod 644 /etc/letsencrypt/live/$DOMAIN/fullchain.pem
  chmod 600 /etc/letsencrypt/live/$DOMAIN/privkey.pem
else
  if [ ! -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
    /get_certificate.sh
  fi
fi

# Iniciar o Nginx
nginx -g "daemon off;"