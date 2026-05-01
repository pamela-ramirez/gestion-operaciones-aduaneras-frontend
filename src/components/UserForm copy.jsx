import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
//import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import "./UserForm.css";
import { crearCliente } from "../services/clientService";

const initialForm = {
  rol: null,

  // Despachante
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
  nroHabilitacionDGA: "",

  // Cliente
  razonSocial: "",
  rut: "",
  nombreContacto: "",
  apellidoContacto: "",
  direccionFiscal: "",
};

const UserForm = ({ visible, onHide, onCreated, roles = [] }) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Función helper para identificar si un rol es DESPACHANTE
  const isDespachante = (rolValue) => {
    return rolValue === "Despachante";
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleRolChange = (value) => {
    setForm({ ...initialForm, rol: value });
    setErrors({});
  };

  const validateDespachante = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Requerido";
    if (!form.apellido.trim()) e.apellido = "Requerido";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Email inválido";
    if (!form.telefono.trim()) e.telefono = "Requerido";
    if (!form.nroHabilitacionDGA.trim()) e.nroHabilitacionDGA = "Requerido";
    return e;
  };

  const validateCliente = () => {
    const e = {};
    if (!form.razonSocial.trim()) e.razonSocial = "Requerido";
    if (!form.rut.trim()) e.rut = "Requerido";
    if (!form.nombreContacto.trim()) e.nombreContacto = "Requerido";
    if (!form.apellidoContacto.trim()) e.apellidoContacto = "Requerido";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Email inválido";
    if (!form.telefono.trim()) e.telefono = "Requerido";
    return e;
  };

  const handleSubmit = async () => {
    if (!form.rol) {
      setErrors({ rol: "Seleccioná un rol" });
      return;
    }

    const e = isDespachante(form.rol)
      ? validateDespachante()
      : validateCliente();

    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    try {
      let response;

      if (isDespachante(form.rol)) {
        const despachantePayload = {
          email: form.email,
          persona: {
            nombre: form.nombre,
            apellido: form.apellido,
            telefono: form.telefono,
          },
          nroHabilitacionDGA: form.nroHabilitacionDGA,
        };

        console.log("PAYLOAD DESPACHANTE:", despachantePayload);

        // 👉 cuando tengas backend listo
        // response = await crearDespachante(despachantePayload);

        alert("Pendiente endpoint de despachante");
        return;
      } else {
        const clientePayload = {
          email: form.email,
          empresa: {
            rut: form.rut,
            razonSocial: form.razonSocial,
            direccionFiscal: form.direccionFiscal,
          },
          contacto: {
            nombre: form.nombreContacto,
            apellido: form.apellidoContacto,
            telefono: form.telefono,
          },
        };

        console.log("PAYLOAD CLIENTE:", clientePayload);

        response = await crearCliente(clientePayload);
      }

      onCreated?.(response);

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setForm(initialForm);
        setErrors({});
        onHide();
      }, 2000);
    } catch (error) {
      console.error(error);

      setErrors({
        submit: "Error al crear el usuario",
      });
    }
  };

  const handleHide = () => {
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
          Completá los datos para habilitar el acceso.
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
      closable={!success}
      style={{ width: "520px" }}
      className="uf-dialog"
      maskClassName="uf-mask"
    >
      <div className="uf-body">
        {/* SUCCESS OVERLAY */}
        {success && (
          <div className="uf-success">
            <div className="uf-success-icon">
              <i className="pi pi-check" />
            </div>
            <p className="uf-success-text">
              Usuario creado exitosamente. Se envió email para activar la cuenta.
            </p>
          </div>
        )}

        {/* ROL SELECTOR */}
        <div className="uf-field uf-field-full">
          <label className="uf-label">ROL DE USUARIO</label>
          <div className="uf-rol-btns">
            {roles.map((r) => (
              <button
                key={r.value}
                className={`uf-rol-btn ${form.rol === r.value ? "active" : ""}`}
                onClick={() => handleRolChange(r.value)}
              >
                <i
                  className={`pi ${isDespachante(r.value) ? "pi-briefcase" : "pi-building"}`}
                />
                {r.label}
              </button>
            ))}
          </div>
          {errors.rol && <small className="uf-error">{errors.rol}</small>}
        </div>

        {/* ===== CAMPOS DESPACHANTE ===== */}
        {isDespachante(form.rol) && (
          <>
            <div className="uf-section-divider">
              <span>DATOS PERSONALES</span>
            </div>

            <div className="uf-grid">
              <div className="uf-field">
                <label className="uf-label">NOMBRE</label>
                <span className="p-input-icon-left">
                  <i className="pi pi-user" />
                  <InputText
                    value={form.nombre}
                    onChange={(e) => handleChange("nombre", e.target.value)}
                    placeholder="Ej. Juan"
                    className={`uf-input ${errors.nombre ? "uf-input-error" : ""}`}
                  />
                </span>
                {errors.nombre && (
                  <small className="uf-error">{errors.nombre}</small>
                )}
              </div>

              <div className="uf-field">
                <label className="uf-label">APELLIDO</label>
                <span className="p-input-icon-left">
                  <i className="pi pi-user" />
                  <InputText
                    value={form.apellido}
                    onChange={(e) => handleChange("apellido", e.target.value)}
                    placeholder="Ej. Pérez"
                    className={`uf-input ${errors.apellido ? "uf-input-error" : ""}`}
                  />
                </span>
                {errors.apellido && (
                  <small className="uf-error">{errors.apellido}</small>
                )}
              </div>

              <div className="uf-field uf-field-full">
                <label className="uf-label">CORREO ELECTRÓNICO</label>
                <span className="p-input-icon-left">
                  <i className="pi pi-envelope" />
                  <InputText
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="nombre@empresa.com"
                    className={`uf-input ${errors.email ? "uf-input-error" : ""}`}
                  />
                </span>
                {errors.email && (
                  <small className="uf-error">{errors.email}</small>
                )}
              </div>

              <div className="uf-field">
                <label className="uf-label">TELÉFONO</label>
                <span className="p-input-icon-left">
                  <i className="pi pi-phone" />
                  <InputText
                    value={form.telefono}
                    onChange={(e) => handleChange("telefono", e.target.value)}
                    placeholder="099 000 000"
                    className={`uf-input ${errors.telefono ? "uf-input-error" : ""}`}
                  />
                </span>
                {errors.telefono && (
                  <small className="uf-error">{errors.telefono}</small>
                )}
              </div>

              <div className="uf-field uf-field-full">
                <label className="uf-label">NRO. HABILITACIÓN DGA</label>
                <span className="p-input-icon-left">
                  <i className="pi pi-id-card" />
                  <InputText
                    value={form.nroHabilitacionDGA}
                    onChange={(e) =>
                      handleChange("nroHabilitacionDGA", e.target.value)
                    }
                    placeholder="Ej. 12345"
                    className={`uf-input ${
                      errors.nroHabilitacionDGA ? "uf-input-error" : ""
                    }`}
                  />
                </span>
                {errors.nroHabilitacionDGA && (
                  <small className="uf-error">
                    {errors.nroHabilitacionDGA}
                  </small>
                )}
              </div>

              {/*  <div className="uf-field uf-field-full">
                <label className="uf-label">CONTRASEÑA TEMPORAL</label>
                <span className="p-input-icon-left uf-password-wrap">
                  <i className="pi pi-lock" />
                  <Password
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="••••••••"
                    feedback={false}
                    toggleMask
                    inputClassName={`uf-input ${errors.password ? "uf-input-error" : ""}`}
                    className="uf-password"
                  />
                </span>
                {errors.password && (
                  <small className="uf-error">{errors.password}</small>
                )}
              </div> */}
            </div>
          </>
        )}

        {/* ===== CAMPOS CLIENTE ===== */}
        {!isDespachante(form.rol) && (
          <>
            <div className="uf-section-divider">
              <span>DATOS DE LA EMPRESA</span>
            </div>

            <div className="uf-grid">
              <div className="uf-field uf-field-full">
                <label className="uf-label">RAZÓN SOCIAL</label>
                <span className="p-input-icon-left">
                  <i className="pi pi-building" />
                  <InputText
                    value={form.razonSocial}
                    onChange={(e) =>
                      handleChange("razonSocial", e.target.value)
                    }
                    placeholder="Ej. Importadora del Sur S.A."
                    className={`uf-input ${
                      errors.razonSocial ? "uf-input-error" : ""
                    }`}
                  />
                </span>
                {errors.razonSocial && (
                  <small className="uf-error">{errors.razonSocial}</small>
                )}
              </div>

              <div className="uf-field">
                <label className="uf-label">RUT</label>
                <span className="p-input-icon-left">
                  <i className="pi pi-id-card" />
                  <InputText
                    value={form.rut}
                    onChange={(e) => handleChange("rut", e.target.value)}
                    placeholder="21234567-8"
                    className={`uf-input ${errors.rut ? "uf-input-error" : ""}`}
                  />
                </span>
                {errors.rut && <small className="uf-error">{errors.rut}</small>}
              </div>

              <div className="uf-field uf-field-full">
                <label className="uf-label">DIRECCIÓN FISCAL</label>
                <span className="p-input-icon-left">
                  <i className="pi pi-map-marker" />
                  <InputText
                    value={form.direccionFiscal}
                    onChange={(e) =>
                      handleChange("direccionFiscal", e.target.value)
                    }
                    placeholder="Ej. Av. 18 de Julio 1234, Montevideo"
                    className="uf-input"
                  />
                </span>
              </div>
            </div>

            <div className="uf-section-divider">
              <span>CONTACTO PRINCIPAL</span>
            </div>

            <div className="uf-grid">
              <div className="uf-field">
                <label className="uf-label">NOMBRE</label>
                <span className="p-input-icon-left">
                  <i className="pi pi-user" />
                  <InputText
                    value={form.nombreContacto}
                    onChange={(e) =>
                      handleChange("nombreContacto", e.target.value)
                    }
                    placeholder="Ej. María"
                    className={`uf-input ${errors.nombreContacto ? "uf-input-error" : ""}`}
                  />
                </span>
                {errors.nombreContacto && (
                  <small className="uf-error">{errors.nombreContacto}</small>
                )}
              </div>

              <div className="uf-field">
                <label className="uf-label">APELLIDO</label>
                <span className="p-input-icon-left">
                  <i className="pi pi-user" />
                  <InputText
                    value={form.apellidoContacto}
                    onChange={(e) =>
                      handleChange("apellidoContacto", e.target.value)
                    }
                    placeholder="Ej. González"
                    className={`uf-input ${errors.apellidoContacto ? "uf-input-error" : ""}`}
                  />
                </span>
                {errors.apellidoContacto && (
                  <small className="uf-error">{errors.apellidoContacto}</small>
                )}
              </div>

              <div className="uf-field uf-field-full">
                <label className="uf-label">CORREO ELECTRÓNICO</label>
                <span className="p-input-icon-left">
                  <i className="pi pi-envelope" />
                  <InputText
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="contacto@empresa.com"
                    className={`uf-input ${errors.email ? "uf-input-error" : ""}`}
                  />
                </span>
                {errors.email && (
                  <small className="uf-error">{errors.email}</small>
                )}
              </div>

              <div className="uf-field">
                <label className="uf-label">TELÉFONO</label>
                <span className="p-input-icon-left">
                  <i className="pi pi-phone" />
                  <InputText
                    value={form.telefono}
                    onChange={(e) => handleChange("telefono", e.target.value)}
                    placeholder="099 000 000"
                    className={`uf-input ${errors.telefono ? "uf-input-error" : ""}`}
                  />
                </span>
                {errors.telefono && (
                  <small className="uf-error">{errors.telefono}</small>
                )}
              </div>

              {/* <div className="uf-field">
                <label className="uf-label">CONTRASEÑA TEMPORAL</label>
                <span className="p-input-icon-left uf-password-wrap">
                  <i className="pi pi-lock" />
                  <Password
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="••••••••"
                    feedback={false}
                    toggleMask
                    inputClassName={`uf-input ${errors.password ? "uf-input-error" : ""}`}
                    className="uf-password"
                  />
                </span>
                {errors.password && (
                  <small className="uf-error">{errors.password}</small>
                )}
              </div> */}
            </div>
          </>
        )}

        {/* INFO */}
        {form.rol && (
          <div className="uf-info">
            <i className="pi pi-info-circle" />
            <span>
              El usuario deberá cambiar su contraseña en el primer inicio de
              sesión.
            </span>
          </div>
        )}

        {/* ACTIONS */}
        <div className="uf-actions">
          <Button
            label="Cancelar"
            className="uf-btn-ghost"
            text
            onClick={handleHide}
          />
          <Button
            label="Crear Usuario"
            icon="pi pi-check"
            className="uf-btn-primary"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default UserForm;
