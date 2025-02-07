# Use Ubuntu as the base image
FROM ubuntu:latest

# Set a non-interactive frontend for apt-get
ENV DEBIAN_FRONTEND=noninteractive

# Set the working directory
WORKDIR /app

COPY index.html .

# Install Node.js, npm, and Apache
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    curl \
    apache2 \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Move index.html to Apache's default web directory
RUN cp /app/index.html /var/www/html/

# Expose ports (80 for Apache, 3000 for Node.js)
EXPOSE 80 3000

# Start Apache and Node.js
CMD service apache2 start && node /app/app.js
