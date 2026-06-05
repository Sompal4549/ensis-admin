import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

const BASE_API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:4000"
).replace(/\/$/, "");

export const API_URL = BASE_API_URL.endsWith("/api/v1") ? BASE_API_URL : `${BASE_API_URL}/api/v1`;
export const BACKEND_URL = API_URL.replace(/\/api\/v1$/, "");


export type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
};

export type Product = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock?: number;
  images?: string[];
  isActive?: boolean;
  category?: Category | string;
};

export type ComponentContent = {
  _id: string;
  key: string;
  label: string;
  page: string;
  description?: string;
  data: Record<string, unknown>;
  isActive: boolean;
};

export type MediaFile = {
  name: string;
  url: string;
};

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

type ApiEnvelope<T> = {
  status: "success" | "error";
  message: string;
  data: T;
};

const TOKEN_KEY = "ensis_admin_token";
const USER_KEY = "ensis_admin_user";

export const authStore = {
  getToken: () => (typeof window === "undefined" ? "" : localStorage.getItem(TOKEN_KEY) || ""),
  setSession: (accessToken: string, user: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getUser: (): AuthUser | null => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
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
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "API request failed";
    throw new Error(message);
  }
};

export const adminApi = {
  login: (email: string, password: string) =>
    request<{ user: AuthUser; accessToken: string }>("/admin/login", {
      method: "POST",
      data: { email, password },
    }),
  dashboard: () => request<Record<string, unknown>>("/admin/dashboard"),
  listUsers: () => request<AuthUser[]>("/admin/users"),
  createUser: (payload: any) => request<AuthUser>("/admin/users", { method: "POST", data: payload }),
  updateUser: (id: string, payload: any) =>
    request<AuthUser>(`/admin/users/${id}`, { method: "PUT", data: payload }),
  deleteUser: (id: string) => request<null>(`/admin/users/${id}`, { method: "DELETE" }),
};

export const categoryApi = {
  list: () => request<Category[]>("/categories"),
  create: (payload: Pick<Category, "name" | "description">) =>
    request<Category>("/categories", { method: "POST", data: payload }),
  update: (id: string, payload: Pick<Category, "name" | "description">) =>
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
    h1: string;
    canonical?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
  };
  advanceSeo?: {
    headCode?: string;
    bodyCode?: string;
  };
  robots?: string;
  faqs?: Array<{ question: string; answer: string }>;
}

export const pageApi = {
    // Backend handles 'home' as '/'
    get: (slug: string) => request<PageData>(`/pages/${slug}`),
    
    create: (payload: any) => request('/pages', {
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
