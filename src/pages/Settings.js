import React, { useState } from "react";
import Layout from "../components/layout/Layout";
import { ToastContainer } from "../components/ui/Toast";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../context/AuthContext";
import "../components/layout/Layout.css";

const Section = ({ title, children }) => (
  <div className="ap-card" style={{ marginBottom: 20 }}>
    <div className="ap-card-header"><span className="ap-card-title">{title}</span></div>
    <div className="ap-card-body">{children}</div>
  </div>
);

const Toggle = ({ label, desc, on, setOn }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
    <div>
      <div style={{ fontWeight: 600, fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{desc}</div>
    </div>
    <button
      style={{ width: 44, height: 24, borderRadius: 12, background: on ? "var(--indigo)" : "var(--border-2)", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}
      onClick={() => setOn(!on)}
    >
      <span style={{ position: "absolute", top: 2, left: on ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
    </button>
  </div>
);

const Settings = () => {
  const { user } = useAuth();
  const { toasts, toast, dismiss } = useToast();

  const [s1, setS1] = useState(true);   // Single device enforcement
  const [s2, setS2] = useState(true);   // Watermark
  const [s3, setS3] = useState(true);   // Screenshot blocking
  const [s4, setS4] = useState(false);  // Print allowed
  const [s5, setS5] = useState(true);   // Activity logging
  const [s6, setS6] = useState(false);  // Email alerts

  const [pwForm, setPw] = useState({ current: "", newPw: "", confirm: "" });

  const saveSecuritySettings = () => toast("Security settings saved!", "success");
  const savePassword = (e) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) { toast("Passwords do not match.", "error"); return; }
    if (pwForm.newPw.length < 6) { toast("Password must be at least 6 characters.", "error"); return; }
    toast("Password updated successfully!", "success");
    setPw({ current: "", newPw: "", confirm: "" });
  };

  return (
    <Layout>
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      <div className="ap-page-header">
        <h2>Settings</h2>
        <p>Configure system behaviour, security policies, and your admin account</p>
      </div>

      {/* Admin Profile */}
      <Section title="👤 Admin Profile">
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: "linear-gradient(135deg,var(--indigo),var(--pink))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "white" }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{user?.name}</div>
            <div style={{ color: "var(--text-3)", fontSize: 13, marginTop: 2 }}>{user?.email}</div>
            <span className="badge badge-indigo" style={{ marginTop: 6, display: "inline-flex" }}>Administrator</span>
          </div>
        </div>
        <div className="ap-form-row">
          <div className="ap-field">
            <label>Display Name</label>
            <input className="ap-input" defaultValue={user?.name} />
          </div>
          <div className="ap-field">
            <label>Email Address</label>
            <input className="ap-input" defaultValue={user?.email} type="email" />
          </div>
        </div>
        <button className="ap-btn ap-btn-primary" onClick={() => toast("Profile updated!", "success")}>Save Profile</button>
      </Section>

      {/* Security Policy */}
      <Section title="🛡️ Security Policies">
        <Toggle label="Single Device Enforcement" desc="Block users from logging in on more than one device simultaneously" on={s1} setOn={setS1} />
        <Toggle label="PDF Watermarking" desc="Overlay user email and session token on all viewed documents" on={s2} setOn={setS2} />
        <Toggle label="Screenshot Blocking" desc="Intercept PrintScreen, Ctrl+P, and print events in PDF viewer" on={s3} setOn={setS3} />
        <Toggle label="Allow Print" desc="Allow users to print documents (overrides screenshot blocking for print)" on={s4} setOn={setS4} />
        <Toggle label="Activity Logging" desc="Record all login, logout, and PDF view events in audit trail" on={s5} setOn={setS5} />
        <Toggle label="Email Security Alerts" desc="Send email to admin when blocked or suspicious activity is detected" on={s6} setOn={setS6} />
        <div style={{ paddingTop: 14 }}>
          <button className="ap-btn ap-btn-primary" onClick={saveSecuritySettings}>Save Security Settings</button>
        </div>
      </Section>

      {/* Change Password */}
      <Section title="🔑 Change Password">
        <form onSubmit={savePassword} style={{ maxWidth: 440 }}>
          <div className="ap-field">
            <label>Current Password</label>
            <input className="ap-input" type="password" placeholder="••••••••" value={pwForm.current} onChange={e => setPw(p => ({...p, current: e.target.value}))} required />
          </div>
          <div className="ap-form-row">
            <div className="ap-field">
              <label>New Password</label>
              <input className="ap-input" type="password" placeholder="Min 6 chars" value={pwForm.newPw} onChange={e => setPw(p => ({...p, newPw: e.target.value}))} required />
            </div>
            <div className="ap-field">
              <label>Confirm Password</label>
              <input className="ap-input" type="password" placeholder="Repeat password" value={pwForm.confirm} onChange={e => setPw(p => ({...p, confirm: e.target.value}))} required />
            </div>
          </div>
          <button type="submit" className="ap-btn ap-btn-primary">Update Password</button>
        </form>
      </Section>

      {/* System Info */}
      <Section title="⚙️ System Information">
        {[
          ["Backend", "Node.js + Express"],
          ["Database", "MongoDB"],
          ["Auth", "JWT (RS256)"],
          ["File Storage", "Local · /uploads/pdfs/"],
          ["Environment", process.env.NODE_ENV || "development"],
          ["Frontend", "React 18"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
            <span style={{ color: "var(--text-3)" }}>{k}</span>
            <span className="mono" style={{ fontSize: 12 }}>{v}</span>
          </div>
        ))}
      </Section>
    </Layout>
  );
};

export default Settings;
