import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

export default function Patients() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: "", email: "", phone: "", password: "",
        gender: "", dob: "", bloodGroup: "", address: "", idProof: "",
    });
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");

    const loadPatients = () => {
        setLoading(true);
        api.get(`/patients${search ? `?search=${encodeURIComponent(search)}` : ""}`)
            .then((data) => setPatients(data.patients || []))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        const t = setTimeout(loadPatients, 300);
        return () => clearTimeout(t);
    }, [search]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await api.post("/auth/register", {
                name: form.name, email: form.email, phone: form.phone,
                password: form.password, role: "patient",
                patient: { gender: form.gender, dob: form.dob, bloodGroup: form.bloodGroup, address: form.address, idProof: form.idProof },
            });
            setSuccess("Patient registered successfully with a new UHID!");
            setShowForm(false);
            setForm({ name: "", email: "", phone: "", password: "", gender: "", dob: "", bloodGroup: "", address: "", idProof: "" });
            loadPatients();
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
                    <h2>Patients</h2>
                    <p>Register patients and manage UHID records</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "✕ Close" : "+ Register Patient"}
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {showForm && (
                <div className="card" style={{ marginBottom: 16 }}>
                    <h3>New Patient Registration</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input name="name" value={form.name} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Email *</label>
                                <input name="email" type="email" value={form.email} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Phone *</label>
                                <input name="phone" value={form.phone} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Password *</label>
                                <input name="password" type="password" minLength={6} value={form.password} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Gender</label>
                                <select name="gender" value={form.gender} onChange={handleChange}>
                                    <option value="">Select…</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Date of Birth</label>
                                <input name="dob" type="date" value={form.dob} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Blood Group</label>
                                <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
                                    <option value="">Select…</option>
                                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                                        <option key={bg}>{bg}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Government ID</label>
                                <input name="idProof" value={form.idProof} onChange={handleChange} />
                            </div>
                            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                                <label>Address</label>
                                <textarea name="address" value={form.address} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "Saving…" : "Register Patient"}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="filters">
                <input
                    placeholder="Search by name, UHID, phone…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ minWidth: 260 }}
                />
            </div>

            {loading ? (
                <div className="loading"><span className="spinner" /> Loading patients…</div>
            ) : patients.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🧑‍🤝‍🧑</div>
                    <p>No patients found. Register your first patient to get started.</p>
                </div>
            ) : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>UHID</th>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Gender</th>
                                <th>Blood Group</th>
                                <th>DOB</th>
                                <th>Registered</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map((p) => (
                                <tr key={p._id}>
                                    <td><span className="badge teal">{p.uhid}</span></td>
                                    <td><strong>{p.user?.name}</strong></td>
                                    <td>{p.user?.phone || "—"}</td>
                                    <td>{p.gender || "—"}</td>
                                    <td>{p.bloodGroup ? <span className="badge red">{p.bloodGroup}</span> : "—"}</td>
                                    <td>{p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : "—"}</td>
                                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}