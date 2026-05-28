import { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import {
  obtenerDocumentosPorOperacion,
  obtenerLiquidacionPorOperacion,
} from "../../services/operationService";
import "./DetalleOperacionDialog.css";

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatFecha = (fecha) => {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatMonto = (monto) =>
  `$${(monto ?? 0).toLocaleString("es-UY", { minimumFractionDigits: 2 })}`;

const iconoPorFormato = (formato) => {
  if (!formato) return "pi pi-file";
  const f = formato.toUpperCase();
  if (f === "PDF") return "pi pi-file-pdf";
  if (f === "JPG" || f === "PNG" || f === "JPEG") return "pi pi-image";
  if (f === "XLSX" || f === "XLS") return "pi pi-file-excel";
  return "pi pi-file";
};

// Devuelve clase CSS y etiqueta para cada estado de operación
const estadoConfig = (estado) => {
  switch (estado) {
    case "Finalizado":
      return { clase: "det-badge-finalizado", label: "Finalizado" };
    case "En proceso":
      return { clase: "det-badge-en-proceso", label: "En proceso" };
    case "Iniciado":
      return { clase: "det-badge-iniciado", label: "Iniciado" };
    default:
      return { clase: "det-badge-pendiente", label: estado ?? "—" };
  }
};

const estadoLiqConfig = (estado) => {
  switch (estado) {
    case "Pagado":
      return { clase: "det-badge-finalizado", label: "Pagado" };
    case "Parcialmente pagado":
      return { clase: "det-badge-en-proceso", label: "Parcialmente pagado" };
    default:
      return { clase: "det-badge-pendiente", label: estado ?? "Pendiente" };
  }
};

// ── Componente principal ──────────────────────────────────────────────────────

export default function DetalleOperacionDialog({ visible, onHide, operationData }) {
  const toast = useRef(null);

  const [documentos, setDocumentos] = useState([]);
  const [liquidacion, setLiquidacion] = useState(null);
  const [cargandoDocs, setCargandoDocs] = useState(false);
  const [cargandoLiq, setCargandoLiq] = useState(false);

  // Cargamos documentos y liquidación cada vez que se abre el dialog
  useEffect(() => {
    if (visible && operationData?.id) {
      cargarDocumentos(operationData.id);
      cargarLiquidacion(operationData.id);
    }
    // Limpiamos al cerrar
    if (!visible) {
      setDocumentos([]);
      setLiquidacion(null);
    }
  }, [visible, operationData?.id]);

  const cargarDocumentos = async (id) => {
    setCargandoDocs(true);
    try {
      const data = await obtenerDocumentosPorOperacion(id);
      setDocumentos(Array.isArray(data) ? data : []);
    } catch {
      toast.current?.show({
        severity: "warn",
        summary: "Documentos",
        detail: "No se pudieron cargar los documentos.",
        life: 3000,
      });
    } finally {
      setCargandoDocs(false);
    }
  };

  const cargarLiquidacion = async (id) => {
    setCargandoLiq(true);
    try {
      const data = await obtenerLiquidacionPorOperacion(id);
      setLiquidacion(data ?? null);
    } catch {
      // Si no tiene liquidación (404) simplemente dejamos null, no es un error grave
      setLiquidacion(null);
    } finally {
      setCargandoLiq(false);
    }
  };

  const handleDescargar = async (doc) => {
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}/${doc.rutaArchivo}`;
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = doc.nombre;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo descargar el documento.",
        life: 3000,
      });
    }
  };

  // No renderizamos nada si no hay datos
  if (!operationData) return null;

  const { clase: estadoClase, label: estadoLabel } = estadoConfig(operationData.estado);

  // ── Header del dialog ────────────────────────────────────────────────────────
  const dialogHeader = (
    <div className="opd-dialog-header">
      <div className="opd-header-icon det-header-icon">
        <i className="pi pi-folder-open" />
      </div>
      <div>
        <h2 className="opd-header-title">Detalle de Operación</h2>
        <p className="opd-header-subtitle">
          Carpeta {operationData.nroCarpeta} — información completa
        </p>
      </div>
      {/* Badge de estado en el encabezado */}
      <span className={`det-estado-badge ${estadoClase}`} style={{ marginLeft: "auto" }}>
        {estadoLabel}
      </span>
    </div>
  );

  // ── Footer del dialog ────────────────────────────────────────────────────────
  const dialogFooter = (
    <div className="opd-footer">
      <Button label="Cerrar" className="opd-btn-cancel" onClick={onHide} />
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={onHide}
        header={dialogHeader}
        footer={dialogFooter}
        className="opd-dialog det-dialog"
        modal
        maximized
        dismissableMask={false}
      >
        <div className="det-content">

          {/* ══════════════════════════════════════════════
              SECCIÓN 1 — DATOS DE LA OPERACIÓN
          ══════════════════════════════════════════════ */}
          <div className="det-seccion">
            <div className="det-seccion-header">
              <i className="pi pi-info-circle det-seccion-icon" />
              <span className="det-seccion-titulo">Datos de la Operación</span>
            </div>

            <div className="det-grid">
              <div className="det-campo">
                <span className="det-campo-label">Cliente</span>
                <span className="det-campo-valor">
                  {operationData.razonSocialCliente || operationData.nombreCliente || "—"}
                </span>
              </div>

              <div className="det-campo">
                <span className="det-campo-label">Tipo de Gestión</span>
                <span className="det-campo-valor">{operationData.tipoOperacion || "—"}</span>
              </div>

              <div className="det-campo">
                <span className="det-campo-label">Nro. Carpeta</span>
                <span className="det-campo-valor det-campo-destacado">
                  {operationData.nroCarpeta || "—"}
                </span>
              </div>

              <div className="det-campo">
                <span className="det-campo-label">Nro. DUA</span>
                <span className="det-campo-valor det-campo-destacado">
                  {operationData.nroDua || "—"}
                </span>
              </div>

              <div className="det-campo">
                <span className="det-campo-label">Tipo de Conocimiento</span>
                <span className="det-campo-valor">{operationData.tipoConocimiento || "—"}</span>
              </div>

              <div className="det-campo">
                <span className="det-campo-label">Nro. Conocimiento</span>
                <span className="det-campo-valor">{operationData.nroConocimiento || "—"}</span>
              </div>

              <div className="det-campo">
                <span className="det-campo-label">Fecha de Registro</span>
                <span className="det-campo-valor">{formatFecha(operationData.fechaRegistro)}</span>
              </div>

              <div className="det-campo">
                <span className="det-campo-label">Estado</span>
                <span className={`det-estado-badge ${estadoClase}`}>{estadoLabel}</span>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════
              SECCIÓN 2 — DOCUMENTACIÓN
          ══════════════════════════════════════════════ */}
          <div className="det-seccion">
            <div className="det-seccion-header">
              <i className="pi pi-file det-seccion-icon det-icon-doc" />
              <span className="det-seccion-titulo">Documentación</span>
              {!cargandoDocs && (
                <span className="det-badge-contador">
                  {documentos.length} doc{documentos.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Cargando */}
            {cargandoDocs && (
              <div className="det-cargando">
                <i className="pi pi-spin pi-spinner" style={{ color: "#3b82f6" }} />
                <span>Cargando documentos...</span>
              </div>
            )}

            {/* Sin documentos */}
            {!cargandoDocs && documentos.length === 0 && (
              <div className="det-vacio">
                <i className="pi pi-folder-open det-vacio-icon" />
                <p>No hay documentos registrados para esta operación.</p>
              </div>
            )}

            {/* Lista de documentos */}
            {!cargandoDocs && documentos.length > 0 && (
              <div className="det-doc-lista">
                {documentos.map((doc) => (
                  <div key={doc.id} className="det-doc-item">
                    <div className="det-doc-icono">
                      <i className={iconoPorFormato(doc.formato)} />
                    </div>
                    <div className="det-doc-info">
                      <span className="det-doc-nombre">{doc.nombre}</span>
                      <span className="det-doc-meta">
                        {doc.formato} · {formatFecha(doc.fechaCarga)}
                      </span>
                    </div>
                    <span className="det-doc-badge">{doc.formato || "ARCHIVO"}</span>
                    <div className="det-doc-acciones">
                      <Button
                        icon="pi pi-eye"
                        rounded
                        text
                        className="det-btn-doc-ver"
                        tooltip="Ver documento"
                        tooltipOptions={{ position: "top" }}
                        onClick={() =>
                          window.open(
                            `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}/${doc.rutaArchivo}`,
                            "_blank"
                          )
                        }
                        disabled={!doc.rutaArchivo}
                      />
                      <Button
                        icon="pi pi-download"
                        rounded
                        text
                        className="det-btn-doc-descargar"
                        tooltip="Descargar"
                        tooltipOptions={{ position: "top" }}
                        onClick={() => handleDescargar(doc)}
                        disabled={!doc.rutaArchivo}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════
              SECCIÓN 3 — LIQUIDACIÓN
          ══════════════════════════════════════════════ */}
          <div className="det-seccion">
            <div className="det-seccion-header">
              <i className="pi pi-dollar det-seccion-icon det-icon-liq" />
              <span className="det-seccion-titulo">Liquidación</span>
              {liquidacion && !cargandoLiq && (
                <span
                  className={`det-estado-badge det-badge-sm ${
                    estadoLiqConfig(liquidacion.estado).clase
                  }`}
                >
                  {estadoLiqConfig(liquidacion.estado).label}
                </span>
              )}
            </div>

            {/* Cargando */}
            {cargandoLiq && (
              <div className="det-cargando">
                <i className="pi pi-spin pi-spinner" style={{ color: "#00e0b0" }} />
                <span>Cargando liquidación...</span>
              </div>
            )}

            {/* Sin liquidación */}
            {!cargandoLiq && !liquidacion && (
              <div className="det-vacio">
                <i className="pi pi-file-excel det-vacio-icon" />
                <p>Esta operación aún no tiene liquidación registrada.</p>
              </div>
            )}

            {/* Datos de liquidación */}
            {!cargandoLiq && liquidacion && (
              <div className="det-liq-contenido">
                {/* Resumen de montos */}
                <div className="det-liq-resumen">
                  <div className="det-liq-monto-card">
                    <span className="det-liq-monto-label">MONTO TOTAL</span>
                    <span className="det-liq-monto-valor">
                      {formatMonto(liquidacion.montoTotal)}
                    </span>
                  </div>
                  <div className="det-liq-monto-card">
                    <span className="det-liq-monto-label">SALDO PENDIENTE</span>
                    <span className="det-liq-monto-valor det-liq-pendiente">
                      {formatMonto(liquidacion.saldoPendiente)}
                    </span>
                  </div>
                  <div className="det-liq-monto-card">
                    <span className="det-liq-monto-label">VENCIMIENTO</span>
                    <span className="det-liq-monto-valor det-liq-fecha">
                      {formatFecha(liquidacion.fechaVenc)}
                    </span>
                  </div>
                </div>

                {/* Detalle de ítems */}
                {liquidacion.detalle && liquidacion.detalle.length > 0 && (
                  <div className="det-liq-detalle">
                    <p className="det-liq-detalle-titulo">Detalle de conceptos</p>
                    {liquidacion.detalle.map((item) => (
                      <div key={item.id} className="det-liq-item">
                        <span className="det-liq-item-desc">{item.descripcion}</span>
                        <span className="det-liq-item-monto">{formatMonto(item.monto)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Info adicional */}
                <div className="det-liq-meta">
                  <span>Enviada el {formatFecha(liquidacion.fechaEnvio)}</span>
                  {liquidacion.esDefinitiva && (
                    <span className="det-liq-definitiva">
                      <i className="pi pi-lock" /> Liquidación definitiva
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </Dialog>
    </>
  );
}
