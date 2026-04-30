import apiClient from "../api/apiClient";


export const login = async (email, password) => {
  const response = await apiClient.post(import.meta.env.VITE_LOGIN_ENDPOINT, {
    email,
    password,
  });

  return response.data;
};