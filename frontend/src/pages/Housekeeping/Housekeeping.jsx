import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

const TASK_TYPES = ["cleaning", "linen-change", "waste-collection", "disinfection", "other"];
const PRIORITIES = ["low", "medium", "high"];

const taskBadge = (status) => {
    const map = {
        pending: "amber",
        "in-progress": "blue",
        completed: "green",
    };
    return map[status] || "gray";
};

const priorityBadge = (p) => {
    const map = { low: "gray", medium: "blue", high: "red" };
    return map[p] || "gray";
};

const linenBadge = (status) => {
    const map = {
        "in-stock": "green",
        "in-use": "blue",
        laundry: "amber",
        damaged: "red",
    };
    return map[status] || "gray";
};

export default function Housekeeping() {
    const [tasks, setTasks] = useState([]);
    const [linenItems, setLinenItems] = useState([]);
    const [wasteRecords, setWasteRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [showLinenForm, setShowLinenForm] = useState(false);
    const [showWasteForm, setShowWasteForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [taskForm, setTaskForm] = useState({
        area: "",
        taskType: "cleaning",
        priority: "medium",
        notes: "",
    });
    const [linenForm, setLinenForm] = useState({
        itemName: "",
        quantity: 1,
        location: "",
    });
    const [wasteForm, setWasteForm] = useState({
        category: "bio-medical",
        quantityKg: "",
        collectedFrom: "",
        disposalMethod: "",
    });

    const loadData = () => {
        setLoading(true);
        api.get("/housekeeping")
            .then((data) => {
                setTasks(data.tasks || []);
                setLinenItems(data.linenItems || []);
                setWasteRecords(data.wasteRecords || []);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const handleTaskChange = (e) => setTaskForm({ ...taskForm, [e.target.name]: e.target.value });
    const handleLinenChange = (e) => setLinenForm({ ...linenForm, [e.target.name]: e.target.value });
    const handleWasteChange = (e) => setWasteForm({ ...wasteForm, [e.target.name]: e.target.value });

    const createTask = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await api.post("/housekeeping/tasks", taskForm);
            setSuccess("Housekeeping task created!");
            setShowTaskForm(false);
            setTaskForm({ area: "", taskType: "cleaning", priority: "medium", notes: "" });
            loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const updateTask = async (id, status) => {
        try {
            await api.put(`/housekeeping/tasks/${id}`, { status });
            setSuccess(`Task marked ${status}.`);
            loadData();
        } catch (err) {
            setError(err.message);
        }
    };

    const addLinen = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await api.post("/housekeeping/linen", {
                ...linenForm,
                quantity: Number(linenForm.quantity) || 1,
            });
            setSuccess("Linen item added!");
            setShowLinenForm(false);
            setLinenForm({ itemName: "", quantity: 1, location: "" });
            loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const updateLinen = async (id, status) => {
        try {
            await api.put(`/housekeeping/linen/${id}`, { status });
            setSuccess(`Linen marked ${status}.`);
            loadData();
        } catch (err) {
            setError(err.message);
        }
    };

    const addWaste = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await api.post("/housekeeping/waste", {
                ...wasteForm,
                quantityKg: Number(wasteForm.quantityKg) || 0,
            });
            setSuccess("Waste record added!");
            setShowWasteForm(false);
            setWasteForm({ category: "bio-medical", quantityKg: "", collectedFrom: "", disposalMethod: "" });
            loadData();
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
                    <h2>Housekeeping</h2>
                    <p>Manage cleaning tasks, linen inventory and waste disposal</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn btn-secondary" onClick={() => setShowWasteForm(!showWasteForm)}>
                        {showWasteForm ? "✕ Close" : "+ Waste Record"}
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowLinenForm(!showLinenForm)}>
                        {showLinenForm ? "✕ Close" : "+ Linen Item"}
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
                    <h3>Create Housekeeping Task</h3>
                    <form onSubmit={createTask}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Area *</label>
                                <input name="area" value={taskForm.area} onChange={handleTaskChange} placeholder="e.g. Ward 2, OT-1" required />
                            </div>
                            <div className="form-group">
                                <label>Task Type</label>
                                <select name="taskType" value={taskForm.taskType} onChange={handleTaskChange}>
                                    {TASK_TYPES.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Priority</label>
                                <select name="priority" value={taskForm.priority} onChange={handleTaskChange}>
                                    {PRIORITIES.map((p) => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Notes</label>
                                <input name="notes" value={taskForm.notes} onChange={handleTaskChange} />
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

            {showLinenForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3>Add Linen Item</h3>
                    <form onSubmit={addLinen}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Item Name *</label>
                                <input name="itemName" value={linenForm.itemName} onChange={handleLinenChange} placeholder="e.g. Bed sheets" required />
                            </div>
                            <div className="form-group">
                                <label>Quantity</label>
                                <input name="quantity" type="number" min="1" value={linenForm.quantity} onChange={handleLinenChange} />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input name="location" value={linenForm.location} onChange={handleLinenChange} placeholder="e.g. Store room" />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "Saving…" : "Add Item"}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowLinenForm(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {showWasteForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3>Record Waste Disposal</h3>
                    <form onSubmit={addWaste}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Category *</label>
                                <select name="category" value={wasteForm.category} onChange={handleWasteChange}>
                                    {["bio-medical", "sharp", "infectious", "pharmaceutical", "chemical", "general"].map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Quantity (kg)</label>
                                <input name="quantityKg" type="number" min="0" value={wasteForm.quantityKg} onChange={handleWasteChange} />
                            </div>
                            <div className="form-group">
                                <label>Collected From</label>
                                <input name="collectedFrom" value={wasteForm.collectedFrom} onChange={handleWasteChange} placeholder="e.g. OT, Ward 3" />
                            </div>
                            <div className="form-group">
                                <label>Disposal Method</label>
                                <input name="disposalMethod" value={wasteForm.disposalMethod} onChange={handleWasteChange} placeholder="e.g. Incineration" />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "Saving…" : "Add Record"}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowWasteForm(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card" style={{ marginBottom: 24 }}>
                <h3>Housekeeping Tasks</h3>
                {loading ? (
                    <div className="loading"><span className="spinner" /> Loading tasks…</div>
                ) : tasks.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🧹</div>
                        <p>No housekeeping tasks found.</p>
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Area</th>
                                    <th>Task</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Notes</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map((t) => (
                                    <tr key={t._id}>
                                        <td><strong>{t.area}</strong></td>
                                        <td><span className="badge teal">{t.taskType}</span></td>
                                        <td><span className={`badge ${priorityBadge(t.priority)}`}>{t.priority}</span></td>
                                        <td><span className={`badge ${taskBadge(t.status)}`}>{t.status}</span></td>
                                        <td style={{ maxWidth: 200 }}>{t.notes || "—"}</td>
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

            <div className="card" style={{ marginBottom: 24 }}>
                <h3>Linen Inventory</h3>
                {linenItems.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🛏️</div>
                        <p>No linen items recorded.</p>
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Qty</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {linenItems.map((l) => (
                                    <tr key={l._id}>
                                        <td><strong>{l.itemName}</strong></td>
                                        <td>{l.quantity}</td>
                                        <td>{l.location || "—"}</td>
                                        <td><span className={`badge ${linenBadge(l.status)}`}>{l.status}</span></td>
                                        <td>
                                            {l.status === "in-stock" && (
                                                <button className="btn btn-secondary btn-sm" onClick={() => updateLinen(l._id, "in-use")}>
                                                    Mark In Use
                                                </button>
                                            )}
                                            {l.status === "in-use" && (
                                                <button className="btn btn-secondary btn-sm" onClick={() => updateLinen(l._id, "laundry")}>
                                                    Send to Laundry
                                                </button>
                                            )}
                                            {l.status === "laundry" && (
                                                <button className="btn btn-success btn-sm" onClick={() => updateLinen(l._id, "in-stock")}>
                                                    Restock
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
                <h3>Waste Disposal Records</h3>
                {wasteRecords.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">♻️</div>
                        <p>No waste records yet.</p>
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Qty (kg)</th>
                                    <th>Collected From</th>
                                    <th>Method</th>
                                    <th>Disposed At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {wasteRecords.map((w) => (
                                    <tr key={w._id}>
                                        <td><span className="badge teal">{w.category}</span></td>
                                        <td>{w.quantityKg}</td>
                                        <td>{w.collectedFrom || "—"}</td>
                                        <td>{w.disposalMethod || "—"}</td>
                                        <td>{w.disposedAt ? new Date(w.disposedAt).toLocaleString() : "—"}</td>
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