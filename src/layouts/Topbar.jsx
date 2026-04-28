export default function Topbar() {
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
          <span>Usuario</span>
          <div className="avatar" />
        </div>
      </div>

    </div>
  );
}