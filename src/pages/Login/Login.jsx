import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { login } from "../../services/authService";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleLogin = async () => {
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.token);
      console.log("LOGIN OK", data);
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
            <h1 className="login-brand-name">Despachos al Cien</h1>
          </div>

          {/* Card */}
          <div className="login-card">
            <h2 className="login-title">Bienvenido</h2>
            <p className="login-subtitle">Ingresa tus credenciales para acceder al portal.</p>

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
                <label htmlFor="remember" className="remember-label" style={{ color: "#00e0b0" }}>Recordarme</label>
              </div>
              <a href="#" className="forgot-link">Olvidé mi contraseña</a>
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
              <a href="#" className="register-link">Contacta al administrador</a>
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
