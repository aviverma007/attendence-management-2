#!/bin/bash
# Build script for Render deployment - Python 3.13 compatible

echo "Starting build process for Python 3.13 with pydantic 1.10.21..."

# Upgrade pip first
python -m pip install --upgrade pip

# Install dependencies with strict binary-only policy to avoid Rust compilation
pip install --no-cache-dir --prefer-binary --no-build-isolation --only-binary=:all: -r requirements.txt

echo "Build completed successfully!"