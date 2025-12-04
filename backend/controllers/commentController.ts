// @ts-nocheck
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Comment from "../models/commentModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";

const isOid = (id) => mongoose.Types.ObjectId.isValid(id);
const oid = (id) => new mongoose.Types.ObjectId(id);
const devLog = (...args) => { if (process.env.NODE_ENV === "development") console.error(...args); };

export const requireAuth = (req, res, next) => {
  try {
    const raw = req.headers.authorization?.replace(/^Bearer\s+/i, "") || req.cookies?.token || null;
    if (!raw) return res.status(401).json({ success: false, message: "Não autenticado." });
    const decoded = jwt.verify(raw, process.env.JWT_SECRET);
    req.userId = decoded?.userId || decoded?._id || decoded?.id;
    if (!req.userId || !isOid(req.userId)) return res.status(401).json({ success: false, message: "Token inválido." });
    next();
  } catch (e) {
    devLog("[requireAuth]", e);
    return res.status(401).json({ success: false, message: "Sessão expirada. Faça login novamente." });
  }
};

export const requireAdmin = (req, res, next) => {
  try {
    const raw = req.headers.authorization?.replace(/^Bearer\s+/i, "") || req.cookies?.token || null;
    if (!raw) return res.status(401).json({ success: false, message: "Não autenticado." });
    const decoded = jwt.verify(raw, process.env.JWT_SECRET);
    if (!decoded?.admin) return res.status(403).json({ success: false, message: "Acesso negado." });
    req.adminEmail = decoded.email || null;
    next();
  } catch (e) {
    devLog("[requireAdmin]", e);
    return res.status(401).json({ success: false, message: "Sessão expirada." });
  }
};

export const getComments = async (req, res) => {
  try {
    const { productId } = req.params || {};
    if (!isOid(productId)) return res.status(400).json({ success: false, message: "productId inválido." });
    const limit = Math.min(parseInt(req.query.limit || "3", 10), 200);
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const skip = (page - 1) * limit;
    const [meta] = await Comment.aggregate([
      { $match: { product: oid(productId) } },
      { $group: { _id: null, count: { $sum: 1 }, avg: { $avg: "$rating" } } },
    ]);
    const items = await Comment.find({ product: productId })
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "user", model: User, select: "name email celular telefone whatsapp" })
      .lean();
    return res.json({
      success: true,
      items,
      total: meta?.count || 0,
      avgRating: meta?.avg ? Number(meta.avg.toFixed(2)) : 0,
      page,
      limit,
    });
  } catch (e) {
    devLog("[getComments]", e);
    return res.status(500).json({ success: false, message: "Erro ao carregar comentários." });
  }
};

export const upsertComment = async (req, res) => {
  try {
    const { productId } = req.params || {};
    const userId = req.userId;
    if (!isOid(productId)) return res.status(400).json({ success: false, message: "productId inválido." });
    const { rating, content, title } = req.body || {};
    const r = Number(rating);
    if (!r || r < 1 || r > 5) return res.status(400).json({ success: false, message: "rating deve ser 1..5." });
    const text = String(content || "").trim();
    if (!text || text.length < 8) return res.status(400).json({ success: false, message: "Escreva ao menos 8 caracteres." });
    const product = await Product.findById(productId).select("_id");
    if (!product) return res.status(404).json({ success: false, message: "Produto não encontrado." });
    const verified = false;
    const updated = await Comment.findOneAndUpdate(
      { product: productId, user: userId },
      { $set: { rating: r, title: title?.trim() || "", content: text, verified } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate({ path: "user", model: User, select: "name email celular telefone whatsapp" });
    return res.status(201).json({ success: true, item: updated });
  } catch (e) {
    if (e?.code === 11000) return res.status(409).json({ success: false, message: "Você já avaliou este produto. Edite sua avaliação." });
    devLog("[upsertComment]", e);
    return res.status(500).json({ success: false, message: "Erro ao salvar comentário." });
  }
};

export const getCommentsOverview = async (_req, res) => {
  try {
    const agg = await Comment.aggregate([
      { $group: { _id: "$product", count: { $sum: 1 }, avg: { $avg: "$rating" }, lastAt: { $max: "$createdAt" } } },
      { $sort: { count: -1, lastAt: -1 } },
      { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
      { $unwind: "$product" },
      { $project: { productId: "$_id", name: "$product.name", count: 1, avg: { $round: ["$avg", 2] } } },
    ]);
    return res.json({ success: true, items: agg });
  } catch (e) {
    devLog("[getCommentsOverview]", e);
    return res.status(500).json({ success: false, message: "Erro ao carregar overview." });
  }
};

export const getCommentsByUser = async (req, res) => {
  try {
    const { userId } = req.params || {};
    if (!isOid(userId)) return res.status(400).json({ success: false, message: "userId inválido." });
    const items = await Comment.find({ user: userId })
      .sort({ createdAt: -1, _id: -1 })
      .populate({ path: "product", model: Product, select: "name image price" })
      .lean();
    return res.json({ success: true, items, total: items.length });
  } catch (e) {
    devLog("[getCommentsByUser]", e);
    return res.status(500).json({ success: false, message: "Erro ao carregar comentários do usuário." });
  }
};

export const adminUpdateComment = async (req, res) => {
  try {
    const { commentId } = req.params || {};
    if (!isOid(commentId)) return res.status(400).json({ success: false, message: "commentId inválido." });
    const { rating, content, title, verified } = req.body || {};
    const upd = {};
    if (rating !== undefined) {
      const r = Number(rating);
      if (!r || r < 1 || r > 5) return res.status(400).json({ success: false, message: "rating deve ser 1..5." });
      upd.rating = r;
    }
    if (content !== undefined) {
      const text = String(content).trim();
      if (!text || text.length < 1) return res.status(400).json({ success: false, message: "Conteúdo inválido." });
      upd.content = text;
    }
    if (title !== undefined) upd.title = String(title || "").trim();
    if (verified !== undefined) upd.verified = !!verified;
    const updated = await Comment.findByIdAndUpdate(commentId, { $set: upd }, { new: true })
      .populate({ path: "user", model: User, select: "name email celular telefone whatsapp" });
    if (!updated) return res.status(404).json({ success: false, message: "Comentário não encontrado." });
    return res.json({ success: true, item: updated });
  } catch (e) {
    devLog("[adminUpdateComment]", e);
    return res.status(500).json({ success: false, message: "Erro ao atualizar comentário." });
  }
};

export const adminDeleteComment = async (req, res) => {
  try {
    const { commentId } = req.params || {};
    if (!isOid(commentId)) return res.status(400).json({ success: false, message: "commentId inválido." });
    const del = await Comment.findByIdAndDelete(commentId);
    if (!del) return res.status(404).json({ success: false, message: "Comentário não encontrado." });
    return res.json({ success: true });
  } catch (e) {
    devLog("[adminDeleteComment]", e);
    return res.status(500).json({ success: false, message: "Erro ao excluir comentário." });
  }
};

export const adminReplyComment = async (req, res) => {
  try {
    const { commentId } = req.params || {};
    if (!isOid(commentId)) return res.status(400).json({ success: false, message: "commentId inválido." });
    const content = String(req.body?.content || "").trim();
    if (!content || content.length < 1) return res.status(400).json({ success: false, message: "Resposta vazia." });
    const author = String(req.body?.author || "Marima Oficial").trim() || "Marima Oficial";
    const updated = await Comment.findByIdAndUpdate(
      commentId,
      { $set: { reply: { author, content } } },
      { new: true }
    )
      .populate({ path: "user", model: User, select: "name email celular telefone whatsapp" })
      .populate({ path: "product", model: Product, select: "name image price" });
    if (!updated) return res.status(404).json({ success: false, message: "Comentário não encontrado." });
    return res.json({ success: true, item: updated });
  } catch (e) {
    devLog("[adminReplyComment]", e);
    return res.status(500).json({ success: false, message: "Erro ao responder comentário." });
  }
};
