import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

const MODALITIES = ["x-ray", "ct", "mri", "ultrasound", "ecg", "echo", "endoscopy", "other"];

const statusBadge = (status) => {
    const map = {
        ordered: "amber",
        scheduled: "blue",
        "in-progress": "purple",
        completed: "green",
        cancelled: "red",
    };
    return map[status] || "gray";
};

export default function Radiology() {
    const [orders, setOrders] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        patient: "",
        doctor: "",
        modality: "x-ray",
        bodyPart: "",
        clinicalHistory: "",
    });

    const loadData = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (statusFilter) params.set("status", statusFilter);
        Promise.all([
            api.get(`/radiology${params.toString() ? `?${params}` : ""}`),
            api.get("/patients"),
            api.get("/doctors"),
        ])
            .then(([rad, pat, doc]) => {
                setOrders(rad.orders || []);
                setPatients(pat.patients || []);
                setDoctors(doc.doctors || []);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, [statusFilter]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await api.post("/radiology", {
                patient: form.patient,
                doctor: form.doctor,
                modality: form.modality,
                bodyPart: form.bodyPart,
                clinicalHistory: form.clinicalHistory,
            });
            setSuccess("Radiology order created!");
            setShowForm(false);
            setForm({ patient: "", doctor: "", modality: "x-ray", bodyPart: "", clinicalHistory: "" });
            loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/radiology/${id}`, { status });
            setSuccess(`Order marked ${status}.`);
            loadData();
        } catch (err) {
            setError(err.message);
        }
    };

    const patientName = (o) => o.patient?.user?.name || o.patient?.uhid || "—";

    return (
        <div>
            <div className="page-head">
                <div>
                    <h2>Radiology (RIS)</h2>
                    <p>Order imaging studies and manage reports</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "✕ Close" : "+ New Order"}
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {showForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3>Create Radiology Order</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Patient *</label>
                                <select name="patient" value={form.patient} onChange={handleChange} required>
                                    <option value="">Select patient</option>
                                    {patients.map((p) => (
                                        <option key={p._id} value={p._id}>
                                            {p.user?.name || p.uhid} ({p.uhid})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Doctor *</label>
                                <select name="doctor" value={form.doctor} onChange={handleChange} required>
                                    <option value="">Select doctor</option>
                                    {doctors.map((d) => (
                                        <option key={d._id} value={d._id}>
                                            {d.user?.name || d._id} ({d.specialization || "General"})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Modality *</label>
                                <select name="modality" value={form.modality} onChange={handleChange}>
                                    {MODALITIES.map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Body Part</label>
                                <input name="bodyPart" value={form.bodyPart} onChange={handleChange} placeholder="e.g. Chest, Right knee" />
                            </div>
                            <div className="form-group">
                                <label>Clinical History</label>
                                <textarea name="clinicalHistory" value={form.clinicalHistory} onChange={handleChange} rows={2} />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "Saving…" : "Create Order"}
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
                    {["ordered", "scheduled", "in-progress", "completed", "cancelled"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="loading"><span className="spinner" /> Loading radiology orders…</div>
            ) : orders.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🩻</div>
                    <p>No radiology orders found.</p>
                </div>
            ) : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Modality</th>
                                <th>Body Part</th>
                                <th>Doctor</th>
                                <th>Status</th>
                                <th>Report</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((o) => (
                                <tr key={o._id}>
                                    <td><strong>{patientName(o)}</strong></td>
                                    <td><span className="badge teal">{o.modality}</span></td>
                                    <td>{o.bodyPart || "—"}</td>
                                    <td>{o.doctor?.user?.name || o.doctor?.specialization || "—"}</td>
                                    <td><span className={`badge ${statusBadge(o.status)}`}>{o.status}</span></td>
                                    <td>{o.reportReady ? <span className="badge green">Ready</span> : <span className="badge gray">Pending</span>}</td>
                                    <td>
                                        {o.status === "ordered" && (
                                            <button className="btn btn-primary btn-sm" onClick={() => updateStatus(o._id, "in-progress")}>
                                                Start
                                            </button>
                                        )}
                                        {o.status === "in-progress" && (
                                            <button className="btn btn-success btn-sm" onClick={() => updateStatus(o._id, "completed")}>
                                                Complete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}