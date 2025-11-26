import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PerfilUsuarioPage() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener el nombre de usuario del localStorage
    const storedUsername = localStorage.getItem("username");
    const token = localStorage.getItem("userToken");

    if (!token) {
      // Si no hay token, redirigir al login
      navigate("/login-usuario");
      return;
    }

    setUsername(storedUsername || "Usuario");
  }, [navigate]);

  const handleCerrarSesion = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">
          Mi Perfil
        </h1>
        <p className="text-slate-600 text-sm md:text-base">
          Bienvenido a tu área personal. Aquí puedes ver tu información y gestionar tu cuenta.
        </p>
      </header>

      {/* Card de información del usuario */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white text-2xl font-bold">
            {username.charAt(0).toUpperCase()}
          </div>
          
          {/* Info básica */}
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{username}</h2>
            <p className="text-sm text-slate-600">Usuario registrado</p>
          </div>
        </div>

        {/* Información adicional */}
        <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Usuario
            </p>
            <p className="text-base font-medium text-slate-900">{username}</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Estado
            </p>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-base font-medium text-slate-900">Activo</p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="pt-4 border-t border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Acciones rápidas
          </h3>
          
          <div className="grid md:grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/prediccion")}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Hacer cuestionario
            </button>

            <button
              onClick={() => navigate("/estadisticas")}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Ver estadísticas
            </button>
          </div>
        </div>

        {/* Botón de cerrar sesión */}
        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={handleCerrarSesion}
            className="w-full md:w-auto px-6 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </section>

      {/* Información adicional */}
      <section className="bg-blue-50 rounded-3xl border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          ℹ️ Información importante
        </h3>
        <p className="text-sm text-blue-800">
          Como usuario registrado, tienes acceso a todas las funcionalidades de la plataforma,
          incluyendo el cuestionario de riesgo de depresión, estadísticas agregadas, foro de
          discusión y buzón de mejoras. Tus datos están seguros y protegidos.
        </p>
      </section>
    </div>
  );
}
