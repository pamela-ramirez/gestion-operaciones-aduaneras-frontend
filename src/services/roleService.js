import apiClient from "../api/apiClient";

export const getRoles = async () => {
  try {
    const response = await apiClient.get(import.meta.env.VITE_ROL_ENDPOINT);

    // Transformar el formato del backend al formato esperado por los componentes
    return response.data.map(rol => ({
      label: rol.nombreRol,
      value: rol.nombreRol
    }));
  } catch (error) {
    console.error("Error obteniendo roles:", error);
    throw error;
  }
}; 


