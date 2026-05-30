import apiClient from "../api/apiClient";

export const crearOperacion = async (operacionData) => {
  try {
    const response = await apiClient.post(import.meta.env.VITE_OPERACION_ENDPOINT, operacionData);
    return response.data;
  } catch (error) {
    console.error("Error al crear la operación:", error);
    throw error;
  }
};

export const obtenerOperaciones = async () => {
  try {
    const response = await apiClient.get(import.meta.env.VITE_OPERACION_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error("Error al obtener las operaciones:", error);
    throw error;
}
};

export const obtenerOperacionPorId = async (id) => {
  try {
    const response = await apiClient.get(`${import.meta.env.VITE_OPERACION_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener la operación con ID ${id}:`, error);
    throw error;
  }
};

export const actualizarOperacion = async (id, operacionData) => {
  try {
    const response = await apiClient.patch(`${import.meta.env.VITE_OPERACION_ENDPOINT}/${id}/datos-aduaneros`, operacionData);    
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar la operación con ID ${id}:`, error);
    throw error;
  }
};

export const finalizarOperacion = async (id) => {
  try {
    const response = await apiClient.patch(
      `${import.meta.env.VITE_OPERACION_ENDPOINT}/${id}/finalizar`
    );
    return response.data;
  } catch (error) {
    console.error(`Error al finalizar la operación con ID ${id}:`, error);
    throw error;
  }
};

export const obtenerDocumentosPorOperacion = async (id) => {
  try {
    const response = await apiClient.get(`${import.meta.env.VITE_OPERACION_ENDPOINT}/${id}/documentos`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener los documentos de la operación con ID ${id}:`, error);
    throw error;
  }
};

export const obtenerLiquidacionPorOperacion = async (operacionId) => {
  try {
    const response = await apiClient.get(
        `${import.meta.env.VITE_OPERACION_ENDPOINT}/${operacionId}/ver-liquidacion`
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener la liquidación:", error);
    throw error;
  }
};

// Función para obtener las facturas asociadas a una operación
export const obtenerFacturasPorOperacion = async (operacionId) => {
  try {
    const response = await apiClient.get(`${import.meta.env.VITE_OPERACION_ENDPOINT}/${operacionId}/ver-facturas`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener las facturas de la operación con ID ${operacionId}:`, error);
    throw error;
  }
};

export const obtenerOperacionesConFiltros = async (filtros) => {
  try {
    // Construimos los query params solo con los filtros que el usuario completó
    // Si un filtro está vacío o es null, no se manda al backend
    const params = new URLSearchParams();

    if (filtros.clienteId)       params.append("clienteId", filtros.clienteId);
    if (filtros.tipoOperacionId) params.append("tipoOperacionId", filtros.tipoOperacionId);
    if (filtros.estado)          params.append("estado", filtros.estado);
    if (filtros.fechaDesde)      params.append("fechaDesde", filtros.fechaDesde);
    if (filtros.fechaHasta)      params.append("fechaHasta", filtros.fechaHasta);

    const response = await apiClient.get(
      `${import.meta.env.VITE_OPERACION_ENDPOINT}/filtros?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener operaciones con filtros:", error);
    throw error;
  }
};


export const obtenerOperacionesPorCliente = async (clienteId) => {
  try {
    const response = await apiClient.get(
      `${import.meta.env.VITE_OPERACION_ENDPOINT}/cliente/${clienteId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error al obtener operaciones del cliente ${clienteId}:`, error);
    throw error;
  }
};

