import { Navigate, useLocation } from "react-router-dom";

//verifica token y roles para proteger rutas
export default function PrivateRoute({ children, roles = [] }) {
  const token = localStorage.getItem("token");
  const userRole = (localStorage.getItem("userRole") || "").toLowerCase();
  //const location = useLocation();

  // No autenticado
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // No tiene permisos
  if (roles.length > 0 && !roles.includes(userRole)) {
    // Redirigir según rol
    if (userRole === "cliente") {
      return <Navigate to="/cliente" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  // OK
  return children;
}