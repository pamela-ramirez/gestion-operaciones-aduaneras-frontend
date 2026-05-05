import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/login/Login";
import Home from "./pages/home/Home";
import ClientHome from "./pages/home/ClientHome";
import Users from "./pages/users/Users";
import Clients from "./pages/clients/Clients";
import OnboardingGate from "./components/auth/OnboardingGate";

import PrivateRoute from "./routes/PrivateRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Pública ────────────────────────────────────────── */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route path="/onboarding" element={<OnboardingGate />} />

        {/* ── Admin + Despachante ────────────────────────────── */}
        <Route
          path="/home"
          element={
            <PrivateRoute roles={["admin", "despachante"]}>
              <Home />
            </PrivateRoute>
          }
        />

        <Route
          path="/usuarios"
          element={
            <PrivateRoute roles={["admin", "despachante"]}>
              <Users />
            </PrivateRoute>
          }
        />

        {/* ── Cliente ────────────────────────────────────────── */}
        <Route
          path="/cliente"
          element={
            <PrivateRoute roles={["cliente"]}>
              <ClientHome />
            </PrivateRoute>
          }
        />

        <Route
          path="/clientes"
          element={
            <PrivateRoute roles={["admin", "despachante"]}>
              <Clients />
            </PrivateRoute>
          }
        />

        {/* ── Fallback ───────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}