// @ts-nocheck
// backend/controllers/notificationController.js
import mongoose from "mongoose";
// @ts-nocheck
import jwt from "jsonwebtoken";
import { URL } from "url";

import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import NotificationEvent from "../models/notificationEventModel.js"; // <-- eventos do site/pixel
import { sendNotificationEmail } from "../utils/sendEmail.js";

const isOid = (id) => mongoose.Types.ObjectId.isValid(id);
const oid = (id) => new mongoose.Types.ObjectId(id);

/* ------------------------------------------------------------------ */
/* Helpers de auth                                                     */
/* ------------------------------------------------------------------ */
const getBearer = (req) => {
  const h = req.headers?.authorization || "";
  if (/^Bearer\s+/i.test(h)) return h.split(" ")[1];
  return null;
};

const getUserIdFromReq = (req) => {
  if (req.userId && isOid(req.userId)) return req.userId;

  const hdrUid = req.headers?.["x-user-id"];
  const qryUid = req.query?.userId;
  const bodyUid = req.body?.userId;
  const candidate = hdrUid || qryUid || bodyUid;
  if (candidate && isOid(candidate)) return candidate;

  const tok = getBearer(req) || req.headers?.token || req.cookies?.token;
  if (tok) {
    try {
      const dec = jwt.verify(tok, process.env.JWT_SECRET);
      const id = dec?.userId || dec?.id || dec?._id;
      if (id && isOid(id)) return id;
    } catch (_) {}
  }
  return null;
};

/* ====================== CLIENTE ====================== */
/** GET /api/notification?limit=20&page=1 */
export const listForUser = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        code: "NO_USER",
        message: "Autenticação necessária.",
      });
    }

    const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const skip = (page - 1) * limit;

    const [items, total, unread] = await Promise.all([
      Notification.find({ user: userId })
        .sort({ readAt: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "product", model: Product, select: "name image price" })
        .lean(),
      Notification.countDocuments({ user: userId }),
      Notification.countDocuments({ user: userId, readAt: null }),
    ]);

    return res.json({ success: true, items, total, unread, page, limit });
  } catch (err) {
    console.error("listForUser error:", err);
    return res.status(500).json({ success: false, message: "Erro ao carregar notificações." });
  }
};

/** GET /api/notification/unread-count */
export const unreadCount = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "Autenticação necessária." });

    const count = await Notification.countDocuments({ user: userId, readAt: null });
    return res.json({ success: true, count });
  } catch (err) {
    console.error("unreadCount error:", err);
    return res.status(500).json({ success: false, message: "Erro ao contar notificações." });
  }
};

/** PATCH /api/notification/:id/read */
export const markRead = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        code: "NO_USER",
        message: "Autenticação necessária.",
      });
    }
    const { id } = req.params || {};
    if (!isOid(id)) return res.status(400).json({ success: false, message: "ID inválido." });

    const n = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: { readAt: new Date() } },
      { new: true }
    );
    if (!n) return res.status(404).json({ success: false, message: "Notificação não encontrada." });

    return res.json({ success: true, item: n });
  } catch (err) {
    console.error("markRead error:", err);
    return res.status(500).json({ success: false, message: "Erro ao atualizar notificação." });
  }
};

/** PATCH /api/notification/read-all */
export const markAllRead = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        code: "NO_USER",
        message: "Autenticação necessária.",
      });
    }
    await Notification.updateMany({ user: userId, readAt: null }, { $set: { readAt: new Date() } });
    return res.json({ success: true });
  } catch (err) {
    console.error("markAllRead error:", err);
    return res.status(500).json({ success: false, message: "Erro ao marcar todas como lidas." });
  }
};

/** DELETE /api/notification/:id */
export const deleteForOwner = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        code: "NO_USER",
        message: "Autenticação necessária.",
      });
    }
    const { id } = req.params || {};
    if (!isOid(id)) return res.status(400).json({ success: false, message: "ID inválido." });

    const del = await Notification.findOneAndDelete({ _id: id, user: userId });
    if (!del) return res.status(404).json({ success: false, message: "Notificação não encontrada." });

    return res.json({ success: true });
  } catch (err) {
    console.error("deleteForOwner error:", err);
    return res.status(500).json({ success: false, message: "Erro ao excluir notificação." });
  }
};

/* ====================== ADMIN (envio + e-mail + métricas) ====================== */
/** POST /api/notification/admin/send */
export const adminSend = async (req, res) => {
  try {
    const { title, body, type, icon, link, productId, target, userIds } = req.body || {};
    if (!title || !body) {
      return res.status(400).json({ success: false, message: "Título e corpo são obrigatórios." });
    }

    // 1) Resolver destinatários
    let ids = [];
    if (target === "all") {
      const users = await User.find({}).select("_id email").lean();
      ids = users.map((u) => u._id);
    } else if (Array.isArray(userIds) && userIds.length) {
      ids = userIds.filter(isOid).map(oid);
    } else {
      return res.status(400).json({ success: false, message: "Defina o alvo (all ou users[])." });
    }
    if (!ids.length) return res.status(400).json({ success: false, message: "Sem destinatários." });

    const campaignId = target === "all" ? new mongoose.Types.ObjectId() : null;
    const product = productId && isOid(productId) ? oid(productId) : null;

    // 2) Criar documentos (uma notif por usuário)
    const docs = ids.map((uid) => ({
      user: uid,
      sender: process.env.BRAND_NAME || "Marima",
      title: String(title).trim(),
      body: String(body).trim(),
      type: type || "promo",
      icon: icon || "gift",
      link: link || "",
      product,
      sentEmailAt: new Date(),
      openCount: 0,
      clickCount: 0,
      campaignId: target === "all" ? campaignId : undefined,
      audience: target === "all" ? "global" : "list",
    }));

    const created = await Notification.insertMany(docs, { ordered: false });

    // Mapa userId -> notificationId
    const mapByUser = new Map();
    for (const doc of created) mapByUser.set(String(doc.user), doc._id);

    // 3) Enviar e-mails (não bloquear se falhar)
    const baseSiteUrl = link || process.env.FRONTEND_URL || process.env.APP_URL || "https://www.usemarima.com";
    const users = await User.find({ _id: { $in: ids } }).select("name email").lean();

    const jobs = users
      .filter((u) => !!u.email)
      .map((u) =>
        sendNotificationEmail({
          notificationId: mapByUser.get(String(u._id)),
          userEmail: u.email,
          userName: u.name,
          title,
          body,
          link: baseSiteUrl,
          ctaLabel: "Ver oferta",
        })
      );

    const results = await Promise.allSettled(jobs);
    const failed = results.filter((r) => r.status === "rejected").length;

    return res.status(201).json({
      success: true,
      created: created.length,
      emailed: jobs.length,
      email_failed: failed,
      message:
        failed > 0
          ? "Notificações criadas. Alguns e-mails podem não ter sido enviados."
          : "Notificações criadas e e-mails enviados com sucesso.",
    });
  } catch (err) {
    console.error("adminSend error:", err);
    return res.status(500).json({ success: false, message: "Erro ao enviar notificações." });
  }
};

/** GET /api/notification/admin/list */
export const adminList = async (_req, res) => {
  try {
    const items = await Notification.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .populate({ path: "user", model: User, select: "name email" })
      .populate({ path: "product", model: Product, select: "name price image" })
      .lean();
    return res.json({ success: true, items });
  } catch (err) {
    console.error("adminList error:", err);
    return res.status(500).json({ success: false, message: "Erro ao listar notificações." });
  }
};

/** DELETE /api/notification/admin/:id */
export const adminDelete = async (req, res) => {
  try {
    const { id } = req.params || {};
    if (!isOid(id)) return res.status(400).json({ success: false, message: "ID inválido." });
    const del = await Notification.findByIdAndDelete(id);
    if (!del) return res.status(404).json({ success: false, message: "Notificação não encontrada." });
    return res.json({ success: true });
  } catch (err) {
    console.error("adminDelete error:", err);
    return res.status(500).json({ success: false, message: "Erro ao excluir notificação." });
  }
};

/** PATCH /api/notification/admin/:id */
export const adminUpdate = async (req, res) => {
  try {
    const { id } = req.params || {};
    if (!isOid(id)) return res.status(400).json({ success: false, message: "ID inválido." });

    const { title, body, type, icon, link, productId, markUnread, markRead } = req.body || {};
    const set = {};
    if (typeof title === "string") set.title = title.trim();
    if (typeof body === "string") set.body = body.trim();
    if (typeof type === "string") set.type = type;
    if (typeof icon === "string") set.icon = icon;
    if (typeof link === "string") set.link = link;
    if (productId !== undefined) set.product = productId && isOid(productId) ? oid(productId) : null;
    if (markUnread === true) set.readAt = null;
    if (markRead === true) set.readAt = new Date();

    if (Object.keys(set).length === 0) {
      return res.status(400).json({ success: false, message: "Nada para atualizar." });
    }

    const upd = await Notification.findByIdAndUpdate(id, { $set: set }, { new: true });
    if (!upd) return res.status(404).json({ success: false, message: "Notificação não encontrada." });

    return res.json({ success: true, item: upd });
  } catch (err) {
    console.error("adminUpdate error:", err);
    return res.status(500).json({ success: false, message: "Erro ao atualizar notificação." });
  }
};

/* ====================== TRACKING (pixel + clique + site) ====================== */
/** GET /api/notification/t/o?nid=...  (pixel 1x1) */
export const trackOpen = async (req, res) => {
  try {
    const { nid } = req.query || {};
    if (nid && isOid(nid)) {
      const notif = await Notification.findByIdAndUpdate(
        oid(nid),
        { $inc: { openCount: 1 }, $set: { lastOpenedAt: new Date() } },
        { new: false, select: "user" }
      );
      // loga evento
      await NotificationEvent.create({
        type: "email_open",
        notification: isOid(nid) ? nid : undefined,
        user: notif?.user || undefined,
        ref: String(nid || ""),
        ua: req.headers["user-agent"],
        ip: req.ip,
        ts: new Date(),
      });
    }
  } catch (err) {
    console.error("trackOpen error:", err);
  } finally {
    // GIF 1x1 transparente
    const gifBase64 = "R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";
    const buf = Buffer.from(gifBase64, "base64");
    res.set("Content-Type", "image/gif");
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return res.status(200).send(buf);
  }
};

/** GET /api/notification/t/c?nid=...&url=https://...  (redirect com UTM + nid) */
export const trackClick = async (req, res) => {
  try {
    const { nid, url } = req.query || {};
    let target = url || process.env.FRONTEND_URL || "https://www.usemarima.com";

    // incrementa e loga
    let userId;
    if (nid && isOid(nid)) {
      const notif = await Notification.findByIdAndUpdate(
        oid(nid),
        { $inc: { clickCount: 1 }, $set: { lastClickedAt: new Date() } },
        { new: false, select: "user" }
      );
      userId = notif?.user || undefined;

      await NotificationEvent.create({
        type: "email_click",
        notification: isOid(nid) ? nid : undefined,
        user: userId,
        url: target,
        ref: String(nid || ""),
        ua: req.headers["user-agent"],
        ip: req.ip,
        ts: new Date(),
      });
    }

    // Acrescentar UTM e nid ao destino final
    try {
      const u = new URL(target);
      if (!u.searchParams.has("utm_source")) u.searchParams.set("utm_source", "email");
      if (!u.searchParams.has("utm_medium")) u.searchParams.set("utm_medium", "notification");
      if (!u.searchParams.has("utm_campaign")) u.searchParams.set("utm_campaign", "campanha");
      if (nid && !u.searchParams.has("nid")) u.searchParams.set("nid", String(nid));
      target = u.toString();
    } catch (_) {
      target = process.env.FRONTEND_URL || "https://www.usemarima.com";
    }

    return res.redirect(302, target);
  } catch (err) {
    console.error("trackClick error:", err);
    return res.redirect(302, process.env.FRONTEND_URL || "https://www.usemarima.com");
  }
};

/** POST /api/notification/track  (site: apenas logado)
 *  body: { sessionId, type: 'view'|'click'|'panel_open', path, url, notificationId?, meta? }
 */
export const trackSiteEvent = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "Auth required" });

    const { sessionId, type, path, url, notificationId, meta } = req.body || {};
    if (!sessionId || !type) return res.status(400).json({ success: false, message: "sessionId e type são obrigatórios" });

    if (notificationId && isOid(notificationId) && type === "click") {
      await Notification.updateOne({ _id: oid(notificationId) }, { $inc: { clickCount: 1 } }).lean();
    }

    await NotificationEvent.create({
      user: userId,
      sessionId,
      type,
      path,
      url,
      notification: isOid(notificationId) ? notificationId : undefined,
      meta,
      ua: req.headers["user-agent"],
      ip: req.ip,
      ts: new Date(),
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("trackSiteEvent error:", err);
    return res.status(500).json({ success: false });
  }
};

/* ====================== STATS / SESSÕES / CAMPANHAS ====================== */
/** GET /api/notification/admin/stats?days=30 */
export const adminStats = async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days || "30", 10), 1), 365);
    const since = new Date(Date.now() - days * 24 * 3600 * 1000);

    const sentAgg = await Notification.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { date: "$createdAt", format: "%Y-%m-%d" } },
          sent: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const evAgg = await NotificationEvent.aggregate([
      { $match: { ts: { $gte: since } } },
      {
        $group: {
          _id: {
            day: { $dateToString: { date: "$ts", format: "%Y-%m-%d" } },
            type: "$type",
          },
          n: { $sum: 1 },
        },
      },
      { $sort: { "_id.day": 1 } },
    ]);

    const byDayMap = new Map();
    for (const d of sentAgg) {
      const k = d._id;
      if (!byDayMap.has(k))
        byDayMap.set(k, { day: k, sent: 0, email_open: 0, email_click: 0, site_view: 0, site_click: 0, panel_open: 0 });
      byDayMap.get(k).sent = d.sent;
    }
    for (const e of evAgg) {
      const k = e._id.day;
      if (!byDayMap.has(k))
        byDayMap.set(k, { day: k, sent: 0, email_open: 0, email_click: 0, site_view: 0, site_click: 0, panel_open: 0 });
      const row = byDayMap.get(k);
      if (e._id.type === "email_open") row.email_open += e.n;
      if (e._id.type === "email_click") row.email_click += e.n;
      if (e._id.type === "view") row.site_view += e.n;
      if (e._id.type === "click") row.site_click += e.n;
      if (e._id.type === "panel_open") row.panel_open += e.n;
    }

    const byDay = Array.from(byDayMap.values()).sort((a, b) => a.day.localeCompare(b.day));
    const totals = byDay.reduce(
      (acc, r) => ({
        sent: acc.sent + (r.sent || 0),
        opens: acc.opens + (r.email_open || 0),
        clicks: acc.clicks + (r.email_click || 0),
        siteViews: acc.siteViews + (r.site_view || 0),
        siteClicks: acc.siteClicks + (r.site_click || 0),
        panelOpens: acc.panelOpens + (r.panel_open || 0),
      }),
      { sent: 0, opens: 0, clicks: 0, siteViews: 0, siteClicks: 0, panelOpens: 0 }
    );

    return res.json({ success: true, rangeDays: days, totals, byDay });
  } catch (err) {
    console.error("adminStats error:", err);
    return res.status(500).json({ success: false, message: "Erro ao gerar estatísticas." });
  }
};

/** GET /api/notification/admin/sessions?days=30&userId=... */
export const adminSessions = async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days || "30", 10), 1), 180);
    const since = new Date(Date.now() - days * 24 * 3600 * 1000);
    const userId = req.query.userId && isOid(req.query.userId) ? new mongoose.Types.ObjectId(req.query.userId) : null;

    const q = { ts: { $gte: since }, user: { $ne: null } };
    if (userId) q.user = userId;

    const events = await NotificationEvent.find(q).sort({ user: 1, sessionId: 1, ts: 1 }).lean();

    const sessions = [];
    let bucket = null;

    for (const ev of events) {
      const key = `${ev.user}-${ev.sessionId}`;
      if (!bucket || bucket.key !== key) {
        if (bucket) sessions.push(bucket);
        bucket = {
          key,
          user: ev.user,
          sessionId: ev.sessionId,
          startedAt: ev.ts,
          lastAt: ev.ts,
          events: [],
          pageFlow: [],
          counts: { view: 0, click: 0, email_open: 0, email_click: 0, panel_open: 0 },
          fromNotification: false,
        };
      }
      bucket.lastAt = ev.ts;
      bucket.events.push(ev);
      if (ev.type === "view" && ev.path) bucket.pageFlow.push(ev.path);
      bucket.counts[ev.type] = (bucket.counts[ev.type] || 0) + 1;
      if (ev.notification || (typeof ev.ref === "string" && ev.ref)) bucket.fromNotification = true;
    }
    if (bucket) sessions.push(bucket);

    const userIds = Array.from(new Set(sessions.map((s) => String(s.user))));
    const users = await User.find({ _id: { $in: userIds } }).select("name email").lean();
    const mapUsers = new Map(users.map((u) => [String(u._id), u]));

    const result = sessions.map((s) => ({
      sessionId: s.sessionId,
      user: { _id: s.user, ...(mapUsers.get(String(s.user)) || {}) },
      startedAt: s.startedAt,
      lastAt: s.lastAt,
      fromNotification: s.fromNotification,
      counts: s.counts,
      pageFlow: s.pageFlow,
      totalEvents: s.events.length,
    }));

    return res.json({ success: true, days, sessions: result });
  } catch (err) {
    console.error("adminSessions error:", err);
    return res.status(500).json({ success: false, message: "Erro em sessions" });
  }
};

/** GET /api/notification/admin/campaigns */
export const adminCampaigns = async (_req, res) => {
  try {
    const items = await Notification.aggregate([
      { $match: { audience: "global" } },
      {
        $group: {
          _id: "$campaignId",
          title: { $first: "$title" },
          body: { $first: "$body" },
          createdAt: { $first: "$createdAt" },
          total: { $sum: 1 },
          openCount: { $sum: { $ifNull: ["$openCount", 0] } },
          clickCount: { $sum: { $ifNull: ["$clickCount", 0] } },
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 200 },
    ]);
    return res.json({ success: true, campaigns: items });
  } catch (err) {
    console.error("adminCampaigns error:", err);
    return res.status(500).json({ success: false, message: "Erro em campaigns" });
  }
};
