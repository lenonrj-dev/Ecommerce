import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/mongodb.js";
import Product from "../models/productModel.js";
import { buildProductSlug } from "../utils/productSlug.js";

const queryMissingSlug = {
  $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }],
};

const run = async () => {
  await connectDB();

  const products = await Product.find(queryMissingSlug);
  let updated = 0;

  for (const product of products) {
    const slug = buildProductSlug(product.name || "", product._id);
    if (!slug || product.slug === slug) continue;
    product.slug = slug;
    await product.save();
    updated += 1;
  }

  console.log(`[backfill] produtos atualizados: ${updated}`);
};

run()
  .catch((err) => {
    console.error("[backfill] erro ao atualizar slugs:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
