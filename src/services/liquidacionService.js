import apiClient from "../api/apiClient";

export const crearLiquidacion = async (liquidacionData) => {
  try {
    const response = await apiClient.post(
        import.meta.env.VITE_LIQUIDACION_ENDPOINT, 
        liquidacionData);
    return response.data;
  } catch (error) {
    console.error("Error al crear la liquidación:", error);
    throw error;
  }
};

export const actualizarLiquidacion = async (liquidacionId, detalle, fechaVenc = null) => {
  try {
    const payload = { detalle };
    if (fechaVenc) payload.fechaVenc = fechaVenc;
    const response = await apiClient.patch(
        `${import.meta.env.VITE_LIQUIDACION_ENDPOINT}/${liquidacionId}`,
        payload
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar la liquidación:", error);
    throw error;
  }
};

export const eliminarDetalleLiquidacion = async (liquidacionId, detalleId) => {
  try {
    const response = await apiClient.delete(
        `${import.meta.env.VITE_LIQUIDACION_ENDPOINT}/${liquidacionId}/detalle/${detalleId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al eliminar el detalle de la liquidación:", error);
    throw error;
  }
};

export const marcarLiquidacionDefinitiva = async (liquidacionId) => {
  try {
    const response = await apiClient.patch(
        `${import.meta.env.VITE_LIQUIDACION_ENDPOINT}/${liquidacionId}/definitiva`
    );
    return response.data;
  } catch (error) {
    console.error("Error al marcar la liquidación como definitiva:", error);
    throw error;
  }
};