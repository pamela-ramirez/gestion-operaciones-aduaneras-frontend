import { Dialog }    from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password }  from "primereact/password";
import { Button }    from "primereact/button";
import { useState }  from "react";
import { completarPerfil }           from "../../services/clientService";
import { completarPerfilDespachante } from "../../services/despachanteService";
import { cambiarPassword }            from "../../services/authService";
import "./FirstLoginModal.css";

/**
 * FirstLoginModal
 * ─────────────────────────────────────────────────────────────
 * Props:
 *   visible  (bool)   – controla visibilidad del dialog
 *   onFinish (fn)     – callback cuando el usuario termina ambos pasos
 *   rol      (string) – "cliente" | "despachante"
 */
export default function FirstLoginModal({ visible, onFinish, rol = "cliente" }) {
  const [step,       setStep]       = useState(1);
  const [nombre,     setNombre]     = useState("");
  const [telefono,   setTelefono]   = useState("");
  const [newPass,    setNewPass]    = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");

  // ── PASO 1 – Completar perfil ─────────────────────────────────────────────
  const handlePerfil = async () => {
    if (!nombre.trim() || !telefono.trim()) {
      setError("Por favor completa todos los campos.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      if (rol === "despachante") {
        await completarPerfilDespachante({ nombre: nombre.trim(), telefono: telefono.trim() });
      } else {
        await completarPerfil({ nombre: nombre.trim(), telefono: telefono.trim() });
      }

      localStorage.setItem("perfilCompleto", "true");
      setStep(2);
    } catch (err) {
      const msg = err?.response?.data?.message || "Error al guardar el perfil.";
      setError(typeof msg === "string" ? msg : "Error al guardar el perfil.");
    } finally {
      setLoading(false);
    }
  };

  // ── PASO 2 – Cambiar contraseña ───────────────────────────────────────────
  const handlePassword = async () => {
    if (!newPass) {
      setError("Ingresa tu nueva contraseña.");
      return;
    }
    if (newPass.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPass !== confirmPass) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      await cambiarPassword(newPass);

      localStorage.setItem("primerLogin", "false");
      onFinish();
    } catch (err) {
      const msg = err?.response?.data?.message || "Error al cambiar la contraseña.";
      setError(typeof msg === "string" ? msg : "Error al cambiar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      visible={visible}
      modal
      closable={false}
      draggable={false}
      resizable={false}
      className="fl-dialog"
      maskClassName="fl-mask"
      style={{ width: "460px" }}
      header={
        <div className="fl-header">
          <i className="pi pi-shield fl-header-icon" />
          <span>Configuración inicial</span>
        </div>
      }
    >
      {/* ── STEP INDICATOR ────────────────────────────────────────────────── */}
      <div className="fl-steps">
        <div className={`fl-step-dot ${step >= 1 ? "active" : ""}`}>
          <span>1</span>
          <label>Perfil</label>
        </div>
        <div className="fl-step-line" />
        <div className={`fl-step-dot ${step >= 2 ? "active" : ""}`}>
          <span>2</span>
          <label>Contraseña</label>
        </div>
      </div>

      {/* ── ERROR ─────────────────────────────────────────────────────────── */}
      {error && (
        <div className="fl-error">
          <i className="pi pi-exclamation-triangle" />
          <span>{error}</span>
        </div>
      )}

      {/* ══════════ STEP 1 – COMPLETAR PERFIL ══════════ */}
      {step === 1 && (
        <>
          <h3 className="fl-title">Completa tu perfil</h3>
          <p className="fl-subtitle">
            Antes de continuar necesitamos algunos datos básicos.
          </p>

          <div className="fl-field">
            <label className="fl-label">NOMBRE COMPLETO</label>
            <span className="p-input-icon-left">
              <i className="pi pi-user" />
              <InputText
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Juan Pérez"
                className="fl-input"
              />
            </span>
          </div>

          <div className="fl-field">
            <label className="fl-label">TELÉFONO</label>
            <span className="p-input-icon-left">
              <i className="pi pi-phone" />
              <InputText
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej: 099 123 456"
                className="fl-input"
              />
            </span>
          </div>

          <div className="fl-actions">
            <Button
              label={loading ? "Guardando..." : "Continuar"}
              icon={loading ? "pi pi-spin pi-spinner" : "pi pi-arrow-right"}
              iconPos="right"
              className="fl-btn-primary"
              onClick={handlePerfil}
              disabled={loading}
            />
          </div>
        </>
      )}

      {/* ══════════ STEP 2 – CAMBIAR CONTRASEÑA ══════════ */}
      {step === 2 && (
        <>
          <h3 className="fl-title">Seguridad de tu cuenta</h3>
          <p className="fl-subtitle">
            Cambia tu contraseña temporal por una nueva y segura.
          </p>

          <div className="fl-field">
            <label className="fl-label">NUEVA CONTRASEÑA</label>
            <Password
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              toggleMask
              feedback
              promptLabel="Ingresa una contraseña"
              weakLabel="Débil"
              mediumLabel="Media"
              strongLabel="Fuerte"
              className="fl-password"
              inputClassName="fl-input"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div className="fl-field">
            <label className="fl-label">CONFIRMAR CONTRASEÑA</label>
            <Password
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              toggleMask
              feedback={false}
              className="fl-password"
              inputClassName="fl-input"
              placeholder="Repite tu contraseña"
            />
          </div>

          <div className="fl-actions">
            <Button
              label="Volver"
              icon="pi pi-arrow-left"
              className="fl-btn-secondary"
              onClick={() => { setStep(1); setError(""); }}
              disabled={loading}
            />
            <Button
              label={loading ? "Actualizando..." : "Finalizar"}
              icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
              iconPos="right"
              className="fl-btn-primary"
              onClick={handlePassword}
              disabled={loading}
            />
          </div>
        </>
      )}
    </Dialog>
  );
}
