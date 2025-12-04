// backend/controllers/userController.js
// @ts-nocheck
import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import UserModel from "../models/userModel.js";
import Product from "../models/productModel.js";

import sendEmail, { sendWelcomeEmail } from "../utils/sendEmail.js";

/* =============================================================================
 * Constantes e helpers de sessão (24h por padrão)
 * -------------------------------------------------------------------------- */
// Você pode controlar pelo .env:
// - JWT_EXPIRES="24h" (formato suportado pelo jsonwebtoken)
// - ou JWT_EXPIRES_H=24 (em horas)
// - ou JWT_EXPIRES_S=86400 (em segundos)
const ACCESS_TTL_H =
  Number(process.env.JWT_EXPIRES_H || 0) || 24; // fallback 24h
const ACCESS_TTL_S =
  Number(process.env.JWT_EXPIRES_S || 0) ||
  (typeof process.env.JWT_EXPIRES === "string" ? 0 : ACCESS_TTL_H * 3600);
const ACCESS_TTL_MS = ACCESS_TTL_S ? ACCESS_TTL_S * 1000 : 24 * 3600 * 1000;

const ONE_HOUR_S = 60 * 60;
const ONE_HOUR_MS = ONE_HOUR_S * 1000;

const sameSitePolicy = (process.env.COOKIE_SAMESITE || "lax").toLowerCase(); // "lax" | "strict" | "none"
const isProd = process.env.NODE_ENV === "production";

const normalizeEmail = (e = "") => String(e || "").trim().toLowerCase();
const isOid = (id) => mongoose.Types.ObjectId.isValid(id);

const devLog = (...args) => {
  if (process.env.NODE_ENV === "development") console.error(...args);
};

// cria token com base nas configs acima
const createToken = (userId, extra = {}) => {
  const payload = { userId, ...extra };
  const opts = {};

  // prioridade para JWT_EXPIRES (string, ex: "24h"), senão usa segundos (ACCESS_TTL_S)
  if (typeof process.env.JWT_EXPIRES === "string" && process.env.JWT_EXPIRES.trim()) {
    opts.expiresIn = process.env.JWT_EXPIRES.trim();
  } else {
    opts.expiresIn = ACCESS_TTL_S || "24h";
  }

  return jwt.sign(payload, process.env.JWT_SECRET, opts);
};

const setAuthCookie = (res, token) => {
  try {
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: sameSitePolicy, // "lax" por padrão
      secure: isProd && sameSitePolicy === "none" ? true : isProd, // "none" exige secure
      path: "/",
      maxAge: ACCESS_TTL_MS, // 24h por padrão
    });
  } catch {
    /* ignore cookie errors */
  }
};

const clearAuthCookie = (res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      sameSite: sameSitePolicy,
      secure: isProd && sameSitePolicy === "none" ? true : isProd,
      path: "/",
      maxAge: 0,
    });
  } catch {
    /* ignore */
  }
};

const getAuthUserId = (req) =>
  req.userId || req.body?.userId || req.user?.id || null;

const FAVORITE_FIELDS =
  "name price image category subCategory yampiLink yampiLinks";

/* =============================================================================
 * FAVORITOS
 * -------------------------------------------------------------------------- */
export const getFavorites = async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId || !isOid(userId)) {
      return res.status(401).json({ success: false, message: "Não autenticado." });
    }

    const user = await UserModel.findById(userId).populate({
      path: "favorites",
      model: Product,
      select: FAVORITE_FIELDS,
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado." });
    }

    return res.json({ success: true, items: user.favorites || [] });
  } catch (e) {
    devLog("getFavorites error:", e);
    return res.status(500).json({ success: false, message: "Erro ao carregar favoritos." });
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    const { productId } = req.body || {};

    if (!userId || !isOid(userId)) {
      return res.status(401).json({ success: false, message: "Não autenticado." });
    }
    if (!productId) {
      return res.status(400).json({ success: false, message: "productId é obrigatório." });
    }
    if (!isOid(productId)) {
      return res.status(400).json({ success: false, message: "productId inválido." });
    }

    const product = await Product.findById(productId).select("_id");
    if (!product) {
      return res.status(404).json({ success: false, message: "Produto não encontrado." });
    }

    const exists = await UserModel.exists({ _id: userId, favorites: productId });
    const update = exists ? { $pull: { favorites: productId } } : { $addToSet: { favorites: productId } };

    await UserModel.updateOne({ _id: userId }, update);

    const populated = await UserModel.findById(userId).populate({
      path: "favorites",
      model: Product,
      select: FAVORITE_FIELDS,
    });

    return res.json({
      success: true,
      items: populated?.favorites || [],
      isFavorite: !exists,
    });
  } catch (e) {
    devLog("toggleFavorite error:", e);
    return res.status(500).json({ success: false, message: "Erro ao atualizar favorito." });
  }
};

/* =============================================================================
 * ENDEREÇO
 * -------------------------------------------------------------------------- */
export const getAddress = async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId || !isOid(userId)) {
      return res.status(401).json({ success: false, message: "Não autenticado." });
    }

    const user = await UserModel.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado." });
    }

    return res.json({ success: true, address: user.address || null });
  } catch (e) {
    devLog("[getAddress]", e);
    return res.status(500).json({ success: false, message: "Erro ao carregar endereço." });
  }
};

export const upsertAddress = async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId || !isOid(userId)) {
      return res.status(401).json({ success: false, message: "Não autenticado." });
    }

    const payload = req.body || {};

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { address: payload } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado." });
    }

    return res.json({ success: true, address: user.address || null });
  } catch (e) {
    devLog("[upsertAddress]", e);
    return res.status(500).json({ success: false, message: "Erro ao salvar endereço." });
  }
};

/* =============================================================================
 * AUTH / CONTA
 * -------------------------------------------------------------------------- */
export const loginUser = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Usuário não existente!" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({ success: false, message: "Email ou senha incorretos!" });
    }

    const token = createToken(user._id);
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "Usuário conectado com sucesso",
      data: {
        token,
        user,
        expiresIn: typeof process.env.JWT_EXPIRES === "string" && process.env.JWT_EXPIRES.trim()
          ? process.env.JWT_EXPIRES.trim()
          : (ACCESS_TTL_S || 24 * 3600),
        expAt: Date.now() + (ACCESS_TTL_MS || 24 * 3600 * 1000),
      },
    });
  } catch (error) {
    devLog("[loginUser]", error);
    return res.status(500).json({ success: false, message: "Erro no login." });
  }
};

export const registerUser = async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    if (await UserModel.findOne({ email })) {
      return res.status(400).json({ success: false, message: "O usuário já existe" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Por favor, insira um e-mail válido" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "A senha deve ter pelo menos 6 caracteres" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const savedUser = await new UserModel({
      name,
      email,
      password: hashedPassword,
    }).save();

    const token = createToken(savedUser._id);
    setAuthCookie(res, token);

    // e-mail de boas-vindas (não bloqueante)
    (async () => {
      try {
        await sendWelcomeEmail({
          userEmail: savedUser.email,
          userName: savedUser.name,
          couponCode: process.env.COUPON10 || "USERTEM10",
          appUrl: process.env.FRONTEND_URL || process.env.APP_URL || "#",
        });
      } catch (err) {
        devLog("[sendWelcomeEmail]", err?.message || err);
      }
    })();

    return res.status(201).json({
      success: true,
      message: "Usuário criado com sucesso",
      data: {
        user: savedUser,
        token,
        expiresIn: typeof process.env.JWT_EXPIRES === "string" && process.env.JWT_EXPIRES.trim()
          ? process.env.JWT_EXPIRES.trim()
          : (ACCESS_TTL_S || 24 * 3600),
        expAt: Date.now() + (ACCESS_TTL_MS || 24 * 3600 * 1000),
      },
    });
  } catch (error) {
    devLog("[registerUser]", error);
    return res.status(500).json({ success: false, message: "Erro ao registrar." });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    if (email === normalizeEmail(process.env.ADMIN_EMAIL) && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({ admin: true, email }, process.env.JWT_SECRET, {
        expiresIn:
          (typeof process.env.JWT_EXPIRES === "string" && process.env.JWT_EXPIRES.trim()) ||
          (ACCESS_TTL_S || "24h"),
      });
      setAuthCookie(res, token);

      return res.status(200).json({
        success: true,
        message: "Administrador conectado com sucesso",
        data: {
          token,
          expiresIn:
            (typeof process.env.JWT_EXPIRES === "string" && process.env.JWT_EXPIRES.trim()) ||
            (ACCESS_TTL_S || 24 * 3600),
          expAt:
            Date.now() +
            (ACCESS_TTL_MS || 24 * 3600 * 1000),
        },
      });
    }
    return res.status(400).json({ success: false, message: "E-mail ou senha inválidos" });
  } catch (error) {
    devLog("[adminLogin]", error);
    return res.status(500).json({ success: false, message: "Erro no login de admin." });
  }
};

export const logoutUser = async (_req, res) => {
  try {
    clearAuthCookie(res);
    return res.json({ success: true, message: "Logout efetuado." });
  } catch {
    return res.json({ success: true });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId || !isOid(userId)) {
      return res.status(401).json({ success: false, message: "Não autenticado." });
    }

    const user = await UserModel.findById(userId).select(
      "-password -resetPasswordToken -resetPasswordExpires"
    );
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado." });
    }

    return res.json({ success: true, user });
  } catch (error) {
    devLog("[getUserProfile]", error);
    return res.status(500).json({ success: false, message: "Erro ao carregar perfil." });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId || !isOid(userId)) {
      return res.status(401).json({ success: false, message: "Não autenticado." });
    }

    const {
      nome,
      celular,
      telefone,
      whatsapp,
      email,
      senha,
      cpf,
      nascimento,
      sexo,
      promo,
    } = req.body || {};

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado." });
    }

    // e-mail (se alterou, garante unicidade)
    if (email && normalizeEmail(email) !== user.email) {
      const newEmail = normalizeEmail(email);
      if (!validator.isEmail(newEmail)) {
        return res.status(400).json({ success: false, message: "E-mail inválido." });
      }
      const exists = await UserModel.findOne({ email: newEmail, _id: { $ne: userId } }).lean();
      if (exists) {
        return res.status(400).json({ success: false, message: "E-mail já em uso." });
      }
      user.email = newEmail;
    }

    user.name = typeof nome === "string" ? nome : user.name;
    user.celular = celular ?? user.celular;
    user.telefone = telefone ?? user.telefone;
    user.whatsapp = whatsapp ?? user.whatsapp;
    user.cpf = cpf ?? user.cpf;
    user.nascimento = nascimento ?? user.nascimento;
    user.sexo = sexo ?? user.sexo;
    user.promo = typeof promo === "boolean" ? promo : user.promo;

    if (senha) {
      if (senha.length < 6) {
        return res.status(400).json({
          success: false,
          message: "A nova senha deve ter pelo menos 6 caracteres.",
        });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(senha, salt);
    }

    const updatedUser = await user.save();
    return res.json({
      success: true,
      message: "Perfil atualizado com sucesso!",
      user: updatedUser,
    });
  } catch (error) {
    devLog("[updateUserProfile]", error);
    return res.status(500).json({ success: false, message: "Erro ao atualizar perfil." });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!email) {
      return res.status(400).json({ success: false, message: "Informe o e-mail." });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + ONE_HOUR_MS; // 1h para reset
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `
      <h2>Recuperação de Senha</h2>
      <p>Você solicitou a redefinição de senha. Clique no link abaixo:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p>Se você não solicitou, ignore este e-mail.</p>
    `;
    await sendEmail({
      to: user.email,
      subject: "Recuperação de Senha",
      html: message,
    });

    return res.json({
      success: true,
      message: "E-mail de recuperação enviado com sucesso.",
    });
  } catch (error) {
    devLog("[forgotPassword]", error);
    return res.status(500).json({ success: false, message: "Erro no servidor." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const password = String(req.body?.password || "");
    const { token } = req.params || {};

    if (!token) {
      return res.status(400).json({ success: false, message: "Token de redefinição ausente." });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "A nova senha deve ter pelo menos 6 caracteres.",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await UserModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ success: false, message: "Token inválido ou expirado." });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    if (user.sessionTokens) user.sessionTokens = [];
    await user.save();

    clearAuthCookie(res);

    return res.json({
      success: true,
      message: "Senha redefinida com sucesso. Faça login novamente.",
    });
  } catch (error) {
    devLog("[resetPassword]", error);
    return res.status(500).json({ success: false, message: "Erro interno no servidor." });
  }
};

export const getAllUsers = async (_req, res) => {
  try {
    const users = await UserModel.find({})
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .sort({ createdAt: -1, _id: -1 });
    return res.json({ success: true, users });
  } catch (error) {
    devLog("[getAllUsers]", error);
    return res.status(500).json({ success: false, message: "Erro ao carregar usuários" });
  }
};
