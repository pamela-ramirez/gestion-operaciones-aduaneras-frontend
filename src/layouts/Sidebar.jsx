import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";

export default function Sidebar() {
  const navigate = useNavigate();

  const items = [
    { label: "Tablero", icon: "pi pi-home", path: "/home" },
    { label: "Clientes", icon: "pi pi-users", path: "/clientes" },
    { label: "Operaciones", icon: "pi pi-briefcase", path: "/operaciones" },
    { label: "Documentos", icon: "pi pi-file", path: "/documentos" },
    { label: "Finanzas", icon: "pi pi-wallet", path: "/finanzas" },
    {
      label: "Comunicaciones",
      icon: "pi pi-comments",
      path: "/comunicaciones",
    },
    { label: "Auditoría", icon: "pi pi-search", path: "/auditoria" },
  ];

  const handleLogout = () => {
    const confirm = window.confirm("¿Seguro que quieres cerrar sesión?");
    if (!confirm) return;

    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">DESPACHOS AL CIEN</div>

      <div className="sidebar-menu">
        {items.map((item) => (
          <div
            key={item.label}
            className="sidebar-item"
            onClick={() => navigate(item.path)}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* gestion usuarios */}
      <div style={{ marginTop: "100px" }}>
        <div className="sidebar-item" onClick={() => navigate("/usuarios")}>
          <i className="pi pi-id-card"></i>
          <span>Usuarios</span>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-item" onClick={handleLogout}>
          <i className="pi pi-sign-out"></i>
          <span>CERRAR SESIÓN</span>
        </div>
      </div>
    </div>
  );
}
