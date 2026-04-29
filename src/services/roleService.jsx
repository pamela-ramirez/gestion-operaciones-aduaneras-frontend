export const getRoles = async () => {
  // TEMPORAL (mock)
  return [
    { label: "Despachante", value: "DESPACHANTE" },
    { label: "Cliente", value: "CLIENTE" },
  ];
  
  //despues cambiar por api real:
  //return await apiClient.get("/roles");
};

