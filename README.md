# 🏥 MediCare — Hospital Management System

A full-stack **Hospital Management System (HMS)** built with the **MERN stack** (MongoDB, Express, React, Node.js). It covers the complete patient journey — registration, OPD/IPD, records, pharmacy, lab, billing, insurance, inventory, and audit — with role-based access for hospital staff.

![MediCare Logo](logo.png)

---

## ✨ Features

| Module | Description |
| --- | --- |
| **Dashboard** | Role-aware overview with today's appointments, admissions, revenue, and quick stats |
| **Patients** | Registration, UHID, demographics, contact & emergency info, search |
| **OPD & Queue** | Outpatient appointments, queue management, walk-ins |
| **Wards & IPD** | Inpatient admission, ward & bed allocation, discharge |
| **Records (EMR)** | Electronic medical records, encounter notes, history |
| **Pharmacy** | Prescriptions, dispensing, stock-aware medication |
| **Lab (LIS)** | Lab orders, sample collection, results entry |
| **Billing** | Invoices, payments, receipts |
| **Insurance** | Policies, claims, TPA tracking |
| **Inventory** | Stock items, purchase orders, low-stock alerts |
| **Admin & Audit** | User/role management, audit logs, system settings |

### Role-based access
`admin` · `doctor` · `receptionist` · `pharmacist` · `lab-tech` · `patient`

---

## 🧱 Tech Stack

**Frontend**
- React 19 + Vite 8
- React Router 7
- Custom design system (CSS tokens + components)

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose 9
- JWT authentication (bcrypt-hashed passwords)
- express-validator input validation

---

## 📁 Project Structure

```
HMS/
├── backend/               # Express API
│   ├── config/            # DB connection
│   ├── controllers/       # Route handlers
│   ├── middleware/        # Auth + error handling
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── server.js          # Entry point
│   ├── setup.js           # Create initial admin
│   └── cleanup.js         # Wipe demo data
└── frontend/              # React app (Vite)
    └── src/
        ├── components/    # Layout, shared UI
        ├── lib/           # API client
        ├── pages/         # Feature pages
        └── styles/        # Design tokens + components
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **MongoDB** running locally (`mongodb://localhost:27017`) or a MongoDB Atlas URI

### 1. Clone & install

```bash
git clone https://github.com/YashSoni080/medicare-hms.git
cd medicare-hms
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env      # then edit values
```

`.env` keys:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/hospital_management
JWT_SECRET=<generate-a-long-random-string>
CLIENT_URL=http://localhost:5173
```

Create the initial admin account:

```bash
node setup.js --email admin@hospital.com --password <strong-password> --name "Admin"
```

> ⚠️ Change the password after first login.

### 3. Frontend setup

```bash
cd ../frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api
```

### 4. Run

```bash
# Terminal 1 — backend
cd backend
npm run dev               # http://localhost:5000

# Terminal 2 — frontend
cd frontend
npm run dev               # http://localhost:5173
```

Open **http://localhost:5173** and sign in with the admin account you created.

---

## 🔌 API Overview

Base URL: `http://localhost:5000/api`

| Area | Routes |
| --- | --- |
| Auth | `POST /auth/login` |
| Patients | `GET/POST /patients`, `GET/PUT/DELETE /patients/:id` |
| Doctors | `GET/POST /doctors`, `GET/PUT/DELETE /doctors/:id` |
| Appointments | `GET/POST /appointments`, `PUT/DELETE /appointments/:id` |
| Encounters | `GET/POST /encounters`, `GET/PUT /encounters/:id` |
| Records | `GET/POST /records`, `GET/PUT /records/:id` |
| Prescriptions | `GET/POST /prescriptions`, `GET/PUT /prescriptions/:id` |
| Lab Orders | `GET/POST /lab-orders`, `GET/PUT /lab-orders/:id` |
| Invoices | `GET/POST /invoices`, `GET/PUT /invoices/:id` |
| Wards | `GET/POST /wards`, `GET/PUT /wards/:id` |
| Inventory | `GET/POST /inventory`, `GET/PUT /inventory/:id` |
| Insurance | `GET/POST /insurance`, `GET/PUT /insurance/:id` |
| Audit Logs | `GET /audit-logs` |
| Dashboard | `GET /dashboard/stats` |

All endpoints except `POST /auth/login` require a `Authorization: Bearer <token>` header.

---

## 🧹 Keeping the database clean

The app ships with **no demo data**. To reset to a blank state (keeping only your admin):

```bash
cd backend
node cleanup.js
```

---

## 🛠️ Scripts

| Script | Location | Purpose |
| --- | --- | --- |
| `npm run dev` | backend | Start API with nodemon |
| `npm start` | backend | Start API |
| `node setup.js` | backend | Create initial admin |
| `node cleanup.js` | backend | Remove all non-admin data |
| `npm run dev` | frontend | Start Vite dev server |
| `npm run build` | frontend | Production build |
| `npm run lint` | frontend | ESLint |

---

## 🔒 Security Notes

- Passwords are hashed with **bcrypt** — never stored in plain text.
- All API routes (except login) require a **JWT**.
- `.env` files are **git-ignored** — never commit secrets.
- Use a strong, unique `JWT_SECRET` in production.

---

## 📄 License

ISC