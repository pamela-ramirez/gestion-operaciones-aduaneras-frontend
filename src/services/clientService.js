import apiClient from "../api/apiClient";

/**
 * Crear cliente (invitado por admin)
 */
export const crearCliente = async (cliente) => {
  const response = await apiClient.post(
    import.meta.env.VITE_CLIENTE_ENDPOINT,
    cliente
  );
  return response.data;
};

/**
 * Completar perfil del cliente en primer login
 * PUT /Cliente/completar-perfil
 * Body: { nombre, telefono }
 */
export const completarPerfil = async (data) => {
  const response = await apiClient.put(
    import.meta.env.VITE_CLIENTE_COMPLETAR_PERFIL_ENDPOINT,
    data
  );
  return response.data;
};