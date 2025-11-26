from flask import Blueprint, request, jsonify
import redis
import hashlib

# ✅ CREAR EL BLUEPRINT
auth_bp = Blueprint('auth', __name__)

# ✅ CREAR CONEXIÓN A REDIS
r = redis.Redis(host="localhost", port=6379, decode_responses=True)

@auth_bp.route("/api/register", methods=["POST"])
def register():
    """
    Endpoint para registrar nuevos usuarios.
    Recibe un JSON con:
      - username
      - password
    """
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "El nombre de usuario y la contraseña son obligatorios"}), 400

    # Verifica si el usuario ya existe
    if r.hexists("users", username):
        return jsonify({"error": "El nombre de usuario ya está registrado"}), 400

    # Cifrar la contraseña con SHA-256
    password_hash = hashlib.sha256(password.encode("utf-8")).hexdigest()

    # Almacenar el hash de la contraseña en Redis
    r.hset("users", username, password_hash)

    return jsonify({"message": "Usuario registrado con éxito"}), 201

@auth_bp.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "El nombre de usuario y la contraseña son obligatorios"}), 400

    stored_hash = r.hget("users", username)
    if not stored_hash:
        return jsonify({"error": "Usuario no encontrado"}), 404

    # Cifrar la contraseña proporcionada por el usuario
    password_hash = hashlib.sha256(password.encode("utf-8")).hexdigest()

    # Comparar los hashes de las contraseñas
    if password_hash != stored_hash:
        return jsonify({"error": "Contraseña incorrecta"}), 401

    # ✅ GENERAR Y DEVOLVER TOKEN
    import secrets
    token = secrets.token_hex(32)
    # Guardar token con expiración de 8 horas
    r.setex(f"user:token:{token}", 60 * 60 * 8, username)

    return jsonify({
        "message": "Login exitoso",
        "token": token,
        "username": username
    }), 200