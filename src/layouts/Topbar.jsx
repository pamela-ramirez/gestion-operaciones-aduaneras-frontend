import { obtenerUsuarioStorage } from "../utils/auth";

export default function Topbar() {
  const usuario = obtenerUsuarioStorage();
  const nombreUsuario = usuario?.email?.split("@")[0] || "Usuario";

  return (
    <div className="topbar">
      <div className="topbar-search">
        {/*  <i className="pi pi-search" />
        <input placeholder="Buscar despacho o DUA..." /> */}
      </div>

      <div className="topbar-right">
        <i className="pi pi-bell"></i>
        {/*   <i className="pi pi-cog"></i> */}

        <div className="user">
          <span>{nombreUsuario}</span>
          <div className="avatar" />
        </div>
      </div>
    </div>
  );
}
