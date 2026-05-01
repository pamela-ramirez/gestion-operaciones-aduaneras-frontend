/* import { Navigate, useLocation } from "react-router-dom";

//verifica consentimiento y cambio de password para proteger rutas
export default function ProtectedRoute({ children }) {
  const estado = localStorage.getItem("estado");
  const primerLogin = localStorage.getItem("primerLogin");
  const location = useLocation();

  const path = location.pathname;

  // Paso 1: consentimiento
  if (estado === "PENDIENTE") {
    if (path !== "/consentimiento") {
      return <Navigate to="/consentimiento" replace />;
    }
    return children;
  }

  // Paso 2: cambio de password
  if (primerLogin === "true") {
    if (path !== "/cambiar-password") {
      return <Navigate to="/cambiar-password" replace />;
    }
    return children;
  }

  // OK
  return children;
} */

  import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}