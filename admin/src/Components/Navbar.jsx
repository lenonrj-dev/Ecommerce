"use client";
import React from "react";
import { assets } from "../assets/assets.js";
import { motion as Motion } from "framer-motion";

const Navbar = ({ setToken }) => {
  return (
    <Motion.nav
      role="navigation"
      aria-label="Menu principal"
      className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md shadow-lg px-4 md:px-10 py-4 flex items-center justify-between z-50"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.25, 0.8, 0.25, 1] }}
    >
      {/* Logo */}
      <Motion.a
        href="/"
        aria-label="Página inicial - Marima Store"
        className="flex items-center gap-3"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        <img
          src={assets.logo}
          alt="Marima Store - Moda e tecnologia em roupas"
          className="w-20 sm:w-24 lg:w-28 object-contain drop-shadow-md"
          loading="lazy"
        />
        <span className="hidden md:block text-lg lg:text-xl font-semibold text-gray-900 tracking-wide">
          Marima Store
        </span>
      </Motion.a>

      {/* Menu mobile futuro */}
      <div className="flex items-center gap-4">
        {/* Logout */}
        <Motion.button
          onClick={() => setToken("")}
          className="bg-gray-900 text-white text-xs sm:text-sm lg:text-base px-4 sm:px-6 py-2 rounded-full shadow-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-all duration-300"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          aria-label="Encerrar sessão e sair da conta"
        >
          Sair
        </Motion.button>
      </div>
    </Motion.nav>
  );
};

export default Navbar;
