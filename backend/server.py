"""
Entrypoint alias for Render compatibility with default 'gunicorn server:app'
"""
from main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000)
