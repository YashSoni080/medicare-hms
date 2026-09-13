import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

const CATEGORIES = ["consultation", "procedure", "room", "nursing", "lab", "radiology", "ot", "other"];

const catBadge = (c) => {
    const map = {
        consultation: "teal",
        procedure: "blue",
        room: "purple",
        nursing: "amber",
        lab: "green",
        radiology: "red",
        ot: "gray",
        other: "gray",
    };
    return map[c] || "gray";
};

export default function ServiceCharges() {
    const [charges, setCharges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: "",
        category: "consultation",
        charge: "",
        description: "",
        isActive: true,
    });

    const loadData = () => {
        setLoading(true);
        api.get("/service-charges")
            .then((data) => setCharges(data.charges || []))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const handleChange = (e) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setForm({ ...form, [e.target.name]: value });
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ name: "", category: "consultation", charge: "", description: "", isActive: true });
        setShowForm(true);
    };

    const openEdit = (c) => {
        setEditing(c);
        setForm({ name: c.name, category: c.category, charge: c.charge, description: c.description || "", isActive: c.isActive });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            const payload = { ...form, charge: Number(form.charge) || 0 };
            if (editing) {
                await api.put(`/service-charges/${editing._id}`, payload);
                setSuccess("Service charge updated!");
            } else {
                await api.post("/service-charges", payload);
                setSuccess("Service charge created!");
            }
            setShowForm(false);
            setEditing(null);
            loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (c) => {
        try {
            await api.put(`/service-charges/${c._id}`, { isActive: !c.isActive });
            setSuccess(c.isActive ? "Charge deactivated." : "Charge activated.");
            loadData();
        } catch (err) {
            setError(err.message);
        }
    };

    const removeCharge = async (c) => {
        if (!window.confirm(`Delete "${c.name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/service-charges/${c._id}`);
            setSuccess("Service charge deleted.");
            loadData();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <div className="page-head">
                <div>
                    <h2>Service Charges</h2>
                    <p>Configure chargeable services used in billing</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>
                    {showForm ? "✕ Close" : "+ New Charge"}
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {showForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3>{editing ? "Edit Service Charge" : "Create Service Charge"}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Name *</label>
                                <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. General Consultation" required />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select name="category" value={form.category} onChange={handleChange}>
                                    {CATEGORIES.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Charge (₹) *</label>
                                <input name="charge" type="number" min="0" value={form.charge} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <input name="description" value={form.description} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} />
                                    Active
                                </label>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "Saving…" : editing ? "Update Charge" : "Create Charge"}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="loading"><span className="spinner" /> Loading service charges…</div>
            ) : charges.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">💳</div>
                    <p>No service charges configured.</p>
                </div>
            ) : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Charge</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {charges.map((c) => (
                                <tr key={c._id}>
                                    <td><strong>{c.name}</strong></td>
                                    <td><span className={`badge ${catBadge(c.category)}`}>{c.category}</span></td>
                                    <td><strong>{fmtMoney(c.charge)}</strong></td>
                                    <td>{c.isActive ? <span className="badge green">Active</span> : <span className="badge gray">Inactive</span>}</td>
                                    <td>
                                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>Edit</button>{" "}
                                        <button className="btn btn-secondary btn-sm" onClick={() => toggleActive(c)}>
                                            {c.isActive ? "Deactivate" : "Activate"}
                                        </button>{" "}
                                        <button className="btn btn-danger btn-sm" onClick={() => removeCharge(c)}>Delete</button>
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

const fmtMoney = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;