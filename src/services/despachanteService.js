import apiClient from "../api/apiClient";

// despachanteService.js
export const crearDespachante = async (data) => {
  const res = await apiClient.post(
    import.meta.env.VITE_DESPACHANTE_ENDPOINT,
    data
  );
  return res.data;
};