import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

const TYPES = ["basic", "advanced", "icu"];

const ambBadge = (status) => {
    const map = {
        available: "green",
        "on-trip": "blue",
        maintenance: "amber",
    };
    return map[status] || "gray";
};

const tripBadge = (status) => {
    const map = {
        requested: "amber",
        dispatched: "blue",
        "on-scene": "purple",
        transporting: "teal",
        completed: "green",
        cancelled: "red",
    };
    return map[status] || "gray";
};

export default function Ambulance() {
    const [ambulances, setAmbulances] = useState([]);
    const [trips, setTrips] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showAmbForm, setShowAmbForm] = useState(false);
    const [showTripForm, setShowTripForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [ambForm, setAmbForm] = useState({
        vehicleNumber: "",
        type: "basic",
        driverName: "",
        driverPhone: "",
    });
    const [tripForm, setTripForm] = useState({
        ambulance: "",
        patient: "",
        pickupLocation: "",
        dropLocation: "",
    });

    const loadData = () => {
        setLoading(true);
        Promise.all([
            api.get("/ambulance"),
            api.get("/patients"),
        ])
            .then(([amb, pat]) => {
                setAmbulances(amb.ambulances || []);
                setTrips(amb.trips || []);
                setPatients(pat.patients || []);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const handleAmbChange = (e) => setAmbForm({ ...ambForm, [e.target.name]: e.target.value });
    const handleTripChange = (e) => setTripForm({ ...tripForm, [e.target.name]: e.target.value });

    const addAmbulance = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await api.post("/ambulance", ambForm);
            setSuccess("Ambulance added!");
            setShowAmbForm(false);
            setAmbForm({ vehicleNumber: "", type: "basic", driverName: "", driverPhone: "" });
            loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const updateAmbulance = async (id, status) => {
        try {
            await api.put(`/ambulance/${id}`, { status });
            setSuccess(`Ambulance marked ${status}.`);
            loadData();
        } catch (err) {
            setError(err.message);
        }
    };

    const createTrip = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await api.post("/ambulance/trips", tripForm);
            setSuccess("Trip dispatched!");
            setShowTripForm(false);
            setTripForm({ ambulance: "", patient: "", pickupLocation: "", dropLocation: "" });
            loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const updateTrip = async (id, status) => {
        try {
            await api.put(`/ambulance/trips/${id}`, { status });
            setSuccess(`Trip marked ${status}.`);
            loadData();
        } catch (err) {
            setError(err.message);
        }
    };

    const patientName = (t) => t.patient?.user?.name || t.patient?.uhid || "—";

    return (
        <div>
            <div className="page-head">
                <div>
                    <h2>Ambulance Services</h2>
                    <p>Manage ambulance fleet and emergency trips</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn btn-secondary" onClick={() => setShowTripForm(!showTripForm)}>
                        {showTripForm ? "✕ Close" : "+ New Trip"}
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowAmbForm(!showAmbForm)}>
                        {showAmbForm ? "✕ Close" : "+ Add Ambulance"}
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {showAmbForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3>Add Ambulance</h3>
                    <form onSubmit={addAmbulance}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Vehicle Number *</label>
                                <input name="vehicleNumber" value={ambForm.vehicleNumber} onChange={handleAmbChange} placeholder="e.g. MH-12-AB-1234" required />
                            </div>
                            <div className="form-group">
                                <label>Type</label>
                                <select name="type" value={ambForm.type} onChange={handleAmbChange}>
                                    {TYPES.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Driver Name</label>
                                <input name="driverName" value={ambForm.driverName} onChange={handleAmbChange} />
                            </div>
                            <div className="form-group">
                                <label>Driver Phone</label>
                                <input name="driverPhone" value={ambForm.driverPhone} onChange={handleAmbChange} />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "Saving…" : "Add Ambulance"}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowAmbForm(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {showTripForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3>Dispatch Trip</h3>
                    <form onSubmit={createTrip}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Ambulance *</label>
                                <select name="ambulance" value={tripForm.ambulance} onChange={handleTripChange} required>
                                    <option value="">Select ambulance</option>
                                    {ambulances.filter((a) => a.status === "available").map((a) => (
                                        <option key={a._id} value={a._id}>
                                            {a.vehicleNumber} ({a.type})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Patient</label>
                                <select name="patient" value={tripForm.patient} onChange={handleTripChange}>
                                    <option value="">Select patient (optional)</option>
                                    {patients.map((p) => (
                                        <option key={p._id} value={p._id}>
                                            {p.user?.name || p.uhid} ({p.uhid})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Pickup Location *</label>
                                <input name="pickupLocation" value={tripForm.pickupLocation} onChange={handleTripChange} placeholder="e.g. 12 MG Road" required />
                            </div>
                            <div className="form-group">
                                <label>Drop Location *</label>
                                <input name="dropLocation" value={tripForm.dropLocation} onChange={handleTripChange} placeholder="e.g. City Hospital" required />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "Saving…" : "Dispatch Trip"}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowTripForm(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card" style={{ marginBottom: 24 }}>
                <h3>Ambulance Fleet</h3>
                {loading ? (
                    <div className="loading"><span className="spinner" /> Loading ambulances…</div>
                ) : ambulances.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🚑</div>
                        <p>No ambulances registered.</p>
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Vehicle</th>
                                    <th>Type</th>
                                    <th>Driver</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ambulances.map((a) => (
                                    <tr key={a._id}>
                                        <td><strong>{a.vehicleNumber}</strong></td>
                                        <td><span className="badge teal">{a.type}</span></td>
                                        <td>{a.driverName || "—"}</td>
                                        <td>{a.driverPhone || "—"}</td>
                                        <td><span className={`badge ${ambBadge(a.status)}`}>{a.status}</span></td>
                                        <td>
                                            {a.status === "available" && (
                                                <button className="btn btn-secondary btn-sm" onClick={() => updateAmbulance(a._id, "maintenance")}>
                                                    Maintenance
                                                </button>
                                            )}
                                            {a.status === "maintenance" && (
                                                <button className="btn btn-success btn-sm" onClick={() => updateAmbulance(a._id, "available")}>
                                                    Make Available
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
                <h3>Trip Log</h3>
                {trips.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🗺️</div>
                        <p>No trips recorded yet.</p>
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Ambulance</th>
                                    <th>Patient</th>
                                    <th>Pickup</th>
                                    <th>Drop</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trips.map((t) => (
                                    <tr key={t._id}>
                                        <td><strong>{t.ambulance?.vehicleNumber || "—"}</strong></td>
                                        <td>{patientName(t)}</td>
                                        <td>{t.pickupLocation || "—"}</td>
                                        <td>{t.dropLocation || "—"}</td>
                                        <td><span className={`badge ${tripBadge(t.status)}`}>{t.status}</span></td>
                                        <td>
                                            {t.status === "requested" && (
                                                <button className="btn btn-primary btn-sm" onClick={() => updateTrip(t._id, "dispatched")}>
                                                    Dispatch
                                                </button>
                                            )}
                                            {t.status === "dispatched" && (
                                                <button className="btn btn-secondary btn-sm" onClick={() => updateTrip(t._id, "on-scene")}>
                                                    On Scene
                                                </button>
                                            )}
                                            {t.status === "on-scene" && (
                                                <button className="btn btn-secondary btn-sm" onClick={() => updateTrip(t._id, "transporting")}>
                                                    Transporting
                                                </button>
                                            )}
                                            {t.status === "transporting" && (
                                                <button className="btn btn-success btn-sm" onClick={() => updateTrip(t._id, "completed")}>
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
        </div>
    );
}