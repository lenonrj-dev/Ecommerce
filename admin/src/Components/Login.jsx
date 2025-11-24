import React, { useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { motion as Motion } from "framer-motion";

const Login = ({ setToken }) => {
  const [email, seteMail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${backendUrl}/api/user/admin`, {
        email,
        password,
      });

      const payload = response.data?.data || {};
      const authToken = payload.token;
      const rawExpAt = Number(payload.expAt);
      const normalizedExpAt = Number.isFinite(rawExpAt) ? rawExpAt : undefined;
      const expiresInSeconds = Number(payload.expiresIn);
      const ttlMs =
        normalizedExpAt && normalizedExpAt > Date.now()
          ? normalizedExpAt - Date.now()
          : Number.isFinite(expiresInSeconds) && expiresInSeconds > 0
          ? expiresInSeconds * 1000
          : undefined;

      if (response.data.success && authToken) {
        setToken(authToken, { ttlMs, expAt: normalizedExpAt });
        toast.success("Login realizado com sucesso!");
      } else {
        toast.error(response.data.message || "Token invǭlido.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Erro ao realizar login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 px-4 py-10">
      <Motion.div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* SEO Heading */}
        <Motion.h1
          className="text-3xl font-extrabold text-gray-900 mb-2 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Login Administrativo Seguro
        </Motion.h1>
        <p className="text-sm text-gray-600 mb-8 text-center">
          Acesse o <span className="font-semibold">Painel de Gestão</span> com segurança e rapidez
        </p>

        {/* Form */}
        <form onSubmit={onSubmitHandler} className="space-y-5">
          {/* Email */}
          <Motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="email"
            >
              Endereço de e-mail
            </label>
            <Motion.input
              id="email"
              type="email"
              placeholder="admin@exemplo.com"
              value={email}
              onChange={(e) => seteMail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-800 transition text-gray-800"
              whileFocus={{ scale: 1.01 }}
            />
          </Motion.div>

          {/* Password */}
          <Motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="password"
            >
              Senha
            </label>
            <Motion.input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-800 transition text-gray-800"
              whileFocus={{ scale: 1.01 }}
            />
          </Motion.div>

          {/* Submit Button */}
          <Motion.button
            type="submit"
            className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold shadow-md hover:bg-gray-800 transition duration-200"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Entrar no Painel
          </Motion.button>
        </form>

        {/* Info */}
        <Motion.p
          className="text-center text-sm text-gray-500 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          🔒 Acesso restrito exclusivamente a administradores autorizados
        </Motion.p>
      </Motion.div>
    </div>
  );
};

export default Login;
