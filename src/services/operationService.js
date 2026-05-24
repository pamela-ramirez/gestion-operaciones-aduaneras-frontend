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
