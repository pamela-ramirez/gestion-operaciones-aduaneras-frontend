import MainLayout from "../../layouts/MainLayout";
import OnboardingGate from "../../components/auth/OnboardingGate";

export default function Home() {
  return (
    <>
      <OnboardingGate />
      <MainLayout>
        <h1 style={{ color: "white" }}>Bienvenido al sistema</h1>
      </MainLayout>
    </>
  );
}
