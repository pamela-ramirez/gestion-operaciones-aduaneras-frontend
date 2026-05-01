import { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../services/authService";
import "./Login.css";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  // Si ya tiene sesión activa, redirigir directo
  useEffect(() => {
    const token    = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    if (!token || !userRole) return;

    if (userRole === "cliente") navigate("/cliente", { replace: true });
    else navigate("/home", { replace: true });
  }, [navigate]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Por favor ingresa tu correo y contraseña.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);

      // ── Persistir token ──────────────────────────────────────────────────────
      localStorage.setItem("token", data.token);

      // ── Normalizar rol (el backend puede enviarlo en distintos campos) ────────
      const userRole = (
        data.user?.rol ||
        data.user?.role ||
        data.rol ||
        data.role ||
        "admin"
      ).toLowerCase();

      // ── Flags de onboarding que vienen del backend ────────────────────────────
      // primerLogin  → true cuando el usuario nunca cambió la contraseña temporal
      // perfilCompleto → true cuando ya completó nombre/teléfono
      const primerLogin     = data.user?.primerLogin     ?? false;
      const perfilCompleto  = data.user?.perfilCompleto  ?? false;

      localStorage.setItem("userRole",       userRole);
      localStorage.setItem("primerLogin",    primerLogin    ? "true" : "false");
      localStorage.setItem("perfilCompleto", perfilCompleto ? "true" : "false");

      // ── Routing por rol ───────────────────────────────────────────────────────
      if (userRole === "cliente") {
        // El modal de onboarding se controla en ClientMainLayout
        navigate("/cliente", { replace: true });
        return;
      }

      if (userRole === "despachante") {
        // El despachante usa el mismo Home que el admin
        navigate("/home", { replace: true });
        return;
      }

      // admin (y cualquier otro rol desconocido)
      navigate("/home", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Credenciales incorrectas. Verifica tu correo y contraseña.";
      setError(typeof msg === "string" ? msg : "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="login-container">
      <div className="login-bg">
        {/* LEFT DARK OVERLAY */}
        <div className="login-left-overlay" />

        {/* CENTER CARD */}
        <div className="login-center">
          {/* Logo + Brand */}
          <div className="login-brand">
            <div className="login-logo">
              <i className="pi pi-shield" />
            </div>
            <h1 className="login-brand-name">DESPACHOS AL CIEN</h1>
          </div>

          <div className="login-card">
            <h2 className="login-title">Bienvenido</h2>
            <p className="login-subtitle">
              Ingresa tus credenciales para acceder al portal.
            </p>

            {/* Error */}
            {error && (
              <div className="login-error">
                <i className="pi pi-exclamation-triangle" />
                <span>{error}</span>
              </div>
            )}

            <div className="field">
              <label className="field-label">CORREO ELECTRÓNICO</label>
              <span className="p-input-icon-left login-input-wrap">
                <i className="pi pi-envelope" />
                <InputText
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="nombre@empresa.com"
                  className="login-input"
                />
              </span>
            </div>

            <div className="field">
              <label className="field-label">CONTRASEÑA</label>
              <span className="p-input-icon-left login-input-wrap">
                <i className="pi pi-lock" />
                <Password
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  feedback={false}
                  toggleMask
                  inputClassName="login-input"
                  className="login-password"
                  placeholder="••••••••"
                />
              </span>
            </div>

            <div className="login-options">
              <div className="remember">
                <Checkbox
                  inputId="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.checked)}
                  className="login-checkbox"
                />
                <label
                  htmlFor="remember"
                  className="remember-label"
                  style={{ color: "#00e0b0" }}
                >
                  Recordarme
                </label>
              </div>
              <a href="#" className="forgot-link">
                Olvidé mi contraseña
              </a>
            </div>

            <Button
              label={loading ? "Ingresando..." : "Iniciar Sesión"}
              icon={loading ? "pi pi-spin pi-spinner" : "pi pi-sign-in"}
              iconPos="right"
              className="login-btn"
              onClick={handleLogin}
              disabled={loading}
            />

            <p className="login-register">
              ¿No tienes una cuenta?{" "}
              <a href="#" className="register-link">
                Contacta al administrador
              </a>
            </p>
          </div>
        </div>

        {/* RIGHT PANEL LABEL */}
        <div className="login-right-label">
          <span>OPERACIONES</span>
          <span>ADUANERAS</span>
        </div>
      </div>
    </div>
  );
}
