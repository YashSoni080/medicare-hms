import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

const TRIAGE_LEVELS = ["resuscitation", "emergency", "urgent", "semi-urgent", "non-urgent"];
const STATUSES = ["triage", "in-treatment", "admitted", "discharged", "referred-out"];

const triageBadge = (level) => {
    const map = {
        resuscitation: "red",
        emergency: "red",
        urgent: "amber",
        "semi-urgent": "blue",
        "non-urgent": "green",
    };
    return map[level] || "gray";
};

const statusBadge = (status) => {
    const map = {
        triage: "amber",
        "in-treatment": "blue",
        admitted: "purple",
        discharged: "green",
        "referred-out": "gray",
    };
    return map[status] || "gray";
};

export default function Emergency() {
    const [cases, setCases] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        patient: "",
        arrivalMode: "walk-in",
        triageLevel: "urgent",
        chiefComplaint: "",
        bpSystolic: "",
        bpDiastolic: "",
        pulse: "",
        temperature: "",
        spo2: "",
    });

    const loadData = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (statusFilter) params.set("status", statusFilter);
        Promise.all([
            api.get(`/emergency${params.toString() ? `?${params}` : ""}`),
            api.get("/patients"),
        ])
            .then(([emg, pat]) => {
                setCases(emg.cases || []);
                setPatients(pat.patients || []);
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
            await api.post("/emergency", {
                patient: form.patient,
                arrivalMode: form.arrivalMode,
                triageLevel: form.triageLevel,
                chiefComplaint: form.chiefComplaint,
                vitals: {
                    bpSystolic: Number(form.bpSystolic) || undefined,
                    bpDiastolic: Number(form.bpDiastolic) || undefined,
                    pulse: Number(form.pulse) || undefined,
                    temperature: Number(form.temperature) || undefined,
                    spo2: Number(form.spo2) || undefined,
                },
            });
            setSuccess("Emergency case registered successfully!");
            setShowForm(false);
            setForm({ patient: "", arrivalMode: "walk-in", triageLevel: "urgent", chiefComplaint: "", bpSystolic: "", bpDiastolic: "", pulse: "", temperature: "", spo2: "" });
            loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/emergency/${id}`, { status });
            setSuccess(`Case marked as ${status}.`);
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
                    <h2>Emergency & Casualty</h2>
                    <p>Triage, treat and track emergency cases</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "✕ Close" : "+ Register Case"}
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {showForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3>Register Emergency Case</h3>
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
                                <label>Arrival Mode</label>
                                <select name="arrivalMode" value={form.arrivalMode} onChange={handleChange}>
                                    <option value="walk-in">Walk-in</option>
                                    <option value="ambulance">Ambulance</option>
                                    <option value="referred">Referred</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Triage Level</label>
                                <select name="triageLevel" value={form.triageLevel} onChange={handleChange}>
                                    {TRIAGE_LEVELS.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Chief Complaint *</label>
                                <textarea name="chiefComplaint" value={form.chiefComplaint} onChange={handleChange} required rows={2} />
                            </div>
                            <div className="form-group">
                                <label>BP Systolic</label>
                                <input name="bpSystolic" type="number" value={form.bpSystolic} onChange={handleChange} placeholder="120" />
                            </div>
                            <div className="form-group">
                                <label>BP Diastolic</label>
                                <input name="bpDiastolic" type="number" value={form.bpDiastolic} onChange={handleChange} placeholder="80" />
                            </div>
                            <div className="form-group">
                                <label>Pulse</label>
                                <input name="pulse" type="number" value={form.pulse} onChange={handleChange} placeholder="72" />
                            </div>
                            <div className="form-group">
                                <label>Temperature (°F)</label>
                                <input name="temperature" type="number" value={form.temperature} onChange={handleChange} placeholder="98.6" />
                            </div>
                            <div className="form-group">
                                <label>SpO₂ (%)</label>
                                <input name="spo2" type="number" value={form.spo2} onChange={handleChange} placeholder="98" />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "Saving…" : "Register Case"}
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
                <div className="loading"><span className="spinner" /> Loading emergency cases…</div>
            ) : cases.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🚑</div>
                    <p>No emergency cases found.</p>
                </div>
            ) : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Complaint</th>
                                <th>Triage</th>
                                <th>Vitals</th>
                                <th>Status</th>
                                <th>Arrived</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cases.map((c) => (
                                <tr key={c._id}>
                                    <td><strong>{patientName(c)}</strong></td>
                                    <td style={{ maxWidth: 220 }}>{c.chiefComplaint}</td>
                                    <td><span className={`badge ${triageBadge(c.triageLevel)}`}>{c.triageLevel}</span></td>
                                    <td>
                                        {c.vitals?.bpSystolic ? `${c.vitals.bpSystolic}/${c.vitals.bpDiastolic}` : "—"}
                                        {c.vitals?.pulse ? ` · ${c.vitals.pulse} bpm` : ""}
                                        {c.vitals?.spo2 ? ` · ${c.vitals.spo2}%` : ""}
                                    </td>
                                    <td><span className={`badge ${statusBadge(c.status)}`}>{c.status}</span></td>
                                    <td>{new Date(c.createdAt).toLocaleString()}</td>
                                    <td>
                                        {c.status === "triage" && (
                                            <button className="btn btn-primary btn-sm" onClick={() => updateStatus(c._id, "in-treatment")}>
                                                Start Treatment
                                            </button>
                                        )}
                                        {c.status === "in-treatment" && (
                                            <button className="btn btn-success btn-sm" onClick={() => updateStatus(c._id, "discharged")}>
                                                Discharge
                                            </button>
                                        )}
                                        {c.status === "in-treatment" && (
                                            <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(c._id, "admitted")}>
                                                Admit
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