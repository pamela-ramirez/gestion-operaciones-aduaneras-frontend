import { useEffect, useState } from "react";
import FirstLoginModal from "../components/auth/FirstLoginModal";

export default function ClientMainLayout({ children }) {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const perfil = localStorage.getItem("perfilCompleto") === "true";
    const primerLogin = localStorage.getItem("primerLogin") === "true";

    if (!perfil || primerLogin) {
      setShowOnboarding(true);
    }
  }, []);

  return (
    <>
      {children}

      <FirstLoginModal
        visible={showOnboarding}
        onFinish={() => setShowOnboarding(false)}
      />
    </>
  );
}