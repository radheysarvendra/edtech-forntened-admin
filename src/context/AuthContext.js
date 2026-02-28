import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiLogin, apiLogout, apiGetMe } from "../services/api";

const Ctx = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(null);
  const [loading, setLoad]  = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("ap_token");
    if (!token) { setLoad(false); return; }
    apiGetMe()
      .then(({ user }) => setUser(user))
      .catch(() => { localStorage.removeItem("ap_token"); localStorage.removeItem("ap_user"); })
      .finally(() => setLoad(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await apiLogin({ email, password });
    if (data.user.role !== "admin") throw new Error("Admin access only.");
    localStorage.setItem("ap_token", data.token);
    localStorage.setItem("ap_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await apiLogout(); } catch (_) {}
    localStorage.removeItem("ap_token");
    localStorage.removeItem("ap_user");
    setUser(null);
  }, []);

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);
