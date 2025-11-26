import { useState, useEffect } from "react";
import { Link } from "react-router-dom";


function MenuPage() {

  const [fraseDia, setFraseDia] = useState(null);
  const [cargandoFrase, setCargandoFrase] = useState(true);
  const [errorFrase, setErrorFrase] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const cargarFrase = async () => {
      try {
        setCargandoFrase(true);
        setErrorFrase("");

        const resp = await fetch(`${API_URL}/api/frase-dia`);

        if (!resp.ok) {
          throw new Error("No se pudo obtener la frase del día.");
        }

        const data = await resp.json();
        setFraseDia(data);
      } catch (err) {
        console.error("Error al cargar frase del día:", err);
        setErrorFrase(err.message || "Error al cargar la frase del día.");
      } finally {
        setCargandoFrase(false);
      }
    };

    cargarFrase();
  }, []);






  return (
    <section className="max-w-6xl mx-auto grid gap-10 md:grid-cols-[1.3fr,1fr] items-center">
      {/* Texto / Hero */}
      <div className="space-y-6">
        <p className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold">
          Proyecto IA · Depresión en estudiantes
        </p>
        
        {/* Nuevo Código */}
        
                {/* Frase del día */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Frase del día
          </p>

          {cargandoFrase ? (
            <p className="text-sm text-slate-400">Cargando frase...</p>
          ) : errorFrase ? (
            <p className="text-sm text-slate-400">
              No se pudo cargar la frase del día.
            </p>
          ) : fraseDia && fraseDia.contenido ? (
            <p className="text-sm text-slate-800 italic leading-relaxed">
              {fraseDia.contenido}
            </p>
          ) : (
            <p className="text-sm text-slate-400">
              Aún no hay una frase del día registrada.
            </p>
          )}
        </div>

        
        
        
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
          Estimación de riesgo de depresión en estudiantes{" "}
          <span className="text-blue-600">usando Machine Learning</span>
        </h1>
        <p className="text-sm md:text-base text-slate-600 text-justify pl-3.5 pr-3.5">
          Este proyecto implementa un modelo de regresión logística entrenado con un dataset de estudiantes que recopila información relacionada con salud mental, hábitos académicos y características personales. El objetivo es estimar el riesgo de depresión a partir de variables como presión académica, promedio escolar (CGPA), duración del sueño, hábitos alimenticios, antecedentes familiares y presencia de pensamientos suicidas. El modelo fue entrenado con datos estructurados provenientes de un conjunto público disponible en Kaggle, el cual ofrece características diversas y equilibradas que permiten generar una predicción estadísticamente confiable del riesgo. Durante el proceso, se realizó limpieza de datos, codificación de variables categóricas y normalización para garantizar un desempeño óptimo. La herramienta resultante permite que un usuario responda un cuestionario breve y reciba una estimación inmediata del riesgo, acompañado de una probabilidad numérica y una interpretación clara del resultado. Aunque se basa en técnicas de Machine Learning, esta plataforma no sustituye evaluaciones profesionales en salud mental; su propósito es educativo y orientativo, mostrando cómo la ciencia de datos puede apoyar la detección temprana de patrones asociados a problemáticas psicológicas. Además, cada respuesta del cuestionario se almacena en una base de datos Redis, lo que permite generar estadísticas agregadas sobre distribución de riesgos, diferencias entre géneros, impacto de la presión académica, correlación entre sueño y estado emocional, entre otros análisis que posteriormente se visualizarán en el panel de estadísticas del proyecto.
        </p>

<div className="flex flex-col md:flex-row gap-3 justify-center">
  <Link
    to="/prediccion"
    className="w-full md:w-52 inline-flex justify-center items-center px-5 py-2.5 
               rounded-2xl text-sm font-semibold text-white bg-blue-600 
               hover:bg-blue-700 transition-colors"
  >
    Ir a Cuestionario
  </Link>

  <Link
    to="/estadisticas"
    className="w-full md:w-52 inline-flex justify-center items-center px-5 py-2.5 
               rounded-2xl text-sm font-semibold text-blue-700 bg-blue-50 
               hover:bg-blue-100 transition-colors"
  >
    Estadísticas
  </Link>
</div>



        <div className="grid md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="rounded-2xl bg-white border border-slate-200 p-3">
            <p className="font-semibold text-slate-900 mb-1">
              Enfoque académico
            </p>
            <p>
              Analiza variables como presión académica, horas de estudio y
              rendimiento CGPA (Promedio acumulado de calificaciones).
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-3">
            <p className="font-semibold text-slate-900 mb-1">
              Factores de bienestar
            </p>
            <p>
              Considera hábitos de sueño, alimentación, estrés financiero y
              antecedentes familiares.
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-3">
            <p className="font-semibold text-slate-900 mb-1">
              Uso responsable
            </p>
            <p>
              La herramienta es orientativa y no reemplaza una valoración
              profesional en salud mental.
            </p>
          </div>
        </div>
      </div>

      {/* “Imagen” de IA */}
      <div className="relative">
        <div className="rounded-3xl bg-linear-to-br from-blue-500 via-indigo-500 to-sky-400 p-6 md:p-8 shadow-2xl text-white h-full flex flex-col justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
              Modelo activo
            </div>
            <h2 className="text-2xl font-semibold">
              Inteligencia Artificial aplicada a la salud mental
            </h2>
            <p className="text-sm text-blue-50/90">
              El modelo analiza las respuestas del cuestionario y genera una
              probabilidad estimada de riesgo de depresión, usando técnicas de
              aprendizaje supervisado.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-2xl bg-white/10 backdrop-blur p-3">
              <p className="text-blue-100">Tipo de modelo</p>
              <p className="font-semibold">Regresión logística</p>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur p-3">
              <p className="text-blue-100">Métrica AUC (Área bajo la curva ROC)</p>
              <p className="font-semibold">0.89 aprox.</p>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur p-3 col-span-2">
              <p className="text-blue-100 mb-1">Entrenado con dataset sintético</p>
              <p className="text-[11px] text-blue-50/80">
                Dataset de estudiantes de Kaggle, preprocesado y codificado
                mediante variables numéricas y dummies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MenuPage;
