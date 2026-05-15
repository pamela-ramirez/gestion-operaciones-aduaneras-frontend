import apiClient from "../api/apiClient";

// Función para subir un nuevo documento asociado a una operación
export const subirDocumento = async (nombre, archivo, operacionId) => {
  try {
    // FormData es como un "sobre" especial para enviar archivos
    // No se puede usar JSON normal cuando hay un archivo de por medio
    const formData = new FormData();
    formData.append("Nombre", nombre);
    formData.append("Archivo", archivo);
    formData.append("OperacionId", operacionId);
 
    const response = await apiClient.post(
      import.meta.env.VITE_DOCUMENTO_ENDPOINT,
      formData,
      {
        // Le decimos a axios que NO ponga Content-Type: application/json
        // El navegador lo pone solo con el valor correcto para archivos
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
 
    return response.data;
  } catch (error) {
    console.error("Error al subir el documento:", error);
    throw error;
  }
};



