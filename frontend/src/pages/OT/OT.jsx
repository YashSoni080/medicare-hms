import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

const STATUSES = ["scheduled", "in-progress", "completed", "cancelled"];
const ANESTHESIA = ["general", "spinal", "epidural", "local", "regional", "none"];

const statusBadge = (status) => {
    const map = {
        scheduled: "blue",
        "in-progress": "amber",
        completed: "green",
        cancelled: "red",
    };
    return map[status] || "gray";
};

export default function OT() {
    const [surgeries, setSurgeries] = useState([]);
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
        surgeon: "",
        procedure: "",
        otRoom: "OT-1",
        scheduledDate: "",
        startTime: "",
        endTime: "",
        anesthesiaType: "general",
        notes: "",
    });

    const loadData = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (statusFilter) params.set("status", statusFilter);
        Promise.all([
            api.get(`/ot${params.toString() ? `?${params}` : ""}`),
            api.get("/patients"),
            api.get("/doctors"),
        ])
            .then(([ot, pat, doc]) => {
                setSurgeries(ot.surgeries || []);
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
            await api.post("/ot", {
                patient: form.patient,
                surgeon: form.surgeon,
                procedure: form.procedure,
                otRoom: form.otRoom,
                scheduledDate: form.scheduledDate,
                startTime: form.startTime,
                endTime: form.endTime,
                anesthesiaType: form.anesthesiaType,
                notes: form.notes,
            });
            setSuccess("Surgery scheduled successfully!");
            setShowForm(false);
            setForm({ patient: "", surgeon: "", procedure: "", otRoom: "OT-1", scheduledDate: "", startTime: "", endTime: "", anesthesiaType: "general", notes: "" });
            loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/ot/${id}`, { status });
            setSuccess(`Surgery marked as ${status}.`);
            loadData();
        } catch (err) {
            setError(err.message);
        }
    };

    const patientName = (s) => s.patient?.user?.name || s.patient?.uhid || "—";

    return (
        <div>
            <div className="page-head">
                <div>
                    <h2>Operation Theatre</h2>
                    <p>Schedule and manage surgical procedures</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "✕ Close" : "+ Schedule Surgery"}
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {showForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3>Schedule Surgery</h3>
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
                                <label>Surgeon *</label>
                                <select name="surgeon" value={form.surgeon} onChange={handleChange} required>
                                    <option value="">Select surgeon</option>
                                    {doctors.map((d) => (
                                        <option key={d._id} value={d._id}>
                                            {d.user?.name || d._id} ({d.specialization || "General"})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Procedure *</label>
                                <input name="procedure" value={form.procedure} onChange={handleChange} required placeholder="e.g. Appendectomy" />
                            </div>
                            <div className="form-group">
                                <label>OT Room</label>
                                <select name="otRoom" value={form.otRoom} onChange={handleChange}>
                                    {["OT-1", "OT-2", "OT-3"].map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Scheduled Date *</label>
                                <input name="scheduledDate" type="date" value={form.scheduledDate} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Start Time</label>
                                <input name="startTime" type="time" value={form.startTime} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>End Time</label>
                                <input name="endTime" type="time" value={form.endTime} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Anesthesia</label>
                                <select name="anesthesiaType" value={form.anesthesiaType} onChange={handleChange}>
                                    {ANESTHESIA.map((a) => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Notes</label>
                                <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "Saving…" : "Schedule Surgery"}
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
                    {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="loading"><span className="spinner" /> Loading surgeries…</div>
            ) : surgeries.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🏥</div>
                    <p>No surgeries scheduled.</p>
                </div>
            ) : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Procedure</th>
                                <th>Surgeon</th>
                                <th>OT Room</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {surgeries.map((s) => (
                                <tr key={s._id}>
                                    <td><strong>{patientName(s)}</strong></td>
                                    <td>{s.procedure}</td>
                                    <td>{s.surgeon?.user?.name || s.surgeon?.specialization || "—"}</td>
                                    <td><span className="badge teal">{s.otRoom}</span></td>
                                    <td>{new Date(s.scheduledDate).toLocaleDateString()}</td>
                                    <td>{s.startTime ? `${s.startTime} – ${s.endTime || "…"}` : "—"}</td>
                                    <td><span className={`badge ${statusBadge(s.status)}`}>{s.status}</span></td>
                                    <td>
                                        {s.status === "scheduled" && (
                                            <button className="btn btn-primary btn-sm" onClick={() => updateStatus(s._id, "in-progress")}>
                                                Start
                                            </button>
                                        )}
                                        {s.status === "in-progress" && (
                                            <button className="btn btn-success btn-sm" onClick={() => updateStatus(s._id, "completed")}>
                                                Complete
                                            </button>
                                        )}
                                        {s.status === "scheduled" && (
                                            <button className="btn btn-danger btn-sm" onClick={() => updateStatus(s._id, "cancelled")}>
                                                Cancel
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