import { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import {obtenerFacturasPorOperacion} from "../../../../services/operationService";
//import { obtenerFacturaPorLiquidacion } from "../../../../services/facturaService";
import "./VerDocumentosDialog.css";

const iconoPorFormato = (formato) => {
  if (formato === "PDF") return "pi pi-file-pdf";
  if (formato === "JPG" || formato === "PNG") return "pi pi-image";
  return "pi pi-file";
};

export default function VerFacturasDialog({
  visible,
  onHide,
  operacionId,
  nroCarpeta,
}) {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    if (visible && operacionId) {
      cargarFacturas();
    }
  }, [visible, operacionId]);

  const cargarFacturas = async () => {
    setLoading(true);
    try {
      //simulacion de datos
     /*  const data = [
        {
          id: 1,
          nombre: "Factura_12345.pdf",
          formato: "PDF",
          fechaCarga: "2024-06-15T14:30:00Z",
          rutaArchivo: "uploads/facturas/Factura_12345.pdf",
        },
        {
          id: 2,
          nombre: "Factura_67890.jpg",
          formato: "JPG",
          fechaCarga: "2024-06-16T10:15:00Z",
          rutaArchivo: "uploads/facturas/Factura_67890.jpg",
        },
      ]; */
    const facturasData = await obtenerFacturasPorOperacion(operacionId);

      setFacturas(Array.isArray(facturasData) ? facturasData : []);

    } catch (error) {
      console.error("Error al cargar facturas:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudieron cargar las facturas.",
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
      <div className="opd-header-icon opd-header-icon-doc">
        <i className="pi pi-receipt" />
      </div>
      <div>
        <h2 className="opd-header-title">Facturas</h2>
        <p className="opd-header-subtitle">Consulta las facturas registradas</p>
      </div>
    </div>
  );

  // ── Footer del diálogo ─────────────────────────────────────────
  const dialogFooter = (
    <div className="opd-footer">
      <Button
        label="Cerrar"
        className="opd-btn-cancel"
        onClick={handleCerrar}
        disabled={loading}
      />
    </div>
  );

  const handleDescargar = async (factura) => {
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}/${factura.rutaArchivo}`;
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = factura.nombre; // nombre que tendrá el archivo descargado
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error al descargar documento:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo descargar el documento",
        life: 4000,
      });
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={handleCerrar}
        header={dialogHeader}
        footer={dialogFooter}
        className="opd-dialog"
        modal
        style={{ width: "600px" }}
        dismissableMask={false}
      >
        <div className="opd-content">
          <div className="opd-badges-container">
            {/* Badge con número de carpeta */}
            <div className="opd-estado-badge opd-badge-doc">
              <span>NRO. CARPETA: {nroCarpeta}</span>
            </div>
          </div>

          {/* ══════════════════════════════════════
                SECCIÓN — LISTA DE FACTURAS
                ══════════════════════════════════════ */}
          <div className="doc-seccion">
            <div className="doc-seccion-header">
              <i className="pi pi-list doc-seccion-icon doc-seccion-icon--lista" />
              <span className="doc-seccion-titulo">
                Facturas registradas
                {facturas.length > 0 && (
                  <span className="doc-seccion-count">{facturas.length}</span>
                )}
              </span>
            </div>

            {loading ? (
              <div className="doc-lista-loading">
                <i className="pi pi-spin pi-spinner" />
                <span>Cargando facturas...</span>
              </div>
            ) : facturas.length === 0 ? (
              <div className="doc-lista-vacia">
                <i className="pi pi-inbox" />
                <span>No hay facturas registradas para esta operación</span>
              </div>
            ) : (
              <div className="doc-lista">
                {facturas.map((factura) => (
                  <div key={factura.id} className="doc-item">
                    <div className="doc-item-icono">
                      <i className={iconoPorFormato(factura.formato)} />
                    </div>
                    <div className="doc-item-info">
                      <span className="doc-item-nombre">{factura.nombre}</span>
                      <span className="doc-item-meta">
                        {factura.formato} ·{" "}
                        {new Date(factura.fechaCarga).toLocaleDateString(
                          "es-UY",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                    <Button
                      icon="pi pi-eye"
                      rounded
                      text
                      className="doc-item-btn-ver"
                      //onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL}/${doc.rutaArchivo}`, "_blank")}
                      // Cuando estemos en produccion no se utilizara mas /api
                      /* onClick={
                        () =>
                          console.log(
                            `Ver factura: ${factura.nombre} (ruta: ${factura.rutaArchivo})`,
                          ) */

                      onClick={() =>
                        window.open(
                          `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}/${factura.rutaArchivo}`,
                          "_blank",
                        )
                      }
                      tooltip="Ver"
                      tooltipOptions={{ position: "top" }}
                      disabled={!factura.rutaArchivo}
                    />

                    <Button
                      icon="pi pi-download"
                      rounded
                      text
                      className="doc-item-btn-descargar"
                      onClick={() => handleDescargar(factura)}
                      tooltip="Descargar"
                      tooltipOptions={{ position: "top" }}
                      disabled={!factura.rutaArchivo}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
}
