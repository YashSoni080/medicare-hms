import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/logo.svg";
import "./AppLayout.css";

const NAV_ITEMS = [
    { to: "/dashboard", label: "Dashboard", icon: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" },
    { to: "/patients", label: "Patients", icon: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" },
    { to: "/opd", label: "OPD & Queue", icon: "M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5zm2 4h10v2H7v-2zm0 4h7v2H7v-2z" },
    { to: "/emergency", label: "Emergency", icon: "M12 2L1 21h22L12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" },
    { to: "/telemedicine", label: "Telemedicine", icon: "M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" },
    { to: "/wards", label: "Wards & IPD", icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7v-7zm4-3h2v10h-2V7zm4 3h2v7h-2v-7z" },
    { to: "/ot", label: "Operation Theatre", icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7v-7zm4-3h2v10h-2V7zm4 3h2v7h-2v-7z" },
    { to: "/nursing", label: "Nursing Station", icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7v-7zm4-3h2v10h-2V7zm4 3h2v7h-2v-7z" },
    { to: "/diet", label: "Diet & Nutrition", icon: "M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" },
    { to: "/records", label: "Medical Records", icon: "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" },
    { to: "/pharmacy", label: "Pharmacy", icon: "M11.5 2h-1v5h-5v1h5v5h1v-5h5V7h-5V2zM6 13.5c0 1.93 1.57 3.5 3.5 3.5.83 0 1.59-.29 2.2-.77.61.48 1.37.77 2.2.77 1.93 0 3.5-1.57 3.5-3.5 0-.83-.29-1.59-.77-2.2.48-.61.77-1.37.77-2.2 0-1.93-1.57-3.5-3.5-3.5-.83 0-1.59.29-2.2.77-.61-.48-1.37-.77-2.2-.77-1.93 0-3.5 1.57-3.5 3.5 0 .83.29 1.59.77 2.2-.48.61-.77 1.37-.77 2.2zM11.5 18.5c0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5c0-.83-.29-1.59-.77-2.2.48-.61.77-1.37.77-2.2 0-1.93-1.57-3.5-3.5-3.5s-3.5 1.57-3.5 3.5c0 .83.29 1.59.77 2.2-.48.61-.77 1.37-.77 2.2z" },
    { to: "/lab", label: "Lab (LIS)", icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7v-7zm4-3h2v10h-2V7zm4 3h2v7h-2v-7z" },
    { to: "/blood-bank", label: "Blood Bank", icon: "M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z" },
    { to: "/radiology", label: "Radiology (RIS)", icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7v-7zm4-3h2v10h-2V7zm4 3h2v7h-2v-7z" },
    { to: "/billing", label: "Billing", icon: "M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" },
    { to: "/insurance", label: "Insurance", icon: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" },
    { to: "/inventory", label: "Inventory", icon: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zM7 9h10v2H7V9zm0 4h7v2H7v-2z" },
    { to: "/housekeeping", label: "Housekeeping", icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7v-7zm4-3h2v10h-2V7zm4 3h2v7h-2v-7z" },
    { to: "/ambulance", label: "Ambulance", icon: "M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM10 17l3-3h-2v-4l-3 3h2v4zm11-4h-2v-2h-2v2h-2v2h2v2h2v-2h2v-2z" },
    { to: "/admin", label: "Admin & Audit", icon: "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" },
    { to: "/staff", label: "Staff", icon: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" },
    { to: "/reports", label: "Reports", icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7v-7zm4-3h2v10h-2V7zm4 3h2v7h-2v-7z" },
    { to: "/service-charges", label: "Service Charges", icon: "M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" },
];

const PAGE_TITLES = {
    "/dashboard": "Dashboard",
    "/patients": "Patients",
    "/opd": "OPD & Queue",
    "/emergency": "Emergency",
    "/telemedicine": "Telemedicine",
    "/wards": "Wards & IPD",
    "/ot": "Operation Theatre",
    "/nursing": "Nursing Station",
    "/diet": "Diet & Nutrition",
    "/records": "Medical Records",
    "/pharmacy": "Pharmacy",
    "/lab": "Lab (LIS)",
    "/blood-bank": "Blood Bank",
    "/radiology": "Radiology (RIS)",
    "/billing": "Billing",
    "/insurance": "Insurance",
    "/inventory": "Inventory",
    "/housekeeping": "Housekeeping",
    "/ambulance": "Ambulance",
    "/admin": "Admin & Audit",
    "/staff": "Staff",
    "/reports": "Reports",
    "/service-charges": "Service Charges",
};

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
}

export default function AppLayout() {
    const [user, setUser] = useState(null);
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

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

    const today = new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const currentTitle = PAGE_TITLES[location.pathname] || "MediCare HMS";

    return (
        <div className={`app-layout ${collapsed ? "collapsed" : ""}`}>
            <aside className="app-sidebar">
                <div className="sidebar-brand">
                    <img src={logo} alt="MediCare" className="brand-logo" />
                    {!collapsed && (
                        <div className="brand-text-wrap">
                            <span className="brand-text">MediCare</span>
                            <span className="brand-sub">Hospital Management</span>
                        </div>
                    )}
                </div>

                <nav className="sidebar-nav">
                    <span className="nav-section-label">{!collapsed && "Main Menu"}</span>
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? "active" : ""}`
                            }
                            title={item.label}
                        >
                            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d={item.icon} />
                            </svg>
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
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                        </svg>
                    </button>
                </div>
            </aside>

            <main className="app-main">
                <header className="app-header">
                    <button
                        className="collapse-btn"
                        onClick={() => setCollapsed(!collapsed)}
                        title={collapsed ? "Expand" : "Collapse"}
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            {collapsed
                                ? <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                                : <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />}
                        </svg>
                    </button>
                    <div className="header-title-wrap">
                        <h1 className="page-title">{currentTitle}</h1>
                        <span className="header-date">{today}</span>
                    </div>
                    <div className="header-right">
                        {user && (
                            <div className="header-user">
                                <span className="header-greeting">{getGreeting()},</span>
                                <span className="header-user-name">{user.name}</span>
                            </div>
                        )}
                    </div>
                </header>
                <div className="app-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
