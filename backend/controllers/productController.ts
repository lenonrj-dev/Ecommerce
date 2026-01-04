// @ts-nocheck
// controllers/productController.js
import Product from "../models/productModel.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import mongoose from "mongoose";
import { buildProductSlug, extractObjectIdFromSlug } from "../utils/productSlug.js";

/* ------------------------------------------------------------------ */
/*                                Utils                                */
/* ------------------------------------------------------------------ */

const parseJSON = (val, fallback) => {
  try {
    return typeof val === "string" ? JSON.parse(val) : val;
  } catch {
    return fallback;
  }
};

const isHttpUrl = (u) => /^https?:\/\//i.test(String(u || "").trim());

/** Normaliza e filtra objeto de links por tamanho. Mantém apenas http/https.
 *  Se `allowedSizes` for informado, mantém só chaves presentes nesta lista. */
const sanitizeYampiLinks = (rawLinks, allowedSizes = []) => {
  const inObj = parseJSON(rawLinks, {}) || {};
  const allow =
    Array.isArray(allowedSizes) && allowedSizes.length
      ? allowedSizes.map((s) => String(s).trim().toUpperCase())
      : null;

  const out = {};
  for (const [k, v] of Object.entries(inObj)) {
    const size = String(k || "").trim().toUpperCase();
    const url = String(v || "").trim();
    if (!size || !isHttpUrl(url)) continue;
    if (allow && !allow.includes(size)) continue;
    out[size] = url;
  }
  return out;
};

/** Sobe 1 arquivo (diskStorage .path ou memoryStorage .buffer) para a Cloudinary */
const uploadOneToCloudinary = async (
  file,
  folder = process.env.CLOUDINARY_FOLDER || "products"
) => {
  if (!file) return null;

  // diskStorage (tem .path)
  if (file.path) {
    const res = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: "image",
      overwrite: true,
    });
    try {
      await fs.unlink(file.path);
    } catch {}
    return res?.secure_url || null;
  }

  // memoryStorage (tem .buffer)
  if (file.buffer) {
    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder, resource_type: "image", overwrite: true },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(file.buffer);
      });
    const res = await streamUpload();
    return res?.secure_url || null;
  }

  return null;
};

/** Lê image1..image4 do req.files, faz upload e devolve secure_urls na ordem */
const uploadImagesFromRequest = async (req) => {
  const filesObj = req.files || {};
  const fields = ["image1", "image2", "image3", "image4"];
  const urls = [];

  for (const f of fields) {
    const file = filesObj?.[f]?.[0];
    if (!file) continue;
    const url = await uploadOneToCloudinary(file);
    if (url) urls.push(url);
  }

  return urls;
};

const parseMeasurements = (raw) => {
  const arr = parseJSON(raw, raw);
  if (!Array.isArray(arr)) return [];
  return arr
    .map((m) => {
      if (!m) return null;
      if (typeof m === "string") {
        const [label, ...rest] = m.split(":");
        const value = rest.join(":");
        return {
          label: (label || "").trim(),
          value: (value || "").trim(),
        };
      }
      return {
        label: (m.label || "").trim(),
        value: (m.value || "").trim(),
      };
    })
    .filter((m) => m?.label || m?.value);
};

const parseCombineWith = (raw) => {
  const arr = parseJSON(raw, raw);
  if (!Array.isArray(arr)) return [];
  return arr
    .map((id) => String(id || "").trim())
    .filter((id) => id && mongoose.Types.ObjectId.isValid(id));
};

/* ------------------------------------------------------------------ */
/*                               Handlers                              */
/* ------------------------------------------------------------------ */

/** POST /api/product/add */
export const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, subCategory, yampiLink } =
      req.body;

    const basePrice = Number(price) || 0;

    // tamanhos
    const sizesRaw = Array.isArray(req.body.sizes)
      ? req.body.sizes
      : parseJSON(req.body.sizes || "[]", []);
    const normSizes = (sizesRaw.length ? sizesRaw : ["P", "M", "G"]).map((s) =>
      String(s).trim().toUpperCase()
    );

    const bestseller =
      req.body.bestseller === true || req.body.bestseller === "true";

    // imagens -> Cloudinary
    const images = await uploadImagesFromRequest(req); // secure_url[]

    // variantes iniciais (SEM link; seu schema não tem link na variant)
    const initialVariants = normSizes.map((s) => ({
      size: s,
      sku: "",
      stock: 0,
      isActive: true,
    }));

    // NOVO: links por tamanho vindos do form
    const yampiLinks = sanitizeYampiLinks(req.body.yampiLinks, normSizes);

    // ----------------- PIX & Parcelamento -----------------
    const rawPixPrice = req.body.pixPrice;
    let pixPrice = Number(rawPixPrice);
    if (!Number.isFinite(pixPrice) || pixPrice < 0) {
      // fallback: mesmo valor do preço cheio
      pixPrice = basePrice;
    }

    // installments: pode vir como objeto ou campos separados
    let installmentsQuantity = Number(req.body.installmentsQuantity);
    let installmentsValue = Number(req.body.installmentsValue);

    if (!Number.isFinite(installmentsQuantity) || installmentsQuantity < 1) {
      installmentsQuantity = 10; // ex.: 10x padrão
    }

    if (!Number.isFinite(installmentsValue) || installmentsValue <= 0) {
      installmentsValue =
        installmentsQuantity > 0 ? basePrice / installmentsQuantity : basePrice;
    }

    // ----------------- Avaliações -----------------
    let ratingAverage = Number(req.body.ratingAverage);
    if (!Number.isFinite(ratingAverage) || ratingAverage < 0) ratingAverage = 0;
    if (ratingAverage > 5) ratingAverage = 5;

    let ratingCount = Number(req.body.ratingCount);
    if (!Number.isFinite(ratingCount) || ratingCount < 0) ratingCount = 0;

    const measurements = parseMeasurements(req.body.measurements || []);
    const availabilityNote = typeof req.body.availabilityNote === "string"
      ? req.body.availabilityNote
      : "";
    const combineWith = parseCombineWith(req.body.combineWith || []);

    const doc = await Product.create({
      name,
      description: description || "",
      price: basePrice,
      category: category || "",
      subCategory: subCategory || "",
      sizes: normSizes,
      variants: initialVariants,
      image: images,
      bestseller,
      yampiLink: (yampiLink || "").trim(), // legado único
      yampiLinks, // mapa tamanho -> URL

      // novos campos de pricing/UX
      pixPrice,
      installments: {
        quantity: installmentsQuantity,
        value: installmentsValue,
      },
      ratingAverage,
      ratingCount,
      measurements,
      availabilityNote,
      combineWith,
    });

    const slug = buildProductSlug(doc.name, doc._id);
    if (slug && doc.slug !== slug) {
      doc.slug = slug;
      await doc.save();
    }

    res.status(201).json({ success: true, product: doc });
  } catch (e) {
    console.error("addProduct error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/** PUT /api/product/update/:id  (básicos + imagens + yampiLinks + pricing/rating) */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const raw = { ...req.body };
    delete raw.id;
    delete raw._id;

    const doc = await Product.findById(id);
    const originalName = doc?.name;
    if (!doc)
      return res
        .status(404)
        .json({ success: false, message: "Produto não encontrado" });

    // ----- básicos -----
    if (typeof raw.name === "string") doc.name = raw.name;
    if (typeof raw.description === "string") doc.description = raw.description;
    if (typeof raw.category === "string") doc.category = raw.category;
    if (typeof raw.subCategory === "string") doc.subCategory = raw.subCategory;

    if (typeof raw.price !== "undefined") {
      const n = Number(raw.price);
      if (!Number.isNaN(n)) doc.price = n;
    }

    if (typeof raw.bestseller !== "undefined") {
      doc.bestseller = raw.bestseller === true || raw.bestseller === "true";
    }

    if (typeof raw.yampiLink === "string") {
      doc.yampiLink = raw.yampiLink.trim();
    }

    let sizesChanged = false;
    if (typeof raw.sizes !== "undefined") {
      const nextSizes = Array.isArray(raw.sizes)
        ? raw.sizes
        : parseJSON(raw.sizes || "[]", []);
      if (Array.isArray(nextSizes)) {
        doc.sizes = nextSizes.map((s) => String(s).trim().toUpperCase());
        sizesChanged = true;
      }
    }

    // ----- NOVO: atualizar yampiLinks por tamanho -----
    if (typeof raw.yampiLinks !== "undefined") {
      const cleaned = sanitizeYampiLinks(raw.yampiLinks, doc.sizes || []);
      // Map em Mongoose aceita objeto plano; marque modificação para garantir persistência
      doc.set("yampiLinks", cleaned);
      doc.markModified("yampiLinks");
    } else if (sizesChanged && doc.yampiLinks) {
      // se tamanhos mudaram e não veio mapa novo, remova links de tamanhos que saíram
      const allow = new Set((doc.sizes || []).map((s) => String(s).toUpperCase()));
      const current = Object.fromEntries(
        Array.from(doc.yampiLinks || []).map(([k, v]) => [String(k).toUpperCase(), v])
      );
      const filtered = {};
      for (const [k, v] of Object.entries(current)) {
        if (allow.has(k) && isHttpUrl(v)) filtered[k] = v;
      }
      doc.set("yampiLinks", filtered);
      doc.markModified("yampiLinks");
    }

    // ----- PIX -----
    if (typeof raw.pixPrice !== "undefined") {
      const n = Number(raw.pixPrice);
      if (!Number.isNaN(n) && n >= 0) {
        doc.pixPrice = n;
      }
    }

    // ----- Parcelamento -----
    if (typeof raw.installments !== "undefined") {
      const inst = parseJSON(raw.installments, raw.installments) || {};
      const q = Number(inst.quantity);
      const v = Number(inst.value);

      const quantity = Number.isFinite(q) && q > 0 ? q : doc.installments?.quantity || 1;
      const value =
        Number.isFinite(v) && v >= 0
          ? v
          : doc.installments?.value || (doc.price || 0) / quantity;

      doc.installments = { quantity, value };
    } else if (
      typeof raw.installmentsQuantity !== "undefined" ||
      typeof raw.installmentsValue !== "undefined"
    ) {
      const currentQty = doc.installments?.quantity || 1;
      const basePrice = doc.price || 0;

      let quantity = Number(
        raw.installmentsQuantity !== undefined
          ? raw.installmentsQuantity
          : currentQty
      );
      if (!Number.isFinite(quantity) || quantity < 1) quantity = currentQty || 1;

      let value = Number(
        raw.installmentsValue !== undefined
          ? raw.installmentsValue
          : basePrice / quantity
      );
      if (!Number.isFinite(value) || value < 0) value = basePrice / quantity;

      doc.installments = { quantity, value };
    }

    // ----- Avaliações -----
    if (typeof raw.ratingAverage !== "undefined") {
      let n = Number(raw.ratingAverage);
      if (!Number.isFinite(n) || n < 0) n = 0;
      if (n > 5) n = 5;
      doc.ratingAverage = n;
    }

    if (typeof raw.ratingCount !== "undefined") {
      let n = Number(raw.ratingCount);
      if (!Number.isFinite(n) || n < 0) n = 0;
      doc.ratingCount = n;
    }

    // ----- Medidas / disponibilidade / combineWith -----
    if (typeof raw.measurements !== "undefined") {
      doc.measurements = parseMeasurements(raw.measurements);
    }
    if (typeof raw.availabilityNote === "string") {
      doc.availabilityNote = raw.availabilityNote;
    }
    if (typeof raw.combineWith !== "undefined") {
      doc.combineWith = parseCombineWith(raw.combineWith);
    }

    if (!doc.slug || (typeof raw.name === "string" && doc.name !== originalName)) {
      doc.slug = buildProductSlug(doc.name, doc._id);
    }

    // ----- imagens (keep + novos uploads, ordem, dedup, max 4) -----
    const keepImages =
      typeof raw.keepImages !== "undefined"
        ? Array.isArray(raw.keepImages)
          ? raw.keepImages
          : parseJSON(raw.keepImages, [])
        : null;

    const uploaded = await uploadImagesFromRequest(req); // secure_url[]

    const willTouchImages = keepImages !== null || uploaded.length > 0;
    if (willTouchImages) {
      const MAX = 4;

      const base = Array.isArray(keepImages)
        ? keepImages.filter(isHttpUrl)
        : Array.isArray(doc.image)
        ? doc.image.filter(isHttpUrl)
        : [];

      const combined = [...base, ...uploaded];

      const seen = new Set();
      const finalList = [];
      for (const url of combined) {
        const u = String(url || "").trim();
        if (!u || seen.has(u)) continue;
        seen.add(u);
        finalList.push(u);
        if (finalList.length >= MAX) break;
      }
      doc.image = finalList; // pode ser []
    }

    await doc.save();
    return res.json({ success: true, product: doc });
  } catch (e) {
    console.error("updateProduct error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/** GET /api/product/resolve/:slugOrId */
export const resolveProduct = async (req, res) => {
  try {
    const { slugOrId } = req.params || {};
    if (!slugOrId) {
      return res
        .status(400)
        .json({ success: false, message: "Parâmetro inválido." });
    }

    const candidateId = extractObjectIdFromSlug(slugOrId);
    let product = null;

    if (candidateId && mongoose.Types.ObjectId.isValid(candidateId)) {
      product = await Product.findById(candidateId).lean();
    }

    if (!product) {
      product = await Product.findOne({ slug: slugOrId }).lean();
    }

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Produto não encontrado" });
    }

    const canonicalSlug =
      product.slug || buildProductSlug(product.name || "", product._id);

    return res.json({
      success: true,
      product: { ...product, slug: canonicalSlug },
      canonicalPath: canonicalSlug
        ? `/product/${canonicalSlug}`
        : `/product/${product._id}`,
    });
  } catch (e) {
    console.error("resolveProduct error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/** GET /api/product/list (visiveis, nao deletados) */
export const listProducts = async (_req, res) => {
  try {
    const products = await Product.find({
      visible: { $ne: false },
      deletedAt: { $eq: null },
    })
      .sort({ createdAt: -1 })
      .lean();

    // Garante que todos os produtos tenham pixPrice/parcelas/rating consistentes
    const mapped = products.map((p) => {
      const basePrice = Number(p.price) || 0;

      let pixPrice = Number(p.pixPrice);
      if (!Number.isFinite(pixPrice) || pixPrice < 0) {
        pixPrice = basePrice;
      }

      const q = Number(p.installments?.quantity);
      const v = Number(p.installments?.value);
      const quantity = Number.isFinite(q) && q > 0 ? q : 10;
      const value =
        Number.isFinite(v) && v > 0 ? v : quantity > 0 ? basePrice / quantity : basePrice;

      const ratingAverage =
        typeof p.ratingAverage === "number" && Number.isFinite(p.ratingAverage)
          ? Math.min(Math.max(p.ratingAverage, 0), 5)
          : 0;
      const ratingCount =
        typeof p.ratingCount === "number" && Number.isFinite(p.ratingCount)
          ? Math.max(p.ratingCount, 0)
          : 0;

      return {
        ...p,
        pixPrice,
        installments: { quantity, value },
        ratingAverage,
        ratingCount,
      };
    });

    res.json({ success: true, products: mapped });
  } catch (e) {
    console.error("listProducts error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/** POST /api/product/remove  (soft delete) */
export const removeProduct = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Campo 'id' é obrigatório." });

    const doc = await Product.findByIdAndUpdate(
      id,
      { visible: false, deletedAt: new Date() },
      { new: true }
    );

    if (!doc)
      return res
        .status(404)
        .json({ success: false, message: "Produto não encontrado" });

    res.json({
      success: true,
      message: "Produto removido com sucesso.",
      product: doc,
    });
  } catch (e) {
    console.error("removeProduct error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/** PATCH /api/product/toggle-visibility */
export const toggleVisibility = async (req, res) => {
  try {
    const { id, visible } = req.body;
    if (!id || typeof visible === "undefined") {
      return res.status(400).json({
        success: false,
        message: "Campos 'id' e 'visible' são obrigatórios.",
      });
    }

    const doc = await Product.findByIdAndUpdate(
      id,
      { visible: !!visible, ...(visible ? { deletedAt: null } : {}) },
      { new: true }
    );

    if (!doc)
      return res
        .status(404)
        .json({ success: false, message: "Produto não encontrado" });

    res.json({ success: true, product: doc });
  } catch (e) {
    console.error("toggleVisibility error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/* ------------------------------------------------------------------ */
/*                     Variants (size/SKU/stock/isActive)             */
/*                 (SEM link; links ficam em yampiLinks)              */
/* ------------------------------------------------------------------ */

/** PUT /api/product/:productId/variant/upsert */
export const upsertVariant = async (req, res) => {
  try {
    const { productId } = req.params;
    const { originalSize, size, sku, stock, isActive } = req.body;

    const product = await Product.findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Produto não encontrado" });

    const newSize = String(size || originalSize || "").trim().toUpperCase();
    if (!newSize)
      return res
        .status(400)
        .json({ success: false, message: "Campo 'size' é obrigatório." });

    const idx = product.variants.findIndex((v) =>
      v.size.toUpperCase() ===
      (originalSize ? String(originalSize).toUpperCase() : newSize)
    );

    if (idx >= 0) {
      product.variants[idx].size = newSize;
      if (typeof sku === "string") product.variants[idx].sku = sku.trim();
      if (typeof stock !== "undefined") {
        const n = Number(stock);
        if (Number.isFinite(n) && n >= 0) product.variants[idx].stock = n;
      }
      if (typeof isActive !== "undefined")
        product.variants[idx].isActive = !!isActive;
    } else {
      product.variants.push({
        size: newSize,
        sku: (sku || "").trim(),
        stock: Number.isFinite(Number(stock)) ? Number(stock) : 0,
        isActive: typeof isActive === "undefined" ? true : !!isActive,
      });
    }

    // mantém lista "sizes" coerente
    const setSizes = new Set(
      (product.sizes || []).map((s) => String(s).toUpperCase())
    );
    setSizes.add(newSize);
    product.sizes = Array.from(setSizes);

    await product.save();
    res.json({ success: true, product });
  } catch (e) {
    console.error("upsertVariant error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/** PATCH /api/product/:productId/variant/toggle */
export const toggleVariant = async (req, res) => {
  try {
    const { productId } = req.params;
    const { size, isActive } = req.body;

    const product = await Product.findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Produto não encontrado" });

    const idx = product.variants.findIndex(
      (v) => v.size.toUpperCase() === String(size).toUpperCase()
    );
    if (idx < 0)
      return res
        .status(404)
        .json({ success: false, message: "Tamanho não encontrado" });

    product.variants[idx].isActive = !!isActive;
    await product.save();

    res.json({ success: true, product });
  } catch (e) {
    console.error("toggleVariant error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/** PATCH /api/product/:productId/variant/stock */
export const adjustVariantStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { size, qty, reason } = req.body;

    const delta = Number(qty);
    if (!Number.isFinite(delta) || delta === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Ajuste inválido." });
    }

    const product = await Product.findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Produto não encontrado" });

    const idx = product.variants.findIndex(
      (v) => v.size.toUpperCase() === String(size).toUpperCase()
    );
    if (idx < 0)
      return res
        .status(404)
        .json({ success: false, message: "Tamanho não encontrado" });

    const next = (product.variants[idx].stock || 0) + delta;
    if (next < 0)
      return res.status(400).json({
        success: false,
        message: "Estoque não pode ficar negativo.",
      });

    product.variants[idx].stock = next;
    await product.save();

    console.log("[stock adjust]", { productId, size, delta, reason });

    res.json({ success: true, product });
  } catch (e) {
    console.error("adjustVariantStock error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/** DELETE /api/product/:productId/variant */
export const deleteVariant = async (req, res) => {
  try {
    const { productId } = req.params;
    const { size } = req.body;

    const product = await Product.findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Produto não encontrado" });

    const before = product.variants.length;
    product.variants = product.variants.filter(
      (v) => v.size.toUpperCase() !== String(size).toUpperCase()
    );
    if (product.variants.length === before) {
      return res
        .status(404)
        .json({ success: false, message: "Tamanho não encontrado" });
    }

    await product.save();
    res.json({ success: true, product });
  } catch (e) {
    console.error("deleteVariant error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/* ------------------------------------------------------------------ */
/*                   Endpoints para Links por Tamanho                  */
/*                  (persistem em product.yampiLinks)                  */
/* ------------------------------------------------------------------ */

/** GET /api/product/:productId/size-links */
export const getSizeLinks = async (req, res) => {
  try {
    const { productId } = req.params;
    const doc = await Product.findById(productId).lean();
    if (!doc)
      return res
        .status(404)
        .json({ success: false, message: "Produto não encontrado" });

    // Mongoose Map -> objeto plano
    const links = Object.fromEntries(doc.yampiLinks || []);
    res.json({ success: true, links });
  } catch (e) {
    console.error("getSizeLinks error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/** PUT /api/product/:productId/size-link
 *  body: { size, url }  (se url vazio, remove) */
export const upsertSizeLink = async (req, res) => {
  try {
    const { productId } = req.params;
    let { size, url } = req.body;
    size = String(size || "").trim().toUpperCase();

    const doc = await Product.findById(productId);
    if (!doc)
      return res
        .status(404)
        .json({ success: false, message: "Produto não encontrado" });

    if (!size)
      return res
        .status(400)
        .json({ success: false, message: "Campo 'size' é obrigatório." });

    // valida coerência com sizes do produto
    const allow = new Set((doc.sizes || []).map((s) => String(s).toUpperCase()));
    if (!allow.has(size)) {
      return res.status(400).json({
        success: false,
        message: "Tamanho não está cadastrado no produto.",
      });
    }

    const current = Object.fromEntries(doc.yampiLinks || []);
    if (!url || !isHttpUrl(url)) {
      // remove se vier vazio ou inválido
      delete current[size];
    } else {
      current[size] = String(url).trim();
    }

    doc.set("yampiLinks", current);
    doc.markModified("yampiLinks");
    await doc.save();

    res.json({ success: true, yampiLinks: current });
  } catch (e) {
    console.error("upsertSizeLink error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};

/** DELETE /api/product/:productId/size-link  (body: { size }) */
export const deleteSizeLink = async (req, res) => {
  try {
    const { productId } = req.params;
    const size = String(req.body.size || "").trim().toUpperCase();

    const doc = await Product.findById(productId);
    if (!doc)
      return res
        .status(404)
        .json({ success: false, message: "Produto não encontrado" });

    const current = Object.fromEntries(doc.yampiLinks || []);
    if (!current[size]) {
      return res
        .status(404)
        .json({ success: false, message: "Link para esse tamanho não existe." });
    }

    delete current[size];
    doc.set("yampiLinks", current);
    doc.markModified("yampiLinks");
    await doc.save();

    res.json({ success: true, yampiLinks: current });
  } catch (e) {
    console.error("deleteSizeLink error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};
