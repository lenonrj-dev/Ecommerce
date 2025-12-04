// src/hooks/useNotifAnalytics.js
import { useEffect, useRef } from "react";

const makeSessionId = () => {
  const prev = sessionStorage.getItem("notif:sessionId");
  if (prev) return prev;
  const sid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
  sessionStorage.setItem("notif:sessionId", sid);
  return sid;
};

const getTokenHeaders = () => {
  const token = typeof window !== "undefined" ? (localStorage.getItem("token") || localStorage.getItem("authToken")) : null;
  return token ? { Authorization: `Bearer ${token}`, token } : {};
};

export default function useNotifAnalytics({ backendUrl, isLoggedIn }) {
  const lastPath = useRef("");
  const backend = backendUrl;

  useEffect(() => {
    if (!isLoggedIn) return; // só logados
    const headers = { "Content-Type": "application/json", ...getTokenHeaders() };
    const sessionId = makeSessionId();

    const send = (payload) => {
      try {
        fetch(`${backend}/api/notification/track`, {
          method: "POST",
          headers,
          body: JSON.stringify({ sessionId, ...payload }),
          keepalive: true, // ajuda no unload
        });
      } catch (error) {
        console.error("Falha ao enviar analytics de notificação:", error);
      }
    };

    const trackView = () => {
      const path = window.location.pathname + window.location.search + window.location.hash;
      if (path === lastPath.current) return;
      lastPath.current = path;
      send({ type: "view", path, url: window.location.href });
    };

    const onClick = (e) => {
      const tgt = e.target.closest("[data-track='click']");
      if (!tgt) return;
      const path = window.location.pathname;
      const url = tgt.getAttribute("href") || tgt.dataset.url || "";
      const notificationId = tgt.dataset.nid || undefined;
      send({ type: "click", path, url, notificationId, meta: { id: tgt.id || null } });
    };

    // 1) primeira view
    trackView();
    // 2) mudanças de rota SPA (fallback)
    const onPop = () => setTimeout(trackView, 0);
    window.addEventListener("popstate", onPop);
    // 3) clicks marcados
    window.addEventListener("click", onClick, true);

    // 4) interceptor básico de pushState/replaceState pra SPA
    const _push = history.pushState;
    const _replace = history.replaceState;
    history.pushState = function () {
      _push.apply(this, arguments);
      setTimeout(trackView, 0);
    };
    history.replaceState = function () {
      _replace.apply(this, arguments);
      setTimeout(trackView, 0);
    };

    // 5) unload
    const onBeforeUnload = () => {
      send({ type: "view", path: window.location.pathname, url: window.location.href, meta: { unload: true } });
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("beforeunload", onBeforeUnload);
      history.pushState = _push;
      history.replaceState = _replace;
    };
  }, [backend, isLoggedIn]);
}

/** helper opcional para marcar CTAs:
 * <a href="/leggings" data-track="click" data-nid={notificationId}>Ver leggings</a>
 */
