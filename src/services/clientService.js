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


export const completarPerfil = async (data) => {
  const response = await apiClient.put(
    import.meta.env.VITE_CLIENTE_COMPLETAR_PERFIL_ENDPOINT,
    data
  );

  return response.data;
};