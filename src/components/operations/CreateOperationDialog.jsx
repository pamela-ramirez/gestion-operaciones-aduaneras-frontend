import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import { obtenerClientes } from "../../services/clienteService";
import { crearOperacion } from "../../services/operationService";
import { obtenerTiposOperacion } from "../../services/tipoOperacionService";
import "./OperationDialogs.css";

export default function CreateOperationDialog({ visible, onHide, onRefreshOperations }) {
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [tiposOperacion, setTiposOperacion] = useState([]);
  
  const [formData, setFormData] = useState({
    clienteId: null,
    nroCarpeta: "",
    tipoOperacionId: null,
  });

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    if (visible) {
      cargarClientes();
      cargarTiposOperacion();
      resetForm();
    }
  }, [visible]);

  const cargarClientes = async () => {
    try {
      const data = await obtenerClientes();
      setClientes(data.map(c => ({
        label: c.razonSocial,
        value: c.id
      })));
    } catch (error) {
      console.error("Error cargando clientes:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudieron cargar los clientes",
        life: 3000,
      });
    }
  };

  const cargarTiposOperacion = async () => {
    try {
      // Intentar cargar desde el servicio real
      const data = await obtenerTiposOperacion();
      setTiposOperacion(data.map(t => ({
        label: t.descripcion,
        value: t.id
      })));
    } catch (error) {
      console.warn("Servicio de tipos de operación no disponible, usando datos de ejemplo");
      // Fallback a datos de ejemplo si el servicio no está disponible
      /* setTiposOperacion([
        { label: "Importación", value: 1 },
        { label: "Exportación", value: 2 },
        { label: "Tránsito", value: 3 },
        { label: "Reimportación", value: 4 },
      ]); */
    }
  };

  const resetForm = () => {
    setFormData({
      clienteId: null,
      nroCarpeta: "",
      tipoOperacionId: null,
    });
  };

  // =========================
  // HANDLERS
  // =========================

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.clienteId) {
      toast.current?.show({
        severity: "warn",
        summary: "Validación",
        detail: "Debe seleccionar un cliente",
        life: 3000,
      });
      return;
    }

    if (!formData.nroCarpeta.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Validación",
        detail: "Debe ingresar el número de carpeta",
        life: 3000,
      });
      return;
    }

    if (!formData.tipoOperacionId) {
      toast.current?.show({
        severity: "warn",
        summary: "Validación",
        detail: "Debe seleccionar el tipo de operación",
        life: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const operacionData = {
        clienteId: formData.clienteId,
        nroCarpeta: formData.nroCarpeta,
        tipoOperacionId: formData.tipoOperacionId,
        estado: formData.estado || "-",
        fechaInicio: new Date().toISOString(),
      };

      await crearOperacion(operacionData);

      toast.current?.show({
        severity: "success",
        summary: "¡Operación guardada con éxito!",
        detail: "La operación ha sido creada correctamente",
        life: 3000,
      });

      setTimeout(() => {
        onRefreshOperations();
      }, 1000);
    } catch (error) {
      console.error("Error creando operación:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo crear la operación",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onHide();
  };

  // =========================
  // UI
  // =========================

  const dialogHeader = (
    <div className="opd-dialog-header">
      <div className="opd-header-icon">
        <i className="pi pi-plus-circle" />
      </div>
      <div>
        <h2 className="opd-header-title">Nueva Operación</h2>
        <p className="opd-header-subtitle">
          Complete los datos para crear una nueva operación aduanera
        </p>
      </div>
    </div>
  );

  const dialogFooter = (
    <div className="opd-footer">
      <Button
        label="Cancelar"
        className="opd-btn-cancel"
        onClick={handleCancel}
        disabled={loading}
      />
      <Button
        label="Crear Operación"
        icon="pi pi-check"
        className="opd-btn-submit"
        onClick={handleSubmit}
        loading={loading}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={handleCancel}
        header={dialogHeader}
        footer={dialogFooter}
        className="opd-dialog"
        modal
        style={{ width: "540px" }}
        dismissableMask={false}
      >
        <div className="opd-content">
          {/* Estado Badge */}
          <div className="opd-estado-badge">
            <i className="pi pi-circle-fill" />
            <span>ESTADO: INICIADO</span>
          </div>

          {/* Cliente */}
          <div className="opd-field">
            <label htmlFor="cliente" className="opd-label">
              Cliente <span className="opd-required">*</span>
            </label>
            <Dropdown
              id="cliente"
              value={formData.clienteId}
              options={clientes}
              onChange={(e) => setFormData({ ...formData, clienteId: e.value })}
              placeholder="Seleccionar Cliente..."
              className="opd-dropdown"
              filter
              filterPlaceholder="Buscar cliente..."
            />
          </div>

          {/* Número de Carpeta */}
          <div className="opd-field">
            <label htmlFor="nroCarpeta" className="opd-label">
              Número de Carpeta <span className="opd-required">*</span>
            </label>
            <InputText
              id="nroCarpeta"
              value={formData.nroCarpeta}
              onChange={(e) => setFormData({ ...formData, nroCarpeta: e.target.value })}
              placeholder="Ej: SL-2024-0001"
              className="opd-input"
            />
          </div>

          {/* Tipo de Operación */}
          <div className="opd-field">
            <label htmlFor="tipoOperacion" className="opd-label">
              Tipo de Operación <span className="opd-required">*</span>
            </label>
            <Dropdown
              id="tipoOperacion"
              value={formData.tipoOperacionId}
              options={tiposOperacion}
              onChange={(e) => setFormData({ ...formData, tipoOperacionId: e.value })}
              placeholder="Seleccionar Tipo..."
              className="opd-dropdown"
            />
          </div>

          {/* Imagen decorativa */}
          <div className="opd-image-container">
            <img
              src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=600&h=300&fit=crop"
              alt="Control de Aduanas"
              className="opd-image"
            />
            <div className="opd-image-overlay">
              <span className="opd-image-text">CONTROL DE ADUANAS</span>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}