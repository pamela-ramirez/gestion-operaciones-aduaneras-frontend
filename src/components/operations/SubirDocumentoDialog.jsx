
import { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { subirDocumento } from "../../services/documentoService";
import "./SubirDocumentoDialog.css"; //falta

// Formatos permitidos según RN-16.2
const FORMATOS_PERMITIDOS = ["application/pdf", "image/jpeg", "image/png"];
const EXTENSIONES_LEGIBLES = "PDF, JPG, PNG";

export default function SubirDocumentoDialog({
  visible,
  onHide,
  operacionId,         // ID de la operación a la que se asociará el documento
  onDocumentoSubido,   // callback para avisar al padre que se subió un doc
}) {
  const toast = useRef(null);
  const inputArchivoRef = useRef(null); // referencia al <input type="file"> oculto

  const [nombre, setNombre] = useState("");
  const [archivo, setArchivo] = useState(null);       // el File seleccionado
  const [nombreArchivo, setNombreArchivo] = useState(""); // solo para mostrar en pantalla
  const [loading, setLoading] = useState(false);

  // Limpia el formulario a su estado inicial
  const resetForm = () => {
    setNombre("");
    setArchivo(null);
    setNombreArchivo("");
    // también limpiamos el input file nativo para que permita subir el mismo archivo dos veces
    if (inputArchivoRef.current) {
      inputArchivoRef.current.value = "";
    }
  };

  const handleCancelar = () => {
    resetForm();
    onHide();
  };

  // Cuando el usuario elige un archivo en el explorador
  const handleArchivoSeleccionado = (e) => {
    const archivoSeleccionado = e.target.files[0];
    if (!archivoSeleccionado) return;

    // Validar formato (RN-16.2)
    if (!FORMATOS_PERMITIDOS.includes(archivoSeleccionado.type)) {
      toast.current?.show({
        severity: "warn",
        summary: "Formato no permitido",
        detail: `Solo se aceptan archivos ${EXTENSIONES_LEGIBLES}`,
        life: 4000,
      });
      // Limpiamos el input para que el usuario pueda elegir otro
      if (inputArchivoRef.current) inputArchivoRef.current.value = "";
      return;
    }

    setArchivo(archivoSeleccionado);
    setNombreArchivo(archivoSeleccionado.name);
  };

  const handleSubir = async () => {
    // Validación: nombre obligatorio
    if (!nombre.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Validación",
        detail: "Debe ingresar un nombre para el documento",
        life: 3000,
      });
      return;
    }

    // Validación: archivo obligatorio
    if (!archivo) {
      toast.current?.show({
        severity: "warn",
        summary: "Validación",
        detail: "Debe seleccionar un archivo para adjuntar",
        life: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      await subirDocumento(nombre.trim(), archivo, operacionId);

      toast.current?.show({
        severity: "success",
        summary: "Documento subido",
        detail: "El documento fue registrado correctamente",
        life: 3000,
      });

      // Avisamos al padre para que actualice la lista si la tiene
      setTimeout(() => {
        onDocumentoSubido?.();
        resetForm();
        onHide();
      }, 1000);
    } catch (error) {
      console.error("Error subiendo documento:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo subir el documento. Intente nuevamente.",
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  // ── HEADER del dialog ──────────────────────────────────────
  const dialogHeader = (
    <div className="opd-dialog-header">
      <div className="opd-header-icon opd-header-icon-doc">
        <i className="pi pi-file-arrow-up" />
      </div>
      <div>
        <h2 className="opd-header-title">Subir Documento</h2>
        <p className="opd-header-subtitle">
          Adjuntá un documento digital a esta operación
        </p>
      </div>
    </div>
  );

  // ── FOOTER del dialog ──────────────────────────────────────
  const dialogFooter = (
    <div className="opd-footer">
      <Button
        label="Cancelar"
        className="opd-btn-cancel"
        onClick={handleCancelar}
        disabled={loading}
      />
      <Button
        label="Subir Documento"
        icon="pi pi-upload"
        className="opd-btn-submit"
        onClick={handleSubir}
        loading={loading}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={handleCancelar}
        header={dialogHeader}
        footer={dialogFooter}
        className="opd-dialog"
        modal
        style={{ width: "500px" }}
        dismissableMask={false}
      >
        <div className="opd-content">

          {/* Badge informativo que muestra a qué operación pertenece */}
          <div className="opd-estado-badge opd-badge-doc">
            <i className="pi pi-link" />
            <span>OPERACIÓN ID: {operacionId}</span>
          </div>

          {/* Campo: Nombre del documento */}
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

          {/* Campo: Selector de archivo */}
          <div className="opd-field">
            <label className="opd-label">
              Archivo <span className="opd-required">*</span>
            </label>

            {/* Input nativo oculto — lo activamos con el botón de abajo */}
            <input
              ref={inputArchivoRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleArchivoSeleccionado}
              style={{ display: "none" }}
            />

            {/* Área de selección visual */}
            <div
              className={`doc-upload-area ${archivo ? "doc-upload-area--selected" : ""}`}
              onClick={() => inputArchivoRef.current?.click()}
            >
              {archivo ? (
                // Muestra el archivo elegido
                <>
                  <i className="pi pi-file doc-upload-icon doc-upload-icon--ok" />
                  <span className="doc-upload-filename">{nombreArchivo}</span>
                  <span className="doc-upload-change">Clic para cambiar</span>
                </>
              ) : (
                // Estado vacío
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

        </div>
      </Dialog>
    </>
  );
}
