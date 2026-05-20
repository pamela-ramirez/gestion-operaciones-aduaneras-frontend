import { useState, useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import { crearLiquidacion } from "../../services/liquidacionService";
import "../../components/operations/OperationDialogs.css";
import "./RegistrarLiquidacionDialog.css";

// ─── Detalle vacío reutilizable ───────────────────────────────────────────────
const nuevoDetalle = () => ({ descripcion: "", monto: null });

export default function RegistrarLiquidacionDialog({
  visible,
  onHide,
  operacionId,
  nroCarpeta,
  onSuccess,
}) {
  const toast = useRef(null);

  // ── Estado del formulario ──────────────────────────────────────────────────
  const [detalles, setDetalles] = useState([nuevoDetalle()]);
  const [fechaVenc, setFechaVenc] = useState(null);
  const [loading, setLoading] = useState(false);

  // Resetear el formulario cada vez que se abre el dialog
  useEffect(() => {
    if (visible) {
      setDetalles([nuevoDetalle()]);
      setFechaVenc(null);
    }
  }, [visible]);

  // ── Total calculado automáticamente ───────────────────────────────────────
  const totalMonto = detalles.reduce(
    (acc, d) => acc + (d.monto ?? 0),
    0
  );

  // ── Handlers de detalles ──────────────────────────────────────────────────
  const handleAgregarDetalle = () => {
    setDetalles([...detalles, nuevoDetalle()]);
  };

  const handleEliminarDetalle = (index) => {
    if (detalles.length === 1) return; // siempre debe haber al menos 1
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const handleCambioDetalle = (index, campo, valor) => {
    const copia = [...detalles];
    copia[index] = { ...copia[index], [campo]: valor };
    setDetalles(copia);
  };

  // ── Validación ─────────────────────────────────────────────────────────────
  const validar = () => {
    for (let i = 0; i < detalles.length; i++) {
      if (!detalles[i].descripcion.trim()) {
        toast.current?.show({
          severity: "warn",
          summary: "Validación",
          detail: `La descripción del ítem ${i + 1} es obligatoria`,
          life: 3500,
        });
        return false;
      }
      if (detalles[i].monto === null || detalles[i].monto <= 0) {
        toast.current?.show({
          severity: "warn",
          summary: "Validación",
          detail: `El monto del ítem ${i + 1} debe ser mayor a 0`,
          life: 3500,
        });
        return false;
      }
    }
    return true;
  };

  // ── Guardar ────────────────────────────────────────────────────────────────
  const handleGuardar = async () => {
    if (!validar()) return;

    setLoading(true);
    try {
      const payload = {
        operacionId,
        detalle: detalles.map((d) => ({
          descripcion: d.descripcion.trim(),
          monto: d.monto,
        })),
        fechaVenc: fechaVenc
          ? fechaVenc.toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      await crearLiquidacion(payload);

      toast.current?.show({
        severity: "success",
        summary: "Liquidación registrada",
        detail: "La liquidación fue creada correctamente",
        life: 3000,
      });

      setTimeout(() => {
        onSuccess?.();
        onHide();
      }, 1200);

    } catch (error) {
      const mensajeBackend = error.response?.data?.mensaje;

      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: mensajeBackend || "No se pudo registrar la liquidación. Intente nuevamente.",
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCerrar = () => {
    onHide();
  };

  // ── Header del dialog ──────────────────────────────────────────────────────
  const dialogHeader = (
    <div className="opd-dialog-header">
      <div className="opd-header-icon liq-header-icon">
        <i className="pi pi-dollar" />
      </div>
      <div>
        <h2 className="opd-header-title">Registrar Liquidación</h2>
        <p className="opd-header-subtitle">
          {nroCarpeta ? `Carpeta Nº ${nroCarpeta}` : "Nueva liquidación para la operación"}
        </p>
      </div>
    </div>
  );

  // ── Footer del dialog ──────────────────────────────────────────────────────
  const dialogFooter = (
    <div className="opd-footer opd-footer-update">
      {/* Total a la izquierda */}
      <div className="liq-total-footer">
        <span className="liq-total-label">TOTAL</span>
        <span className="liq-total-valor">
          ${totalMonto.toLocaleString("es-UY", { minimumFractionDigits: 2 })}
        </span>
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        <Button
          label="Cancelar"
          className="opd-btn-cancel"
          onClick={handleCerrar}
          disabled={loading}
        />
        <Button
          label={loading ? "Guardando..." : "Registrar Liquidación"}
          icon="pi pi-check"
          className="liq-btn-guardar"
          onClick={handleGuardar}
          loading={loading}
        />
      </div>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={handleCerrar}
        header={dialogHeader}
        footer={dialogFooter}
        className="opd-dialog liq-dialog"
        style={{ width: "580px" }}
        modal
        draggable={false}
        resizable={false}
      >
        <div className="opd-content">

          {/* ── Fecha de vencimiento ─────────────────────────────── */}
          <div className="opd-field">
            <label className="opd-label">
              Fecha de Vencimiento{" "}
              <span style={{ fontSize: "11px", color: "#4a5270", fontWeight: 400 }}>
                (opcional — por defecto 30 días)
              </span>
            </label>
            <Calendar
              value={fechaVenc}
              onChange={(e) => setFechaVenc(e.value)}
              dateFormat="dd/mm/yy"
              placeholder="Seleccioná una fecha"
              minDate={new Date()}
              showIcon
              className="liq-calendar"
              panelClassName="liq-calendar-panel"
            />
          </div>

          {/* ── Ítems de detalle ─────────────────────────────────── */}
          <div className="liq-detalle-section">
            <div className="liq-detalle-header">
              <span className="opd-label">
                Ítems de Liquidación <span className="opd-required">*</span>
              </span>
              <Button
                label="Agregar ítem"
                icon="pi pi-plus"
                className="liq-btn-agregar"
                onClick={handleAgregarDetalle}
                size="small"
              />
            </div>

            <div className="liq-detalle-lista">
              {detalles.map((detalle, index) => (
                <div key={index} className="liq-detalle-fila">
                  {/* Número de ítem */}
                  <div className="liq-item-numero">{index + 1}</div>

                  {/* Descripción */}
                  <div className="liq-detalle-descripcion">
                    <InputText
                      value={detalle.descripcion}
                      onChange={(e) =>
                        handleCambioDetalle(index, "descripcion", e.target.value)
                      }
                      placeholder="Descripción del concepto"
                      className="opd-input liq-input"
                    />
                  </div>

                  {/* Monto */}
                  <div className="liq-detalle-monto">
                    <InputNumber
                      value={detalle.monto}
                      onValueChange={(e) =>
                        handleCambioDetalle(index, "monto", e.value)
                      }
                      mode="decimal"
                      minFractionDigits={2}
                      maxFractionDigits={2}
                      min={0}
                      placeholder="0.00"
                      className="liq-input-number"
                      inputClassName="opd-input"
                    />
                  </div>

                  {/* Botón eliminar fila */}
                  <Button
                    icon="pi pi-trash"
                    rounded
                    text
                    className="liq-btn-eliminar-fila"
                    onClick={() => handleEliminarDetalle(index)}
                    disabled={detalles.length === 1}
                    tooltip="Eliminar ítem"
                    tooltipOptions={{ position: "top" }}
                  />
                </div>
              ))}
            </div>

            {/* Subtotal dentro del listado */}
            <div className="liq-subtotal-row">
              <span className="liq-subtotal-label">Subtotal</span>
              <span className="liq-subtotal-valor">
                ${totalMonto.toLocaleString("es-UY", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

        </div>
      </Dialog>
    </>
  );
}
