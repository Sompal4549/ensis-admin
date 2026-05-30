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
  if (!image) return "";
  if (image.startsWith("http")) return image;
  if (!image.startsWith("/uploads")) return image;
  return `${BACKEND_URL}${image.startsWith("/") ? image : `/${image}`}`;
};

const request = async <T>(path: string, options: RequestInit = {}) => {
  const token = authStore.getToken();
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || payload.status === "error") {
    throw new Error(payload.message || "API request failed");
  }
  return payload.data;
};

export const adminApi = {
  login: (email: string, password: string) =>
    request<{ user: AuthUser; accessToken: string }>("/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  dashboard: () => request<Record<string, unknown>>("/admin/dashboard"),
};

export const categoryApi = {
  list: () => request<Category[]>("/categories"),
  create: (payload: Pick<Category, "name" | "description">) =>
    request<Category>("/categories", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: string, payload: Pick<Category, "name" | "description">) =>
    request<Category>(`/categories/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id: string) => request<null>(`/categories/${id}`, { method: "DELETE" }),
};

export const productApi = {
  list: () => request<{ products: Product[]; total: number; page: number; limit: number }>("/products?limit=100"),
  create: (payload: Partial<Product>) => request<Product>("/products", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: string, payload: Partial<Product>) =>
    request<Product>(`/products/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id: string) => request<null>(`/products/${id}`, { method: "DELETE" }),
};

export const componentContentApi = {
  list: () => request<ComponentContent[]>('/component-content?includeInactive=true'),
  getByKey: (key: string) => request<ComponentContent>(`/component-content/${encodeURIComponent(key)}`),
  create: (payload: Omit<ComponentContent, '_id'>) =>
    request<ComponentContent>('/component-content', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: Partial<ComponentContent>) =>
    request<ComponentContent>(`/component-content/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: string) => request<null>(`/component-content/${id}`, { method: 'DELETE' }),
};

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export const uploadImage = async (file: File) => {
  const token = authStore.getToken();
  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/uploads`, {
    method: 'POST',
    headers,
    body: formData,
    credentials: 'include',
  });

  const payload = (await response.json()) as ApiEnvelope<{ url: string }>;
  if (!response.ok || payload.status === 'error') {
    throw new Error(payload.message || 'Image upload failed');
  }
  return payload.data.url;
};
