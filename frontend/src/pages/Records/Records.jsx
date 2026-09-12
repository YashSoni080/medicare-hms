import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

const TYPE_BADGE = {
    diagnosis: "teal",
    prescription: "amber",
    lab_report: "blue",
    imaging: "purple",
    note: "gray",
};

export default function Records() {
    const [records, setRecords] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");
    const [form, setForm] = useState({
        patient: "",
        doctor: "",
        type: "diagnosis",
        title: "",
        description: "",
        diagnosisCondition: "",
        diagnosisIcdCode: "",
    });

    const loadRecords = () => {
        setLoading(true);
        api.get(`/records${typeFilter ? `?type=${typeFilter}` : ""}`)
            .then((data) => setRecords(data.records || []))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadRecords();
        api.get("/patients").then((d) => setPatients(d.patients || [])).catch(() => { });
        api.get("/doctors").then((d) => setDoctors(d.doctors || [])).catch(() => { });
    }, [typeFilter]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            const body = {
                patientId: form.patient,
                doctorId: form.doctor,
                type: form.type,
                title: form.title,
                description: form.description,
            };
            if (form.type === "diagnosis") {
                body.diagnosis = {
                    condition: form.diagnosisCondition,
                    icdCode: form.diagnosisIcdCode,
                };
            }
            await api.post("/records", body);
            setSuccess("Medical record created successfully!");
            setShowForm(false);
            setForm({ patient: "", doctor: "", type: "diagnosis", title: "", description: "", diagnosisCondition: "", diagnosisIcdCode: "" });
            loadRecords();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="page-head">
                <div>
                    <h2>Medical Records</h2>
                    <p>Electronic medical records (EMR) for all patients</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "✕ Close" : "+ New Record"}
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {showForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3>Create Medical Record</h3>
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
                                <label>Record Type *</label>
                                <select name="type" value={form.type} onChange={handleChange}>
                                    {Object.keys(TYPE_BADGE).map((t) => (
                                        <option key={t} value={t}>{t.replace("_", " ")}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Doctor *</label>
                                <select name="doctor" value={form.doctor} onChange={handleChange} required>
                                    <option value="">Select doctor…</option>
                                    {doctors.map((d) => (
                                        <option key={d._id} value={d._id}>
                                            {d.user?.name} — {d.specialization}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Title *</label>
                                <input name="title" value={form.title} onChange={handleChange} required />
                            </div>
                            {form.type === "diagnosis" && (
                                <>
                                    <div className="form-group">
                                        <label>Condition</label>
                                        <input name="diagnosisCondition" value={form.diagnosisCondition} onChange={handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>ICD Code</label>
                                        <input name="diagnosisIcdCode" value={form.diagnosisIcdCode} onChange={handleChange} placeholder="e.g. E11.9" />
                                    </div>
                                </>
                            )}
                            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                                <label>Description</label>
                                <textarea name="description" value={form.description} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "Saving…" : "Create Record"}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="filters">
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                    <option value="">All types</option>
                    {Object.keys(TYPE_BADGE).map((t) => (
                        <option key={t} value={t}>{t.replace("_", " ")}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="loading"><span className="spinner" /> Loading records…</div>
            ) : records.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <p>No medical records found.</p>
                </div>
            ) : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Type</th>
                                <th>Title</th>
                                <th>Diagnosis</th>
                                <th>Doctor</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((r) => (
                                <tr key={r._id}>
                                    <td><strong>{r.patient?.user?.name}</strong></td>
                                    <td><span className={`badge ${TYPE_BADGE[r.type] || "gray"}`}>{r.type.replace("_", " ")}</span></td>
                                    <td>{r.title}</td>
                                    <td>
                                        {r.diagnosis?.condition
                                            ? `${r.diagnosis.condition}${r.diagnosis.icdCode ? ` (${r.diagnosis.icdCode})` : ""}`
                                            : "—"}
                                    </td>
                                    <td>{r.doctor?.user?.name || "—"}</td>
                                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}