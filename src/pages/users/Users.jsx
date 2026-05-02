import { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import CreateUserDialog from "../../components/users/CreateUserDialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Avatar } from "primereact/avatar";
import { getUsuarios } from "../../services/userService";
import { getRoles } from "../../services/roleService";
import "./Users.css";

export default function Users() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  // =========================
  // LOAD DATA
  // =========================

  const cargarUsuarios = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getUsuarios();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch {
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  const cargarRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch {
      setError("No se pudieron cargar los roles.");
    }
  };

  useEffect(() => {
    cargarUsuarios();
    cargarRoles();
  }, []);

  // =========================
  // HANDLERS
  // =========================

  const handleUserCreated = async () => {
    setDialogVisible(false);
    await cargarUsuarios(); // recargar desde backend
  };

  const getRolLabel = (rolValue) => {
    const rol = roles.find((r) => r.value === rolValue);
    return rol ? rol.label : rolValue;
  };

  const getRolType = (rolValue) => {
    return rolValue === "Despachante" ? "desp" : "cli";
  };

  // =========================
  // TEMPLATES
  // =========================

  const usuarioTemplate = (row) => {
    const nombreCompleto =
      row.nombre && row.apellido
        ? `${row.nombre} ${row.apellido}`
        : row.rol === "Admin"
          ? "Admin"
          : "Pendiente";

    return (
      <div className="ul-user-cell">
        <Avatar
          label={
            row.nombre
              ? `${row.nombre[0]}${row.apellido?.[0] ?? ""}`
              : row.rol === "Admin"
                ? "A"
                : "[?]"
          }
          shape="circle"
          className={`ul-avatar ul-avatar-${getRolType(row.rol)}`}
        />
        <div>
          <p className="ul-cell-name">{nombreCompleto}</p>
          <p className="ul-cell-email">{row.email}</p>
        </div>
      </div>
    );
  };

/*   const usernameTemplate = (row) => (
    <span className="ul-username">{row.username || "—"}</span>
  ); */

  const rolTemplate = (row) => (
    <Tag
      value={getRolLabel(row.rol)}
      className={`ul-tag ul-tag-${getRolType(row.rol)}`}
    />
  );

  const fechaTemplate = (row) => {
    if (!row.fechaCreacion) return "—";

    const date = new Date(row.fechaCreacion);

    return <span className="ul-cell-muted">{date.toLocaleDateString()}</span>;
  };

  const estadoTemplate = (row) => {
    let label = row.estado;
    let severity = "secondary";

    if (row.estado === "Activo") {
      severity = "success";
    } else if (row.estado === "PENDIENTE") {
      label = "Pendiente";
      severity = "warning";
    }

    if (row.primerLogin === true && row.estado === "Activo") {
      label = "Debe cambiar contraseña";
      severity = "info";
    }

    return <Tag value={label} severity={severity} />;
  };

  // =========================
  // UI
  // =========================

  const header = (
    <div className="ul-table-header">
      <span className="ul-table-count">
        <i className="pi pi-users" />
        {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""}
      </span>
    </div>
  );

  const emptyMessage = (
    <div className="ul-empty">
      <i className="pi pi-users ul-empty-icon" />
      <p className="ul-empty-title">Sin usuarios registrados</p>
    </div>
  );

  return (
    <MainLayout>
      <div className="ul-root">
        {/* HEADER */}
        <div className="ul-header">
          <div>
            <div className="ul-breadcrumb">
              <span className="ul-bc-active">USUARIOS</span>
              <span className="ul-bc-sep">›</span>
            </div>
            <h1 className="ul-title">Gestión de Usuarios</h1>
            <p className="ul-subtitle">
              Administra los accesos y roles del sistema.
            </p>
          </div>

          <Button
            label="Nuevo Usuario"
            icon="pi pi-plus"
            className="ul-btn-primary"
            onClick={() => setDialogVisible(true)}
          />
        </div>

        {/* STATS */}
        <div className="ul-stats">
          <div className="ul-stat-card">
            <span className="ul-stat-label">TOTAL</span>
            <span className="ul-stat-value">{usuarios.length}</span>
          </div>

          <div className="ul-stat-card">
            <span className="ul-stat-label">DESPACHANTES</span>
            <span className="ul-stat-value">
              {usuarios.filter((u) => u.rol === "Despachante").length}
            </span>
          </div>

          <div className="ul-stat-card">
            <span className="ul-stat-label">CLIENTES</span>
            <span className="ul-stat-value">
              {usuarios.filter((u) => u.rol === "Cliente").length}
            </span>
          </div>
        </div>

        {/* TABLE */}
        {error && <div className="ul-error">{error}</div>}

        <DataTable
          value={usuarios}
          header={header}
          emptyMessage={emptyMessage}
          className="ul-datatable"
          rowHover
          loading={loading}
          tableStyle={{ tableLayout: "fixed", width: "100%" }}
        >
          <Column header="USUARIO" body={usuarioTemplate} style={{ width: "250px" }}/>
{/* 
          <Column header="USERNAME" body={usernameTemplate} /> */}

          <Column header="ROL" body={rolTemplate} style={{ width: "160px" }} />

          <Column
            header="ESTADO"
            body={estadoTemplate}
            style={{ width: "160px" }}
          />

          <Column
            header="FECHA CREACION"
            body={fechaTemplate}
            style={{ width: "160px" }}
          />
        </DataTable>
      </div>

      {/* DIALOG */}
      <CreateUserDialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        onCreated={handleUserCreated}
        roles={roles.filter((r) => r.value !== "Admin")}
      />
    </MainLayout>
  );
}
