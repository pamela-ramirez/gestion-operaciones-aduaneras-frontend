import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Checkbox } from "primereact/checkbox";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { useNavigate } from "react-router-dom";
import {
  aceptarConsentimiento as aceptarConsentimientoService,
  cambiarPassword as cambiarPasswordService,
} from "../../services/authService";
import "./OnboardingGate.css";
import { obtenerUsuarioLogueado } from "../../services/userService";

export default function OnboardingGate() {
  const [visibleConsent, setVisibleConsent] = useState(false);
  const [visiblePassword, setVisiblePassword] = useState(false);

  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const user = await obtenerUsuarioLogueado();

        if (user.estado === "Pendiente") {
          setVisibleConsent(true);
        } else if (user.primerLogin === true) {
          setVisiblePassword(true);
        }
      } catch (err) {
        console.log("Error cargando usuario /logueado", err);
        navigate("/login");
      }
    };

    cargarUsuario();
  }, []);

  // ───── Consentimiento ─────
  const handleAceptarConsentimiento = async () => {
    if (!checked) {
      setError("Debes aceptar el consentimiento.");
      return;
    }

    setError("");

    try {
      await aceptarConsentimientoService();

      //localStorage.setItem("estado", "ACTIVO");

      setVisibleConsent(false);
      setVisiblePassword(true);
    } catch {
      setError("Error al guardar consentimiento.");
    }
  };

  const cancelarConsentimiento = () => {
    localStorage.clear();
    navigate("/login");
  };

  // ───── Cambio password ─────
  const handleCambiarPassword = async () => {
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      await cambiarPasswordService(password);

      //localStorage.setItem("primerLogin", "false");

      setVisiblePassword(false);
    } catch {
      setError("Error al cambiar contraseña.");
    }
  };

  return (
    <>
      {/* Consentimiento */}
      <Dialog
        header="Consentimiento de datos personales"
        visible={visibleConsent}
        closable={false}
        modal
        className="onboarding-dialog"
        maskClassName="onboarding-mask"
      >
        <p className="onboarding-title">Consentimiento</p>
        <p className="onboarding-subtitle">
          Debes aceptar los términos para continuar en el sistema.
        </p>

        <div className="onboarding-checkbox">
          <Checkbox checked={checked} onChange={(e) => setChecked(e.checked)} />
          <label>Acepto los términos y condiciones</label>
        </div>

        {error && (
          <div className="onboarding-error">
            <i className="pi pi-exclamation-triangle" />
            <span>{error}</span>
          </div>
        )}

        <div className="onboarding-actions">
          <Button
            label="Cancelar"
            onClick={cancelarConsentimiento}
            className="onboarding-btn-secondary"
          />
          <Button
            label="Aceptar"
            onClick={handleAceptarConsentimiento}
            className="onboarding-btn"
            disabled={!checked}
          />
        </div>
      </Dialog>

      {/* Cambio password */}
      <Dialog
        header="Cambiar contraseña"
        visible={visiblePassword}
        closable={false}
        modal
        className="onboarding-dialog"
        maskClassName="onboarding-mask"
      >
        <p className="onboarding-title">Seguridad</p>
        <p className="onboarding-subtitle">
          Debes definir una nueva contraseña para continuar.
        </p>

        <div className="onboarding-field">
          <label className="onboarding-label">NUEVA CONTRASEÑA</label>
          <Password
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            toggleMask
            className="onboarding-password"
          />
        </div>

        <div className="onboarding-field">
          <label className="onboarding-label">CONFIRMAR CONTRASEÑA</label>
          <Password
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            toggleMask
            feedback={false}
            className="onboarding-password"
          />
        </div>

        {error && (
          <div className="onboarding-error">
            <i className="pi pi-exclamation-triangle" />
            <span>{error}</span>
          </div>
        )}

        <div className="onboarding-actions">
          <Button
            label="Guardar"
            onClick={handleCambiarPassword}
            className="onboarding-btn"
            disabled={!password || password !== confirm}
          />
        </div>
      </Dialog>
    </>
  );
}
