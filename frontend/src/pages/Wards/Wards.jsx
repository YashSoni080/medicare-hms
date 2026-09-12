import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

const BED_BADGE = {
    available: "green",
    occupied: "red",
    cleaning: "amber",
    reserved: "blue",
    maintenance: "gray",
};

export default function Wards() {
    const [wards, setWards] = useState([]);
    const [admissions, setAdmissions] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");
    const [form, setForm] = useState({ patient: "", bed: "", depositAmount: 0, reason: "" });

    const loadData = () => {
        setLoading(true);
        Promise.all([
            api.get("/wards"),
            api.get("/wards/admissions"),
            api.get("/patients"),
        ])
            .then(([w, a, p]) => {
                setWards(w.wards || []);
                setAdmissions(a.admissions || []);
                setPatients(p.patients || []);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await api.post("/wards/admissions", {
                patient: form.patient,
                bed: form.bed,
                depositAmount: Number(form.depositAmount) || 0,
                reason: form.reason,
            });
            setSuccess("Patient admitted successfully!");
            setShowForm(false);
            setForm({ patient: "", bed: "", depositAmount: 0, reason: "" });
            loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const discharge = async (id) => {
        const summary = window.prompt("Discharge summary:");
        try {
            await api.put(`/wards/admissions/${id}/discharge`, { dischargeSummary: summary || "" });
            loadData();
        } catch (err) {
            setError(err.message);
        }
    };

    const availableBeds = wards.flatMap((w) =>
        (w.beds || []).filter((b) => b.status === "available").map((b) => ({ ...b, wardName: w.name }))
    );

    return (
        <div>
            <div className="page-head">
                <div>
                    <h2>Wards & IPD</h2>
                    <p>Manage beds, admissions, and discharges</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "✕ Close" : "+ Admit Patient"}
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {showForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3>Admit Patient</h3>
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
                                <label>Bed *</label>
                                <select name="bed" value={form.bed} onChange={handleChange} required>
                                    <option value="">Select available bed…</option>
                                    {availableBeds.map((b) => (
                                        <option key={b._id} value={b._id}>
                                            {b.wardName} — {b.bedNumber}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Deposit (₹)</label>
                                <input name="depositAmount" type="number" min="0" value={form.depositAmount} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Reason</label>
                                <input name="reason" value={form.reason} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "Admitting…" : "Admit Patient"}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="loading"><span className="spinner" /> Loading wards…</div>
            ) : (
                <>
                    <div className="stats-grid">
                        {wards.map((w) => (
                            <div className="stat-card" key={w._id}>
                                <div className="stat-icon teal">🛏️</div>
                                <div>
                                    <div className="stat-value">{w.stats?.occupied || 0}/{w.stats?.total || 0}</div>
                                    <div className="stat-label">{w.name} ({w.category})</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="card" style={{ marginBottom: 20 }}>
                        <h3>Bed Matrix</h3>
                        <div className="bed-matrix">
                            {wards.map((w) => (
                                <div key={w._id} className="bed-ward">
                                    <div className="bed-ward-name">{w.name}</div>
                                    <div className="bed-grid">
                                        {(w.beds || []).map((b) => (
                                            <div
                                                key={b._id}
                                                className={`bed-cell ${b.status}`}
                                                title={`${b.bedNumber} — ${b.status}`}
                                            >
                                                {b.bedNumber}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <h3>Active Admissions</h3>
                        {admissions.filter((a) => a.status === "admitted").length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">🛏️</div>
                                <p>No active admissions.</p>
                            </div>
                        ) : (
                            <div className="table-wrap">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Patient</th>
                                            <th>Bed</th>
                                            <th>Ward</th>
                                            <th>Admitted</th>
                                            <th>Deposit</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {admissions
                                            .filter((a) => a.status === "admitted")
                                            .map((a) => (
                                                <tr key={a._id}>
                                                    <td><strong>{a.patient?.user?.name}</strong></td>
                                                    <td><span className="badge gray">{a.bed?.bedNumber}</span></td>
                                                    <td>{a.bed?.ward?.name}</td>
                                                    <td>{new Date(a.admissionDate).toLocaleDateString()}</td>
                                                    <td>₹{a.depositAmount || 0}</td>
                                                    <td>
                                                        <button className="btn btn-sm btn-danger" onClick={() => discharge(a._id)}>
                                                            Discharge
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}