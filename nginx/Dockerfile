FROM debian:bullseye


RUN apt-get update -y 
RUN apt-get install -y nginx
RUN apt-get install -y vim
RUN apt-get install -y curl
RUN apt-get install -y wget
RUN mkdir -p /etc/nginx/ssl
RUN apt-get install libnss3-tools -y
RUN wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64
RUN mv mkcert-v1.4.4-linux-amd64 mkcert
RUN chmod +x mkcert
RUN cp mkcert /usr/local/bin/

COPY ./default.conf /etc/nginx/nginx.conf


RUN mkcert -key-file /etc/nginx/ssl/ft_transcendence.key -cert-file /etc/nginx/ssl/ft_transcendence.crt bess-f2r4s14

EXPOSE 443


CMD ["nginx", "-g", "daemon off;"]
