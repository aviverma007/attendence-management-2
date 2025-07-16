#!/bin/bash
# Full-Stack Build Script for Render Deployment

echo "🚀 Starting Full-Stack Deployment Build..."

# Upgrade pip first
python -m pip install --upgrade pip

# Install backend dependencies
echo "📦 Installing backend dependencies..."
pip install --no-cache-dir --prefer-binary --no-build-isolation --only-binary=:all: -r requirements.txt

# Install Node.js and yarn if not available
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

if ! command -v yarn &> /dev/null; then
    echo "📦 Installing Yarn..."
    npm install -g yarn
fi

# Install frontend dependencies and build
echo "📦 Installing frontend dependencies..."
cd frontend
yarn install

echo "🔨 Building React frontend for production..."
yarn build

echo "📋 Frontend build complete!"
ls -la build/

# Go back to root directory
cd ..

echo "✅ Full-Stack Build Complete!"
echo "📁 React app built and ready to be served by FastAPI"