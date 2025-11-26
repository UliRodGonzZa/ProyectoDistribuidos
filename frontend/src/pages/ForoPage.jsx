import { useState, useEffect } from "react";

function ForoPage() {
  const [publicaciones, setPublicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  
  const [nuevaPublicacion, setNuevaPublicacion] = useState("");
  const [enviandoPost, setEnviandoPost] = useState(false);
  
  const [respuestas, setRespuestas] = useState({});
  const [mostrarRespuestas, setMostrarRespuestas] = useState({});
  const [nuevaRespuesta, setNuevaRespuesta] = useState({});
  const [enviandoRespuesta, setEnviandoRespuesta] = useState({});

  const [ordenamiento, setOrdenamiento] = useState("recientes");

  // Usar variable de entorno como en tus otros componentes
  const API_URL = window.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    cargarPublicaciones();
  }, [ordenamiento]);

  const cargarPublicaciones = async () => {
    setCargando(true);
    setError("");

    try {
      const resp = await fetch(
        `${API_URL}/api/foro/publicaciones?orden=${ordenamiento}`
      );
      
      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`Error ${resp.status}: ${errorText}`);
      }

      const data = await resp.json();
      setPublicaciones(data.publicaciones || []);
    } catch (err) {
      console.error("Error al cargar publicaciones:", err);
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleCrearPublicacion = async () => {
    if (!nuevaPublicacion.trim()) {
      return;
    }

    setEnviandoPost(true);
    setError("");

    try {
      const resp = await fetch(
        `${API_URL}/api/foro/publicaciones`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contenido: nuevaPublicacion.trim() }),
        }
      );

      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`Error ${resp.status}: ${errorText}`);
      }

      setNuevaPublicacion("");
      // Esperar un poco antes de recargar para asegurar que Redis se actualice
      await new Promise(resolve => setTimeout(resolve, 300));
      await cargarPublicaciones();
    } catch (err) {
      console.error("Error al crear publicación:", err);
      setError(err.message);
    } finally {
      setEnviandoPost(false);
    }
  };

  const cargarRespuestas = async (postId) => {
    try {
      const resp = await fetch(
        `${API_URL}/api/foro/publicaciones/${postId}/respuestas`
      );
      
      if (!resp.ok) {
        throw new Error("Error al cargar respuestas");
      }

      const data = await resp.json();
      setRespuestas(prev => ({
        ...prev,
        [postId]: data.respuestas || []
      }));
    } catch (err) {
      console.error("Error cargando respuestas:", err);
    }
  };

  const toggleRespuestas = (postId) => {
    const nuevoEstado = !mostrarRespuestas[postId];
    
    setMostrarRespuestas(prev => ({
      ...prev,
      [postId]: nuevoEstado
    }));

    if (nuevoEstado && !respuestas[postId]) {
      cargarRespuestas(postId);
    }
  };

  const handleCrearRespuesta = async (postId) => {
    const contenido = nuevaRespuesta[postId];
    
    if (!contenido || !contenido.trim()) {
      return;
    }

    setEnviandoRespuesta(prev => ({ ...prev, [postId]: true }));

    try {
      const resp = await fetch(
        `${API_URL}/api/foro/publicaciones/${postId}/respuestas`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contenido: contenido.trim() }),
        }
      );

      if (!resp.ok) {
        throw new Error("Error al crear respuesta");
      }

      setNuevaRespuesta(prev => ({ ...prev, [postId]: "" }));
      // Esperar un poco antes de recargar
      await new Promise(resolve => setTimeout(resolve, 300));
      await cargarRespuestas(postId);
      await cargarPublicaciones();
    } catch (err) {
      console.error("Error creando respuesta:", err);
      setError(err.message);
    } finally {
      setEnviandoRespuesta(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleReaccion = async (postId, tipo) => {
    try {
      const resp = await fetch(
        `${API_URL}/api/foro/publicaciones/${postId}/reaccion`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tipo }),
        }
      );

      if (!resp.ok) {
        throw new Error("Error al agregar reacción");
      }

      // Actualizar solo el contador de likes localmente para mejor UX
      setPublicaciones(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1 }
          : post
      ));

      // Esperar un poco y recargar
      await new Promise(resolve => setTimeout(resolve, 300));
      await cargarPublicaciones();
    } catch (err) {
      console.error("Error al reaccionar:", err);
      setError(err.message);
    }
  };

  const formatearFecha = (timestamp) => {
    const fecha = new Date(timestamp);
    const ahora = new Date();
    const diff = Math.floor((ahora - fecha) / 1000);

    if (diff < 60) return "hace un momento";
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `hace ${Math.floor(diff / 86400)} d`;
    
    return fecha.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: fecha.getFullYear() !== ahora.getFullYear() ? "numeric" : undefined
    });
  };

  const generarAvatar = (id) => {
    const colores = [
      "bg-blue-500",
      "bg-emerald-500",
      "bg-purple-500",
      "bg-rose-500",
      "bg-amber-500",
      "bg-cyan-500",
      "bg-indigo-500",
      "bg-pink-500"
    ];
    
    const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colores[hash % colores.length];
  };

  const handleKeyPress = (e, callback) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      callback();
    }
  };

  if (cargando && publicaciones.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
        <section className="max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-full border-4 border-blue-500/30 border-t-blue-600 animate-spin" />
            <p className="text-sm text-slate-600">Cargando publicaciones...</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
      <section className="max-w-4xl mx-auto space-y-6 pb-8">
        <header className="space-y-2">
          <p className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold">
            Comunidad · Foro Anónimo
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Foro de apoyo y conversación
          </h1>
          <p className="text-sm md:text-base text-slate-600">
            Comparte tus experiencias, preguntas o simplemente conversa de forma anónima. 
            Todas las publicaciones son privadas y no se guarda información personal.
          </p>
        </header>

        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-100 p-4">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button 
                onClick={() => setError("")}
                className="text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Formulario nueva publicación */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="shrink-0">
                <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
                  Tú
                </div>
              </div>
              
              <div className="flex-1">
                <textarea
                  value={nuevaPublicacion}
                  onChange={(e) => setNuevaPublicacion(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, handleCrearPublicacion)}
                  placeholder="¿Qué te gustaría compartir?"
                  rows={3}
                  maxLength={500}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white/90 
                           outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           transition-shadow resize-none"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-slate-500">
                    {nuevaPublicacion.length}/500 caracteres
                  </p>
                  <button
                    onClick={handleCrearPublicacion}
                    disabled={!nuevaPublicacion.trim() || enviandoPost}
                    className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold 
                             text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 
                             transition-colors"
                  >
                    {enviandoPost ? "Publicando..." : "Publicar"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controles de ordenamiento */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700">
            {publicaciones.length} {publicaciones.length === 1 ? "publicación" : "publicaciones"}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setOrdenamiento("recientes")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                ordenamiento === "recientes"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Recientes
            </button>
            <button
              onClick={() => setOrdenamiento("populares")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                ordenamiento === "populares"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Populares
            </button>
          </div>
        </div>

        {/* Lista de publicaciones */}
        <div className="space-y-4">
          {publicaciones.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-600">
                Aún no hay publicaciones. ¡Sé el primero en compartir algo!
              </p>
            </div>
          ) : (
            publicaciones.map((post) => (
              <div
                key={post.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
              >
                {/* Cabecera de publicación */}
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <div
                      className={`h-10 w-10 rounded-full ${generarAvatar(
                        post.id
                      )} flex items-center justify-center text-white text-xs font-semibold`}
                    >
                      A
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        Anónimo
                      </p>
                      <span className="text-xs text-slate-500">·</span>
                      <p className="text-xs text-slate-500">
                        {formatearFecha(post.timestamp)}
                      </p>
                    </div>

                    <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap wrap-break-word">
                      {post.contenido}
                    </p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleReaccion(post.id, "like")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs 
                             font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    {post.likes > 0 && post.likes}
                  </button>

                  <button
                    onClick={() => toggleRespuestas(post.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs 
                             font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {post.respuestas_count || 0}
                  </button>
                </div>

                {/* Sección de respuestas */}
                {mostrarRespuestas[post.id] && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                    {/* Formulario nueva respuesta */}
                    <div className="flex gap-3">
                      <div className="shrink-0">
                        <div className="h-8 w-8 rounded-full bg-linear-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-xs font-semibold">
                          Tú
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <textarea
                          value={nuevaRespuesta[post.id] || ""}
                          onChange={(e) =>
                            setNuevaRespuesta(prev => ({
                              ...prev,
                              [post.id]: e.target.value
                            }))
                          }
                          onKeyPress={(e) => handleKeyPress(e, () => handleCrearRespuesta(post.id))}
                          placeholder="Escribe una respuesta..."
                          rows={2}
                          maxLength={300}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm 
                                   bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 
                                   focus:border-blue-500 transition-shadow resize-none"
                        />
                        <div className="flex items-center justify-end mt-1.5">
                          <button
                            onClick={() => handleCrearRespuesta(post.id)}
                            disabled={
                              !nuevaRespuesta[post.id]?.trim() ||
                              enviandoRespuesta[post.id]
                            }
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs 
                                     font-semibold text-white bg-blue-600 hover:bg-blue-700 
                                     disabled:bg-blue-300 transition-colors"
                          >
                            {enviandoRespuesta[post.id] ? "Enviando..." : "Responder"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Lista de respuestas */}
                    {respuestas[post.id] && respuestas[post.id].length > 0 && (
                      <div className="space-y-3 ml-11">
                        {respuestas[post.id].map((resp) => (
                          <div
                            key={resp.id}
                            className="rounded-2xl bg-slate-50 border border-slate-100 p-4"
                          >
                            <div className="flex gap-2.5">
                              <div className="shrink-0">
                                <div
                                  className={`h-7 w-7 rounded-full ${generarAvatar(
                                    resp.id
                                  )} flex items-center justify-center text-white text-xs font-semibold`}
                                >
                                  A
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-semibold text-slate-900">
                                    Anónimo
                                  </p>
                                  <span className="text-xs text-slate-400">·</span>
                                  <p className="text-xs text-slate-500">
                                    {formatearFecha(resp.timestamp)}
                                  </p>
                                </div>

                                <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap wrap-break-word">
                                  {resp.contenido}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {respuestas[post.id] && respuestas[post.id].length === 0 && (
                      <p className="text-xs text-slate-500 text-center py-4">
                        Aún no hay respuestas. ¡Sé el primero en comentar!
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default ForoPage;