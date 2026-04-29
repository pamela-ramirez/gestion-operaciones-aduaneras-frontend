import { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import UserForm from "../../components/UserForm";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Avatar } from "primereact/avatar";
import "./UsuariosList.css";

const MOCK_USERS = [
  { id: 1, nombre: "Carlos", apellido: "Méndez", email: "carlos@despachoscien.com", rol: "DESPACHANTE", empresa: "Despachos al Cien" },
  { id: 2, nombre: "Ana", apellido: "Torres", email: "ana@importex.com", rol: "CLIENTE", empresa: "Importex SA" },
];

export default function UsuariosList() {
  const [users, setUsers] = useState(MOCK_USERS); //inicialmente con datos mock, luego traer de la API
  const [formVisible, setFormVisible] = useState(false); // controla visibilidad del formulario de creación

  const handleCreated = (newUser) => {
    setUsers((prev) => [...prev, { ...newUser, id: Date.now() }]); // agregar nuevo usuario a la lista (en real, se debería obtener el ID del backend)
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Eliminar este usuario?")) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  // ---- COLUMN TEMPLATES ----

  const usuarioTemplate = (row) => (
    <div className="ul-user-cell">
      <Avatar
        label={`${row.nombre?.[0] ?? ""}${row.apellido?.[0] ?? ""}`.toUpperCase()}
        shape="circle"
        className={`ul-avatar ul-avatar-${row.rol === "DESPACHANTE" ? "desp" : "cli"}`}
      />
      <div>
        <p className="ul-cell-name">{row.nombre} {row.apellido}</p>
        <p className="ul-cell-email">{row.email}</p>
      </div>
    </div>
  );

  const rolTemplate = (row) => (
    <Tag
      value={row.rol === "DESPACHANTE" ? "Despachante" : "Cliente"}
      className={`ul-tag ul-tag-${row.rol === "DESPACHANTE" ? "desp" : "cli"}`}
    />
  );

  const empresaTemplate = (row) => (
    <span className="ul-cell-muted">{row.empresa || "—"}</span>
  );

  const accionesTemplate = (row) => (
    <Button
      icon="pi pi-trash"
      className="ul-btn-delete"
      text
      severity="danger"
      onClick={() => handleDelete(row.id)}
      tooltip="Eliminar usuario"
      tooltipOptions={{ position: "left" }}
    />
  );

  const header = (
    <div className="ul-table-header">
      <span className="ul-table-count">
        <i className="pi pi-users" />
        {users.length} usuario{users.length !== 1 ? "s" : ""}
      </span>
    </div>
  );

  const emptyMessage = (
    <div className="ul-empty">
      <i className="pi pi-users ul-empty-icon" />
      <p className="ul-empty-title">Sin usuarios registrados</p>
      <p className="ul-empty-sub">Creá el primer usuario para comenzar.</p>
      <Button
        label="Crear usuario"
        icon="pi pi-plus"
        className="ul-btn-primary"
        onClick={() => setFormVisible(true)}
      />
    </div>
  );

  return (
    <MainLayout>
      <div className="ul-root">

        {/* PAGE HEADER */}
        <div className="ul-header">
          <div>
            <div className="ul-breadcrumb">
             {/*  <span className="ul-bc-dim">SISTEMA</span>
              <span className="ul-bc-sep">›</span> */}
              <span className="ul-bc-active">USUARIOS</span>
              <span className="ul-bc-sep">›</span>
            </div>
            <h1 className="ul-title">Gestión de Usuarios</h1>
            <p className="ul-subtitle">Administra los accesos y roles del sistema.</p>
          </div>

          <Button
            label="Nuevo Usuario"
            icon="pi pi-plus"
            iconPos="left"
            className="ul-btn-primary"
            onClick={() => setFormVisible(true)}
          />
        </div>

        {/* STATS */}
        <div className="ul-stats">
          <div className="ul-stat-card">
            <span className="ul-stat-label">TOTAL</span>
            <span className="ul-stat-value">{users.length}</span>
          </div>
          <div className="ul-stat-card">
            <span className="ul-stat-label">DESPACHANTES</span>
            <span className="ul-stat-value">{users.filter((u) => u.rol === "DESPACHANTE").length}</span>
          </div>
          <div className="ul-stat-card">
            <span className="ul-stat-label">CLIENTES</span>
            <span className="ul-stat-value">{users.filter((u) => u.rol === "CLIENTE").length}</span>
          </div>
        </div>

        {/* DATA TABLE */}
        <DataTable
          value={users} 
          header={header}
          emptyMessage={emptyMessage}
          className="ul-datatable"
          rowHover
        >
          <Column header="USUARIO" body={usuarioTemplate} />
          <Column header="EMPRESA" body={empresaTemplate} />
          <Column header="ROL" body={rolTemplate} style={{ width: "150px" }} />
          <Column body={accionesTemplate} style={{ width: "60px" }} />
        </DataTable>

      </div>

      <UserForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onCreated={handleCreated}
      />
    </MainLayout>
  );
}

