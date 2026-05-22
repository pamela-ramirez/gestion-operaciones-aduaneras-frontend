import apiClient from "../../../../api/apiClient";

export const obtenerMisOperaciones = async () => {
  try {
    const response = await apiClient.get(import.meta.env.VITE_PORTAL_CLIENTE_OPERACIONES_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error("Error al obtener las operaciones:", error);
    throw error;
}
};