import apiClient from "../api/apiClient";


//Login

export const login = async (email, password) => {
  const response = await apiClient.post(import.meta.env.VITE_LOGIN_ENDPOINT, {
    email,
    password,
  });
  return response.data;
};



//Aceptar consentimiento de cookies (solo para clientes en primer login)

export const aceptarConsentimiento = async () => {
  const response = await apiClient.post(
    import.meta.env.VITE_CONSENTIMIENTO_ENDPOINT
  );
  return response.data;
};


//Cambiar contraseña (obligatorio en primer login)

export const cambiarPassword = async (password) => {
  const response = await apiClient.post(
    import.meta.env.VITE_CAMBIAR_PASSWORD_ENDPOINT,
    { password }
  );
  return response.data;
};