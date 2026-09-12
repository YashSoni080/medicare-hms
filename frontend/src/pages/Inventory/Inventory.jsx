import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

const CATEGORIES = ["medicine", "consumable", "surgical", "reusable", "equipment"];

export default function Inventory() {
    const [items, setItems] = useState([]);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [lowStockOnly, setLowStockOnly] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");
    const [form, setForm] = useState({
        name: "",
        sku: "",
        category: "medicine",
        unit: "unit",
        quantity: 0,
        reorderLevel: 10,
        batchNumber: "",
        expiryDate: "",
        mrp: "",
        purchasePrice: "",
        sellingPrice: "",
        store: "central",
    });

    const loadData = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (categoryFilter) params.set("category", categoryFilter);
        if (lowStockOnly) params.set("lowStock", "true");
        Promise.all([
            api.get(`/inventory${params.toString() ? `?${params}` : ""}`),
            api.get("/inventory/purchase-orders"),
        ])
            .then(([inv, po]) => {
                setItems(inv.items || []);
                setPurchaseOrders(po.purchaseOrders || []);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, [categoryFilter, lowStockOnly]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await api.post("/inventory", {
                ...form,
                quantity: Number(form.quantity) || 0,
                reorderLevel: Number(form.reorderLevel) || 10,
                mrp: Number(form.mrp) || 0,
                purchasePrice: Number(form.purchasePrice) || 0,
                sellingPrice: Number(form.sellingPrice) || 0,
            });
            setSuccess("Inventory item added successfully!");
            setShowForm(false);
            setForm({ name: "", sku: "", category: "medicine", unit: "unit", quantity: 0, reorderLevel: 10, batchNumber: "", expiryDate: "", mrp: "", purchasePrice: "", sellingPrice: "", store: "central" });
            loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const receivePO = async (id) => {
        try {
            await api.put(`/inventory/purchase-orders/${id}/receive`, {});
            loadData();
        } catch (err) {
            setError(err.message);
        }
    };

    const isLowStock = (item) => item.quantity <= item.reorderLevel;

    return (
        <div>
            <div className="page-head">
                <div>
                    <h2>Inventory</h2>
                    <p>Track stock levels and purchase orders</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "✕ Close" : "+ Add Item"}
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {showForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3>Add Inventory Item</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Name *</label>
                                <input name="name" value={form.name} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>SKU *</label>
                                <input name="sku" value={form.sku} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select name="category" value={form.category} onChange={handleChange}>
                                    {CATEGORIES.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Unit</label>
                                <input name="unit" value={form.unit} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Quantity</label>
                                <input name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Reorder Level</label>
                                <input name="reorderLevel" type="number" min="0" value={form.reorderLevel} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Batch Number</label>
                                <input name="batchNumber" value={form.batchNumber} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Expiry Date</label>
                                <input name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>MRP (₹)</label>
                                <input name="mrp" type="number" min="0" value={form.mrp} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Purchase Price (₹)</label>
                                <input name="purchasePrice" type="number" min="0" value={form.purchasePrice} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Selling Price (₹)</label>
                                <input name="sellingPrice" type="number" min="0" value={form.sellingPrice} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Store</label>
                                <select name="store" value={form.store} onChange={handleChange}>
                                    <option value="central">Central</option>
                                    <option value="ward-pharmacy">Ward Pharmacy</option>
                                    <option value="operation-theatre">Operation Theatre</option>
                                    <option value="lab">Lab</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "Saving…" : "Add Item"}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="filters">
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    <option value="">All categories</option>
                    {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
                    <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} />
                    Low stock only
                </label>
            </div>

            {loading ? (
                <div className="loading"><span className="spinner" /> Loading inventory…</div>
            ) : items.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <p>No inventory items found.</p>
                </div>
            ) : (
                <div className="table-wrap" style={{ marginBottom: 24 }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>SKU</th>
                                <th>Category</th>
                                <th>Store</th>
                                <th>Qty</th>
                                <th>Status</th>
                                <th>Expiry</th>
                                <th>Selling Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item._id}>
                                    <td><strong>{item.name}</strong></td>
                                    <td><span className="badge gray">{item.sku}</span></td>
                                    <td>{item.category}</td>
                                    <td>{item.store}</td>
                                    <td><strong>{item.quantity} {item.unit}</strong></td>
                                    <td>
                                        {isLowStock(item) ? (
                                            <span className="badge red">Low stock</span>
                                        ) : (
                                            <span className="badge green">In stock</span>
                                        )}
                                    </td>
                                    <td>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "—"}</td>
                                    <td>₹{item.sellingPrice || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="card">
                <h3>Purchase Orders</h3>
                {purchaseOrders.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📋</div>
                        <p>No purchase orders yet.</p>
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>PO #</th>
                                    <th>Vendor</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchaseOrders.map((po) => (
                                    <tr key={po._id}>
                                        <td><span className="badge teal">{po.poNumber}</span></td>
                                        <td>{po.vendor}</td>
                                        <td>{po.items?.length || 0}</td>
                                        <td>₹{Number(po.totalAmount || 0).toLocaleString("en-IN")}</td>
                                        <td>
                                            <span className={`badge ${po.status === "received" ? "green" : po.status === "cancelled" ? "red" : "amber"}`}>
                                                {po.status}
                                            </span>
                                        </td>
                                        <td>
                                            {po.status !== "received" && po.status !== "cancelled" && (
                                                <button className="btn btn-sm btn-primary" onClick={() => receivePO(po._id)}>
                                                    Receive
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