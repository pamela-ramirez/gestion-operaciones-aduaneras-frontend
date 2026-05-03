import apiClient from "../api/apiClient";

export const crearDespachante = async (data) => {
  const respuesta = await apiClient.post(
    import.meta.env.VITE_DESPACHANTE_ENDPOINT,
    data
  );
  return respuesta.data;
};