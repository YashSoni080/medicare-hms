/**
 * Migrate local MongoDB data to MongoDB Atlas.
 *
 * Usage:
 *   ATLAS_URI="mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/hospital_management" \
 *   node scripts/migrate-to-atlas.js
 *
 * Copies every collection that has documents from the LOCAL database
 * (mongodb://localhost:27017/hospital_management) into the Atlas database
 * named in ATLAS_URI. Existing documents in Atlas are left untouched
 * (insertMany with ordered:false skips duplicates on _id).
 */
import mongoose from "mongoose";

const LOCAL_URI = process.env.LOCAL_URI || "mongodb://localhost:27017/hospital_management";
const ATLAS_URI = process.env.ATLAS_URI;

if (!ATLAS_URI) {
    console.error("ERROR: Set ATLAS_URI to your MongoDB Atlas connection string.");
    console.error('Example: ATLAS_URI="mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/hospital_management" node scripts/migrate-to-atlas.js');
    process.exit(1);
}

const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();

console.log("Connected to local DB:", localConn.name);
console.log("Connected to Atlas DB:", atlasConn.name);

const localDb = localConn.db;
const atlasDb = atlasConn.db;

const collections = await localDb.listCollections().toArray();
let totalCopied = 0;

for (const { name } of collections) {
    const docs = await localDb.collection(name).find({}).toArray();
    if (docs.length === 0) continue;

    const result = await atlasDb.collection(name).insertMany(docs, { ordered: false });
    const inserted = Object.keys(result.insertedIds).length;
    totalCopied += inserted;
    console.log(`  ${name}: ${inserted}/${docs.length} docs copied`);
}

console.log(`\nDone. ${totalCopied} documents migrated to Atlas.`);
await localConn.close();
await atlasConn.close();