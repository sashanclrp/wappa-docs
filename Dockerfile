# Multi-stage build for Wappa Documentation
# Optimized for Railway deployment with Material-MkDocs

# Build stage - Generate static documentation site
FROM python:3.12-slim as builder

WORKDIR /app

# Install uv for fast dependency management
RUN pip install uv

# Copy dependency files
COPY pyproject.toml ./
COPY uv.lock ./

# Install documentation dependencies
RUN uv sync --frozen

# Copy documentation source files
COPY docs/ ./docs/
COPY mkdocs.yml ./
COPY overrides/ ./overrides/

# Build static documentation site
RUN uv run mkdocs build --clean --strict

# Production stage - Serve with nginx
FROM nginx:alpine

# Copy built documentation from builder stage
COPY --from=builder /app/site /usr/share/nginx/html

# Create custom nginx configuration for single-page app routing
RUN echo 'server { \
    listen 80; \
    listen [::]:80; \
    server_name _; \
    \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Enable gzip compression \
    gzip on; \
    gzip_vary on; \
    gzip_min_length 1024; \
    gzip_proxied any; \
    gzip_comp_level 6; \
    gzip_types \
        text/plain \
        text/css \
        text/xml \
        text/javascript \
        application/javascript \
        application/xml+rss \
        application/json; \
    \
    # Cache static assets \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
        access_log off; \
    } \
    \
    # Handle all routes for documentation \
    location / { \
        try_files $uri $uri/ $uri.html /index.html; \
    } \
    \
    # Security headers \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    add_header Referrer-Policy "strict-origin-when-cross-origin" always; \
}' > /etc/nginx/conf.d/default.conf

# Health check for Railway
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Install curl for health checks
RUN apk add --no-cache curl

# Expose port 80 for Railway
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]