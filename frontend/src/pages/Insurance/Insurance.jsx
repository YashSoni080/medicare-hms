import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

const CLAIM_BADGE = {
    requested: "amber",
    "query-raised": "red",
    approved: "green",
    rejected: "red",
    "settlement-pending": "blue",
    settled: "teal",
};

export default function Insurance() {
    const [policies, setPolicies] = useState([]);
    const [claims, setClaims] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");
    const [form, setForm] = useState({
        patient: "",
        tpaName: "",
        policyNumber: "",
        coverageCap: "",
        deductible: 0,
        coPayPercent: 0,
        validFrom: "",
        validTo: "",
    });

    const loadData = () => {
        setLoading(true);
        Promise.all([
            api.get("/insurance/policies"),
            api.get("/insurance/claims"),
            api.get("/patients"),
        ])
            .then(([p, c, pat]) => {
                setPolicies(p.policies || []);
                setClaims(c.claims || []);
                setPatients(pat.patients || []);
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
            await api.post("/insurance/policies", {
                ...form,
                coverageCap: Number(form.coverageCap) || 0,
                deductible: Number(form.deductible) || 0,
                coPayPercent: Number(form.coPayPercent) || 0,
            });
            setSuccess("Insurance policy added successfully!");
            setShowForm(false);
            setForm({ patient: "", tpaName: "", policyNumber: "", coverageCap: "", deductible: 0, coPayPercent: 0, validFrom: "", validTo: "" });
            loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const updateClaim = async (id, status) => {
        try {
            await api.put(`/insurance/claims/${id}/status`, { status });
            loadData();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <div className="page-head">
                <div>
                    <h2>Insurance</h2>
                    <p>Manage TPA policies and claims</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "✕ Close" : "+ Add Policy"}
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {showForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3>Add Insurance Policy</h3>
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
                                <label>TPA Name *</label>
                                <input name="tpaName" value={form.tpaName} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Policy Number</label>
                                <input name="policyNumber" value={form.policyNumber} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Coverage Cap (₹)</label>
                                <input name="coverageCap" type="number" min="0" value={form.coverageCap} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Deductible (₹)</label>
                                <input name="deductible" type="number" min="0" value={form.deductible} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Co-pay %</label>
                                <input name="coPayPercent" type="number" min="0" max="100" value={form.coPayPercent} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Valid From</label>
                                <input name="validFrom" type="date" value={form.validFrom} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Valid To</label>
                                <input name="validTo" type="date" value={form.validTo} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "Saving…" : "Add Policy"}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card" style={{ marginBottom: 24 }}>
                <h3>Insurance Policies</h3>
                {policies.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🛡️</div>
                        <p>No policies found.</p>
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>TPA</th>
                                    <th>Policy #</th>
                                    <th>Coverage Cap</th>
                                    <th>Co-pay</th>
                                    <th>Valid Until</th>
                                </tr>
                            </thead>
                            <tbody>
                                {policies.map((p) => (
                                    <tr key={p._id}>
                                        <td><strong>{p.patient?.user?.name}</strong></td>
                                        <td>{p.tpaName}</td>
                                        <td><span className="badge gray">{p.policyNumber || "—"}</span></td>
                                        <td>₹{Number(p.coverageCap || 0).toLocaleString("en-IN")}</td>
                                        <td>{p.coPayPercent}%</td>
                                        <td>{p.validTo ? new Date(p.validTo).toLocaleDateString() : "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="card">
                <h3>Claims</h3>
                {claims.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📄</div>
                        <p>No claims found.</p>
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Claim #</th>
                                    <th>Patient</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {claims.map((c) => (
                                    <tr key={c._id}>
                                        <td><span className="badge teal">{c.claimNumber}</span></td>
                                        <td><strong>{c.patient?.user?.name}</strong></td>
                                        <td>₹{Number(c.amount || 0).toLocaleString("en-IN")}</td>
                                        <td>
                                            <span className={`badge ${CLAIM_BADGE[c.status] || "gray"}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td>
                                            {c.status === "requested" && (
                                                <>
                                                    <button className="btn btn-sm btn-primary" onClick={() => updateClaim(c._id, "approved")}>
                                                        Approve
                                                    </button>
                                                    <button className="btn btn-sm btn-danger" style={{ marginLeft: 6 }} onClick={() => updateClaim(c._id, "rejected")}>
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {c.status === "approved" && (
                                                <button className="btn btn-sm btn-amber" onClick={() => updateClaim(c._id, "settled")}>
                                                    Mark Settled
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
        </div>
    );
}