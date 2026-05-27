import apiClient from "../api/apiClient";

export const obtenerTiposConocimiento = async () => {
  try {
    const response = await apiClient.get(import.meta.env.VITE_TIPO_CONOCIMIENTO_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo tipos de conocimiento:", error);
    throw error;
  }
};
