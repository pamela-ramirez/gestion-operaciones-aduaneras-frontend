import { useState, useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { subirFactura, eliminarFactura } from "../../services/facturaService";
import { obtenerFacturasPorOperacion } from "../../services/operationService";
import "./SubirDocumentoDialog.css"; // Reutilizamos el mismo CSS de documentos
import "./SubirFacturaDialog.css"; // Estilos específicos para facturas

const FORMATO_PERMITIDO = "application/pdf";
const EXTENSION_LEGIBLE = "PDF";

export default function SubirFacturaDialog({
    visible,
    onHide,
    operacionId,
    nroCarpeta,
}) {
    const toast = useRef(null);
    const inputArchivoRef = useRef(null);

    const [nombre, setNombre] = useState("");
    const [archivo, setArchivo] = useState(null);
    const [nombreArchivo, setNombreArchivo] = useState("");
    const [loadingSubir, setLoadingSubir] = useState(false);

    const [facturas, setFacturas] = useState([]);
    const [loadingLista, setLoadingLista] = useState(false);

    useEffect(() => {
        if (visible && operacionId) {
            cargarFacturas();
            resetForm();
        }
    }, [visible, operacionId]);

    const cargarFacturas = async () => {
        setLoadingLista(true);
        try {
            const data = await obtenerFacturasPorOperacion(operacionId);
            setFacturas(Array.isArray(data) ? data : []);
        } catch (error) {
            if (error?.response?.status === 404) {
                setFacturas([]);
            } else {
                toast.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: "No se pudieron cargar las facturas.",
                    life: 4000,
                });
            }
        } finally {
            setLoadingLista(false);
        }
    };

    const resetForm = () => {
        setNombre("");
        setArchivo(null);
        setNombreArchivo("");
        if (inputArchivoRef.current) inputArchivoRef.current.value = "";
    };

    const handleArchivoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== FORMATO_PERMITIDO) {
            toast.current?.show({
                severity: "warn",
                summary: "Formato inválido",
                detail: "Solo se permiten archivos PDF.",
                life: 4000,
            });
            return;
        }

        setArchivo(file);
        setNombreArchivo(file.name);
    };

    const handleSubir = async () => {
        if (!nombre.trim()) {
            toast.current?.show({
                severity: "warn",
                summary: "Nombre requerido",
                detail: "Ingresá un nombre para la factura.",
                life: 3000,
            });
            return;
        }

        if (!archivo) {
            toast.current?.show({
                severity: "warn",
                summary: "Archivo requerido",
                detail: "Seleccioná un archivo PDF.",
                life: 3000,
            });
            return;
        }

        setLoadingSubir(true);
        try {
            await subirFactura(operacionId, nombre, archivo);
            toast.current?.show({
                severity: "success",
                summary: "Factura subida",
                detail: "La factura se cargó correctamente.",
                life: 3000,
            });
            resetForm();
            await cargarFacturas(); // Refresca la lista
        } catch {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "No se pudo subir la factura.",
                life: 4000,
            });
        } finally {
            setLoadingSubir(false);
        }
    };

    const handleEliminar = async (facturaId) => {
        try {
            await eliminarFactura(facturaId);
            toast.current?.show({
                severity: "success",
                summary: "Eliminada",
                detail: "La factura fue eliminada.",
                life: 3000,
            });
            await cargarFacturas();
        } catch {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "No se pudo eliminar la factura.",
                life: 4000,
            });
        }
    };

    const handleVerFactura = (rutaArchivo) => {
        const url = `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}/${rutaArchivo}`;
        window.open(url, "_blank");
    };

    const handleDescargarFactura = async (factura) => {
        try {
            const url = `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}/${factura.rutaArchivo}`;
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = factura.nombre;
            link.click();
            window.URL.revokeObjectURL(blobUrl);
        } catch {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "No se pudo descargar la factura.",
                life: 4000,
            });
        }
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                visible={visible}
                onHide={onHide}
                header={
                    <div className="opd-dialog-header">
                        <div className="opd-header-icon opd-header-icon-factura">
                            <i className="pi pi-receipt" />
                        </div>
                        <div>
                            <h2 className="opd-header-title">Facturas</h2>
                            <p className="opd-header-subtitle">Carpeta {nroCarpeta || "—"}</p>
                        </div>
                    </div>
                }
                style={{ width: "600px" }}
                modal
                draggable={false}
                className="opd-dialog"
            >
                <div className="opd-body">

                    {/* ── LISTA DE FACTURAS ── */}
                    <div className="opd-section">
                        <p className="opd-section-title">Facturas cargadas</p>

                        {loadingLista ? (
                            <p className="opd-empty">Cargando...</p>
                        ) : facturas.length === 0 ? (
                            <p className="opd-empty">No hay facturas cargadas para esta operación.</p>
                        ) : (
                            <div className="doc-list">
                                {facturas.map((factura) => (
                                    <div key={factura.id} className="doc-item">
                                        <i className="pi pi-file-pdf doc-item-icon" />
                                        <div className="doc-item-info">
                                            <span className="doc-item-nombre">{factura.nombre}</span>
                                            <span className="doc-item-fecha">
                                                {new Date(factura.fechaCarga).toLocaleDateString("es-UY")}
                                            </span>
                                        </div>
                                        <div className="doc-item-acciones">
                                            <Button
                                                icon="pi pi-eye"
                                                rounded
                                                text
                                                className="doc-item-btn-ver"
                                                onClick={() => handleVerFactura(factura.rutaArchivo)}
                                                tooltip="Ver factura"
                                                tooltipOptions={{ position: "top" }}
                                                disabled={!factura.rutaArchivo}
                                            />
                                            <Button
                                                icon="pi pi-download"
                                                rounded
                                                text
                                                className="doc-item-btn-descargar"
                                                onClick={() => handleDescargarFactura(factura)}
                                                tooltip="Descargar factura"
                                                tooltipOptions={{ position: "top" }}
                                                disabled={!factura.rutaArchivo}
                                            />
                                            <Button
                                                icon="pi pi-trash"
                                                rounded
                                                text
                                                className="doc-item-btn-eliminar"
                                                onClick={() => handleEliminar(factura.id)}
                                                tooltip="Eliminar factura"
                                                tooltipOptions={{ position: "top" }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── FORMULARIO PARA SUBIR ── */}
                    <div className="opd-section">
                        <p className="opd-section-title">Subir nueva factura</p>

                        <div className="opd-field">
                            <label className="opd-label">Nombre<span style={{ color: "#e05555" }}>*</span></label>
                            <InputText
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Ej: Factura_001"
                                className="opd-input"
                            />
                        </div>

                        <div className="opd-field">
                            <label className="opd-label">Archivo (solo PDF)<span style={{ color: "#e05555" }}>*</span></label>
                            <input
                                ref={inputArchivoRef}
                                type="file"
                                accept=".pdf"
                                style={{ display: "none" }}
                                onChange={handleArchivoChange}
                            />
                            <div
                                className={`doc-upload-area ${archivo ? "doc-upload-area--selected" : ""}`}
                                onClick={() => inputArchivoRef.current?.click()}
                            >
                                {archivo ? (
                                    <>
                                        <i className="pi pi-file-pdf doc-upload-icon doc-upload-icon--ok" />
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
                                            Formato aceptado: {EXTENSION_LEGIBLE}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        <Button
                            label="Subir Factura"
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