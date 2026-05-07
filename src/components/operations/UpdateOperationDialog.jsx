import { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { actualizarOperacion } from "../../services/operationService";
import "./OperationDialogs.css";

export default function UpdateOperationDialog({ 
  visible, 
  onHide, 
  onRefreshOperations,
  operationData 
}) {
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [tiposConocimiento, setTiposConocimiento] = useState([]);
  
  const [formData, setFormData] = useState({
    nroDUA: "",
    tipoConocimientoId: null,
    nroConocimiento: "",
  });

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    if (visible && operationData) {
      cargarTiposConocimiento();
      setFormData({
        nroDUA: operationData.nroDUA || "",
        tipoConocimientoId: operationData.tipoConocimientoId || null,
        nroConocimiento: operationData.nroConocimiento || "",
      });
    }
  }, [visible, operationData]);

  const cargarTiposConocimiento = async () => {
    // TODO: Implementar servicio real cuando esté disponible
    // Por ahora usamos datos de ejemplo
    setTiposConocimiento([
      { label: "Bill of Lading (Master)", value: 1 },
      { label: "Bill of Lading (House)", value: 2 },
      { label: "Air Waybill (AWB)", value: 3 },
      { label: "Conocimiento de Embarque Marítimo", value: 4 },
      { label: "Carta de Porte", value: 5 },
    ]);
  };

  const resetForm = () => {
    setFormData({
      nroDUA: "",
      tipoConocimientoId: null,
      nroConocimiento: "",
    });
  };

  // =========================
  // HANDLERS
  // =========================

  const handleGuardar = async () => {
    // Validar que al menos un campo tenga datos
    if (!formData.nroDUA.trim() && !formData.tipoConocimientoId && !formData.nroConocimiento.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Validación",
        detail: "Debe completar al menos un campo para guardar",
        life: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        ...operationData,
        nroDUA: formData.nroDUA || operationData.nroDUA,
        tipoConocimientoId: formData.tipoConocimientoId || operationData.tipoConocimientoId,
        nroConocimiento: formData.nroConocimiento || operationData.nroConocimiento,
        estado: "Documentacion Pendiente",
      };

      await actualizarOperacion(operationData.id, updateData);

      toast.current?.show({
        severity: "success",
        summary: "¡Operación guardada con éxito!",
        detail: "Los datos han sido actualizados correctamente",
        life: 3000,
      });

      setTimeout(() => {
        onRefreshOperations();
      }, 1000);
    } catch (error) {
      console.error("Error actualizando operación:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo actualizar la operación",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarYEnviarCorreo = async () => {
    // Validar que al menos un campo tenga datos
    if (!formData.nroDUA.trim() && !formData.tipoConocimientoId && !formData.nroConocimiento.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Validación",
        detail: "Debe completar al menos un campo para guardar",
        life: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        ...operationData,
        nroDUA: formData.nroDUA || operationData.nroDUA,
        tipoConocimientoId: formData.tipoConocimientoId || operationData.tipoConocimientoId,
        nroConocimiento: formData.nroConocimiento || operationData.nroConocimiento,
        estado: "Documentacion Pendiente",
      };

      await actualizarOperacion(operationData.id, updateData);

      // Mostrar confirmación de envío de correo
      setLoading(false);
      
      confirmDialog({
        message: (
          <div className="opd-confirm-message">
            <i className="pi pi-check-circle" style={{ fontSize: '3rem', color: '#00e0b0' }} />
            <h3>Operación Guardada con Éxito</h3>
            <p>¿Desea enviar el correo de notificación de tipo Liquidación al cliente ahora?</p>
          </div>
        ),
        header: " ",
        icon: " ",
        acceptLabel: "Enviar Correo",
        rejectLabel: "Omitir por ahora",
        acceptClassName: "opd-btn-submit",
        rejectClassName: "opd-btn-cancel",
        accept: () => {
          // TODO: Implementar lógica de envío de correo
          toast.current?.show({
            severity: "info",
            summary: "Correo enviado",
            detail: "El correo de notificación ha sido enviado al cliente",
            life: 3000,
          });
          setTimeout(() => {
            onRefreshOperations();
          }, 1000);
        },
        reject: () => {
          toast.current?.show({
            severity: "info",
            summary: "Operación guardada",
            detail: "La operación se guardó sin enviar notificación",
            life: 3000,
          });
          setTimeout(() => {
            onRefreshOperations();
          }, 1000);
        },
      });
    } catch (error) {
      console.error("Error actualizando operación:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo actualizar la operación",
        life: 3000,
      });
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onHide();
  };

  // =========================
  // UI
  // =========================

  const dialogHeader = (
    <div className="opd-dialog-header">
      <div className="opd-header-icon opd-header-icon-update">
        <i className="pi pi-pencil" />
      </div>
      <div>
        <h2 className="opd-header-title">Actualizar Datos</h2>
        <p className="opd-header-subtitle">
          Operación: {operationData?.nroCarpeta || "—"} | Cliente: {operationData?.cliente?.razonSocial || "—"}
        </p>
      </div>
    </div>
  );

  const dialogFooter = (
    <div className="opd-footer opd-footer-update">
      <Button
        label="Cancelar"
        className="opd-btn-cancel"
        onClick={handleCancel}
        disabled={loading}
      />
      <Button
        label="Guardar"
        icon="pi pi-save"
        className="opd-btn-save"
        onClick={handleGuardar}
        loading={loading}
      />
      <Button
        label="Guardar y Enviar Correo"
        icon="pi pi-send"
        className="opd-btn-submit"
        onClick={handleGuardarYEnviarCorreo}
        loading={loading}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />
      <Dialog
        visible={visible}
        onHide={handleCancel}
        header={dialogHeader}
        footer={dialogFooter}
        className="opd-dialog opd-dialog-update"
        modal
        style={{ width: "600px" }}
        dismissableMask={false}
      >
        <div className="opd-content">
          {/* Información de la Operación */}
          <div className="opd-info-section">
            <div className="opd-info-grid">
              <div className="opd-info-item">
                <span className="opd-info-label">CLIENTE</span>
                <span className="opd-info-value">{operationData?.cliente?.razonSocial || "—"}</span>
              </div>
              <div className="opd-info-item">
                <span className="opd-info-label">NRO. CARPETA</span>
                <span className="opd-info-value">{operationData?.nroCarpeta || "—"}</span>
              </div>
              <div className="opd-info-item">
                <span className="opd-info-label">TIPO OPERACIÓN</span>
                <span className="opd-info-value">{operationData?.tipoOperacion?.nombre || "—"}</span>
              </div>
            </div>
          </div>

          {/* Estado Badge */}
          <div className="opd-estado-badge opd-estado-badge-warning">
            <i className="pi pi-circle-fill" />
            <span>ESTADO: DOCUMENTACIÓN PENDIENTE</span>
          </div>

          {/* Número DUA */}
          <div className="opd-field">
            <label htmlFor="nroDUA" className="opd-label">
              Nro. DUA
            </label>
            <InputText
              id="nroDUA"
              value={formData.nroDUA}
              onChange={(e) => setFormData({ ...formData, nroDUA: e.target.value })}
              placeholder="Ej: TN-2024-D-054461"
              className="opd-input"
            />
            <small className="opd-field-help">
              Este campo es requerido para la liquidación de la operación
            </small>
          </div>

          {/* Tipo de Conocimiento */}
          <div className="opd-field">
            <label htmlFor="tipoConocimiento" className="opd-label">
              Tipo de Conocimiento
            </label>
            <Dropdown
              id="tipoConocimiento"
              value={formData.tipoConocimientoId}
              options={tiposConocimiento}
              onChange={(e) => setFormData({ ...formData, tipoConocimientoId: e.value })}
              placeholder="Seleccionar Tipo..."
              className="opd-dropdown"
            />
          </div>

          {/* Número de Conocimiento */}
          <div className="opd-field">
            <label htmlFor="nroConocimiento" className="opd-label">
              Nro. de Conocimiento
            </label>
            <InputText
              id="nroConocimiento"
              value={formData.nroConocimiento}
              onChange={(e) => setFormData({ ...formData, nroConocimiento: e.target.value })}
              placeholder="Ej: Número de factura de cargamento"
              className="opd-input"
            />
            <small className="opd-field-help">
              Los datos se pueden completar uno o todos al mismo tiempo
            </small>
          </div>
        </div>
      </Dialog>
    </>
  );
}