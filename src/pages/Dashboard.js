import React, { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import Layout from "../components/layout/Layout";
import "../components/layout/Layout.css";
import { apiStats } from "../services/api";

/* Mock chart data — replace with real API data */
const activityData = [
  { day: "Mon", logins: 12, views: 34 },
  { day: "Tue", logins: 19, views: 52 },
  { day: "Wed", logins: 8,  views: 28 },
  { day: "Thu", logins: 24, views: 67 },
  { day: "Fri", logins: 17, views: 45 },
  { day: "Sat", logins: 5,  views: 14 },
  { day: "Sun", logins: 9,  views: 22 },
];
const accessData = [
  { name: "Basic",    value: 55, color: "#5b5bd6" },
  { name: "Premium",  value: 30, color: "#00d2ff" },
  { name: "Restricted", value: 15, color: "#f59e0b" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--surface-2)", border: "1px solid var(--border-2)", borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
      <p style={{ color: "var(--text-3)", marginBottom: 6 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const StatCard = ({ label, value, sub, subColor, accentColor, icon }) => (
  <div className="ap-stat">
    <div className="ap-stat-accent" style={{ background: accentColor }} />
    <div className="ap-stat-label">{label}</div>
    <div className="ap-stat-value" style={{ color: accentColor }}>{value}</div>
    <div className="ap-stat-sub" style={{ color: subColor || "var(--text-3)" }}>
      {icon && <span>{icon}</span>}{sub}
    </div>
  </div>
);

const actionBadge = {
  LOGIN: "badge-green", LOGOUT: "badge-indigo", LOGIN_FAILED: "badge-red",
  MULTI_DEVICE_BLOCKED: "badge-red", PDF_VIEWED: "badge-cyan",
  SCREENSHOT_ATTEMPT: "badge-red", SESSION_TERMINATED: "badge-amber",
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs]   = useState([]);
  const [loading, setL]   = useState(true);

  useEffect(() => {
    apiStats()
      .then(d => { setStats(d.stats); setLogs(d.recentLogs || []); })
      .catch(() => {})
      .finally(() => setL(false));
  }, []);

  return (
    <Layout>
      <div className="ap-page-header">
        <h2>Dashboard</h2>
        <p>Real-time overview of your portal activity</p>
      </div>

      {/* Stats */}
      <div className="ap-stats">
        <StatCard label="Total Users"       value={loading ? "—" : stats?.totalUsers ?? 0}     sub="Registered accounts"     accentColor="var(--indigo-2)" />
        <StatCard label="Active Sessions"   value={loading ? "—" : stats?.activeSessions ?? 0} sub="● Online right now"       accentColor="var(--green)"    subColor="var(--green)" icon="" />
        <StatCard label="PDF Documents"     value={loading ? "—" : stats?.totalPDFs ?? 0}      sub="Uploaded & protected"    accentColor="var(--cyan)"     />
        <StatCard label="Blocked Attempts"  value={loading ? "—" : stats?.blockedAttempts ?? 0} sub="Multi-device violations" accentColor="var(--red)"      subColor="var(--red)" />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Area chart */}
        <div className="ap-card">
          <div className="ap-card-header">
            <span className="ap-card-title">Weekly Activity</span>
            <span className="badge badge-indigo">Last 7 days</span>
          </div>
          <div style={{ padding: "20px 16px 12px" }}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={activityData} margin={{ top: 0, right: 10, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="gLogins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#5b5bd6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#5b5bd6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00d2ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00d2ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--text-3)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-3)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="logins" name="Logins" stroke="#5b5bd6" strokeWidth={2} fill="url(#gLogins)" dot={{ r: 3, fill: "#5b5bd6" }} />
                <Area type="monotone" dataKey="views"  name="PDF Views" stroke="#00d2ff" strokeWidth={2} fill="url(#gViews)" dot={{ r: 3, fill: "#00d2ff" }} />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 20, paddingLeft: 8, marginTop: 8 }}>
              {[["Logins","#5b5bd6"],["PDF Views","#00d2ff"]].map(([l,c]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-3)" }}>
                  <span style={{ width: 12, height: 3, borderRadius: 2, background: c, display: "inline-block" }} />
                  {l}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pie chart */}
        <div className="ap-card">
          <div className="ap-card-header">
            <span className="ap-card-title">Access Distribution</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 16px" }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={accessData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {accessData.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", marginTop: 12 }}>
              {accessData.map(d => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, display: "inline-block" }} />
                    <span style={{ color: "var(--text-2)" }}>{d.name}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: d.color }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="ap-card">
        <div className="ap-card-header">
          <span className="ap-card-title">Recent Activity</span>
          <span className="badge badge-green"><span className="badge-dot" />Live</span>
        </div>
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Details</th>
                <th>IP</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={6}><div className="ap-skeleton" style={{ height: 18, width: "100%" }} /></td></tr>
              ))}
              {!loading && logs.slice(0, 10).map(log => (
                <tr key={log.id}>
                  <td><span style={{ fontWeight: 500 }}>{log.user_email}</span></td>
                  <td><span style={{ fontWeight: 600, fontSize: 12, fontFamily: "var(--mono)" }}>{log.action}</span></td>
                  <td><span className="text-muted text-sm">{log.details || "—"}</span></td>
                  <td><span className="mono text-muted">{log.ip_address}</span></td>
                  <td><span className="text-muted text-sm">{new Date(log.created_at).toLocaleTimeString()}</span></td>
                  <td><span className={`badge ${actionBadge[log.action] || "badge-indigo"}`}>{log.status}</span></td>
                </tr>
              ))}
              {!loading && logs.length === 0 && (
                <tr><td colSpan={6}><div className="ap-empty"><div className="ap-empty-icon">📋</div><div className="ap-empty-title">No activity yet</div></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
