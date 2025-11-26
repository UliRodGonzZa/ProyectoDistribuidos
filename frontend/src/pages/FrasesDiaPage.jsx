import { useState, useEffect } from "react";

function FrasesDiaPage() {
  const [frases, setFrases] = useState([]);
  const [nuevaFrase, setNuevaFrase] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Modal de confirmación eliminar
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [fraseAEliminar, setFraseAEliminar] = useState(null);

  // Modal de confirmación "frase del día"
  const [mostrarModalDestacar, setMostrarModalDestacar] = useState(false);
  const [fraseADestacar, setFraseADestacar] = useState(null);

  // Modal de feedback para agregar frase
  const [mostrarModalFeedback, setMostrarModalFeedback] = useState(false);
  const [modalFeedbackTitulo, setModalFeedbackTitulo] = useState("");
  const [modalFeedbackMensaje, setModalFeedbackMensaje] = useState("");
  const [modalFeedbackEsError, setModalFeedbackEsError] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const cargarFrases = async () => {
    setCargando(true);
    setError("");
    try {
      const resp = await fetch(`${API_URL}/api/frases`);
      if (!resp.ok) {
        throw new Error("No se pudieron obtener las frases.");
      }
      const data = await resp.json();
      setFrases(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar frases:", err);
      setError(err.message || "Ocurrió un error al cargar las frases.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarFrases();
  }, []);

  const handleAgregar = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (!nuevaFrase.trim()) {
      setError("La frase no puede estar vacía.");
      return;
    }

    setEnviando(true);
    try {
      const resp = await fetch(`${API_URL}/api/frases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenido: nuevaFrase.trim() }),
      });

      if (!resp.ok) {
        const texto = await resp.text().catch(() => "");
        throw new Error(texto || "No se pudo guardar la frase.");
      }

      const creada = await resp.json();
      setMensaje("Frase agregada correctamente.");
      setNuevaFrase("");
      setFrases((prev) => [creada, ...prev]);

      // Modal de éxito
      setModalFeedbackEsError(false);
      setModalFeedbackTitulo("Frase agregada");
      setModalFeedbackMensaje("La frase se agregó correctamente.");
      setMostrarModalFeedback(true);
    } catch (err) {
      console.error("Error al agregar frase:", err);
      setError(err.message || "Ocurrió un error al agregar la frase.");

      // Modal de error
      setModalFeedbackEsError(true);
      setModalFeedbackTitulo("No se pudo agregar la frase");
      setModalFeedbackMensaje(
        "Verifica tu conexión a internet e inténtalo de nuevo."
      );
      setMostrarModalFeedback(true);
    } finally {
      setEnviando(false);
    }
  };

  // Abre el modal de confirmación de eliminación
  const solicitarEliminar = (frase) => {
    setError("");
    setMensaje("");
    setFraseAEliminar(frase);
    setMostrarModalEliminar(true);
  };

  // Confirmar eliminación
  const confirmarEliminar = async () => {
    if (!fraseAEliminar) return;

    try {
      const resp = await fetch(`${API_URL}/api/frases/${fraseAEliminar.id}`, {
        method: "DELETE",
      });

      if (!resp.ok) {
        const texto = await resp.text().catch(() => "");
        throw new Error(texto || "No se pudo eliminar la frase.");
      }

      setMensaje("Frase eliminada correctamente.");
      setFrases((prev) => prev.filter((f) => f.id !== fraseAEliminar.id));
    } catch (err) {
      console.error("Error al eliminar frase:", err);
      setError(err.message || "Ocurrió un error al eliminar la frase.");
    } finally {
      setMostrarModalEliminar(false);
      setFraseAEliminar(null);
    }
  };

  const cancelarEliminar = () => {
    setMostrarModalEliminar(false);
    setFraseAEliminar(null);
  };

  // Abrir modal para "hacer frase del día"
  const solicitarDestacar = (frase) => {
    setError("");
    setMensaje("");
    setFraseADestacar(frase);
    setMostrarModalDestacar(true);
  };

  // Confirmar "frase del día" SIN duplicar
  const confirmarDestacar = async () => {
    if (!fraseADestacar) return;

    try {
      const resp = await fetch(
        `${API_URL}/api/frases/${fraseADestacar.id}/destacar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!resp.ok) {
        const texto = await resp.text().catch(() => "");
        throw new Error(texto || "No se pudo marcar como frase del día.");
      }

      await resp.json();

      setMensaje("Frase marcada como frase del día.");

      // Mover al inicio localmente sin duplicar
      setFrases((prev) => {
        const resto = prev.filter((f) => f.id !== fraseADestacar.id);
        return [fraseADestacar, ...resto];
      });
    } catch (err) {
      console.error("Error al marcar frase del día:", err);
      setError(err.message || "Ocurrió un error al marcar la frase del día.");
    } finally {
      setMostrarModalDestacar(false);
      setFraseADestacar(null);
    }
  };

  const cancelarDestacar = () => {
    setMostrarModalDestacar(false);
    setFraseADestacar(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">
          Administrar frases del día
        </h1>
        <p className="text-slate-600 text-sm md:text-base">
          Aquí puedes agregar nuevas frases y eliminar las existentes.
          La frase del día será la última que hayas agregado o la que marques manualmente.
        </p>
      </header>

      <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 md:p-6 space-y-4">
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-100 p-4">
            <p className="text-sm font-semibold text-red-900">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}

        {mensaje && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
            <p className="text-sm font-semibold text-emerald-900">OK</p>
            <p className="text-sm text-emerald-700 mt-1">{mensaje}</p>
          </div>
        )}

        {/* Formulario para agregar frase */}
        <form onSubmit={handleAgregar} className="space-y-3">
          <div>
            <label
              htmlFor="nuevaFrase"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Nueva frase
            </label>
            <textarea
              id="nuevaFrase"
              rows={3}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm md:text-base
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         resize-y"
              placeholder="Escribe aquí la frase del día..."
              value={nuevaFrase}
              onChange={(e) => setNuevaFrase(e.target.value)}
              disabled={enviando}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={enviando}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg
                         bg-blue-600 text-white text-sm md:text-base font-semibold shadow
                         hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed
                         transition-colors"
            >
              {enviando ? "Guardando..." : "Agregar frase"}
            </button>
          </div>
        </form>
      </section>

      {/* Lista de frases */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 md:p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Frases guardadas
        </h2>

        {cargando ? (
          <p className="text-sm text-slate-500">Cargando frases...</p>
        ) : frases.length === 0 ? (
          <p className="text-sm text-slate-500">
            Aún no hay frases guardadas.
          </p>
        ) : (
          <div className="space-y-3">
            {frases.map((frase) => (
              <div
                key={frase.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-3 border border-slate-200 rounded-2xl p-3 bg-slate-50/60"
              >
                <p className="text-sm text-slate-800 whitespace-pre-line flex-1">
                  {frase.contenido}
                </p>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => solicitarDestacar(frase)}
                    className="text-xs px-3 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Hacer frase del día
                  </button>
                  <button
                    type="button"
                    onClick={() => solicitarEliminar(frase)}
                    className="text-xs px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal de confirmación de eliminación */}
      {mostrarModalEliminar && fraseAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-5 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">
              ¿Seguro que quieres eliminar esta frase?
            </h3>
            <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 whitespace-pre-line">
              {fraseAEliminar.contenido}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelarEliminar}
                className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEliminar}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de frase del día */}
      {mostrarModalDestacar && fraseADestacar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-5 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">
              ¿Seguro que quieres hacer esta la frase del día?
            </h3>
            <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 whitespace-pre-line">
              {fraseADestacar.contenido}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelarDestacar}
                className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarDestacar}
                className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Sí, hacer frase del día
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de feedback para agregar (éxito / error) */}
      {mostrarModalFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-5 space-y-4">
            <h3
              className={`text-lg font-semibold ${
                modalFeedbackEsError ? "text-red-700" : "text-emerald-700"
              }`}
            >
              {modalFeedbackTitulo}
            </h3>
            <p className="text-sm text-slate-700 whitespace-pre-line">
              {modalFeedbackMensaje}
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMostrarModalFeedback(false)}
                className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FrasesDiaPage;
