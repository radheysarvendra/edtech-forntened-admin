import React, { useEffect, useState, useCallback } from "react";
import Layout from "../components/layout/Layout";
import { apiLogs } from "../services/api";
import "../components/layout/Layout.css";

const ACTION_BADGE = {
  LOGIN:                "badge-green",
  LOGOUT:               "badge-indigo",
  LOGIN_FAILED:         "badge-red",
  MULTI_DEVICE_BLOCKED: "badge-red",
  PDF_VIEWED:           "badge-cyan",
  SCREENSHOT_ATTEMPT:   "badge-red",
  SESSION_TERMINATED:   "badge-amber",
  PASSWORD_CHANGED:     "badge-indigo",
  PROFILE_UPDATED:      "badge-indigo",
};

const STATUS_BADGE = {
  success: "badge-green",
  failed:  "badge-red",
  blocked: "badge-amber",
};

const ALL_ACTIONS = ["ALL", "LOGIN", "LOGOUT", "LOGIN_FAILED", "MULTI_DEVICE_BLOCKED", "PDF_VIEWED", "SCREENSHOT_ATTEMPT", "SESSION_TERMINATED"];

const Logs = () => {
  const [logs, setLogs]         = useState([]);
  const [loading, setL]         = useState(true);
  const [search, setSearch]     = useState("");
  const [actionF, setActionF]   = useState("ALL");
  const [statusF, setStatusF]   = useState("ALL");
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(() => {
    setL(true);
    apiLogs(1, 200).then(d => setLogs(d.logs || [])).catch(() => {}).finally(() => setL(false));
  }, []);

  useEffect(load, [load]);

  const filtered = logs.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = ((l.user_email||"") + l.action + (l.details||"") + (l.ip_address||"")).toLowerCase().includes(q);
    const matchAction = actionF === "ALL" || l.action === actionF;
    const matchStatus = statusF === "ALL" || l.status === statusF;
    return matchSearch && matchAction && matchStatus;
  });

  const exportCSV = () => {
    const header = "Timestamp,User,Action,Details,IP,Status\n";
    const rows = filtered.map(l =>
      `"${new Date(l.created_at).toLocaleString()}","${l.user_email||""}","${l.action}","${l.details || ""}","${l.ip_address||""}","${l.status}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `activity-logs-${Date.now()}.csv`;
    a.click();
  };

  return (
    <Layout>
      <div className="ap-page-header">
        <h2>Activity Logs</h2>
        <p>Full audit trail — every user action recorded and timestamped</p>
      </div>

      {/* Filters */}
      <div className="ap-card" style={{ padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div className="ap-search" style={{ flex: 1, minWidth: 200 }}>
            <span className="ap-search-icon">🔍</span>
            <input className="ap-input" style={{ width: "100%" }} placeholder="Search by user, action, IP…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <select className="ap-input" style={{ width: 200 }} value={actionF} onChange={e => setActionF(e.target.value)}>
            {ALL_ACTIONS.map(a => <option key={a} value={a}>{a.replace(/_/g," ")}</option>)}
          </select>

          <select className="ap-input" style={{ width: 140 }} value={statusF} onChange={e => setStatusF(e.target.value)}>
            <option value="ALL">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="blocked">Blocked</option>
          </select>

          <button className="ap-btn ap-btn-ghost ap-btn-sm" onClick={load}>↻ Refresh</button>
          <button className="ap-btn ap-btn-ghost ap-btn-sm" onClick={exportCSV}>↓ Export CSV</button>
        </div>
      </div>

      {/* Count */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        {[
          { label: "Total",   val: filtered.length,                                    cls: "badge-indigo" },
          { label: "Success", val: filtered.filter(l => l.status==="success").length,  cls: "badge-green"  },
          { label: "Failed",  val: filtered.filter(l => l.status==="failed").length,   cls: "badge-red"    },
          { label: "Blocked", val: filtered.filter(l => l.status==="blocked").length,  cls: "badge-amber"  },
        ].map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--text-3)" }}>
            {s.label}: <span className={`badge ${s.cls}`}>{s.val}</span>
          </div>
        ))}
      </div>

      <div className="ap-card">
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Details</th>
                <th>IP Address</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>{Array.from({length:6}).map((_,j) => <td key={j}><div className="ap-skeleton" style={{height:14,width:j===0?110:80}} /></td>)}</tr>
              ))}
              {!loading && filtered.map(log => (
                <React.Fragment key={log.id}>
                  <tr
                    style={{ cursor: "pointer" }}
                    onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                  >
                    <td><span className="mono text-muted" style={{ fontSize: 11.5 }}>{new Date(log.created_at).toLocaleString()}</span></td>
                    <td><span style={{ fontWeight: 500, fontSize: 13 }}>{log.user_email}</span></td>
                    <td>
                      <span className={`badge ${ACTION_BADGE[log.action] || "badge-indigo"}`} style={{ fontSize: 10.5, fontFamily: "var(--mono)" }}>
                        {log.action}
                      </span>
                    </td>
                    <td><span className="text-muted text-sm" style={{ maxWidth: 200, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.details || "—"}</span></td>
                    <td><span className="mono text-muted" style={{ fontSize: 12 }}>{log.ip_address}</span></td>
                    <td><span className={`badge ${STATUS_BADGE[log.status] || "badge-indigo"}`}>{log.status}</span></td>
                  </tr>
                  {expanded === log.id && (
                    <tr>
                      <td colSpan={6} style={{ background: "var(--bg-2)", padding: "14px 20px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, fontSize: 12 }}>
                          <div><span style={{ color: "var(--text-3)" }}>User Agent</span><br /><span style={{ fontFamily: "var(--mono)", fontSize: 11 }}>{log.user_agent || "—"}</span></div>
                          <div><span style={{ color: "var(--text-3)" }}>Resource ID</span><br /><span className="mono">{log.resource_id || "—"}</span></div>
                          <div><span style={{ color: "var(--text-3)" }}>Log ID</span><br /><span className="mono">{log.id}</span></div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6}><div className="ap-empty">
                  <div className="ap-empty-icon">📋</div>
                  <div className="ap-empty-title">No logs found</div>
                  <div className="ap-empty-sub">Try adjusting your filters</div>
                </div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Logs;
