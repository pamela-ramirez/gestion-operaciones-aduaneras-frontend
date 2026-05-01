import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login      from "./pages/login/Login";
import Home       from "./pages/home/Home";
import ClientHome from "./pages/home/ClientHome";
import Users      from "./pages/users/Users";
import PrivateRoute from "./routes/PrivateRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Pública ────────────────────────────────────────── */}
        <Route path="/" element={<Login />} />

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
      </Routes>
    </BrowserRouter>
  );
}
