import { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import "./Login.css";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const navigate = useNavigate();

  // Si ya está logueado → ir directo al home
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (token && role) {
      if (role === "cliente") navigate("/cliente", { replace: true });
      else navigate("/home", { replace: true });
    }
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Por favor ingresa tu correo y contraseña.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);

      // ── TOKEN ─────────────────────────────
      localStorage.setItem("token", data.token);

      // ── ROL ───────────────────────────────
      const userRole = (
        data.rol ||
        data.role ||
        "admin"
      ).toLowerCase();

      localStorage.setItem("userRole", userRole);

      // ── ESTADO Y PRIMER LOGIN ─────────────
      //  temporal hasta backend
      const estado = data.estado ?? "ACTIVO";
      const primerLogin = data.primerLogin ?? false;

      localStorage.setItem("estado", estado);
      localStorage.setItem("primerLogin", primerLogin ? "true" : "false");

      // 🚀 SOLO navegación base (el modal hace el resto)
      if (userRole === "cliente") {
        navigate("/cliente", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }

    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Credenciales incorrectas.";

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
        <div className="login-left-overlay" />

        <div className="login-center">
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
                />
                <label htmlFor="remember">Recordarme</label>
              </div>
            </div>

            <Button
              label={loading ? "Ingresando..." : "Iniciar Sesión"}
              icon={loading ? "pi pi-spin pi-spinner" : "pi pi-sign-in"}
              iconPos="right"
              className="login-btn"
              onClick={handleLogin}
              disabled={loading}
            />
          </div>
        </div>

        <div className="login-right-label">
          <span>OPERACIONES</span>
          <span>ADUANERAS</span>
        </div>
      </div>
    </div>
  );
}