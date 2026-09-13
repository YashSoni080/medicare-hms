import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

const TASK_TYPES = ["medication", "vitals", "dressing", "injection", "iv-fluid", "observation", "other"];

const taskBadge = (status) => {
    const map = {
        pending: "amber",
        "in-progress": "blue",
        completed: "green",
        skipped: "gray",
    };
    return map[status] || "gray";
};

export default function Nursing() {
    const [tasks, setTasks] = useState([]);
    const [vitals, setVitals] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [showVitalForm, setShowVitalForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [taskForm, setTaskForm] = useState({
        patient: "",
        taskType: "medication",
        description: "",
        scheduledTime: "",
    });
    const [vitalForm, setVitalForm] = useState({
        patient: "",
        bpSystolic: "",
        bpDiastolic: "",
        pulse: "",
        temperature: "",
        spo2: "",
        respiratoryRate: "",
        weight: "",
        notes: "",
    });

    const loadData = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (statusFilter) params.set("status", statusFilter);
        Promise.all([
            api.get(`/nursing${params.toString() ? `?${params}` : ""}`),
            api.get("/patients"),
        ])
            .then(([nur, pat]) => {
                setTasks(nur.tasks || []);
                setVitals(nur.vitals || []);
                setPatients(pat.patients || []);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, [statusFilter]);

    const handleTaskChange = (e) => setTaskForm({ ...taskForm, [e.target.name]: e.target.value });
    const handleVitalChange = (e) => setVitalForm({ ...vitalForm, [e.target.name]: e.target.value });

    const createTask = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await api.post("/nursing/tasks", {
                ...taskForm,
                scheduledTime: taskForm.scheduledTime || undefined,
            });
            setSuccess("Nursing task created!");
            setShowTaskForm(false);
            setTaskForm({ patient: "", taskType: "medication", description: "", scheduledTime: "" });
            loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const recordVital = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await api.post("/nursing/vitals", {
                patient: vitalForm.patient,
                bpSystolic: Number(vitalForm.bpSystolic) || undefined,
                bpDiastolic: Number(vitalForm.bpDiastolic) || undefined,
                pulse: Number(vitalForm.pulse) || undefined,
                temperature: Number(vitalForm.temperature) || undefined,
                spo2: Number(vitalForm.spo2) || undefined,
                respiratoryRate: Number(vitalForm.respiratoryRate) || undefined,
                weight: Number(vitalForm.weight) || undefined,
                notes: vitalForm.notes,
            });
            setSuccess("Vitals recorded!");
            setShowVitalForm(false);
            setVitalForm({ patient: "", bpSystolic: "", bpDiastolic: "", pulse: "", temperature: "", spo2: "", respiratoryRate: "", weight: "", notes: "" });
            loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const updateTask = async (id, status) => {
        try {
            await api.put(`/nursing/tasks/${id}`, { status });
            setSuccess(`Task marked ${status}.`);
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
                    <h2>Nursing Station</h2>
                    <p>Assign nursing tasks and record patient vitals</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn btn-secondary" onClick={() => setShowVitalForm(!showVitalForm)}>
                        {showVitalForm ? "✕ Close" : "+ Record Vitals"}
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowTaskForm(!showTaskForm)}>
                        {showTaskForm ? "✕ Close" : "+ New Task"}
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {showTaskForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3>Create Nursing Task</h3>
                    <form onSubmit={createTask}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Patient *</label>
                                <select name="patient" value={taskForm.patient} onChange={handleTaskChange} required>
                                    <option value="">Select patient</option>
                                    {patients.map((p) => (
                                        <option key={p._id} value={p._id}>
                                            {p.user?.name || p.uhid} ({p.uhid})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Task Type *</label>
                                <select name="taskType" value={taskForm.taskType} onChange={handleTaskChange}>
                                    {TASK_TYPES.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea name="description" value={taskForm.description} onChange={handleTaskChange} rows={2} />
                            </div>
                            <div className="form-group">
                                <label>Scheduled Time</label>
                                <input name="scheduledTime" type="datetime-local" value={taskForm.scheduledTime} onChange={handleTaskChange} />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "Saving…" : "Create Task"}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowTaskForm(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {showVitalForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3>Record Vitals</h3>
                    <form onSubmit={recordVital}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Patient *</label>
                                <select name="patient" value={vitalForm.patient} onChange={handleVitalChange} required>
                                    <option value="">Select patient</option>
                                    {patients.map((p) => (
                                        <option key={p._id} value={p._id}>
                                            {p.user?.name || p.uhid} ({p.uhid})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>BP Systolic</label>
                                <input name="bpSystolic" type="number" value={vitalForm.bpSystolic} onChange={handleVitalChange} placeholder="120" />
                            </div>
                            <div className="form-group">
                                <label>BP Diastolic</label>
                                <input name="bpDiastolic" type="number" value={vitalForm.bpDiastolic} onChange={handleVitalChange} placeholder="80" />
                            </div>
                            <div className="form-group">
                                <label>Pulse</label>
                                <input name="pulse" type="number" value={vitalForm.pulse} onChange={handleVitalChange} placeholder="72" />
                            </div>
                            <div className="form-group">
                                <label>Temperature (°F)</label>
                                <input name="temperature" type="number" value={vitalForm.temperature} onChange={handleVitalChange} placeholder="98.6" />
                            </div>
                            <div className="form-group">
                                <label>SpO₂ (%)</label>
                                <input name="spo2" type="number" value={vitalForm.spo2} onChange={handleVitalChange} placeholder="98" />
                            </div>
                            <div className="form-group">
                                <label>Resp. Rate</label>
                                <input name="respiratoryRate" type="number" value={vitalForm.respiratoryRate} onChange={handleVitalChange} placeholder="16" />
                            </div>
                            <div className="form-group">
                                <label>Weight (kg)</label>
                                <input name="weight" type="number" value={vitalForm.weight} onChange={handleVitalChange} placeholder="70" />
                            </div>
                            <div className="form-group">
                                <label>Notes</label>
                                <input name="notes" value={vitalForm.notes} onChange={handleVitalChange} />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "Saving…" : "Record Vitals"}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowVitalForm(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="filters">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All task statuses</option>
                    {["pending", "in-progress", "completed", "skipped"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
                <h3>Nursing Tasks</h3>
                {loading ? (
                    <div className="loading"><span className="spinner" /> Loading tasks…</div>
                ) : tasks.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🩺</div>
                        <p>No nursing tasks found.</p>
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Task</th>
                                    <th>Description</th>
                                    <th>Scheduled</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map((t) => (
                                    <tr key={t._id}>
                                        <td><strong>{patientName(t)}</strong></td>
                                        <td><span className="badge teal">{t.taskType}</span></td>
                                        <td style={{ maxWidth: 200 }}>{t.description || "—"}</td>
                                        <td>{t.scheduledTime ? new Date(t.scheduledTime).toLocaleString() : "—"}</td>
                                        <td><span className={`badge ${taskBadge(t.status)}`}>{t.status}</span></td>
                                        <td>
                                            {t.status === "pending" && (
                                                <button className="btn btn-primary btn-sm" onClick={() => updateTask(t._id, "in-progress")}>
                                                    Start
                                                </button>
                                            )}
                                            {t.status === "in-progress" && (
                                                <button className="btn btn-success btn-sm" onClick={() => updateTask(t._id, "completed")}>
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

            <div className="card">
                <h3>Recent Vitals</h3>
                {vitals.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📊</div>
                        <p>No vitals recorded yet.</p>
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>BP</th>
                                    <th>Pulse</th>
                                    <th>Temp</th>
                                    <th>SpO₂</th>
                                    <th>Weight</th>
                                    <th>Recorded</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vitals.map((v) => (
                                    <tr key={v._id}>
                                        <td><strong>{patientName(v)}</strong></td>
                                        <td>{v.bpSystolic ? `${v.bpSystolic}/${v.bpDiastolic}` : "—"}</td>
                                        <td>{v.pulse ? `${v.pulse} bpm` : "—"}</td>
                                        <td>{v.temperature ? `${v.temperature}°F` : "—"}</td>
                                        <td>{v.spo2 ? `${v.spo2}%` : "—"}</td>
                                        <td>{v.weight ? `${v.weight} kg` : "—"}</td>
                                        <td>{new Date(v.createdAt).toLocaleString()}</td>
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