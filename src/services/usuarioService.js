import apiClient from "../api/apiClient";

export const getUsuarios = async () => {
  try {
    const response = await apiClient.get(import.meta.env.VITE_USUARIO_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    throw error;
  }
};