import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function LoginPageU({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Error al iniciar sesión");
        setLoading(false);
        return;
      }

      // ✅ GUARDAR TOKEN Y USERNAME EN LOCALSTORAGE
      if (data.token) {
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("username", data.username || username);
      }

      // ✅ LLAMAR A onLogin PARA ACTUALIZAR ESTADO
      if (onLogin) {
        onLogin();
      }

      // Redirigir al perfil del usuario
      navigate("/perfil");
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
      <h1 className="text-xl font-semibold text-slate-900 text-center">
        Iniciar sesión
      </h1>
      <p className="text-xs text-slate-500 text-center">
        Acceso restringido. Solo usuarios registrados.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Usuario
          </label>
          <input
            type="text"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Contraseña
          </label>
          <input
            type="password"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-sky-600 text-white text-sm font-medium py-2 hover:bg-sky-700 transition disabled:opacity-60"
        >
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-4">
        ¿No tienes cuenta?{" "}
        <a href="/register" className="text-sky-600 hover:underline">
          Regístrate aquí
        </a>
      </p>
    </section>
  );
}
