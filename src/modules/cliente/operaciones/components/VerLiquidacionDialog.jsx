import { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { obtenerLiquidacionPorOperacion } from "../../../../services/operationService";
import "./VerLiquidacionDialog.css";

export default function VerLiquidacionDialog({
  visible,
  onHide,
  operacionId,
  nroCarpeta,
}) {
  const [liquidacion, setLiquidacion] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    if (visible && operacionId) {
      cargarLiquidacion();
    }
  }, [visible, operacionId]);

  const cargarLiquidacion = async () => {
    setLoading(true);
    try {
      const data = await obtenerLiquidacionPorOperacion(operacionId);
      setLiquidacion(data ? data : null);
    } catch (error) {
      console.error("Error al cargar la liquidación:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo cargar la liquidación.",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCerrar = () => {
    onHide();
  };

  // ── Header del diálogo ─────────────────────────────────────────
  const dialogHeader = (
    <div className="opd-dialog-header">
      <div className="opd-header-icon liq-header-icon">
        <i className="pi pi-dollar" />
      </div>
      <div>
        <h2 className="opd-header-title">Liquidación</h2>
        <p className="opd-header-subtitle">
          {nroCarpeta
            ? `Nro. de Carpeta: ${nroCarpeta}`
            : "Información de la liquidación"}
        </p>
      </div>
    </div>
  );

  // ── Footer del diálogo ─────────────────────────────────────────
  const dialogFooter = (
    <div
      className="opd-footer opd-footer-update"
      style={{ justifyContent: "flex-end" }}
    >
      <Button label="Cerrar" className="opd-btn-cancel" onClick={onHide} />
    </div>
  );

  // ── Helpers de formato ─────────────────────────────────────────
  const formatFecha = (fechaStr) => {
    if (!fechaStr) return "—";
    return new Date(fechaStr).toLocaleDateString("es-UY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatMonto = (monto) =>
    `$${Number(monto ?? 0).toLocaleString("es-UY", { minimumFractionDigits: 2 })}`;

  const estadoColor = (estado) => {
    switch (estado) {
      case "Pagado":
        return "det-badge-pagado";
      case "Parcialmente pagado":
        return "det-badge-parcial";
      default:
        return "det-badge-pendiente";
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={onHide}
        header={dialogHeader}
        footer={dialogFooter}
        className="opd-dialog det-dialog"
        style={{ width: "600px" }}
        modal
        draggable={false}
        resizable={false}
        dismissableMask={false}
      >
        <div className="opd-content">
          {/* ── Estado de carga ────────────────────────────────── */}
          {loading && (
            <div className="det-loading">
              <i className="pi pi-spin pi-spinner" />
              <span>Cargando liquidación...</span>
            </div>
          )}

          {/* ── Sin liquidación ────────────────────────────────── */}
          {!loading && !liquidacion && (
            <div className="det-empty">
              <i className="pi pi-inbox det-empty-icon" />
              <p className="det-empty-title">Sin liquidación registrada</p>
              <p className="det-empty-sub">
                Esta operación todavía no tiene una liquidación creada.
              </p>
            </div>
          )}

          {/* ── Contenido principal ────────────────────────────── */}
          {!loading && liquidacion && (
            <>
              {/* Datos generales */}
              <div className="opd-info-section">
                <div className="opd-info-grid">
                  {/* <div className="opd-info-item">
                    <span className="opd-info-label">Fecha de envío</span>
                    <span className="opd-info-value">{formatFecha(liquidacion.fechaEnvio)}</span>
                  </div> */}
                  <div className="opd-info-item">
                    <span className="opd-info-label">Fecha de vencimiento</span>
                    <span className="opd-info-value">
                      {formatFecha(liquidacion.fechaVenc)}
                    </span>
                  </div>
                  <div className="opd-info-item">
                    <span className="opd-info-label">Monto total</span>
                    <span className="opd-info-value det-monto-total">
                      {formatMonto(liquidacion.montoTotal)}
                    </span>
                  </div>
                  {/* <div className="opd-info-item">
                    <span className="opd-info-label">Saldo pendiente</span>
                    <span className="opd-info-value det-monto-saldo">
                      {formatMonto(liquidacion.saldoPendiente)}
                    </span>
                  </div> */}
                  {/* Badge de estado */}
                  <div style={{ marginTop: "14px" }}>
                    <span
                      className={`det-badge ${estadoColor(liquidacion.estado)}`}
                    >
                      Estado: {liquidacion.estado}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ítems del detalle */}
              <div className="liq-detalle-section">
                <div className="liq-detalle-header">
                  <span className="opd-label">Detalle de la liquidación</span>
                </div>

                <div className="liq-detalle-lista">
                  {liquidacion.detalle?.map((item, index) => (
                    <div key={index} className="liq-detalle-fila">
                      <div className="liq-item-numero">{index + 1}</div>
                      <div className="liq-detalle-descripcion">
                        <span className="det-detalle-descripcion">
                          {item.descripcion}
                        </span>
                      </div>
                      <div className="det-detalle-monto">
                        {formatMonto(item.monto)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="liq-subtotal-row">
                  <span className="liq-subtotal-label">TOTAL</span>
                  <span className="liq-subtotal-valor">
                    {formatMonto(liquidacion.montoTotal)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </Dialog>
    </>
  );
}
