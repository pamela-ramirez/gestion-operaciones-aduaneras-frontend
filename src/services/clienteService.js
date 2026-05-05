import apiClient from "../api/apiClient";

export const crearCliente = async (data) => {
  const respuesta = await apiClient.post(
    import.meta.env.VITE_CLIENTE_ENDPOINT,
    data
  );
  return respuesta.data;
};

<<<<<<< HEAD
export const getClientes = async () => {
=======
export const obtenerClientes = async () => {
>>>>>>> d84ab72 (refactor: renombrar variables de entorno de Cliente para mayor claridad y actualizar referencias en clienteService)
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
<<<<<<< HEAD
    import.meta.env.VITE_EDITAR_CLIENTE_ENDPOINT.replace("{id}", id),
=======
    import.meta.env.VITE_CLIENTE_ENDPOINT + `/${id}`,
>>>>>>> d84ab72 (refactor: renombrar variables de entorno de Cliente para mayor claridad y actualizar referencias en clienteService)
    data
  );
  return respuesta.data;
  } catch (error) {
    console.error("Error editando cliente:", error);
    throw error;
  }
};