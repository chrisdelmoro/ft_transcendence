#!/bin/sh

# Parar o Nginx temporariamente para liberar a porta 80
nginx -s stop || true

# Obter o certificado SSL do Let's Encrypt

certbot certonly --standalone --non-interactive --agree-tos --email $EMAIL -d $DOMAIN -d www.$DOMAIN

# Reiniciar o Nginx
nginx
