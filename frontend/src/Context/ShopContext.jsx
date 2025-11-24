// src/Context/ShopContext.jsx
import { createContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const ShopContext = createContext();

const readCookieToken = () => {
  try {
    if (typeof document === "undefined") return null;
    const m = (document.cookie || "").match(/(?:^|;\s*)token=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  } catch { return null; }
};

const readPersistedAuth = () => {
  try {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      readCookieToken() || null;
    const expiresAt = Number(localStorage.getItem("token_expires_at") || 0);
    return { token, expiresAt };
  } catch {
    return { token: null, expiresAt: 0 };
  }
};

const now = () => Date.now();
const DEFAULT_INSTALLMENTS_QTY = 12;
const CART_STORAGE_KEY = "marima_cart_items_v1";

const readCartItems = () => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const normalizeProductPricing = (product = {}) => {
  const price = Number(product.price) || 0;

  let pixPrice = Number(product.pixPrice);
  if (!Number.isFinite(pixPrice) || pixPrice < 0) pixPrice = price;

  const qty = Number(product.installments?.quantity);
  const val = Number(product.installments?.value);

  const installmentsQuantity =
    Number.isFinite(qty) && qty > 0 ? qty : DEFAULT_INSTALLMENTS_QTY;
  const installmentsValue =
    Number.isFinite(val) && val >= 0
      ? val
      : installmentsQuantity > 0
      ? price / installmentsQuantity
      : price;

  return {
    ...product,
    price,
    pixPrice,
    installments: {
      quantity: installmentsQuantity,
      value: installmentsValue,
    },
    priceCard12x: installmentsValue,
  };
};

const ShopContextProvider = ({ children }) => {
  const currency = "R$";
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

  // ------------------ auth ------------------
  const persisted = readPersistedAuth();
  const [token, _setToken] = useState(() => {
    // invalida se jÃ¡ expirou
    if (persisted.token && persisted.expiresAt && persisted.expiresAt > now()) {
      return persisted.token;
    }
    return null;
  });
  const [expiresAt, setExpiresAt] = useState(() => {
    return token ? persisted.expiresAt : 0;
  });
  const [user, setUser] = useState(null);
  const isLoggedIn = !!(token && expiresAt && expiresAt > now());
  const logoutTimerRef = useRef(null);
  const forcedLogoutRef = useRef(false);
  const [cartItems, setCartItems] = useState(() => readCartItems());

  const clearLogoutTimer = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }, []);

  const persistAuth = useCallback((t, exp) => {
    try {
      if (t && exp) {
        localStorage.setItem("token", t);
        localStorage.setItem("token_expires_at", String(exp));
        document.cookie = `token=${encodeURIComponent(t)}; path=/; SameSite=Lax`;
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        localStorage.removeItem("token_expires_at");
        document.cookie = "token=; Max-Age=0; path=/";
      }
    } catch (error) {
      console.error("Erro ao persistir autenticaÃ§Ã£o:", error);
    }
  }, []);

  const persistCart = useCallback((items) => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Erro ao salvar carrinho:", error);
    }
  }, []);

  const clearSessionState = useCallback(() => {
    _setToken(null);
    setExpiresAt(0);
    setUser(null);
    persistAuth(null, 0);
    clearLogoutTimer();
  }, [_setToken, setExpiresAt, setUser, persistAuth, clearLogoutTimer]);

  const redirectToLogin = useCallback(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname === "/login") return;
    window.location.replace("/login");
  }, []);

  const forceLogout = useCallback(
    (message = "Sua sessÃ£o expirou. FaÃ§a login novamente.") => {
      if (forcedLogoutRef.current) return;
      forcedLogoutRef.current = true;
      toast.dismiss("auth-expired");
      toast.info(message, { toastId: "auth-expired" });
      clearSessionState();
      setTimeout(() => redirectToLogin(), 400);
    },
    [clearSessionState, redirectToLogin]
  );

  const scheduleAutoLogout = useCallback(
    (expiryMs) => {
      clearLogoutTimer();
      const msLeft = Math.max(0, expiryMs - now());
      if (msLeft === 0) {
        forceLogout();
        return;
      }
      logoutTimerRef.current = setTimeout(() => {
        forceLogout();
      }, msLeft);
    },
    [forceLogout, clearLogoutTimer]
  );

  const setToken = useCallback(
    (t, options = {}) => {
      if (!t) {
        clearSessionState();
        return;
      }

      const current = now();
      const expFromServer =
        typeof options.expAt === "number" && options.expAt > current
          ? options.expAt
          : null;
      const ttlMs = options.ttlMs ?? 3600000;
      const fallbackExp = current + ttlMs;
      const exp = expFromServer ?? fallbackExp;

      _setToken(t);
      setExpiresAt(exp);
      persistAuth(t, exp);
      forcedLogoutRef.current = false;
      scheduleAutoLogout(exp);
    },
    [scheduleAutoLogout, clearSessionState, persistAuth]
  );

  const logout = useCallback(() => {
    forcedLogoutRef.current = false;
    clearSessionState();
  }, [clearSessionState]);

  // Invalida sessÃ£o se jÃ¡ vier expirada ao montar
  useEffect(() => {
    if (persisted.token && (!persisted.expiresAt || persisted.expiresAt <= now())) {
      logout();
    } else if (persisted.token) {
      scheduleAutoLogout(persisted.expiresAt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------ catÃ¡logo / ui ------------------
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [products, setProducts] = useState([]);

  // favoritos & endereÃ§o
  const [favorites, setFavorites] = useState([]);
  const [address, setAddress] = useState(null);

  // Axios com headers compatÃ­veis com o backend
  const api = useMemo(() => {
    const instance = axios.create({ baseURL: backendUrl, timeout: 20000 });

    // request: injeta token
    instance.interceptors.request.use((config) => {
      if (token && expiresAt && expiresAt > now()) {
        config.headers = config.headers || {};
        config.headers.token = token;
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // response: sÃ³ desconecta quando a sessÃ£o estiver invÃ¡lida
    instance.interceptors.response.use(
      (res) => res,
      (error) => {
        const status = error?.response?.status;
        const serverMsg = error?.response?.data?.message || "";

        const tokenExpiredLike =
          status === 401 ||
          status === 403 ||
          status === 419 ||
          status === 498 ||
          /expired|invalid|jwt|token/i.test(serverMsg);

        if (tokenExpiredLike) {
          const message =
            (serverMsg && serverMsg.trim()) || "Sua sessÃ£o expirou. FaÃ§a login novamente.";
          forceLogout(message);
        }

        return Promise.reject(error);
      }
    );

    return instance;
  }, [backendUrl, token, expiresAt, forceLogout]);

  const handleAxiosError = useCallback((error, fallbackMsg = "Ocorreu um erro.") => {
    console.error("[API ERRO]", error?.response?.status, error?.response?.data || error?.message);
    const msg = error?.response?.data?.message || fallbackMsg;
    if (!navigator.onLine) return toast.error("Sem conexÃ£o com a internet.");
    toast.error(msg);
  }, []);

  const refreshProducts = useCallback(async () => {
    try {
      const { data } = await api.get("/api/product/list");
      if (data?.success) {
        const normalized = (data.products || []).map((p) => normalizeProductPricing(p));
        setProducts(normalized);
      } else {
        toast.error(data?.message || "NÃ£o foi possÃ­vel carregar os produtos.");
      }
    } catch (e) { handleAxiosError(e, "NÃ£o foi possÃ­vel carregar os produtos."); }
  }, [api, handleAxiosError]);

  useEffect(() => { refreshProducts(); }, [refreshProducts]);

  // ===== CARRINHO =====
  const addToCart = useCallback(
    (product, options = {}) => {
      if (!product) return;
      const productId = product._id || product.id;
      if (!productId) return;

      const basePrice = Number(product.price) || 0;
      const pixValue =
        Number.isFinite(Number(product.pixPrice)) && Number(product.pixPrice) >= 0
          ? Number(product.pixPrice)
          : basePrice;
      const fallbackQty = product.installments?.quantity || DEFAULT_INSTALLMENTS_QTY;
      const fallbackVal =
        Number.isFinite(Number(product.installments?.value))
          ? Number(product.installments.value)
          : fallbackQty > 0
          ? basePrice / fallbackQty
          : 0;
      const installmentsInfo =
        product.installments && Number(product.installments.value) >= 0
          ? {
              quantity: product.installments.quantity || DEFAULT_INSTALLMENTS_QTY,
              value: Number(product.installments.value),
            }
          : {
              quantity: fallbackQty,
              value: fallbackVal,
            };

      const sizeKey = options.size || "UNICO";
      const variantKey = options.variantId || "base";
      const uid = options.uid || `${productId}:${variantKey}:${sizeKey}`;

      setCartItems((prev) => {
        const exists = prev.find((item) => item.uid === uid);
        if (exists) {
          return prev.map((item) =>
            item.uid === uid
              ? { ...item, quantity: item.quantity + (options.quantity || 1) }
              : item
          );
        }
        const newEntry = {
          uid,
          productId,
          name: product.name,
          image: Array.isArray(product.image) ? product.image[0] : product.image,
          pixPrice: pixValue,
          price: basePrice,
          installments: installmentsInfo,
          size: options.size || null,
          variantId: options.variantId || null,
          quantity: options.quantity && options.quantity > 0 ? options.quantity : 1,
          href: product._id ? `/product/${product._id}` : product.link || options.href || "#",
          yampiLink: options.yampiLink || product.yampiLink || "",
        };
        return [...prev, newEntry];
      });
      toast.success("Produto adicionado à sacola.");
    },
    []
  );

  const removeFromCart = useCallback((uid) => {
    setCartItems((prev) => prev.filter((item) => item.uid !== uid));
  }, []);

  const updateCartItemQuantity = useCallback((uid, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.uid === uid
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const cartSummary = useMemo(() => {
    if (!cartItems.length) {
      return {
        pixTotal: 0,
        installmentValue: 0,
        installmentQty: DEFAULT_INSTALLMENTS_QTY,
      };
    }

    const pixTotal = cartItems.reduce(
      (sum, item) => sum + item.pixPrice * item.quantity,
      0
    );

    const installmentQty = cartItems.reduce(
      (max, item) => Math.max(max, item.installments?.quantity || DEFAULT_INSTALLMENTS_QTY),
      DEFAULT_INSTALLMENTS_QTY
    );

    const installmentValue = cartItems.reduce((sum, item) => {
      const value =
        item.installments?.value ??
        (item.price && item.installments?.quantity
          ? item.price / item.installments.quantity
          : 0);
      return sum + value * item.quantity;
    }, 0);

    return { pixTotal, installmentValue, installmentQty };
  }, [cartItems]);

  const getCartRecommendations = useCallback(
    (limit = 3, extraExclude = []) => {
      const exclude = new Set([
        ...cartItems.map((item) => item.productId),
        ...(extraExclude || []),
      ]);
      const pool = (products || []).filter(
        (product) => product && !exclude.has(product._id)
      );
      pool.sort((a, b) => Number(b.bestseller) - Number(a.bestseller));
      return pool.slice(0, limit);
    },
    [cartItems, products]
  );

  // ===== FAVORITOS =====
  const loadFavorites = useCallback(async () => {
    if (!isLoggedIn) return setFavorites([]);
    try {
      const { data } = await api.get("/api/user/favorites");
      if (data?.success) setFavorites(data.items || []);
    } catch {
      /* silencioso */
    }
  }, [api, isLoggedIn]);

  const isFavorite = useCallback(
    (productId) => favorites.some((p) => (p?._id || p) === productId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (productOrId) => {
      if (!isLoggedIn) {
        toast.info("FaÃ§a login para salvar favoritos.");
        return (window.location.href = "/login");
      }
      const productId = typeof productOrId === "string" ? productOrId : productOrId?._id;
      if (!productId) return;

      try {
        const { data } = await api.post("/api/user/favorites/toggle", { productId });
        if (data?.success) setFavorites(data.items || []);
      } catch (e) {
        handleAxiosError(e, "Erro ao atualizar favorito.");
      }
    },
    [api, isLoggedIn, handleAxiosError]
  );

  // ===== ENDEREÃ‡O =====
  const loadAddress = useCallback(async () => {
    if (!isLoggedIn) return setAddress(null);
    try {
      const { data } = await api.get("/api/user/address");
      if (data?.success) setAddress(data.address || null);
    } catch { /* ignore */ }
  }, [api, isLoggedIn]);

  const saveAddress = useCallback(async (form) => {
    try {
      const { data } = await api.put("/api/user/address", form);
      if (data?.success) {
        setAddress(data.address);
        toast.success("EndereÃ§o salvo!");
      }
      return data;
    } catch (e) {
      handleAxiosError(e, "Erro ao salvar endereÃ§o.");
      return { success: false };
    }
  }, [api, handleAxiosError]);

  useEffect(() => {
    if (!isLoggedIn) {
      setUser(null);
      return;
    }
    let active = true;

    (async () => {
      try {
        const { data } = await api.get("/api/user/profile");
        if (!active) return;
        if (data?.success && data.user) {
          setUser(data.user);
        }
      } catch (error) {
        if (!active) return;
        if (error?.response?.status !== 401) {
          console.error("[perfil] erro ao carregar perfil", error?.message || error);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [isLoggedIn, api, setUser]);

  useEffect(() => {
    persistCart(cartItems);
  }, [cartItems, persistCart]);

  useEffect(() => { loadFavorites(); loadAddress(); }, [isLoggedIn, loadFavorites, loadAddress]);

  const value = {
    products, setProducts, refreshProducts,
    currency, backendUrl,
    search, setSearch, showSearch, setShowSearch,
    token, setToken, user, setUser, isLoggedIn, logout, api, expiresAt,
    favorites, isFavorite, toggleFavorite, loadFavorites,
    address, saveAddress, loadAddress,
    cartItems, cartCount, cartSummary,
    addToCart, removeFromCart, updateCartItemQuantity,
    clearCart, getCartRecommendations,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export default ShopContextProvider;


