import { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { subirFactura, eliminarFactura } from "../../services/facturaService";
import { obtenerLiquidacionPorOperacion } from "../../services/liquidacionService";
import "../../components/operations/OperationDialogs.css";
import "./DetalleLiquidacionDialog.css";

export default function DetalleLiquidacionDialog({
  visible,
  onHide,
  operacionId,
  nroCarpeta,
}) {
  const toast = useRef(null);

  const [liquidacion, setLiquidacion] = useState(null);
  const [loadingLiq, setLoadingLiq] = useState(false);
  const [subiendoFactura, setSubiendoFactura] = useState(false);
  const [eliminandoFactura, setEliminandoFactura] = useState(false);
  const fileInputRef = useRef(null);

  // ── Cargar liquidación cuando se abre el diálogo ───────────────
  useEffect(() => {
    if (visible && operacionId) {
      cargarLiquidacion();
    }
  }, [visible, operacionId]);

  const cargarLiquidacion = async () => {
    setLoadingLiq(true);
    try {
      const data = await obtenerLiquidacionPorOperacion(operacionId);
      setLiquidacion(data ?? null); 
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo cargar la liquidación.",
        life: 4000,
      });
    } finally {
      setLoadingLiq(false);
    }
  };

  // ── Subir factura ──────────────────────────────────────────────
  const handleSeleccionarArchivo = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    if (archivo.type !== "application/pdf") {
      toast.current?.show({
        severity: "warn",
        summary: "Formato incorrecto",
        detail: "Solo se permiten archivos PDF.",
        life: 3500,
      });
      return;
    }

    handleSubirFactura(archivo);
  };

  const handleSubirFactura = async (archivo) => {
    setSubiendoFactura(true);
    try {
      await subirFactura(liquidacion.id, archivo);
      toast.current?.show({
        severity: "success",
        summary: "Factura subida",
        detail: "La factura fue cargada correctamente.",
        life: 3000,
      });
      await cargarLiquidacion();
    } catch (error) {
      const mensajeBackend = error.response?.data?.mensaje;
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: mensajeBackend || "No se pudo subir la factura.",
        life: 4000,
      });
    } finally {
      setSubiendoFactura(false);
      // Limpiar el input para permitir subir el mismo archivo de nuevo si fuera necesario
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Eliminar factura ───────────────────────────────────────────
  const handleEliminarFactura = async () => {
    if (!liquidacion?.factura?.id) return;
    setEliminandoFactura(true);
    try {
      await eliminarFactura(liquidacion.factura.id);
      toast.current?.show({
        severity: "success",
        summary: "Factura eliminada",
        detail: "La factura fue eliminada correctamente.",
        life: 3000,
      });
      await cargarLiquidacion();
    } catch (error) {
      const mensajeBackend = error.response?.data?.mensaje;
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: mensajeBackend || "No se pudo eliminar la factura.",
        life: 4000,
      });
    } finally {
      setEliminandoFactura(false);
    }
  };

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
      case "Pagado": return "det-badge-pagado";
      case "Parcialmente pagado": return "det-badge-parcial";
      default: return "det-badge-pendiente";
    }
  };

  // ── Header del diálogo ─────────────────────────────────────────
  const dialogHeader = (
    <div className="opd-dialog-header">
      <div className="opd-header-icon liq-header-icon">
        <i className="pi pi-dollar" />
      </div>
      <div>
        <h2 className="opd-header-title">Detalle de Liquidación</h2>
        <p className="opd-header-subtitle">
          {nroCarpeta ? `Carpeta Nº ${nroCarpeta}` : "Información de la liquidación"}
        </p>
      </div>
    </div>
  );

  // ── Footer del diálogo ─────────────────────────────────────────
  const dialogFooter = (
    <div className="opd-footer opd-footer-update" style={{ justifyContent: "flex-end" }}>
      <Button
        label="Cerrar"
        className="opd-btn-cancel"
        onClick={onHide}
      />
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────
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
      >
        <div className="opd-content">

          {/* ── Estado de carga ────────────────────────────────── */}
          {loadingLiq && (
            <div className="det-loading">
              <i className="pi pi-spin pi-spinner" />
              <span>Cargando liquidación...</span>
            </div>
          )}

          {/* ── Sin liquidación ────────────────────────────────── */}
          {!loadingLiq && !liquidacion && (
            <div className="det-empty">
              <i className="pi pi-inbox det-empty-icon" />
              <p className="det-empty-title">Sin liquidación registrada</p>
              <p className="det-empty-sub">
                Esta operación todavía no tiene una liquidación creada.
              </p>
            </div>
          )}

          {/* ── Contenido principal ────────────────────────────── */}
          {!loadingLiq && liquidacion && (
            <>
              {/* Datos generales */}
              <div className="opd-info-section">
                <div className="opd-info-grid">
                  <div className="opd-info-item">
                    <span className="opd-info-label">Fecha de envío</span>
                    <span className="opd-info-value">{formatFecha(liquidacion.fechaEnvio)}</span>
                  </div>
                  <div className="opd-info-item">
                    <span className="opd-info-label">Fecha de vencimiento</span>
                    <span className="opd-info-value">{formatFecha(liquidacion.fechaVenc)}</span>
                  </div>
                  <div className="opd-info-item">
                    <span className="opd-info-label">Monto total</span>
                    <span className="opd-info-value det-monto-total">
                      {formatMonto(liquidacion.montoTotal)}
                    </span>
                  </div>
                  <div className="opd-info-item">
                    <span className="opd-info-label">Saldo pendiente</span>
                    <span className="opd-info-value det-monto-saldo">
                      {formatMonto(liquidacion.saldoPendiente)}
                    </span>
                  </div>
                </div>

                {/* Badge de estado */}
                <div style={{ marginTop: "14px" }}>
                  <span className={`det-badge ${estadoColor(liquidacion.estado)}`}>
                    {liquidacion.estado}
                  </span>
                </div>
              </div>

              {/* Ítems del detalle */}
              <div className="liq-detalle-section">
                <div className="liq-detalle-header">
                  <span className="opd-label">Ítems de la liquidación</span>
                </div>

                <div className="liq-detalle-lista">
                  {liquidacion.detalle?.map((item, index) => (
                    <div key={index} className="liq-detalle-fila">
                      <div className="liq-item-numero">{index + 1}</div>
                      <div className="liq-detalle-descripcion">
                        <span className="det-item-desc">{item.descripcion}</span>
                      </div>
                      <div className="det-item-monto">
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

              {/* Sección de factura */}
              <div className="det-factura-section">
                <div className="det-factura-header">
                  <i className="pi pi-file-pdf det-factura-icon" />
                  <span className="opd-label">Factura</span>
                </div>

                {/* Sin factura → mostrar botón para subir */}
                {!liquidacion.factura && (
                  <div className="det-factura-vacia">
                    <p className="det-factura-vacia-text">
                      No hay factura cargada para esta liquidación.
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      style={{ display: "none" }}
                      onChange={handleSeleccionarArchivo}
                    />
                    <Button
                      label={subiendoFactura ? "Subiendo..." : "Subir factura PDF"}
                      icon="pi pi-upload"
                      className="det-btn-subir"
                      onClick={() => fileInputRef.current?.click()}
                      loading={subiendoFactura}
                      disabled={subiendoFactura}
                    />
                  </div>
                )}

                {/* Con factura → mostrar datos y opción de eliminar */}
                {liquidacion.factura && (
                  <div className="det-factura-info">
                    <div className="det-factura-dato">
                      <i className="pi pi-check-circle det-factura-check" />
                      <div>
                        <span className="det-factura-label">Archivo cargado</span>
                        <span className="det-factura-nombre">
                          {liquidacion.factura.rutaArchivo?.split(/[\\/]/).pop() ?? "factura.pdf"}
                        </span>
                      </div>
                    </div>
                    <div className="det-factura-dato">
                      <i className="pi pi-calendar" style={{ color: "#6b7591" }} />
                      <div>
                        <span className="det-factura-label">Fecha de carga</span>
                        <span className="det-factura-valor">
                          {formatFecha(liquidacion.factura.fechaCarga)}
                        </span>
                      </div>
                    </div>
                    <Button
                      icon="pi pi-trash"
                      label={eliminandoFactura ? "Eliminando..." : "Eliminar factura"}
                      className="det-btn-eliminar-factura"
                      onClick={handleEliminarFactura}
                      loading={eliminandoFactura}
                      disabled={eliminandoFactura}
                      text
                    />
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </Dialog>
    </>
  );
}
