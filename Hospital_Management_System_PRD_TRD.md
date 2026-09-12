# Hospital Management System (HMS) - PRD, TRD, & System Architecture

This document provides a detailed Product Requirement Document (PRD), Technical Requirement Document (TRD), and Architecture Explanation for a Hospital Management System (HMS).

---

## 1. Product Requirement Document (PRD)

### 1.1 Document Overview
This document specifies the operational, functional, and user-interface requirements for a high-availability Hospital Management System (HMS). The goal is to digitize hospital operations across outpatient, inpatient, laboratory, pharmacy, billing, and administrative workflows while ensuring compliance with healthcare standards (e.g., HIPAA, ABDM, HL7 FHIR).

---

### 1.2 Module-by-Module Functional Specifications

#### Module 1: Patient Registration & UHID Management
* **Overview:** Assigns a permanent Universal Health Identifier (UHID) to every patient, managing demographic, emergency contact, and historical visit logs.
* **Functional Requirements:**
  * **UHID Generation:** Algorithmic auto-generation (e.g., `HOSP-YYYY-XXXXXX`) upon registration to prevent duplicate records.
  * **Demographic Capture:** Name, Date of Birth, Gender, Blood Group, Contact Number, Address, Emergency Contacts, ID Proof (Government ID), and Insurance details.
  * **Biometric & Document Scan:** Support for capturing photo ID, biometric fingerprint/iris scan, and scanning physical documents (e.g., previous medical records).
  * **Patient Search & De-duplication:** Advanced fuzzy search algorithms (Soundex / Levenshtein Distance) on Name + Mobile Number + DoB to prevent duplicate profile creation.
  * **Patient Portal/Kiosk Integration:** Self-registration terminal support via web or mobile apps.

#### Module 2: OPD Management & Queue System
* **Overview:** Manages Outpatient Department appointments, doctor schedules, token generation, and real-time waiting room queues.
* **Functional Requirements:**
  * **Doctor Rostering & Scheduling:** Slot management (e.g., 10-min / 15-min slots), leave management, emergency slot overrides.
  * **Appointment Booking:** Walk-in token generation, online web/mobile booking, phone booking, follow-up scheduling.
  * **Queue Display System (QMS):** Real-time LED/TV dashboard displays showing current token numbers called per doctor room.
  * **Triage System:** Nurse triage screen to capture basic vitals (BP, SpO2, Pulse, Temp, Weight, Height, BMI) before the doctor consult.
  * **Consultation Workflow:** Real-time doctor dashboard with patient queue status (Waiting, In-Consultation, Completed, Skipped, Sent for Lab).

#### Module 3: IPD, Ward & Bed Management
* **Overview:** Handles Inpatient Department admissions, bed allocation, intra-hospital transfers, discharge planning, and bed status tracking.
* **Functional Requirements:**
  * **Admission Workflow:** Admission advice from OPD/Emergency, deposit collection, room type selection (General Ward, Semi-Private, ICU, NICU, Deluxe).
  * **Bed Matrix Dashboard:** Interactive floor-map visualization of bed availability (Occupied, Available, Cleaning in Progress, Reserved, Maintenance).
  * **Ward Transfers:** Process transfers between wards/ICUs with automated updates to billing tariff structures.
  * **Nursing Care & Vitals Charting:** Scheduled nursing tasks, medication administration records (MAR), hourly vitals tracking, fluid intake/output charts.
  * **Discharge Management:** Planned discharge, Medical Discharge Summary generation, Financial Clearance checks, Final Billing triggers.

#### Module 4: Electronic Medical Records (EMR/EHR)
* **Overview:** Core clinical documentation system capturing chief complaints, diagnosis, clinical notes, and historical data.
* **Functional Requirements:**
  * **Clinical Templates:** Specialty-specific structured forms (Cardiology, Pediatrics, Orthopedics, General Medicine).
  * **ICD-10 / ICD-11 & SNOMED-CT Coding:** Autocomplete search for standardized medical diagnosis and clinical terms.
  * **Clinical Decision Support System (CDSS):** Alerts for drug-drug interactions, drug-allergy interactions, duplicate therapy, and dosage bounds.
  * **Attachments & Media:** Support for uploading radiology scans (DICOM viewer integration), external PDF reports, and clinical photos.
  * **EHR Timeline View:** Unified chronological view of a patient’s historical visits, prescriptions, lab trends, and discharge summaries.

#### Module 5: e-Prescriptions & Pharmacy Management
* **Overview:** Connects clinical prescription outputs to internal pharmacy fulfillment, stock inventory updates, and billing.
* **Functional Requirements:**
  * **e-Prescription Creator:** Quick medication entry with frequency (e.g., 1-0-1), duration, dosage route, and food instructions.
  * **Pharmacy Fulfillment Queue:** Real-time sync of orders from EMR/OPD to the pharmacy POS dashboard.
  * **Batch & Expiry Management:** First-Expiry-First-Out (FEFO) dispensing logic, tracking Batch Numbers, Expiry Dates, and MRP.
  * **Return & Refund:** Workflow for patient medicine returns with automatic stock restoration and bill adjustment.
  * **OTC (Over-The-Counter) Sales:** Direct counter sales for non-registered walk-in customers.

#### Module 6: Laboratory Information System (LIS)
* **Overview:** Manages pathology and radiology test requisitions, sample tracking, analyzer interfacing, result entry, and verification.
* **Functional Requirements:**
  * **Test Ordering & Barcoding:** Automatic barcode generation for blood tubes/specimens upon order creation.
  * **Sample Collection & Tracking:** States: Sample Requested -> Collected -> Received in Lab -> Processing -> Verification -> Published.
  * **Machine Interfacing (ASTM/HL7):** Automated unidirectional and bidirectional communication with lab auto-analyzers.
  * **Result Entry & Verification:** Delta checks (comparing current result with previous result), critical value alerts to clinicians, multi-level doctor authorization/signature.
  * **Radiology (PACS Integration):** Integration with PACS via DICOM standard for direct viewing of X-Rays, MRIs, and CT Scans in EMR.

#### Module 7: Billing, Invoicing & Payment Gateway
* **Overview:** Central financial module managing service tariffs, point-of-sale invoicing, advance deposits, and payment processing.
* **Functional Requirements:**
  * **Dynamic Service Tariff Master:** Rate cards for services, procedures, consultations, bed charges based on ward category and patient plan.
  * **OPD & IPD Invoicing:** Itemized consolidated billing covering consultations, pharmacy, lab tests, room charges, and nursing care.
  * **Payment Options:** Cash, Credit/Debit Cards, UPI, Net Banking, Payment Gateways (Stripe, Razorpay).
  * **Advance & Deposit Tracking:** Hold security deposits for IPD, automatic debit against charges, alert on low deposit balance.
  * **Refunds & Discounts:** Auth-matrix protected discount application and refund voucher processing.

#### Module 8: Insurance & TPA Management
* **Overview:** Manages Third Party Administrators (TPA), government health scheme claims, cashless authorizations, and co-pay calculations.
* **Functional Requirements:**
  * **TPA Master & Policy Mapping:** Track coverage caps, exclusions, deductibles, co-pay percentages for each insurance carrier.
  * **Pre-Authorization Workflow:** Request, document upload, status tracking (Approved, Query Raised, Rejected, Settlement Pending).
  * **Claim Management:** Multi-tier claim batch submission, settlement reconciliation, write-offs, and denial tracking.
  * **Co-pay & Non-Payable Handling:** Automatic splitting of final IPD bill into Insurance Payable vs. Patient Payable components.

#### Module 9: Inventory & Stock Management
* **Overview:** Controls hospital supply chains including medicines, surgical consumables, reusables, and capital assets.
* **Functional Requirements:**
  * **Purchase Order Cycle:** Requisition creation -> Quotation evaluation -> Purchase Order (PO) -> Goods Receipt Note (GRN) -> Vendor Invoice.
  * **Multi-Store Management:** Main Central Store to Sub-stores (Ward Pharmacies, Operation Theatre, Lab) stock transfer workflow.
  * **Stock Alerts & Reorder Levels:** Minimum safety stock alerts, reorder point triggers, expiry warnings (30/60/90 days).
  * **Stock Auditing:** Periodic physical stock reconciliation, damage tracking, and adjustment entries.

#### Module 10: Role-Based Access Control (RBAC) & Audit Logs
* **Overview:** Ensures system security, user privilege isolation, and complete regulatory audit tracking.
* **Functional Requirements:**
  * **Role-Based Permissions:** Granular controls (e.g., Doctor, Nurse, Pharmacist, Lab Tech, Billing Clerk, Super Admin).
  * **Data Level Isolation:** Restrict patient records based on treating physician or active department admission.
  * **Immutable Audit Trail:** Log every CRUD (Create, Read, Update, Delete) action with User ID, Timestamp, IP Address, Pre-value, and Post-value.
  * **Session Controls:** Inactivity timeouts, concurrent login restrictions, multi-factor authentication (MFA) enforcement.

---

## 2. Technical Requirement Document (TRD)

### 2.1 System Architecture & Tech Stack

#### Recommended Architecture Pattern
* **Pattern:** Event-Driven Microservices Architecture (or Modular Monolith for smaller scale deployment).
* **API Gateway:** Kong / NGINX for rate limiting, authentication verification, and SSL termination.
* **Frontend:** React.js / Next.js with TypeScript, TailwindCSS for web dashboard; React Native / Flutter for mobile apps.
* **Backend Frameworks:** Node.js (NestJS) or Go / Python (FastAPI) for microservices.
* **Primary Database:** PostgreSQL (Relational data: Patients, Billing, Appointments, Inventory).
* **NoSQL Database:** MongoDB / Couchbase (Unstructured clinical notes, JSON EMR data).
* **Caching & Real-Time Queue:** Redis (Session state, real-time queue tokens, pub/sub notifications).
* **Message Broker:** RabbitMQ / Apache Kafka (Event-driven communication for LIS analyzer inputs, notification triggers).
* **Storage (Object Store):** AWS S3 / MinIO (DICOM images, PDF reports, uploaded documents).

---

### 2.2 Database Schema (Entity-Relationship Breakdown)

#### Key Database Entities Overview:
```
+------------------+         +--------------------+         +------------------+
|   users / roles  |         |      patients      |         |   doctors        |
+------------------+         +--------------------+         +------------------+
         |                            |                              |
         +----------------------------+------------------------------+
                                      |
                           +--------------------+
                           |    appointments    |
                           +--------------------+
                                      |
                           +--------------------+
                           |     encounters     |
                           +--------------------+
                                 /    |                                    /     |               +--------------------+  +---+---+  +--------------------+
          |    prescriptions   |  |  lis  |  |      invoices      |
          +--------------------+  +-------+  +--------------------+
```

#### SQL Table Schema (PostgreSQL DDL Reference)

```sql
-- 1. Users and RBAC
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    permissions JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT REFERENCES roles(id),
    department_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Patients & UHID
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uhid VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    blood_group VARCHAR(5),
    emergency_contact JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Appointments & Queue
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id),
    doctor_id UUID REFERENCES users(id),
    department_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    slot_time TIME NOT NULL,
    token_number INT NOT NULL,
    status VARCHAR(20) DEFAULT 'SCHEDULED', -- SCHEDULED, IN_QUEUE, IN_CONSULT, COMPLETED, CANCELLED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Clinical Encounters (EMR)
CREATE TABLE encounters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id),
    doctor_id UUID REFERENCES users(id),
    appointment_id UUID REFERENCES appointments(id),
    visit_type VARCHAR(10) CHECK (visit_type IN ('OPD', 'IPD', 'EMERGENCY')),
    vitals JSONB, -- {bp_systolic: 120, bp_diastolic: 80, pulse: 72, temp: 98.6, spo2: 99}
    chief_complaints TEXT,
    diagnosis_codes JSONB, -- Array of ICD-10 codes [{"code": "I10", "desc": "Essential Hypertension"}]
    clinical_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Prescriptions & Pharmacy
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encounter_id UUID REFERENCES encounters(id),
    patient_id UUID REFERENCES patients(id),
    doctor_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, DISPENSED, PARTIAL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prescription_items (
    id SERIAL PRIMARY KEY,
    prescription_id UUID REFERENCES prescriptions(id),
    item_id INT NOT NULL, -- FK to inventory_items
    dosage VARCHAR(50) NOT NULL,
    frequency VARCHAR(20) NOT NULL, -- e.g., '1-0-1'
    duration_days INT NOT NULL,
    instructions TEXT
);

-- 6. Lab Information System (LIS)
CREATE TABLE lab_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encounter_id UUID REFERENCES encounters(id),
    patient_id UUID REFERENCES patients(id),
    test_id INT NOT NULL,
    barcode VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'ORDERED', -- ORDERED, SAMPLE_COLLECTED, PROCESSING, COMPLETED
    result_data JSONB,
    verified_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Billing & Invoicing
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id),
    encounter_id UUID REFERENCES encounters(id),
    total_amount NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) DEFAULT 0.00,
    net_payable NUMERIC(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'UNPAID', -- UNPAID, PARTIAL, PAID, CANCELLED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id),
    payment_mode VARCHAR(20) NOT NULL, -- CASH, CARD, UPI, INSURANCE
    transaction_reference VARCHAR(100),
    amount_paid NUMERIC(12, 2) NOT NULL,
    payment_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Audit Logs
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID,
    action VARCHAR(50) NOT NULL, -- CREATE, READ, UPDATE, DELETE
    entity_name VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

### 2.3 System Integration Points & Protocols
1. **PACS / DICOM:** C-STORE and C-FIND protocols over TCP/IP or Web DICOM WADO-RS REST API.
2. **Lab Analyzers:** Serial RS232 / TCP connections using ASTM E1394 or HL7 v2.x messages (ORU^R01 for results).
3. **Payment Gateways:** Webhooks and REST APIs using HMAC-SHA256 signature verification.
4. **SMS / WhatsApp / Email Notifications:** Asynchronous event queue (RabbitMQ) handling third-party provider API calls (Twilio, SendGrid).

---

## 3. Detailed Operational Workflows & How Things Work

### Workflow 1: End-to-End OPD Patient Journey
```
[ Patient Registration ] ---> [ OPD Queue Token ] ---> [ Triage / Vitals Entry ]
                                                                 |
                                                                 v
[ Dispense Pharmacy ] <--- [ Write EMR / Lab Orders ] <--- [ Consultation ]
```
1. **Registration:** Patient arrives. Desk clerk searches patient database via phone number. If absent, a new record is generated, issuing a unique UHID.
2. **Token Generation:** Patient selects department/doctor. System checks available slots, calculates fee, collects payment, generates an invoice, and outputs a sequential Queue Token Number.
3. **Queue Notification:** OPD Queue Manager publishes token update via Redis Pub/Sub to the visual display monitor in the waiting hall.
4. **Nurse Triage:** Nurse calls patient, inputs Vitals (`bp`, `spo2`, `pulse`) via the Triage interface. Vitals attach to the active Encounter ID.
5. **Doctor Consult:** Doctor opens Encounter view. EMR presents vitals, patient medical history, and past visits.
6. **Prescription & Order Creation:** Doctor inputs complaints, selects standardized ICD-10 diagnosis, prescribes drugs, and requests pathology tests. Standardized order objects emit to Kafka/RabbitMQ events: `ORDER_CREATED_PHARMACY`, `ORDER_CREATED_LAB`.

---

### Workflow 2: LIS Automated Sample Processing Pipeline
```
[ Order Triggered ] ---> [ Barcode Generated ] ---> [ Sample Collection ]
                                                            |
                                                            v
[ Auto-Publish ] <--- [ Pathologist Signoff ] <--- [ LIS Machine Processing ]
```
1. **Barcode Generation:** Ordering triggers a barcode creation containing `{patient_id, order_id, test_type}`.
2. **Collection:** Phlebotomist scans specimen vial, accepts specimen, updates status to `SAMPLE_COLLECTED`.
3. **Machine Processing:** Lab analyzer reads barcode, performs test, sends HL7/ASTM message via TCP to LIS Middleware.
4. **Data Ingestion:** LIS Engine parses incoming HL7 payload (`OBX` segments), matches `order_id`, inserts values into `lab_orders.result_data`.
5. **Verification & Delta Checking:** Automated flag raises if values exceed normal boundaries or deviate >30% from patient's previous baseline. Pathologist reviews, approves, and signs digital report. System updates status to `COMPLETED` and alerts patient via SMS link.

---

### Workflow 3: IPD Admission, Bed Tracking, and Discharge
```
[ Emergency / OPD Referral ] ---> [ Advance Deposit ] ---> [ Bed Allocation ]
                                                                   |
                                                                   v
[ Discharge & Settlement ] <--- [ Daily Billing Posting ] <--- [ Ward Care / MAR ]
```
1. **Admission Request:** Doctor issues IPD Admission Order.
2. **Deposit & Bed Selection:** Billing clerk reviews live Bed Matrix visual grid, selects available Bed, collects initial security deposit, and locks bed status (`OCCUPIED`).
3. **Daily Charges Cron:** Background scheduled task runs daily at midnight (`00:00`), generating recurring bill entries for Room Rent, Nursing Care, and Equipment usage.
4. **In-Patient Care:** Nurses mark Drug Administration on MAR interface; pharmacy automatically auto-deducts ward inventory.
5. **Discharge Summary & Clearance:** Doctor prepares EMR Discharge Summary. System verifies all pending lab reports, pharmacy items, and daily room charges. Final ledger calculates `Total Charges - Advance Deposit - Insurance Approved Amount = Net Due`.
6. **Settlement & Bed Release:** Upon balance settlement, invoice status converts to `PAID`, bed status flips to `CLEANING_REQUIRED`, notifying housekeeping staff. Once clean, bed status reverts to `AVAILABLE`.

---

## 4. Non-Functional & Security Requirements

### 4.1 Security & Compliance
* **HIPAA Compliance:** Encrypt Data-at-Rest using AES-256 and Data-in-Transit using TLS 1.3.
* **Audit Logging:** Every database write/read of Sensitive Health Information (PHI) logs immutable events with pre/post execution payloads.
* **Role-Based Privilege (RBAC):** Tight isolation—Pharmacist cannot view clinical EMR notes; Lab Tech cannot alter billing tariffs; Doctors view assigned patient records only.

### 4.2 High Availability & Disaster Recovery
* **Availability Target:** 99.95% uptime.
* **Redundancy:** Multi-AZ DB deployment with Primary-Secondary synchronous replication.
* **Data Backups:** Point-in-time recovery (PITR) enabled on database with hourly incremental snapshots stored offsite.

---
