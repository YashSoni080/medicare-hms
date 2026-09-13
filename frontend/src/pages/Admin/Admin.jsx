import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

const ACTION_BADGE = {
    CREATE: "green",
    READ: "blue",
    UPDATE: "amber",
    DELETE: "red",
    LOGIN: "teal",
    LOGOUT: "gray",
};

const SPECIALIZATIONS = [
    "General Medicine", "Cardiology", "Neurology", "Orthopedics", "Pediatrics",
    "Gynecology", "Dermatology", "ENT", "Ophthalmology", "Psychiatry",
    "Urology", "Gastroenterology", "Pulmonology", "Nephrology", "Oncology",
    "Endocrinology", "Rheumatology", "Anesthesiology", "Radiology", "Pathology",
];

const DEPARTMENTS = [
    "General Medicine", "Cardiology", "Neurology", "Orthopedics", "Pediatrics",
    "Gynecology", "Dermatology", "ENT", "Ophthalmology", "Psychiatry",
    "Urology", "Gastroenterology", "Pulmonology", "Nephrology", "Oncology",
    "Endocrinology", "Rheumatology", "Anesthesiology", "Radiology", "Pathology",
    "Emergency", "Administration",
];

const emptyForm = {
    name: "", email: "", password: "", phone: "",
    specialization: "", department: "", experience: "", consultationFee: "",
};

export default function Admin() {
    const [tab, setTab] = useState("doctors"); // "doctors" | "audit"
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [actionFilter, setActionFilter] = useState("");
    const [entityFilter, setEntityFilter] = useState("");

    // Doctors state
    const [doctors, setDoctors] = useState([]);
    const [doctorsLoading, setDoctorsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const loadLogs = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (actionFilter) params.set("action", actionFilter);
        if (entityFilter) params.set("entityName", entityFilter);
        api.get(`/audit-logs${params.toString() ? `?${params}` : ""}`)
            .then((data) => setLogs(data.logs || []))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    const loadDoctors = () => {
        setDoctorsLoading(true);
        api.get("/doctors")
            .then((data) => setDoctors(data.doctors || []))
            .catch((err) => setError(err.message))
            .finally(() => setDoctorsLoading(false));
    };

    useEffect(() => { loadLogs(); }, [actionFilter, entityFilter]);
    useEffect(() => { loadDoctors(); }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const openAdd = () => {
        setEditingId(null);
        setForm(emptyForm);
        setShowForm(true);
    };

    const openEdit = (doc) => {
        setEditingId(doc._id);
        setForm({
            name: doc.user?.name || "",
            email: doc.user?.email || "",
            password: "",
            phone: doc.user?.phone || "",
            specialization: doc.specialization || "",
            department: doc.department || "",
            experience: doc.experience ?? "",
            consultationFee: doc.consultationFee ?? "",
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            if (editingId) {
                await api.put(`/doctors/${editingId}`, {
                    specialization: form.specialization,
                    department: form.department,
                    experience: Number(form.experience) || 0,
                    consultationFee: Number(form.consultationFee) || 0,
                });
                setSuccess("Doctor profile updated successfully!");
            } else {
                await api.post("/auth/register", {
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    phone: form.phone,
                    role: "doctor",
                    doctor: {
                        specialization: form.specialization,
                        department: form.department,
                        experience: Number(form.experience) || 0,
                        consultationFee: Number(form.consultationFee) || 0,
                    },
                });
                setSuccess("Doctor added successfully! They can now log in and appear in all doctor dropdowns.");
            }
            setShowForm(false);
            setForm(emptyForm);
            setEditingId(null);
            loadDoctors();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (doc) => {
        if (!window.confirm(`Remove ${doc.user?.name || "this doctor"}? This cannot be undone.`)) return;
        setError("");
        setSuccess("");
        try {
            await api.delete(`/doctors/${doc._id}`);
            setSuccess("Doctor removed.");
            loadDoctors();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleToggleAvailability = async (doc) => {
        setError("");
        setSuccess("");
        try {
            await api.put(`/doctors/${doc._id}`, { isAvailable: !doc.isAvailable });
            setSuccess(doc.isAvailable ? "Doctor marked unavailable." : "Doctor marked available.");
            loadDoctors();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <div className="page-head">
                <div>
                    <h2>Admin</h2>
                    <p>Manage doctors and review the system audit trail</p>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="filters">
                <button
                    className={`btn ${tab === "doctors" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setTab("doctors")}
                >
                    👨‍⚕️ Doctors
                </button>
                <button
                    className={`btn ${tab === "audit" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setTab("audit")}
                >
                    📋 Audit Logs
                </button>
            </div>

            {tab === "doctors" && (
                <div>
                    <div className="card" style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <h3 style={{ margin: 0 }}>Doctor Directory</h3>
                            <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 13 }}>
                                {doctors.length} doctor{doctors.length === 1 ? "" : "s"} registered
                            </p>
                        </div>
                        <button className="btn btn-primary" onClick={showForm ? () => setShowForm(false) : openAdd}>
                            {showForm ? "✕ Close" : "+ Add Doctor"}
                        </button>
                    </div>

                    {showForm && (
                        <div className="card" style={{ marginBottom: 16 }}>
                            <h3>{editingId ? "Edit Doctor" : "Add New Doctor"}</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Full Name *</label>
                                        <input name="name" value={form.name} onChange={handleChange} placeholder="Dr. Jane Doe" required disabled={!!editingId} />
                                    </div>
                                    <div className="form-group">
                                        <label>Email *</label>
                                        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="doctor@hospital.com" required disabled={!!editingId} />
                                    </div>
                                    {!editingId && (
                                        <div className="form-group">
                                            <label>Password *</label>
                                            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" required minLength={6} />
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" disabled={!!editingId} />
                                    </div>
                                    <div className="form-group">
                                        <label>Specialization *</label>
                                        <select name="specialization" value={form.specialization} onChange={handleChange} required>
                                            <option value="">Select specialization</option>
                                            {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Department</label>
                                        <select name="department" value={form.department} onChange={handleChange}>
                                            <option value="">Select department</option>
                                            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Experience (years)</label>
                                        <input name="experience" type="number" min="0" value={form.experience} onChange={handleChange} placeholder="5" />
                                    </div>
                                    <div className="form-group">
                                        <label>Consultation Fee (₹)</label>
                                        <input name="consultationFee" type="number" min="0" value={form.consultationFee} onChange={handleChange} placeholder="500" />
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? "Saving…" : editingId ? "Save Changes" : "Add Doctor"}
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {doctorsLoading ? (
                        <div className="loading"><span className="spinner" /> Loading doctors…</div>
                    ) : doctors.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">👨‍⚕️</div>
                            <p>No doctors yet. Click "+ Add Doctor" to register the first one.</p>
                        </div>
                    ) : (
                        <div className="table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Doctor</th>
                                        <th>Specialization</th>
                                        <th>Department</th>
                                        <th>Experience</th>
                                        <th>Fee</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {doctors.map((doc) => (
                                        <tr key={doc._id}>
                                            <td>
                                                <strong>{doc.user?.name || "—"}</strong>
                                                <div style={{ fontSize: 12, color: "#6b7280" }}>{doc.user?.email}</div>
                                            </td>
                                            <td>{doc.specialization}</td>
                                            <td>{doc.department || "—"}</td>
                                            <td>{doc.experience} yrs</td>
                                            <td>₹{doc.consultationFee?.toLocaleString() || 0}</td>
                                            <td>
                                                <span className={`badge ${doc.isAvailable ? "green" : "gray"}`}>
                                                    {doc.isAvailable ? "Available" : "Unavailable"}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                                    <button className="btn btn-sm btn-secondary" onClick={() => openEdit(doc)}>Edit</button>
                                                    <button className="btn btn-sm btn-secondary" onClick={() => handleToggleAvailability(doc)}>
                                                        {doc.isAvailable ? "Unavailable" : "Available"}
                                                    </button>
                                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(doc)}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {tab === "audit" && (
                <div>
                    <div className="filters">
                        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
                            <option value="">All actions</option>
                            {Object.keys(ACTION_BADGE).map((a) => (
                                <option key={a} value={a}>{a}</option>
                            ))}
                        </select>
                        <input
                            placeholder="Filter by entity (e.g. Patient)…"
                            value={entityFilter}
                            onChange={(e) => setEntityFilter(e.target.value)}
                            style={{ minWidth: 220 }}
                        />
                    </div>

                    {loading ? (
                        <div className="loading"><span className="spinner" /> Loading audit logs…</div>
                    ) : logs.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">⚙️</div>
                            <p>No audit logs found.</p>
                        </div>
                    ) : (
                        <div className="table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>User</th>
                                        <th>Action</th>
                                        <th>Entity</th>
                                        <th>Entity ID</th>
                                        <th>IP Address</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log._id}>
                                            <td>{new Date(log.createdAt).toLocaleString()}</td>
                                            <td>
                                                <strong>{log.user?.name || "System"}</strong>
                                                <div style={{ fontSize: 12, color: "#6b7280" }}>{log.user?.role}</div>
                                            </td>
                                            <td>
                                                <span className={`badge ${ACTION_BADGE[log.action] || "gray"}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td>{log.entityName}</td>
                                            <td style={{ fontSize: 12, color: "#6b7280" }}>{log.entityId || "—"}</td>
                                            <td>{log.ipAddress || "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}