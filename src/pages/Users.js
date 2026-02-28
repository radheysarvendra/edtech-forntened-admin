import React, { useEffect, useState, useCallback } from "react";
import Layout from "../components/layout/Layout";
import { ToastContainer } from "../components/ui/Toast";
import { useToast } from "../hooks/useToast";
import { apiGetUsers, apiCreateUser, apiUpdateUser, apiDeleteUser, apiBlockUser, apiKickUser } from "../services/api";
import "../components/layout/Layout.css";

const EMPTY = { name: "", email: "", password: "", access_level: "basic", role: "user" };

const UserModal = ({ mode, initial, onSave, onClose }) => {
  const [form, setForm] = useState(initial ? { name: initial.name, email: initial.email, access_level: initial.access_level, role: initial.role, password: "" } : EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault(); setErr(""); setSaving(true);
    try { await onSave(form); } catch (ex) { setErr(ex.response?.data?.message || "Error"); } finally { setSaving(false); }
  };
  return (
    <div className="ap-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ap-modal">
        <div className="ap-modal-header">
          <h3>{mode === "create" ? "➕ Create New User" : "✏️ Edit User"}</h3>
          <button className="ap-modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div className="ap-modal-body">
            <div className="ap-form-row">
              <div className="ap-field"><label>Full Name *</label><input className="ap-input" placeholder="John Doe" value={form.name} onChange={f("name")} required /></div>
              <div className="ap-field"><label>Email *</label><input className="ap-input" type="email" placeholder="john@example.com" value={form.email} onChange={f("email")} required /></div>
            </div>
            {mode === "create" && <div className="ap-field"><label>Password * (min 6)</label><input className="ap-input" type="password" placeholder="••••••••" value={form.password} onChange={f("password")} required minLength={6} /></div>}
            <div className="ap-form-row">
              <div className="ap-field"><label>Access Level</label>
                <select className="ap-input" value={form.access_level} onChange={f("access_level")}>
                  <option value="basic">Basic – Public PDFs</option>
                  <option value="premium">Premium – All PDFs</option>
                  <option value="restricted">Restricted</option>
                </select>
              </div>
              <div className="ap-field"><label>Role</label>
                <select className="ap-input" value={form.role} onChange={f("role")}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            {err && <div style={{ background:"var(--red-dim)", border:"1px solid rgba(239,68,68,.25)", borderRadius:"var(--r-sm)", padding:"10px 14px", color:"var(--red)", fontSize:13 }}>{err}</div>}
          </div>
          <div className="ap-modal-footer">
            <button type="button" className="ap-btn ap-btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="ap-btn ap-btn-primary" disabled={saving}>{saving ? "Saving…" : mode === "create" ? "Create User" : "Save Changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Confirm = ({ title, desc, onConfirm, onClose }) => (
  <div className="ap-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="ap-confirm">
      <div className="ap-confirm-icon">⚠️</div>
      <h3>{title}</h3><p>{desc}</p>
      <div className="ap-confirm-btns">
        <button className="ap-btn ap-btn-ghost" onClick={onClose}>Cancel</button>
        <button className="ap-btn ap-btn-danger" onClick={onConfirm}>Delete</button>
      </div>
    </div>
  </div>
);

const statusBadge = u => {
  if (u.is_blocked) return <span className="badge badge-red"><span className="badge-dot"/>Blocked</span>;
  if (u.active_device_info) return <span className="badge badge-green"><span className="badge-dot"/>Online</span>;
  return <span className="badge badge-indigo">Offline</span>;
};
const accessColor = { basic:"badge-indigo", premium:"badge-cyan", restricted:"badge-amber" };

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const { toasts, toast, dismiss } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    apiGetUsers().then(d => setUsers(d.users || [])).catch(() => toast("Failed to load users","error")).finally(() => setLoading(false));
  }, [toast]);

  useEffect(load, [load]);

  const filtered = users.filter(u => (u.name+u.email).toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout>
      <ToastContainer toasts={toasts} dismiss={dismiss} />
      <div className="ap-page-header"><h2>User Management</h2><p>Create, update, block, and control user access levels</p></div>
      <div className="ap-toolbar">
        <div className="ap-toolbar-left">
          <div className="ap-search"><span className="ap-search-icon">🔍</span><input className="ap-input" placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} /></div>
          <span style={{ fontSize:12, color:"var(--text-3)" }}>{filtered.length} users</span>
        </div>
        <div className="ap-toolbar-right">
          <button className="ap-btn ap-btn-ghost ap-btn-sm" onClick={load}>↻ Refresh</button>
          <button className="ap-btn ap-btn-primary" onClick={() => setModal({ type:"create" })}>+ Create User</button>
        </div>
      </div>
      <div className="ap-card">
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead><tr><th>User</th><th>Access Level</th><th>Role</th><th>Status</th><th>Last Login</th><th>IP</th><th style={{textAlign:"right"}}>Actions</th></tr></thead>
            <tbody>
              {loading && Array.from({length:4}).map((_,i) => <tr key={i}>{Array.from({length:7}).map((_,j) => <td key={j}><div className="ap-skeleton" style={{height:16,width:j===0?180:80}}/></td>)}</tr>)}
              {!loading && filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:11}}>
                      <div style={{width:36,height:36,borderRadius:9,flexShrink:0,background:"linear-gradient(135deg,var(--indigo),var(--pink))",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,color:"white"}}>
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{fontWeight:600,fontSize:13}}>{u.name}</div>
                        <div style={{color:"var(--text-3)",fontSize:12}}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge ${accessColor[u.access_level]||"badge-indigo"}`}>{u.access_level}</span></td>
                  <td><span style={{fontSize:12,color:"var(--text-2)"}}>{u.role}</span></td>
                  <td>{statusBadge(u)}</td>
                  <td><span style={{fontSize:12,color:"var(--text-3)"}}>{u.last_login ? new Date(u.last_login).toLocaleString() : "Never"}</span></td>
                  <td><span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--text-3)"}}>{u.last_login_ip||"—"}</span></td>
                  <td>
                    <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
                      <button className="ap-btn ap-btn-ghost ap-btn-sm" onClick={() => setModal({type:"edit",user:u})}>Edit</button>
                      <button className="ap-btn ap-btn-sm" style={{background:u.is_blocked?"var(--green-dim)":"var(--amber-dim)",color:u.is_blocked?"var(--green)":"var(--amber)",border:`1px solid ${u.is_blocked?"rgba(34,197,94,.2)":"rgba(245,158,11,.2)"}`}} onClick={() => { apiBlockUser(u.id).then(() => { toast(`User ${u.is_blocked?"unblocked":"blocked"}.`,"success"); load(); }); }}>
                        {u.is_blocked ? "Unblock" : "Block"}
                      </button>
                      {u.active_device_info && <button className="ap-btn ap-btn-danger ap-btn-sm" onClick={() => { apiKickUser(u.id).then(() => { toast("Session terminated.","success"); load(); }); }}>Kick</button>}
                      <button className="ap-btn ap-btn-sm" style={{background:"transparent",border:"1px solid var(--red)",color:"var(--red)"}} onClick={() => setConfirm({user:u})}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && <tr><td colSpan={7}><div className="ap-empty"><div className="ap-empty-icon">👥</div><div className="ap-empty-title">No users found</div><div className="ap-empty-sub">Create a new user to get started</div></div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {modal?.type==="create" && <UserModal mode="create" onSave={async(f)=>{await apiCreateUser(f);toast("User created!","success");setModal(null);load();}} onClose={()=>setModal(null)} />}
      {modal?.type==="edit" && <UserModal mode="edit" initial={modal.user} onSave={async(f)=>{await apiUpdateUser(modal.user.id,f);toast("User updated!","success");setModal(null);load();}} onClose={()=>setModal(null)} />}
      {confirm && <Confirm title="Delete User" desc={`Permanently delete "${confirm.user.name}"?`} onConfirm={async()=>{await apiDeleteUser(confirm.user.id);toast("User deleted.","success");setConfirm(null);load();}} onClose={()=>setConfirm(null)} />}
    </Layout>
  );
};
export default Users;
