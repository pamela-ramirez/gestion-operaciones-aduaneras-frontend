import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

import { crearCliente } from "../../services/clienteService";
import { crearDespachante } from "../../services/despachanteService";

import "./CreateUserDialog.css";

const initialForm = {
  rol: null,
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
  razonSocial: "",
  rut: "",
  direccion: "",
};

export default function InviteUserDialog({
  visible,
  onHide,
  onCreated,
  roles = [],
}) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generatedUser, setGeneratedUser] = useState(null);

  const isDespachante = form.rol === "Despachante";
  const isCliente = form.rol === "Cliente";
  const hasRol = !!form.rol;

  // =========================
  // HANDLERS
  // =========================

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRolChange = (value) => {
    setForm({ ...initialForm, rol: value });
    setErrors({});
    setGeneratedUser(null);
  };

  // =========================
  // VALIDACIÓN
  // =========================

  const validate = () => {
    const e = {};

    if (!form.rol) e.rol = "Seleccioná un rol";

    if (!form.nombre.trim()) e.nombre = "Requerido";
    if (!form.apellido.trim()) e.apellido = "Requerido";

    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      e.email = "Email inválido";
    }

    if (isCliente) {
      if (!form.razonSocial.trim()) e.razonSocial = "Requerido";
      if (!form.rut.trim()) e.rut = "Requerido";
    }

    return e;
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async () => {
    const e = validate();

    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    try {
      setLoading(true);

      let response;

      switch (form.rol) {
        case "Despachante":
          response = await crearDespachante({
            nombre: form.nombre,
            apellido: form.apellido,
            email: form.email,
          });
          break;

        case "Cliente":
          response = await crearCliente({
            nombre: form.nombre,
            apellido: form.apellido,
            email: form.email,
            telefono: form.telefono || null,
            razonSocial: form.razonSocial,
            rut: form.rut,
            direccion: form.direccion,
          });
          break;

        default:
          throw new Error("Rol inválido");
      }

      setGeneratedUser(response);
      onCreated?.();
    } catch (err) {
      console.error(err);
      setErrors({ submit: "Error al crear el usuario" });
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RESET / CLOSE
  // =========================

  const handleHide = () => {
    if (loading) return;

    setForm(initialForm);
    setErrors({});
    setGeneratedUser(null);
    onHide();
  };

  // =========================
  // HEADER
  // =========================

  const dialogHeader = (
    <div className="uf-header-content">
      <div className="uf-logo">
        <i className="pi pi-user-plus" />
      </div>
      <div>
        <p className="uf-header-title">Nuevo Usuario</p>
        <p className="uf-header-sub">
          Creación manual de usuario en el sistema.
        </p>
      </div>
    </div>
  );

  // =========================
  // UI
  // =========================

  return (
    <Dialog
      header={dialogHeader}
      visible={visible}
      onHide={handleHide}
      modal
      closable={!loading}
      style={{ width: "520px" }}
      className="uf-dialog"
    >
      <div className="uf-body">
        {/* SUCCESS */}
        {generatedUser && (
          <div className="uf-success">
            <div className="uf-success-icon">
              <i className="pi pi-check" />
            </div>

            <p className="uf-success-text">Usuario creado correctamente</p>

            <div className="uf-credentials">
              <p>
                <strong>Usuario:</strong> {generatedUser.username}
              </p>
              <p>
                <strong>Password:</strong> {generatedUser.passwordTemporal}
              </p>
            </div>

            <div className="uf-actions">
              <Button
                label="Cerrar"
                onClick={handleHide}
                className="uf-btn-primary"
              />
            </div>
          </div>
        )}

        {/* FORM */}
        {!generatedUser && (
          <>
            {/* ROL */}
            <div className="uf-field uf-field-full">
              <label className="uf-label">ROL</label>

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
                        r.value === "Despachante"
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

                
            {!hasRol && (
              <div className="uf-empty-state">
               {/*  <i className="pi pi-user" /> */}
                <p>Seleccioná un rol para continuar</p>
              </div>
            )}

            {/* FORM SOLO SI HAY ROL */}
            {hasRol && (
              <>
                {/* DATOS PERSONALES */}
                <div className="uf-field">
                  <label className="uf-label">NOMBRE</label>
                  <InputText
                    value={form.nombre}
                    onChange={(e) => handleChange("nombre", e.target.value)}
                    className="uf-input"
                  />
                  {errors.nombre && (
                    <small className="uf-error">{errors.nombre}</small>
                  )}
                </div>

                <div className="uf-field">
                  <label className="uf-label">APELLIDO</label>
                  <InputText
                    value={form.apellido}
                    onChange={(e) => handleChange("apellido", e.target.value)}
                    className="uf-input"
                  />
                  {errors.apellido && (
                    <small className="uf-error">{errors.apellido}</small>
                  )}
                </div>

                <div className="uf-field">
                  <label className="uf-label">EMAIL</label>
                  <InputText
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="uf-input"
                  />
                  {errors.email && (
                    <small className="uf-error">{errors.email}</small>
                  )}
                </div>

                {/* CLIENTE */}
                {isCliente && (
                  <>
                    <div className="uf-field">
                      <label className="uf-label">TELÉFONO (OPCIONAL)</label>
                      <InputText
                        value={form.telefono}
                        onChange={(e) =>
                          handleChange("telefono", e.target.value)
                        }
                        className="uf-input"
                      />
                    </div>

                    <div className="uf-field">
                      <label className="uf-label">RAZÓN SOCIAL</label>
                      <InputText
                        value={form.razonSocial}
                        onChange={(e) =>
                          handleChange("razonSocial", e.target.value)
                        }
                        className="uf-input"
                      />
                      {errors.razonSocial && (
                        <small className="uf-error">{errors.razonSocial}</small>
                      )}
                    </div>

                    <div className="uf-field">
                      <label className="uf-label">RUT</label>
                      <InputText
                        value={form.rut}
                        onChange={(e) => handleChange("rut", e.target.value)}
                        className="uf-input"
                      />
                      {errors.rut && (
                        <small className="uf-error">{errors.rut}</small>
                      )}
                    </div>

                    <div className="uf-field">
                      <label className="uf-label">DIRECCIÓN</label>
                      <InputText
                        value={form.direccion}
                        onChange={(e) =>
                          handleChange("direccion", e.target.value)
                        }
                        className="uf-input"
                      />
                      {errors.direccion && (
                        <small className="uf-error">{errors.direccion}</small>
                      )}
                    </div>
                  </>
                )}

                {/* ERROR GLOBAL */}
                {errors.submit && (
                  <small className="uf-error">{errors.submit}</small>
                )}

                {/* ACTIONS */}
                <div className="uf-actions">
                  <Button
                    label="Cancelar"
                    className="uf-btn-secondary"
                    onClick={handleHide}
                    disabled={loading}
                  />
                  <Button
                    label={loading ? "Creando..." : "Crear Usuario"}
                    className="uf-btn-primary"
                    onClick={handleSubmit}
                    loading={loading}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Dialog>
  );
}
