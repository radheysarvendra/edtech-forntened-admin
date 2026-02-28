import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const [email, setPw]    = useState("");
  const [password, setPs] = useState("");
  const [loading, setL]   = useState(false);
  const [error, setE]     = useState("");
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setE(""); setL(true);
    try {
      await login(email, password);
      nav("/dashboard");
    } catch (err) {
      setE(err.response?.data?.message || err.message || "Login failed.");
    } finally { setL(false); }
  };

  return (
    <div className="login-page">
      <div className="login-grid-bg" />

      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-icon">S</div>
          <div>
            <div className="login-brand-name">SecurePortal</div>
            <div className="login-brand-role">Admin Console</div>
          </div>
        </div>
        <div className="login-headline">
          <h1>Control.<br />Monitor.<br />Secure.</h1>
          <p>Centralized admin interface for managing users, documents, and live sessions with full audit visibility.</p>
        </div>
        <div className="login-features">
          {["Single-device enforcement", "PDF watermark protection", "Real-time session monitoring", "Complete audit trail"].map(f => (
            <div key={f} className="login-feature"><span>✓</span>{f}</div>
          ))}
        </div>
      </div>

      <div className="login-right">
        <div className="login-box">
          <div className="login-box-header">
            <h2>Admin Sign In</h2>
            <p>Access the admin control panel</p>
          </div>

          <form onSubmit={submit}>
            <div className="lf-field">
              <label>Email Address</label>
              <input
                className={`lf-input ${error ? "lf-input-error" : ""}`}
                type="email"
                placeholder="admin@yoursite.com"
                value={email}
                onChange={e => { setPw(e.target.value); setE(""); }}
                required
                autoFocus
              />
            </div>
            <div className="lf-field">
              <label>Password</label>
              <input
                className={`lf-input ${error ? "lf-input-error" : ""}`}
                type="password"
                placeholder="••••••••••"
                value={password}
                onChange={e => { setPs(e.target.value); setE(""); }}
                required
              />
            </div>

            {error && <div className="lf-error">{error}</div>}

            <button className="lf-btn" type="submit" disabled={loading}>
              {loading ? <span className="lf-spinner" /> : null}
              {loading ? "Signing in..." : "Sign In to Admin Panel"}
            </button>
          </form>

          <div className="lf-hint">
            <span className="lf-hint-tag">Demo</span>
            admin@demo.com / admin123
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
