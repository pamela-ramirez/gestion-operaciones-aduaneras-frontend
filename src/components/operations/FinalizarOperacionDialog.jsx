import { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import {
  obtenerOperacionPorId,
  finalizarOperacion,
} from "../../services/operationService";
import { obtenerUsuarioStorage } from "../../utils/auth";
import "./OperationDialogs.css";
import { Checkbox } from "primereact/checkbox";

export default function FinalizarOperacionDialog({
  visible,
  onHide,
  onRefreshOperations,
  operationData,
  liquidationData,
}) {
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [operacionCompleta, setOperacionCompleta] = useState(null);
  const [confirmado, setConfirmado] = useState(false);
  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    if (visible && operationData) {
      cargarDatosCompletos();
    } else {
      setOperacionCompleta(null);
      setConfirmado(false);
    }
  }, [visible, operationData]);

  // Actualizar liquidación cuando cambia el prop
  useEffect(() => {
    if (operacionCompleta && liquidationData) {
      setOperacionCompleta((prev) => ({
        ...prev,
        liquidacion: liquidationData,
      }));
    }
  }, [liquidationData]);

  const cargarDatosCompletos = async () => {
    setLoading(true);
    try {
      const data = await obtenerOperacionPorId(operationData.id);
      setOperacionCompleta({
        ...data,
        liquidacion: liquidationData || null,
      });
    } catch (error) {
      console.error("Error al cargar operación:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo cargar la información de la operación",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // VALIDACIÓN
  // =========================

  const validarOperacionParaFinalizar = () => {
    if (!operacionCompleta) return false;

    // Verificar que el estado sea "En proceso"
    if (operacionCompleta.estado !== "En proceso") {
      toast.current?.show({
        severity: "warn",
        summary: "Estado inválido",
        detail: "Solo se pueden finalizar operaciones en estado 'En proceso'",
        life: 4000,
      });
      return false;
    }

    // Verificar que la liquidación esté marcada como definitiva
    if (!operacionCompleta.liquidacion || !operacionCompleta.liquidacion.esDefinitiva) {
      toast.current?.show({
        severity: "error",
        summary: "Liquidación no definitiva",
        detail: "La liquidación debe estar marcada como definitiva antes de finalizar la operación",
        life: 5000,
      });
      return false;
    }

    // Verificar que todos los datos obligatorios estén completos
    const camposObligatorios = [
      { key: "nroCarpeta", label: "Nro. Carpeta" },
      { key: "nroDua", label: "Nro. DUA" },
      { key: "tipoConocimientoId", label: "Tipo de Conocimiento" },
      { key: "nroConocimiento", label: "Nro. de Conocimiento" },
      { key: "clienteId", label: "Cliente" },
      { key: "tipoOperacion", label: "Tipo de Operación" },
    ];

    const datosIncompletos = camposObligatorios
      .filter((campo) => !operacionCompleta[campo.key])
      .map((campo) => campo.label);

    if (datosIncompletos.length > 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Datos incompletos",
        detail: `Faltan completar: ${datosIncompletos.join(", ")}`,
        life: 5000,
      });
      return false;
    }

    return true;
  };

  // =========================
  // HANDLERS
  // =========================

  const handleConfirmarFinalizacion = async () => {
    // Validar antes de intentar finalizar
    if (!validarOperacionParaFinalizar()) {
      return;
    }

    setLoading(true);

    try {
      await finalizarOperacion(operacionCompleta.id);

      toast.current?.show({
        severity: "success",
        summary: "Operación finalizada",
        detail: "La operación fue finalizada correctamente",
        life: 3000,
      });

      setTimeout(() => {
        onRefreshOperations();
        handleCancel();
      }, 3000);
    } catch (error) {
      console.error("Error al finalizar operación:", error);

      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo finalizar la operación",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    //setOperacionCompleta(null);
    //setConfirmado(false);
    onHide();
  };

  // =========================
  // UI
  // =========================

  const dialogHeader = (
    <div className="opd-dialog-header">
      <div
        className="opd-header-icon"
        style={{
          background: "rgba(16, 185, 129, 0.12)",
          border: "1px solid rgba(16, 185, 129, 0.24)",
        }}
      >
        <i className="pi pi-check-circle" style={{ color: "#10b981" }} />
      </div>
      <div>
        <h2 className="opd-header-title">Finalizar Operación</h2>
        <p className="opd-header-subtitle">
          Revise todos los detalles antes de finalizar la operación
        </p>
      </div>
    </div>
  );

  const dialogFooter = (
    <div className="opd-footer">
      <Button
        label="Cancelar"
        className="opd-btn-cancel"
        onClick={handleCancel}
        disabled={loading}
      />
      <Button
        label="Finalizar Operación"
        icon="pi pi-check-circle"
        className="opd-btn-submit"
        onClick={handleConfirmarFinalizacion}
        loading={loading}
        disabled={!confirmado || loading || !operacionCompleta?.liquidacion?.esDefinitiva}
      />
    </div>
  );

  if (!operacionCompleta) {
    return null;
  }

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={handleCancel}
        header={dialogHeader}
        footer={dialogFooter}
        className="opd-dialog opd-dialog-finalizar"
        modal
        style={{ width: "700px" }}
        dismissableMask={false}
      >
        <div className="opd-content">
          {/* Estado Badge */}
          <div
            className="opd-estado-badge"
            style={{
              background:
                operacionCompleta.estado === "En proceso"
                  ? "rgba(59, 130, 246, 0.12)"
                  : "rgba(251, 191, 36, 0.12)",
              border:
                operacionCompleta.estado === "En proceso"
                  ? "1px solid rgba(59, 130, 246, 0.24)"
                  : "1px solid rgba(251, 191, 36, 0.24)",
            }}
          >
            <i
              className="pi pi-circle-fill"
              style={{
                color:
                  operacionCompleta.estado === "En proceso"
                    ? "#3b82f6"
                    : "#fbbf24",
              }}
            />
            <span
              style={{
                color:
                  operacionCompleta.estado === "En proceso"
                    ? "#3b82f6"
                    : "#fbbf24",
              }}
            >
              ESTADO: {operacionCompleta.estado || "—"}
            </span>
          </div>

          {/* Estado de la liquidación */}
          <div
            className="opd-estado-badge"
            style={{
              background: operacionCompleta.liquidacion?.esDefinitiva
                ? "rgba(16, 185, 129, 0.12)"
                : "rgba(239, 68, 68, 0.12)",
              border: operacionCompleta.liquidacion?.esDefinitiva
                ? "1px solid rgba(16, 185, 129, 0.24)"
                : "1px solid rgba(239, 68, 68, 0.24)",
              marginTop: "12px",
            }}
          >
            <i
              className={`pi ${operacionCompleta.liquidacion?.esDefinitiva ? "pi-lock" : "pi-lock-open"}`}
              style={{
                color: operacionCompleta.liquidacion?.esDefinitiva
                  ? "#10b981"
                  : "#ef4444",
              }}
            />
            <span
              style={{
                color: operacionCompleta.liquidacion?.esDefinitiva
                  ? "#10b981"
                  : "#ef4444",
              }}
            >
              LIQUIDACIÓN: {operacionCompleta.liquidacion?.esDefinitiva ? "DEFINITIVA" : "PENDIENTE"}
            </span>
          </div>

          {/* Título de sección */}
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "#00e0b0",
              marginTop: "16px",
              marginBottom: "12px",
            }}
          >
            DATOS DE LA OPERACIÓN
          </div>

          {/* Grid de información - Datos Principales */}
          <div className="opd-info-section">
            <div
              className="opd-info-grid"
              style={{
                gridTemplateColumns: "repeat(2, 1fr)",
              }}
            >
              <div className="opd-info-item">
                <span className="opd-info-label">NRO. CARPETA</span>
                <span className="opd-info-value">
                  {operacionCompleta.nroCarpeta || "—"}
                </span>
              </div>

              <div className="opd-info-item">
                <span className="opd-info-label">NRO. DUA</span>
                <span className="opd-info-value">
                  {operacionCompleta.nroDua || "—"}
                </span>
              </div>

              <div className="opd-info-item">
                <span className="opd-info-label">CLIENTE</span>
                <span className="opd-info-value">
                  {operacionCompleta.razonSocialCliente || "—"}
                </span>
              </div>

              <div className="opd-info-item">
                <span className="opd-info-label">TIPO OPERACIÓN</span>
                <span className="opd-info-value">
                  {operacionCompleta.tipoOperacion || "—"}
                </span>
              </div>

              <div className="opd-info-item">
                <span className="opd-info-label">TIPO CONOCIMIENTO</span>
                <span className="opd-info-value">
                  {operacionCompleta.tipoConocimiento || "—"}
                </span>
              </div>

              <div className="opd-info-item">
                <span className="opd-info-label">NRO. CONOCIMIENTO</span>
                <span className="opd-info-value">
                  {operacionCompleta.nroConocimiento || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Información adicional si existe */}
          {operacionCompleta.fechaRegistro && (
            <div className="opd-info-section" style={{ marginTop: "16px" }}>
              <div
                className="opd-info-grid"
                style={{
                  gridTemplateColumns: "repeat(2, 1fr)",
                }}
              >
                {operacionCompleta.fechaRegistro && (
                  <div className="opd-info-item">
                    <span className="opd-info-label">FECHA REGISTRO</span>
                    <span className="opd-info-value">
                      {new Date(
                        operacionCompleta.fechaRegistro,
                      ).toLocaleDateString("es-UY", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}

                {/* {operacionCompleta.fechaFinalizacion && (
                  <div className="opd-info-item" style={{
                    gridColumn: "1 / -1"
                  }}>
                    <span className="opd-info-label">FECHA FINALIZACION</span>
                    <span className="opd-info-value">
                      {operacionCompleta.fechaFinalizacion ? new Date(operacionCompleta.fechaFinalizacion).toLocaleDateString('es-UY', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      }) : "—"}
                    </span>
                  </div>
                )} */}
              </div>
            </div>
          )}

          {/* Mensaje de advertencia */}
          <div className="opd-warning-box">
            <div className="opd-warning-header">
              <i className="pi pi-exclamation-triangle" />
              <span>ATENCIÓN</span>
            </div>

            <p className="opd-warning-text">
              Al finalizar esta operación no se permitirán modificaciones
              adicionales ni carga de nuevos documentos sin previa auditoría del
              administrador.
            </p>

            <div className="opd-checkbox-container">
              <Checkbox
                inputId="confirmacionFinalizacion"
                checked={confirmado}
                onChange={(e) => setConfirmado(e.checked)}
              />

              <label htmlFor="confirmacionFinalizacion">
                Confirmo que revisé toda la información y deseo finalizar la
                operación.
              </label>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
