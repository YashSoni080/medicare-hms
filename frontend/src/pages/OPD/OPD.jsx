import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

const STATUS_BADGE = {
    pending: "amber",
    confirmed: "blue",
    completed: "green",
    cancelled: "red",
};

const QUEUE_BADGE = {
    waiting: "amber",
    "in-consultation": "purple",
    "sent-for-lab": "blue",
    completed: "green",
    skipped: "gray",
};

export default function OPD() {
    const [tab, setTab] = useState("appointments");
    const [appointments, setAppointments] = useState([]);
    const [queue, setQueue] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");
    const [form, setForm] = useState({
        patient: "", doctor: "", date: "", timeSlotStart: "", timeSlotEnd: "", reason: "",
    });

    const loadAppointments = () => {
        setLoading(true);
        api.get(`/appointments${statusFilter ? `?status=${statusFilter}` : ""}`)
            .then((data) => setAppointments(data.appointments || []))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    const loadQueue = () => {
        setLoading(true);
        api.get("/encounters?status=waiting")
            .then((data) => setQueue(data.encounters || []))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (tab === "appointments") {
            loadAppointments();
        } else {
            loadQueue();
        }
        api.get("/patients").then((d) => setPatients(d.patients || [])).catch(() => { });
        api.get("/doctors").then((d) => setDoctors(d.doctors || [])).catch(() => { });
    }, [tab, statusFilter]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await api.post("/appointments", {
                patientId: form.patient,
                doctorId: form.doctor,
                date: form.date,
                timeSlot: { start: form.timeSlotStart, end: form.timeSlotEnd },
                reason: form.reason,
            });
            setSuccess("Appointment booked successfully!");
            setShowForm(false);
            setForm({ patient: "", doctor: "", date: "", timeSlotStart: "", timeSlotEnd: "", reason: "" });
            loadAppointments();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/appointments/${id}/status`, { status });
            loadAppointments();
        } catch (err) {
            setError(err.message);
        }
    };

    const updateQueueStatus = async (id, status) => {
        try {
            await api.put(`/encounters/${id}`, { status });
            loadQueue();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <div className="page-head">
                <div>
                    <h2>OPD & Queue</h2>
                    <p>Book appointments and manage the outpatient queue</p>
                </div>
                {tab === "appointments" && (
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? "✕ Close" : "+ Book Appointment"}
                    </button>
                )}
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="tabs">
                <button className={`tab ${tab === "appointments" ? "active" : ""}`} onClick={() => setTab("appointments")}>
                    📅 Appointments
                </button>
                <button className={`tab ${tab === "queue" ? "active" : ""}`} onClick={() => setTab("queue")}>
                    🕐 Waiting Queue ({queue.length})
                </button>
            </div>

            {tab === "appointments" && (
                <>
                    {showForm && (
                        <div className="card" style={{ marginBottom: 16 }}>
                            <h3>Book New Appointment</h3>
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
                                        <label>Date *</label>
                                        <input name="date" type="date" value={form.date} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Start Time *</label>
                                        <input name="timeSlotStart" type="time" value={form.timeSlotStart} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>End Time</label>
                                        <input name="timeSlotEnd" type="time" value={form.timeSlotEnd} onChange={handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Reason</label>
                                        <input name="reason" value={form.reason} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? "Booking…" : "Book Appointment"}
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
                            {Object.keys(STATUS_BADGE).map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {loading ? (
                        <div className="loading"><span className="spinner" /> Loading appointments…</div>
                    ) : appointments.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📅</div>
                            <p>No appointments found.</p>
                        </div>
                    ) : (
                        <div className="table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Doctor</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map((a) => (
                                        <tr key={a._id}>
                                            <td><strong>{a.patient?.user?.name}</strong></td>
                                            <td>{a.doctor?.user?.name}</td>
                                            <td>{new Date(a.date).toLocaleDateString()}</td>
                                            <td>{a.timeSlot?.start}{a.timeSlot?.end ? ` – ${a.timeSlot.end}` : ""}</td>
                                            <td>{a.reason || "—"}</td>
                                            <td>
                                                <span className={`badge ${STATUS_BADGE[a.status] || "gray"}`}>
                                                    {a.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="actions">
                                                    {a.status === "pending" && (
                                                        <button className="btn btn-sm btn-primary" onClick={() => updateStatus(a._id, "confirmed")}>
                                                            Confirm
                                                        </button>
                                                    )}
                                                    {a.status === "confirmed" && (
                                                        <button className="btn btn-sm btn-success" onClick={() => updateStatus(a._id, "completed")}>
                                                            Complete
                                                        </button>
                                                    )}
                                                    {(a.status === "pending" || a.status === "confirmed") && (
                                                        <button className="btn btn-sm btn-danger" onClick={() => updateStatus(a._id, "cancelled")}>
                                                            Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {tab === "queue" && (
                <>
                    {loading ? (
                        <div className="loading"><span className="spinner" /> Loading queue…</div>
                    ) : queue.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🕐</div>
                            <p>No patients waiting in the queue.</p>
                        </div>
                    ) : (
                        <div className="table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Patient</th>
                                        <th>UHID</th>
                                        <th>Doctor</th>
                                        <th>Visit Type</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {queue.map((e, idx) => (
                                        <tr key={e._id}>
                                            <td>{idx + 1}</td>
                                            <td><strong>{e.patient?.user?.name}</strong></td>
                                            <td><span className="badge teal">{e.patient?.uhid}</span></td>
                                            <td>{e.doctor?.user?.name}</td>
                                            <td>{e.visitType}</td>
                                            <td>
                                                <span className={`badge ${QUEUE_BADGE[e.status] || "gray"}`}>
                                                    {e.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="actions">
                                                    {e.status === "waiting" && (
                                                        <button className="btn btn-sm btn-primary" onClick={() => updateQueueStatus(e._id, "in-consultation")}>
                                                            Start Consultation
                                                        </button>
                                                    )}
                                                    {e.status === "in-consultation" && (
                                                        <button className="btn btn-sm btn-success" onClick={() => updateQueueStatus(e._id, "completed")}>
                                                            Complete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}