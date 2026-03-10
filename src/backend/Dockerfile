FROM python:3.11-slim

# Prevent debconf warnings
ENV DEBIAN_FRONTEND=noninteractive
# Prevent Python from writing .pyc bytecode files
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install uv for faster dependency management
RUN pip install --no-cache-dir uv

# Copy all source files needed for install
COPY pyproject.toml ./
COPY app/ ./app/
COPY applicationinsights.json ./

# Create venv and install dependencies with prerelease support
RUN uv venv && \
    . .venv/bin/activate && \
    uv pip install -e . --prerelease=allow && \
    find /app -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/status').read()"

# Run application
CMD [".venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
