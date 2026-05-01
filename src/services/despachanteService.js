import apiClient from "../api/apiClient";

/**
 * Completar perfil del despachante en primer login
 * PUT /Despachante/completar-perfil
 * Body: { nombre, telefono }
 */
export const completarPerfilDespachante = async (data) => {
  const response = await apiClient.put(
    import.meta.env.VITE_DESPACHANTE_COMPLETAR_PERFIL_ENDPOINT,
    data
  );
  return response.data;
};