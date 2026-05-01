import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import "./InviteUserDialog.css";

const initialForm = {
  rol: null,
  email: "",
  rut: "",
  //nroHabilitacionDGA: "",
};

const InviteUserDialog = ({ visible, onHide, onCreated, roles = [] }) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const isDespachante = (rol) => rol === "Despachante";
  const isCliente = (rol) => rol === "Cliente";

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRolChange = (value) => {
    setForm({ ...initialForm, rol: value });
    setErrors({});
  };

  const validate = () => {
    const e = {};

    if (!form.rol) e.rol = "Seleccioná un rol";

    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      e.email = "Email inválido";
    }

    if (isCliente(form.rol) && !form.rut.trim()) {
      e.rut = "RUT requerido";
    }

   /*  if (isDespachante(form.rol) && !form.nroHabilitacionDGA.trim()) {
      e.nroHabilitacionDGA = "Requerido";
    } */

    return e;
  };

  const handleSubmit = async () => {
    const e = validate();

    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        email: form.email,
        rol: form.rol,
        rut: isCliente(form.rol) ? form.rut : null,
       /*  nroHabilitacionDGA: isDespachante(form.rol)
          ? form.nroHabilitacionDGA
          : null, */
      };

      console.log("INVITAR USUARIO PAYLOAD:", payload);

      // 👉 cuando tengas backend:
      // await invitarUsuario(payload);

      // Simulación
      await new Promise((res) => setTimeout(res, 1000));

      onCreated?.(payload);

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setForm(initialForm);
        setErrors({});
        setLoading(false);
        onHide();
      }, 1800);
    } catch (error) {
      console.error(error);
      setLoading(false);

      setErrors({
        submit: "Error al enviar la invitación",
      });
    }
  };

  const handleHide = () => {
    if (loading) return;

    setForm(initialForm);
    setErrors({});
    setSuccess(false);
    onHide();
  };

  const dialogHeader = (
    <div className="uf-header-content">
      <div className="uf-logo">
        <i className="pi pi-user-plus" />
      </div>
      <div>
        <p className="uf-header-title">Nuevo Usuario</p>
        <p className="uf-header-sub">
          Se enviará un email para completar el registro.
        </p>
      </div>
    </div>
  );

  return (
    <Dialog
      header={dialogHeader}
      visible={visible}
      onHide={handleHide}
      modal
      closable={!success && !loading}
      style={{ width: "480px" }}
      className="uf-dialog"
    >
      <div className="uf-body">
        {/* SUCCESS */}
        {success && (
          <div className="uf-success">
            <div className="uf-success-icon">
              <i className="pi pi-check" />
            </div>
            <p className="uf-success-text">
              Invitación enviada correctamente. El usuario recibirá un email para
              completar su registro.
            </p>
          </div>
        )}

        {/* FORM */}
        {!success && (
          <>
            {/* ROL */}
            <div className="uf-field uf-field-full">
              <label className="uf-label">ROL DE USUARIO</label>
              <div className="uf-rol-btns">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    className={`uf-rol-btn ${
                      form.rol === r.value ? "active" : ""
                    }`}
                    onClick={() => handleRolChange(r.value)}
                  >
                    <i
                      className={`pi ${
                        isDespachante(r.value)
                          ? "pi-briefcase"
                          : "pi-building"
                      }`}
                    />
                    {r.label}
                  </button>
                ))}
              </div>
              {errors.rol && <small className="uf-error">{errors.rol}</small>}
            </div>

            {/* EMAIL */}
            <div className="uf-field uf-field-full">
              <label className="uf-label">EMAIL</label>
              <span className="p-input-icon-left">
                <i className="pi pi-envelope" />
                <InputText
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="usuario@empresa.com"
                  className={`uf-input ${
                    errors.email ? "uf-input-error" : ""
                  }`}
                />
              </span>
              {errors.email && (
                <small className="uf-error">{errors.email}</small>
              )}
            </div>

            {/* CLIENTE */}
            {isCliente(form.rol) && (
              <div className="uf-field">
                <label className="uf-label">RUT</label>
                <span className="p-input-icon-left">
                  <i className="pi pi-id-card" />
                  <InputText
                    value={form.rut}
                    onChange={(e) => handleChange("rut", e.target.value)}
                    placeholder="21234567-8"
                    className={`uf-input ${
                      errors.rut ? "uf-input-error" : ""
                    }`}
                  />
                </span>
                {errors.rut && (
                  <small className="uf-error">{errors.rut}</small>
                )}
              </div>
            )}

            {/* DESPACHANTE */}
           {/*  {isDespachante(form.rol) && (
              <div className="uf-field">
                <label className="uf-label">NRO. HABILITACIÓN DGA</label>
                <span className="p-input-icon-left">
                  <i className="pi pi-id-card" />
                  <InputText
                    value={form.nroHabilitacionDGA}
                    onChange={(e) =>
                      handleChange(
                        "nroHabilitacionDGA",
                        e.target.value
                      )
                    }
                    placeholder="Ej. 12345"
                    className={`uf-input ${
                      errors.nroHabilitacionDGA
                        ? "uf-input-error"
                        : ""
                    }`}
                  />
                </span>
                {errors.nroHabilitacionDGA && (
                  <small className="uf-error">
                    {errors.nroHabilitacionDGA}
                  </small>
                )}
              </div>
            )} */}

            {/* INFO */}
            {form.rol && (
              <div className="uf-info">
                <i className="pi pi-info-circle" />
                <span>
                  El usuario recibirá un email para completar sus datos y cambiar
                  su contraseña.
                </span>
              </div>
            )}

            {/* ERROR GLOBAL */}
            {errors.submit && (
              <small className="uf-error">{errors.submit}</small>
            )}

            {/* ACTIONS */}
            <div className="uf-actions">
              <Button
                label="Cancelar"
                text
                onClick={handleHide}
                disabled={loading}
              />
              <Button
                label={loading ? "Enviando..." : "Enviar email"}
                icon="pi pi-send"
                onClick={handleSubmit}
                loading={loading}
              />
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
};

export default InviteUserDialog;