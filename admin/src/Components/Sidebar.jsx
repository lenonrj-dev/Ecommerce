"use client";
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import { motion as Motion, AnimatePresence } from "framer-motion";

const navItems = [
  { to: "/add", icon: assets.add_icon, label: "Adicionar Produtos", seoLabel: "Adicionar novos itens ao catálogo" },
  { to: "/list", icon: assets.order_icon, label: "Listar Itens", seoLabel: "Visualizar e gerenciar todos os itens cadastrados" },
  { to: "/user", icon: assets.user_icon || assets.order_icon, label: "Usuários", seoLabel: "Controle e gerenciamento de usuários" },
  { to: "/feedback", icon: assets.review_icon || assets.order_icon, label: "Avaliações", seoLabel: "Avaliações e comentários" },
  { to: "/notifications", icon: assets.bell_icon || assets.order_icon, label: "Notificações", seoLabel: "Envio e gestão de notificações" },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkWidth = () => setIsDesktop(window.innerWidth >= 768);
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  return (
    <>
      {!isDesktop && (
        <Motion.button
          aria-label="Abrir menu lateral"
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-16 left-4 z-50 bg-gray-900 text-white p-2 rounded-md shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Motion.div initial={false} animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.3 }}>
            ☰
          </Motion.div>
        </Motion.button>
      )}

      <AnimatePresence>
        {(isOpen || isDesktop) && (
          <Motion.aside
            role="navigation"
            aria-label="Menu lateral de navegação"
            initial={{ x: -250, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -250, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }}
            className="fixed md:relative top-10 md:top-10 left-0 h-full md:h-auto w-[75%] sm:w-[60%] md:w-[18%] bg-white border-r border-gray-200 shadow-lg md:shadow-none z-40 flex flex-col"
          >
            <div className="flex flex-col gap-3 pt-8 px-6 md:px-4 text-sm md:text-[15px]">
              {navItems.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.to}
                  aria-label={item.seoLabel}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 ${
                      isActive ? "bg-gray-900 text-white shadow-md" : "bg-white text-gray-700 hover:bg-gray-100"
                    }`
                  }
                  onClick={() => !isDesktop && setIsOpen(false)}
                >
                  <Motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.92 }} className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-md group-hover:bg-gray-300 transition-all">
                    <img src={item.icon} alt={`Ícone: ${item.label}`} className="w-5 h-5" loading="lazy" />
                  </Motion.div>
                  <p className="font-medium truncate">{item.label}</p>
                </NavLink>
              ))}
            </div>
          </Motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
