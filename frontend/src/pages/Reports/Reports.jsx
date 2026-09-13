import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

const fmtMoney = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function Reports() {
    const [overview, setOverview] = useState(null);
    const [revenue, setRevenue] = useState(null);
    const [clinical, setClinical] = useState(null);
    const [operations, setOperations] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get("/reports/overview"),
            api.get("/reports/revenue"),
            api.get("/reports/clinical"),
            api.get("/reports/operations"),
        ])
            .then(([ov, rev, cli, ops]) => {
                setOverview(ov.report);
                setRevenue(rev.report);
                setClinical(cli.report);
                setOperations(ops.report);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="loading"><span className="spinner" /> Loading reports…</div>;
    }

    if (error) {
        return <div className="alert alert-error">{error}</div>;
    }

    const statCards = overview ? [
        { label: "Total Patients", value: overview.patients?.total ?? 0, icon: "🧑‍🤝‍🧑" },
        { label: "New Today", value: overview.patients?.newToday ?? 0, icon: "🆕" },
        { label: "Appointments", value: overview.appointments?.total ?? 0, icon: "📅" },
        { label: "Today's Appts", value: overview.appointments?.today ?? 0, icon: "🗓️" },
        { label: "Encounters", value: overview.encounters?.total ?? 0, icon: "🩺" },
        { label: "Month Revenue", value: fmtMoney(overview.billing?.monthRevenue), icon: "💰" },
        { label: "Pending Lab", value: overview.lab?.pendingOrders ?? 0, icon: "🧪" },
        { label: "Active Admissions", value: overview.wards?.activeAdmissions ?? 0, icon: "🛏️" },
        { label: "Emergency Cases", value: overview.emergency?.activeCases ?? 0, icon: "🚨" },
        { label: "Scheduled Surgeries", value: overview.ot?.scheduledSurgeries ?? 0, icon: "🏥" },
        { label: "Blood Units", value: overview.bloodBank?.availableUnits ?? 0, icon: "🩸" },
        { label: "Radiology Pending", value: overview.radiology?.pendingOrders ?? 0, icon: "🩻" },
        { label: "Telemedicine", value: overview.telemedicine?.upcoming ?? 0, icon: "📹" },
        { label: "Active Diet Plans", value: overview.diet?.activePlans ?? 0, icon: "🥗" },
        { label: "Nursing Tasks", value: overview.nursing?.pendingTasks ?? 0, icon: "🩺" },
        { label: "Housekeeping", value: overview.housekeeping?.pendingTasks ?? 0, icon: "🧹" },
        { label: "Active Trips", value: overview.ambulance?.activeTrips ?? 0, icon: "🚑" },
        { label: "Staff", value: overview.staff?.total ?? 0, icon: "👥" },
    ] : [];

    const renderGroup = (rows) => (
        <div className="table-wrap">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Count</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={r._id || r.label}>
                            <td><strong>{r._id || r.label}</strong></td>
                            <td>{r.count ?? r.total ?? 0}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div>
            <div className="page-head">
                <div>
                    <h2>Reports & Analytics</h2>
                    <p>Hospital-wide operational KPIs and clinical insights</p>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
                <h3>Overview</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                    {statCards.map((s) => (
                        <div key={s.label} className="stat-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 16 }}>
                            <div style={{ fontSize: 22 }}>{s.icon}</div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginTop: 6 }}>{s.value}</div>
                            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
                <h3>Revenue (This Month)</h3>
                {revenue?.byStatus?.length ? (
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Status</th>
                                    <th>Invoices</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {revenue.byStatus.map((r) => (
                                    <tr key={r._id}>
                                        <td><span className={`badge ${r._id === "paid" ? "green" : r._id === "partial" ? "amber" : "red"}`}>{r._id}</span></td>
                                        <td>{r.count}</td>
                                        <td><strong>{fmtMoney(r.total)}</strong></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state"><p>No invoice data this month.</p></div>
                )}
                {revenue?.monthly?.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                        <h4 style={{ marginBottom: 8 }}>Monthly Trend</h4>
                        <div className="table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Month</th>
                                        <th>Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {revenue.monthly.map((m) => (
                                        <tr key={m._id}>
                                            <td><strong>{m._id}</strong></td>
                                            <td>{fmtMoney(m.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
                <h3>Clinical Activity (This Month)</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                    <div>
                        <h4 style={{ marginBottom: 8 }}>Encounters by Type</h4>
                        {clinical?.encountersByType?.length ? renderGroup(clinical.encountersByType) : <div className="empty-state"><p>No data.</p></div>}
                    </div>
                    <div>
                        <h4 style={{ marginBottom: 8 }}>Lab Orders by Status</h4>
                        {clinical?.labByStatus?.length ? renderGroup(clinical.labByStatus) : <div className="empty-state"><p>No data.</p></div>}
                    </div>
                    <div>
                        <h4 style={{ marginBottom: 8 }}>Radiology by Modality</h4>
                        {clinical?.radiologyByModality?.length ? renderGroup(clinical.radiologyByModality) : <div className="empty-state"><p>No data.</p></div>}
                    </div>
                    <div>
                        <h4 style={{ marginBottom: 8 }}>Emergency by Triage</h4>
                        {clinical?.emergencyByTriage?.length ? renderGroup(clinical.emergencyByTriage) : <div className="empty-state"><p>No data.</p></div>}
                    </div>
                </div>
            </div>

            <div className="card">
                <h3>Operations</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                    <div>
                        <h4 style={{ marginBottom: 8 }}>Bed / Admission Status</h4>
                        {operations?.bedStats?.length ? renderGroup(operations.bedStats) : <div className="empty-state"><p>No data.</p></div>}
                    </div>
                    <div>
                        <h4 style={{ marginBottom: 8 }}>Nursing Tasks by Status</h4>
                        {operations?.nursingByStatus?.length ? renderGroup(operations.nursingByStatus) : <div className="empty-state"><p>No data.</p></div>}
                    </div>
                    <div>
                        <h4 style={{ marginBottom: 8 }}>Housekeeping by Status</h4>
                        {operations?.housekeepingByStatus?.length ? renderGroup(operations.housekeepingByStatus) : <div className="empty-state"><p>No data.</p></div>}
                    </div>
                    <div>
                        <h4 style={{ marginBottom: 8 }}>Blood Units by Group</h4>
                        {operations?.bloodByGroup?.length ? renderGroup(operations.bloodByGroup) : <div className="empty-state"><p>No data.</p></div>}
                    </div>
                </div>
                <div style={{ marginTop: 20 }}>
                    <h4 style={{ marginBottom: 8 }}>Low Stock Inventory (≤ 10)</h4>
                    {operations?.lowStock?.length ? (
                        <div className="table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Qty</th>
                                        <th>Reorder Level</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {operations.lowStock.map((i) => (
                                        <tr key={i._id}>
                                            <td><strong>{i.name}</strong></td>
                                            <td><span className="badge red">{i.quantity}</span></td>
                                            <td>{i.reorderLevel ?? "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state"><p>No low stock items.</p></div>
                    )}
                </div>
            </div>
        </div>
    );
}