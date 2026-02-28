import React, { useEffect, useState, useCallback } from "react";
import Layout from "../components/layout/Layout";
import { ToastContainer } from "../components/ui/Toast";
import { useToast } from "../hooks/useToast";
import { apiSessions, apiKickUser } from "../services/api";
import "../components/layout/Layout.css";

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setL]         = useState(true);
  const [countdown, setCd]      = useState(15);
  const { toasts, toast, dismiss } = useToast();

  const load = useCallback(() => {
    setL(true);
    apiSessions().then(d => setSessions(d.sessions || [])).catch(() => toast("Failed to load sessions","error")).finally(() => setL(false));
    setCd(15);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh
  useEffect(() => {
    const t = setInterval(() => setCd(c => {
      if (c <= 1) { load(); return 15; }
      return c - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [load]);

  const kick = async (s) => {
    await apiKickUser(s.id);
    toast(`Session terminated for ${s.email}`, "success");
    load();
  };

  return (
    <Layout>
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      <div className="ap-page-header">
        <h2>Live Sessions</h2>
        <p>Monitor and terminate active user sessions in real time</p>
      </div>

      {/* Toolbar */}
      <div className="ap-toolbar">
        <div className="ap-toolbar-left">
          <span className="badge badge-green"><span className="badge-dot" />{sessions.length} Active</span>
        </div>
        <div className="ap-toolbar-right">
          <span style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "var(--mono)" }}>
            Auto-refresh in {countdown}s
          </span>
          <button className="ap-btn ap-btn-ghost ap-btn-sm" onClick={load}>↻ Refresh Now</button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="ap-card" style={{ padding: 20 }}>
              <div className="ap-skeleton" style={{ height: 60 }} />
            </div>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="ap-card"><div className="ap-empty">
          <div className="ap-empty-icon">💻</div>
          <div className="ap-empty-title">No active sessions</div>
          <div className="ap-empty-sub">All users are currently offline</div>
        </div></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sessions.map(s => (
            <div key={s.id} className="ap-card" style={{ padding: "18px 24px", display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: "linear-gradient(135deg,var(--indigo),var(--pink))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "white", flexShrink: 0 }}>
                {s.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name} <span style={{ color: "var(--text-3)", fontWeight: 400, fontSize: 13 }}>— {s.email}</span></div>
                <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4, lineHeight: 1.6 }}>
                  <span>💻 {s.active_device_info?.slice(0, 70) || "Unknown device"}</span><br />
                  <span style={{ fontFamily: "var(--mono)" }}>IP: {s.last_login_ip || "—"}</span>
                  {" · "}
                  <span>Login: {s.last_login ? new Date(s.last_login).toLocaleString() : "—"}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="badge badge-green"><span className="badge-dot" />Active</span>
                <button className="ap-btn ap-btn-danger ap-btn-sm" onClick={() => kick(s)}>
                  ✕ End Session
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Sessions;
