import React from "react";
import Login from "./pages/login/Login";
import Home from "./pages/home/Home";
import UsuariosList from "./pages/usuarios/UsuariosList";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <PrivateRoute>
              <UsuariosList />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
