import {
  createContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { toast } from "react-toastify";
import axios, { type AxiosInstance } from "axios";
import type { Address, CartItem, Product, ShopContextValue, User } from "../types";

type PersistedAuth = { token: string | null; expiresAt: number };

export const ShopContext = createContext<ShopContextValue>({} as ShopContextValue);

const readCookieToken = (): string | null => {
  try {
    if (typeof document === "undefined") return null;
    const m = (document.cookie || "").match(/(?:^|;\s*)token=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
};

const readPersistedAuth = (): PersistedAuth => {
  try {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      readCookieToken() ||
      null;
    const expiresAt = Number(localStorage.getItem("token_expires_at") || 0);
    return { token, expiresAt };
  } catch {
    return { token: null, expiresAt: 0 };
  }
};

const now = () => Date.now();
const DEFAULT_INSTALLMENTS_QTY = 12;
const CART_STORAGE_KEY = "marima_cart_items_v1";

const readCartItems = (): CartItem[] => {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(CART_STORAGE_KEY) : null;
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const normalizeProductPricing = (product: Partial<Product> = {}): Product => {
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
  } as Product;
};

const ShopContextProvider = ({ children }: { children: ReactNode }) => {
  const currency = "R$";
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "/api";

  // ------------------ auth ------------------
  const persisted = readPersistedAuth();
  const [token, _setToken] = useState<string | null>(() => {
    if (persisted.token && persisted.expiresAt && persisted.expiresAt > now()) {
      return persisted.token;
    }
    return null;
  });
  const [expiresAt, setExpiresAt] = useState<number>(() => {
    return token ? persisted.expiresAt : 0;
  });
  const [user, setUser] = useState<User | null>(null);
  const isLoggedIn = !!(token && expiresAt && expiresAt > now());
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const forcedLogoutRef = useRef(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => readCartItems());

  const clearLogoutTimer = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }, []);

  const persistAuth = useCallback((t: string | null, exp: number) => {
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
      console.error("Erro ao persistir autenticação:", error);
    }
  }, []);

  const persistCart = useCallback((items: CartItem[]) => {
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
  }, [persistAuth, clearLogoutTimer]);

  const redirectToLogin = useCallback(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname === "/login") return;
    window.location.replace("/login");
  }, []);

  const forceLogout = useCallback(
    (message = "Sua sessão expirou. Faça login novamente.") => {
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
    (expiryMs: number) => {
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
    (t: string | null, options: { expAt?: number; ttlMs?: number } = {}) => {
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

  useEffect(() => {
    if (persisted.token && (!persisted.expiresAt || persisted.expiresAt <= now())) {
      logout();
    } else if (persisted.token) {
      scheduleAutoLogout(persisted.expiresAt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------ catálogo / ui ------------------
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  // favoritos & endereço
  const [favorites, setFavorites] = useState<(Product | string)[]>([]);
  const [address, setAddress] = useState<Address | null>(null);

  // Axios com headers compatíveis com o backend
  const api = useMemo<AxiosInstance>(() => {
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

    // response: só desconecta quando a sessão estiver inválida
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
            (serverMsg && serverMsg.trim()) ||
            "Sua sessão expirou. Faça login novamente.";
          forceLogout(message);
        }

        return Promise.reject(error);
      }
    );

    return instance;
  }, [backendUrl, token, expiresAt, forceLogout]);

  const handleAxiosError = useCallback((error: unknown, fallbackMsg = "Ocorreu um erro.") => {
    const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
    console.error("[API ERRO]", err?.response?.status, err?.response?.data || err?.message);
    const msg = err?.response?.data?.message || fallbackMsg;
    if (typeof navigator !== "undefined" && !navigator.onLine) return toast.error("Sem conexão com a internet.");
    toast.error(msg);
  }, []);

  const refreshProducts = useCallback(async () => {
    try {
      const { data } = await api.get("/api/product/list");
      if (data?.success) {
        const normalized = (data.products || []).map((p: Product) =>
          normalizeProductPricing(p)
        );
        setProducts(normalized);
      } else {
        toast.error(data?.message || "Não foi possível carregar os produtos.");
      }
    } catch (e) {
      handleAxiosError(e, "Não foi possível carregar os produtos.");
    }
  }, [api, handleAxiosError]);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  // ===== CARRINHO =====
  const addToCart = useCallback(
    (
      product: Product,
      options: {
        size?: string | null;
        variantId?: string | null;
        quantity?: number;
        uid?: string;
        href?: string;
        yampiLink?: string;
      } = {}
    ) => {
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
          ? Number(product.installments?.value)
          : fallbackQty > 0
          ? basePrice / fallbackQty
          : 0;
      const installmentsInfo =
        product.installments && Number(product.installments?.value) >= 0
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
        const newEntry: CartItem = {
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

  const removeFromCart = useCallback((uid: string) => {
    setCartItems((prev) => prev.filter((item) => item.uid !== uid));
  }, []);

  const updateCartItemQuantity = useCallback((uid: string, delta: number) => {
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
      (max, item) =>
        Math.max(max, item.installments?.quantity || DEFAULT_INSTALLMENTS_QTY),
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
    (limit = 3, extraExclude: string[] = []) => {
      const exclude = new Set([
        ...cartItems.map((item) => item.productId),
        ...(extraExclude || []),
      ]);
      const pool = (products || []).filter(
        (product) => product && !exclude.has(product._id || product.id || "")
      );
      pool.sort((a, b) => Number(b.bestseller) - Number(a.bestseller));
      return pool.slice(0, limit);
    },
    [cartItems, products]
  );

  // ===== FAVORITOS =====
  const loadFavorites = useCallback(async () => {
    if (!isLoggedIn) {
      setFavorites([]);
      return;
    }
    try {
      const { data } = await api.get("/api/user/favorites");
      if (data?.success) setFavorites(data.items || []);
    } catch {
      /* silencioso */
    }
  }, [api, isLoggedIn]);

  const isFavorite = useCallback(
    (productId: string) =>
      favorites.some((p) => (typeof p === "string" ? p : p?._id || p?.id) === productId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (productOrId: Product | string) => {
      if (!isLoggedIn) {
        toast.info("Faça login para salvar favoritos.");
        if (typeof window !== "undefined") window.location.href = "/login";
        return;
      }
      const productId =
        typeof productOrId === "string" ? productOrId : productOrId?._id || productOrId?.id;
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

  // ===== ENDEREÇO =====
  const loadAddress = useCallback(async () => {
    if (!isLoggedIn) {
      setAddress(null);
      return;
    }
    try {
      const { data } = await api.get("/api/user/address");
      if (data?.success) setAddress(data.address || null);
    } catch {
      /* ignore */
    }
  }, [api, isLoggedIn]);

  const saveAddress = useCallback(
    async (form: Address) => {
      try {
        const { data } = await api.put("/api/user/address", form);
        if (data?.success) {
          setAddress(data.address);
          toast.success("Endereço salvo!");
        }
        return data;
      } catch (e) {
        handleAxiosError(e, "Erro ao salvar endereço.");
        return { success: false };
      }
    },
    [api, handleAxiosError]
  );

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
      } catch (error: unknown) {
        const err = error as { response?: { status?: number }; message?: string };
        if (!active) return;
        if (err?.response?.status !== 401) {
          console.error("[perfil] erro ao carregar perfil", err?.message || err);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [isLoggedIn, api]);

  useEffect(() => {
    persistCart(cartItems);
  }, [cartItems, persistCart]);

  useEffect(() => {
    loadFavorites();
    loadAddress();
  }, [isLoggedIn, loadFavorites, loadAddress]);

  const value: ShopContextValue = {
    products,
    setProducts,
    refreshProducts,
    currency,
    backendUrl,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    token,
    setToken,
    user,
    setUser,
    isLoggedIn,
    logout,
    api,
    expiresAt,
    favorites,
    isFavorite,
    toggleFavorite,
    loadFavorites,
    address,
    saveAddress,
    loadAddress,
    cartItems,
    cartCount,
    cartSummary,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCartRecommendations,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export default ShopContextProvider;
