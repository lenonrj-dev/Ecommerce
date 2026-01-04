export interface Installments {
  quantity: number;
  value: number;
}

export interface ProductVariant {
  _id?: string;
  id?: string;
  size?: string;
  isActive?: boolean;
  price?: number;
  pixPrice?: number;
  installments?: Installments;
}

export interface Product {
  _id?: string;
  id?: string;
  slug?: string;
  name: string;
  description?: string;
  price: number;
  pixPrice?: number;
  installments?: Installments;
  category?: string;
  subCategory?: string;
  bestseller?: boolean;
  image?: string | string[];
  images?: string[];
  image1?: string;
  thumbnail?: string;
  sizes?: string[];
  variants?: ProductVariant[];
  combineWith?: string[];
  yampiLink?: string;
  yampiLinks?: Record<string, string>;
  link?: string;
  priceCard12x?: number;
}

export interface CartItem {
  uid: string;
  productId: string;
  name: string;
  image?: string;
  pixPrice: number;
  price: number;
  installments: Installments;
  size?: string | null;
  variantId?: string | null;
  quantity: number;
  href: string;
  yampiLink?: string;
}

export interface Address {
  zipcode?: string;
  street?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
}

export interface User {
  _id?: string;
  name?: string;
  email?: string;
  favorites?: string[];
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  createdAt?: string;
  read?: boolean;
  url?: string;
}

export interface CommentItem {
  _id: string;
  author?: string;
  text: string;
  rating?: number;
  createdAt?: string;
}

export interface ApiListResponse<T> {
  success: boolean;
  message?: string;
  items?: T[];
  products?: Product[];
}

export interface ShopContextValue {
  products: Product[];
  setProducts: (products: Product[]) => void;
  refreshProducts: () => Promise<void>;
  currency: string;
  backendUrl: string;
  search: string;
  setSearch: (s: string) => void;
  showSearch: boolean;
  setShowSearch: (s: boolean) => void;
  token: string | null;
  setToken: (token: string | null, options?: { expAt?: number; ttlMs?: number }) => void;
  user: User | null;
  setUser: (u: User | null) => void;
  isLoggedIn: boolean;
  logout: () => void;
  api: import("axios").AxiosInstance;
  expiresAt: number;
  favorites: Product[] | string[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productOrId: Product | string) => Promise<void>;
  loadFavorites: () => Promise<void>;
  address: Address | null;
  saveAddress: (form: Address) => Promise<unknown>;
  loadAddress: () => Promise<void>;
  cartItems: CartItem[];
  cartCount: number;
  cartSummary: { pixTotal: number; installmentValue: number; installmentQty: number };
  addToCart: (product: Product, options?: { size?: string | null; variantId?: string | null; quantity?: number; uid?: string; href?: string; yampiLink?: string }) => void;
  removeFromCart: (uid: string) => void;
  updateCartItemQuantity: (uid: string, delta: number) => void;
  clearCart: () => void;
  getCartRecommendations: (limit?: number, extraExclude?: string[]) => Product[];
}
