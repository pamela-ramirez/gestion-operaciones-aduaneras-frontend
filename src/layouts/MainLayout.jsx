import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar  from "./Topbar";
import FirstLoginModal from "../components/auth/FirstLoginModal";
import "./layout.css";

/**
 * MainLayout
 * Usado por Admin y Despachante.
 * El admin nunca necesita onboarding (primerLogin siempre false desde el backend).
 * El despachante sí puede requerirlo, igual que el cliente.
 */
export default function MainLayout({ children }) {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const userRole       = localStorage.getItem("userRole") || "admin";
    const perfilCompleto = localStorage.getItem("perfilCompleto") === "true";
    const primerLogin    = localStorage.getItem("primerLogin")    === "true";

    // Solo despachante necesita onboarding
    if (userRole === "despachante" && (!perfilCompleto || primerLogin)) {
      setShowOnboarding(true);
    }
  }, []);

  return (
    <div className="layout-container">
      <Sidebar />

      <div className="layout-main">
        <Topbar />
        <div className="layout-content">
          {children}
        </div>
      </div>

      <FirstLoginModal
        visible={showOnboarding}
        rol="despachante"
        onFinish={() => setShowOnboarding(false)}
      />
    </div>
  );
}
