import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Layout.css";

const NAV_ITEMS = [
  { to: "/dashboard", icon: "📊", label: "Dashboard" },
  { to: "/users",     icon: "👥", label: "Users"     },
  { to: "/pdfs",      icon: "📄", label: "Documents" },
  { to: "/sessions",  icon: "💻", label: "Sessions"  },
  { to: "/logs",      icon: "📋", label: "Logs"      },
  { to: "/settings",  icon: "⚙️",  label: "Settings" },
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className={`ap-shell ${collapsed ? "ap-shell--collapsed" : ""}`}>
      <aside className="ap-sidebar">
        <div className="ap-sidebar-top">
          <div className="ap-brand">
            <div className="ap-brand-icon">S</div>
            {!collapsed && <div><div className="ap-brand-name">SecurePortal</div><div className="ap-brand-sub">Admin Console</div></div>}
          </div>
          <nav className="ap-nav">
            {NAV_ITEMS.map(item => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `ap-nav-item ${isActive ? "ap-nav-item--active" : ""}`}>
                <span className="ap-nav-icon">{item.icon}</span>
                {!collapsed && <span className="ap-nav-label">{item.label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="ap-sidebar-bottom">
          {!collapsed && (
            <div className="ap-user-info">
              <div className="ap-user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
              <div className="ap-user-details">
                <div className="ap-user-name">{user?.name}</div>
                <div className="ap-user-email">{user?.email}</div>
              </div>
            </div>
          )}
          <button className="ap-logout-btn" onClick={handleLogout}>
            <span>🚪</span>{!collapsed && <span>Logout</span>}
          </button>
          <button className="ap-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? "→" : "←"}
          </button>
        </div>
      </aside>
      <main className="ap-main">
        <div className="ap-content">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
