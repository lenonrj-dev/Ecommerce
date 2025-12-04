// @ts-nocheck
// backend/controllers/trackingController.js
import mongoose from "mongoose";
import Notification from "../models/notificationModel.js";
import NotificationEvent from "../models/notificationEventModel.js";
import User from "../models/userModel.js";
// @ts-nocheck
import jwt from "jsonwebtoken";

const isOid = (id) => mongoose.Types.ObjectId.isValid(id);

// 1x1 GIF transparente
const GIF_BASE64 =
  "R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

const getBearer = (req) => {
  const h = req.headers?.authorization || "";
  if (/^Bearer\s+/i.test(h)) return h.split(" ")[1];
  return null;
};
const getUserIdFromReq = (req) => {
  // middleware upstream pode ter setado
  if (req.userId && isOid(req.userId)) return req.userId;
  // token (Authorization / header token / cookie)
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

/** GET /api/notification/t/o?nid=... => pixel de abertura de e-mail */
export const trackEmailOpen = async (req, res) => {
  try {
    const nid = req.query?.nid;
    let notif = null;
    if (isOid(nid)) {
      notif = await Notification.findByIdAndUpdate(
        nid,
        { $inc: { openCount: 1 } },
        { new: false, select: "_id user" }
      );
      await NotificationEvent.create({
        notification: isOid(nid) ? nid : undefined,
        user: notif?.user || undefined,
        type: "email_open",
        ref: String(nid || ""),
        ua: req.headers["user-agent"],
        ip: req.ip,
      });
    }
  } catch {
    /* silencioso */
  } finally {
    const buf = Buffer.from(GIF_BASE64, "base64");
    res.setHeader("Content-Type", "image/gif");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.status(200).send(buf);
  }
};

/** GET /api/notification/t/c?nid=...&url=https://...  => redirect com tracking */
export const trackEmailClick = async (req, res) => {
  try {
    const nid = req.query?.nid;
    const url = req.query?.url;
    if (!url) return res.redirect(302, "/");

    if (isOid(nid)) {
      const notif = await Notification.findByIdAndUpdate(
        nid,
        { $inc: { clickCount: 1 } },
        { new: false, select: "_id user" }
      );
      await NotificationEvent.create({
        notification: nid,
        user: notif?.user || undefined,
        type: "email_click",
        url,
        ref: String(nid || ""),
        ua: req.headers["user-agent"],
        ip: req.ip,
      });
    }
    return res.redirect(302, url);
  } catch {
    return res.redirect(302, req.query?.url || "/");
  }
};

/** POST /api/notification/track (apenas usuários logados)
 *  body: { sessionId, type: 'view'|'click'|'panel_open', path, url, notificationId?, meta? }
 */
export const trackSiteEvent = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "Auth required" });

    const { sessionId, type, path, url, notificationId, meta } = req.body || {};
    if (!sessionId || !type) return res.status(400).json({ success: false, message: "sessionId e type são obrigatórios" });

    if (notificationId && isOid(notificationId) && type === "click") {
      await Notification.findByIdAndUpdate(notificationId, { $inc: { clickCount: 1 } }).lean();
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
  } catch {
    return res.status(500).json({ success: false });
  }
};

/** GET /api/notification/admin/stats?days=30
 *  Retorna totals + byDay com sent/email_open/email_click/site_view/site_click/panel_open
 */
export const adminStats = async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days || "30", 10), 1), 180);
    const since = new Date(Date.now() - days * 24 * 3600 * 1000);

    // enviados (Notification.createdAt)
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

    // eventos
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

    // normaliza por dia
    const byDayMap = new Map(); // key=YYYY-MM-DD, value obj
    for (const d of sentAgg) {
      const k = d._id;
      if (!byDayMap.has(k)) byDayMap.set(k, { day: k, sent: 0, email_open: 0, email_click: 0, site_view: 0, site_click: 0, panel_open: 0 });
      byDayMap.get(k).sent = d.sent;
    }
    for (const e of evAgg) {
      const k = e._id.day;
      if (!byDayMap.has(k)) byDayMap.set(k, { day: k, sent: 0, email_open: 0, email_click: 0, site_view: 0, site_click: 0, panel_open: 0 });
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
  } catch {
    return res.status(500).json({ success: false, message: "Erro em stats" });
  }
};

/** GET /api/notification/admin/sessions?days=30&userId=... 
 *  Lista sessões (apenas de usuários logados) com fluxo de páginas
 */
export const adminSessions = async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days || "30", 10), 1), 180);
    const since = new Date(Date.now() - days * 24 * 3600 * 1000);
    const userId = req.query.userId && isOid(req.query.userId) ? new mongoose.Types.ObjectId(req.query.userId) : null;

    const q = { ts: { $gte: since }, user: { $ne: null } };
    if (userId) q.user = userId;

    const events = await NotificationEvent.find(q).sort({ user: 1, sessionId: 1, ts: 1 }).lean();

    // agrupa em JS para montar fluxos
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

    // enriquece com nome/e-mail
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
      pageFlow: s.pageFlow, // fluxo na ordem
      totalEvents: s.events.length,
    }));

    return res.json({ success: true, days, sessions: result });
  } catch {
    return res.status(500).json({ success: false, message: "Erro em sessions" });
  }
};

/** GET /api/notification/admin/campaigns
 *  Agrega por campaignId (campanhas globais) com métricas básicas
 */
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
          openCount: { $sum: "$openCount" },
          clickCount: { $sum: "$clickCount" },
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 200 },
    ]);
    return res.json({ success: true, campaigns: items });
  } catch {
    return res.status(500).json({ success: false, message: "Erro em campaigns" });
  }
};
