import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { editarCliente } from "../../services/clienteService";
import "./EditClientDialog.css";

export default function EditClientDialog({
  visible,
  onHide,
  onRefreshClients,
  clientData,
}) {
  const [formData, setFormData] = useState({
    //razonSocial: "",
    //rut: "",
    //direccion: "",
    nombreContacto: "",
    apellidoContacto: "",
    telefonoContacto: "",
    emailContacto: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && clientData) {
      setFormData({
        //razonSocial: clientData.razonSocial || "",
        //rut: clientData.rut || "",
        //direccion: clientData.direccion || "",
        nombreContacto: clientData.nombreContacto || "",
        apellidoContacto: clientData.apellidoContacto || "",
        telefonoContacto: clientData.telefonoContacto || "",
        emailContacto: clientData.emailContacto || "",
      });
    }
  }, [clientData, visible]);

  const resetForm = () => {
    setFormData({
      //razonSocial: "",
      //rut: "",
      //direccion: "",
      nombreContacto: "",
      apellidoContacto: "",
      telefonoContacto: "",
      emailContacto: "",
    });
    setErrors({});
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.nombreContacto !== "" && !formData.nombreContacto.trim()) {
      newErrors.nombreContacto = "El nombre no puede estar vacío";
    }

    if (formData.apellidoContacto !== "" && !formData.apellidoContacto.trim()) {
      newErrors.apellidoContacto = "El apellido no puede estar vacío";
    }

    if (formData.telefonoContacto !== "" && !formData.telefonoContacto.trim()) {
      newErrors.telefonoContacto = "El teléfono no puede estar vacío";
    }

    if (
      formData.emailContacto &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailContacto)
    ) {
      newErrors.emailContacto = "El email no es válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Detectar cambios
      const updatedFields = {};

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== clientData[key]) {
          updatedFields[key] = formData[key];
        }
      });

      // Si no cambió nada
      if (Object.keys(updatedFields).length === 0) {
        onHide();
        return;
      }

      await editarCliente(clientData.id, updatedFields);

      onRefreshClients();
      onHide();
      resetForm();
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
      setErrors({
        submit: "Error al actualizar el cliente. Intenta nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const dialogHeader = (
    <div className="ccd-header">
      <div className="ccd-header-icon">
        <i className="pi pi-building" />
      </div>
      <div>
        <h2 className="ccd-header-title">Editar Cliente</h2>
        <p className="ccd-header-subtitle">
          Actualiza la información del cliente
        </p>
      </div>
    </div>
  );

  const dialogFooter = (
    <div className="ccd-footer">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        className="ccd-btn-cancel"
        onClick={() => {
          onHide();
          resetForm();
        }}
        disabled={loading}
      />
      <Button
        label="Actualizar"
        icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
        className="ccd-btn-submit"
        onClick={handleSubmit}
        disabled={loading}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={() => {
        onHide();
        resetForm();
      }}
      header={dialogHeader}
      footer={dialogFooter}
      className="ccd-dialog"
      modal
      dismissableMask
    >
      <div className="ccd-content">
        {/* EMPRESA */}
        {/* <div className="ccd-section">
          <h3 className="ccd-section-title">Información de la Empresa</h3>

          <div className="ccd-field">
            <label className="ccd-label">
              RAZÓN SOCIAL <span className="ccd-required">*</span>
            </label>
            <InputText
              value={formData.razonSocial}
              onChange={(e) => handleChange("razonSocial", e.target.value)}
              className={`ccd-input ${errors.razonSocial ? "p-invalid" : ""}`}
            />
            {errors.razonSocial && (
              <small className="ccd-error">{errors.razonSocial}</small>
            )}
          </div>

          <div className="ccd-row">
            <div className="ccd-field">
              <label className="ccd-label">
                RUT <span className="ccd-required">*</span>
              </label>
              <InputText
                value={formData.rut}
                onChange={(e) => handleChange("rut", e.target.value)}
                className={`ccd-input ${errors.rut ? "p-invalid" : ""}`}
              />
              {errors.rut && (
                <small className="ccd-error">{errors.rut}</small>
              )}
            </div>

            <div className="ccd-field">
              <label className="ccd-label">
                DIRECCIÓN <span className="ccd-required">*</span>
              </label>
              <InputText
                value={formData.direccion}
                onChange={(e) => handleChange("direccion", e.target.value)}
                className={`ccd-input ${errors.direccion ? "p-invalid" : ""}`}
              />
              {errors.direccion && (
                <small className="ccd-error">{errors.direccion}</small>
              )}
            </div>
          </div>
        </div>
 */}
        {/* CONTACTO */}
        <div className="ccd-section">
          <h3 className="ccd-section-title">
            Información de Contacto de la Empresa
          </h3>

          <div className="ccd-row">
            <InputText
              value={formData.nombreContacto}
              onChange={(e) => handleChange("nombreContacto", e.target.value)}
              placeholder="Nombre"
              className={`ccd-input ${
                errors.nombreContacto ? "p-invalid" : ""
              }`}
            />

            <InputText
              value={formData.apellidoContacto}
              onChange={(e) => handleChange("apellidoContacto", e.target.value)}
              placeholder="Apellido"
              className={`ccd-input ${
                errors.apellidoContacto ? "p-invalid" : ""
              }`}
            />
          </div>

          <div className="ccd-row">
            <InputText
              value={formData.telefonoContacto}
              onChange={(e) => handleChange("telefonoContacto", e.target.value)}
              placeholder="Teléfono"
              className={`ccd-input ${
                errors.telefonoContacto ? "p-invalid" : ""
              }`}
            />

            <InputText
              value={formData.emailContacto}
              onChange={(e) => handleChange("emailContacto", e.target.value)}
              placeholder="Email"
              className={`ccd-input ${errors.emailContacto ? "p-invalid" : ""}`}
            />
          </div>
        </div>

        {errors.submit && (
          <div className="ccd-submit-error">
            <i className="pi pi-exclamation-circle" />
            {errors.submit}
          </div>
        )}
      </div>
    </Dialog>
  );
}
