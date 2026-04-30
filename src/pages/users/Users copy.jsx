import { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import UserForm from "../../components/UserForm";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Avatar } from "primereact/avatar";
import { getUsers } from "../../services/userService";
import { getRoles } from "../../services/roleService";
import "./Users.css";

export default function Users() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formVisible, setFormVisible] = useState(false); // controla visibilidad del formulario de creación

  // Carga los usuarios desde el backend
  const cargarUsuarios = async () => {
    setLoading(true);
    setError(null);

    try {
      const usuariosbackend = await getUsers();
      console.log("USUARIOS BACKEND:", usuariosbackend);
      setUsuarios(Array.isArray(usuariosbackend) ? usuariosbackend : []);
    } catch (err) {
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Carga los roles desde el backend 
  const cargarRoles = async () => {
    try {
      const rolesBackend = await getRoles();
      console.log("ROLES BACKEND:", rolesBackend);
      setRoles(Array.isArray(rolesBackend) ? rolesBackend : []);
    } catch (err) {
      setError("No se pudieron cargar los roles.");
    } 
  };

  useEffect(() => {
    cargarRoles();
  }, []);


  const handleNuevoUsuario = (newUser) => {
    setUsuarios((prev) => [...prev, newUser]); // Agregar el nuevo usuario a la lista existente
  };

  // Función para obtener el label del rol desde el array dinámico
  const getRolLabel = (rolValue) => {
    const rol = roles.find((r) => r.value === rolValue);
    return rol ? rol.label : rolValue;
  };

  // Función para determinar la clase CSS del rol
  const getRolType = (rolValue) => {
    return rolValue === "Despachante" ? "desp" : "cli";
  };

/*   const handleDelete = (id) => {
    if (window.confirm("¿Eliminar este usuario?")) {
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
    }
  }; */

  // ---- COLUMN TEMPLATES ----

  const usuarioTemplate = (row) => (
    <div className="ul-user-cell">
      <Avatar
        label={`${row.nombre?.[0] ?? ""}${row.apellido?.[0] ?? ""}`.toUpperCase()}
        shape="circle"
        className={`ul-avatar ul-avatar-${getRolType(row.rol)}`}
      />
      <div>
        <p className="ul-cell-name">
          {row.nombre} {row.apellido}
        </p>
        <p className="ul-cell-email">{row.email}</p>
      </div>
    </div>
  );

  const rolTemplate = (row) => (
    <Tag
      value={getRolLabel(row.rol)}
      className={`ul-tag ul-tag-${getRolType(row.rol)}`}
    />
  );

  const empresaTemplate = (row) => (
    <span className="ul-cell-muted">{row.empresa || "—"}</span>
  );

  //validar acciones según rol del usuario logueado (solo admin puede eliminar)
  //confirmar si se elimina o se deshabilita el usuario (mejor opción para no perder datos históricos)
/*   const accionesTemplate = (row) => (
    <Button
      icon="pi pi-trash"
      className="ul-btn-delete"
      text
      severity="danger"
      onClick={() => handleDelete(row.id)}
    />
  ); */

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
            <p className="ul-subtitle">
              Administra los accesos y roles del sistema.
            </p>
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

        {/* DATA TABLE */}
        {error && <div className="ul-error">{error}</div>}
        <DataTable
          value={usuarios}
          header={header}
          emptyMessage={emptyMessage}
          className="ul-datatable"
          rowHover
          loading={loading}
        >
          <Column header="USUARIO" body={usuarioTemplate} />
          <Column header="EMPRESA" body={empresaTemplate} />
          <Column header="ROL" body={rolTemplate} style={{ width: "150px" }} />
          {/* <Column body={accionesTemplate} style={{ width: "60px" }} /> */}
        </DataTable>
      </div>

      <InviteUserDialog
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onCreated={handleNuevoUsuario}
        roles={roles.filter(r => r.label !== "Administrador" && r.label !== "Admin" && r.label !== "Asistente")} 
        // Excluir rol Admin del dropdown y 
        // por ahora asistente tambien porque se eliminara en el backend, 
        // despues eliminar este filtro porque ya no estara disponible ese rol
      />

    </MainLayout>
  );
}
