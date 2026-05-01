import ClientMainLayout from "../../layouts/ClientMainLayout";
import OnboardingGate from "../../components/auth/OnboardingGate";

export default function ClientHome() {
  return (
    <>
      <OnboardingGate />
      <ClientMainLayout>
        <h1 style={{ color: "white" }}>Bienvenido al Portal de Clientes</h1>
      </ClientMainLayout>
    </>
  );
}
