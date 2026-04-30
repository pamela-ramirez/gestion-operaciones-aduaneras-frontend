import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { useState } from "react";
import { completarPerfil } from "../../services/clientService";
// import { cambiarPassword } from "../../services/authService";

export default function FirstLoginModal({ visible, onFinish }) {
  const [step, setStep] = useState(1);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handlePerfil = async () => {
    if (!nombre || !telefono) return;

    try {
      setLoading(true);

      await completarPerfil({ nombre, telefono });

      localStorage.setItem("perfilCompleto", "true");

      setStep(2);
    } catch (error) {
      console.error("Error completando perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePassword = async () => {
    if (!password) return;

    try {
      setLoading(true);

      // await cambiarPassword({ password });

      localStorage.setItem("primerLogin", "false");

      onFinish();
    } catch (error) {
      console.error("Error cambiando contraseña:", error);
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
      header="Configuración inicial"
    >
      {/* STEP INDICATOR */}
      <div className="fl-step">
        Paso {step} de 2
      </div>

      {/* ===================== STEP 1 ===================== */}
      {step === 1 && (
        <>
          <h3 className="fl-title">Completa tu perfil</h3>
          <p className="fl-subtitle">
            Antes de continuar necesitamos algunos datos básicos.
          </p>

          <div className="fl-field">
            <label className="fl-label">Nombre completo</label>
            <InputText
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div className="fl-field">
            <label className="fl-label">Teléfono</label>
            <InputText
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej: 099123456"
            />
          </div>

          <div className="fl-actions">
            <Button
              label={loading ? "Guardando..." : "Continuar"}
              icon="pi pi-arrow-right"
              className="fl-btn-primary"
              onClick={handlePerfil}
              disabled={loading}
            />
          </div>
        </>
      )}

      {/* ===================== STEP 2 ===================== */}
      {step === 2 && (
        <>
          <h3 className="fl-title">Seguridad de tu cuenta</h3>
          <p className="fl-subtitle">
            Cambia tu contraseña temporal por una segura.
          </p>

          <div className="fl-field">
            <label className="fl-label">Nueva contraseña</label>
            <Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              toggleMask
              feedback={false}
            />
          </div>

          <div className="fl-actions">
            <Button
              label="Volver"
              className="fl-btn-secondary"
              onClick={() => setStep(1)}
              disabled={loading}
            />

            <Button
              label={loading ? "Actualizando..." : "Finalizar"}
              icon="pi pi-check"
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
