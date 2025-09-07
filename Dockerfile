# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (using ci for faster, reproducible builds)
RUN npm ci

# Copy source code
COPY . .

# Build arguments for Vite environment variables
ARG VITE_AUTH_EMAIL
ARG VITE_AUTH_PASSWORD

# Set environment variables for build
ENV VITE_AUTH_EMAIL=$VITE_AUTH_EMAIL
ENV VITE_AUTH_PASSWORD=$VITE_AUTH_PASSWORD

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add a simple health check endpoint
RUN echo "OK" > /usr/share/nginx/html/health

# Configure nginx to handle client-side routing
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
    location /health { \
        access_log off; \
        return 200 "OK"; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
