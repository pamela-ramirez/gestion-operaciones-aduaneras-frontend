import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { obtenerOperacionesPorCliente } from "../../services/operationService";
import { obtenerClientePorId } from "../../services/clienteService";
import "./ClientOperationsHistory.css";

export default function ClientOperationsHistory() {
  const { clienteId } = useParams();
  const navigate = useNavigate();

  const [operaciones, setOperaciones] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  // =========================
  // CARGAR DATOS
  // =========================

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      setError(null);
      try {
        // Cargamos en paralelo: datos del cliente y sus operaciones
        const [clienteData, operacionesData] = await Promise.all([
          obtenerClientePorId(clienteId),
          obtenerOperacionesPorCliente(clienteId),
        ]);
        setCliente(clienteData);
        setOperaciones(Array.isArray(operacionesData) ? operacionesData : []);
      } catch {
        setError("No se pudieron cargar los datos.");
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [clienteId]);

  // =========================
  // TEMPLATES DE COLUMNAS — idénticos a Operations.jsx
  // =========================

  // Columna Nro. Carpeta
  const carpetaTemplate = (row) => (
    <div className="op-main-cell">
      <div className="op-folder-icon">
        <i className="pi pi-folder" />
      </div>
      <div>
        <p className="op-cell-name">{row.nroCarpeta || "—"}</p>
      </div>
    </div>
  );

  // Columna Tipo Operación
  const tipoOperacionTemplate = (row) => (
    <span className="op-cell-text">{row.tipoOperacion || "—"}</span>
  );

  // Columna Nro. DUA (puede estar vacío si la operación es nueva)
  const duaTemplate = (row) => (
    <span className={row.nroDua ? "op-cell-text" : "op-cell-muted"}>
      {row.nroDua || "Pendiente"}
    </span>
  );

  // Columna Estado
  const estadoTemplate = (row) => {
    const estadoNormalizado = row.estado?.toLowerCase().replace(/\s+/g, "-");
    return (
      <span className={`op-estado op-estado-${estadoNormalizado}`}>
        {row.estado || "—"}
      </span>
    );
  };

  // Columna Fecha de inicio (formateada)
  const fechaTemplate = (row) => {
    const fecha = new Date(row.fechaRegistro);
    return (
      <span className="op-cell-text">
        {fecha.toLocaleDateString("es-UY", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}
      </span>
    );
  };

  // =========================
  // UI
  // =========================

  const header = (
    <div className="op-table-header">
      <span className="op-table-count">
        <i className="pi pi-folder" />
        {operaciones.length} operacion{operaciones.length !== 1 ? "es" : ""}
      </span>
      <IconField iconPosition="left">
        <InputIcon className="pi pi-search" />
        <InputText
          value={globalFilterValue}
          onChange={(e) => setGlobalFilterValue(e.target.value)}
          placeholder="Buscar por Nro. de Carpeta o Nro. DUA..."
          className="op-search-input"
        />
      </IconField>
    </div>
  );

  const emptyMessage = (
    <div className="op-empty">
      <i className="pi pi-folder op-empty-icon" />
      <p className="op-empty-title">Sin operaciones registradas</p>
    </div>
  );

  return (
    <MainLayout>
      <div className="op-root">

        {/* HEADER */}
        <div className="op-header">
          <div>
            {/* Botón volver */}
            <Button
              icon="pi pi-arrow-left"
              label="Volver a clientes"
              text
              className="op-btn-back"
              onClick={() => navigate("/clientes")}
            />

            <div className="op-breadcrumb">
              <span className="op-bc-dim">CLIENTES</span>
              <span className="op-bc-sep">›</span>
              <span className="op-bc-active">HISTORIAL DE OPERACIONES</span>
              <span className="op-bc-sep">›</span>
            </div>

            <h1 className="op-title">Historial de Operaciones</h1>

            {/* Nombre del cliente */}
            {cliente && (
              <p className="op-cliente-info">
                <i className="pi pi-building" />
                {cliente.razonSocial}
                {cliente.nombre && ` — ${cliente.nombre} ${cliente.apellido}`}
              </p>
            )}
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div style={{
            background: "rgba(224, 85, 85, 0.1)",
            border: "1px solid rgba(224, 85, 85, 0.25)",
            borderRadius: "10px",
            padding: "12px 16px",
            color: "#e05555",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "16px"
          }}>
            <i className="pi pi-exclamation-triangle" />
            {error}
          </div>
        )}

        {/* TABLA */}
        <DataTable
          value={operaciones}
          loading={loading}
          paginator
          rows={10}
          globalFilter={globalFilterValue}
          header={header}
          emptyMessage={emptyMessage}
          scrollable
          scrollHeight="flex"
          className="op-datatable" 
        >
          <Column
            header="NRO. CARPETA"
            body={carpetaTemplate}
            field="nroCarpeta"
            sortable
            style={{ width: "180px" }}
          />

          <Column
            header="TIPO DE OPERACIÓN"
            body={tipoOperacionTemplate}
            field="tipoOperacion"
            sortable
            style={{ width: "200px" }}
          />

          <Column
            header="NRO. DUA"
            body={duaTemplate}
            field="nroDua"
            style={{ width: "160px" }}
          />

          <Column
            header="ESTADO"
            body={estadoTemplate}
            field="estado"
            sortable
            style={{ width: "200px" }}
          />

          <Column
            header="FECHA DE INICIO"
            body={fechaTemplate}
            field="fechaRegistro"
            sortable
            style={{ width: "160px" }}
          />
        </DataTable>

      </div>
    </MainLayout>
  );
}