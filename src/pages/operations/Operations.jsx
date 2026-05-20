import { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import CreateOperationDialog from "../../components/operations/CreateOperationDialog";
import UpdateOperationDialog from "../../components/operations/UpdateOperationDialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { obtenerOperaciones } from "../../services/operationService";
import "./Operations.css";
import FinalizarOperacionDialog from "../../components/operations/FinalizarOperacionDialog";
import SubirDocumentoDialog from "../../components/operations/SubirDocumentoDialog";
import RegistrarLiquidacionDialog from "../../components/operations/RegistrarLiquidacionDialog";

export default function Operations() {
  const [operaciones, setOperaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [updateDialogVisible, setUpdateDialogVisible] = useState(false);
  const [finalizarDialogVisible, setFinalizarDialogVisible] = useState(false);
  const [subirDocDialogVisible, setSubirDocDialogVisible] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  //const [viewDetailDialogVisible, setViewDetailDialogVisible] = useState(false);
  const [liquidacionDialogVisible, setLiquidacionDialogVisible] = useState(false);

  // =========================
  // LOAD DATA
  // =========================

  const cargarOperaciones = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await obtenerOperaciones();
      setOperaciones(Array.isArray(data) ? data : []);
    } catch {
      setError("No se pudieron cargar las operaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarOperaciones();
  }, []);

  // =========================
  // HANDLERS
  // =========================

  const handleOnRefreshOperations = async () => {
    setCreateDialogVisible(false);
    setUpdateDialogVisible(false);
    setFinalizarDialogVisible(false);
    setLiquidacionDialogVisible(false);
    setSelectedOperation(null);
    await cargarOperaciones();
  };

  const handleUpdateOperation = (operation) => {
    setSelectedOperation(operation);
    setUpdateDialogVisible(true);
  };

  const handleDocumentacion = (operation) => {
    setSelectedOperation(operation);
    setSubirDocDialogVisible(true);
  };

  const handleLiquidacion = (operation) => {
    setSelectedOperation(operation);
    setLiquidacionDialogVisible(true);
  };

  const handleFinalizarOperacion = (operation) => {
    setSelectedOperation(operation);
    setFinalizarDialogVisible(true);
  };

  /*   const handleViewDetailOperation = (operation) => {
    setSelectedOperation(operation);
    setViewDetailDialogVisible(true);
  }; */

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  // =========================
  // TEMPLATES
  // =========================

  const carpetaTemplate = (row) => {
    return (
      <div className="op-main-cell">
        <div className="op-folder-icon">
          <i className="pi pi-folder" />
        </div>
        <div>
          <p className="op-cell-name">{row.nroCarpeta || "—"}</p>
        </div>
      </div>
    );
  };

  const duaTemplate = (row) => (
    <span className="op-cell-muted">{row.nroDua || "—"}</span>
  );

  const clienteTemplate = (row) => (
    <span className="op-cell-text">{row.razonSocialCliente || "—"}</span>
  );

  const tipoOperacionTemplate = (row) => (
    <span className="op-cell-text">{row.tipoOperacion || "—"}</span>
  );

  const tipoConocimientoTemplate = (row) => (
    <span className="op-cell-text">{row.tipoConocimiento || "—"}</span>
  );

  const nroConocimientoTemplate = (row) => (
    <span className="op-cell-text">{row.nroConocimiento || "—"}</span>
  );

  const estadoTemplate = (row) => {
    const estadoClass = `op-estado op-estado-${row.estado?.toLowerCase().replace(/\s+/g, "-") || "default"}`;
    return <span className={estadoClass}>{row.estado || "—"}</span>;
  };

  const fechaTemplate = (row) => {
    if (!row.fechaRegistro) return <span className="op-cell-muted">—</span>;
    const fecha = new Date(row.fechaRegistro);
    return (
      <span className="op-cell-muted">
        {fecha.toLocaleDateString("es-UY", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}
      </span>
    );
  };

  const accionesTemplate = (row) => {
    return (
      <div className="op-actions">
        {/* <Button
          icon="pi pi-eye"
          rounded
          text
          className="op-btn-view"
         // onClick={() => handleViewDetailOperation(row)}
          tooltip="Ver Detalle"
          tooltipOptions={{ position: "top" }}
        /> */}
        <Button
          icon="pi pi-pencil"
          rounded
          text
          className="op-btn-edit"
          onClick={() => handleUpdateOperation(row)}
          tooltip="Actualizar Datos"
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon="pi pi-file"
          rounded
          text
          className="op-btn-docs"
          onClick={() => handleDocumentacion(row)}
          tooltip="Documentación"
          tooltipOptions={{ position: "top" }}
        />

        <Button
          icon="pi pi-dollar"
          rounded
          text
          className="op-btn-liquidacion"
          onClick={() => handleLiquidacion(row)}
          tooltip="Liquidación"
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon="pi pi-check-circle"
          rounded
          text
          className="op-btn-finish"
          onClick={() => handleFinalizarOperacion(row)}
          tooltip="Finalizar Operación"
          tooltipOptions={{ position: "top" }}
          disabled={row.estado !== "En proceso"}
        />
      </div>
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
          onChange={onGlobalFilterChange}
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
      <p className="op-empty-sub">
        Comienza creando tu primera operación aduanera
      </p>
    </div>
  );

  return (
    <MainLayout>
      <div className="op-root">
        {/* HEADER */}
        <div className="op-header">
          <div>
            <div className="op-breadcrumb">
              <span className="op-bc-active">OPERACIONES</span>
              <span className="op-bc-sep">›</span>
            </div>
            <h1 className="op-title">Gestión de Operaciones</h1>
            <p className="op-subtitle">
              Administra tus operaciones aduaneras de importación y exportación.
            </p>
          </div>

          <Button
            label="Nueva Operación"
            icon="pi pi-plus"
            className="op-btn-primary"
            onClick={() => {
              setSelectedOperation(null);
              setCreateDialogVisible(true);
            }}
          />
        </div>

        {/* STATS */}
        <div className="op-stats">
          <div className="op-stat-card">
            <span className="op-stat-label">TOTAL OPERACIONES</span>
            <span className="op-stat-value">{operaciones.length}</span>
          </div>

          <div className="op-stat-card">
            <span className="op-stat-label">INICIADAS</span>
            <span className="op-stat-value">
              {operaciones.filter((o) => o.estado === "Iniciado").length}
            </span>
          </div>

          <div className="op-stat-card">
            <span className="op-stat-label">DOCUMENTACIÓN PENDIENTE</span>
            <span className="op-stat-value">
              {
                operaciones.filter(
                  (o) => o.estado === "Documentación pendiente",
                ).length
              }
            </span>
          </div>

          <div className="op-stat-card">
            <span className="op-stat-label">EN PROCESO</span>
            <span className="op-stat-value">
              {operaciones.filter((o) => o.estado === "En proceso").length}
            </span>
          </div>

          <div className="op-stat-card">
            <span className="op-stat-label">FINALIZADAS</span>
            <span className="op-stat-value">
              {operaciones.filter((o) => o.estado === "Finalizado").length}
            </span>
          </div>
        </div>

        {/* TABLE */}
        {error && <div className="op-error">{error}</div>}

        <DataTable
          value={operaciones}
          header={header}
          emptyMessage={emptyMessage}
          className="op-datatable"
          rowHover
          loading={loading}
          paginator
          paginatorClassName="op-custom-paginator"
          rows={5}
          globalFilter={globalFilterValue}
          globalFilterFields={["nroCarpeta", "nroDua", "cliente.razonSocial"]}
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords}"
          tableStyle={{ tableLayout: "fixed", width: "100%" }}
          sortField="fechaRegistro"
          sortOrder={-1}
        >
          <Column
            header="NRO. CARPETA"
            body={carpetaTemplate}
            sortable
            field="nroCarpeta"
            style={{ width: "100px" }}
          />

          <Column
            header="NRO. DUA"
            body={duaTemplate}
            sortable
            field="nroDua"
            style={{ width: "100px" }}
          />

          <Column
            header="CLIENTE"
            body={clienteTemplate}
            sortable
            field="cliente.razonSocial"
            style={{ width: "150px" }}
          />

          <Column
            header="TIPO OPERACIÓN"
            body={tipoOperacionTemplate}
            style={{ width: "100px" }}
          />

          <Column
            header="TIPO CONOCIMIENTO"
            body={tipoConocimientoTemplate}
            style={{ width: "100px" }}
          />

          <Column
            header="NRO. CONOCIMIENTO"
            body={nroConocimientoTemplate}
            style={{ width: "100px" }}
          />

          <Column
            header="ESTADO"
            body={estadoTemplate}
            field="estado"
            style={{ width: "100px" }}
          />

          <Column
            header="FECHA REGISTRO"
            body={fechaTemplate}
            sortable
            field="fechaRegistro"
            style={{ width: "100px" }}
          />

          <Column
            header="ACCIONES"
            body={accionesTemplate}
            style={{ width: "150px", textAlign: "center" }}
          />
        </DataTable>
      </div>

      {/* DIALOGS */}
      <CreateOperationDialog
        visible={createDialogVisible}
        onHide={() => {
          setCreateDialogVisible(false);
          setSelectedOperation(null);
        }}
        onRefreshOperations={handleOnRefreshOperations}
      />

      <UpdateOperationDialog
        visible={updateDialogVisible}
        onHide={() => {
          setUpdateDialogVisible(false);
          setSelectedOperation(null);
        }}
        onRefreshOperations={handleOnRefreshOperations}
        operationData={selectedOperation}
      />

      <FinalizarOperacionDialog
        visible={finalizarDialogVisible}
        onHide={() => {
          setFinalizarDialogVisible(false);
          setSelectedOperation(null);
        }}
        onRefreshOperations={handleOnRefreshOperations}
        operationData={selectedOperation}
      />

      <SubirDocumentoDialog
        visible={subirDocDialogVisible}
        onHide={() => {
          setSubirDocDialogVisible(false);
          setSelectedOperation(null);
        }}
        operacionId={selectedOperation?.id}
        nroCarpeta={selectedOperation?.nroCarpeta}
      />

      <RegistrarLiquidacionDialog
        visible={liquidacionDialogVisible}
        onHide={() => setLiquidacionDialogVisible(false)}
        operacionId={selectedOperation?.id}
        nroCarpeta={selectedOperation?.nroCarpeta}
        onSuccess={handleOnRefreshOperations}
      />

    </MainLayout>
  );
}
