import { useState, useEffect } from "react";

function SugerenciasPage() {
  const [sugerencias, setSugerencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const cargarSugerencias = async () => {
    setCargando(true);
    setError("");

    try {
      const resp = await fetch(`${API_URL}/api/sugerencias`);
      if (!resp.ok) {
        throw new Error("No se pudieron obtener las sugerencias.");
      }

      const data = await resp.json();
      // Aseguramos que sea array
      setSugerencias(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar sugerencias:", err);
      setError(err.message || "Ocurrió un error al cargar las sugerencias.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarSugerencias();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">
          Sugerencias de mejora
        </h1>
        <p className="text-slate-600 text-sm md:text-base">
          Lista de comentarios enviados desde el buzón de mejoras.
        </p>
      </header>

      <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 md:p-6">
        {/* Estado de carga */}
        {cargando && (
          <p className="text-sm text-slate-500">Cargando sugerencias...</p>
        )}

        {/* Error */}
        {error && !cargando && (
          <div className="rounded-2xl bg-red-50 border border-red-100 p-4 mb-4">
            <p className="text-sm font-semibold text-red-900">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Lista vacía */}
        {!cargando && !error && sugerencias.length === 0 && (
          <p className="text-sm text-slate-500">
            Aún no hay sugerencias registradas.
          </p>
        )}

        {/* Lista de sugerencias */}
        {!cargando && !error && sugerencias.length > 0 && (
          <div className="space-y-4">
            {sugerencias.map((sugerencia, index) => {
              const tipo =
                sugerencia.categoria || sugerencia.tipo || "Sin categoría";
              const descripcion =
                sugerencia.texto || sugerencia.descripcion || "";

              return (
                <div
                  key={sugerencia.id || sugerencia._id || index}
                  className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60"
                >
                  {/* Tipo */}
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                    ({tipo})
                  </p>
                  {/* Descripción */}
                  <p className="text-sm text-slate-800 whitespace-pre-line">
                    {descripcion}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default SugerenciasPage;
