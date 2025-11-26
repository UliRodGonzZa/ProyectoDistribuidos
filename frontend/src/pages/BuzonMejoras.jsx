import { useState } from "react";

function BuzonMejorasPage() {
  const [categoria, setCategoria] = useState("Bug");
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const API_URL = window.VITE_API_URL || "http://localhost:5000";
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");

    if (!texto.trim()) {
      setError("Por favor escribe tu sugerencia antes de enviar.");
      return;
    }

    setEnviando(true);
    try {
    	const resp = await fetch(`${API_URL}/api/sugerencias`, {
	  method: "POST",
	  headers: { "Content-Type": "application/json" },
	  body: JSON.stringify({
	    categoria,
	    texto: texto.trim(),
	  }),
	});

      if (!resp.ok) {
        throw new Error("No se pudo enviar tu sugerencia. Inténtalo más tarde.");
      }

      setExito("¡Gracias! Tu sugerencia se ha enviado correctamente.");
      setTexto("");
      setCategoria("Bug");
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Ocurrió un error al enviar la sugerencia. Inténtalo más tarde."
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Buzón de mejoras</h1>
        <p className="text-slate-600 text-sm md:text-base">
          Cuéntanos cómo podemos mejorar la aplicación. Tus comentarios son anónimos.
        </p>
      </header>

      <section className="bg-white rounded-xl shadow-md border border-slate-200 p-5 md:p-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="categoria"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Categoría
            </label>
            <select
              id="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              disabled={enviando}
              className="w-full rounded-lg border border-slate-300 px-3 py-2
                         text-sm md:text-base focus:outline-none focus:ring-2
                         focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="Bug">Bug</option>
              <option value="Recomendación">Recomendación</option>
              <option value="Queja">Queja</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="texto"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Sugerencia / comentario
            </label>
            <textarea
              id="texto"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={5}
              disabled={enviando}
              className="w-full rounded-lg border border-slate-300 px-3 py-2
                         text-sm md:text-base focus:outline-none focus:ring-2
                         focus:ring-blue-500 focus:border-blue-500 resize-y"
              placeholder="Ej. Encontré un error cuando..., Me gustaría que la app tuviera..., No me gustó que..."
            />
            <p className="mt-1 text-xs text-slate-400">
              Por favor no incluyas información personal identificable.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {exito && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {exito}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={enviando}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg
                         bg-blue-600 text-white text-sm md:text-base font-semibold shadow
                         hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed
                         transition-colors"
            >
              {enviando ? "Enviando..." : "Enviar sugerencia"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default BuzonMejorasPage;

