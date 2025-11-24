import { Route, Routes } from 'react-router-dom';
import './App.css';
import Navbar from './Components/Navbar';
import Sidebar from './Components/Sidebar';
import Add from './Pages/Add';
import List from './Pages/List';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Login from './Components/Login';
import { ToastContainer, toast } from 'react-toastify';
import User from './Pages/User';
import Feedback from './Pages/Feedback';
import Notifications from './Pages/Notifications';
import axios from 'axios';

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = ' R$  ';
const ADMIN_SESSION_TTL_MS = 60 * 60 * 1000;
const ADMIN_TOKEN_KEY = 'admin_token';
const ADMIN_TOKEN_EXP_KEY = 'admin_token_expires_at';

const readAdminSession = () => {
  if (typeof window === 'undefined') {
    return { token: '', expiresAt: 0 };
  }
  try {
    const storedToken = localStorage.getItem(ADMIN_TOKEN_KEY) || '';
    const storedExpires = Number(localStorage.getItem(ADMIN_TOKEN_EXP_KEY) || 0);
    if (storedToken && storedExpires > Date.now()) {
      return { token: storedToken, expiresAt: storedExpires };
    }
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_TOKEN_EXP_KEY);
  } catch {
    /* ignore */
  }
  return { token: '', expiresAt: 0 };
};

function App() {
  const initialSession = useMemo(() => readAdminSession(), []);
  const [token, setTokenState] = useState(initialSession.token);
  const [expiresAt, setExpiresAt] = useState(initialSession.expiresAt);
  const logoutTimerRef = useRef(null);
  const forcedLogoutRef = useRef(false);

  const clearAutoLogout = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }, []);

  const setToken = useCallback(
    (value, options = {}) => {
      if (!value) {
        setTokenState('');
        setExpiresAt(0);
        clearAutoLogout();
        return;
      }
      const nowTs = Date.now();
      const expOverride =
        typeof options.expAt === 'number' && options.expAt > nowTs
          ? options.expAt
          : null;
      const ttlMs = options.ttlMs ?? ADMIN_SESSION_TTL_MS;
      const exp = expOverride ?? nowTs + ttlMs;
      setTokenState(value);
      setExpiresAt(exp);
      forcedLogoutRef.current = false;
    },
    [clearAutoLogout]
  );

  const forceLogout = useCallback(
    (message = 'Sessão expirada. Faça login novamente.') => {
      if (forcedLogoutRef.current) return;
      forcedLogoutRef.current = true;
      toast.dismiss('admin-auth');
      toast.info(message, { toastId: 'admin-auth' });
      setToken('');
    },
    [setToken]
  );

  const scheduleAutoLogout = useCallback(
    (expiryMs) => {
      if (!expiryMs) return;
      clearAutoLogout();
      const msLeft = Math.max(0, expiryMs - Date.now());
      if (msLeft === 0) {
        forceLogout();
        return;
      }
      logoutTimerRef.current = setTimeout(() => {
        forceLogout();
      }, msLeft);
    },
    [clearAutoLogout, forceLogout]
  );

  useEffect(() => {
    if (token && expiresAt) {
      scheduleAutoLogout(expiresAt);
    } else {
      clearAutoLogout();
    }
    return () => clearAutoLogout();
  }, [token, expiresAt, scheduleAutoLogout, clearAutoLogout]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
      localStorage.setItem(ADMIN_TOKEN_EXP_KEY, String(expiresAt || 0));
    } else {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_TOKEN_EXP_KEY);
    }
  }, [token, expiresAt]);

  useEffect(() => {
    const reqId = axios.interceptors.request.use((config) => {
      if (token) {
        config.headers = config.headers || {};
        config.headers.token = token;
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    const resId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;
        const serverMsg = error?.response?.data?.message || '';
        const tokenExpiredLike =
          status === 401 ||
          status === 403 ||
          status === 419 ||
          status === 498 ||
          /expired|invalid|jwt|token/i.test(serverMsg);

        if (tokenExpiredLike) {
          const message =
            (serverMsg && serverMsg.trim()) || 'Sessão expirada. Faça login novamente.';
          forceLogout(message);
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(reqId);
      axios.interceptors.response.eject(resId);
    };
  }, [token, forceLogout]);

  return (
    <div className='bg-gray-50 min-h-screen'>
      <ToastContainer />
      {token === '' ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} />
          <hr />
          <div className='flex w-full'>
            <Sidebar />
            <div className='w-[70%] mx-auto ml-[max(5vw, 25px)] my-8  text-gray-600 text-base'>
              <Routes>
                <Route path='/add' element={<Add token={token} />} />
                <Route path='/list' element={<List token={token} />} />
                <Route path='/user' element={<User token={token} />} />
                <Route path='/feedback' element={<Feedback token={token} />} />
                <Route path='/notifications' element={<Notifications token={token} />} />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
