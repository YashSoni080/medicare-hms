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
import Emergency from './pages/Emergency/Emergency.jsx'
import Telemedicine from './pages/Telemedicine/Telemedicine.jsx'
import OT from './pages/OT/OT.jsx'
import Nursing from './pages/Nursing/Nursing.jsx'
import Diet from './pages/Diet/Diet.jsx'
import BloodBank from './pages/BloodBank/BloodBank.jsx'
import Radiology from './pages/Radiology/Radiology.jsx'
import Housekeeping from './pages/Housekeeping/Housekeeping.jsx'
import Ambulance from './pages/Ambulance/Ambulance.jsx'
import Staff from './pages/Staff/Staff.jsx'
import Reports from './pages/Reports/Reports.jsx'
import ServiceCharges from './pages/ServiceCharges/ServiceCharges.jsx'
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
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/telemedicine" element={<Telemedicine />} />
          <Route path="/records" element={<Records />} />
          <Route path="/pharmacy" element={<Pharmacy />} />
          <Route path="/lab" element={<Lab />} />
          <Route path="/blood-bank" element={<BloodBank />} />
          <Route path="/radiology" element={<Radiology />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/wards" element={<Wards />} />
          <Route path="/ot" element={<OT />} />
          <Route path="/nursing" element={<Nursing />} />
          <Route path="/diet" element={<Diet />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/housekeeping" element={<Housekeeping />} />
          <Route path="/ambulance" element={<Ambulance />} />
          <Route path="/insurance" element={<Insurance />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/service-charges" element={<ServiceCharges />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
