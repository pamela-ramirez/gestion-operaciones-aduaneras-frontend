import { useEffect, useState } from "react";
import ClientSidebar from "./ClientSidebar";
import Topbar       from "./Topbar";
import FirstLoginModal from "../components/auth/FirstLoginModal";
import "./layout.css";

/**
 * ClientMainLayout
 * Envuelve todas las páginas del cliente.
 * Muestra el modal de onboarding si:
 *   – perfilCompleto === "false"   (aún no completó datos)
 *   – primerLogin    === "true"    (nunca cambió contraseña temporal)
 *
 * Una vez que onFinish() es llamado el modal se cierra y no vuelve
 * a aparecer (localStorage queda con primerLogin=false + perfilCompleto=true).
 */
export default function ClientMainLayout({ children }) {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const perfilCompleto = localStorage.getItem("perfilCompleto") === "true";
    const primerLogin    = localStorage.getItem("primerLogin")    === "true";

    // Mostrar modal si cualquiera de las dos condiciones aplica
    if (!perfilCompleto || primerLogin) {
      setShowOnboarding(true);
    }
  }, []);

  return (
    <div className="layout-container">
      <ClientSidebar />

      <div className="layout-main">
        <Topbar />
        <div className="layout-content">
          {children}
        </div>
      </div>

      <FirstLoginModal
        visible={showOnboarding}
        rol="cliente"
        onFinish={() => setShowOnboarding(false)}
      />
    </div>
  );
}
