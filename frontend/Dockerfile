# Dockerfile for Frontend
FROM nginx:latest

# Copy the static HTML file to Nginx's root directory as defined in your nginx.conf
COPYY index.html /usr/share/nginx/html/

# Copy the custom nginx.conf file into the container
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80 for HTTP access
EXPOSE 80

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
