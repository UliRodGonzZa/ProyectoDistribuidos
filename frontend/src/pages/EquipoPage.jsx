function EquipoPage() {
  // Íconos disponibles para todas las tarjetas
  const iconos = [
    {
      id: "linkedin",
      title: "LinkedIn",
      color: "hover:text-[#0A66C2]",
      svg: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.32 8.07h4.36V24H.32zM8.64 8.07H13v2.16h.06c.61-1.16 2.1-2.38 4.32-2.38 4.62 0 5.47 3.04 5.47 6.99V24h-4.36v-7.5c0-1.79-.03-4.09-2.5-4.09-2.5 0-2.89 1.95-2.89 3.96V24H8.64z" />
        </svg>
      ),
    },
    {
      id: "github",
      title: "GitHub",
      color: "hover:text-slate-900",
      svg: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.31 6.84 9.66.5.1.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.86.09-.67.35-1.12.63-1.38-2.22-.26-4.55-1.15-4.55-5.13 0-1.13.39-2.06 1.03-2.79-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.06A9.3 9.3 0 0 1 12 6.8c.85 0 1.71.12 2.51.35 1.9-1.34 2.74-1.06 2.74-1.06.55 1.41.2 2.46.1 2.72.64.73 1.02 1.66 1.02 2.79 0 4-.34 4.86-4.58 5.11.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.03 10.03 0 0 0 22 12.26C22 6.58 17.52 2 12 2z" />
        </svg>
      ),
    },
    {
      id: "whatsapp",
      title: "WhatsApp",
      color: "hover:text-green-600",
      svg: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a10 10 0 0 0-8.94 14.5L2 22l5.66-1.97A10 10 0 1 0 12 2zm-3 5.5c.2-.5.44-.5.62-.5h.53c.17 0 .4 0 .62.46.24.48.8 1.57.87 1.68.07.1.12.23.02.38-.1.15-.15.24-.3.4-.15.17-.31.37-.44.5-.15.15-.3.3-.13.59.17.3.77 1.27 1.65 2.06.88.79 1.62 1.04 1.92 1.17.3.13.47.11.64-.08.17-.2.73-.85.92-1.14.18-.29.36-.24.6-.14.25.1 1.57.74 1.84.87.27.13.44.2.5.3.06.1.06.6-.14 1.18-.2.58-1.16 1.1-1.63 1.17-.42.07-.97.1-1.57-.1-.6-.2-1.33-.45-2.28-1.08a12.2 12.2 0 0 1-4.03-4c-.52-.9-.7-1.52-.76-1.77-.06-.25-.06-.47-.03-.65.03-.17.14-.53.3-.83z" />
        </svg>
      ),
    },
    {
      id: "correo",
      title: "Correo",
      color: "hover:text-slate-800",
      svg: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2v.01L12 13l8-6.99V6H4zm16 2.25-8 7-8-7V18h16V8.25z" />
        </svg>
      ),
    },
    {
      id: "telefono",
      title: "Teléfono",
      color: "hover:text-slate-700",
      svg: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1-.24 11.36 11.36 0 0 0 3.56.57 1 1 0 0 1 1 1v3.58a1 1 0 0 1-1 1A17 17 0 0 1 3 5a1 1 0 0 1 1-1h3.6a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.56 1 1 0 0 1-.24 1l-2.3 2.23z" />
        </svg>
      ),
    },
    {
      id: "x",
      title: "X",
      color: "hover:text-black",
      svg: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 2h3l-8 9 9 11h-7l-5-6-5 6H2l9-11-8-9h7l4 5 4-5z" />
        </svg>
      ),
    },
    {
      id: "instagram",
      title: "Instagram",
      color: "hover:text-pink-600",
      svg: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm10 2c1.66 0 3 1.34 3 3v10c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V7c0-1.66 1.34-3 3-3h10zm-5 3.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5zm0 2A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5zm4.75-3.75a1 1 0 1 0 1 1 1 1 0 0 0-1-1z" />
        </svg>
      ),
    },
  ];

  // Personas del equipo
  const personas = [
    {
      nombre: "Becerril Vélez Liliana Marlene",
      rol: "Contenedor backend · Frontend",
      descripcion:
        "Colaboró en la configuración del contenedor del backend, verificando su correcta ejecución dentro del entorno Docker. Apoyó también en la integración con el frontend y en las pruebas funcionales necesarias para el flujo completo del proyecto.",
      avatar: "/avatars/avatar.webp",
      redes: {
        linkedin: null,
        github: null,
        whatsapp: null,
        correo: null,
        telefono: null,
        x: null,
        instagram: null,
      },
    },
    {
      nombre: "Figueroa Solano Carlos Enrique",
      rol: "Contenedor backend · Automatización",
      descripcion:
        "Participó en la estructuración del contenedor del backend, optimizando su funcionamiento y comunicación interna. Colaboró en procesos de despliegue y en la verificación del entorno Docker para garantizar estabilidad en la ejecución del modelo.",
      avatar: "/avatars/avatar.webp",
      redes: {
        linkedin: null,
        github: null,
        whatsapp: null,
        correo: null,
        telefono: null,
        x: null,
        instagram: null,
      },
    },
    {
      nombre: "González Zavala Ulises Rodrigo",
      rol: "Contenedor base de datos · Infraestructura",
      descripcion:
        "Encargado de la construcción del contenedor de la base de datos y de su comunicación con el backend. Definió las estructuras necesarias para el almacenamiento y colaboró en las pruebas de conexión y estabilidad general dentro del entorno Docker.",
      avatar: "/avatars/avatar.webp",
      redes: {
        linkedin: null,
        github: null,
        whatsapp: null,
        correo: null,
        telefono: null,
        x: null,
        instagram: null,
      },
    },
    {
      nombre: "Quintana López Ernesto",
      rol: "Contenedor base de datos · Infraestructura",
      descripcion:
        "Apoyó en la integración y configuración del contenedor de base de datos, asegurando su correcto funcionamiento dentro del sistema. Trabajó en la validación de la persistencia en Redis y en las conexiones internas entre cada parte del proyecto.",
      avatar: "/avatars/avatar.webp",
      redes: {
        linkedin: null,
        github: null,
        whatsapp: null,
        correo: null,
        telefono: null,
        x: null,
        instagram: null,
      },
    },
    {
      nombre: "López Campillo Francisco Daniel",
      rol: "Frontend · Integración visual",
      descripcion:
        "Colaboró en el desarrollo del frontend, trabajando en estructura, diseño y pruebas de componentes. Aseguró que la interfaz funcionara de forma consistente y contribuyó en la integración visual final dentro del flujo completo de la aplicación.",
      avatar: "/avatars/avatar.webp",
      redes: {
        linkedin: null,
        github: null,
        whatsapp: null,
        correo: null,
        telefono: null,
        x: null,
        instagram: null,
      },
    },
    {
      nombre: "Vigi Garduño Marco Alejandro",
      rol: "Frontend · Diseño y arquitectura",
      descripcion:
        "Lideró el diseño visual, la arquitectura del frontend y la implementación completa en React. Construyó la interfaz, definió la experiencia de usuario y coordinó la integración final con backend y base de datos para un sistema totalmente funcional.",
      avatar: "/avatars/avatar-6.webp",
      redes: {
        linkedin: "https://www.linkedin.com/in/alejandro-vigi/",
        github: "https://github.com/Alejandro-Vigi",
        whatsapp: "https://wa.me/525518602484",
        correo: "mailto:alejandro.vigi28@gmail.com",
        telefono: "tel:+525518602484",
        x: "https://x.com/Alejandro_Vigi",
        instagram: "https://instagram.com/Alejandro_Vigi",
      },
    },
  ];



  return (
    <section className="max-w-5xl mx-auto space-y-4 md:pt-4 md:pb-4">
      <h1 className="text-2xl font-bold text-slate-900">Equipo</h1>

      <p className="text-sm md:text-base text-slate-600">
        Este proyecto fue desarrollado por un equipo multidisciplinario
        especializado en ciencia de datos, visualización de información y
        desarrollo web, integrando técnicas de Machine Learning para el análisis
        del riesgo de depresión en estudiantes.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
        {personas.map((p) => (
          <div
            key={p.nombre}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md flex flex-col justify-between min-h-[220px]"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-full bg-slate-100 overflow-hidden">
                  <img
                    src={p.avatar}
                    alt={`Foto de ${p.nombre}`}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    {p.nombre}
                  </h2>
                  <p className="text-xs text-blue-600">{p.rol}</p>
                </div>
              </div>

              <p className="text-xs md:text-sm text-slate-600 text-justify">
                {p.descripcion}
              </p>
            </div>

            {/* ICONOS */}
            <div className="mt-3 flex flex-wrap gap-2">
              {iconos
                .filter((icono) => p.redes[icono.id])
                .map((icono) => (
                  <a
                    key={icono.id + p.nombre}
                    href={p.redes[icono.id] || "#"}
                    title={icono.title}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`h-7 w-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 ${icono.color} hover:bg-slate-100 transition`}
                  >
                    {icono.svg}
                  </a>
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default EquipoPage;
