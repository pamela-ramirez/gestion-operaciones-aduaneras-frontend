import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Checkbox } from "primereact/checkbox";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

import {
  aceptarConsentimiento as aceptarConsentimientoService,
  cambiarPassword as cambiarPasswordService,
} from "../../services/authService";

import { obtenerUsuarioLogueado } from "../../services/userService";
import "./OnboardingGate.css";
import { guardarUsuarioLogueado } from "../../utils/auth";

export default function OnboardingGate() {
  const [user, setUser] = useState(null);

  const [visibleConsent, setVisibleConsent] = useState(false);
  const [visiblePassword, setVisiblePassword] = useState(false);

  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // ─────────────────────────────
  // CARGA USUARIO + DECISIÓN FLUJO
  // ─────────────────────────────
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const data = await obtenerUsuarioLogueado();
        console.log("DEBUG USER =>", data);
        if (!data) {
          navigate("/login");
          return;
        }

        const usuarioLogueado = {
          token: data.token,
          id: data.id,
          email: data.email,
          //username: data.username,
          rol: (data.rol || data.role || "").toLowerCase(),
          primerLogin: data.primerLogin,
          estado: data.estado,
        };
        guardarUsuarioLogueado(usuarioLogueado);

        setUser(data);
        const estado = (data?.estado ?? "").toLowerCase();

        // 1. Consentimiento primero (máxima prioridad)
        if (estado === "pendiente") {
          setVisibleConsent(true);
          setVisiblePassword(false);
          return;
        }

        // 2. Luego primer login
        if (data?.primerLogin) {
          setVisiblePassword(true);
          return;
        }

        // 3. Si ya pasó onboarding → ir a su portal
        redirigirPorRol(data.rol);
      } catch (err) {
        console.log("Error cargando usuario logueado", err);
        localStorage.clear();
        navigate("/login");
      }
    };

    cargarUsuario();
  }, []);

  const redirigirPorRol = (rol) => {
    const role = (rol || "").toLowerCase();

    switch (role) {
      case "cliente":
        navigate("/cliente", { replace: true });
        break;

      case "despachante":
        navigate("/home", { replace: true });
        break;

      case "admin":
        navigate("/home", { replace: true });
        break;

      default:
        navigate("/home", { replace: true });
    }
  };

  // ─────────────────────────────
  // CONSENTIMIENTO
  // ─────────────────────────────
  const handleAceptarConsentimiento = async () => {
    if (!checked) {
      setError("Debes aceptar el consentimiento.");
      return;
    }

    setError("");

    try {
      await aceptarConsentimientoService();

      // volver a consultar estado real del backend
      const updatedUser = await obtenerUsuarioLogueado();
      setUser(updatedUser);

      setVisibleConsent(false);

      if (updatedUser.primerLogin === true) {
        setVisiblePassword(true);
      } else {
        redirigirPorRol(updatedUser.rol);
      }
    } catch {
      setError("Error al guardar consentimiento.");
    }
  };

  const cancelarConsentimiento = () => {
    localStorage.clear();
    navigate("/login");
  };

  // ─────────────────────────────
  // CAMBIO DE PASSWORD
  // ─────────────────────────────
  const handleCambiarPassword = async () => {
    if (!password || password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      await cambiarPasswordService(password);

      setVisiblePassword(false);

      // volver a validar usuario actualizado
      const updatedUser = await obtenerUsuarioLogueado();

      setUser(updatedUser);

      redirigirPorRol(updatedUser.rol);
    } catch {
      setError("Error al cambiar contraseña.");
    }
  };

  // ─────────────────────────────
  // UI
  // ─────────────────────────────
  return (
    <>
      {/* ───── CONSENTIMIENTO ───── */}
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

      {/* ───── PASSWORD ───── */}
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
