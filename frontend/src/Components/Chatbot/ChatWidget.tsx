// src/Components/Chatbot/ChatWidget.jsx
"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, ChevronRight, RotateCcw, Loader2
} from "lucide-react";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "";

/* ================= Animations ================= */
const panelVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", damping: 22, stiffness: 240 }
  },
  exit: { opacity: 0, y: 10, scale: 0.97, transition: { duration: 0.22 } }
};
const optionVariants = {
  hidden: { opacity: 0, y: 8 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.04 * i, duration: 0.22 } })
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [flow, setFlow] = useState(null);
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const firstBtnRef = useRef(null);

  /* ---------- Layout constants (safe-area friendly) ---------- */
  const SAFE_RIGHT = "env(safe-area-inset-right)";
  const SAFE_BOTTOM = "env(safe-area-inset-bottom)";
  const BTN_OFFSET_M = 20;   // mobile margin to edges
  const BTN_OFFSET_D = 28;   // desktop margin to edges
  const BTN_SIZE_M   = 56;   // mobile button size (px)
  const BTN_SIZE_D   = 64;   // desktop button size (px)
  const GAP_ABOVE    = 12;   // gap between bubble and panel

  /* Load flow only when opening */
  useEffect(() => {
    if (!open || flow) return;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const url = `${API_BASE.replace(/\/+$/, "")}/api/chat/flow`;
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setFlow(json);
        setCurrentId(json.entry);
      } catch (e) {
        console.error("[ChatWidget] flow error:", e);
        setErr("Não foi possível carregar o chat agora.");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, flow]);

  const node = flow?.nodes?.[currentId] ?? null;

  const runAction = (action) => {
    if (!action) return;
    if (action.type === "open_url") window.open(action.url, "_blank", "noopener,noreferrer");
    if (action.type === "navigate") window.location.href = action.to;
  };
  const choose = (opt) => {
    if (opt.action) runAction(opt.action);
    if (opt.next) setCurrentId(opt.next);
  };
  const reset = () => setCurrentId(flow?.entry ?? "start");

  // focus first option when node changes (acessibilidade)
  useEffect(() => {
    if (node && firstBtnRef.current) {
      const t = setTimeout(() => firstBtnRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [node]);

  return (
    <>
      {/* ========== Floating bubble button (light theme) ========== */}
      <Motion.button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Fechar chat" : "Abrir chat"}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        className="
          fixed z-[9999] grid place-items-center
          rounded-full bg-white text-neutral-900
          border border-neutral-200
          shadow-[0_10px_28px_rgba(0,0,0,0.12)]
          hover:shadow-[0_12px_34px_rgba(0,0,0,0.16)]
          transition-all duration-300 backdrop-blur-xl
        "
        style={{
          right: `calc(${SAFE_RIGHT} + ${BTN_OFFSET_D}px)`,
          bottom:`calc(${SAFE_BOTTOM} + ${BTN_OFFSET_D}px)`,
          width:  `${BTN_SIZE_D}px`,
          height: `${BTN_SIZE_D}px`,
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <Motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0, scale: 0.9 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="grid place-items-center"
            >
              <X className="h-7 w-7" />
            </Motion.span>
          ) : (
            <Motion.span
              key="msg"
              initial={{ rotate: -6, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 6, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative grid place-items-center"
            >
              <MessageCircle className="h-8 w-8" />
              <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(rgba(0,0,0,0.08),transparent_60%)] blur-md" />
            </Motion.span>
          )}
        </AnimatePresence>
      </Motion.button>

      {/* ========== Chat panel (opens to the LEFT of the bubble, above it) ========== */}
      <AnimatePresence>
        {open && (
          <Motion.aside
            key="panel"
            variants={panelVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="
              fixed z-[9998] flex flex-col
              bg-white/90 backdrop-blur-xl
              border border-neutral-200 rounded-3xl
              shadow-2xl overflow-hidden
              w-[24rem] max-w-[min(92vw,24rem)]
            "
            style={{
              // ► appear ABOVE the bubble
              bottom: `calc(${SAFE_BOTTOM} + ${BTN_OFFSET_D}px + ${BTN_SIZE_D}px + ${GAP_ABOVE}px)`,
              // ► open to the LEFT: anchor the panel's right edge to the same right offset as the bubble
              // this guarantees it NEVER crosses the screen edge on the right
              right: `calc(${SAFE_RIGHT} + ${BTN_OFFSET_D}px)`,
              // ► hard safety: if viewport is ultra-narrow, width shrinks automatically (max-w above)
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-white shadow-inner grid place-items-center ring-1 ring-neutral-200">
                  <MessageCircle className="h-5 w-5 text-neutral-700" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-800 leading-tight">Atendimento Marima</h3>
                  <p className="text-[11px] text-neutral-500">Escolha uma opção para continuar</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md hover:bg-neutral-100 transition"
                aria-label="Fechar"
              >
                <X className="h-5 w-5 text-neutral-700" />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[22rem] overflow-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-neutral-200">
              {loading && (
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
                </div>
              )}

              {!loading && err && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {err}
                </div>
              )}

              {!loading && !err && node && (
                <>
                  <Motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22 }}
                    className="flex gap-2 items-start"
                  >
                    <div className="h-7 w-7 rounded-full bg-neutral-900 text-white grid place-items-center shrink-0">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-neutral-100 text-neutral-800 px-4 py-2 text-sm shadow-sm">
                      {node.message}
                    </div>
                  </Motion.div>

                  <div className="grid gap-2">
                    {node.options?.map((opt, i) => (
                      <Motion.button
                        key={i}
                        custom={i}
                        variants={optionVariants}
                        initial="hidden"
                        animate="show"
                        onClick={() => choose(opt)}
                        ref={i === 0 ? firstBtnRef : undefined}
                        className="
                          group w-full text-left px-4 py-2.5
                          rounded-xl border border-neutral-200
                          bg-white hover:bg-neutral-50
                          flex items-center justify-between gap-3
                          text-sm font-medium text-neutral-800
                          transition-all duration-200
                        "
                      >
                        <span className="truncate">{opt.label}</span>
                        <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-700" />
                      </Motion.button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 bg-white/80 backdrop-blur-md">
              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 transition"
                title="Recomeçar"
              >
                <RotateCcw className="h-4 w-4" />
                Recomeçar
              </button>
              <span className="text-[11px] text-neutral-500">Marima • Assistente Virtual</span>
            </div>
          </Motion.aside>
        )}
      </AnimatePresence>

      {/* ===== Mobile overrides: smaller bubble, panel keeps opening to the LEFT and stays fully visible ===== */}
      <style>{`
        @media (max-width: 768px) {
          /* bubble */
          button[aria-label="Abrir chat"], button[aria-label="Fechar chat"] {
            right: calc(${SAFE_RIGHT} + ${BTN_OFFSET_M}px) !important;
            bottom: calc(${SAFE_BOTTOM} + ${BTN_OFFSET_M}px) !important;
            width: ${BTN_SIZE_M}px !important;
            height: ${BTN_SIZE_M}px !important;
          }
          /* panel: above bubble, leftwards, width constrained by viewport minus right offset */
          aside[style] {
            bottom: calc(${SAFE_BOTTOM} + ${BTN_OFFSET_M}px + ${BTN_SIZE_M}px + ${GAP_ABOVE - 2}px) !important;
            right: calc(${SAFE_RIGHT} + ${BTN_OFFSET_M}px) !important;
            width: min(92vw, 22rem) !important;
            max-width: 92vw !important;
          }
        }
        /* ultra-narrow fallback (<= 340px): panel uses 96vw and taller body */
        @media (max-width: 340px) {
          aside[style] { width: 96vw !important; max-width: 96vw !important; }
          aside[style] .max-h-\\[22rem\\] { max-height: 70vh !important; }
        }
      `}</style>
    </>
  );
}
