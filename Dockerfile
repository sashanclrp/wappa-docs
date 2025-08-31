# Production Dockerfile for Wappa Documentation
# Based on official MkDocs Material deployment patterns

FROM python:3.12-slim

WORKDIR /docs

# Install system dependencies for MkDocs Material
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libcairo2-dev \
    libfreetype6-dev \
    libffi-dev \
    libjpeg-dev \
    libpng-dev \
    libz-dev \
    && rm -rf /var/lib/apt/lists/*

# Install MkDocs Material with imaging support
RUN pip install "mkdocs-material[imaging]"

# Install additional plugins from pyproject.toml
COPY pyproject.toml ./
RUN pip install mkdocs-mermaid2-plugin mkdocs-git-revision-date-localized-plugin mkdocs-minify-plugin

# Copy documentation source files
COPY docs/ ./docs/
COPY mkdocs.yml ./
COPY overrides/ ./overrides/

# Set environment to suppress git warnings (they're harmless)
ENV GIT_PYTHON_REFRESH=quiet

# Railway uses PORT environment variable, default to 8000
ENV PORT=8000

# Expose port for Railway
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:$PORT/ || exit 1

# Start MkDocs server on Railway's assigned port
CMD mkdocs serve --dev-addr 0.0.0.0:$PORT