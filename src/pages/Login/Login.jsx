import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { login } from "../../services/authService";
import "./Login.css";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");

    const perfilCompleto = localStorage.getItem("perfilCompleto") === "true";

    const primerLogin = localStorage.getItem("primerLogin") === "true";

    if (!token || !userRole) return;

    if (userRole === "cliente") {
      if (primerLogin || !perfilCompleto) {
        localStorage.setItem("showOnboarding", "true");
        navigate("/cliente");
        return;
      }

      navigate("/cliente");
      return;
    }

    navigate("/home");
  }, [navigate]);

  const handleLogin = async () => {
    try {
      const data = await login(email, password); // Llama a la función de login del servicio de autenticación

      localStorage.setItem("token", data.token);

      // Guardar el rol del usuario
      const userRole = (data.user?.rol || data.rol || "admin").toLowerCase();
      const perfilCompleto = data.user?.perfilCompleto ?? false;
      const primerLogin = data.user?.primerLogin ?? false;

      localStorage.setItem("userRole", userRole);
      localStorage.setItem(
        "perfilCompleto",
        data.user?.perfilCompleto ? "true" : "false",
      );
      localStorage.setItem(
        "primerLogin",
        data.user?.primerLogin ? "true" : "false",
      );

      // CLIENTE
      if (userRole === "cliente") {
        if (primerLogin || !perfilCompleto) {
          navigate("/cliente/completar-registro");
          return;
        }
        navigate("/cliente");
        return;
      }

      // ADMIN
      navigate("/home");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="login-container">
      {/* BACKGROUND FULL */}
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

            <div className="field">
              <label className="field-label">CORREO ELECTRÓNICO</label>
              <span className="p-input-icon-left login-input-wrap">
                <i className="pi pi-envelope" />
                <InputText
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
              <Link to="/recuperar" className="forgot-link">
                Olvidé mi contraseña
              </Link>
            </div>

            <Button
              label="Iniciar Sesión"
              icon="pi pi-sign-in"
              iconPos="right"
              className="login-btn"
              onClick={handleLogin}
            />

            <p className="login-register">
              ¿No tienes una cuenta?{" "}
              <Link to="/registrar" className="register-link">
                Contacta al administrador
              </Link>
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
