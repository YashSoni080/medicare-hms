import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api.js";
import logo from "../../assets/logo.svg";
import "./Login.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const data = await api.post("/auth/login", { email, password });
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-hero">
                <div className="auth-hero-inner">
                    <div className="auth-hero-brand">
                        <img src={logo} alt="MediCare" className="hero-logo" />
                        <span className="hero-brand-text">MediCare HMS</span>
                    </div>
                    <h1 className="hero-title">
                        Complete Hospital<br />Management, <em>Simplified</em>
                    </h1>
                    <p className="hero-subtitle">
                        Manage patients, appointments, pharmacy, lab, billing and wards —
                        all in one secure platform.
                    </p>
                    <div className="hero-features">
                        <div className="hero-feature">
                            <span className="hero-feature-icon">🩺</span>
                            <div>
                                <strong>Patient Care</strong>
                                <span>UHID records & OPD queue</span>
                            </div>
                        </div>
                        <div className="hero-feature">
                            <span className="hero-feature-icon">💊</span>
                            <div>
                                <strong>Pharmacy & Lab</strong>
                                <span>Prescriptions & lab orders</span>
                            </div>
                        </div>
                        <div className="hero-feature">
                            <span className="hero-feature-icon">🏥</span>
                            <div>
                                <strong>Wards & Billing</strong>
                                <span>Admissions & invoicing</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="auth-form-side">
                <div className="auth-card">
                    <div className="auth-brand">
                        <img src={logo} alt="MediCare" className="brand-logo" />
                        <span className="brand-text">MediCare HMS</span>
                    </div>

                    <h2>Welcome back</h2>
                    <p className="auth-subtitle">Sign in to access the hospital management system</p>

                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@hospital.com"
                                required
                                autoFocus
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner spinner-light" /> Signing in…
                                </>
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Secure access · MediCare HMS v1.0
                    </p>
                </div>
            </div>
        </div>
    );
}