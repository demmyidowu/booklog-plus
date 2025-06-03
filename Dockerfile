# Use an official Node.js runtime as the base image
FROM node:18-slim as frontend-build

# Set working directory for frontend
WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy frontend source
COPY frontend/ ./

# Build frontend
RUN npm run build

# Use Python 3.9 image for the final stage
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --no-cache-dir --upgrade pip

# Copy Python requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the built frontend from previous stage
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Copy Python source code
COPY main.py .
COPY api/ api/
COPY core/ core/
COPY data/ data/

# Expose port
EXPOSE $PORT

# Start command
CMD ["python", "main.py"]
