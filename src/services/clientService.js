import apiClient from "../api/apiClient";

export const crearCliente = async (cliente) => {
  try {
    const response = await apiClient.post(import.meta.env.VITE_CLIENTE_ENDPOINT, cliente);
    return response.data;
  } catch (error) {
    console.error("Error creando cliente:", error);
    throw error;
  }
};