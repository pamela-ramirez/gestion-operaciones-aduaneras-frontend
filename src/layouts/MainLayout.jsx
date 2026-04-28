import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./layout.css";

export default function MainLayout({ children }) {
  return (
    <div className="layout-container">
      <Sidebar />

      <div className="layout-main">
        <Topbar />
        <div className="layout-content">
          {children}
        </div>
      </div>
    </div>
  );
}