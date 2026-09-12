import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

const STATUS_BADGE = {
    pending: "amber",
    dispensed: "green",
    partial: "blue",
    cancelled: "red",
};

export default function Pharmacy() {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const loadPrescriptions = () => {
        setLoading(true);
        api.get(`/prescriptions${statusFilter ? `?status=${statusFilter}` : ""}`)
            .then((data) => setPrescriptions(data.prescriptions || []))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadPrescriptions(); }, [statusFilter]);

    const dispense = async (id) => {
        try {
            await api.put(`/prescriptions/${id}/dispense`, {});
            loadPrescriptions();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <div className="page-head">
                <div>
                    <h2>Pharmacy</h2>
                    <p>Dispense prescriptions and track medication status</p>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="filters">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All statuses</option>
                    {Object.keys(STATUS_BADGE).map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="loading"><span className="spinner" /> Loading prescriptions…</div>
            ) : prescriptions.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">💊</div>
                    <p>No prescriptions found.</p>
                </div>
            ) : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Medications</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prescriptions.map((p) => (
                                <tr key={p._id}>
                                    <td><strong>{p.patient?.user?.name}</strong></td>
                                    <td>{p.doctor?.user?.name}</td>
                                    <td>
                                        {p.items?.map((i) => (
                                            <div key={i._id} style={{ fontSize: 13 }}>
                                                <strong>{i.name}</strong>
                                                {i.dosage ? ` — ${i.dosage}` : ""}
                                                {i.frequency ? `, ${i.frequency}` : ""}
                                            </div>
                                        ))}
                                    </td>
                                    <td>
                                        <span className={`badge ${STATUS_BADGE[p.status] || "gray"}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        {p.status === "pending" && (
                                            <button className="btn btn-sm btn-primary" onClick={() => dispense(p._id)}>
                                                Dispense
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