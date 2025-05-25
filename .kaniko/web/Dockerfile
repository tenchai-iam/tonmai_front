FROM nginx:1.23-alpine as runtime
WORKDIR /usr/share/nginx/html

COPY build .

RUN chmod -R +x /usr/share/nginx/html
RUN chown -R root:root /usr/share/nginx/html
RUN ls -la

COPY .kaniko/web/nginx/nginx.conf /etc/nginx/nginx.conf
COPY .kaniko/web/nginx/conf.d/ /etc/nginx/conf.d/
