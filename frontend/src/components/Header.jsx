import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo-ml-chip.svg";

function Header({ isAuthenticated, username, onLogout }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const navigate = useNavigate();

  const getNavClasses = (isActive) =>
    [
      "md:text-lg font-semibold transition-colors",
      isActive ? "text-blue-600" : "text-slate-700 hover:text-blue-600",
    ].join(" ");

  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm">
      {/* Fila superior: Logo y Usuario */}
      <div className="border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          {/* Logo compacto */}
          <Link to="/" className="flex items-center gap-2" onClick={cerrarMenu}>
            <img
              src={logo}
              alt="Modelo de Depresión - IA"
              className="h-7 w-7 md:h-8 md:w-8"
            />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-sm md:text-base text-slate-900">
                Modelo de Depresión
              </span>
              <span className="text-[0.65rem] text-slate-500 uppercase tracking-wider">
                ML · IA
              </span>
            </div>
          </Link>

          {/* Usuario / Login (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && username ? (
              <div className="relative">
                <button
                  onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white text-xs font-bold">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{username}</span>
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {menuUsuarioAbierto && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                    <button
                      onClick={() => {
                        setMenuUsuarioAbierto(false);
                        navigate("/perfil");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Mi Perfil
                    </button>
                    <hr className="my-1 border-slate-200" />
                    <button
                      onClick={() => {
                        setMenuUsuarioAbierto(false);
                        onLogout();
                        navigate("/");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <NavLink
                  to="/login-usuario"
                  className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
                >
                  Iniciar sesión
                </NavLink>
                <NavLink
                  to="/register"
                  className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Registrarse
                </NavLink>
              </>
            )}
          </div>

          {/* Botón hamburguesa (solo móvil) */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100 transition-colors"
            onClick={() => setMenuAbierto((prev) => !prev)}
            aria-label="Abrir menú de navegación"
          >
            {menuAbierto ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg className="h-6 w-6" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Fila inferior: Navegación con scroll horizontal */}
      <div className="hidden md:block bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) => 
                `px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isActive 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-slate-700 hover:bg-white hover:text-blue-600"
                }`
              }
            >
              Menú
            </NavLink>
            <NavLink
              to="/prediccion"
              className={({ isActive }) => 
                `px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isActive 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-slate-700 hover:bg-white hover:text-blue-600"
                }`
              }
            >
              Predicción
            </NavLink>
            <NavLink
              to="/estadisticas"
              className={({ isActive }) => 
                `px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isActive 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-slate-700 hover:bg-white hover:text-blue-600"
                }`
              }
            >
              Estadísticas
            </NavLink>
            <NavLink
              to="/equipo"
              className={({ isActive }) => 
                `px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isActive 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-slate-700 hover:bg-white hover:text-blue-600"
                }`
              }
            >
              Equipo
            </NavLink>
            <NavLink
              to="/foro"
              className={({ isActive }) => 
                `px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isActive 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-slate-700 hover:bg-white hover:text-blue-600"
                }`
              }
            >
              Foro
            </NavLink>
            <NavLink
              to="/buzon-mejoras"
              className={({ isActive }) => 
                `px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isActive 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-slate-700 hover:bg-white hover:text-blue-600"
                }`
              }
            >
              Buzón de mejoras
            </NavLink>
          </nav>
        </div>
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
              {isAuthenticated && username ? (
                <>
                  <div className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white text-lg font-bold">
                        {username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-lg font-medium text-slate-700">{username}</span>
                    </div>
                  </div>
                  <NavLink
                    to="/perfil"
                    className="block text-center px-4 py-2 text-lg font-medium text-slate-700 hover:text-blue-600 transition-colors"
                    onClick={cerrarMenu}
                  >
                    Mi Perfil
                  </NavLink>
                  <button
                    onClick={() => {
                      cerrarMenu();
                      onLogout();
                      navigate("/");
                    }}
                    className="w-full text-center px-4 py-2 text-lg font-medium text-red-600 hover:text-red-700 transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login-usuario"
                    className="block text-center px-4 py-2 text-lg font-medium text-slate-700 hover:text-blue-600 transition-colors"
                    onClick={cerrarMenu}
                  >
                    Iniciar sesión
                  </NavLink>
                  <li>
                    <NavLink
                      to="/register"
                      className="block text-center px-4 py-2 text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors mx-4"
                      onClick={cerrarMenu}
                    >
                      Registrarse
                    </NavLink>
                  </li>
                </>
              )}
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

export default Header;