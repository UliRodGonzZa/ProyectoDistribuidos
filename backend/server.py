"""
Wrapper para hacer compatible Flask con uvicorn (ASGI)
"""
from asgiref.wsgi import WsgiToAsgi
from app import app as flask_app

# Convertir la aplicación Flask WSGI a ASGI para uvicorn
app = WsgiToAsgi(flask_app)
