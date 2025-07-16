# Alternative deployment method using Docker
FROM python:3.11.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY server.py .
COPY backend/ ./backend/

# Set environment variables
ENV PYTHONPATH=/app
ENV PORT=10000

# Expose port
EXPOSE $PORT

# Run the application
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "10000"]