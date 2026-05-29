import { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { obtenerClientes } from "../../services/clienteService";
import { obtenerTiposOperacion } from "../../services/tipoOperacionService";
import "./FiltrosOperacion.css";

// Opciones fijas de estado — deben coincidir EXACTAMENTE con los nombres del enum del backend
const OPCIONES_ESTADO = [
  { label: "Iniciado",                  value: "Iniciado" },
  { label: "Documentación pendiente",   value: "DocumentacionPendiente" },
  { label: "En proceso",                value: "EnProceso" },
  { label: "Finalizado",                value: "Finalizado" },
];

// Valores iniciales vacíos del formulario de filtros
const FILTROS_VACIOS = {
  clienteId:       null,
  tipoOperacionId: null,
  estado:          null,
  fechaDesde:      null,
  fechaHasta:      null,
};

export default function FiltrosOperacion({ onBuscar, onLimpiar }) {
  // Estado del panel: abierto o cerrado
  const [expandido, setExpandido] = useState(false);

  // Valores actuales de cada filtro
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);

  // Datos para los dropdowns (se cargan desde el backend)
  const [clientes, setClientes] = useState([]);
  const [tiposOperacion, setTiposOperacion] = useState([]);

  // Para mostrar error si hay rango de fechas inválido
  const [errorFecha, setErrorFecha] = useState("");

  // Cargamos clientes y tipos de operación cuando se monta el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [clientesData, tiposData] = await Promise.all([
          obtenerClientes(),
          obtenerTiposOperacion(),
        ]);

        // Transformamos al formato que espera el Dropdown de PrimeReact: { label, value }
        setClientes(
          clientesData.map((c) => ({
            label: c.razonSocial || `${c.nombre} ${c.apellido}`,
            value: c.id,
          }))
        );

        setTiposOperacion(
          tiposData.map((t) => ({
            label: t.descripcion,
            value: t.id,
          }))
        );
      } catch (error) {
        console.error("Error cargando datos para filtros:", error);
      }
    };

    cargarDatos();
  }, []);

  // Actualiza el valor de un filtro específico
  const handleCambio = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
    setErrorFecha(""); // limpiamos el error cuando el usuario cambia algo
  };

  // Valida las fechas y llama a la función del padre con los filtros
  const handleBuscar = () => {
    // Validamos que fechaDesde no sea mayor que fechaHasta
    if (filtros.fechaDesde && filtros.fechaHasta) {
      if (filtros.fechaDesde > filtros.fechaHasta) {
        setErrorFecha("La fecha desde no puede ser mayor que la fecha hasta.");
        return;
      }
    }

    // Preparamos el objeto para mandar al backend
    // Las fechas las convertimos a string ISO (solo la parte de la fecha: YYYY-MM-DD)
    const filtrosParaEnviar = {
      clienteId:       filtros.clienteId       || null,
      tipoOperacionId: filtros.tipoOperacionId || null,
      estado:          filtros.estado          || null,
      fechaDesde:      filtros.fechaDesde
        ? filtros.fechaDesde.toISOString().split("T")[0]
        : null,
      fechaHasta:      filtros.fechaHasta
        ? filtros.fechaHasta.toISOString().split("T")[0]
        : null,
    };

    onBuscar(filtrosParaEnviar);
  };

  // Limpia todos los filtros y le avisa al padre
  const handleLimpiar = () => {
    setFiltros(FILTROS_VACIOS);
    setErrorFecha("");
    onLimpiar();
  };

  // Cuenta cuántos filtros están activos (para mostrar en el botón)
  const cantidadFiltrosActivos = Object.values(filtros).filter(
    (v) => v !== null && v !== ""
  ).length;

  return (
    <div className="fil-root">
      {/* ── Botón para expandir/colapsar el panel ── */}
      <button
        className={`fil-toggle ${expandido ? "fil-toggle--abierto" : ""}`}
        onClick={() => setExpandido((prev) => !prev)}
      >
        <span className="fil-toggle-left">
          <i className="pi pi-filter" />
          <span>Filtros avanzados</span>
          {/* Muestra cuántos filtros están activos aunque el panel esté cerrado */}
          {cantidadFiltrosActivos > 0 && (
            <span className="fil-badge">{cantidadFiltrosActivos}</span>
          )}
        </span>
        <i className={`pi ${expandido ? "pi-chevron-up" : "pi-chevron-down"} fil-toggle-icon`} />
      </button>

      {/* ── Panel de filtros (solo visible cuando está expandido) ── */}
      {expandido && (
        <div className="fil-panel">
          <div className="fil-grid">
            {/* Filtro: Cliente */}
            <div className="fil-campo">
              <label className="fil-label">Cliente</label>
              <Dropdown
                value={filtros.clienteId}
                options={clientes}
                onChange={(e) => handleCambio("clienteId", e.value)}
                placeholder="Todos los clientes"
                filter                      // permite escribir para buscar
                showClear                   // botón X para limpiar
                className="fil-dropdown"
              />
            </div>

            {/* Filtro: Tipo de operación */}
            <div className="fil-campo">
              <label className="fil-label">Tipo de operación</label>
              <Dropdown
                value={filtros.tipoOperacionId}
                options={tiposOperacion}
                onChange={(e) => handleCambio("tipoOperacionId", e.value)}
                placeholder="Todos los tipos"
                showClear
                className="fil-dropdown"
              />
            </div>

            {/* Filtro: Estado */}
            <div className="fil-campo">
              <label className="fil-label">Estado</label>
              <Dropdown
                value={filtros.estado}
                options={OPCIONES_ESTADO}
                onChange={(e) => handleCambio("estado", e.value)}
                placeholder="Todos los estados"
                showClear
                className="fil-dropdown"
              />
            </div>

            {/* Filtro: Fecha desde */}
            <div className="fil-campo">
              <label className="fil-label">Fecha desde</label>
              <Calendar
                value={filtros.fechaDesde}
                onChange={(e) => handleCambio("fechaDesde", e.value)}
                placeholder="dd/mm/aaaa"
                dateFormat="dd/mm/yy"
                showIcon
                className="fil-calendar"
              />
            </div>

            {/* Filtro: Fecha hasta */}
            <div className="fil-campo">
              <label className="fil-label">Fecha hasta</label>
              <Calendar
                value={filtros.fechaHasta}
                onChange={(e) => handleCambio("fechaHasta", e.value)}
                placeholder="dd/mm/aaaa"
                dateFormat="dd/mm/yy"
                showIcon
                className="fil-calendar"
              />
            </div>
          </div>

          {/* Error de fechas */}
          {errorFecha && (
            <p className="fil-error">
              <i className="pi pi-exclamation-circle" /> {errorFecha}
            </p>
          )}

          {/* Botones de acción */}
          <div className="fil-acciones">
            <Button
              label="Limpiar"
              icon="pi pi-times"
              className="fil-btn-limpiar"
              onClick={handleLimpiar}
              text
            />
            <Button
              label="Buscar"
              icon="pi pi-search"
              className="fil-btn-buscar"
              onClick={handleBuscar}
            />
          </div>
        </div>
      )}
    </div>
  );
}
