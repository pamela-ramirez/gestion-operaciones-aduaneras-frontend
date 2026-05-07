export const guardarUsuarioLogueado = (usuario) => {
  localStorage.setItem(
    "usuarioLogueado",
    JSON.stringify(usuario)
  );
};

export const obtenerUsuarioStorage = () => {
  return JSON.parse(localStorage.getItem("usuarioLogueado"));
};

export const limpiarSesion = () => {
  localStorage.removeItem("usuarioLogueado");
  localStorage.removeItem("rol");
  localStorage.removeItem("token");
};