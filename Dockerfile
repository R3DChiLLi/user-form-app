# Use Ubuntu as the base image
FROM ubuntu:latest

# Set a non-interactive frontend for apt-get (avoids prompts during install)
ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

COPY index.html .

RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    curl \
    nginx \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

RUN cp /app/index.html /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 3000

CMD service nginx start && node /app/app.js
