import React, { useEffect, useState, useRef, useCallback } from "react";
import Layout from "../components/layout/Layout";
import { ToastContainer } from "../components/ui/Toast";
import { useToast } from "../hooks/useToast";
import { apiGetPDFs, apiUploadPDF, apiUpdatePDF, apiDeletePDF, apiPDFViewUrl } from "../services/api";
import "../components/layout/Layout.css";
import "./Documents.css";

const SZ = (b) => b < 1048576 ? (b / 1024).toFixed(1) + " KB" : (b / 1048576).toFixed(1) + " MB";

/* ─── Upload Modal ─────── */
const UploadModal = ({ onDone, onClose }) => {
  const [form, setForm]     = useState({ title: "", description: "", access_level: "all", pages: "" });
  const [file, setFile]     = useState(null);
  const [drag, setDrag]     = useState(false);
  const [uploading, setUpl] = useState(false);
  const [progress, setProg] = useState(0);
  const [err, setErr]       = useState("");
  const fileRef             = useRef();

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") setFile(dropped);
    else setErr("Only PDF files are allowed.");
  };

  const submit = async (e) => {
    e.preventDefault(); setErr("");
    if (!file) { setErr("Please select a PDF file."); return; }
    setUpl(true); setProg(10);
    const fd = new FormData();
    fd.append("pdf", file);
    Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
    try {
      setProg(50);
      await apiUploadPDF(fd);
      setProg(100);
      setTimeout(() => { onDone(); onClose(); }, 400);
    } catch (ex) {
      setErr(ex.response?.data?.message || "Upload failed.");
      setProg(0);
    } finally { setUpl(false); }
  };

  return (
    <div className="ap-modal-overlay" onClick={e => e.target === e.currentTarget && !uploading && onClose()}>
      <div className="ap-modal" style={{ width: 560 }}>
        <div className="ap-modal-header">
          <h3>📤 Upload PDF Document</h3>
          <button className="ap-modal-close" onClick={onClose} disabled={uploading}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div className="ap-modal-body">
            <div
              className={`drop-zone ${drag ? "drag-over" : ""} ${file ? "has-file" : ""}`}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={handleDrop}
              onClick={() => !file && fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }}
                onChange={e => { setFile(e.target.files[0]); setErr(""); }} />
              {file ? (
                <div className="dz-file">
                  <div className="dz-file-icon">📄</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{file.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 3 }}>{SZ(file.size)}</div>
                  </div>
                  <button type="button" className="ap-btn ap-btn-ghost ap-btn-sm" style={{ marginLeft: "auto" }}
                    onClick={e => { e.stopPropagation(); setFile(null); }}>Remove</button>
                </div>
              ) : (
                <div>
                  <div className="dz-empty-icon">☁</div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Drop PDF here or click to browse</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>Max 50 MB · PDF files only</div>
                </div>
              )}
            </div>
            {uploading && (
              <div style={{ height: 4, background: "var(--border)", borderRadius: 2, marginBottom: 20, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: "var(--indigo)", borderRadius: 2, transition: "width 0.4s ease" }} />
              </div>
            )}
            <div className="ap-field">
              <label>Document Title *</label>
              <input className="ap-input" placeholder="e.g. Module 1 – Introduction" value={form.title} onChange={f("title")} required />
            </div>
            <div className="ap-field">
              <label>Description</label>
              <input className="ap-input" placeholder="Brief description (optional)" value={form.description} onChange={f("description")} />
            </div>
            <div className="ap-form-row">
              <div className="ap-field">
                <label>Access Level</label>
                <select className="ap-input" value={form.access_level} onChange={f("access_level")}>
                  <option value="all">All Users</option>
                  <option value="premium">Premium Only</option>
                  <option value="restricted">Restricted</option>
                </select>
              </div>
              <div className="ap-field">
                <label>Page Count</label>
                <input className="ap-input" type="number" min="1" placeholder="e.g. 24" value={form.pages} onChange={f("pages")} />
              </div>
            </div>
            {err && <div style={{ background: "var(--red-dim)", border: "1px solid rgba(239,68,68,.2)", borderRadius: "var(--r-sm)", padding: "10px 14px", color: "var(--red)", fontSize: 13 }}>{err}</div>}
          </div>
          <div className="ap-modal-footer">
            <button type="button" className="ap-btn ap-btn-ghost" onClick={onClose} disabled={uploading}>Cancel</button>
            <button type="submit" className="ap-btn ap-btn-primary" disabled={uploading}>
              {uploading ? `Uploading ${progress}%…` : "Upload & Secure PDF"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Edit Modal ─────── */
const EditModal = ({ pdf, onDone, onClose }) => {
  const [form, setForm]   = useState({ title: pdf.title, description: pdf.description || "", access_level: pdf.access_level, is_active: pdf.is_active });
  const [saving, setSaving] = useState(false);
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await apiUpdatePDF(pdf.id, form); onDone(); onClose(); }
    catch (_) {} finally { setSaving(false); }
  };

  return (
    <div className="ap-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ap-modal">
        <div className="ap-modal-header">
          <h3>✏️ Edit Document</h3>
          <button className="ap-modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div className="ap-modal-body">
            <div className="ap-field"><label>Title *</label><input className="ap-input" value={form.title} onChange={f("title")} required /></div>
            <div className="ap-field"><label>Description</label><input className="ap-input" value={form.description} onChange={f("description")} /></div>
            <div className="ap-field">
              <label>Access Level</label>
              <select className="ap-input" value={form.access_level} onChange={f("access_level")}>
                <option value="all">All Users</option>
                <option value="premium">Premium Only</option>
                <option value="restricted">Restricted</option>
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "var(--bg-2)", borderRadius: "var(--r-sm)", border: "1px solid var(--border)" }}>
              <input type="checkbox" id="is_active" checked={form.is_active} onChange={f("is_active")} style={{ width: 16, height: 16, accentColor: "var(--indigo)" }} />
              <label htmlFor="is_active" style={{ fontSize: 13, cursor: "pointer", margin: 0 }}>Document is active and visible to users</label>
            </div>
          </div>
          <div className="ap-modal-footer">
            <button type="button" className="ap-btn ap-btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="ap-btn ap-btn-primary" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Preview Modal ─────── */
const PreviewModal = ({ pdf, onClose }) => (
  <div className="ap-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="ap-modal" style={{ width: "90vw", maxWidth: 900, height: "90vh", display: "flex", flexDirection: "column" }}>
      <div className="ap-modal-header">
        <h3>📄 {pdf.title}</h3>
        <button className="ap-modal-close" onClick={onClose}>✕</button>
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <iframe src={apiPDFViewUrl(pdf.id)} style={{ width: "100%", height: "100%", border: "none" }} title={pdf.title} />
      </div>
    </div>
  </div>
);

/* ─── Confirm Dialog ─────── */
const Confirm = ({ title, desc, onConfirm, onClose }) => (
  <div className="ap-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="ap-confirm">
      <div className="ap-confirm-icon">🗑️</div>
      <h3>{title}</h3><p>{desc}</p>
      <div className="ap-confirm-btns">
        <button className="ap-btn ap-btn-ghost" onClick={onClose}>Cancel</button>
        <button className="ap-btn ap-btn-danger" onClick={onConfirm}>Delete</button>
      </div>
    </div>
  </div>
);

const accessBadge = { all: "badge-green", premium: "badge-cyan", restricted: "badge-amber" };

/* ─── Main Page ─────── */
const Documents = () => {
  const [pdfs, setPdfs]     = useState([]);
  const [loading, setL]     = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modal, setModal]   = useState(null);
  const { toasts, toast, dismiss } = useToast();

  const load = useCallback(() => {
    setL(true);
    apiGetPDFs()
      .then(d => setPdfs(d.pdfs || []))
      .catch(() => toast("Failed to load documents", "error"))
      .finally(() => setL(false));
  }, [toast]);

  useEffect(load, [load]);

  const filtered = pdfs.filter(p => {
    const matchSearch = (p.title + (p.description || "")).toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.access_level === filter;
    return matchSearch && matchFilter;
  });

  const handleDelete = async () => {
    await apiDeletePDF(modal.pdf.id);
    toast("Document deleted.", "success");
    setModal(null); load();
  };

  const handleToggleActive = async (pdf) => {
    await apiUpdatePDF(pdf.id, { is_active: !pdf.is_active });
    toast(`Document ${pdf.is_active ? "deactivated" : "activated"}.`, "success");
    load();
  };

  return (
    <Layout>
      <ToastContainer toasts={toasts} dismiss={dismiss} />
      <div className="ap-page-header">
        <h2>Documents</h2>
        <p>Upload, manage, and control access to protected PDF documents</p>
      </div>

      {/* Summary bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total PDFs",  value: pdfs.length,                                   color: "var(--indigo-2)" },
          { label: "Active",      value: pdfs.filter(p => p.is_active).length,           color: "var(--green)"   },
          { label: "Total Views", value: pdfs.reduce((s, p) => s + (p.view_count||0), 0), color: "var(--cyan)"  },
        ].map(s => (
          <div key={s.label} className="ap-card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</span>
            <span style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{loading ? "—" : s.value}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="ap-toolbar">
        <div className="ap-toolbar-left">
          <div className="ap-search">
            <span className="ap-search-icon">🔍</span>
            <input className="ap-input" placeholder="Search documents…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {["all", "premium", "restricted"].map(f => (
            <button key={f} className={`ap-btn ap-btn-sm ${filter === f ? "ap-btn-primary" : "ap-btn-ghost"}`}
              onClick={() => setFilter(f)} style={{ textTransform: "capitalize" }}>{f}</button>
          ))}
        </div>
        <div className="ap-toolbar-right">
          <button className="ap-btn ap-btn-ghost ap-btn-sm" onClick={load}>↻ Refresh</button>
          <button className="ap-btn ap-btn-primary" onClick={() => setModal({ type: "upload" })}>📤 Upload PDF</button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, marginBottom: 24 }}>
        {loading && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="ap-card" style={{ padding: 20 }}>
            <div className="ap-skeleton" style={{ height: 60, borderRadius: 10, marginBottom: 14 }} />
            <div className="ap-skeleton" style={{ height: 14, width: "70%", marginBottom: 8 }} />
            <div className="ap-skeleton" style={{ height: 12, width: "40%" }} />
          </div>
        ))}
        {!loading && filtered.map(pdf => (
          <div key={pdf.id} className="ap-card pdf-card-item" style={{ opacity: pdf.is_active ? 1 : 0.55 }}>
            <div className="pdf-card-top">
              <div className="pdf-card-icon">PDF</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>{pdf.title}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>
                  {SZ(pdf.file_size || 0)}{pdf.pages > 0 ? ` · ${pdf.pages} pages` : ""}
                </div>
              </div>
              <span className={`badge ${accessBadge[pdf.access_level] || "badge-indigo"}`}>{pdf.access_level}</span>
            </div>
            {pdf.description && (
              <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 14, lineHeight: 1.5, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                {pdf.description}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
              <div style={{ display: "flex", gap: 12, fontSize: 11.5, color: "var(--text-3)" }}>
                <span>👁 {pdf.view_count || 0} views</span>
                <span>{new Date(pdf.created_at).toLocaleDateString()}</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="ap-btn ap-btn-ghost ap-btn-sm" onClick={() => setModal({ type: "preview", pdf })}>Preview</button>
                <button className="ap-btn ap-btn-ghost ap-btn-sm" onClick={() => setModal({ type: "edit", pdf })}>Edit</button>
                <button className="ap-btn ap-btn-sm" style={{ background: "var(--amber-dim)", color: "var(--amber)", border: "1px solid rgba(245,158,11,.2)" }}
                  onClick={() => handleToggleActive(pdf)}>{pdf.is_active ? "Hide" : "Show"}</button>
                <button className="ap-btn ap-btn-danger ap-btn-sm" onClick={() => setModal({ type: "delete", pdf })}>🗑</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="ap-card"><div className="ap-empty">
          <div className="ap-empty-icon">📄</div>
          <div className="ap-empty-title">No documents found</div>
          <div className="ap-empty-sub">Upload a PDF or adjust your search filter</div>
          <button className="ap-btn ap-btn-primary" style={{ marginTop: 16 }} onClick={() => setModal({ type: "upload" })}>Upload First PDF</button>
        </div></div>
      )}

      {modal?.type === "upload"  && <UploadModal onDone={() => { toast("PDF uploaded!", "success"); load(); }} onClose={() => setModal(null)} />}
      {modal?.type === "edit"    && <EditModal pdf={modal.pdf} onDone={() => { toast("Updated!", "success"); load(); }} onClose={() => setModal(null)} />}
      {modal?.type === "preview" && <PreviewModal pdf={modal.pdf} onClose={() => setModal(null)} />}
      {modal?.type === "delete"  && <Confirm title="Delete Document" desc={`Permanently delete "${modal.pdf.title}"?`} onConfirm={handleDelete} onClose={() => setModal(null)} />}
    </Layout>
  );
};

export default Documents;