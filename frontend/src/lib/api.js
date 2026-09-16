// Backend API base URL.
// Production: the backend is deployed separately on Vercel, so point at its
// public URL. Local dev: use the local API.
const API_URL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? "http://localhost:5000/api" : "https://medicare-hms-one.vercel.app/api");

const authHeader = () => {
    const token = localStorage.getItem("token");
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
};

const handleResponse = async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Something went wrong");
    return data;
};

export const api = {
    get: (path) =>
        fetch(`${API_URL}${path}`, { headers: { ...authHeader() } }).then(handleResponse),

    post: (path, body) =>
        fetch(`${API_URL}${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeader() },
            body: JSON.stringify(body),
        }).then(handleResponse),

    put: (path, body) =>
        fetch(`${API_URL}${path}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", ...authHeader() },
            body: JSON.stringify(body),
        }).then(handleResponse),

    delete: (path) =>
        fetch(`${API_URL}${path}`, {
            method: "DELETE",
            headers: { ...authHeader() },
        }).then(handleResponse),
};
