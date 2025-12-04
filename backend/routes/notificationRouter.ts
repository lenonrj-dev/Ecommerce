// backend/routes/notificationRoutes.js
import express from "express";

// ===== Notificações (CRUD + tracking de e-mail das notificações) =====
import {
  // Cliente
  listForUser,
  unreadCount,
  markRead,
  markAllRead,
  deleteForOwner,
  // Admin (notificações)
  adminSend,
  adminList,
  adminDelete,
  adminUpdate,
  // Tracking de e-mail para notificações
  trackOpen,
  trackClick,
  // Stats de notificações (usado pela dashboard do front)
  adminStats as notifAdminStats,
} from "../controllers/notificationController.js";

// ===== Tracking genérico (e-mail / site / campanhas) =====
import {
  trackEmailOpen,
  trackEmailClick,
  trackSiteEvent,
  adminStats as trackingAdminStats,
  adminSessions,
  adminCampaigns,
} from "../controllers/trackingController.js";

const router = express.Router();

/* ====================== CLIENTE ====================== */
// Lista notificações do usuário autenticado (ou via x-user-id / ?userId / body.userId)
router.get("/", listForUser);
// Contagem de não lidas
router.get("/unread-count", unreadCount);
// Marcar uma notificação como lida
router.patch("/:id/read", markRead);
// Marcar todas como lidas
router.patch("/read-all", markAllRead);
// Excluir uma notificação (pelo próprio dono)
router.delete("/:id", deleteForOwner);

/* ====================== TRACKING: e-mail de NOTIFICAÇÕES ====================== */
// Pixel 1x1 (abertura) das notificações enviadas por e-mail
router.get("/t/o", trackOpen);
// Redirect de clique (incrementa clickCount e mantém UTM) das notificações
router.get("/t/c", trackClick);

/* ====================== TRACKING: e-mail genérico + site ====================== */
// Pixel 1x1 genérico de e-mail (se você usar fora do fluxo de Notificações)
router.get("/email/o", trackEmailOpen);
// Redirect genérico de cliques em e-mail (fora das Notificações)
router.get("/email/c", trackEmailClick);

// Eventos de tracking no site (apenas logado)
router.post("/track", trackSiteEvent);

/* ====================== ADMIN (ANALYTICS) ====================== */
// Estatísticas de NOTIFICAÇÕES (enviadas/aberturas/cliques) — usado no front atual
router.get("/admin/stats", notifAdminStats);

// Estatísticas GERAIS de tracking (se precisar separar do dashboard de notificações)
router.get("/admin/tracking-stats", trackingAdminStats);

// Sessões (paths, funnels) — apenas logados
router.get("/admin/sessions", adminSessions);

// Campanhas (agregados por campanha)
router.get("/admin/campaigns", adminCampaigns);

/* ====================== ADMIN (CRUD de notificações) ====================== */
// Enviar notificações (para todos ou lista) + e-mail com pixel/redirect
router.post("/admin/send", adminSend);

// Listagem administrativa de notificações
router.get("/admin/list", adminList);

// Atualizar/editar notificação
router.patch("/admin/:id", adminUpdate);

// Excluir notificação
router.delete("/admin/:id", adminDelete);

export default router;
