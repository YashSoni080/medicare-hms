import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

const ACTION_BADGE = {
    CREATE: "green",
    READ: "blue",
    UPDATE: "amber",
    DELETE: "red",
    LOGIN: "teal",
    LOGOUT: "gray",
};

export default function Admin() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionFilter, setActionFilter] = useState("");
    const [entityFilter, setEntityFilter] = useState("");

    const loadLogs = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (actionFilter) params.set("action", actionFilter);
        if (entityFilter) params.set("entityName", entityFilter);
        api.get(`/audit-logs${params.toString() ? `?${params}` : ""}`)
            .then((data) => setLogs(data.logs || []))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadLogs(); }, [actionFilter, entityFilter]);

    return (
        <div>
            <div className="page-head">
                <div>
                    <h2>Admin</h2>
                    <p>Audit trail and system activity (admin only)</p>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="filters">
                <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
                    <option value="">All actions</option>
                    {Object.keys(ACTION_BADGE).map((a) => (
                        <option key={a} value={a}>{a}</option>
                    ))}
                </select>
                <input
                    placeholder="Filter by entity (e.g. Patient)…"
                    value={entityFilter}
                    onChange={(e) => setEntityFilter(e.target.value)}
                    style={{ minWidth: 220 }}
                />
            </div>

            {loading ? (
                <div className="loading"><span className="spinner" /> Loading audit logs…</div>
            ) : logs.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">⚙️</div>
                    <p>No audit logs found.</p>
                </div>
            ) : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>User</th>
                                <th>Action</th>
                                <th>Entity</th>
                                <th>Entity ID</th>
                                <th>IP Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log._id}>
                                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                                    <td>
                                        <strong>{log.user?.name || "System"}</strong>
                                        <div style={{ fontSize: 12, color: "#6b7280" }}>{log.user?.role}</div>
                                    </td>
                                    <td>
                                        <span className={`badge ${ACTION_BADGE[log.action] || "gray"}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td>{log.entityName}</td>
                                    <td style={{ fontSize: 12, color: "#6b7280" }}>{log.entityId || "—"}</td>
                                    <td>{log.ipAddress || "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}