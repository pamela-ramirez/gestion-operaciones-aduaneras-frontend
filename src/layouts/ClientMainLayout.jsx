import ClientSidebar from "./ClientSidebar";
import Topbar from "./Topbar";
import "./layout.css";

export default function ClientMainLayout({ children }) {
  return (
    <div className="layout-container">
      <ClientSidebar />

      <div className="layout-main">
        <Topbar />
        <div className="layout-content">
          {children}
        </div>
      </div>
    </div>
  );
}