import { Navigate } from "react-router-dom";

/**
 * PrivateRoute
 * ─────────────────────────────────────────────────────────────
 * Props:
 *   children  – componente a proteger
 *   roles     – array de roles permitidos (opcional)
 *               Si no se pasa, cualquier usuario autenticado puede acceder.
 *
 * Ejemplos de uso en App.jsx:
 *   <PrivateRoute>                          → cualquier usuario logueado
 *   <PrivateRoute roles={["admin"]}>        → solo admin
 *   <PrivateRoute roles={["admin","despachante"]}> → admin y despachante
 *   <PrivateRoute roles={["cliente"]}>      → solo cliente
 */
export default function PrivateRoute({ children, roles }) {
  const token    = localStorage.getItem("token");
  const userRole = (localStorage.getItem("userRole") || "").toLowerCase();

  // Sin sesión → login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Si se especifican roles y el usuario no tiene el rol requerido
  if (roles && roles.length > 0 && !roles.includes(userRole)) {
    // Redirigir al home apropiado según su rol
    if (userRole === "cliente") return <Navigate to="/cliente" replace />;
    return <Navigate to="/home" replace />;
  }

  return children;
}
