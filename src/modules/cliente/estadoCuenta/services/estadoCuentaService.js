import apiCliente from '../../../../api/apiClient';

export const obtenerEstadoCuenta = async (mes, anio) => {
  try {
    const response = await apiCliente.get(import.meta.env.VITE_PORTAL_CLIENTE_ESTADO_CUENTA_ENDPOINT, {
      params: { mes, anio },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener estado de cuenta:", error);
    throw error;
  }
}