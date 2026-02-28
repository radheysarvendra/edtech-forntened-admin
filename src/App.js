import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/layout/PrivateRoute";

import Login     from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users     from "./pages/Users";
import Documents from "./pages/Documents";
import Sessions  from "./pages/Sessions";
import Logs      from "./pages/Logs";
import Settings  from "./pages/Settings";

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login"     element={<Login />} />
        <Route path="/"          element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/users"     element={<PrivateRoute><Users /></PrivateRoute>} />
        <Route path="/pdfs"      element={<PrivateRoute><Documents /></PrivateRoute>} />
        <Route path="/sessions"  element={<PrivateRoute><Sessions /></PrivateRoute>} />
        <Route path="/logs"      element={<PrivateRoute><Logs /></PrivateRoute>} />
        <Route path="/settings"  element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="*"          element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;