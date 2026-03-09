# Stage 1: Build React app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production=false

# Copy source code
COPY . .

# Build app with relative API URL (nginx proxies to backend)
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:alpine

# Copy built files from 'build' directory (not 'dist')
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration as template (uses $BACKEND_URL)
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Only substitute BACKEND_URL, preserve other nginx variables ($uri, $host, etc.)
ENV NGINX_ENVSUBST_FILTER=BACKEND_URL

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
