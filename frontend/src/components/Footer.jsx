import { Link } from "react-router-dom";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 pt-4 pb-3 flex flex-col md:flex-row md:justify-between md:items-center gap-6 text-sm text-slate-600">
        {/* Logo y descripción */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-md mx-auto md:mx-0">
          <h2 className="font-bold text-slate-900 text-lg">
            ML · Depresión Estudiantil
          </h2>
          <p className="mt-2 text-justify">
            Herramienta desarrollada con modelos de <span className="font-semibold">machine learning </span> 
            para estimar el riesgo de depresión en estudiantes, a partir de
            factores académicos, personales y de contexto. No sustituye una
            valoración profesional en salud mental.
          </p>
        </div>

        {/* Conecta con el equipo */}
        <div className="flex flex-col items-center text-center mx-auto md:mx-0">
          <h3 className="font-semibold text-slate-900 mb-2 text-center">
            Conecta con el equipo
          </h3>

          <div className="flex gap-5 items-center">
            {/* Todos llevan a /equipo para ver detalles reales */}
            {/* LINKEDIN */}
            <Link
              to="/equipo"
              className="hover:text-[#0A66C2] transition flex items-center"
              aria-label="LinkedIn"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.32 8.07h4.36V24H.32zM8.64 8.07H13v2.16h.06c.61-1.16 2.1-2.38 4.32-2.38 4.62 0 5.47 3.04 5.47 6.99V24h-4.36v-7.5c0-1.79-.03-4.09-2.5-4.09-2.5 0-2.89 1.95-2.89 3.96V24H8.64z" />
              </svg>
            </Link>

            {/* GITHUB */}
            <Link
              to="/equipo"
              className="hover:text-slate-900 transition flex items-center"
              aria-label="GitHub"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.31 6.84 9.66.5.1.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.86.09-.67.35-1.12.63-1.38-2.22-.26-4.55-1.15-4.55-5.13 0-1.13.39-2.06 1.03-2.79-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.06A9.3 9.3 0 0 1 12 6.8c.85 0 1.71.12 2.51.35 1.9-1.34 2.74-1.06 2.74-1.06.55 1.41.2 2.46.1 2.72.64.73 1.02 1.66 1.02 2.79 0 4-.34 4.86-4.58 5.11.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.03 10.03 0 0 0 22 12.26C22 6.58 17.52 2 12 2z" />
              </svg>
            </Link>

            {/* WHATSAPP */}
            <Link
              to="/equipo"
              className="hover:text-green-600 transition flex items-center"
              aria-label="WhatsApp"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-8.94 14.5L2 22l5.66-1.97A10 10 0 1 0 12 2zm-3 5.5c.2-.5.44-.5.62-.5h.53c.17 0 .4 0 .62.46.24.48.8 1.57.87 1.68.07.1.12.23.02.38-.1.15-.15.24-.3.4-.15.17-.31.37-.44.5-.15.15-.3.3-.13.59.17.3.77 1.27 1.65 2.06.88.79 1.62 1.04 1.92 1.17.3.13.47.11.64-.08.17-.2.73-.85.92-1.14.18-.29.36-.24.6-.14.25.1 1.57.74 1.84.87.27.13.44.2.5.3.06.1.06.6-.14 1.18-.2.58-1.16 1.1-1.63 1.17-.42.07-.97.1-1.57-.1-.6-.2-1.33-.45-2.28-1.08a12.2 12.2 0 0 1-4.03-4c-.52-.9-.7-1.52-.76-1.77-.06-.25-.06-.47-.03-.65.03-.17.14-.53.3-.83z" />
              </svg>
            </Link>

            {/* CORREO */}
            <Link
              to="/equipo"
              className="hover:text-slate-800 transition flex items-center"
              aria-label="Correo"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2v.01L12 13l8-6.99V6H4zm16 2.25-8 7-8-7V18h16V8.25z" />
              </svg>
            </Link>

            {/* TELÉFONO */}
            <Link
              to="/equipo"
              className="hover:text-slate-700 transition flex items-center"
              aria-label="Teléfono"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1-.24 11.36 11.36 0 0 0 3.56.57 1 1 0 0 1 1 1v3.58a1 1 0 0 1-1 1A17 17 0 0 1 3 5a1 1 0 0 1 1-1h3.6a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.56 1 1 0 0 1-.24 1l-2.3 2.23z" />
              </svg>
            </Link>

            {/* X (Twitter) */}
            <Link
              to="/equipo"
              className="hover:text-black transition flex items-center"
              aria-label="X"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h3l-8 9 9 11h-7l-5-6-5 6H2l9-11-8-9h7l4 5 4-5z" />
              </svg>
            </Link>

            {/* Instagram */}
            <Link
              to="/equipo"
              className="hover:text-pink-600 transition flex items-center"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm10 2c1.66 0 3 1.34 3 3v10c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V7c0-1.66 1.34-3 3-3h10zm-5 3.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5zm0 2A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5zm4.75-3.75a1 1 0 1 0 1 1 1 1 0 0 0-1-1z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <p className="text-center text-xs text-slate-500 py-2 mb-10 md:mb-4 flex items-center justify-center gap-3">
        <span>
          © {currentYear} ML · Depresión Estudiantil · Todos los derechos
          reservados.
        </span>
        <Link
          to="/login"
          className="underline underline-offset-2 text-slate-600 hover:text-slate-900"
        >
          Admin
        </Link>
      </p>
    </footer>
  );
}

export default Footer;
