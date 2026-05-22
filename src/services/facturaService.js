import apiClient from "../api/apiClient";

export const subirFactura = async (LiquidacionId, Archivo) => {
  try {
    const formData = new FormData();
    formData.append("LiquidacionId", LiquidacionId);
    formData.append("Archivo", Archivo);

    const response = await apiClient.post(
      import.meta.env.VITE_FACTURA_ENDPOINT,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;

  } catch (error) {
    console.error("Error al subir la factura:", error);
    throw error;
  }
};

export const eliminarFactura = async (facturaId) => {
  try {
    await apiClient.delete(`${import.meta.env.VITE_FACTURA_ENDPOINT}/${facturaId}`);
    } catch (error) {
    console.error("Error al eliminar la factura:", error);
    throw error;
  } 
};

export const obtenerFacturaPorLiquidacion = async (liquidacionId) => {
  try {
    const response = await apiClient.get(`${import.meta.env.VITE_FACTURA_ENDPOINT}/liquidacion/${liquidacionId}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener la factura por liquidación:", error);
    throw error;
  }
};
