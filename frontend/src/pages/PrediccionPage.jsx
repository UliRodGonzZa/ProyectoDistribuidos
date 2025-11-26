import { useState, useRef, useEffect } from "react";
import { jsPDF } from "jspdf";

import logoML from "../assets/logo-ml-chip.svg";

const initialForm = {
  age: "",
  gender: "",
  academic_pressure: "",
  cgpa: "",
  study_hours: "",
  study_satisfaction: "",
  financial_stress: "",
  family_history: "",
  suicidal_thoughts: "",
  sleep_duration: "",
  dietary_habits: "",
  works: "",
  work_pressure: "",
};

function PrediccionPage() {
  const [form, setForm] = useState(initialForm);
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const [errorModal, setErrorModal] = useState({
    open: false,
    title: "",
    messages: [],
  });

  // ---------- MÉTRICAS ----------
  const startTimeRef = useRef(Date.now());
  const fieldFocusRef = useRef({});
  const fieldTimeRef = useRef({});
  const hasSubmittedRef = useRef(false);
  const sessionIdRef = useRef(
    (crypto && crypto.randomUUID && crypto.randomUUID()) ||
      `sess-${Date.now()}-${Math.random().toString(16).slice(2)}`
  );

  const getDeviceType = (width) => {
    if (width < 640) return "mobile";
    if (width < 1024) return "tablet";
    return "desktop";
  };

  const sendMetrics = async (eventType, extra = {}) => {
    try {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      await fetch(import.meta.env.VITE_API_URL + "/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType, // "submit" o "abandon"
          sessionId: sessionIdRef.current,
          startedAt: new Date(startTimeRef.current).toISOString(),
          userAgent: navigator.userAgent,
          device: {
            type: getDeviceType(screenWidth),
            width: screenWidth,
            height: screenHeight,
          },
          formSnapshot: {
            // solo para contexto estadístico, no es identificable
            hasAge: !!form.age,
            hasGender: !!form.gender,
            works: form.works || null,
          },
          ...extra,
        }),
      });
    } catch (err) {
      // Silenciar errores de métricas para no afectar UX
      console.error("Error enviando métricas:", err);
    }
  };

  const handleFieldFocus = (fieldName) => {
    fieldFocusRef.current[fieldName] = Date.now();
  };

  const handleFieldBlur = (fieldName) => {
    const start = fieldFocusRef.current[fieldName];
    if (!start) return;
    const delta = Date.now() - start;
    fieldTimeRef.current[fieldName] =
      (fieldTimeRef.current[fieldName] || 0) + delta;
    delete fieldFocusRef.current[fieldName];
  };

  // Enviar métrica de abandono si el usuario se va sin enviar
  useEffect(() => {
    return () => {
      if (!hasSubmittedRef.current) {
        sendMetrics("abandon", {
          abandonedAt: new Date().toISOString(),
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // ---------- FIN MÉTRICAS ----------

  const inputClasses =
    "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white/90 " +
    "outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow";
  const selectClasses =
    "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white/90 " +
    "outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow";

  const openErrorModal = (title, messages) => {
    setErrorModal({
      open: true,
      title,
      messages: Array.isArray(messages) ? messages : [messages],
    });
  };

  const closeErrorModal = () => {
    setErrorModal((prev) => ({ ...prev, open: false }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "works") {
      setForm((prev) => ({
        ...prev,
        works: value,
        work_pressure: value === "Yes" ? prev.work_pressure || "" : "",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const errores = [];

    if (!form.age) errores.push("Ingresa tu edad.");
    if (!form.gender) errores.push("Selecciona tu género.");
    if (!form.academic_pressure)
      errores.push("Indica tu nivel de presión académica (1–5).");
    if (!form.cgpa) errores.push("Ingresa tu promedio / CGPA.");
    if (!form.study_hours)
      errores.push("Indica tus horas de estudio/trabajo diarias.");
    if (!form.study_satisfaction)
      errores.push("Indica tu satisfacción con los estudios (1–5).");
    if (!form.financial_stress)
      errores.push("Indica tu nivel de estrés financiero (1–5).");
    if (!form.family_history)
      errores.push(
        "Indica si tienes antecedentes familiares de enfermedad mental."
      );
    if (!form.suicidal_thoughts)
      errores.push("Indica si has tenido pensamientos suicidas.");
    if (!form.sleep_duration)
      errores.push("Selecciona tu duración aproximada de sueño.");
    if (!form.dietary_habits)
      errores.push("Selecciona tus hábitos alimenticios.");
    if (!form.works) errores.push("Indica si actualmente trabajas.");

    const ageNum = Number(form.age);
    if (form.age && (isNaN(ageNum) || ageNum < 15 || ageNum > 80)) {
      errores.push("La edad debe estar entre 15 y 80 años.");
    }

    const apNum = Number(form.academic_pressure);
    if (form.academic_pressure && (isNaN(apNum) || apNum < 1 || apNum > 5)) {
      errores.push("La presión académica debe estar entre 1 y 5.");
    }

    const ssNum = Number(form.study_satisfaction);
    if (form.study_satisfaction && (isNaN(ssNum) || ssNum < 1 || ssNum > 5)) {
      errores.push("La satisfacción con los estudios debe estar entre 1 y 5.");
    }

    const fsNum = Number(form.financial_stress);
    if (form.financial_stress && (isNaN(fsNum) || fsNum < 1 || fsNum > 5)) {
      errores.push("El estrés financiero debe estar entre 1 y 5.");
    }

    if (form.works === "Yes") {
      if (!form.work_pressure) {
        errores.push(
          "Indica tu nivel de presión laboral (1–5) si actualmente trabajas."
        );
      } else {
        const wpNum = Number(form.work_pressure);
        if (isNaN(wpNum) || wpNum < 1 || wpNum > 5) {
          errores.push("La presión laboral debe estar entre 1 y 5.");
        }
      }
    }

    if (errores.length > 0) {
      openErrorModal("Revisa el formulario", errores);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResultado(null);

    const esValido = validateForm();
    if (!esValido) return;

    setCargando(true);

    try {
      const payload = {
        ...form,
        age: Number(form.age),
        academic_pressure: Number(form.academic_pressure),
        cgpa: Number(form.cgpa),
        study_hours: Number(form.study_hours),
        study_satisfaction: Number(form.study_satisfaction),
        financial_stress: Number(form.financial_stress),
        work_pressure:
          form.works === "Yes" ? Number(form.work_pressure || 0) : 0,
      };

      const submitTime = Date.now();

      // Delay para que se vea el loader
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const resp = await fetch(import.meta.env.VITE_API_URL + "/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Error en el servidor: ${txt}`);
      }

      const data = await resp.json();
      setResultado(data);
      setShowResult(true);

      // Marcar que sí se envió (no abandono)
      hasSubmittedRef.current = true;

      // Enviar métricas de envío exitoso
      const totalMs = submitTime - startTimeRef.current;

      await sendMetrics("submit", {
        completedAt: new Date().toISOString(),
        timestampEnvio: new Date(submitTime).toISOString(),
        totalMs,
        fieldsMs: fieldTimeRef.current,
        prediction: {
          // info mínima para análisis agregados
          prediction: data?.prediction ?? null,
          probability: data?.probability ?? null,
        },
      });
    } catch (err) {
      openErrorModal(
        "Error al procesar la solicitud",
        err.message || "Ocurrió un error inesperado."
      );
    } finally {
      setCargando(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setResultado(null);
    setShowResult(false);

    // Reset de métricas de campos (mantiene el mismo sessionId y startTime)
    fieldFocusRef.current = {};
    fieldTimeRef.current = {};
  };

  const handleCloseResult = () => {
    handleReset();
  };

  {
    /* AGREGADO */
  }

  const getLogoAsPngDataUrl = () => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = logoML;
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/png");
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = (err) => reject(err);
    });
  };

  const handleGenerateReport = async () => {
    if (!resultado) return;

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const marginX = 20; // margen izquierdo
      const maxWidth = pageWidth - marginX * 2;
      const lineHeight = 5.5;
      const paragraphSpacing = 4;

      let y = 20;

      // ---------- helper simple para limpiar texto ----------
      const clean = (text) =>
        (text || "")
          .toString()
          .replace(/\s+/g, " ")
          .replace(/\u00A0/g, " ")
          .trim();

      const ensureSpace = (needed = 20) => {
        if (y + needed > pageHeight - 20) {
          addFooter();
          doc.addPage();
          y = 20;
        }
      };

      const addFooter = () => {
        doc.setDrawColor(210, 210, 210);
        doc.setLineWidth(0.3);
        doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor("#6b7280");

        const text =
          "Si necesitas apoyo emocional, comunicate a la Linea de la Vida (Mexico): 800-911-2000";
        const w = doc.getTextWidth(text);
        doc.text(text, (pageWidth - w) / 2, pageHeight - 10);
      };

      // ---------- parrafo justificado usando align: "justify" ----------
      const writeJustifiedParagraph = (raw) => {
        const text = clean(raw);
        if (!text) return;

        ensureSpace(25);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor("#1a1a1a");

        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, marginX, y, {
          maxWidth,
          align: "justify",
        });

        y += lines.length * lineHeight + paragraphSpacing;
      };

      // ---------- logo ----------
      try {
        const png = await getLogoAsPngDataUrl();
        if (png) {
          doc.addImage(png, "PNG", 15, 10, 11, 11);
        }
      } catch (e) {
        console.warn("No se pudo cargar el logo en el PDF:", e);
      }

      // ---------- encabezado ----------
      y = 26;

      const fechaStr = new Date().toLocaleString("es-MX", {
        dateStyle: "full",
        timeStyle: "short",
      });

      const titulo = clean("Reporte de Estimacion de Riesgo de Depresion");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor("#1f2933");
      let w = doc.getTextWidth(titulo);
      doc.text(titulo, (pageWidth - w) / 2, y);
      y += 6;

      const subtitulo = clean(
        "Evaluacion generada mediante un modelo predictivo — No es un diagnostico clinico"
      );
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor("#0ea5e9");
      w = doc.getTextWidth(subtitulo);
      doc.text(subtitulo, (pageWidth - w) / 2, y);
      y += 5;

      const fechaTexto = clean(`Fecha del reporte: ${fechaStr}`);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor("#4b4b4b");
      w = doc.getTextWidth(fechaTexto);
      doc.text(fechaTexto, (pageWidth - w) / 2, y);
      y += 5;

      // linea de encabezado
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(15, y, pageWidth - 15, y);

      // separacion tipo B (6–8 mm) antes del primer parrafo
      y += 8;

      // ---------- mapeo de datos para narrativa ----------
      const generoLargo =
        form.gender === "Male"
          ? "un hombre"
          : form.gender === "Female"
          ? "una mujer"
          : "una persona";

      const edad = form.age || "no especificada";

      const presionAcad = form.academic_pressure || "no especificado";
      const cgpa = form.cgpa || "no especificado";
      const horas = form.study_hours || "no especificadas";
      const satisf = form.study_satisfaction || "no especificado";
      const estFin = form.financial_stress || "no especificado";

      const antecedentes =
        form.family_history === "Yes"
          ? "si se reportan antecedentes familiares de problemas de salud mental"
          : "no se reportan antecedentes familiares de problemas de salud mental";

      const suicida =
        form.suicidal_thoughts === "Yes"
          ? "la persona menciona haber tenido pensamientos suicidas en algun momento"
          : "la persona indica que no ha tenido pensamientos suicidas";

      const suenoLargo =
        form.sleep_duration === "7-8 hours"
          ? "una duracion de sueno entre 7 y 8 horas"
          : form.sleep_duration === "Less than 5 hours"
          ? "una duracion de sueno menor a 5 horas"
          : form.sleep_duration === "More than 8 hours"
          ? "una duracion de sueno mayor a 8 horas"
          : "una duracion de sueno no especificada";

      const dietaLargo =
        form.dietary_habits === "Unhealthy"
          ? "habitos alimenticios poco saludables"
          : form.dietary_habits === "Moderate"
          ? "habitos alimenticios moderados"
          : form.dietary_habits === "Others"
          ? "habitos alimenticios saludables"
          : "habitos alimenticios no especificados";

      const trabajoLargo =
        form.works === "Yes"
          ? `actualmente trabaja y reporta un nivel de presion laboral de ${
              form.work_pressure || "no especificado"
            }`
          : "actualmente no se encuentra trabajando";

      const probPorc =
        resultado?.probability && typeof resultado.probability === "number"
          ? (resultado.probability * 100).toFixed(1)
          : "N/A";

      const esAltoRiesgo = resultado.prediction === 1;

      // ---------- narrativa calida, profesional (nivel B) ----------
      writeJustifiedParagraph(
        "Este informe presenta una evaluacion profesional basada en un modelo predictivo que estima la probabilidad de presentar sintomas relacionados con la depresion. La informacion se genera a partir de los datos que compartiste en el cuestionario y debe entenderse como una aproximacion estadistica, no como un diagnostico clinico definitivo."
      );

      writeJustifiedParagraph(
        `La persona evaluada es ${generoLargo} de ${edad} años, quien reporta un nivel de presion academica de ${presionAcad}, un promedio academico de ${cgpa} y alrededor de ${horas} hora(s) de estudio o trabajo al dia. Tambien se indica una satisfaccion con los estudios de ${satisf} y un nivel de estres financiero de ${estFin}.`
      );

      writeJustifiedParagraph(
        `En el ambito de la salud mental, ${antecedentes} y, ademas, ${suicida}. Estos elementos ayudan a comprender el contexto emocional desde el cual se interpretan los resultados del modelo.`
      );

      writeJustifiedParagraph(
        `En cuanto al estilo de vida, se describe ${suenoLargo} y ${dietaLargo}. En relacion con la situacion laboral, ${trabajoLargo}. Estos factores pueden influir tanto en el bienestar emocional como en la capacidad de manejar las demandas diarias.`
      );

      if (esAltoRiesgo) {
        writeJustifiedParagraph(
          `A partir de la combinacion de estos datos, el modelo estima un riesgo ELEVADO, con una probabilidad aproximada del ${probPorc}% de presentar sintomas asociados a depresion. Este resultado no significa que exista un diagnostico, pero si sugiere que podria ser muy valioso prestar especial atencion a las emociones, los habitos y las situaciones que te generan malestar.`
        );
      } else {
        writeJustifiedParagraph(
          `Con base en la informacion proporcionada, el modelo estima un riesgo BAJO, con una probabilidad aproximada del ${probPorc}% de presentar sintomas asociados a depresion. Aunque este resultado no senala una situacion de alto riesgo, el bienestar emocional sigue siendo algo que merece cuidado constante y espacios de escucha cuando sea necesario.`
        );
      }

      writeJustifiedParagraph(
        "Es importante recordar que ningun modelo predictivo puede reemplazar la mirada de un profesional de la salud mental. Los resultados que se muestran aqui tienen como proposito ofrecer una orientacion inicial y ayudarte a reflexionar sobre tu situacion, pero el diagnostico y el acompanamiento terapeutico solo pueden ser realizados por especialistas capacitados."
      );

      writeJustifiedParagraph(
        "Tu bienestar emocional es importante. Reconocer lo que sientes, pedir apoyo cuando algo te sobrepasa y compartir tus preocupaciones con personas de confianza son pasos valiosos. Hablar con un profesional puede ayudarte a encontrar nuevas herramientas para manejar lo que estas viviendo y construir una relacion mas amable contigo mismo."
      );

      // ---------- TABLA ANGOSTA Y CENTRADA ----------
      ensureSpace(40);

      const tableWidth = 140; // mas angosta
      const tableX = (pageWidth - tableWidth) / 2;
      const rowHeight = 7;

      // encabezado tabla
      doc.setFillColor("#0ea5e9");
      doc.rect(tableX, y, tableWidth, rowHeight, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor("#ffffff");
      doc.text("Campo", tableX + 4, y + 4.5);
      const headerValor = "Valor";
      doc.text(
        headerValor,
        tableX + tableWidth - 4 - doc.getTextWidth(headerValor),
        y + 4.5
      );

      y += rowHeight + 1;

      const rows = [
        ["Edad", form.age || "N/D"],
        ["Genero", form.gender === "Male" ? "Hombre" : "Mujer"],
        ["Presion academica", form.academic_pressure || "N/D"],
        ["Promedio academico (CGPA)", form.cgpa || "N/D"],
        ["Horas estudio/trabajo", form.study_hours || "N/D"],
        ["Satisfaccion academica", form.study_satisfaction || "N/D"],
        ["Estres financiero", form.financial_stress || "N/D"],
        [
          "Antecedentes familiares",
          form.family_history === "Yes" ? "Si" : "No",
        ],
        [
          "Pensamientos suicidas",
          form.suicidal_thoughts === "Yes" ? "Si" : "No",
        ],
        [
          "Duracion del sueno",
          form.sleep_duration === "7-8 hours"
            ? "7–8 horas"
            : form.sleep_duration === "Less than 5 hours"
            ? "Menos de 5 horas"
            : form.sleep_duration === "More than 8 hours"
            ? "Mas de 8 horas"
            : "No especificado",
        ],
        [
          "Habitos alimenticios",
          form.dietary_habits === "Unhealthy"
            ? "Poco saludables"
            : form.dietary_habits === "Moderate"
            ? "Moderados"
            : "Saludables",
        ],
        ["Trabaja actualmente", form.works === "Yes" ? "Si" : "No"],
        ["Presion laboral", form.works === "Yes" ? form.work_pressure : "N/A"],
      ];

      let gray = false;

      rows.forEach(([campo, valor]) => {
        ensureSpace(rowHeight + 4);

        doc.setFillColor(gray ? "#f3f4f6" : "#ffffff");
        doc.rect(tableX, y, tableWidth, rowHeight, "F");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor("#1a1a1a");

        doc.text(clean(campo), tableX + 4, y + 4.5);

        const valStr = clean(valor ?? "N/A");
        doc.text(
          valStr,
          tableX + tableWidth - 4 - doc.getTextWidth(valStr),
          y + 4.5
        );

        gray = !gray;
        y += rowHeight + 1;
      });

      y += 6;

      // ---------- cierre calido ----------
      writeJustifiedParagraph(
        "Si en algun momento sientes que las emociones se vuelven demasiado intensas, que te cuesta seguir con tus actividades diarias o simplemente necesitas hablar con alguien, recuerda que buscar ayuda es un acto de valor, no de debilidad. Existen profesionales y lineas de apoyo que pueden acompanarte y ofrecerte orientacion en momentos dificiles."
      );

      addFooter();

      doc.save("reporte_riesgo_depresion.pdf");
    } catch (err) {
      console.error("Error generando PDF:", err);
    }
  };

  {
    /* AGREGADO */
  }

  return (
    <div className="min-h-[calc(100vh-160px)] flex justify-center px-4 py-2">
      <div className="z-10 w-full max-w-4xl space-y-4">
        {/* Tarjeta principal: formulario (ARRIBA) */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 space-y-6">
          <header className="space-y-2">
            <p className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold mb-1">
              Proyecto IA · Diagnóstico de depresión
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Cuestionario para estimar riesgo de depresión
            </h1>
            <p className="text-sm text-slate-600">
              Esta herramienta usa un modelo de regresión logística entrenado
              con un dataset sintético de estudiantes. No sustituye una
              valoración profesional en salud mental.
            </p>
          </header>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 pr-1" // <--- SIN max-h ni overflow interno
          >
            {/* Datos generales */}
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-800 tracking-wide uppercase">
                Datos generales
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Edad
                  </label>
                  <input
                    type="number"
                    name="age"
                    min={15}
                    max={80}
                    value={form.age}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("age")}
                    onBlur={() => handleFieldBlur("age")}
                    required
                    className={inputClasses}
                    placeholder="Ejemplo: 21"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Género
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("gender")}
                    onBlur={() => handleFieldBlur("gender")}
                    required
                    className={selectClasses}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="Male">Hombre</option>
                    <option value="Female">Mujer</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Factores académicos */}
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-800 tracking-wide uppercase">
                Factores académicos
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Presión académica (1–5)
                  </label>
                  <input
                    type="number"
                    name="academic_pressure"
                    min={1}
                    max={5}
                    value={form.academic_pressure}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("academic_pressure")}
                    onBlur={() => handleFieldBlur("academic_pressure")}
                    required
                    className={inputClasses}
                    placeholder="1 a 5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    CGPA / Promedio
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="cgpa"
                    value={form.cgpa}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("cgpa")}
                    onBlur={() => handleFieldBlur("cgpa")}
                    required
                    className={inputClasses}
                    placeholder="Ejemplo: 8.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Horas de estudio/trabajo (diarias)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    name="study_hours"
                    value={form.study_hours}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("study_hours")}
                    onBlur={() => handleFieldBlur("study_hours")}
                    required
                    className={inputClasses}
                    placeholder="Ejemplo: 6"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Satisfacción con los estudios (1–5)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    name="study_satisfaction"
                    value={form.study_satisfaction}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("study_satisfaction")}
                    onBlur={() => handleFieldBlur("study_satisfaction")}
                    required
                    className={inputClasses}
                    placeholder="1 a 5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Estrés financiero (1–5)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    name="financial_stress"
                    value={form.financial_stress}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("financial_stress")}
                    onBlur={() => handleFieldBlur("financial_stress")}
                    required
                    className={inputClasses}
                    placeholder="1 a 5"
                  />
                </div>
              </div>
            </section>

            {/* Salud mental y contexto */}
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-800 tracking-wide uppercase">
                Salud mental y trabajo
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Antecedentes familiares de enfermedad mental
                  </label>
                  <select
                    name="family_history"
                    value={form.family_history}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("family_history")}
                    onBlur={() => handleFieldBlur("family_history")}
                    required
                    className={selectClasses}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="No">No</option>
                    <option value="Yes">Sí</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ¿Has tenido pensamientos suicidas?
                  </label>
                  <select
                    name="suicidal_thoughts"
                    value={form.suicidal_thoughts}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("suicidal_thoughts")}
                    onBlur={() => handleFieldBlur("suicidal_thoughts")}
                    required
                    className={selectClasses}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="No">No</option>
                    <option value="Yes">Sí</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Duración del sueño
                  </label>
                  <select
                    name="sleep_duration"
                    value={form.sleep_duration}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("sleep_duration")}
                    onBlur={() => handleFieldBlur("sleep_duration")}
                    required
                    className={selectClasses}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="7-8 hours">7–8 horas</option>
                    <option value="Less than 5 hours">Menos de 5 horas</option>
                    <option value="More than 8 hours">Más de 8 horas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Hábitos alimenticios
                  </label>
                  <select
                    name="dietary_habits"
                    value={form.dietary_habits}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("dietary_habits")}
                    onBlur={() => handleFieldBlur("dietary_habits")}
                    required
                    className={selectClasses}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="Moderate">Moderados</option>
                    <option value="Others">Saludables</option>
                    <option value="Unhealthy">Poco saludables</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ¿Trabajas actualmente?
                  </label>
                  <select
                    name="works"
                    value={form.works}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus("works")}
                    onBlur={() => handleFieldBlur("works")}
                    required
                    className={selectClasses}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="No">No</option>
                    <option value="Yes">Sí</option>
                  </select>
                </div>
              </div>

              {form.works === "Yes" && (
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Presión laboral (1–5)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      name="work_pressure"
                      value={form.work_pressure}
                      onChange={handleChange}
                      onFocus={() => handleFieldFocus("work_pressure")}
                      onBlur={() => handleFieldBlur("work_pressure")}
                      required
                      className={inputClasses}
                      placeholder="1 a 5"
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={cargando}
                className="w-full sm:w-48 inline-flex justify-center items-center px-4 py-2.5 rounded-2xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 transition-colors cursor-pointer"
              >
                {cargando ? "Calculando..." : "Calcular riesgo"}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-48 inline-flex justify-center items-center px-4 py-2.5 rounded-2xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Limpiar formulario
              </button>
            </div>
          </form>
        </div>

        {/* Tarjeta pequeña de explicación (ABAJO) */}
        <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm text-xs text-slate-600 space-y-2">
          <p className="font-semibold text-slate-800">
            ¿Cómo funciona este modelo?
          </p>
          <p>
            El mod está basado en regresión logística y fue entrenado con un
            dataset sintético de estudiantes, considerando variables académicas,
            de sueño, hábitos y antecedentes. Cada envío se almacena en una base
            de datos Redis para poder construir posteriormente vistas de
            estadísticas y análisis agregados.
          </p>
        </div>
      </div>

      {/* Overlay de carga */}
      {cargando && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
            <p className="text-sm font-medium text-slate-700">
              Calculando predicción...
            </p>
          </div>
        </div>
      )}

      {/* Modal de resultado */}
      {showResult && resultado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-100 p-6 space-y-4">
            <button
              type="button"
              onClick={handleCloseResult}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-sm"
            >
              ✕
            </button>

            <div className="space-y-3">
              <div
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  resultado.prediction === 1
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                {resultado.prediction === 1
                  ? "Alto riesgo estimado"
                  : "Bajo riesgo estimado"}
              </div>

              <div className="text-4xl font-bold text-slate-900">
                {resultado.probability &&
                typeof resultado.probability === "number"
                  ? `${(resultado.probability * 100).toFixed(1)}%`
                  : resultado.probability}
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">
                {resultado.message}
              </p>

              <p className="text-[11px] text-slate-500 pt-1">
                Este resultado es orientativo y no sustituye una valoración
                clínica profesional.
              </p>
            </div>
            {/* AGREGADO */}
            {/* AGREGADO */}
            <div className="pt-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleGenerateReport}
                className="inline-flex justify-center items-center px-4 py-2.5 rounded-2xl text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
              >
                Generar reporte
              </button>

              <button
                type="button"
                onClick={handleCloseResult}
                className="inline-flex justify-center items-center px-4 py-2.5 rounded-2xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Cerrar y reiniciar
              </button>
            </div>
            {/* AGREGADO */}
          </div>
        </div>
      )}

      {/* Modal de error */}
      {errorModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-red-100 p-6 space-y-4">
            <button
              type="button"
              onClick={closeErrorModal}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-sm"
            >
              ✕
            </button>

            <div className="space-y-3">
              <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                Error en el formulario
              </div>

              <h2 className="text-base font-semibold text-slate-900">
                {errorModal.title}
              </h2>

              <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                {errorModal.messages.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={closeErrorModal}
                className="inline-flex justify-center items-center px-4 py-2.5 rounded-2xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrediccionPage;
