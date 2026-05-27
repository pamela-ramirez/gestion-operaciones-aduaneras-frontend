import { useState, useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { subirDocumento } from "../../services/documentoService";
import { obtenerDocumentosPorOperacion } from "../../services/operationService";
import { eliminarDocumento } from "../../services/documentoService";
import "./SubirDocumentoDialog.css";

const FORMATOS_PERMITIDOS = ["application/pdf", "image/jpeg", "image/png"];
const EXTENSIONES_LEGIBLES = "PDF, JPG, PNG";

const iconoPorFormato = (formato) => {
  if (formato === "PDF") return "pi pi-file-pdf";
  if (formato === "JPG" || formato === "PNG") return "pi pi-image";
  return "pi pi-file";
};

export default function SubirDocumentoDialog({
  visible,
  onHide,
  operacionId,
  nroCarpeta
}) {
  const toast = useRef(null);
  const inputArchivoRef = useRef(null);

  const [nombre, setNombre] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [loadingSubir, setLoadingSubir] = useState(false);

  const [documentos, setDocumentos] = useState([]);
  const [loadingLista, setLoadingLista] = useState(false);

  useEffect(() => {
    if (visible && operacionId) {
      cargarDocumentos();
      resetForm();
    }
  }, [visible, operacionId]);

  const cargarDocumentos = async () => {
    setLoadingLista(true);
    try {
      const data = await obtenerDocumentosPorOperacion(operacionId);
      setDocumentos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando documentos:", error);
      setDocumentos([]);
    } finally {
      setLoadingLista(false);
    }
  };

  const resetForm = () => {
    setNombre("");
    setArchivo(null);
    setNombreArchivo("");
    if (inputArchivoRef.current) {
      inputArchivoRef.current.value = "";
    }
  };

  const handleCerrar = () => {
    resetForm();
    onHide();
  };

  const handleArchivoSeleccionado = (e) => {
    const archivoSeleccionado = e.target.files[0];
    if (!archivoSeleccionado) return;

    if (!FORMATOS_PERMITIDOS.includes(archivoSeleccionado.type)) {
      toast.current?.show({
        severity: "warn",
        summary: "Formato no permitido",
        detail: `Solo se aceptan archivos ${EXTENSIONES_LEGIBLES}`,
        life: 4000,
      });
      if (inputArchivoRef.current) inputArchivoRef.current.value = "";
      return;
    }

    setArchivo(archivoSeleccionado);
    setNombreArchivo(archivoSeleccionado.name);
  };

  const handleSubir = async () => {
    if (!nombre.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Validación",
        detail: "Debe ingresar un nombre para el documento",
        life: 3000,
      });
      return;
    }

    if (!archivo) {
      toast.current?.show({
        severity: "warn",
        summary: "Validación",
        detail: "Debe seleccionar un archivo para adjuntar",
        life: 3000,
      });
      return;
    }

    setLoadingSubir(true);
    try {
      await subirDocumento(nombre.trim(), archivo, operacionId);

      toast.current?.show({
        severity: "success",
        summary: "Documento subido",
        detail: "El documento fue registrado correctamente",
        life: 3000,
      });

      // Limpiamos el form pero NO cerramos el modal
      resetForm();
      // Actualizamos la lista para que aparezca el nuevo documento
      await cargarDocumentos();

    } catch (error) {
      console.error("Error subiendo documento:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo subir el documento. Intente nuevamente.",
        life: 4000,
      });
    } finally {
      setLoadingSubir(false);
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
      link.download = doc.nombre; // nombre que tendrá el archivo descargado
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo descargar el documento",
        life: 4000,
      });
    }
  };

  const handleEliminar = async (docId) => {
     try {
      await eliminarDocumento(docId);
      toast.current?.show({
        severity: "success",
        summary: "Documento eliminado",
        detail: "El documento fue eliminado correctamente",
        life: 3000,
      });
      await cargarDocumentos(); // refresca la lista
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo eliminar el documento",
        life: 4000,
      });
    } 
    console.log("Doc eliminado")
  };

  const dialogHeader = (
    <div className="opd-dialog-header">
      <div className="opd-header-icon opd-header-icon-doc">
        <i className="pi pi-file-arrow-up" />
      </div>
      <div>
        <h2 className="opd-header-title">Documentación de Operación</h2>
        <p className="opd-header-subtitle">
          Subí archivos y consultá los documentos registrados
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
        disabled={loadingSubir}
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

          {/* Badge con número de carpeta */}
          <div className="opd-estado-badge opd-badge-doc">
            <i className="pi pi-link" />
            <span>CARPETA: {nroCarpeta || operacionId}</span>
          </div>



          {/* ══════════════════════════════════════
              SECCIÓN 1 — LISTA DE DOCUMENTOS
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

            {loadingLista ? (
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
                        {doc.formato} · {new Date(doc.fechaCarga).toLocaleDateString("es-UY", {
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
                      onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}/${doc.rutaArchivo}`, "_blank")}
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

                    <Button
                      icon="pi pi-trash"
                      rounded
                      text
                      className="doc-item-btn-eliminar"
                      onClick={() => handleEliminar(doc.id)}
                      tooltip="Eliminar documento"
                      tooltipOptions={{ position: "top" }}
                    />

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════
              SECCIÓN 2 — SUBIR NUEVO DOCUMENTO
          ══════════════════════════════════════ */}
          <div className="doc-seccion">
            <div className="doc-seccion-header">
              <i className="pi pi-cloud-upload doc-seccion-icon" />
              <span className="doc-seccion-titulo">Adjuntar nuevo documento</span>
            </div>

            <div className="opd-field">
              <label htmlFor="nombreDoc" className="opd-label">
                Nombre del documento <span className="opd-required">*</span>
              </label>
              <InputText
                id="nombreDoc"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Factura comercial, Bill of Lading..."
                className="opd-input"
                maxLength={100}
              />
              <small className="opd-field-help">
                Nombre descriptivo para identificar el documento
              </small>
            </div>

            <div className="opd-field">
              <label className="opd-label">
                Archivo <span className="opd-required">*</span>
              </label>

              <input
                ref={inputArchivoRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleArchivoSeleccionado}
                style={{ display: "none" }}
              />

              <div
                className={`doc-upload-area ${archivo ? "doc-upload-area--selected" : ""}`}
                onClick={() => inputArchivoRef.current?.click()}
              >
                {archivo ? (
                  <>
                    <i className="pi pi-file doc-upload-icon doc-upload-icon--ok" />
                    <span className="doc-upload-filename">{nombreArchivo}</span>
                    <span className="doc-upload-change">Clic para cambiar</span>
                  </>
                ) : (
                  <>
                    <i className="pi pi-cloud-upload doc-upload-icon" />
                    <span className="doc-upload-placeholder">
                      Clic para seleccionar archivo
                    </span>
                    <span className="doc-upload-hint">
                      Formatos aceptados: {EXTENSIONES_LEGIBLES}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Botón de subir dentro de la sección */}
            <Button
              label="Subir Documento"
              icon="pi pi-upload"
              className="opd-btn-submit doc-btn-subir"
              onClick={handleSubir}
              loading={loadingSubir}
            />
          </div>

        </div>
      </Dialog>
    </>
  );
}
