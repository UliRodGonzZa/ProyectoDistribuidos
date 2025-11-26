import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#2563EB", "#F97316", "#22C55E", "#EC4899", "#8B5CF6"];

function EstadisticasPage() {
  const [stats, setStats] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setCargando(true);
      setError("");

      try {
        const resp = await fetch(import.meta.env.VITE_API_URL + "/api/stats");
        if (!resp.ok) {
          const txt = await resp.text();
          throw new Error("Error al obtener estadísticas: " + txt);
        }
        const data = await resp.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    fetchStats();
  }, []);

  if (cargando) {
    return (
      <section className="max-w-5xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-blue-500/30 border-t-blue-600 animate-spin" />
          <p className="text-sm text-slate-600">
            Calculando estadísticas del modelo...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-4xl mx-auto space-y-3">
        <h1 className="text-2xl font-bold text-slate-900">Estadísticas</h1>
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl px-3 py-2">
          {error}
        </p>
      </section>
    );
  }

  if (!stats || stats.total_registros === 0) {
    return (
      <section className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Estadísticas</h1>
        <p className="text-sm md:text-base text-slate-600">
          Aún no hay cuestionarios suficientes para mostrar estadísticas
          agregadas. Cuando se registren más respuestas, aquí verás gráficos con
          distribuciones y porcentajes.
        </p>
        <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
          Responde el cuestionario en la sección{" "}
          <span className="font-semibold">Predicción</span> para comenzar a
          generar datos.
        </div>
      </section>
    );
  }

  // --------- Transformación de datos para Recharts ---------

  const genderData = Object.entries(stats.gender_distribution || {}).map(
    ([key, value]) => ({
      name: key === "Male" ? "Hombres" : key === "Female" ? "Mujeres" : "Otro",
      value: Number(value.pct.toFixed(1)),
    })
  );

  const riskData = [
    {
      name: "Alto riesgo",
      value: Number(stats.risk_distribution.high.pct.toFixed(1)),
    },
    {
      name: "Bajo riesgo",
      value: Number(stats.risk_distribution.low.pct.toFixed(1)),
    },
  ];

  const sleepData = Object.entries(stats.sleep_distribution || {}).map(
    ([key, value]) => ({
      name:
        key === "7-8 hours"
          ? "7–8 horas"
          : key === "Less than 5 hours"
          ? "Menos de 5 h"
          : "Más de 8 h",
      value: Number(value.pct.toFixed(1)),
    })
  );

  const rawDiet = stats.dietary_distribution || {};

  const dietData = [
    {
      name: "Poco saludables",
      value: Number((rawDiet["Unhealthy"]?.pct || 0).toFixed(1)),
    },
    {
      name: "Moderados",
      value: Number((rawDiet["Moderate"]?.pct || 0).toFixed(1)),
    },
    {
      name: "Saludables",
      value: Number((rawDiet["Others"]?.pct || 0).toFixed(1)),
    },
  ];

  const averages = stats.averages || {};
  const metrics = stats.metrics || {};

  const completionAvg = metrics.avg_completion_seconds;
  const completionP90 = metrics.p90_completion_seconds;
  const completionMedian = metrics.median_completion_seconds;

  const prettyFieldLabel = (field) => {
    const map = {
      age: "Edad",
      gender: "Género",
      academic_pressure: "Presión académica",
      cgpa: "CGPA / Promedio",
      study_hours: "Horas de estudio/trabajo",
      study_satisfaction: "Satisfacción con los estudios",
      financial_stress: "Estrés financiero",
      family_history: "Antecedentes familiares",
      suicidal_thoughts: "Pensamientos suicidas",
      sleep_duration: "Duración del sueño",
      dietary_habits: "Hábitos alimenticios",
      works: "¿Trabaja?",
      work_pressure: "Presión laboral",
    };
    return map[field] || field;
  };

  const fieldTimeData = metrics.field_times
    ? Object.entries(metrics.field_times)
        .map(([field, info]) => {
          const avg =
            typeof info?.avg_seconds === "number"
              ? info.avg_seconds
              : info?.mean_seconds;
          if (typeof avg !== "number") return null;
          return {
            name: prettyFieldLabel(field),
            value: Number(avg.toFixed(1)),
          };
        })
        .filter(Boolean)
    : [];

  const prettyDeviceName = (device) => {
    const map = {
      mobile: "Móvil",
      desktop: "Escritorio",
      tablet: "Tablet",
      unknown: "Otro",
    };
    return map[device] || device;
  };

  const deviceData = metrics.device_distribution
    ? Object.entries(metrics.device_distribution)
        .map(([key, value]) => {
          const pct = value?.pct;
          if (typeof pct !== "number") return null;
          return {
            name: prettyDeviceName(key),
            value: Number(pct.toFixed(1)),
          };
        })
        .filter(Boolean)
    : [];

  const abandonData =
    metrics.abandonment &&
    (metrics.abandonment.completed != null ||
      metrics.abandonment.abandoned != null)
      ? [
          {
            name: "Completados",
            value: metrics.abandonment.completed || 0,
          },
          {
            name: "Abandonos",
            value: metrics.abandonment.abandoned || 0,
          },
        ]
      : [];

  const viewportBuckets = metrics.viewport_distribution
    ? Object.entries(metrics.viewport_distribution)
        .map(([range, info]) => {
          const pct = info?.pct;
          if (typeof pct !== "number") return null;
          return {
            range,
            pct: Number(pct.toFixed(1)),
          };
        })
        .filter(Boolean)
    : [];

  const lastSent = metrics.last_submission_at;
  const firstSent = metrics.first_submission_at;

  const hasTimingMetrics =
    completionAvg || completionP90 || completionMedian || fieldTimeData.length;
  const hasDeviceMetrics = deviceData.length > 0;
  const hasAbandonment = abandonData.length > 0;

  return (
    <section className="max-w-5xl mx-auto space-y-6 pb-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">Estadísticas</h1>
        <p className="text-sm md:text-base text-slate-600">
          Resumen agregado de los cuestionarios almacenados en Redis. Aquí
          puedes ver cómo se distribuyen los niveles de riesgo, géneros,
          patrones de sueño, hábitos alimenticios y algunas métricas promedio,
          además de información de uso como tiempos de respuesta y tipo de
          dispositivo.
        </p>
      </header>

      {/* KPIs principales */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Cuestionarios totales</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {stats.total_registros}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Riesgo alto estimado</p>
          <p className="mt-1 text-xl font-semibold text-rose-600">
            {stats.risk_distribution.high.pct.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">
            Antecedentes familiares (Sí)
          </p>
          <p className="mt-1 text-xl font-semibold text-blue-600">
            {stats.family_history_yes_pct.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">
            Pensamientos suicidas (Sí)
          </p>
          <p className="mt-1 text-xl font-semibold text-amber-600">
            {stats.suicidal_thoughts_yes_pct.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* NUEVOS KPIs: tiempos & abandono */}
      {hasTimingMetrics && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">
              Tiempo promedio en contestar
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {completionAvg
                ? `${completionAvg.toFixed(1)} s`
                : "Sin datos aún"}
            </p>
            {completionAvg && (
              <p className="text-[11px] text-slate-500 mt-1">
                ≈ {(completionAvg / 60).toFixed(1)} min
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">
              Tiempo (percentil 90% más lento)
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {completionP90
                ? `${completionP90.toFixed(1)} s`
                : "Sin datos aún"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">
              Mediana de tiempo de respuesta
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {completionMedian
                ? `${completionMedian.toFixed(1)} s`
                : "Sin datos aún"}
            </p>
          </div>
        </div>
      )}

      {hasAbandonment && (
        <div className="rounded-3xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            Completados vs abandonos
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Relación entre cuestionarios enviados y sesiones que se quedaron sin
            enviar.
          </p>
          <div className="grid gap-4 md:grid-cols-3 mb-4 text-xs">
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
              <p className="text-slate-500 mb-1">Completados</p>
              <p className="text-lg font-semibold text-emerald-700">
                {metrics.abandonment.completed} (
                {metrics.abandonment.completed_pct?.toFixed(1) ?? "0.0"}
                %)
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
              <p className="text-slate-500 mb-1">Abandonos</p>
              <p className="text-lg font-semibold text-rose-700">
                {metrics.abandonment.abandoned} (
                {metrics.abandonment.abandoned_pct?.toFixed(1) ?? "0.0"}
                %)
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
              <p className="text-slate-500 mb-1">Rango de fechas</p>
              <p className="text-[11px] text-slate-700 leading-snug">
                {firstSent && (
                  <>
                    Desde: <span className="font-semibold">{firstSent}</span>
                    <br />
                  </>
                )}
                {lastSent && (
                  <>
                    Último envío:{" "}
                    <span className="font-semibold">{lastSent}</span>
                  </>
                )}
                {!firstSent && !lastSent && "Sin timestamps registrados aún."}
              </p>
            </div>
          </div>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={abandonData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {abandonData.map((entry, index) => (
                    <Cell
                      key={`cell-abandon-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Fila 1: Género + Riesgo */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            Distribución por género
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Porcentaje de participantes hombres, mujeres y otros.
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label={({ value }) => `${value.toFixed(1)}%`}
                >
                  {genderData.map((entry, index) => (
                    <Cell
                      key={`cell-gender-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value.toFixed(1)} %`}
                  labelStyle={{ fontSize: 12 }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            Distribución de riesgo estimado
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Porcentaje de cuestionarios clasificados como alto o bajo riesgo.
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  unit="%"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}`}
                />
                <Tooltip formatter={(value) => `${value.toFixed(1)} %`} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {riskData.map((entry, index) => (
                    <Cell
                      key={`cell-risk-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Fila 2: Sueño + Hábitos alimenticios */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            Patrón de sueño
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Distribución del tiempo de sueño reportado por los participantes.
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sleepData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis unit="%" tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip formatter={(value) => `${value.toFixed(1)} %`} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {sleepData.map((entry, index) => (
                    <Cell
                      key={`cell-sleep-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            Hábitos alimenticios
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Porcentaje de estudiantes con dieta moderada, saludable o poco
            saludable.
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dietData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={2}
                  label={({ value }) => `${value.toFixed(1)}%`}
                >
                  {dietData.map((entry, index) => (
                    <Cell
                      key={`cell-diet-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(1)} %`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Fila extra: Campos donde tardan más + Dispositivo */}
      {(fieldTimeData.length > 0 || deviceData.length > 0) && (
        <div className="grid gap-6 md:grid-cols-2">
          {fieldTimeData.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">
                Campos donde tardan más
              </h2>
              <p className="text-xs text-slate-500 mb-3">
                Tiempo promedio (en segundos) que las personas tardan en llenar
                cada sección del formulario.
              </p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fieldTimeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      label={{
                        value: "Segundos",
                        angle: -90,
                        position: "insideLeft",
                        fontSize: 11,
                      }}
                    />
                    <Tooltip formatter={(value) => `${value.toFixed(1)} s`} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {fieldTimeData.map((entry, index) => (
                        <Cell
                          key={`cell-field-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {deviceData.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">
                Dispositivo de acceso
              </h2>
              <p className="text-xs text-slate-500 mb-3">
                Porcentaje de sesiones que se conectan desde móvil, escritorio o
                tablet.
              </p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      label={({ value }) => `${value.toFixed(1)}%`}
                    >
                      {deviceData.map((entry, index) => (
                        <Cell
                          key={`cell-device-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `${value.toFixed(1)} %`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {viewportBuckets.length > 0 && (
                <div className="mt-4 text-[11px] text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-800">
                    Distribución por tamaño de pantalla
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {viewportBuckets.map((b) => (
                      <span
                        key={b.range}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1"
                      >
                        <span className="font-mono">{b.range}px</span>
                        <span className="text-slate-500">
                          {b.pct.toFixed(1)}%
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Fila 3: promedios */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900 mb-2">
          Métricas promedio de la muestra
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Valores medios calculados a partir de todos los cuestionarios
          respondidos.
        </p>

        <div className="grid gap-4 md:grid-cols-5 text-xs">
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
            <p className="text-slate-500 mb-1">Edad</p>
            <p className="text-lg font-semibold text-slate-900">
              {averages.age.toFixed(1)} años
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
            <p className="text-slate-500 mb-1">Presión académica</p>
            <p className="text-lg font-semibold text-slate-900">
              {averages.academic_pressure.toFixed(2)}/5
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
            <p className="text-slate-500 mb-1">Estrés financiero</p>
            <p className="text-lg font-semibold text-slate-900">
              {averages.financial_stress.toFixed(2)}/5
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
            <p className="text-slate-500 mb-1">Horas de estudio/trabajo</p>
            <p className="text-lg font-semibold text-slate-900">
              {averages.study_hours.toFixed(2)} h
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
            <p className="text-slate-500 mb-1">CGPA / Promedio</p>
            <p className="text-lg font-semibold text-slate-900">
              {averages.cgpa.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EstadisticasPage;
