import { Navigate, useLocation } from "react-router-dom";

//verifica token y roles para proteger rutas
export default function PrivateRoute({ children, roles = [] }) {
  const token = localStorage.getItem("token");
  const rol = (localStorage.getItem("rol") || "").toLowerCase();
  //const location = useLocation();

  // No autenticado
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // No tiene permisos
  if (roles.length > 0 && !roles.includes(rol)) {
    // Redirigir según rol
    if (rol === "cliente") {
      return <Navigate to="/cliente" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  // OK
  return children;
}