import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import "./AppLayout.css";

const NAV_ITEMS = [
    { to: "/dashboard", icon: "📊", label: "Dashboard" },
    { to: "/patients", icon: "👥", label: "Patients" },
    { to: "/opd", icon: "📅", label: "OPD & Queue" },
    { to: "/wards", icon: "🛏️", label: "Wards & IPD" },
    { to: "/records", icon: "📋", label: "Medical Records" },
    { to: "/pharmacy", icon: "💊", label: "Pharmacy" },
    { to: "/lab", icon: "🧪", label: "Lab (LIS)" },
    { to: "/billing", icon: "💰", label: "Billing" },
    { to: "/insurance", icon: "🛡️", label: "Insurance" },
    { to: "/inventory", icon: "📦", label: "Inventory" },
    { to: "/admin", icon: "⚙️", label: "Admin & Audit" },
];

export default function AppLayout() {
    const [user, setUser] = useState(null);
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) {
            try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
        }
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login", { replace: true });
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className={`app-layout ${collapsed ? "collapsed" : ""}`}>
            <aside className="app-sidebar">
                <div className="sidebar-brand">
                    <img src={logo} alt="MediCare" className="brand-logo" />
                    {!collapsed && <span className="brand-text">MediCare HMS</span>}
                </div>

                <nav className="sidebar-nav">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? "active" : ""}`
                            }
                        >
                            <span className="sidebar-icon">{item.icon}</span>
                            {!collapsed && <span className="sidebar-label">{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    {user && (
                        <div className="sidebar-user">
                            <span className="user-avatar">
                                {user.name?.charAt(0) || "U"}
                            </span>
                            {!collapsed && (
                                <div className="user-info">
                                    <span className="user-name">{user.name}</span>
                                    <span className="user-role">{user.role}</span>
                                </div>
                            )}
                        </div>
                    )}
                    <button onClick={handleLogout} className="sidebar-logout" title="Sign out">
                        ⏻
                    </button>
                </div>
            </aside>

            <main className="app-main">
                <header className="app-header">
                    <button
                        className="collapse-btn"
                        onClick={() => setCollapsed(!collapsed)}
                        title={collapsed ? "Expand" : "Collapse"}
                    >
                        {collapsed ? "→" : "←"}
                    </button>
                    <h1 className="page-title">MediCare HMS</h1>
                </header>
                <div className="app-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
