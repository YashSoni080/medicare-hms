import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

const MEAL_TYPES = ["vegetarian", "non-vegetarian", "vegan", "diabetic", "low-salt", "soft", "liquid", "renal", "other"];

const statusBadge = (status) => {
    const map = {
        active: "green",
        completed: "blue",
        cancelled: "red",
    };
    return map[status] || "gray";
};

export default function Diet() {
    const [plans, setPlans] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        patient: "",
        mealType: "vegetarian",
        breakfast: "",
        lunch: "",
        dinner: "",
        snacks: "",
        dietaryRestrictions: "",
        nutritionistNotes: "",
    });

    const loadData = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (statusFilter) params.set("status", statusFilter);
        Promise.all([
            api.get(`/diet${params.toString() ? `?${params}` : ""}`),
            api.get("/patients"),
        ])
            .then(([diet, pat]) => {
                setPlans(diet.plans || []);
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
            await api.post("/diet", {
                patient: form.patient,
                mealType: form.mealType,
                breakfast: form.breakfast,
                lunch: form.lunch,
                dinner: form.dinner,
                snacks: form.snacks,
                dietaryRestrictions: form.dietaryRestrictions
                    ? form.dietaryRestrictions.split(",").map((s) => s.trim()).filter(Boolean)
                    : [],
                nutritionistNotes: form.nutritionistNotes,
            });
            setSuccess("Diet plan created successfully!");
            setShowForm(false);
            setForm({ patient: "", mealType: "vegetarian", breakfast: "", lunch: "", dinner: "", snacks: "", dietaryRestrictions: "", nutritionistNotes: "" });
            loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/diet/${id}`, { status });
            setSuccess(`Diet plan ${status}.`);
            loadData();
        } catch (err) {
            setError(err.message);
        }
    };

    const patientName = (p) => p.patient?.user?.name || p.patient?.uhid || "—";

    return (
        <div>
            <div className="page-head">
                <div>
                    <h2>Dietary & Nutrition</h2>
                    <p>Create and manage patient diet plans</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "✕ Close" : "+ New Diet Plan"}
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {showForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3>Create Diet Plan</h3>
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
                                <label>Meal Type</label>
                                <select name="mealType" value={form.mealType} onChange={handleChange}>
                                    {MEAL_TYPES.map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Breakfast</label>
                                <input name="breakfast" value={form.breakfast} onChange={handleChange} placeholder="e.g. Oats + fruit" />
                            </div>
                            <div className="form-group">
                                <label>Lunch</label>
                                <input name="lunch" value={form.lunch} onChange={handleChange} placeholder="e.g. Rice + dal + veg" />
                            </div>
                            <div className="form-group">
                                <label>Dinner</label>
                                <input name="dinner" value={form.dinner} onChange={handleChange} placeholder="e.g. Roti + soup" />
                            </div>
                            <div className="form-group">
                                <label>Snacks</label>
                                <input name="snacks" value={form.snacks} onChange={handleChange} placeholder="e.g. Fruit + nuts" />
                            </div>
                            <div className="form-group">
                                <label>Dietary Restrictions (comma separated)</label>
                                <input name="dietaryRestrictions" value={form.dietaryRestrictions} onChange={handleChange} placeholder="e.g. no sugar, low salt" />
                            </div>
                            <div className="form-group">
                                <label>Nutritionist Notes</label>
                                <textarea name="nutritionistNotes" value={form.nutritionistNotes} onChange={handleChange} rows={2} />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "Saving…" : "Create Plan"}
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
                    {["active", "completed", "cancelled"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="loading"><span className="spinner" /> Loading diet plans…</div>
            ) : plans.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🥗</div>
                    <p>No diet plans found.</p>
                </div>
            ) : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Meal Type</th>
                                <th>Breakfast</th>
                                <th>Lunch</th>
                                <th>Dinner</th>
                                <th>Restrictions</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plans.map((p) => (
                                <tr key={p._id}>
                                    <td><strong>{patientName(p)}</strong></td>
                                    <td><span className="badge teal">{p.mealType}</span></td>
                                    <td>{p.breakfast || "—"}</td>
                                    <td>{p.lunch || "—"}</td>
                                    <td>{p.dinner || "—"}</td>
                                    <td>{p.dietaryRestrictions?.length ? p.dietaryRestrictions.join(", ") : "—"}</td>
                                    <td><span className={`badge ${statusBadge(p.status)}`}>{p.status}</span></td>
                                    <td>
                                        {p.status === "active" && (
                                            <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(p._id, "completed")}>
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