import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";

export default function ClientSidebar() {
  const navigate = useNavigate();

  const items = [
    { label: "Mis Operaciones", icon: "pi pi-briefcase", path: "/cliente/mis-operaciones" },
    { label: "Documentos", icon: "pi pi-file", path: "/cliente/documentos" },
    { label: "Estado de Cuenta", icon: "pi pi-chart-bar", path: "/cliente/estado-cuenta" },
    { label: "Pago Online", icon: "pi pi-credit-card", path: "/cliente/pago-online" },
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

      <div className="sidebar-footer">
        <div className="sidebar-item" onClick={handleLogout}>
          <i className="pi pi-sign-out"></i>
          <span>CERRAR SESIÓN</span>
        </div>
      </div>
    </div>
  );
}
