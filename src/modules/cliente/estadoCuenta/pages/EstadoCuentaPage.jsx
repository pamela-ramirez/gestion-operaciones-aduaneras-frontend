import { useState, useEffect } from "react";
import ClientMainLayout from "../../../../layouts/ClientMainLayout";

import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { Message } from "primereact/message";
import { Divider } from "primereact/divider";
import { ProgressSpinner } from "primereact/progressspinner";

import {
  obtenerEstadoCuenta,
  calcularTotales,
} from "../services/estadoCuentaService";

import "./EstadoCuentaPage.css";

const MESES = [
  { label: "Enero", value: 1 },
  { label: "Febrero", value: 2 },
  { label: "Marzo", value: 3 },
  { label: "Abril", value: 4 },
  { label: "Mayo", value: 5 },
  { label: "Junio", value: 6 },
  { label: "Julio", value: 7 },
  { label: "Agosto", value: 8 },
  { label: "Septiembre", value: 9 },
  { label: "Octubre", value: 10 },
  { label: "Noviembre", value: 11 },
  { label: "Diciembre", value: 12 },
];

const ANOS = Array.from({ length: 5 }, (_, i) => {
  const year = new Date().getFullYear() - 2 + i;

  return {
    label: year.toString(),
    value: year,
  };
});

export default function EstadoCuentaPage() {
  const today = new Date();

  const [mes, setMes] = useState(today.getMonth() + 1);
  const [anio, setAnio] = useState(today.getFullYear());

  const [estadoCuenta, setEstadoCuenta] = useState(null);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  //const [loading, setLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  /*  useEffect(() => {
    cargarEstadoCuenta();
  }, [mes, anio]); */

  const cargarEstadoCuenta = async () => {
    try {
      setLoading(true);

      const data = await obtenerEstadoCuenta(mes, anio);

      setEstadoCuenta(data);

      setBusquedaRealizada(true);

      setError(null);
    } catch (err) {
      console.error(err);

      setError("Error al cargar el estado de cuenta");

      setBusquedaRealizada(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  const obtenerFechaInicio = () => {
    return new Date(anio, mes - 1, 1);
  };

  const obtenerFechaFin = () => {
    return new Date(anio, mes, 0);
  };

  const getSeverityByDocumento = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case "factura":
        return "danger";

      case "recibo":
        return "success";

      case "anticipo":
        return "warning";

      default:
        return "info";
    }
  };

  const movimientos =
    estadoCuenta?.carpetas.flatMap((carpeta) => {
      const filas = [];

      filas.push({
        tipoFila: "header",
        nroCarpeta: carpeta.nroCarpeta,
      });

      carpeta.movimientos.forEach((mov) => {
        filas.push({
          ...mov,
          tipoFila: "movimiento",
          nroCarpeta: carpeta.nroCarpeta,
        });
      });

      filas.push({
        tipoFila: "footer",
        nroCarpeta: carpeta.nroCarpeta,
        saldoCarpeta: carpeta.saldoCarpeta,
      });

      return filas;
    }) || [];

  const totales = estadoCuenta ? calcularTotales(estadoCuenta) : null;

  const documentoBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.tipoDocumento}
        severity={getSeverityByDocumento(rowData.tipoDocumento)}
      />
    );
  };

  const currencyBodyTemplate = (field) => {
    return (rowData) =>
      rowData[field] > 0 ? formatCurrency(rowData[field]) : "-";
  };

  return (
    <ClientMainLayout>
      <div className="ec-root">
        {/* HEADER */}

        <div className="ec-header">
          <div className="ec-breadcrumb">
            <span className="ec-bc-dim">CLIENTE</span>

            <span className="ec-bc-sep">/</span>

            <span className="ec-bc-active">ESTADO DE CUENTA</span>
          </div>

          <h1 className="ec-title">Estado de Cuenta por Carpeta</h1>

          <p className="ec-subtitle">Movimientos con Anticipos</p>
        </div>

        {/* TOOLBAR */}

        <div className="ec-toolbar">
          <div className="ec-filters">
            <div className="ec-filter-group">
              <label>Mes</label>

              <Dropdown
                value={mes}
                options={MESES}
                onChange={(e) => setMes(e.value)}
                className="ec-dropdown"
              />
            </div>

            <div className="ec-filter-group">
              <label>Año</label>

              <Dropdown
                value={anio}
                options={ANOS}
                onChange={(e) => setAnio(e.value)}
                className="ec-dropdown"
              />
            </div>

            <Button
              label="Generar"
              icon="pi pi-refresh"
              onClick={cargarEstadoCuenta}
              loading={loading}
              className="ec-btn-primary"
            />
          </div>
        </div>

        {/* EMPTY STATE */}
        {!busquedaRealizada && (
          <div className="ec-empty-state">
            <i className="pi pi-wallet ec-empty-icon"></i>

            <h3>Generá un estado de cuenta</h3>

            <p>Seleccioná un mes y año para consultar los movimientos.</p>
          </div>
        )}

        {/* ERROR */}

        {error && <Message severity="error" text={error} className="w-full" />}

        {/* LOADING */}

        {loading && busquedaRealizada && (
          <div className="ec-loading">
            <ProgressSpinner />

            <p>Cargando estado de cuenta...</p>
          </div>
        )}

        {/* CONTENIDO */}

        {busquedaRealizada && !loading && estadoCuenta && (
          <>
            {/* RESUMEN */}

            <div className="ec-summary-inline">
              <div className="ec-summary-item">
                <span className="ec-summary-label">Cliente:</span>

                <span className="ec-summary-value">
                  {estadoCuenta.cliente.rut} -{" "}
                  {estadoCuenta.cliente.razonSocial}
                </span>
              </div>

              <div className="ec-summary-item">
                <span className="ec-summary-label">Período:</span>

                <span className="ec-summary-value">
                  {formatDate(obtenerFechaInicio())} al{" "}
                  {formatDate(obtenerFechaFin())}
                </span>
              </div>

              <div className="ec-summary-item">
                <span className="ec-summary-label">Saldo anterior:</span>

                <span className="ec-summary-balance">
                  $ {formatCurrency(estadoCuenta.saldoAnterior)}
                </span>
              </div>
            </div>

            {/* TABLA */}

            <div className="ec-table-wrapper">
              <DataTable
                value={movimientos}
                stripedRows
                size="small"
                className="ec-datatable"
                rowClassName={(rowData) => {
                  if (rowData.tipoFila === "header") {
                    return "ec-row-group-header";
                  }

                  if (rowData.tipoFila === "footer") {
                    return "ec-row-group-footer";
                  }

                  return "";
                }}
              >
                <Column
                  field="nroCarpeta"
                  header="Carpeta"
                  body={(rowData) => {
                    if (rowData.tipoFila === "header") {
                      return (
                        <div className="ec-group-title-inline">
                          <i className="pi pi-folder"></i>

                          <strong>{rowData.nroCarpeta}</strong>
                        </div>
                      );
                    }

                    if (rowData.tipoFila === "footer") {
                      return <strong>Saldo carpeta</strong>;
                    }

                    return rowData.nroCarpeta;
                  }}
                />

                <Column
                  field="fecha"
                  header="Fecha"
                  body={(rowData) =>
                    rowData.tipoFila === "movimiento"
                      ? formatDate(rowData.fecha)
                      : ""
                  }
                />

                <Column
                  field="tipoDocumento"
                  header="Documento"
                  body={(rowData) =>
                    rowData.tipoFila === "movimiento"
                      ? documentoBodyTemplate(rowData)
                      : ""
                  }
                />

                <Column
                  field="numero"
                  header="Número"
                  body={(rowData) =>
                    rowData.tipoFila === "movimiento" ? rowData.numero : ""
                  }
                />

                <Column
                  field="detalle"
                  header="Detalle"
                  body={(rowData) =>
                    rowData.tipoFila === "movimiento" ? rowData.detalle : ""
                  }
                />

                <Column
                  field="moneda"
                  header="Mon."
                  body={(rowData) =>
                    rowData.tipoFila === "movimiento" ? rowData.moneda : ""
                  }
                />

                <Column
                  field="debe"
                  header="Debe"
                  body={(rowData) => {
                    if (rowData.tipoFila === "footer") {
                      return (
                        <span className="ec-saldo-carpeta">
                          {formatCurrency(rowData.saldoCarpeta)}
                        </span>
                      );
                    }

                    return rowData.tipoFila === "movimiento"
                      ? currencyBodyTemplate("debe")(rowData)
                      : "";
                  }}
                  bodyStyle={{ textAlign: "right" }}
                />

                <Column
                  field="haber"
                  header="Haber"
                  body={(rowData) =>
                    rowData.tipoFila === "movimiento"
                      ? currencyBodyTemplate("haber")(rowData)
                      : ""
                  }
                  bodyStyle={{ textAlign: "right" }}
                />

                <Column
                  field="anticipo"
                  header="Anticipo"
                  body={(rowData) =>
                    rowData.tipoFila === "movimiento"
                      ? currencyBodyTemplate("anticipo")(rowData)
                      : ""
                  }
                  bodyStyle={{ textAlign: "right" }}
                />
              </DataTable>
            </div>

            {/* TOTALES */}

            <Card className="ec-summary-card mt-4">
              <div className="ec-totales-grid">
                <div className="ec-total-box">
                  <span className="ec-total-label">Total Debe</span>

                  <span className="ec-total-value">
                    {formatCurrency(totales.totalDebe)}
                  </span>
                </div>

                <div className="ec-total-box">
                  <span className="ec-total-label">Total Haber</span>

                  <span className="ec-total-value">
                    {formatCurrency(totales.totalHaber)}
                  </span>
                </div>

                <div className="ec-total-box">
                  <span className="ec-total-label">Total Anticipo</span>

                  <span className="ec-total-value">
                    {formatCurrency(totales.totalAnticipo)}
                  </span>
                </div>
              </div>

              <Divider />

              <div className="ec-saldo-final">
                <span className="ec-saldo-final-label">
                  Saldo Actual (Pendiente de Pago)
                </span>

                <Tag
                  value={formatCurrency(totales.saldoActual)}
                  severity={totales.saldoActual >= 0 ? "danger" : "success"}
                />
              </div>
            </Card>
          </>
        )}
      </div>
    </ClientMainLayout>
  );
}
