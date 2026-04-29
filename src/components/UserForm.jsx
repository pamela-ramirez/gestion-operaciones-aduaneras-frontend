import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { getRoles } from "../services/roleService";
import "./UserForm.css";

const CARGOS = [
  { label: "Despachante Titular", value: "TITULAR" },
  { label: "Auxiliar", value: "AUXILIAR" },
  { label: "Administrativo", value: "ADMINISTRATIVO" },
];

const TIPOS_OPERACION = [
  { label: "Importación", value: "IMPORTACION" },
  { label: "Exportación", value: "EXPORTACION" },
  { label: "Ambas", value: "AMBAS" },
];

const initialForm = {
  rol: null,
  // Despachante
  nombre: "",
  apellido: "",
  email: "",
  password: "",
  telefono: "",
  cargo: null,
  nroHabilitacionDGA: "",
  // Cliente
  razonSocial: "",
  rut: "",
  nombreContacto: "",
  apellidoContacto: "",
  direccionFiscal: "",
  tipoOperacion: null,
};

const UserForm = ({ visible, onHide, onCreated }) => {
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadRoles = async () => {
      const data = await getRoles();
      setRoles(data);
    };
    loadRoles();
  }, []);

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
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Email inválido";
    if (!form.password || form.password.length < 6) e.password = "Mínimo 6 caracteres";
    if (!form.telefono.trim()) e.telefono = "Requerido";
    if (!form.cargo) e.cargo = "Seleccioná un cargo";
    if (form.cargo === "TITULAR" && !form.nroHabilitacionDGA.trim()) e.nroHabilitacionDGA = "Requerido para Titular";
    return e;
  };

  const validateCliente = () => {
    const e = {};
    if (!form.razonSocial.trim()) e.razonSocial = "Requerido";
    if (!form.rut.trim()) e.rut = "Requerido";
    if (!form.nombreContacto.trim()) e.nombreContacto = "Requerido";
    if (!form.apellidoContacto.trim()) e.apellidoContacto = "Requerido";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Email inválido";
    if (!form.password || form.password.length < 6) e.password = "Mínimo 6 caracteres";
    if (!form.telefono.trim()) e.telefono = "Requerido";
    if (!form.tipoOperacion) e.tipoOperacion = "Seleccioná un tipo";
    return e;
  };

  const handleSubmit = () => {
    if (!form.rol) {
      setErrors({ rol: "Seleccioná un rol" });
      return;
    }
    const e = form.rol === "DESPACHANTE" ? validateDespachante() : validateCliente();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    console.log("Usuario a crear:", form);
    onCreated?.(form);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setForm(initialForm);
      setErrors({});
      onHide();
    }, 1400);
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
        <p className="uf-header-sub">Completá los datos para habilitar el acceso.</p>
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
            <p className="uf-success-text">Usuario creado exitosamente</p>
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
                <i className={`pi ${r.value === "DESPACHANTE" ? "pi-briefcase" : "pi-building"}`} />
                {r.label}
              </button>
            ))}
          </div>
          {errors.rol && <small className="uf-error">{errors.rol}</small>}
        </div>

        {/* ===== CAMPOS DESPACHANTE ===== */}
        {form.rol === "DESPACHANTE" && (
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
                {errors.nombre && <small className="uf-error">{errors.nombre}</small>}
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
                {errors.apellido && <small className="uf-error">{errors.apellido}</small>}
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
                {errors.email && <small className="uf-error">{errors.email}</small>}
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
                {errors.telefono && <small className="uf-error">{errors.telefono}</small>}
              </div>

              <div className="uf-field">
                <label className="uf-label">CARGO</label>
                <Dropdown
                  value={form.cargo}
                  options={CARGOS}
                  onChange={(e) => handleChange("cargo", e.value)}
                  placeholder="Seleccioná"
                  className={`uf-dropdown ${errors.cargo ? "uf-input-error" : ""}`}
                />
                {errors.cargo && <small className="uf-error">{errors.cargo}</small>}
              </div>

              {form.cargo === "TITULAR" && (
                <div className="uf-field uf-field-full">
                  <label className="uf-label">NRO. HABILITACIÓN DGA</label>
                  <span className="p-input-icon-left">
                    <i className="pi pi-id-card" />
                    <InputText
                      value={form.nroHabilitacionDGA}
                      onChange={(e) => handleChange("nroHabilitacionDGA", e.target.value)}
                      placeholder="Ej. 12345"
                      className={`uf-input ${errors.nroHabilitacionDGA ? "uf-input-error" : ""}`}
                    />
                  </span>
                  {errors.nroHabilitacionDGA && <small className="uf-error">{errors.nroHabilitacionDGA}</small>}
                </div>
              )}

              <div className="uf-field uf-field-full">
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
                {errors.password && <small className="uf-error">{errors.password}</small>}
              </div>
            </div>
          </>
        )}

        {/* ===== CAMPOS CLIENTE ===== */}
        {form.rol === "CLIENTE" && (
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
                    onChange={(e) => handleChange("razonSocial", e.target.value)}
                    placeholder="Ej. Importadora del Sur S.A."
                    className={`uf-input ${errors.razonSocial ? "uf-input-error" : ""}`}
                  />
                </span>
                {errors.razonSocial && <small className="uf-error">{errors.razonSocial}</small>}
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

              <div className="uf-field">
                <label className="uf-label">TIPO DE OPERACIÓN</label>
                <Dropdown
                  value={form.tipoOperacion}
                  options={TIPOS_OPERACION}
                  onChange={(e) => handleChange("tipoOperacion", e.value)}
                  placeholder="Seleccioná"
                  className={`uf-dropdown ${errors.tipoOperacion ? "uf-input-error" : ""}`}
                />
                {errors.tipoOperacion && <small className="uf-error">{errors.tipoOperacion}</small>}
              </div>

              <div className="uf-field uf-field-full">
                <label className="uf-label">DIRECCIÓN FISCAL</label>
                <span className="p-input-icon-left">
                  <i className="pi pi-map-marker" />
                  <InputText
                    value={form.direccionFiscal}
                    onChange={(e) => handleChange("direccionFiscal", e.target.value)}
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
                    onChange={(e) => handleChange("nombreContacto", e.target.value)}
                    placeholder="Ej. María"
                    className={`uf-input ${errors.nombreContacto ? "uf-input-error" : ""}`}
                  />
                </span>
                {errors.nombreContacto && <small className="uf-error">{errors.nombreContacto}</small>}
              </div>

              <div className="uf-field">
                <label className="uf-label">APELLIDO</label>
                <span className="p-input-icon-left">
                  <i className="pi pi-user" />
                  <InputText
                    value={form.apellidoContacto}
                    onChange={(e) => handleChange("apellidoContacto", e.target.value)}
                    placeholder="Ej. González"
                    className={`uf-input ${errors.apellidoContacto ? "uf-input-error" : ""}`}
                  />
                </span>
                {errors.apellidoContacto && <small className="uf-error">{errors.apellidoContacto}</small>}
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
                {errors.email && <small className="uf-error">{errors.email}</small>}
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
                {errors.telefono && <small className="uf-error">{errors.telefono}</small>}
              </div>

              <div className="uf-field">
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
                {errors.password && <small className="uf-error">{errors.password}</small>}
              </div>
            </div>
          </>
        )}

        {/* INFO */}
        {form.rol && (
          <div className="uf-info">
            <i className="pi pi-info-circle" />
            <span>El usuario deberá cambiar su contraseña en el primer inicio de sesión.</span>
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
