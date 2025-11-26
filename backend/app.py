from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import pandas as pd
import subprocess
import redis
from datetime import datetime
import json
import time
import uuid
import hashlib
import secrets
from auth import auth_bp  # Importamos el blueprint de auth.py

app = Flask(__name__)
CORS(app)

# Conexión a Redis (localhost en este entorno)
r = redis.Redis(host="localhost", port=6379, decode_responses=True)


#  Blueprint para las rutas de autenticación
app.register_blueprint(auth_bp)



# ---------- ADMIN / LOGIN (Redis) ----------

ADMIN_USERS_KEY = "admin:users"
TOKEN_PREFIX = "admin:token:"

def seed_admin():
    """
    Crea el usuario admin por defecto si no existe.
    Usuario: admin
    Contraseña: prueba123
    """
    username = "admin"
    password = "prueba123"

    # Si ya existe, no lo sobreescribimos
    if not r.hexists(ADMIN_USERS_KEY, username):
        password_hash = hashlib.sha256(password.encode("utf-8")).hexdigest()
        r.hset(ADMIN_USERS_KEY, username, password_hash)
        print("✅ Usuario admin creado en Redis (admin / prueba123)")
    else:
        print("ℹ️ Usuario admin ya existe en Redis")


def create_token(username: str) -> str:
    """
    Crea un token aleatorio y lo guarda en Redis con expiración.
    """
    token = secrets.token_hex(32)
    # Token válido por 8 horas
    r.setex(f"{TOKEN_PREFIX}{token}", 60 * 60 * 8, username)
    return token


def get_user_from_token(token: str):
    """
    Devuelve el username asociado a un token, o None si no existe/expiró.
    """
    return r.get(f"{TOKEN_PREFIX}{token}")


# Sembramos el admin al iniciar la app
seed_admin()

# ---------- CARGA / ENTRENAMIENTO DEL MODELO ----------

def cargar_modelo():
    modelo_path = "proyecto_curso.pkl"
    if not os.path.exists(modelo_path):
        print("Modelo no encontrado. Entrenando modelo...")
        subprocess.run(["python", "proyecto_curso.py"], check=True)
    return joblib.load(modelo_path)


model = cargar_modelo()


# ---------- ENDPOINTS BÁSICOS ----------

@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


# ---------- PREDICCIÓN Y ALMACENAMIENTO EN REDIS ----------

@app.post("/api/predict")
def api_predict():
    data = request.get_json(force=True)

    try:
        age = int(data["age"])
        gender = data["gender"]
        academic_pressure = float(data["academic_pressure"])
        cgpa = float(data["cgpa"])
        study_hours = float(data["study_hours"])
        study_satisfaction = float(data["study_satisfaction"])
        financial_stress = float(data["financial_stress"])
        family_history = data["family_history"]
        suicidal_thoughts = data["suicidal_thoughts"]
        sleep_duration = data["sleep_duration"]
        dietary_habits = data["dietary_habits"]
        works = data["works"]
        work_pressure = float(data.get("work_pressure", 0.0)) if works == "Yes" else 0.0
    except (KeyError, ValueError, TypeError) as e:
        return jsonify({"error": f"Datos inválidos: {e}"}), 400

    columnas_modelo = model.feature_names_in_
    nuevo_estudiante = pd.DataFrame(columns=columnas_modelo)
    nuevo_estudiante.loc[0] = 0

    nuevo_estudiante.loc[0, "Age"] = age
    nuevo_estudiante.loc[0, "Gender_Male"] = 1 if gender == "Male" else 0
    nuevo_estudiante.loc[0, "Academic Pressure"] = academic_pressure
    nuevo_estudiante.loc[0, "CGPA"] = cgpa
    nuevo_estudiante.loc[0, "Work/Study Hours"] = study_hours
    nuevo_estudiante.loc[0, "Study Satisfaction"] = study_satisfaction
    nuevo_estudiante.loc[0, "Financial Stress"] = financial_stress
    nuevo_estudiante.loc[0, "Family History of Mental Illness_Yes"] = (
        1 if family_history == "Yes" else 0
    )
    nuevo_estudiante.loc[0, "Have you ever had suicidal thoughts ?_Yes"] = (
        1 if suicidal_thoughts == "Yes" else 0
    )

    sleep_duration_columns = [
        "Sleep Duration_7-8 hours",
        "Sleep Duration_Less than 5 hours",
        "Sleep Duration_More than 8 hours",
    ]
    for col in sleep_duration_columns:
        if col.endswith(sleep_duration):
            nuevo_estudiante.loc[0, col] = 1

    dietary_habits_columns = [
        "Dietary Habits_Others",
        "Dietary Habits_Moderate",
        "Dietary Habits_Unhealthy",
    ]
    for col in dietary_habits_columns:
        if col.endswith(dietary_habits):
            nuevo_estudiante.loc[0, col] = 1

    nuevo_estudiante.loc[0, "Work Pressure"] = work_pressure
    nuevo_estudiante.loc[0, "Profession_Student"] = 1

    extra_cols = [c for c in nuevo_estudiante.columns if c not in columnas_modelo]
    if extra_cols:
        nuevo_estudiante.drop(columns=extra_cols, inplace=True)

    for col in columnas_modelo:
        if col not in nuevo_estudiante.columns:
            nuevo_estudiante[col] = 0

    prediccion = model.predict(nuevo_estudiante)
    probabilidad = float(model.predict_proba(nuevo_estudiante)[0][1])

    if prediccion[0] == 1:
        message = f"Alto riesgo de depresión (Probabilidad: {probabilidad:.2f})"
    else:
        message = f"Bajo riesgo de depresión (Probabilidad: {probabilidad:.2f})"

    # Guardar en Redis
    registro = {
        "timestamp": datetime.utcnow().isoformat(),
        "age": age,
        "gender": gender,
        "academic_pressure": academic_pressure,
        "cgpa": cgpa,
        "study_hours": study_hours,
        "study_satisfaction": study_satisfaction,
        "financial_stress": financial_stress,
        "family_history": family_history,
        "suicidal_thoughts": suicidal_thoughts,
        "sleep_duration": sleep_duration,
        "dietary_habits": dietary_habits,
        "works": works,
        "work_pressure": work_pressure,
        "prediction": int(prediccion[0]),
        "probability": probabilidad,
        "message": message,
    }

    r.rpush("predictions", json.dumps(registro))

    return jsonify(
        {
            "prediction": int(prediccion[0]),
            "probability": probabilidad,
            "message": message,
        }
    )


@app.get("/api/stats")
def api_stats():
    # ----------- PREDICCIONES (ya existente) -----------
    items = r.lrange("predictions", 0, -1)
    if not items:
        return jsonify({"total_registros": 0})

    registros = [json.loads(x) for x in items]
    total = len(registros)

    def pct(n):
        return (n / total) * 100 if total else 0.0

    # Distribución de género
    gender_counts = {"Male": 0, "Female": 0, "Other": 0}
    for reg in registros:
        g = reg.get("gender", "Other")
        if g not in gender_counts:
            g = "Other"
        gender_counts[g] += 1

    gender_distribution = {
        k: {"count": v, "pct": pct(v)} for k, v in gender_counts.items()
    }

    # Riesgo alto / bajo
    high = sum(1 for reg in registros if reg.get("prediction") == 1)
    low = total - high
    risk_distribution = {
        "high": {"count": high, "pct": pct(high)},
        "low": {"count": low, "pct": pct(low)},
    }

    # Variables binarias
    fam_yes = sum(1 for reg in registros if reg.get("family_history") == "Yes")
    sui_yes = sum(1 for reg in registros if reg.get("suicidal_thoughts") == "Yes")

    # Distribución de sueño
    sleep_opts = [
        "7-8 hours",
        "Less than 5 hours",
        "More than 8 hours",
    ]
    sleep_counts = {k: 0 for k in sleep_opts}
    for reg in registros:
        s = reg.get("sleep_duration")
        if s in sleep_counts:
            sleep_counts[s] += 1
    sleep_distribution = {
        k: {"count": v, "pct": pct(v)} for k, v in sleep_counts.items()
    }

    # Distribución de hábitos alimenticios
    diet_opts = ["Moderate", "Others", "Unhealthy"]
    diet_counts = {k: 0 for k in diet_opts}
    for reg in registros:
        d = reg.get("dietary_habits")
        if d in diet_counts:
            diet_counts[d] += 1
    dietary_distribution = {
        k: {"count": v, "pct": pct(v)} for k, v in diet_counts.items()
    }

    # Promedios
    def avg(field):
        vals = [
            float(reg.get(field))
            for reg in registros
            if reg.get(field) is not None
        ]
        return sum(vals) / len(vals) if vals else 0.0

    averages = {
        "age": avg("age"),
        "academic_pressure": avg("academic_pressure"),
        "study_hours": avg("study_hours"),
        "financial_stress": avg("financial_stress"),
        "study_satisfaction": avg("study_satisfaction"),
        "cgpa": avg("cgpa"),
    }

    # ----------- MÉTRICAS DE USO (metrics_events) -----------

    metrics_items = r.lrange("metrics_events", 0, -1)
    metrics = {}

    if metrics_items:
        events = [json.loads(x) for x in metrics_items]

        submits = [e for e in events if e.get("eventType") == "submit"]
        abandons = [e for e in events if e.get("eventType") == "abandon"]

        # --- tiempos totales ---
        times_ms = [
            e.get("totalMs")
            for e in submits
            if isinstance(e.get("totalMs"), (int, float))
        ]

        avg_completion = median_completion = p90_completion = None

        if times_ms:
            times_sec = sorted([t / 1000.0 for t in times_ms])
            n = len(times_sec)
            avg_completion = sum(times_sec) / n

            # mediana
            if n % 2 == 1:
                median_completion = times_sec[n // 2]
            else:
                median_completion = (times_sec[n // 2 - 1] + times_sec[n // 2]) / 2

            # p90 (posición 90%)
            idx_p90 = int(0.9 * (n - 1))
            p90_completion = times_sec[idx_p90]

        # --- tiempos por campo ---
        field_sums = {}
        field_counts = {}

        for e in submits:
            fields_ms = e.get("fieldsMs") or {}
            if isinstance(fields_ms, dict):
                for field, ms in fields_ms.items():
                    try:
                        v = float(ms)
                    except (TypeError, ValueError):
                        continue
                    field_sums[field] = field_sums.get(field, 0.0) + v
                    field_counts[field] = field_counts.get(field, 0) + 1

        field_times = {}
        for field, total_ms in field_sums.items():
            count = field_counts.get(field, 1)
            field_times[field] = {
                "avg_seconds": (total_ms / count) / 1000.0
            }

        # --- distribución por dispositivo ---
        device_counts = {}
        for e in events:
            dev = (e.get("device") or {}).get("type", "unknown")
            device_counts[dev] = device_counts.get(dev, 0) + 1

        total_dev = sum(device_counts.values()) or 1
        device_distribution = {
            k: {"count": v, "pct": (v / total_dev) * 100.0}
            for k, v in device_counts.items()
        }

        # --- distribución por tamaño de pantalla ---
        def bucket_for_width(w):
            try:
                w = int(w)
            except (TypeError, ValueError):
                return "unknown"
            if w < 480:
                return "0-479"
            if w < 768:
                return "480-767"
            if w < 1024:
                return "768-1023"
            if w < 1440:
                return "1024-1439"
            return "1440+"

        viewport_counts = {}
        for e in events:
            width = (e.get("device") or {}).get("width")
            bucket = bucket_for_width(width)
            viewport_counts[bucket] = viewport_counts.get(bucket, 0) + 1

        total_view = sum(viewport_counts.values()) or 1
        viewport_distribution = {
            k: {"count": v, "pct": (v / total_view) * 100.0}
            for k, v in viewport_counts.items()
        }

        # --- completados vs abandonos ---
        completed = len(submits)
        abandoned = len(abandons)
        total_sessions = completed + abandoned or 1

        abandonment = {
            "completed": completed,
            "abandoned": abandoned,
            "completed_pct": (completed / total_sessions) * 100.0,
            "abandoned_pct": (abandoned / total_sessions) * 100.0,
        }

        # --- timestamps ---
        ts_list = []
        for e in submits:
            ts = (
                e.get("timestampEnvio")
                or e.get("completedAt")
                or e.get("startedAt")
            )
            if ts:
                ts_list.append(ts)

        first_submission_at = min(ts_list) if ts_list else None
        last_submission_at = max(ts_list) if ts_list else None

        metrics = {
            "avg_completion_seconds": avg_completion,
            "median_completion_seconds": median_completion,
            "p90_completion_seconds": p90_completion,
            "field_times": field_times,
            "device_distribution": device_distribution,
            "viewport_distribution": viewport_distribution,
            "abandonment": abandonment,
            "first_submission_at": first_submission_at,
            "last_submission_at": last_submission_at,
        }

    return jsonify(
        {
            "total_registros": total,
            "gender_distribution": gender_distribution,
            "risk_distribution": risk_distribution,
            "family_history_yes_pct": pct(fam_yes),
            "suicidal_thoughts_yes_pct": pct(sui_yes),
            "sleep_distribution": sleep_distribution,
            "dietary_distribution": dietary_distribution,
            "averages": averages,
            "metrics": metrics,  # <-- NUEVO BLOQUE
        }
    )

@app.post("/api/metrics")
def save_metrics():
    try:
        data = request.get_json(force=True) or {}

        event_type = data.get("eventType")
        session_id = data.get("sessionId")

        # Timestamp del lado del servidor
        now_ts = time.time()
        data["receivedAt"] = now_ts

        # --- Anti-duplicados para "abandon" (por StrictMode / recargas raras) ---
        if event_type == "abandon" and session_id:
            key = f"metrics:last_abandon:{session_id}"
            last = r.get(key)
            
            if last is not None:
                try:
                    last_ts = float(last)
                except ValueError:
                    last_ts = 0.0

                # Si ya registramos un abandono de esta sesión hace menos de 5 s,
                # ignoramos este segundo evento.
                if now_ts - last_ts < 5.0:
                    return jsonify({
                        "status": "ignored-duplicate",
                        "reason": "duplicate abandon for same session in short time window",
                    }), 200

            # Guardamos el nuevo timestamp con expiración (para no llenar Redis)
            r.set(key, str(now_ts), ex=300)  # 5 minutos

        # Guardamos como evento en una lista de Redis
        r.rpush("metrics_events", json.dumps(data))

        return jsonify({"status": "ok"}), 201

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e),
        }), 500

@app.route('/api/foro/test', methods=['GET'])
def test_redis():
    """Prueba la conexión a Redis"""
    try:
        r.ping()
        publicaciones = len(r.keys('foro:post:*'))
        return jsonify({
            'status': 'ok',
            'mensaje': 'Conexión a Redis exitosa',
            'host': 'redis',
            'port': 6379,
            'publicaciones': publicaciones
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'mensaje': str(e)
        }), 500


@app.route('/api/foro/limpiar', methods=['POST'])
def limpiar_foro():
    """Elimina todos los datos del foro"""
    try:
        keys = r.keys('foro:*')
        if keys:
            deleted = r.delete(*keys)
            print(f"🗑️  Se eliminaron {deleted} claves del foro")
            return jsonify({
                'mensaje': f'Se eliminaron {deleted} claves del foro',
                'deleted': deleted
            })
        else:
            return jsonify({
                'mensaje': 'No hay datos del foro para eliminar',
                'deleted': 0
            })
    except Exception as e:
        print(f"❌ Error al limpiar foro: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/foro/debug', methods=['GET'])
def debug_foro():
    """Muestra información de debug"""
    try:
        keys = r.keys('foro:*')
        debug_info = {
            'total_keys': len(keys),
            'keys_detail': []
        }
        
        for key in keys:
            key_type = r.type(key)
            
            debug_info['keys_detail'].append({
                'key': key,
                'type': key_type,
                'ttl': r.ttl(key)
            })
        
        return jsonify(debug_info)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/foro/publicaciones', methods=['GET'])
def obtener_publicaciones():
    """Obtiene todas las publicaciones del foro"""
    try:
        orden = request.args.get('orden', 'recientes')
        
        pattern = 'foro:post:*'
        keys = r.keys(pattern)
        publicaciones = []
        
        for key in keys:
            # Saltar claves especiales
            if ':respuestas' in key or ':counter' in key:
                continue
            
            # Verificar tipo
            key_type = r.type(key)
            if key_type != 'hash':
                print(f"⚠️  Clave {key} es tipo {key_type}, eliminando...")
                r.delete(key)
                continue
            
            # Obtener datos
            data = r.hgetall(key)
            if not data:
                continue
            
            post_id = key.split(':')[-1]
            
            publicaciones.append({
                'id': post_id,
                'contenido': data.get('contenido', ''),
                'timestamp': int(data.get('timestamp', 0)),
                'likes': int(data.get('likes', 0)),
                'respuestas_count': int(data.get('respuestas_count', 0))
            })
        
        # Ordenar
        if orden == 'populares':
            publicaciones.sort(key=lambda x: (x['likes'], x['respuestas_count']), reverse=True)
        else:
            publicaciones.sort(key=lambda x: x['timestamp'], reverse=True)
        
        print(f"✅ Se obtuvieron {len(publicaciones)} publicaciones")
        
        return jsonify({
            'publicaciones': publicaciones,
            'total': len(publicaciones)
        })
    
    except Exception as e:
        print(f"❌ Error al obtener publicaciones: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/foro/publicaciones', methods=['POST'])
def crear_publicacion():
    """Crea una nueva publicación"""
    try:
        data = request.get_json()
        print(f"📝 Datos recibidos: {data}")
        
        contenido = data.get('contenido', '').strip()
        
        if not contenido:
            return jsonify({'error': 'El contenido no puede estar vacío'}), 400
        
        if len(contenido) > 500:
            return jsonify({'error': 'El contenido excede el límite de 500 caracteres'}), 400
        
        post_id = str(uuid.uuid4())
        timestamp = int(datetime.now().timestamp() * 1000)
        post_key = f'foro:post:{post_id}'
        
        # Verificar que no exista
        if r.exists(post_key):
            print(f"⚠️  Clave {post_key} ya existe, eliminando...")
            r.delete(post_key)
        
        # Guardar como Hash con strings
        r.hset(post_key, 'contenido', contenido)
        r.hset(post_key, 'timestamp', str(timestamp))
        r.hset(post_key, 'likes', '0')
        r.hset(post_key, 'respuestas_count', '0')
        
        # Verificar
        saved = r.hgetall(post_key)
        print(f"✅ Publicación creada: {post_id}")
        print(f"📦 Datos guardados: {saved}")
        
        return jsonify({
            'id': post_id,
            'mensaje': 'Publicación creada exitosamente',
            'timestamp': timestamp
        }), 201
    
    except Exception as e:
        print(f"❌ Error al crear publicación: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/foro/publicaciones/<post_id>/respuestas', methods=['GET'])
def obtener_respuestas(post_id):
    """Obtiene las respuestas de una publicación"""
    try:
        post_key = f'foro:post:{post_id}'
        
        # Verificar que existe
        if not r.exists(post_key):
            return jsonify({'error': 'Publicación no encontrada'}), 404
        
        # Obtener lista de respuestas
        respuestas_key = f'foro:post:{post_id}:respuestas'
        respuesta_ids = r.lrange(respuestas_key, 0, -1)
        
        respuestas = []
        for resp_id in respuesta_ids:
            resp_key = f'foro:respuesta:{resp_id}'
            
            # Verificar tipo
            if r.type(resp_key) != 'hash':
                print(f"⚠️  Respuesta {resp_id} tiene tipo incorrecto, eliminando...")
                r.delete(resp_key)
                continue
            
            data = r.hgetall(resp_key)
            if data:
                respuestas.append({
                    'id': resp_id,
                    'contenido': data.get('contenido', ''),
                    'timestamp': int(data.get('timestamp', 0))
                })
        
        # Ordenar por timestamp
        respuestas.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return jsonify({
            'respuestas': respuestas,
            'total': len(respuestas)
        })
    
    except Exception as e:
        print(f"❌ Error al obtener respuestas: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/foro/publicaciones/<post_id>/respuestas', methods=['POST'])
def crear_respuesta(post_id):
    """Crea una respuesta a una publicación"""
    try:
        post_key = f'foro:post:{post_id}'
        
        # Verificar que la publicación existe
        if not r.exists(post_key):
            return jsonify({'error': 'Publicación no encontrada'}), 404
        
        # Verificar que sea un hash
        if r.type(post_key) != 'hash':
            print(f"⚠️  Post {post_id} no es hash, eliminando y rechazando...")
            r.delete(post_key)
            return jsonify({'error': 'Publicación corrupta'}), 400
        
        data = request.get_json()
        contenido = data.get('contenido', '').strip()
        
        if not contenido:
            return jsonify({'error': 'El contenido no puede estar vacío'}), 400
        
        if len(contenido) > 300:
            return jsonify({'error': 'El contenido excede el límite de 300 caracteres'}), 400
        
        resp_id = str(uuid.uuid4())
        timestamp = int(datetime.now().timestamp() * 1000)
        
        # Guardar respuesta como Hash
        resp_key = f'foro:respuesta:{resp_id}'
        r.hset(resp_key, 'contenido', contenido)
        r.hset(resp_key, 'timestamp', str(timestamp))
        r.hset(resp_key, 'post_id', post_id)
        
        # Agregar a la lista de respuestas
        respuestas_key = f'foro:post:{post_id}:respuestas'
        r.lpush(respuestas_key, resp_id)
        
        # Incrementar contador
        r.hincrby(post_key, 'respuestas_count', 1)
        
        print(f"✅ Respuesta creada: {resp_id} para post {post_id}")
        
        return jsonify({
            'id': resp_id,
            'mensaje': 'Respuesta creada exitosamente'
        }), 201
    
    except Exception as e:
        print(f"❌ Error al crear respuesta: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/foro/publicaciones/<post_id>/reaccion', methods=['POST'])
def agregar_reaccion(post_id):
    """Agrega una reacción (like) a una publicación"""
    try:
        post_key = f'foro:post:{post_id}'
        
        if not r.exists(post_key):
            return jsonify({'error': 'Publicación no encontrada'}), 404
        
        # Verificar tipo
        if r.type(post_key) != 'hash':
            print(f"⚠️  Post {post_id} no es hash, eliminando...")
            r.delete(post_key)
            return jsonify({'error': 'Publicación corrupta'}), 400
        
        data = request.get_json()
        tipo = data.get('tipo', 'like')
        
        if tipo == 'like':
            nuevo_valor = r.hincrby(post_key, 'likes', 1)
            print(f"✅ Like agregado a post {post_id}. Total: {nuevo_valor}")
            
            return jsonify({
                'mensaje': 'Reacción agregada exitosamente',
                'likes': nuevo_valor
            })
        
        return jsonify({'mensaje': 'Tipo de reacción no soportado'}), 400
    
    except Exception as e:
        print(f"❌ Error al agregar reacción: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# ---------- BUZÓN DE SUGERENCIAS ----------

@app.post("/api/sugerencias")
def crear_sugerencia():
    """
    Crea una nueva sugerencia en el buzón de mejoras.
    Espera un JSON con:
      - categoria: "Bug" | "Recomendación" | "Queja"
      - texto: descripción de la sugerencia
    """
    try:
        data = request.get_json(force=True) or {}
        categoria = (data.get("categoria") or "").strip()
        texto = (data.get("texto") or "").strip()

        if not texto:
            return jsonify({"error": "El texto de la sugerencia no puede estar vacío"}), 400

        # Opcional: validar categoría
        categorias_validas = {"Bug", "Recomendación", "Queja"}
        if categoria not in categorias_validas:
            # Si viene algo raro, lo marcamos como "Recomendación" por defecto
            categoria = "Recomendación"

        sugerencia_id = str(uuid.uuid4())
        timestamp = int(datetime.now().timestamp() * 1000)

        sugerencia = {
            "id": sugerencia_id,
            "categoria": categoria,
            "texto": texto,
            "timestamp": timestamp,
        }

        # Guardamos la sugerencia como JSON en una lista de Redis
        r.rpush("sugerencias", json.dumps(sugerencia))

        return jsonify({
            "mensaje": "Sugerencia guardada correctamente",
            "sugerencia": sugerencia
        }), 201

    except Exception as e:
        print(f"❌ Error al crear sugerencia: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.get("/api/sugerencias")
def obtener_sugerencias():
    """
    Devuelve la lista de sugerencias del buzón de mejoras.
    Respuesta: array de objetos con:
      - id
      - categoria
      - texto
      - timestamp
    """
    try:
        items = r.lrange("sugerencias", 0, -1)

        if not items:
            return jsonify([]), 200

        sugerencias = []
        for raw in items:
            try:
                sugerencia = json.loads(raw)
                sugerencias.append(sugerencia)
            except json.JSONDecodeError:
                continue

        # Ordenamos por timestamp descendente (más recientes primero)
        sugerencias.sort(key=lambda x: x.get("timestamp", 0), reverse=True)

        return jsonify(sugerencias), 200

    except Exception as e:
        print(f"❌ Error al obtener sugerencias: {str(e)}")
        return jsonify({"error": str(e)}), 500

# ---------- FRASES DEL DÍA ----------

FRASE_DIA_ACTUAL_KEY = "frases_dia_actual_id"

@app.post("/api/frases/<frase_id>/destacar")
def destacar_frase(frase_id):
    """
    Marca una frase existente como 'frase del día' sin duplicarla.
    Guarda el ID en una clave aparte en Redis.
    """
    try:
        items = r.lrange("frases_dia", 0, -1)
        encontrada = None

        for raw in items:
            try:
                frase = json.loads(raw)
            except json.JSONDecodeError:
                continue

            if frase.get("id") == frase_id:
                encontrada = frase
                break

        if not encontrada:
            return jsonify({"error": "Frase no encontrada"}), 404

        # Guardamos el ID como la frase actual del día
        r.set(FRASE_DIA_ACTUAL_KEY, frase_id)

        return jsonify({
            "mensaje": "Frase marcada como frase del día.",
            "frase": encontrada
        }), 200

    except Exception as e:
        print(f"❌ Error al marcar frase del día: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.post("/api/frases")
def crear_frase():
    """
    Crea una nueva frase del día.
    Espera un JSON con:
      - contenido: texto de la frase
    """
    try:
        data = request.get_json(force=True) or {}
        contenido = (data.get("contenido") or "").strip()

        if not contenido:
            return jsonify({"error": "El contenido de la frase no puede estar vacío"}), 400

        frase_id = str(uuid.uuid4())
        timestamp = int(datetime.utcnow().timestamp() * 1000)

        frase = {
            "id": frase_id,
            "contenido": contenido,
            "timestamp": timestamp,
        }

        # Guardamos en una lista de Redis
        r.rpush("frases_dia", json.dumps(frase))

        return jsonify(frase), 201

    except Exception as e:
        print(f"❌ Error al crear frase del día: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.get("/api/frases")
def listar_frases():
    """
    Devuelve todas las frases del día guardadas.
    """
    try:
        items = r.lrange("frases_dia", 0, -1)
        frases = []

        for raw in items:
            try:
                frase = json.loads(raw)
                frases.append(frase)
            except json.JSONDecodeError:
                continue

        # Más recientes primero
        frases.sort(key=lambda x: x.get("timestamp", 0), reverse=True)

        return jsonify(frases), 200

    except Exception as e:
        print(f"❌ Error al listar frases del día: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.delete("/api/frases/<frase_id>")
def eliminar_frase(frase_id):
    """
    Elimina una frase por ID.
    """
    try:
        items = r.lrange("frases_dia", 0, -1)
        nuevos_items = []
        encontrada = False

        for raw in items:
            try:
                frase = json.loads(raw)
            except json.JSONDecodeError:
                # Si está corrupto, lo descartamos
                continue

            if frase.get("id") == frase_id:
                encontrada = True
                continue  # no la volvemos a agregar
            nuevos_items.append(frase)

        if not encontrada:
            return jsonify({"error": "Frase no encontrada"}), 404

        # Reescribimos la lista en Redis
        r.delete("frases_dia")
        if nuevos_items:
            for f in nuevos_items:
                r.rpush("frases_dia", json.dumps(f))

        return jsonify({"mensaje": "Frase eliminada correctamente"}), 200

    except Exception as e:
        print(f"❌ Error al eliminar frase del día: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.get("/api/frase-dia")
def obtener_frase_del_dia():
    """
    Devuelve la 'frase del día'.

    Prioridad:
    1) Si hay un ID guardado en FRASE_DIA_ACTUAL_KEY, devuelve esa frase.
    2) Si no hay ID o no se encuentra, usa la última frase de la lista.
    """
    try:
        items = r.lrange("frases_dia", 0, -1)
        if not items:
            return jsonify({"mensaje": "Aún no hay frases registradas"}), 200

        # 1) Intentar por ID guardado
        frase_id_actual = r.get(FRASE_DIA_ACTUAL_KEY)
        if frase_id_actual:
            for raw in items:
                try:
                    frase = json.loads(raw)
                except json.JSONDecodeError:
                    continue

                if frase.get("id") == frase_id_actual:
                    return jsonify(frase), 200

        # 2) Si no hay ID o no se encontró, usar la última agregada
        raw = items[-1]
        try:
            frase = json.loads(raw)
        except json.JSONDecodeError:
            return jsonify({"mensaje": "No se pudo leer la frase del día"}), 200

        return jsonify(frase), 200

    except Exception as e:
        print(f"❌ Error al obtener frase del día: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.post("/api/admin/login")
def admin_login():
    """
    Login de administrador.
    Espera JSON con:
      - username
      - password
    Devuelve un token si las credenciales son correctas.
    """
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Usuario y contraseña son obligatorios"}), 400

    # Hash guardado en Redis
    stored_hash = r.hget(ADMIN_USERS_KEY, username)
    if not stored_hash:
        return jsonify({"error": "Credenciales inválidas"}), 401

    password_hash = hashlib.sha256(password.encode("utf-8")).hexdigest()
    if password_hash != stored_hash:
        return jsonify({"error": "Credenciales inválidas"}), 401

    token = create_token(username)
    return jsonify({"token": token, "username": username})


@app.get("/api/admin/me")
def admin_me():
    """
    Devuelve info básica del admin autenticado.
    Se espera un header:
      Authorization: Bearer <token>
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "No autorizado"}), 401

    token = auth_header.split(" ", 1)[1]
    username = get_user_from_token(token)
    if not username:
        return jsonify({"error": "Token inválido o expirado"}), 401

    return jsonify({"username": username})



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

