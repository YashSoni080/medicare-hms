import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

const MODES = ["video", "audio", "chat"];

const statusBadge = (status) => {
    const map = {
        scheduled: "blue",
        "in-progress": "amber",
        completed: "green",
        cancelled: "red",
        "no-show": "gray",
    };
    return map[status] || "gray";
};

export default function Telemedicine() {
    const [consults, setConsults] = useState([]);
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
        scheduledAt: "",
        durationMinutes: 30,
        mode: "video",
    });

    const loadData = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (statusFilter) params.set("status", statusFilter);
        Promise.all([
            api.get(`/telemedicine${params.toString() ? `?${params}` : ""}`),
            api.get("/patients"),
            api.get("/doctors"),
        ])
            .then(([tel, pat, doc]) => {
                setConsults(tel.consultations || []);
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
            await api.post("/telemedicine", {
                patient: form.patient,
                doctor: form.doctor,
                scheduledAt: form.scheduledAt,
                durationMinutes: Number(form.durationMinutes) || 30,
                mode: form.mode,
            });
            setSuccess("Teleconsultation scheduled!");
            setShowForm(false);
            setForm({ patient: "", doctor: "", scheduledAt: "", durationMinutes: 30, mode: "video" });
            loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/telemedicine/${id}`, { status });
            setSuccess(`Consultation marked ${status}.`);
            loadData();
        } catch (err) {
            setError(err.message);
        }
    };

    const patientName = (c) => c.patient?.user?.name || c.patient?.uhid || "—";

    return (
        <div>
            <div className="page-head">
                <div>
                    <h2>Telemedicine</h2>
                    <p>Schedule and manage virtual consultations</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "✕ Close" : "+ New Consultation"}
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {showForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3>Schedule Teleconsultation</h3>
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
                                <label>Scheduled At *</label>
                                <input name="scheduledAt" type="datetime-local" value={form.scheduledAt} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Duration (minutes)</label>
                                <input name="durationMinutes" type="number" min="5" value={form.durationMinutes} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Mode</label>
                                <select name="mode" value={form.mode} onChange={handleChange}>
                                    {MODES.map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "Saving…" : "Schedule"}
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
                    {["scheduled", "in-progress", "completed", "cancelled", "no-show"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="loading"><span className="spinner" /> Loading consultations…</div>
            ) : consults.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📹</div>
                    <p>No teleconsultations found.</p>
                </div>
            ) : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Scheduled</th>
                                <th>Duration</th>
                                <th>Mode</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {consults.map((c) => (
                                <tr key={c._id}>
                                    <td><strong>{patientName(c)}</strong></td>
                                    <td>{c.doctor?.user?.name || c.doctor?.specialization || "—"}</td>
                                    <td>{c.scheduledAt ? new Date(c.scheduledAt).toLocaleString() : "—"}</td>
                                    <td>{c.durationMinutes} min</td>
                                    <td><span className="badge teal">{c.mode}</span></td>
                                    <td><span className={`badge ${statusBadge(c.status)}`}>{c.status}</span></td>
                                    <td>
                                        {c.status === "scheduled" && (
                                            <>
                                                <button className="btn btn-primary btn-sm" onClick={() => updateStatus(c._id, "in-progress")}>
                                                    Start
                                                </button>{" "}
                                                <button className="btn btn-success btn-sm" onClick={() => updateStatus(c._id, "completed")}>
                                                    Complete
                                                </button>
                                            </>
                                        )}
                                        {c.status === "in-progress" && (
                                            <button className="btn btn-success btn-sm" onClick={() => updateStatus(c._id, "completed")}>
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