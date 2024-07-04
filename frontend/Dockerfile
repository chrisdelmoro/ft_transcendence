# Usar a imagem oficial do Nginx como base
FROM nginx:alpine

# Instalar o Certbot para obter certificados SSL
RUN apk add --no-cache certbot openssl

# Copiar os arquivos estáticos para o Nginx
COPY . /usr/share/nginx/html

# Copiar o arquivo de configuração do Nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY site.conf /etc/nginx/conf.d/site.template

# Criar diretórios necessários para os certificados
RUN mkdir -p /etc/letsencrypt/live /var/lib/letsencrypt

# Adicionar script para obter certificado SSL
COPY get_certificate.sh /get_certificate.sh
RUN chmod +x /get_certificate.sh

# Script para substituir variáveis de ambiente no site.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expor a porta que o Nginx está rodando (80 e 443)
EXPOSE 443

# Comando para rodar o Nginx e obter o certificado
ENTRYPOINT ["/docker-entrypoint.sh"]

