import { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import EditClientDialog from "../../components/clients/EditClientDialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { obtenerClientes } from "../../services/clienteService";
import "./Clients.css";

export default function Clients() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  // =========================
  // LOAD DATA
  // =========================

  const cargarClientes = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await obtenerClientes();
      setClientes(Array.isArray(data) ? data : []);
    } catch {
      setError("No se pudieron cargar los clientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  // =========================
  // HANDLERS
  // =========================

  const handleOnRefreshClients = async () => {
    setDialogVisible(false);
    setSelectedClient(null);
    await cargarClientes();
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setDialogVisible(true);
  };

  const handleDisableClient = async (client) => {
    // Implementar lógica de deshabilitar cliente
    console.log("Deshabilitar cliente:", client);
  };

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  // =========================
  // TEMPLATES
  // =========================

  const razonSocialTemplate = (row) => {
    return (
      <div className="cl-main-cell">
        <div className="cl-company-icon">
          <i className="pi pi-building" />
        </div>
        <div>
          <p className="cl-cell-name">{row.razonSocial || "—"}</p>
          <p className="cl-cell-rut">{row.rut || "—"}</p>
        </div>
      </div>
    );
  };

  const direccionTemplate = (row) => (
    <span className="cl-cell-muted">{row.direccion || "—"}</span>
  );

  const contactoTemplate = (row) => {
    const nombreCompleto =
      row.nombre && row.apellido
        ? `${row.nombre} ${row.apellido}`
        : "—";

    return (
      <div className="cl-contact-cell">
        <p className="cl-cell-contact-name">{nombreCompleto}</p>
        <p className="cl-cell-contact-detail">
          <i className="pi pi-phone" />
          {row.telefono || "—"}
        </p>
        <p className="cl-cell-contact-detail">
          <i className="pi pi-envelope" />
          {row.email || "—"}
        </p>
      </div>
    );
  };

   const estadoTemplate = (row) => (
    <span className="cl-cell-muted">{row.estado || "—"}</span>
  );


  const accionesTemplate = (row) => {
    return (
      <div className="cl-actions">
        <Button
          icon="pi pi-pencil"
          rounded
          text
          className="cl-btn-edit"
          onClick={() => handleEditClient(row)}
          tooltip="Editar"
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon="pi pi-ban"
          rounded
          text
          className="cl-btn-disable"
          onClick={() => handleDisableClient(row)}
          tooltip="Deshabilitar"
          tooltipOptions={{ position: "top" }}
        />
      </div>
    );
  };

  // =========================
  // UI
  // =========================

  const header = (
    <div className="cl-table-header">
      <span className="cl-table-count">
        <i className="pi pi-building" />
        {clientes.length} cliente{clientes.length !== 1 ? "s" : ""}
      </span>

      <IconField iconPosition="left">
        <InputIcon className="pi pi-search" />
        <InputText
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder="Buscar por razón social, RUT o contacto..."
          className="cl-search-input"
        />
      </IconField>
    </div>
  );

  const emptyMessage = (
    <div className="cl-empty">
      <i className="pi pi-building cl-empty-icon" />
      <p className="cl-empty-title">Sin clientes registrados</p>
      <p className="cl-empty-sub">
        Comienza agregando tu primer cliente al sistema
      </p>
    </div>
  );

  return (
    <MainLayout>
      <div className="cl-root">
        {/* HEADER */}
        <div className="cl-header">
          <div>
            <div className="cl-breadcrumb">
              <span className="cl-bc-active">CLIENTES</span>
              <span className="cl-bc-sep">›</span>
            </div>
            <h1 className="cl-title">Gestión de Clientes</h1>
            <p className="cl-subtitle">
              Administra la información de tus clientes y sus contactos.
            </p>
          </div>

          {/* <Button
            label="Nuevo Cliente"
            icon="pi pi-plus"
            className="cl-btn-primary"
            onClick={() => {
              setSelectedClient(null);
              setDialogVisible(true);
            }}
          /> */}
        </div>

        {/* STATS */}
        <div className="cl-stats">
          <div className="cl-stat-card">
            <span className="cl-stat-label">TOTAL CLIENTES</span>
            <span className="cl-stat-value">{clientes.length}</span>
          </div>

          <div className="cl-stat-card">
            <span className="cl-stat-label">ACTIVOS</span>
            <span className="cl-stat-value">
              {clientes.filter((c) => c.estado === "Activo").length}
            </span>
          </div>

             <div className="cl-stat-card">
            <span className="cl-stat-label">PENDIENTES</span>
            <span className="cl-stat-value">
              {clientes.filter((c) => c.estado === "Pendiente").length}
            </span>
          </div>

          <div className="cl-stat-card">
            <span className="cl-stat-label">INACTIVOS</span>
            <span className="cl-stat-value">
              {clientes.filter((c) => c.estado === "Inactivo").length}
            </span>
          </div>
        </div>

        {/* TABLE */}
        {error && <div className="cl-error">{error}</div>}

        <DataTable
          value={clientes}
          header={header}
          emptyMessage={emptyMessage}
          className="cl-datatable"
          rowHover
          loading={loading}
          paginator
          paginatorClassName="custom-paginator"
          rows={4}
          globalFilter={globalFilterValue}
          globalFilterFields={[
            "razonSocial",
            "rut",
            "nombre",
            "apellido"
          ]}
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords}"
          tableStyle={{ tableLayout: "fixed", width: "100%" }}
          sortField="razonSocial"
          sortOrder={1}
        >
          <Column
            header="RAZÓN SOCIAL"
            body={razonSocialTemplate}
            sortable
            field="razonSocial"
            style={{ width: "280px" }}
          />

          <Column
            header="DIRECCIÓN"
            body={direccionTemplate}
            style={{ width: "220px" }}
          />

          <Column
            header="CONTACTO"
            body={contactoTemplate}
            sortable
            field="nombre"
            style={{ width: "280px" }}
          />

          <Column
            header="ESTADO"
            body={estadoTemplate}
            field="estado"
            style={{ width: "220px" }}
          />

          <Column
            header="ACCIONES"
            body={accionesTemplate}
            style={{ width: "120px", textAlign: "center" }}
          />
        </DataTable>
      </div>

      {/* DIALOG */}
      <EditClientDialog
        visible={dialogVisible}
        onHide={() => {
          setDialogVisible(false);
          setSelectedClient(null);
        }}
        onRefreshClients={handleOnRefreshClients}
        clientData={selectedClient}
      />
    </MainLayout>
  );
}
