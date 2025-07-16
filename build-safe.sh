#!/bin/bash
# Ultra-safe build script for Render deployment

set -e  # Exit on any error

echo "🚀 Starting ultra-safe build process..."

# Upgrade pip with specific flags
echo "📦 Upgrading pip..."
python -m pip install --upgrade pip --no-cache-dir

# Set pip configuration for binary preference
echo "⚙️ Setting pip configuration..."
export PIP_NO_CACHE_DIR=1
export PIP_PREFER_BINARY=1
export PIP_NO_BUILD_ISOLATION=1

# Install dependencies with maximum safety flags
echo "📚 Installing dependencies..."
pip install \
    --prefer-binary \
    --no-cache-dir \
    --no-build-isolation \
    --timeout 300 \
    --retries 3 \
    -r requirements.txt

echo "✅ Build completed successfully!"
echo "🎯 Ready to serve the application!"