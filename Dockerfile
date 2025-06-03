# Use an official Node.js runtime as the base image
FROM node:18 as frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./

# Accept build args for Vite variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_KEY

# Make them available as environment variables
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_KEY=$VITE_SUPABASE_KEY

RUN npm run build

# Use Python 3.11 image for the final stage
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --from=frontend-build /app/frontend/dist /app/frontend/dist
COPY main.py .
COPY api/ api/
COPY core/ core/
COPY data/ data/

EXPOSE 5000

CMD ["python", "main.py"]