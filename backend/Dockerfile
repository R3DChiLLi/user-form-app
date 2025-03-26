# Dockerfile for Backend
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json and install dependencies
COPYY package*.json ./
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose port 3000 for the Node.js app
EXPOSE 3000

# Start the Node.js application
CMD ["node", "app.js"]
