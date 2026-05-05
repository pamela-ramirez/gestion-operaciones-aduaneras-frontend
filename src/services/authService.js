import apiClient from "../api/apiClient";

//Login

export const login = async (email, password) => {
  const response = await apiClient.post(import.meta.env.VITE_LOGIN_ENDPOINT, {
    email,
    password,
  });
  return response.data;
};

//Aceptar consentimiento de uso de datos personales(solo para clientes en primer login)
export const aceptarConsentimiento = async () => {
  try {
    const response = await apiClient.post(
      import.meta.env.VITE_ACEPTAR_CONSENTIMIENTO_ENDPOINT,
    );
    return response.data;
  } catch (error) {
    console.error("Error al aceptar el consentimiento:", error);
    throw error;
  }
};

//Cambiar contraseña (obligatorio en primer login)
export const cambiarPassword = async (password) => {
  try {
    const response = await apiClient.post(
      "/Auth/cambiar-password",
      {
        NuevaPassword: password
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error al cambiar la contraseña:", error);
    throw error;
  }
};
