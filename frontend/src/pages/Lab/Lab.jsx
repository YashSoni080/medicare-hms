import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

const STATUS_BADGE = {
    ordered: "amber",
    "sample-collected": "blue",
    received: "blue",
    processing: "purple",
    verified: "teal",
    published: "green",
    cancelled: "red",
};

export default function Lab() {
    const [orders, setOrders] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");
    const [form, setForm] = useState({ patient: "", testName: "", category: "pathology" });

    const loadOrders = () => {
        setLoading(true);
        api.get(`/lab-orders${statusFilter ? `?status=${statusFilter}` : ""}`)
            .then((data) => setOrders(data.labOrders || []))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadOrders();
        api.get("/patients").then((d) => setPatients(d.patients || [])).catch(() => { });
    }, [statusFilter]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await api.post("/lab-orders", form);
            setSuccess("Lab order created successfully!");
            setShowForm(false);
            setForm({ patient: "", testName: "", category: "pathology" });
            loadOrders();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/lab-orders/${id}/status`, { status });
            loadOrders();
        } catch (err) {
            setError(err.message);
        }
    };

    const nextStatus = (current) => {
        const flow = ["ordered", "sample-collected", "received", "processing", "verified", "published"];
        const idx = flow.indexOf(current);
        return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null;
    };

    return (
        <div>
            <div className="page-head">
                <div>
                    <h2>Laboratory</h2>
                    <p>Manage lab orders and test results</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "✕ Close" : "+ New Lab Order"}
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {showForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3>Create Lab Order</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Patient *</label>
                                <select name="patient" value={form.patient} onChange={handleChange} required>
                                    <option value="">Select patient…</option>
                                    {patients.map((p) => (
                                        <option key={p._id} value={p._id}>
                                            {p.uhid} — {p.user?.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Test Name *</label>
                                <input name="testName" value={form.testName} onChange={handleChange} required placeholder="e.g. Complete Blood Count" />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select name="category" value={form.category} onChange={handleChange}>
                                    <option value="pathology">Pathology</option>
                                    <option value="radiology">Radiology</option>
                                    <option value="microbiology">Microbiology</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "Creating…" : "Create Order"}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="filters">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All statuses</option>
                    {Object.keys(STATUS_BADGE).map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="loading"><span className="spinner" /> Loading lab orders…</div>
            ) : orders.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🧪</div>
                    <p>No lab orders found.</p>
                </div>
            ) : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Barcode</th>
                                <th>Patient</th>
                                <th>Test</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Critical</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((o) => {
                                const next = nextStatus(o.status);
                                return (
                                    <tr key={o._id}>
                                        <td><span className="badge gray">{o.barcode}</span></td>
                                        <td><strong>{o.patient?.user?.name}</strong></td>
                                        <td>{o.testName}</td>
                                        <td>{o.category}</td>
                                        <td>
                                            <span className={`badge ${STATUS_BADGE[o.status] || "gray"}`}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td>
                                            {o.criticalAlert ? (
                                                <span className="badge red">⚠ Critical</span>
                                            ) : (
                                                "—"
                                            )}
                                        </td>
                                        <td>
                                            {next && (
                                                <button className="btn btn-sm btn-primary" onClick={() => updateStatus(o._id, next)}>
                                                    → {next}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}