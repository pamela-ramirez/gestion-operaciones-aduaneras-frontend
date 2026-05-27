// Este componente es el "panel de liquidación" de cada operación.
// Tiene tres modos que cambian automáticamente según el estado:
//
//  1. SIN LIQUIDACIÓN → muestra RegistrarLiquidacionDialog (formulario de creación)
//  2. CON LIQUIDACIÓN, modo LECTURA → muestra los ítems en modo solo lectura
//  3. CON LIQUIDACIÓN, modo EDICIÓN → los ítems se convierten en inputs editables
//
// Si la liquidación es DEFINITIVA, siempre queda en modo lectura sin botones de edición.

import { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

// Servicios
import { obtenerLiquidacionPorOperacion } from "../../services/operationService";

import {
    actualizarLiquidacion,
    eliminarDetalleLiquidacion,
    marcarLiquidacionDefinitiva,
} from "../../services/liquidacionService";

import RegistrarLiquidacionDialog from "./RegistrarLiquidacionDialog";

import "../../components/operations/OperationDialogs.css";
import "./GestionLiquidacionDialog.css";

// ─── Helpers de formato ───────────────────────────────────────────────────────
const formatMonto = (valor) =>
    `USD ${Number(valor ?? 0).toLocaleString("es-UY", { minimumFractionDigits: 2 })}`;

const formatFecha = (fecha) => {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleDateString("es-UY", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

// ─────────────────────────────────────────────────────────────────────────────
export default function GestionLiquidacionDialog({
    visible,
    onHide,
    operacionId,
    nroCarpeta,
}) {
    const toast = useRef(null);

    // ── Estado principal ───────────────────────────────────────────────────────
    const [liquidacion, setLiquidacion] = useState(null);  // datos del backend
    const [cargando, setCargando] = useState(false);         // spinner de carga inicial
    const [guardando, setGuardando] = useState(false);       // spinner de guardar

    // Modo edición: cuando es true los ítems se muestran como inputs
    const [modoEdicion, setModoEdicion] = useState(false);

    // Copia local de los ítems mientras el usuario edita (no toca el estado original)
    const [itemsEditados, setItemsEditados] = useState([]);

    // Controla si mostramos el sub-dialog de CREAR liquidación
    const [mostrarCrear, setMostrarCrear] = useState(false);

    const [itemAEliminar, setItemAEliminar] = useState(null);

    // ── Cargar la liquidación cuando se abre el dialog ─────────────────────────
    useEffect(() => {
        if (visible && operacionId) {
            cargarLiquidacion();
        }
        // Cuando se cierra, limpiamos el estado
        if (!visible) {
            setLiquidacion(null);
            setModoEdicion(false);
            setItemsEditados([]);
            setMostrarCrear(false);
        }
    }, [visible, operacionId]);

    const cargarLiquidacion = async () => {
        setCargando(true);
        try {
            const data = await obtenerLiquidacionPorOperacion(operacionId);
            setLiquidacion(data ?? null);
        } catch {
            // Si da error 404 significa que no hay liquidación todavía, eso está bien
            setLiquidacion(null);
        } finally {
            setCargando(false);
        }
    };

    // ── Entrar en modo edición ─────────────────────────────────────────────────
    // Hacemos una copia de los ítems actuales para editar sin tocar el original
    const handleActivarEdicion = () => {
        setItemsEditados(
            liquidacion.detalle.map((item) => ({
                id: item.id,           // importante: el id que viene del backend
                descripcion: item.descripcion,
                monto: item.monto,
            }))
        );
        setModoEdicion(true);
    };

    // ── Cancelar edición (descartar cambios) ───────────────────────────────────
    const handleCancelarEdicion = () => {
        setItemsEditados([]);
        setModoEdicion(false);
    };

    // ── Cambiar un campo de un ítem editado ───────────────────────────────────
    const handleCambioItem = (index, campo, valor) => {
        const copia = [...itemsEditados];
        copia[index] = { ...copia[index], [campo]: valor };
        setItemsEditados(copia);
    };

    // ── Agregar un ítem nuevo (solo en modo edición) ──────────────────────────
    const handleAgregarItem = () => {
        setItemsEditados([...itemsEditados, { id: null, descripcion: "", monto: 0 }]);
    };

    // ── Eliminar un ítem en modo edición ──────────────────────────────────────
    // Si el ítem ya existe en el backend (tiene id), lo eliminamos vía API.
    // Si es un ítem nuevo que todavía no se guardó (id === null), solo lo sacamos de la lista local.
    const handleEliminarItem = (index) => {
        const item = itemsEditados[index];

        if (itemsEditados.length === 1) {
            toast.current?.show({
                severity: "warn",
                summary: "Atención",
                detail: "La liquidación debe tener al menos un ítem.",
                life: 3000,
            });
            return;
        }

        // Ítem nuevo sin id: se elimina directo de la lista local, sin llamar al backend
        if (!item.id) {
            setItemsEditados(itemsEditados.filter((_, i) => i !== index));
            return;
        }

        // Ítem que ya existe en el backend: pedimos confirmación
        setItemAEliminar({ ...item, index });
    };

    const confirmarEliminacion = async () => {
        if (!itemAEliminar) return;
        try {
            const liquidacionActualizada = await eliminarDetalleLiquidacion(
                liquidacion.id,
                itemAEliminar.id
            );
            setLiquidacion(liquidacionActualizada);
            setItemsEditados(
                liquidacionActualizada.detalle.map((d) => ({
                    id: d.id,
                    descripcion: d.descripcion,
                    monto: d.monto,
                }))
            );
            toast.current?.show({
                severity: "success",
                summary: "Ítem eliminado",
                detail: "El ítem fue eliminado correctamente.",
                life: 2500,
            });
        } catch (error) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: error.response?.data?.mensaje || "No se pudo eliminar el ítem.",
                life: 4000,
            });
        } finally {
            setItemAEliminar(null); // esto cierra el modal
        }
    };

    // ── Guardar los cambios de edición ────────────────────────────────────────
    const handleGuardarEdicion = async () => {
        // Validación básica
        for (let i = 0; i < itemsEditados.length; i++) {
            if (!itemsEditados[i].descripcion?.trim()) {
                toast.current?.show({
                    severity: "warn",
                    summary: "Validación",
                    detail: `La descripción del ítem ${i + 1} no puede estar vacía.`,
                    life: 3500,
                });
                return;
            }
            if (!itemsEditados[i].monto || itemsEditados[i].monto <= 0) {
                toast.current?.show({
                    severity: "warn",
                    summary: "Validación",
                    detail: `El monto del ítem ${i + 1} debe ser mayor a 0.`,
                    life: 3500,
                });
                return;
            }
        }

        setGuardando(true);
        try {
            const detalleParaEnviar = itemsEditados.map((item) => ({
                id: item.id ?? undefined,  // si es null (ítem nuevo), no mandamos id
                descripcion: item.descripcion.trim(),
                monto: item.monto,
            }));

            const liquidacionActualizada = await actualizarLiquidacion(
                liquidacion.id,
                detalleParaEnviar
            );

            setLiquidacion(liquidacionActualizada);
            setModoEdicion(false);
            setItemsEditados([]);

            toast.current?.show({
                severity: "success",
                summary: "Cambios guardados",
                detail: "La liquidación fue actualizada correctamente.",
                life: 3000,
            });
        } catch (error) {
            toast.current?.show({
                severity: "error",
                summary: "Error al guardar",
                detail: error.response?.data?.mensaje || "No se pudieron guardar los cambios.",
                life: 4000,
            });
        } finally {
            setGuardando(false);
        }
    };

    // ── Marcar como definitiva ────────────────────────────────────────────────
    const handleMarcarDefinitiva = () => {
        confirmDialog({
            message:
                "Una vez marcada como definitiva, la liquidación no podrá ser editada ni eliminada. ¿Desea continuar?",
            header: "Confirmar — Liquidación definitiva",
            icon: "pi pi-lock",
            acceptLabel: "Sí, marcar definitiva",
            rejectLabel: "Cancelar",
            acceptClassName: "p-button-warning",
            accept: async () => {
                setGuardando(true);
                try {
                    const liquidacionActualizada = await marcarLiquidacionDefinitiva(liquidacion.id);
                    setLiquidacion(liquidacionActualizada);
                    toast.current?.show({
                        severity: "info",
                        summary: "Liquidación definitiva",
                        detail: "La liquidación fue marcada como definitiva. Ya no se puede editar.",
                        life: 4000,
                    });
                } catch (error) {
                    toast.current?.show({
                        severity: "error",
                        summary: "Error",
                        detail: error.response?.data?.mensaje || "No se pudo marcar como definitiva.",
                        life: 4000,
                    });
                } finally {
                    setGuardando(false);
                }
            },
        });
    };

    // ── Cuando se crea la liquidación con éxito (desde el sub-dialog) ─────────
    const handleCreacionExitosa = () => {
        setMostrarCrear(false);
        cargarLiquidacion(); // recargamos para mostrar la liquidación recién creada
    };

    // ── Totales ────────────────────────────────────────────────────────────────
    const totalEnEdicion = itemsEditados.reduce((acc, d) => acc + (d.monto ?? 0), 0);

    // ── Header del dialog ──────────────────────────────────────────────────────
    const dialogHeader = (
        <div className="opd-dialog-header">
            <div className="opd-header-icon liq-header-icon">
                <i className="pi pi-dollar" />
            </div>
            <div>
                <h2 className="opd-header-title">Liquidación</h2>
                <p className="opd-header-subtitle">
                    {nroCarpeta ? `Carpeta Nº ${nroCarpeta}` : "Gestión de liquidación"}
                </p>
            </div>
        </div>
    );

    // ── Footer según el modo actual ────────────────────────────────────────────
    const renderFooter = () => {
        // Sin liquidación
        if (!liquidacion) {
            return (
                <div className="opd-footer">
                    <Button label="Cerrar" className="opd-btn-cancel" onClick={onHide} />
                    {!cargando && (
                        <Button
                            label="Crear liquidación"
                            icon="pi pi-plus"
                            className="liq-btn-guardar"
                            onClick={() => setMostrarCrear(true)}
                        />
                    )}
                </div>
            );
        }

        // Modo edición
        if (modoEdicion) {
            return (
                <div className="opd-footer opd-footer-update">
                    <div className="liq-total-footer">
                        <span className="liq-total-label">TOTAL</span>
                        <span className="liq-total-valor">{formatMonto(totalEnEdicion)}</span>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <Button
                            label="Cancelar"
                            className="opd-btn-cancel"
                            onClick={handleCancelarEdicion}
                            disabled={guardando}
                        />
                        <Button
                            label={guardando ? "Guardando..." : "Guardar cambios"}
                            icon="pi pi-check"
                            className="liq-btn-guardar"
                            onClick={handleGuardarEdicion}
                            disabled={guardando}
                        />
                    </div>
                </div>
            );
        }

        // Modo lectura
        return (
            <div className="opd-footer opd-footer-update">
                <Button label="Cerrar" className="opd-btn-cancel" onClick={onHide} />
                <div style={{ display: "flex", gap: "10px" }}>
                    {/* Solo se muestran si la liquidación NO es definitiva */}
                    {!liquidacion.esDefinitiva && (
                        <>
                            <Button
                                label="Editar liquidación"
                                icon="pi pi-pencil"
                                className="liq-btn-editar"
                                onClick={handleActivarEdicion}
                                disabled={guardando}
                            />
                            <Button
                                label="Marcar definitiva"
                                icon="pi pi-lock"
                                className="liq-btn-definitiva"
                                onClick={handleMarcarDefinitiva}
                                disabled={guardando}
                            />
                        </>
                    )}
                </div>
            </div>
        );
    };

    // ─────────────────────────────────────────────────────────────────────────────
    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog
                visible={!!itemAEliminar}
                onHide={() => setItemAEliminar(null)}
                message={`¿Eliminar el ítem "${itemAEliminar?.descripcion}"?`}
                header="Confirmar eliminación"
                icon="pi pi-exclamation-triangle"
                acceptLabel="Sí, eliminar"
                rejectLabel="Cancelar"
                accept={confirmarEliminacion}
                reject={() => setItemAEliminar(null)}
            />

            {/* ── Sub-dialog para CREAR la liquidación (reutiliza el componente existente) */}
            <RegistrarLiquidacionDialog
                visible={mostrarCrear}
                onHide={() => setMostrarCrear(false)}
                operacionId={operacionId}
                nroCarpeta={nroCarpeta}
                onSuccess={handleCreacionExitosa}
            />

            {/* ── Dialog principal de gestión ─────────────────────────────────────── */}
            <Dialog
                visible={visible && !mostrarCrear}
                onHide={onHide}
                header={dialogHeader}
                footer={renderFooter()}
                style={{ width: "600px" }}
                className="opd-dialog"
                modal
                closable={!guardando}
            >
                {/* ── Cargando ─────────────────────────────────────────────────────── */}
                {cargando && (
                    <div className="gliq-loading">
                        <i className="pi pi-spin pi-spinner" style={{ fontSize: "1.5rem", color: "#00e0b0" }} />
                        <span>Cargando liquidación...</span>
                    </div>
                )}

                {/* ── Sin liquidación ───────────────────────────────────────────────── */}
                {!cargando && !liquidacion && (
                    <div className="gliq-vacio">
                        <i className="pi pi-file-excel gliq-vacio-icono" />
                        <p className="gliq-vacio-texto">Esta operación no tiene liquidación todavía.</p>
                        <p className="gliq-vacio-subtexto">
                            Hacé click en "Crear liquidación" para registrar los honorarios y gastos.
                        </p>
                    </div>
                )}

                {/* ── Con liquidación ───────────────────────────────────────────────── */}
                {!cargando && liquidacion && (
                    <>
                        {/* Badge definitiva */}
                        {liquidacion.esDefinitiva && (
                            <div className="gliq-badge-definitiva">
                                <i className="pi pi-lock" />
                                <span>Liquidación definitiva — no se puede modificar</span>
                            </div>
                        )}

                        {/* Datos generales */}
                        <div className="opd-info-section">
                            <div className="opd-info-grid">
                                <div className="opd-info-item">
                                    <span className="opd-info-label">Monto total</span>
                                    <span className="opd-info-value gliq-monto-total">
                                        {formatMonto(liquidacion.montoTotal)}
                                    </span>
                                </div>
                                <div className="opd-info-item">
                                    <span className="opd-info-label">Vencimiento</span>
                                    <span className="opd-info-value">{formatFecha(liquidacion.fechaVenc)}</span>
                                </div>
                                <div className="opd-info-item">
                                    <span className="opd-info-label">Estado</span>
                                    <span className="opd-info-value">{liquidacion.estado}</span>
                                </div>
                            </div>
                        </div>

                        {/* ── MODO LECTURA: lista de ítems sin inputs ─────────────────────── */}
                        {!modoEdicion && (
                            <div className="liq-detalle-section">
                                <div className="liq-detalle-header">
                                    <span className="opd-label">Ítems de la liquidación</span>
                                </div>
                                <div className="liq-detalle-lista">
                                    {liquidacion.detalle?.map((item, index) => (
                                        <div key={item.id ?? index} className="liq-detalle-fila gliq-fila-lectura">
                                            <div className="liq-item-numero">{index + 1}</div>
                                            <div className="gliq-item-descripcion">{item.descripcion}</div>
                                            <div className="gliq-item-monto">{formatMonto(item.monto)}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Subtotal en modo lectura */}
                                <div className="gliq-subtotal">
                                    <span className="gliq-subtotal-label">Total</span>
                                    <span className="gliq-subtotal-valor">
                                        {formatMonto(liquidacion.montoTotal)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* ── MODO EDICIÓN: lista de ítems con inputs ──────────────────────── */}
                        {modoEdicion && (
                            <div className="liq-detalle-section">
                                <div className="liq-detalle-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span className="opd-label">Editar ítems</span>
                                    <Button
                                        label="+ Agregar ítem"
                                        className="liq-btn-agregar"
                                        onClick={handleAgregarItem}
                                        disabled={guardando}
                                    />
                                </div>

                                <div className="liq-detalle-lista">
                                    {itemsEditados.map((item, index) => (
                                        <div key={index} className="liq-detalle-fila">
                                            <div className="liq-item-numero">{index + 1}</div>

                                            {/* Descripción editable */}
                                            <InputText
                                                value={item.descripcion}
                                                onChange={(e) => handleCambioItem(index, "descripcion", e.target.value)}
                                                placeholder="Descripción"
                                                className="opd-input liq-input-descripcion"
                                                disabled={guardando}
                                            />

                                            {/* Monto editable */}
                                            <InputNumber
                                                value={item.monto === 0 ? null : item.monto}
                                                onValueChange={(e) => handleCambioItem(index, "monto", e.value)}
                                                placeholder="$ 0,00"
                                                prefix="$ "
                                                minFractionDigits={2}
                                                maxFractionDigits={2}
                                                locale="es-UY"
                                                className="liq-input-monto"
                                                disabled={guardando}
                                                min={0}
                                            />

                                            {/* Botón eliminar */}
                                            <Button
                                                icon="pi pi-trash"
                                                className="liq-btn-eliminar-item p-button-text p-button-danger"
                                                onClick={() => handleEliminarItem(index)}
                                                disabled={guardando}
                                                tooltip="Eliminar ítem"
                                                tooltipOptions={{ position: "top" }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Total en modo edición */}
                                <div className="gliq-subtotal">
                                    <span className="gliq-subtotal-label">Total calculado</span>
                                    <span className="gliq-subtotal-valor">{formatMonto(totalEnEdicion)}</span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Dialog>
        </>
    );
}
