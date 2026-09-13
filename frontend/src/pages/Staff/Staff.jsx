import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

const DEPARTMENTS = ["General Medicine", "Cardiology", "Orthopedics", "Pediatrics", "Gynecology", "Neurology", "Dermatology", "ENT", "Ophthalmology", "Psychiatry", "Nursing", "Administration", "Pharmacy", "Laboratory", "Radiology", "Housekeeping", "Security", "Other"];
const SHIFTS = ["morning", "evening", "night", "rotational"];

const shiftBadge = (s) => {
    const map = { morning: "amber", evening: "blue", night: "purple", rotational: "gray" };
    return map[s] || "gray";
};

const attBadge = (s) => {
    const map = { present: "green", absent: "red", leave: "amber", "half-day": "blue" };
    return map[s] || "gray";
};

export default function Staff() {
    const [staff, setStaff] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [showAttForm, setShowAttForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        user: "",
        department: "General Medicine",
        designation: "",
        joiningDate: "",
        salary: "",
        shift: "morning",
        emergencyContact: "",
        address: "",
    });
    const [attForm, setAttForm] = useState({
        staff: "",
        date: new Date().toISOString().slice(0, 10),
        status: "present",
        notes: "",
    });

    const loadData = () => {
        setLoading(true);
        Promise.all([
            api.get("/staff"),
            api.get("/staff/attendance"),
            api.get("/users?unassigned=true"),
        ])
            .then(([st, att, us]) => {
                setStaff(st.staff || []);
                setAttendance(att.records || []);
                setUsers(us.users || []);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleAttChange = (e) => setAttForm({ ...attForm, [e.target.name]: e.target.value });

    const createStaff = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await api.post("/staff", {
                ...form,
                salary: Number(form.salary) || undefined,
                joiningDate: form.joiningDate || undefined,
            });
            setSuccess("Staff member added!");
            setShowForm(false);
            setForm({ user: "", department: "General Medicine", designation: "", joiningDate: "", salary: "", shift: "morning", emergencyContact: "", address: "" });
            loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const recordAttendance = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await api.post("/staff/attendance", attForm);
            setSuccess("Attendance recorded!");
            setShowAttForm(false);
            setAttForm({ staff: "", date: new Date().toISOString().slice(0, 10), status: "present", notes: "" });
            loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const staffName = (s) => s.user?.name || s.employeeId || "—";

    return (
        <div>
            <div className="page-head">
                <div>
                    <h2>Staff Management</h2>
                    <p>Manage hospital staff profiles and attendance</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn btn-secondary" onClick={() => setShowAttForm(!showAttForm)}>
                        {showAttForm ? "✕ Close" : "+ Attendance"}
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? "✕ Close" : "+ Add Staff"}
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {showForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3>Add Staff Member</h3>
                    <form onSubmit={createStaff}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>User Account *</label>
                                <select name="user" value={form.user} onChange={handleChange} required>
                                    <option value="">Select user</option>
                                    {users.map((u) => (
                                        <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Department</label>
                                <select name="department" value={form.department} onChange={handleChange}>
                                    {DEPARTMENTS.map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Designation</label>
                                <input name="designation" value={form.designation} onChange={handleChange} placeholder="e.g. Staff Nurse" />
                            </div>
                            <div className="form-group">
                                <label>Joining Date</label>
                                <input name="joiningDate" type="date" value={form.joiningDate} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Salary</label>
                                <input name="salary" type="number" min="0" value={form.salary} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Shift</label>
                                <select name="shift" value={form.shift} onChange={handleChange}>
                                    {SHIFTS.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Emergency Contact</label>
                                <input name="emergencyContact" value={form.emergencyContact} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <input name="address" value={form.address} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "Saving…" : "Add Staff"}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {showAttForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3>Record Attendance</h3>
                    <form onSubmit={recordAttendance}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Staff *</label>
                                <select name="staff" value={attForm.staff} onChange={handleAttChange} required>
                                    <option value="">Select staff</option>
                                    {staff.map((s) => (
                                        <option key={s._id} value={s._id}>
                                            {staffName(s)} ({s.employeeId})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Date *</label>
                                <input name="date" type="date" value={attForm.date} onChange={handleAttChange} required />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select name="status" value={attForm.status} onChange={handleAttChange}>
                                    {["present", "absent", "leave", "half-day"].map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Notes</label>
                                <input name="notes" value={attForm.notes} onChange={handleAttChange} />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "Saving…" : "Record"}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowAttForm(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card" style={{ marginBottom: 24 }}>
                <h3>Staff Directory</h3>
                {loading ? (
                    <div className="loading"><span className="spinner" /> Loading staff…</div>
                ) : staff.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">👥</div>
                        <p>No staff members found.</p>
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>ID</th>
                                    <th>Department</th>
                                    <th>Designation</th>
                                    <th>Shift</th>
                                    <th>Salary</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staff.map((s) => (
                                    <tr key={s._id}>
                                        <td><strong>{staffName(s)}</strong></td>
                                        <td><span className="badge teal">{s.employeeId}</span></td>
                                        <td>{s.department || "—"}</td>
                                        <td>{s.designation || "—"}</td>
                                        <td><span className={`badge ${shiftBadge(s.shift)}`}>{s.shift}</span></td>
                                        <td>{s.salary ? `₹${Number(s.salary).toLocaleString()}` : "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="card">
                <h3>Attendance Records</h3>
                {attendance.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📅</div>
                        <p>No attendance records yet.</p>
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Staff</th>
                                    <th>Date</th>
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                    <th>Status</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.map((a) => (
                                    <tr key={a._id}>
                                        <td><strong>{a.staff?.user?.name || a.staff?.employeeId || "—"}</strong></td>
                                        <td>{a.date ? new Date(a.date).toLocaleDateString() : "—"}</td>
                                        <td>{a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : "—"}</td>
                                        <td>{a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : "—"}</td>
                                        <td><span className={`badge ${attBadge(a.status)}`}>{a.status}</span></td>
                                        <td style={{ maxWidth: 200 }}>{a.notes || "—"}</td>
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