import apiClient from "../api/apiClient";

export const crearLiquidacion = async (liquidacionData) => {
  try {
    const response = await apiClient.post(
        import.meta.env.VITE_LIQUIDACION_ENDPOINT, 
        liquidacionData);
    return response.data;
  } catch (error) {
    console.error("Error al crear la liquidación:", error);
    throw error;
  }
};

export const obtenerLiquidacionPorOperacion = async (operacionId) => {
  try {
    const response = await apiClient.get(
        `${import.meta.env.VITE_LIQUIDACION_ENDPOINT}/operacion/${operacionId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener la liquidación:", error);
    throw error;
  }
};