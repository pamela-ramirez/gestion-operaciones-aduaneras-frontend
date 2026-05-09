import apiClient from "../api/apiClient";

export const obtenerTiposOperacion = async () => {
  try {
    const response = await apiClient.get(`${import.meta.env.VITE_TIPO_OPERACION_ENDPOINT}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener los tipos de operación:", error);
    throw error;
  }
};

