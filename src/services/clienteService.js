import apiClient from "../api/apiClient";

export const crearCliente = async (data) => {
  const respuesta = await apiClient.post(
    import.meta.env.VITE_CLIENTE_ENDPOINT,
    data
  );
  return respuesta.data;
};

export const obtenerClientes = async () => {
  try {
    const response = await apiClient.get(import.meta.env.VITE_CLIENTE_ENDPOINT);  
    return response.data;
  } catch (error) {
    console.error("Error obteniendo clientes:", error);
    throw error;
  };
};

export const editarCliente = async (id, data) => {
  try {
  const respuesta = await apiClient.put(
    import.meta.env.VITE_CLIENTE_ENDPOINT + `/${id}`,
    data
  );
  return respuesta.data;
  } catch (error) {
    console.error("Error editando cliente:", error);
    throw error;
  }
};