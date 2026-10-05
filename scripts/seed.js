import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Role from "../src/models/Role.js";
import User from "../src/models/User.js";
import Category from "../src/models/Category.js";
import Brand from "../src/models/Brand.js";
import Product from "../src/models/Product.js";
import ProductVariant from "../src/models/ProductVariant.js";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is required");

await mongoose.connect(uri);

const adminRole = await Role.findOne({ slug: "admin" });
if (!adminRole) throw new Error("Run npm run seed:rbac before npm run seed");

const adminEmail = String(process.env.SEED_ADMIN_EMAIL || "admin@example.com").toLowerCase();
const adminPassword = process.env.SEED_ADMIN_PASSWORD;
if (adminPassword) {
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await User.updateOne(
    { email: adminEmail },
    {
      $set: {
        name: process.env.SEED_ADMIN_NAME || "Store Administrator",
        role: adminRole._id,
        status: "active",
        emailVerifiedAt: new Date(),
        passwordHash
      }
    },
    { upsert: true }
  );
  console.log(`Seeded admin: ${adminEmail}`);
} else {
  console.log("SEED_ADMIN_PASSWORD not set; skipped admin user creation.");
}

const category = await Category.findOneAndUpdate(
  { slug: "studio-essentials" },
  {
    $setOnInsert: {
      name: "Studio Essentials",
      slug: "studio-essentials",
      description: "Design-led everyday objects.",
      featured: true,
      trending: true,
      sortOrder: 1
    }
  },
  { upsert: true, new: true }
);

const brand = await Brand.findOneAndUpdate(
  { slug: "aurelia-studio" },
  {
    $setOnInsert: {
      name: "Aurelia Studio",
      slug: "aurelia-studio",
      description: "House collection for development and QA.",
      featured: true
    }
  },
  { upsert: true, new: true }
);

const product = await Product.findOneAndUpdate(
  { slug: "studio-carryall" },
  {
    $setOnInsert: {
      name: "Studio Carryall",
      slug: "studio-carryall",
      sku: "AUR-CARRY-001",
      shortDescription: "A structured everyday carryall.",
      description: "Seed product used to validate catalog, cart, checkout, reviews, search and admin flows.",
      categories: [category._id],
      brand: brand._id,
      tags: ["studio", "carry", "everyday"],
      specifications: [
        { key: "Material", value: "Recycled technical weave" },
        { key: "Care", value: "Spot clean" }
      ],
      attributes: { Color: ["Graphite", "Sand"], Size: ["Standard"] },
      basePrice: 129,
      compareAtPrice: 149,
      currency: "USD",
      stock: 30,
      lowStockThreshold: 5,
      status: "published",
      featured: true,
      trending: true,
      shippingInfo: "Ships in 1–2 business days.",
      returnInfo: "Eligible for returns within the configured store return window.",
      seo: {
        title: "Studio Carryall",
        description: "A structured design-led everyday carryall."
      }
    }
  },
  { upsert: true, new: true }
);

await ProductVariant.updateOne(
  { sku: "AUR-CARRY-001-GRA" },
  {
    $setOnInsert: {
      product: product._id,
      sku: "AUR-CARRY-001-GRA",
      name: "Graphite",
      options: { Color: "Graphite", Size: "Standard" },
      price: 129,
      stock: 15,
      active: true
    }
  },
  { upsert: true }
);

await ProductVariant.updateOne(
  { sku: "AUR-CARRY-001-SND" },
  {
    $setOnInsert: {
      product: product._id,
      sku: "AUR-CARRY-001-SND",
      name: "Sand",
      options: { Color: "Sand", Size: "Standard" },
      price: 129,
      stock: 15,
      active: true
    }
  },
  { upsert: true }
);

await mongoose.disconnect();
console.log("Catalog seed complete.");
