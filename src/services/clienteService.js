import apiClient from "../api/apiClient";

// clienteService.js
export const crearCliente = async (data) => {
  const respuesta = await apiClient.post(
    import.meta.env.VITE_CLIENTE_ENDPOINT,
    data
  );
  return respuesta.data;
};