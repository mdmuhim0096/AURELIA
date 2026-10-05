import mongoose from "mongoose";
import Permission from "../src/models/Permission.js";
import Role from "../src/models/Role.js";
import { PERMISSIONS } from "../src/lib/auth/permissions.js";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is required");

const keys = Object.values(PERMISSIONS);
const roleMap = {
  admin: keys,
  customer: []
};

await mongoose.connect(uri);
for (const key of keys) {
  await Permission.updateOne(
    { key },
    { $setOnInsert: { key, description: key.replaceAll(".", " ") } },
    { upsert: true }
  );
}
const permissions = await Permission.find({ key: { $in: keys } });
const byKey = Object.fromEntries(permissions.map((permission) => [permission.key, permission._id]));

for (const [slug, roleKeys] of Object.entries(roleMap)) {
  await Role.updateOne(
    { slug },
    {
      $set: {
        name: slug === "admin" ? "Admin" : "Customer",
        permissions: roleKeys.map((key) => byKey[key]).filter(Boolean),
        isSystem: true
      }
    },
    { upsert: true, runValidators: true }
  );
}

await mongoose.disconnect();
console.log(`RBAC seed complete: ${keys.length} permissions, 2 roles`);
