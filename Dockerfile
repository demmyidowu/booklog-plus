# Use an official Node.js runtime as the base image
FROM node:18 as frontend-build

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

# Use Python image for the final stage
FROM python:3.8-slim

# Set working directory
WORKDIR /app

# Copy Python requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install -r requirements.txt

# Copy the built frontend from previous stage
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Copy Python source code
COPY main.py .
COPY api/ api/
COPY core/ core/
COPY data/ data/

# Expose port
EXPOSE 5000

# Start command
CMD ["python", "main.py"]
