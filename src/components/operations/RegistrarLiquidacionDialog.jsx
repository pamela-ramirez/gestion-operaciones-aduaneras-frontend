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

// ─── Ítems que se precargan por defecto al abrir el formulario ────────────────
const detallesPorDefecto = () => [
  { descripcion: "Honorarios", monto: 0 },
  { descripcion: "Gastos operativos", monto: 0 },
];

// ─── Detalle vacío para cuando el usuario agrega uno nuevo ───────────────────
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
  const [detalles, setDetalles] = useState(detallesPorDefecto());
  const [fechaVenc, setFechaVenc] = useState(null);
  const [loading, setLoading] = useState(false);

  // Resetear el formulario con los ítems por defecto cada vez que se abre
  useEffect(() => {
    if (visible) {
      setDetalles(detallesPorDefecto());
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
    // Siempre debe quedar al menos 1 ítem
    if (detalles.length === 1) {
      toast.current?.show({
        severity: "warn",
        summary: "Atención",
        detail: "Debe haber al menos un ítem en la liquidación.",
        life: 3000,
      });
      return;
    }
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
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <p className="opd-header-subtitle">
            {nroCarpeta ? `Carpeta Nº ${nroCarpeta}` : "Nueva liquidación para la operación"}
          </p>
          {/* Badge de moneda */}
          <span className="liq-badge-moneda">🇺🇸 USD</span>
        </div>
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
          USD {totalMonto.toLocaleString("es-UY", { minimumFractionDigits: 2 })}
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
          label={loading ? "Guardando..." : "Guardar liquidación"}
          className="liq-btn-guardar"
          onClick={handleGuardar}
          disabled={loading}
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
        style={{ width: "580px" }}
        className="opd-dialog"
        modal
        closable={!loading}
      >
        <div className="opd-form">

          {/* Fecha de vencimiento (opcional) */}
          <div className="opd-field">
            <label className="opd-label">
              Fecha de vencimiento <span className="opd-optional">(opcional — por defecto 30 días)</span>
            </label>
            <Calendar
              value={fechaVenc}
              onChange={(e) => setFechaVenc(e.value)}
              dateFormat="dd/mm/yy"
              placeholder="Seleccionar fecha"
              className="opd-calendar"
              minDate={new Date()}
              showIcon
            />
          </div>

          {/* Lista de ítems */}
          <div className="opd-field" style={{ marginTop: "16px" }}>
            <div className="liq-detalle-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <label className="opd-label">Ítems de la liquidación</label>
              <Button
                label="+ Agregar ítem"
                className="liq-btn-agregar"
                onClick={handleAgregarDetalle}
                disabled={loading}
              />
            </div>

            <div className="liq-detalle-lista">
              {detalles.map((detalle, index) => (
                <div key={index} className="liq-detalle-fila">
                  {/* Número del ítem */}
                  <div className="liq-item-numero">{index + 1}</div>

                  {/* Descripción */}
                  <InputText
                    value={detalle.descripcion}
                    onChange={(e) => handleCambioDetalle(index, "descripcion", e.target.value)}
                    placeholder="Descripción"
                    className="opd-input liq-input-descripcion"
                    disabled={loading}
                  />

                  {/* Monto */}
                  <InputNumber
                    value={detalle.monto === 0 ? null : detalle.monto}
                    onValueChange={(e) => handleCambioDetalle(index, "monto", e.value)}
                    placeholder="USD 0,00"
                    prefix="USD "
                    minFractionDigits={2}
                    maxFractionDigits={2}
                    locale="es-UY"
                    className="liq-input-monto"
                    disabled={loading}
                    min={0}
                  />

                  {/* Botón eliminar */}
                  <Button
                    icon="pi pi-trash"
                    className="liq-btn-eliminar-item p-button-text p-button-danger"
                    onClick={() => handleEliminarDetalle(index)}
                    disabled={loading}
                    tooltip="Eliminar ítem"
                    tooltipOptions={{ position: "top" }}
                  />
                </div>
              ))}
            </div>
          </div>

        </div>
      </Dialog>
    </>
  );
}
