import { useState, useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { obtenerDocumentosPorOperacion } from "../../../../services/operationService";
import "./VerDocumentosDialog.css";

const iconoPorFormato = (formato) => {
  if (formato === "PDF") return "pi pi-file-pdf";
  if (formato === "JPG" || formato === "PNG") return "pi pi-image";
  return "pi pi-file";
};

export default function VerDocumentosDialog({
  visible,
  onHide,
  operacionId,
  nroCarpeta,
  nroDua,
}) {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    if (visible && operacionId) {
      cargarDocumentos();
    }
  }, [visible, operacionId]);

  const cargarDocumentos = async () => {
    setLoading(true);
    try {
      const data = await obtenerDocumentosPorOperacion(operacionId);
      setDocumentos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar documentos:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudieron cargar los documentos.",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCerrar = () => {
    onHide();
  };

  const handleDescargar = async (doc) => {
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}/${doc.rutaArchivo}`;
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = doc.nombre; // nombre que tendrá el archivo descargado
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

  const dialogHeader = (
    <div className="opd-dialog-header">
      <div className="opd-header-icon opd-header-icon-doc">
        <i className="pi pi-file-arrow-up" />
      </div>
      <div>
        <h2 className="opd-header-title">Documentos del DUA</h2>
        <p className="opd-header-subtitle">
          Consulta los documentos registrados
        </p>
      </div>
    </div>
  );

  // Solo un botón de cerrar en el footer
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
            {/* <i className="pi pi-file" /> */}
            <span>NRO. CARPETA: {nroCarpeta}</span>
          </div>

          <div className="opd-estado-badge opd-badge-doc">
            {/* <i className="pi pi-file" /> */}
            <span>NRO. DUA: {nroDua}</span>
          </div>
        </div>

          {/* ══════════════════════════════════════
            SECCIÓN — LISTA DE DOCUMENTOS
            ══════════════════════════════════════ */}
          <div className="doc-seccion">
            <div className="doc-seccion-header">
              <i className="pi pi-list doc-seccion-icon doc-seccion-icon--lista" />
              <span className="doc-seccion-titulo">
                Documentos registrados
                {documentos.length > 0 && (
                  <span className="doc-seccion-count">{documentos.length}</span>
                )}
              </span>
            </div>

            {loading ? (
              <div className="doc-lista-loading">
                <i className="pi pi-spin pi-spinner" />
                <span>Cargando documentos...</span>
              </div>
            ) : documentos.length === 0 ? (
              <div className="doc-lista-vacia">
                <i className="pi pi-inbox" />
                <span>No hay documentos registrados para esta operación</span>
              </div>
            ) : (
              <div className="doc-lista">
                {documentos.map((doc) => (
                  <div key={doc.id} className="doc-item">
                    <div className="doc-item-icono">
                      <i className={iconoPorFormato(doc.formato)} />
                    </div>
                    <div className="doc-item-info">
                      <span className="doc-item-nombre">{doc.nombre}</span>
                      <span className="doc-item-meta">
                        {doc.formato} ·{" "}
                        {new Date(doc.fechaCarga).toLocaleDateString("es-UY", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <Button
                      icon="pi pi-eye"
                      rounded
                      text
                      className="doc-item-btn-ver"
                      //onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL}/${doc.rutaArchivo}`, "_blank")}
                      // Cuando estemos en produccion no se utilizara mas /api
                      onClick={() =>
                        window.open(
                          `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}/${doc.rutaArchivo}`,
                          "_blank",
                        )
                      }
                      tooltip="Ver documento"
                      tooltipOptions={{ position: "top" }}
                      disabled={!doc.rutaArchivo}
                    />

                    <Button
                      icon="pi pi-download"
                      rounded
                      text
                      className="doc-item-btn-descargar"
                      onClick={() => handleDescargar(doc)}
                      tooltip="Descargar documento"
                      tooltipOptions={{ position: "top" }}
                      disabled={!doc.rutaArchivo}
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
