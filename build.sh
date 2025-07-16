#!/bin/bash
# Build script for Render deployment

echo "Starting build process..."

# Ensure Python 3.11 is used
python3.11 -m pip install --upgrade pip

# Install dependencies with specific flags to avoid compilation issues
pip install --no-cache-dir --prefer-binary -r requirements.txt

echo "Build completed successfully!"