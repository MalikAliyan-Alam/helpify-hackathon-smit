# ==========================================
# Stage 1: Build the React application
# ==========================================
# Using the Alpine version of node:18 for a smaller base image size
FROM node:20-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available) first.
# This takes advantage of Docker layer caching to speed up subsequent builds
# as long as dependencies haven't changed.
COPY package*.json ./

# Install dependencies cleanly using npm ci (or fallback to install)
RUN npm ci || npm install

# Copy the rest of the application source code into the container
COPY . .

# Build the application for production.
# This creates an optimized production build in the "build" folder.
RUN npm run build


# ==========================================
# Stage 2: Serve the application with Nginx
# ==========================================
# Using the Alpine version of nginx to keep the final image size minimal
FROM nginx:alpine

# Remove default nginx static assets to keep the image clean
RUN rm -rf /usr/share/nginx/html/*

# Copy our custom nginx configuration file into the container.
# This configures nginx to listen on port 8080 and support React Router.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built React app from the first stage to the nginx web root directory.
# Note: Vite uses the "dist" directory by default for production builds.
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 8080 as required by Google Cloud Run
EXPOSE 8080

# Start nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
