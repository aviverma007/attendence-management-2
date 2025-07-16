# IMPORTANT: This is a redirect file for deployment
# The main server is now located at backend/server.py
# For production deployment, use: uvicorn backend.server:app --host 0.0.0.0 --port $PORT

from backend.server import app

# Re-export the app for deployment compatibility
__all__ = ["app"]
