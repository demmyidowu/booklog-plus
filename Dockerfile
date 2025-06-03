# Use an official Node.js runtime as the base image
FROM node:18-slim as frontend-build

# Set working directory for frontend
WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies with reduced memory usage
RUN npm install --no-optional --production=false

# Copy frontend source
COPY frontend/ ./

# Build with increased memory limit and debug logging
RUN NODE_OPTIONS="--max-old-space-size=512" npm run build

# Use Python 3.9 image for the final stage
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies in a single layer to reduce image size
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --no-cache-dir --upgrade pip

# Copy Python requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the built frontend from previous stage
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Copy Python source code
COPY main.py .
COPY api/ api/
COPY core/ core/
COPY data/ data/

# Expose port
ENV PORT=5000
EXPOSE $PORT

# Start command
CMD ["python", "main.py"]
