import { useState } from "react";
import SugerenciasPage from "./Sugerencias";
import FrasesDiaPage from "./FrasesDiaPage";

export default function AdminPanelPage() {
  const [tab, setTab] = useState("sugerencias");

  return (
    <section className="max-w-5xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">
          Panel de administrador
        </h1>
        <p className="text-sm text-slate-600">
          Desde aquí puedes revisar las sugerencias enviadas y gestionar las
          frases del día. Solo los administradores autorizados tienen acceso a
          este panel.
        </p>
      </header>

      {/* Botones de navegación internos */}
      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 gap-1">
        <button
          onClick={() => setTab("sugerencias")}
          className={`px-3 py-1.5 text-sm rounded-md transition ${
            tab === "sugerencias"
              ? "bg-white shadow-sm text-sky-700 font-medium"
              : "text-slate-600 hover:bg-white"
          }`}
        >
          Sugerencias
        </button>
        <button
          onClick={() => setTab("frases")}
          className={`px-3 py-1.5 text-sm rounded-md transition ${
            tab === "frases"
              ? "bg-white shadow-sm text-sky-700 font-medium"
              : "text-slate-600 hover:bg-white"
          }`}
        >
          Frases del día
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 pb-10">
        {tab === "sugerencias" ? <SugerenciasPage /> : <FrasesDiaPage />}
      </div>
    </section>
  );
}
