#!/bin/bash
# Build script for Render deployment

echo "Starting build process..."

# Upgrade pip first
python -m pip install --upgrade pip

# Install dependencies with specific flags to avoid compilation issues
pip install --no-cache-dir --prefer-binary -r requirements.txt

echo "Build completed successfully!"