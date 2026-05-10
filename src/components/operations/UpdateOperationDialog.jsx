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
  operationData,
}) {
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [tiposConocimiento, setTiposConocimiento] = useState([]);

  const [formData, setFormData] = useState({
    nroDua: "",
    tipoConocimientoId: null,
    nroConocimiento: null,
  });

  // =========================
  // VALIDACIÓN
  // =========================

  const estanTodosLosCamposCompletos =
    formData.nroDua.trim() !== "" &&
    formData.tipoConocimientoId !== null &&
    formData.nroConocimiento !== null;

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    if (visible && operationData) {
      cargarTiposConocimiento();
      setFormData({
        nroDua: operationData.nroDua || "",
        tipoConocimientoId: operationData.tipoConocimientoId || null,
        nroConocimiento: operationData.nroConocimiento || null,
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
      nroDua: "",
      tipoConocimientoId: null,
      nroConocimiento: null,
    });
  };

  // =========================
  // HANDLERS
  // =========================

  const handleGuardar = async () => {
    // Validar que al menos un campo tenga datos

    if (
      !formData.nroDua.trim() &&
      !formData.tipoConocimientoId &&
      !formData.nroConocimiento
    ) {
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

        nroDua: formData.nroDua || operationData.nroDua,

        tipoConocimientoId:
          formData.tipoConocimientoId || operationData.tipoConocimientoId,

        nroConocimiento:
          formData.nroConocimiento || operationData.nroConocimiento,

        /* estado: estanTodosLosCamposCompletos
          ? "En Proceso"
          : operationData.estado, */
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
    // Validar que estén completos los 3 campos

    if (!estanTodosLosCamposCompletos) {
      toast.current?.show({
        severity: "warn",
        summary: "Validación",
        detail:
          "Debe completar Nro. DUA, Tipo de Conocimiento y Nro. de Conocimiento",
        life: 3000,
      });

      return;
    }

    setLoading(true);

    try {
      const updateData = {
        ...operationData,

        nroDua: formData.nroDua || operationData.nroDua,

        tipoConocimientoId:
          formData.tipoConocimientoId || operationData.tipoConocimientoId,

        nroConocimiento:
          formData.nroConocimiento || operationData.nroConocimiento,

        //estado: operationData.estado || "En Proceso",
      };

      await actualizarOperacion(operationData.id, updateData);

      setLoading(false);

      confirmDialog({
        message: (
          <div className="opd-confirm-message">
            <i
              className="pi pi-check-circle"
              style={{
                fontSize: "3rem",
                color: "#00e0b0",
              }}
            />

            <h3>Operación Guardada con Éxito</h3>

            <p>
              ¿Desea enviar el correo de notificación de tipo Liquidación al
              cliente ahora?
            </p>
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
          Complete los campos que desea actualizar para esta operación
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
        disabled={!estanTodosLosCamposCompletos}
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
                <span className="opd-info-value">
                  {operationData?.razonSocialCliente || "—"}
                </span>
              </div>
              <div className="opd-info-item">
                <span className="opd-info-label">NRO. CARPETA</span>
                <span className="opd-info-value">
                  {operationData?.nroCarpeta || "—"}
                </span>
              </div>
              <div className="opd-info-item">
                <span className="opd-info-label">TIPO OPERACIÓN</span>
                <span className="opd-info-value">
                  {operationData?.tipoOperacion || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Estado Badge */}
          <div className="opd-estado-badge opd-estado-badge-warning">
            <i className="pi pi-circle-fill" />
            <span>ESTADO: {operationData?.estado || "—"}</span>
          </div>

          {/* Número DUA */}
          <div className="opd-field">
            <label htmlFor="nroDua" className="opd-label">
              Nro. DUA
            </label>
            <InputText
              id="nroDua"
              value={formData.nroDua}
              onChange={(e) =>
                setFormData({ ...formData, nroDua: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, tipoConocimientoId: e.value })
              }
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
              /*  onChange={(e) =>
                setFormData({ ...formData, nroConocimiento: e.target.value })
              } */
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nroConocimiento:
                    e.target.value === "" ? null : parseInt(e.target.value, 10),
                })
              }
              keyfilter="int" // Permite solo números enteros
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
