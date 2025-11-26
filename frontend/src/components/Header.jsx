import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo-ml-chip.svg";

function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const getNavClasses = (isActive) =>
    [
      "md:text-lg font-semibold transition-colors",
      isActive ? "text-blue-600" : "text-slate-700 hover:text-blue-600",
    ].join(" ");

  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur shadow-md md:shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between md:justify-evenly">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3" onClick={cerrarMenu}>
          <div className="flex items-center justify-center">
            <img
              src={logo}
              alt="Modelo de Depresión - IA"
              className="h-8 w-8 md:h-10 md:w-10 lg:h-11 lg:w-11"
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold md:text-lg text-base tracking-tight">
              Modelo de Depresión
            </span>
            <span className="md:text-[0.8rem] text-[0.7rem] text-slate-500 uppercase tracking-[0.2em]">
              Machine Learning · IA
            </span>
          </div>
        </Link>

        {/* Navegación desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink
            to="/"
            end
            className={({ isActive }) => getNavClasses(isActive)}
          >
            Menú
          </NavLink>
          <NavLink
            to="/prediccion"
            className={({ isActive }) => getNavClasses(isActive)}
          >
            Predicción
          </NavLink>
          <NavLink
            to="/estadisticas"
            className={({ isActive }) => getNavClasses(isActive)}
          >
            Estadísticas
          </NavLink>
          <NavLink
            to="/equipo"
            className={({ isActive }) => getNavClasses(isActive)}
          >
            Equipo
          </NavLink>
          <NavLink
            to="/foro"
            className={({ isActive }) => getNavClasses(isActive)}
          >
            Foro
          </NavLink>
          <NavLink
	  to="/buzon-mejoras"
	  className={({ isActive }) => getNavClasses(isActive)}
	>
	  Buzón de mejoras
	</NavLink>
        </nav>

        {/* Botones de login */}
        <div className="hidden md:flex items-center gap-3">
          <NavLink
            to="/login"
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
          >
            Iniciar sesión
          </NavLink>
          <NavLink
            to="/register"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Registrarse
          </NavLink>
        </div>

        {/* Botón hamburguesa (solo móvil) */}
        <button
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          onClick={() => setMenuAbierto((prev) => !prev)}
          aria-label="Abrir menú de navegación"
        >
          {menuAbierto ? (
            // Icono "X"
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            // Icono hamburguesa
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Menú desplegable móvil */}
      {menuAbierto && (
        <nav className="md:hidden border-t border-slate-200 bg-white shadow-sm">
          <ul className="flex flex-col py-2 text-sm">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  getNavClasses(isActive) +
                  " block text-center px-4 py-2 text-xl"
                }
                onClick={cerrarMenu}
              >
                Menú
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/prediccion"
                className={({ isActive }) =>
                  getNavClasses(isActive) +
                  " block text-center px-4 py-2 text-xl"
                }
                onClick={cerrarMenu}
              >
                Predicción
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/estadisticas"
                className={({ isActive }) =>
                  getNavClasses(isActive) +
                  " block text-center px-4 py-2 text-xl"
                }
                onClick={cerrarMenu}
              >
                Estadísticas
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/equipo"
                className={({ isActive }) =>
                  getNavClasses(isActive) +
                  " block text-center px-4 py-2 text-xl"
                }
                onClick={cerrarMenu}
              >
                Equipo
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/foro"
                className={({ isActive }) =>
                  getNavClasses(isActive) +
                  " block text-center px-4 py-2 text-xl"
                }
                onClick={cerrarMenu}
              >
                Foro
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/buzon-mejoras"
                className={({ isActive }) =>
                  getNavClasses(isActive) +
                  " block text-center px-4 py-2 text-xl"
                }
                onClick={cerrarMenu}
              >
                Buzón de mejoras
              </NavLink>
            </li>
            <li className="border-t border-slate-200 mt-2 pt-2">
              <NavLink
                to="/login"
                className="block text-center px-4 py-2 text-lg font-medium text-slate-700 hover:text-blue-600 transition-colors"
                onClick={cerrarMenu}
              >
                Iniciar sesión
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/register"
                className="block text-center px-4 py-2 text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors mx-4"
                onClick={cerrarMenu}
              >
                Registrarse
              </NavLink>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

export default Header;
