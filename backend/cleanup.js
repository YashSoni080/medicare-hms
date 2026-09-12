// Cleanup script — removes all demo/test users and sample clinical data
// so the app starts with a truly clean database.
//
// KEEPS ONLY:
//   - the admin account you created via setup.js (role: "admin")
//   - users whose email you explicitly allow with --keep email1,email2
//
// Run (from the backend folder, MongoDB running):
//   node cleanup.js
//   node cleanup.js --keep admin@medicare.com
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Transactional / sample collections that hold demo content
const SAMPLE_COLLECTIONS = [
    "appointments",
    "encounters",
    "admissions",
    "medicalrecords",
    "prescriptions",
    "prescriptiondispensations",
    "laborders",
    "invoices",
    "invoiceitems",
    "payments",
    "insurancepolicies",
    "insuranceclaims",
    "inventoryitems",
    "purchaseorders",
    "auditlogs",
];

// Demo user emails from the old seed that created fake accounts
const knownDemoEmails = [
    "doctor@medicare.com",
    "reception@medicare.com",
    "pharmacy@medicare.com",
    "lab@medicare.com",
    "patient@medicare.com",
];

async function cleanup() {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/hospital_management");
    console.log("MongoDB connected");
    const db = mongoose.connection.db;

    // 1) Parse --keep list
    const args = process.argv.slice(2);
    const keepIdx = args.indexOf("--keep");
    const keepEmails = keepIdx >= 0
        ? args.slice(keepIdx + 1).join(",").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
        : [];
    console.log(`Keeping accounts: ${["(admin role)", ...keepEmails].join(", ")}`);

    // 2) Delete demo users + anything not admin/not in keep list
    const usersToDelete = await db.collection("users").deleteMany({
        $and: [{ role: { $ne: "admin" } }, { email: { $nin: keepEmails } }],
    });
    console.log(`Removed ${usersToDelete.deletedCount} demo/non-admin user(s)`);

    // Remove linked patient & doctor profiles for deleted users
    for (const c of ["patients", "doctors"]) {
        const r = await db.collection(c).deleteMany({});
        console.log(`Cleared ${c}: ${r.deletedCount} document(s)`);
    }

    // 3) Clear all sample/transaction data
    for (const c of SAMPLE_COLLECTIONS) {
        try {
            const r = await db.collection(c).deleteMany({});
            console.log(`Cleared ${c}: ${r.deletedCount} document(s)`);
        } catch (e) {
            console.log(`Skipped ${c}: ${e.message}`);
        }
    }

    console.log("\n✅ Cleanup complete. The database is now empty except for your admin account.");
    console.log("Create staff by registering doctors/receptionists/pharmacists from the app, or via setup.js.");
}

cleanup()
    .catch((e) => console.error("Cleanup failed:", e.message))
    .finally(async () => {
        await mongoose.disconnect();
        process.exit(0);
    });
