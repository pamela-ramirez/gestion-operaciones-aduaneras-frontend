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

export const obtenerUsuarioLogueado = async () => {
  try {
    const response = await apiClient.get(
      import.meta.env.VITE_USUARIO_LOGUEADO_ENDPOINT,
    );
    return response.data;
  } catch (error) {
    console.error("Error obteniendo usuario logueado:", error);
    throw error;
  }
};
