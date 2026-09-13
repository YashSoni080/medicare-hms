import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const COMPONENTS = ["whole-blood", "packed-rbc", "plasma", "platelets", "cryoprecipitate"];

const unitBadge = (status) => {
    const map = {
        available: "green",
        reserved: "blue",
        issued: "purple",
        expired: "gray",
        discarded: "red",
    };
    return map[status] || "gray";
};

const reqBadge = (status) => {
    const map = {
        pending: "amber",
        approved: "blue",
        issued: "green",
        rejected: "red",
    };
    return map[status] || "gray";
};

export default function BloodBank() {
    const [units, setUnits] = useState([]);
    const [requests, setRequests] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showUnitForm, setShowUnitForm] = useState(false);
    const [showReqForm, setShowReqForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [unitForm, setUnitForm] = useState({
        bloodGroup: "O+",
        component: "whole-blood",
        donorName: "",
        donorId: "",
        collectionDate: "",
        expiryDate: "",
    });
    const [reqForm, setReqForm] = useState({
        patient: "",
        bloodGroup: "O+",
        units: 1,
        reason: "",
    });

    const loadData = () => {
        setLoading(true);
        Promise.all([
            api.get("/blood-bank"),
            api.get("/patients"),
        ])
            .then(([bb, pat]) => {
                setUnits(bb.units || []);
                setRequests(bb.requests || []);
                setPatients(pat.patients || []);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const handleUnitChange = (e) => setUnitForm({ ...unitForm, [e.target.name]: e.target.value });
    const handleReqChange = (e) => setReqForm({ ...reqForm, [e.target.name]: e.target.value });

    const addUnit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await api.post("/blood-bank/units", {
                ...unitForm,
                collectionDate: unitForm.collectionDate || undefined,
                expiryDate: unitForm.expiryDate || undefined,
            });
            setSuccess("Blood unit added successfully!");
            setShowUnitForm(false);
            setUnitForm({ bloodGroup: "O+", component: "whole-blood", donorName: "", donorId: "", collectionDate: "", expiryDate: "" });
            loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const createRequest = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await api.post("/blood-bank/requests", {
                ...reqForm,
                units: Number(reqForm.units) || 1,
            });
            setSuccess("Blood request created successfully!");
            setShowReqForm(false);
            setReqForm({ patient: "", bloodGroup: "O+", units: 1, reason: "" });
            loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const updateRequest = async (id, status) => {
        try {
            await api.put(`/blood-bank/requests/${id}`, { status });
            setSuccess(`Request ${status}.`);
            loadData();
        } catch (err) {
            setError(err.message);
        }
    };

    const updateUnitStatus = async (id, status) => {
        try {
            await api.put(`/blood-bank/units/${id}/status`, { status });
            setSuccess(`Unit marked ${status}.`);
            loadData();
        } catch (err) {
            setError(err.message);
        }
    };

    const patientName = (r) => r.patient?.user?.name || r.patient?.uhid || "—";

    return (
        <div>
            <div className="page-head">
                <div>
                    <h2>Blood Bank</h2>
                    <p>Manage blood inventory and transfusion requests</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn btn-secondary" onClick={() => setShowReqForm(!showReqForm)}>
                        {showReqForm ? "✕ Close" : "+ New Request"}
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowUnitForm(!showUnitForm)}>
                        {showUnitForm ? "✕ Close" : "+ Add Unit"}
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {showUnitForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3>Add Blood Unit</h3>
                    <form onSubmit={addUnit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Blood Group *</label>
                                <select name="bloodGroup" value={unitForm.bloodGroup} onChange={handleUnitChange}>
                                    {BLOOD_GROUPS.map((b) => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Component</label>
                                <select name="component" value={unitForm.component} onChange={handleUnitChange}>
                                    {COMPONENTS.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Donor Name</label>
                                <input name="donorName" value={unitForm.donorName} onChange={handleUnitChange} />
                            </div>
                            <div className="form-group">
                                <label>Donor ID</label>
                                <input name="donorId" value={unitForm.donorId} onChange={handleUnitChange} />
                            </div>
                            <div className="form-group">
                                <label>Collection Date</label>
                                <input name="collectionDate" type="date" value={unitForm.collectionDate} onChange={handleUnitChange} />
                            </div>
                            <div className="form-group">
                                <label>Expiry Date</label>
                                <input name="expiryDate" type="date" value={unitForm.expiryDate} onChange={handleUnitChange} />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "Saving…" : "Add Unit"}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowUnitForm(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {showReqForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3>Create Blood Request</h3>
                    <form onSubmit={createRequest}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Patient *</label>
                                <select name="patient" value={reqForm.patient} onChange={handleReqChange} required>
                                    <option value="">Select patient</option>
                                    {patients.map((p) => (
                                        <option key={p._id} value={p._id}>
                                            {p.user?.name || p.uhid} ({p.uhid})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Blood Group *</label>
                                <select name="bloodGroup" value={reqForm.bloodGroup} onChange={handleReqChange}>
                                    {BLOOD_GROUPS.map((b) => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Units</label>
                                <input name="units" type="number" min="1" value={reqForm.units} onChange={handleReqChange} />
                            </div>
                            <div className="form-group">
                                <label>Reason</label>
                                <textarea name="reason" value={reqForm.reason} onChange={handleReqChange} rows={2} />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "Saving…" : "Create Request"}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowReqForm(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card" style={{ marginBottom: 24 }}>
                <h3>Blood Inventory</h3>
                {units.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🩸</div>
                        <p>No blood units in inventory.</p>
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Blood Group</th>
                                    <th>Component</th>
                                    <th>Donor</th>
                                    <th>Expiry</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {units.map((u) => (
                                    <tr key={u._id}>
                                        <td><strong>{u.bloodGroup}</strong></td>
                                        <td>{u.component}</td>
                                        <td>{u.donorName || "—"}</td>
                                        <td>{u.expiryDate ? new Date(u.expiryDate).toLocaleDateString() : "—"}</td>
                                        <td><span className={`badge ${unitBadge(u.status)}`}>{u.status}</span></td>
                                        <td>
                                            {u.status === "available" && (
                                                <button className="btn btn-secondary btn-sm" onClick={() => updateUnitStatus(u._id, "reserved")}>
                                                    Reserve
                                                </button>
                                            )}
                                            {u.status === "reserved" && (
                                                <button className="btn btn-success btn-sm" onClick={() => updateUnitStatus(u._id, "issued")}>
                                                    Issue
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

            <div className="card">
                <h3>Blood Requests</h3>
                {requests.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📋</div>
                        <p>No blood requests yet.</p>
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Group</th>
                                    <th>Units</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((r) => (
                                    <tr key={r._id}>
                                        <td><strong>{patientName(r)}</strong></td>
                                        <td><span className="badge red">{r.bloodGroup}</span></td>
                                        <td>{r.units}</td>
                                        <td style={{ maxWidth: 200 }}>{r.reason || "—"}</td>
                                        <td><span className={`badge ${reqBadge(r.status)}`}>{r.status}</span></td>
                                        <td>
                                            {r.status === "pending" && (
                                                <>
                                                    <button className="btn btn-success btn-sm" onClick={() => updateRequest(r._id, "approved")}>
                                                        Approve
                                                    </button>{" "}
                                                    <button className="btn btn-danger btn-sm" onClick={() => updateRequest(r._id, "rejected")}>
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {r.status === "approved" && (
                                                <button className="btn btn-primary btn-sm" onClick={() => updateRequest(r._id, "issued")}>
                                                    Mark Issued
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