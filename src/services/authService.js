import apiClient from "../api/apiClient";

/**
 * Login - retorna { token, user: { rol, primerLogin, perfilCompleto, ... } }
 */
export const login = async (email, password) => {
  const response = await apiClient.post(import.meta.env.VITE_LOGIN_ENDPOINT, {
    email,
    password,
  });
  return response.data;
};

/**
 * Cambiar contraseña temporal (cliente y despachante)
 * PATCH /Auth/cambiar-password
 * Body: { nuevaPassword }
 */
export const cambiarPassword = async (nuevaPassword) => {
  const response = await apiClient.patch(
    import.meta.env.VITE_CAMBIAR_PASSWORD_ENDPOINT,
    { nuevaPassword }
  );
  return response.data;
};