import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api.js";

const STAT_CARDS = [
    { key: "totalPatients", icon: "🧑‍🤝‍🧑", label: "Total Patients", color: "teal" },
    { key: "totalDoctors", icon: "👨‍⚕️", label: "Doctors", color: "blue" },
    { key: "todayAppointments", icon: "📅", label: "Today's Appointments", color: "amber" },
    { key: "waitingEncounters", icon: "🕐", label: "Waiting in Queue", color: "purple" },
    { key: "activeAdmissions", icon: "🛏️", label: "Active Admissions", color: "green" },
    { key: "pendingLabOrders", icon: "🧪", label: "Lab Orders in Progress", color: "blue" },
    { key: "lowStockItems", icon: "📦", label: "Low Stock Items", color: "red" },
    { key: "revenue", icon: "💰", label: "Revenue (Paid)", color: "green", format: "currency" },
    { key: "bedOccupancy", icon: "🏥", label: "Bed Occupancy", color: "amber", format: "percent" },
];

const QUICK_ACTIONS = [
    { to: "/patients", label: "Register Patient", icon: "🧑‍🤝‍🧑", desc: "New UHID record" },
    { to: "/opd", label: "Book Appointment", icon: "📅", desc: "OPD slot booking" },
    { to: "/billing", label: "Create Invoice", icon: "💰", desc: "Bill & payments" },
    { to: "/wards", label: "Admit Patient", icon: "🛏️", desc: "Ward admission" },
];

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
}

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/dashboard/stats")
            .then((data) => setStats(data.stats))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const formatValue = (value, format) => {
        if (format === "currency") return `₹${Number(value || 0).toLocaleString("en-IN")}`;
        if (format === "percent") return `${value || 0}%`;
        return Number(value || 0).toLocaleString("en-IN");
    };

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return (
        <div>
            <div className="page-head">
                <div>
                    <h2>Dashboard</h2>
                    <p>Hospital overview at a glance</p>
                </div>
            </div>

            <div className="dash-welcome">
                <div className="dash-welcome-text">
                    <h3>{getGreeting()}, {user.name || "there"} 👋</h3>
                    <p>Here's what's happening at MediCare today.</p>
                </div>
                <div className="dash-welcome-date">
                    {new Date().toLocaleDateString("en-IN", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })}
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {loading ? (
                <div className="loading"><span className="spinner" /> Loading dashboard…</div>
            ) : (
                <div className="stats-grid">
                    {STAT_CARDS.map((card) => (
                        <div className="stat-card" key={card.key}>
                            <div className={`stat-icon ${card.color}`}>{card.icon}</div>
                            <div>
                                <div className="stat-value">
                                    {formatValue(stats?.[card.key], card.format)}
                                </div>
                                <div className="stat-label">{card.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="two-col">
                <div className="card">
                    <h3>Quick Actions</h3>
                    <div className="quick-actions-grid">
                        {QUICK_ACTIONS.map((action) => (
                            <Link className="quick-action-card" to={action.to} key={action.to}>
                                <span className="quick-action-icon">{action.icon}</span>
                                <div>
                                    <strong>{action.label}</strong>
                                    <span>{action.desc}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="card">
                    <h3>Today's Focus</h3>
                    <div className="detail-row">
                        <span className="label">Appointments today</span>
                        <span className="value">{stats?.todayAppointments || 0}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Waiting in queue</span>
                        <span className="value">{stats?.waitingEncounters || 0}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Active admissions</span>
                        <span className="value">{stats?.activeAdmissions || 0}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Bed occupancy</span>
                        <span className="value">{stats?.bedOccupancy || 0}%</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Low stock items</span>
                        <span className="value">{stats?.lowStockItems || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}