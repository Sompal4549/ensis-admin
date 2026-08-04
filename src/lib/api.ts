import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

const BASE_API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

export const API_URL = BASE_API_URL.endsWith("/api/v1") ? BASE_API_URL : `${BASE_API_URL}/api/v1`;
export const BACKEND_URL = API_URL.replace(/\/api\/v1$/, "");


export type Category = {
  _id: string;
  name: string;
  image?: string;
};

export type Product = {
  _id: string;
  title: string;
  slug: string;
  code?: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number;
  category?: Category | string;
  subcategory?: string;
  material?: string;
  weight?: string;
  images?: string[];
  stock?: number;
  tags?: string[];
  averageRating?: number;
  reviews?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  overview?: {
    title?: string;
    description?: string;
    overviewList?: string[];
    seeItInRealSpaces?: { title: string; images: { image: string; imageAlt: string }[] };
    productPricingFeatures?: { title: string; image: string }[];
    emiOptions?: boolean;
    customSize?: boolean;
    specifications?: { title: string; specificationsList: { title: string; description: string }[] };
    keyFeatures?: { title: string; keyFeaturesList: string[] };
    idealFor?: string;
    dimensions?: { title: string; dimensionsList: { title: string; description: string }[] };
    materialAndCare?: { title: string; description: string };
    productSpecifications?: { highlight: string; title: string; image: string; specifications: { title: string; description: string }[] }[];
    whatisInclueded?: string[];
    items?: { image: string; title: string; description: string }[];
    smartDesignAppearance?: {
      highlight?: string;
      title?: string;
      woodFinish?: { image: string; title: string }[];
      sizeOptions?: { title: string; description: string }[];
    };
    faqs?: { question: string; description: string }[];
  };
};

export type ComponentContent = {
  _id: string;
  key: string;
  label: string;
  page: string;
  description?: string;
  data: Record<string, unknown>;
  isActive: boolean;
  index?: number;
};

export type MediaFile = {
  name: string;
  url: string;
};

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
};

export type Order = {
  _id: string;
  user: string | AuthUser;
  items: Array<{
    product: string | Product;
    name?: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  shippingAddress: {
    label: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
};

type ApiEnvelope<T> = {
  status: "success" | "error";
  message: string;
  data: T;
};

const TOKEN_KEY = "ensis_admin_token";
const USER_KEY = "ensis_admin_user";
const AUTH_EXPIRED_EVENT = "ensis:auth-expired";

const isBrowser = () => typeof window !== "undefined";

const decodeJwtPayload = (token: string): { exp?: number } | null => {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = window.atob(normalizedPayload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

const isTokenExpired = (token: string) => {
  if (!isBrowser()) return false;
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 <= Date.now();
};

const notifyAuthExpired = () => {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
};

export const authStore = {
  authExpiredEvent: AUTH_EXPIRED_EVENT,
  getToken: () => (isBrowser() ? localStorage.getItem(TOKEN_KEY) || "" : ""),
  isTokenExpired,
  setSession: (accessToken: string, user: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getUser: (): AuthUser | null => {
    if (!isBrowser()) return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  expireSession: () => {
    authStore.clear();
    notifyAuthExpired();
  },
};

export const getImageUrl = (image?: string) => {
  if (!image || typeof image !== "string") return "";
  if (image.startsWith("http")) return image;
  if (!image.startsWith("/uploads")) return image;
  return `${BACKEND_URL}${image.startsWith("/") ? image : `/${image}`}`;
};

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = authStore.getToken();
  if (token) {
    if (authStore.isTokenExpired(token)) {
      authStore.expireSession();
      return Promise.reject(new Error("Session expired. Please sign in again."));
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = String(error?.config?.url || "");
    const isAuthRequest =
      requestUrl.includes("/admin/login") ||
      requestUrl.includes("/admin/logout") ||
      requestUrl.includes("/auth/whatsapp-otp/send");

    if ((status === 401 || status === 403) && !isAuthRequest && authStore.getToken()) {
      authStore.expireSession();
    }

    return Promise.reject(error);
  }
);
export type Click = {
  _id: string;
  platform: string;
  ip: string;
  userAgent: string;
  createdAt: string;
};

export type Stat = {
  _id: string;
  count: number;
};
export type SocialLink = {
  _id: string;
  platform: string;
  url: string;
  icon?: string;
  isActive: boolean;
  order: number;
}
export const socialClickApi = {
  list: (page = 1, limit = 50, platform?: string) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (platform) {
      params.set("platform", platform);
    }

    return request<{
      clicks: Click[];
      total: number;
    }>(`/social-clicks?${params.toString()}`);
  },

  stats: () => {
    return request<Stat[]>("/social-clicks/stats");
  },

   links: {
    list: () => {
      return request<SocialLink[]>("/social-clicks/links");
    },

    create: (data: Omit<SocialLink, "_id">) => {
      return request<SocialLink>("/social-clicks/links", {
        method: "POST",
        data,
      });
    },

    update: (id: string, data: Partial<SocialLink>) => {
      return request<SocialLink>(`/social-clicks/links/${id}`, {
        method: "PUT",
        data,
      });
    },

    remove: (id: string) => {
      return request<{ success: boolean }>(
        `/social-clicks/links/${id}`,
        {
          method: "DELETE",
        }
      );
    },
  },
};

const request = async <T>(path: string, options: AxiosRequestConfig = {}) => {
  try {
    const response = await api.request<ApiEnvelope<T>>({
      url: path,
      ...options,
    });
    const payload = response.data;
    if (payload.status === "error") {
      throw new Error(payload.message || "API request failed");
    }
    return payload.data;
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || (error as Error).message || "API request failed";
    throw new Error(message);
  }
};

export const adminApi = {
  login: (mobile: string, password: string) =>
    request<{ user: AuthUser; accessToken: string }>("/admin/login", {
      method: "POST",
      data: { mobile, password },
    }),

  dashboard: () => request<Record<string, unknown>>("/admin/dashboard"),

  listUsers: () => request<AuthUser[]>("/admin/users"),

  createUser: (payload: Record<string, unknown>) =>
    request<AuthUser>("/admin/users", {
      method: "POST",
      data: payload,
    }),

  updateUser: (
    id: string,
    payload: Record<string, unknown>
  ) =>
    request<AuthUser>(`/admin/users/${id}`, {
      method: "PUT",
      data: payload,
    }),

  deleteUser: (id: string) =>
    request<null>(`/admin/users/${id}`, {
      method: "DELETE",
    }),

  changeUserRole: (
    userId: string,
    role: string
  ) =>
    request<AuthUser>("/admin/users/role", {
      method: "PUT",
      data: {
        userId,
        role,
      },
    }),

  addProductReview: (
    productId: string,
    payload: { customerId: string; rating: number; comment: string }
  ) =>
    request<unknown>(`/admin/reviews/${productId}`, {
      method: "POST",
      data: payload,
    }),
};

export const categoryApi = {
  list: () => request<Category[]>("/categories"),
  create: (payload: Pick<Category, "name">) =>
    request<Category>("/categories", { method: "POST", data: payload }),
  update: (id: string, payload: Partial<Pick<Category, "name">>) =>
    request<Category>(`/categories/${id}`, { method: "PUT", data: payload }),
  remove: (id: string) => request<null>(`/categories/${id}`, { method: "DELETE" }),
};

export const productApi = {
  list: () => request<{ products: Product[]; total: number; page: number; limit: number }>("/products?limit=100"),
  create: (payload: Partial<Product>) => request<Product>("/products", { method: "POST", data: payload }),
  update: (id: string, payload: Partial<Product>) =>
    request<Product>(`/products/${id}`, { method: "PUT", data: payload }),
  remove: (id: string) => request<null>(`/products/${id}`, { method: "DELETE" }),
};

export const orderApi = {
  list: () => request<Order[]>("/orders"),
  get: (id: string) => request<Order>(`/orders/${id}`),
  update: (id: string, payload: Partial<Order>) =>
    request<Order>(`/orders/${id}`, { method: "PUT", data: payload }),
};

export const componentContentApi = {
  list: () => request<ComponentContent[]>('/component-content?includeInactive=true'),
  getByKey: (key: string) => request<ComponentContent>(`/component-content/${encodeURIComponent(key)}`),
  getByPage: (page: string) => request<ComponentContent[]>(`/component-content?page=${encodeURIComponent(page)}&includeInactive=true`),
  create: (payload: Omit<ComponentContent, '_id'>) =>
    request<ComponentContent>('/component-content', { method: 'POST', data: payload }),
  update: (id: string, payload: Partial<ComponentContent>) =>
    request<ComponentContent>(`/component-content/${id}`, { method: 'PUT', data: payload }),
  remove: (id: string) => request<null>(`/component-content/${id}`, { method: 'DELETE' }),
};
export type PageData = {
  _id: string;
  pageName: string;
  slug: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords?: string;
    canonical?: string;
    ogJson?: string;
    schema?: string;
  };
  advanced?: {
    sitemap?: {
      url?: string;
      autoGenerate?: boolean;
      excludePaths?: string;
    };
    robotsTxt?: {
      content?: string;
    };
    searchConsole?: {
      googleVerification?: string;
      bingVerification?: string;
    };
    analytics?: {
      gaId?: string;
      gtmId?: string;
      fbPixelId?: string;
      clarityId?: string;
    };
  };
  advanceSeo?: {
    headCode?: string;
    bodyCode?: string;
  };
  faqs?: Array<{ question: string; answer: string }>;
};

export const pageApi = {
  // Backend handles 'home' as '/'
  get: (slug: string) => request<PageData>(`/pages/${slug}`),

  create: (payload: Partial<PageData>) => request('/pages', {
    method: 'POST',
    data: payload
  }),

  update: (id: string, payload: Partial<PageData>) => request(`/pages/${id}`, {
    method: 'PUT',
    data: payload
  })
};

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data: unknown) => request<T>(path, { method: 'POST', data }),
  put: <T>(path: string, data: unknown) => request<T>(path, { method: 'PUT', data }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export const mediaApi = {
  list: (subDir: string = "") => {
    const query = subDir ? `?subDir=${encodeURIComponent(subDir)}` : "";
    return request<MediaFile[]>(`/uploads/list${query}`);
  }
};

export const uploadImage = async (file: File, subDir: string = "") => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('subDir', subDir);

  const data = await request<{ url: string }>("/uploads", {
    method: "POST",
    data: formData,
  });
  return data.url;
};

export type Application = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  currentLocation: string;
  department: string;
  experience: string;
  coverLetter?: string;
  resume: string;
  status: "pending" | "reviewed" | "shortlisted" | "rejected";
  createdAt: string;
  updatedAt: string;
};

export const applicationApi = {  list: () =>
    request<Application[]>("/applications"),

  get: (id: string) =>
    request<Application>(`/applications/${id}`),

  create: async (formData: FormData) => {
    const response = await api.post<ApiEnvelope<Application>>(
      "/applications",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.data;
  },

  update: (
    id: string,
    payload: Partial<Application>
  ) =>
    request<Application>(`/applications/${id}`, {
      method: "PUT",
      data: payload,
    }),

  remove: (id: string) =>
    request<null>(`/applications/${id}`, {
      method: "DELETE",
    }),
};

export type ActivityAction = "create" | "update" | "delete";

export type ActivityLog = {
  _id: string;
  action: ActivityAction;
  entity: string;
  entityId?: string;
  title?: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  changes?: Record<string, { before: unknown; after: unknown }>;
  snapshotBefore?: Record<string, unknown>;
  snapshotAfter?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type ActivityLogListResponse = {
  logs: ActivityLog[];
  total: number;
  page: number;
  limit: number;
  entities: string[];
};

export const activityLogApi = {
  list: (params: {
    page?: number;
    limit?: number;
    action?: ActivityAction | "";
    entity?: string;
    search?: string;
    role?: "admin" | "customer";
  } = {}) => {
    const searchParams = new URLSearchParams({
      page: String(params.page || 1),
      limit: String(params.limit || 50),
    });
    if (params.action) searchParams.set("action", params.action);
    if (params.entity) searchParams.set("entity", params.entity);
    if (params.search) searchParams.set("search", params.search);
    if (params.role) searchParams.set("role", params.role);
    return request<ActivityLogListResponse>(`/activity-logs?${searchParams.toString()}`);
  },
};