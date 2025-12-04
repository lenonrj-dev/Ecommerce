// src/Components/Navbar.jsx
import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ShopContext } from "../Context/ShopContext";
import { assets } from "../assets/assets";
import { motion as Motion, AnimatePresence } from "framer-motion";
import NotificationBell from "./NotificationBell";
import MiniCart from "./MiniCart";

/* ========= padrões UI ========= */
const ICON_BTN =
  "relative inline-grid place-items-center w-9 h-9 rounded-full text-gray-800 hover:text-gray-900 hover:bg-gray-50 transition";
const ICON_SVG = "w-[22px] h-[22px]";

/* ========= Ícones ========= */
const HeartIcon = ({ filled = false, className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    className={`${ICON_SVG} ${className}`}
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={filled ? 0 : 1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M19.84 4.61a5.5 5.5 0 0 0-7.78 0L12 4.67l-.06-.06a5.5 5.5 0 0 0-7.78 7.78l.06.06L12 21l7.78-8.55.06-.06a5.5 5.5 0 0 0 0-7.78Z" />
  </svg>
);

const SearchIcon = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    className={`${ICON_SVG} ${className}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-3.6-3.6" />
  </svg>
);

const UserIcon = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    className={`${ICON_SVG} ${className}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 21a8 8 0 1 0-16 0" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CloseIcon = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    className={`${ICON_SVG} ${className}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const BagIcon = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    className={`${ICON_SVG} ${className}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 9V7a6 6 0 0 1 12 0v2" />
    <path d="M4 9h16l-1 11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 9Z" />
    <path d="M10 13h.01M14 13h.01" />
  </svg>
);

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false); // desktop only
  const [profileOpen, setProfileOpen] = useState(false);
  const [miniCartOpen, setMiniCartOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const profileRef = useRef(null);
  const searchRef = useRef(null);

  const { favorites, isLoggedIn, search, setSearch, token, logout, cartCount } =
    useContext(ShopContext);

  /* Fechar overlays ao navegar */
  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
    setShowSearch(false);
    setMiniCartOpen(false);
  }, [location.pathname]);

  /* cliques externos / teclado */
  useEffect(() => {
    const onDocClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowSearch(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setProfileOpen(false);
        setShowSearch(false);
        setMenuOpen(false);
        setMiniCartOpen(false);
      }
      if (
        e.key === "Enter" &&
        document.activeElement === searchRef.current?.querySelector("input")
      ) {
        if (search?.trim()) {
          navigate(`${location.pathname}?q=${encodeURIComponent(search.trim())}`);
        }
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("touchstart", onDocClick, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [search, location.pathname, navigate]);

  /* Bloqueia scroll do body quando o menu mobile abre */
  useEffect(() => {
    const original = document.body.style.overflow;
    if (menuOpen || miniCartOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = original || "";
    return () => {
      document.body.style.overflow = original || "";
    };
  }, [menuOpen, miniCartOpen]);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-10">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 inline-flex items-center">
            <img src={assets.logo} alt="Marima" className="h-8 w-auto sm:h-9" />
          </Link>

          {/* Links (desktop) */}
          <ul className="hidden lg:flex items-center gap-8 text-gray-700 text-[15px] font-medium">
            {["/", "/outlet", "/casual", "/fitness", "/sobre", "/contato"].map(
              (path, idx) => (
                <NavLink
                  key={idx}
                  to={path}
                  className={({ isActive }) =>
                    `relative py-2 group ${
                      isActive
                        ? "text-gray-900 font-semibold"
                        : "text-gray-700 hover:text-gray-900"
                    }`
                  }
                >
                  <span className="capitalize">
                    {path === "/"
                      ? "Início"
                      : path === "/outlet"
                      ? "Outlet"
                      : path === "/casual"
                      ? "Casual"
                      : path === "/fitness"
                      ? "Fitness"
                      : path.slice(1)}
                  </span>
                  <span className="pointer-events-none absolute left-0 right-0 -bottom-0.5 h-[2px] origin-left scale-x-0 bg-black transition-transform duration-300 group-hover:scale-x-100" />
                </NavLink>
              )
            )}
          </ul>

          {/* Ações (Direita) */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Sino (sempre visível) */}
            <div className={ICON_BTN}>
              <NotificationBell
                variant="icon"
                className="[&>button]:w-9 [&>button]:h-9 [&_svg]:w-[22px] [&_svg]:h-[22px]"
              />
            </div>

            {/* Favoritos – desktop */}
            <button
              onClick={() =>
                navigate(isLoggedIn ? "/dashboard?tab=favoritos" : "/login")
              }
              className={`${ICON_BTN} hidden md:inline-grid`}
              aria-label="Favoritos"
              title="Favoritos"
            >
              <HeartIcon />
              {favorites?.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] leading-[18px] text-[10px] text-center bg-red-600 text-white rounded-full px-1">
                  {favorites.length > 99 ? "99+" : favorites.length}
                </span>
              )}
            </button>

            {/* Sacola */}
            <button
              onClick={() => setMiniCartOpen(true)}
              className={ICON_BTN}
              aria-label="Abrir sacola"
              title="Sacola"
            >
              <BagIcon />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] leading-[18px] text-[10px] text-center rounded-full bg-gray-900 text-white px-1">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            {/* Busca — desktop */}
            <div className="relative hidden md:flex items-center" ref={searchRef}>
              <button
                className={ICON_BTN}
                aria-label="Buscar"
                title="Buscar"
                onClick={() => {
                  setShowSearch((v) => !v);
                  setTimeout(() => {
                    const input = searchRef.current?.querySelector("input");
                    input && input.focus();
                  }, 0);
                }}
              >
                <SearchIcon className="opacity-80" />
              </button>
              <AnimatePresence>
                {showSearch && (
                  <Motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 260, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <input
                      type="text"
                      placeholder="Pesquisar produtos…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="ml-2 text-sm bg-white/60 border border-gray-200 focus:border-gray-300 rounded-full outline-none px-4 py-2 w-[260px] text-gray-700 placeholder:text-gray-400 shadow-sm"
                    />
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Perfil — desktop */}
            <div className="relative hidden md:block" ref={profileRef}>
              <button
                className={ICON_BTN}
                aria-label="Perfil"
                aria-expanded={profileOpen}
                aria-controls="profile-menu"
                onClick={() => {
                  if (!token) return navigate("/login");
                  setProfileOpen((v) => !v);
                }}
              >
                <UserIcon />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <>
                    <Motion.div
                      className="fixed inset-0 z-40"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setProfileOpen(false)}
                    />
                    <Motion.div
                      id="profile-menu"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 mt-2 bg-white shadow-xl rounded-xl text-gray-700 py-2 w-48 z-50 border border-gray-100"
                    >
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/dashboard");
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                      >
                        Meu Perfil
                      </button>
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                      >
                        Sair
                      </button>
                    </Motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Hambúrguer — mobile */}
            <button
              className="inline-grid md:hidden place-items-center w-9 h-9 rounded-full hover:bg-gray-50"
              aria-label="Abrir menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen(true)}
            >
              <svg
                viewBox="0 0 24 24"
                className={ICON_SVG}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ======= MENU MOBILE (fullscreen + FADE BRANCO + SCROLL INTERNO) ======= */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* backdrop escuro atrás do painel */}
            <Motion.div
              className="fixed inset-0 bg-black/40 z-[60] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <Motion.div
              id="mobile-menu"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.28 }}
              className="fixed inset-0 z-[70] md:hidden flex flex-col bg-white relative overflow-hidden min-h-0"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
            >
              {/* FADE branco */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-white/95 to-white/90" />

              {/* Header (fixo) — LOGO CENTRALIZADO */}
              <div className="relative flex items-center justify-center px-4 py-4 border-b border-gray-100 shrink-0">
                <img src={assets.logo} alt="Marima" className="h-7 w-auto" />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 inline-grid place-items-center w-9 h-9 rounded-full hover:bg-gray-50"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Fechar menu"
                >
                  <CloseIcon />
                </button>
              </div>

              {/* CONTEÚDO COM SCROLL (CENTRALIZADO) */}
              <div
                id="mm-scroll"
                className="relative flex-1 min-h-0 overflow-y-auto no-scrollbar scroll-smooth touch-pan-y overscroll-contain px-4 py-5 pb-28"
              >
                {/* Wrapper centralizado para o conteúdo */}
                <div className="mx-auto w-full max-w-[560px] space-y-6">
                  {/* Busca */}
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-2">
                      Buscar
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Pesquisar produtos…"
                        className="flex-1 text-sm bg-white border border-gray-200 rounded-full outline-none px-4 py-2 text-gray-700 placeholder:text-gray-400 shadow-sm"
                      />
                      <button
                        onClick={() => {
                          if (search?.trim()) {
                            navigate(
                              `${location.pathname}?q=${encodeURIComponent(
                                search.trim()
                              )}`
                            );
                            setMenuOpen(false);
                          }
                        }}
                        className="inline-grid place-items-center px-3 rounded-full border border-gray-200 hover:bg-gray-50"
                        aria-label="Buscar"
                      >
                        <SearchIcon className="opacity-80" />
                      </button>
                    </div>
                  </div>

                  {/* Navegação */}
                  <nav>
                    <div className="text-xs font-semibold text-gray-500 mb-2">
                      Menu
                    </div>
                    <ul className="grid gap-2 text-base">
                      {[
                        "/",
                        "/outlet",
                        "/casual",
                        "/fitness",
                        "/sobre",
                        "/contato",
                      ].map((path, idx) => (
                        <li key={idx}>
                          <NavLink
                            to={path}
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) =>
                              `block px-3 py-3 rounded-lg ${
                                isActive
                                  ? "bg-gray-900 text-white"
                                  : "text-gray-800 hover:bg-gray-50"
                              }`
                            }
                          >
                            {path === "/"
                              ? "Início"
                              : path === "/outlet"
                              ? "Outlet"
                              : path === "/casual"
                              ? "Casual"
                              : path === "/fitness"
                              ? "Fitness"
                              : path.slice(1)}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </nav>

                  {/* Ações */}
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-gray-500">
                      Ações
                    </div>

                    <button
                      onClick={() => {
                        navigate(isLoggedIn ? "/dashboard?tab=favoritos" : "/login");
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      <span className="inline-flex items-center gap-3 text-gray-800">
                        <HeartIcon />
                        Favoritos
                      </span>
                      {favorites?.length > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center min-w-[22px] h-[22px] px-1 text-[11px] rounded-full bg-red-600 text-white">
                          {favorites.length > 99 ? "99+" : favorites.length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setMiniCartOpen(true);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      <span className="inline-flex items-center gap-3 text-gray-800">
                        <BagIcon />
                        Sacola
                      </span>
                      {cartCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center min-w-[22px] h-[22px] px-1 text-[11px] rounded-full bg-gray-900 text-white">
                          {cartCount > 99 ? "99+" : cartCount}
                        </span>
                      )}
                    </button>

                    {token ? (
                      <>
                        <button
                          onClick={() => {
                            navigate("/dashboard");
                            setMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-800"
                        >
                          <UserIcon />
                          Meu Perfil
                        </button>
                        <button
                          onClick={() => {
                            logout();
                            setMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-800"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className={ICON_SVG}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                          </svg>
                          Sair
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          navigate("/login");
                          setMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-800"
                      >
                        <UserIcon />
                        Entrar
                      </button>
                    )}
                  </div>

                  {/* espaço para safe-area iOS */}
                  <div className="h-4 pb-[env(safe-area-inset-bottom)]" />
                </div>
              </div>
            </Motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Helpers: esconder scrollbar só no painel mobile */}
      <MiniCart open={miniCartOpen} onClose={() => setMiniCartOpen(false)} />
      <style>{`
        #mm-scroll::-webkit-scrollbar{width:0;height:0}
        #mm-scroll{scrollbar-width:none}
      `}</style>
    </nav>
  );
};

export default Navbar;
