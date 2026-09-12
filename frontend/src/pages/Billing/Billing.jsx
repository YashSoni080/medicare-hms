import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

const STATUS_BADGE = {
    unpaid: "red",
    partial: "amber",
    paid: "green",
    cancelled: "gray",
};

export default function Billing() {
    const [invoices, setInvoices] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");
    const [form, setForm] = useState({
        patient: "",
        description: "",
        category: "consultation",
        quantity: 1,
        unitPrice: "",
        discountAmount: 0,
        taxAmount: 0,
    });
    const [items, setItems] = useState([]);

    const loadInvoices = () => {
        setLoading(true);
        api.get(`/invoices${statusFilter ? `?status=${statusFilter}` : ""}`)
            .then((data) => setInvoices(data.invoices || []))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadInvoices();
        api.get("/patients").then((d) => setPatients(d.patients || [])).catch(() => { });
    }, [statusFilter]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const addItem = () => {
        if (!form.description || !form.unitPrice) return;
        setItems([
            ...items,
            {
                description: form.description,
                category: form.category,
                quantity: Number(form.quantity) || 1,
                unitPrice: Number(form.unitPrice) || 0,
            },
        ]);
        setForm({ ...form, description: "", unitPrice: "", quantity: 1 });
    };

    const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!items.length) {
            setError("Add at least one line item");
            return;
        }
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await api.post("/invoices", {
                patient: form.patient,
                items,
                discountAmount: Number(form.discountAmount) || 0,
                taxAmount: Number(form.taxAmount) || 0,
            });
            setSuccess("Invoice created successfully!");
            setShowForm(false);
            setItems([]);
            setForm({ patient: "", description: "", category: "consultation", quantity: 1, unitPrice: "", discountAmount: 0, taxAmount: 0 });
            loadInvoices();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const recordPayment = async (invoice) => {
        const amount = window.prompt(`Enter amount paid for ${invoice.invoiceNumber}:`, invoice.patientPayable || invoice.netPayable);
        if (!amount) return;
        try {
            await api.post(`/invoices/${invoice._id}/pay`, {
                paymentMode: "cash",
                amountPaid: Number(amount),
            });
            loadInvoices();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <div className="page-head">
                <div>
                    <h2>Billing</h2>
                    <p>Create invoices and record payments</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "✕ Close" : "+ New Invoice"}
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {showForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3>Create Invoice</h3>
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
                                <label>Discount (₹)</label>
                                <input name="discountAmount" type="number" min="0" value={form.discountAmount} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Tax (₹)</label>
                                <input name="taxAmount" type="number" min="0" value={form.taxAmount} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-grid" style={{ marginTop: 14 }}>
                            <div className="form-group">
                                <label>Description</label>
                                <input name="description" value={form.description} onChange={handleChange} placeholder="e.g. Consultation fee" />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select name="category" value={form.category} onChange={handleChange}>
                                    {["consultation", "pharmacy", "lab", "room", "procedure", "nursing", "other"].map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Qty</label>
                                <input name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Unit Price (₹)</label>
                                <input name="unitPrice" type="number" min="0" value={form.unitPrice} onChange={handleChange} />
                            </div>
                            <div className="form-group" style={{ justifyContent: "flex-end" }}>
                                <button type="button" className="btn btn-secondary" onClick={addItem}>+ Add Item</button>
                            </div>
                        </div>

                        {items.length > 0 && (
                            <div className="table-wrap" style={{ marginTop: 14 }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Description</th>
                                            <th>Category</th>
                                            <th>Qty</th>
                                            <th>Unit Price</th>
                                            <th>Amount</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((it, idx) => (
                                            <tr key={idx}>
                                                <td>{it.description}</td>
                                                <td>{it.category}</td>
                                                <td>{it.quantity}</td>
                                                <td>₹{it.unitPrice}</td>
                                                <td>₹{it.quantity * it.unitPrice}</td>
                                                <td>
                                                    <button type="button" className="btn btn-sm btn-danger" onClick={() => removeItem(idx)}>✕</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "Creating…" : "Create Invoice"}
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
                <div className="loading"><span className="spinner" /> Loading invoices…</div>
            ) : invoices.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">💰</div>
                    <p>No invoices found.</p>
                </div>
            ) : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Invoice #</th>
                                <th>Patient</th>
                                <th>Items</th>
                                <th>Net Payable</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((inv) => (
                                <tr key={inv._id}>
                                    <td><span className="badge teal">{inv.invoiceNumber}</span></td>
                                    <td><strong>{inv.patient?.user?.name}</strong></td>
                                    <td>{inv.items?.length || 0}</td>
                                    <td><strong>₹{Number(inv.netPayable || 0).toLocaleString("en-IN")}</strong></td>
                                    <td>
                                        <span className={`badge ${STATUS_BADGE[inv.status] || "gray"}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        {inv.status !== "paid" && inv.status !== "cancelled" && (
                                            <button className="btn btn-sm btn-primary" onClick={() => recordPayment(inv)}>
                                                Record Payment
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