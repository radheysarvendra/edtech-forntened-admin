import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

API.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("ap_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

API.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && !err.response?.data?.code) {
      localStorage.removeItem("ap_token");
      localStorage.removeItem("ap_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const apiLogin      = (d)       => API.post("/auth/login", d).then(r => r.data);
export const apiLogout     = ()        => API.post("/auth/logout").then(r => r.data);
export const apiGetMe      = ()        => API.get("/auth/me").then(r => r.data);
export const apiStats      = ()        => API.get("/admin/stats").then(r => r.data);
export const apiLogs       = (p=1,l=100) => API.get(`/admin/logs?page=${p}&limit=${l}`).then(r => r.data);
export const apiLogSS      = (d)       => API.post("/admin/log-screenshot", d).then(r => r.data);
export const apiGetUsers   = ()        => API.get("/users").then(r => r.data);
export const apiGetUser    = (id)      => API.get(`/users/${id}`).then(r => r.data);
export const apiCreateUser = (d)       => API.post("/users", d).then(r => r.data);
export const apiUpdateUser = (id,d)    => API.put(`/users/${id}`, d).then(r => r.data);
export const apiDeleteUser = (id)      => API.delete(`/users/${id}`).then(r => r.data);
export const apiBlockUser  = (id)      => API.put(`/users/${id}/block`).then(r => r.data);
export const apiKickUser   = (id)      => API.put(`/users/${id}/kick`).then(r => r.data);
export const apiSessions   = ()        => API.get("/users/sessions").then(r => r.data);
export const apiGetPDFs    = ()        => API.get("/pdfs").then(r => r.data);
export const apiUploadPDF  = (fd)      => API.post("/pdfs", fd, { headers: {"Content-Type":"multipart/form-data"} }).then(r => r.data);
export const apiUpdatePDF  = (id,d)    => API.put(`/pdfs/${id}`, d).then(r => r.data);
export const apiDeletePDF  = (id)      => API.delete(`/pdfs/${id}`).then(r => r.data);
export const apiPDFViewUrl = (id)      => {
  const t = localStorage.getItem("ap_token");
  return `${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/pdfs/${id}/view?token=${t}`;
};
export default API;
