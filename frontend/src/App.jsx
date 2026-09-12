import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login/Login.jsx'
import AppLayout from './components/AppLayout.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import Patients from './pages/Patients/Patients.jsx'
import OPD from './pages/OPD/OPD.jsx'
import Records from './pages/Records/Records.jsx'
import Pharmacy from './pages/Pharmacy/Pharmacy.jsx'
import Lab from './pages/Lab/Lab.jsx'
import Billing from './pages/Billing/Billing.jsx'
import Wards from './pages/Wards/Wards.jsx'
import Inventory from './pages/Inventory/Inventory.jsx'
import Insurance from './pages/Insurance/Insurance.jsx'
import Admin from './pages/Admin/Admin.jsx'
import './styles/components.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/opd" element={<OPD />} />
          <Route path="/records" element={<Records />} />
          <Route path="/pharmacy" element={<Pharmacy />} />
          <Route path="/lab" element={<Lab />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/wards" element={<Wards />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/insurance" element={<Insurance />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
