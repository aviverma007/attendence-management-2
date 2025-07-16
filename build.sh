#!/bin/bash
# Build script for Render deployment with Python 3.13

echo "Starting build process for Python 3.13..."

# Upgrade pip first
python -m pip install --upgrade pip

# Install dependencies with specific flags for Python 3.13 compatibility
pip install --no-cache-dir --prefer-binary --no-build-isolation -r requirements.txt

echo "Build completed successfully!"