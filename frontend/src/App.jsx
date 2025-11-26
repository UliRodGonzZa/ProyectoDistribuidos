import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MenuPage from "./pages/MenuPage";
import PrediccionPage from "./pages/PrediccionPage";
import EstadisticasPage from "./pages/EstadisticasPage";
import EquipoPage from "./pages/EquipoPage";
import ForoPage from "./pages/ForoPage";
import BuzonMejorasPage from "./pages/BuzonMejoras";
import SugerenciasPage from "./pages/Sugerencias";
import FrasesDiaPage from "./pages/FrasesDiaPage";
import LoginPage from "./pages/LoginPage"; // Login de admin
import LoginPageU from "./pages/LoginPageU"; // Login de usuario
import SignupPage from "./pages/SignupPage"; // Registro de usuario
import AdminPanelPage from "./pages/AdminPanelPage";

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/LoginPageU" replace />;
  }
  return children;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 px-4 py-6 md:py-10">
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/prediccion" element={<PrediccionPage />} />
          <Route path="/estadisticas" element={<EstadisticasPage />} />
          <Route path="/equipo" element={<EquipoPage />} />
          <Route path="/foro" element={<ForoPage />} />
          <Route path="/buzon-mejoras" element={<BuzonMejorasPage />} />
          {/* Login de admin */}
          <Route path="/login" element={<LoginPage />} />
          {/* Login de usuario */}
          <Route path="/login-usuario" element={<LoginPageU onLogin={handleLogin} />} />
          {/* Registro de usuario */}
          <Route
            path="/register"
            element={<SignupPage onLogin={handleLogin} />}
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <AdminPanelPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sugerencias"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <SugerenciasPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/frases-dia"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <FrasesDiaPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
