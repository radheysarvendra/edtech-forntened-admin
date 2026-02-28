import React from "react";

const STYLES = {
  success: { bg: "var(--green-dim)",  border: "rgba(34,197,94,0.3)",  color: "var(--green)",    icon: "✅" },
  error:   { bg: "var(--red-dim)",    border: "rgba(239,68,68,0.3)",  color: "var(--red)",      icon: "❌" },
  warning: { bg: "var(--amber-dim)",  border: "rgba(245,158,11,0.3)", color: "var(--amber)",    icon: "⚠️" },
  info:    { bg: "var(--indigo-dim)", border: "rgba(91,91,214,0.3)",  color: "var(--indigo-2)", icon: "ℹ️" },
};

export const ToastContainer = ({ toasts, dismiss }) => {
  if (!toasts?.length) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: 10, zIndex: 9999 }}>
      {toasts.map(t => {
        const s = STYLES[t.type] || STYLES.info;
        return (
          <div key={t.id} onClick={() => dismiss(t.id)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: "var(--r-md)", background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontSize: 13, fontWeight: 500, boxShadow: "var(--shadow-md)", cursor: "pointer", maxWidth: 360, animation: "fadeIn 0.2s ease" }}>
            <span>{s.icon}</span>
            <span style={{ flex: 1 }}>{t.msg}</span>
            <span style={{ opacity: 0.5, fontSize: 11 }}>✕</span>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
