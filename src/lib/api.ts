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
  gstRate?: number;
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
    finish?: string;
    size?: string;
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

export type InvoiceItem = {
  product?: string | Product;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
  amount: number;
  hsn?: string;
  sac?: string;
  size?: string;
  area?: string;
  unit?: string;
  discount?: number;
};

export type DeliveryChallan = {
  _id: string;
  challanNumber: string;
  challanDate: string;
  sourceInvoice: string;
  items: Array<{
    name: string;
    quantity: number;
    delivered: number;
    available: number;
    thisChallan: number;
  }>;
  status: "pending" | "delivered" | "cancelled";
  createdAt: string;
};

export type PurchaseOrder = {
  available: boolean;
  poNumber?: string;
  poDate?: string;
  poFile?: string;
};

export type PaymentDetails = {
  paymentStatus: "payment_received" | "full_payment_pending" | "partially_paid";
  paymentTerms?: string;
  outstandingAmount?: number;
  amountReceived?: number;
  tdsApplicable?: boolean;
  tdsRate?: number;
};

export type InvoiceAddress = {
  name: string;
  email?: string;
  phone?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  gstNumber?: string;
};

export type Invoice = {
  _id: string;
  invoiceNumber: string;
  type: "proforma" | "tax" | "credit_note" | "debit_note" | "delivery_challan";
  lead: string | Lead;
  order?: string | Order;
  items: InvoiceItem[];
  billingAddress: InvoiceAddress;
  shippingAddress?: InvoiceAddress;
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  totalAmount: number;
  status: "draft" | "sent" | "paid" | "partial" | "overdue" | "cancelled";
  paymentReceived: number;
  paymentDate?: string;
  dueDate?: string;
  notes?: string;
  termsAndConditions?: string;
  createdBy: string | AuthUser;
  createdAt: string;
  updatedAt: string;
  purchaseOrder?: PurchaseOrder;
  paymentDetails?: PaymentDetails;
  deliveryChallans?: DeliveryChallan[];
  sourceProformaInvoice?: string;
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
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
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
  listByLead: (leadId: string, page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (page) params.set("page", String(page));
    if (limit) params.set("limit", String(limit));
    const query = params.toString();
    return request<{ orders: Order[]; total: number }>(`/orders/lead/${leadId}${query ? `?${query}` : ""}`);
  },
  update: (id: string, payload: Partial<Order>) =>
    request<Order>(`/orders/${id}`, { method: "PUT", data: payload }),
  sendEmail: (id: string) => request<{ success: boolean; message: string }>(`/orders/${id}/send-email`, { method: "POST" }),
  sendWhatsApp: (id: string) => request<{ success: boolean; message: string }>(`/orders/${id}/send-whatsapp`, { method: "POST" }),
};

export const invoiceApi = {
  list: (params?: { page?: number; limit?: number; type?: string; status?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.type) searchParams.set("type", params.type);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.search) searchParams.set("search", params.search);
    const query = searchParams.toString();
    return request<{ invoices: Invoice[]; total: number; page: number; limit: number }>(`/invoices${query ? `?${query}` : ""}`);
  },
  listByLead: (leadId: string, page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (page) params.set("page", String(page));
    if (limit) params.set("limit", String(limit));
    const query = params.toString();
    return request<{ invoices: Invoice[]; total: number }>(`/invoices/lead/${leadId}${query ? `?${query}` : ""}`);
  },
  getStats: (leadId: string) =>
    request<{ totalAmount: number; paymentReceived: number; count: number; paidCount: number }>(`/invoices/lead/${leadId}/stats`),
  get: (id: string) => request<Invoice>(`/invoices/${id}`),
  create: (payload: Partial<Invoice>) => request<Invoice>("/invoices", { method: "POST", data: payload }),
  update: (id: string, payload: Partial<Invoice>) =>
    request<Invoice>(`/invoices/${id}`, { method: "PUT", data: payload }),
  remove: (id: string) => request<null>(`/invoices/${id}`, { method: "DELETE" }),
  sendEmail: (id: string) => request<{ success: boolean; message: string }>(`/invoices/${id}/send-email`, { method: "POST" }),
  sendWhatsApp: (id: string) => request<{ success: boolean; message: string }>(`/invoices/${id}/send-whatsapp`, { method: "POST" }),
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

export type MediaListResponse = {
  files: MediaFile[];
  total: number;
  page: number;
  limit: number;
};

export const mediaApi = {
  list: (subDir: string = "", page: number = 1, limit: number = 25) => {
    const params = new URLSearchParams();
    if (subDir) params.set("subDir", subDir);
    params.set("page", String(page));
    params.set("limit", String(limit));
    params.set("_t", String(Date.now()));
    return request<MediaListResponse>(`/uploads/list?${params.toString()}`);
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

export type Lead = {
  _id: string;
  leadImage?: string;
  firstName: string;
  lastName: string;
  companyName: string;
  designation?: string;
  email: string;
  officialEmail?: string;
  phone: string;
  phoneCode?: string;
  altPhone?: string;
  altPhoneCode?: string;
  landline?: string;
  website?: string;
  title?: string;
  typeOfBusiness?: string;
  industrySector?: string;
  marketType?: "Domestic" | "International";
  leadType: "Business" | "Individual" | "Corporate" | "Partner" | "Referral";
  leadSource: "Instagram" | "Facebook" | "Website" | "WhatsApp" | "Google" | "LinkedIn" | "Referral" | "Cold Call" | "Event" | "Other";
  leadStatus: "New" | "Contacted" | "Qualified" | "Negotiation" | "Converted" | "Lost";
  priority: "High" | "Medium" | "Low";
  assignedTo?: string | AuthUser;
  eventAttribution?: string;
  leadDate?: string;
  followUpDate?: string;
  followUpTime?: string;
  followUpMethod?: "WhatsApp" | "Email" | "Phone" | "Meeting" | "Other";
  followUpSource?: string;
  interestedProduct?: string;
  expectedBudget?: string;
  estimatedDealValue?: string;
  expectedClosingDate?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  leadNotes?: string;
  internalNotes?: string;
  leadCategory?: "hot" | "cold";
  createdAt: string;
  updatedAt: string;
};

export const leadApi = {
  list: (params?: { leadCategory?: string; search?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.leadCategory) searchParams.set("leadCategory", params.leadCategory);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    const query = searchParams.toString();
    return request<{ leads: Lead[]; total: number }>(`/leads${query ? `?${query}` : ""}`);
  },
  get: (id: string) => request<Lead>(`/leads/${id}`),
  create: (payload: Partial<Lead>) => request<Lead>("/leads", { method: "POST", data: payload }),
  update: (id: string, payload: Partial<Lead>) => request<Lead>(`/leads/${id}`, { method: "PUT", data: payload }),
  remove: (id: string) => request<null>(`/leads/${id}`, { method: "DELETE" }),
};

export const activityLogApi = {
  list: (params: {
    page?: number;
    limit?: number;
    action?: ActivityAction | "";
    entity?: string;
    entityId?: string;
    leadId?: string;
    search?: string;
    role?: "admin" | "customer";
  } = {}) => {
    const searchParams = new URLSearchParams({
      page: String(params.page || 1),
      limit: String(params.limit || 50),
    });
    if (params.action) searchParams.set("action", params.action);
    if (params.entity) searchParams.set("entity", params.entity);
    if (params.entityId) searchParams.set("entityId", params.entityId);
    if (params.leadId) searchParams.set("leadId", params.leadId);
    if (params.search) searchParams.set("search", params.search);
    if (params.role) searchParams.set("role", params.role);
    return request<ActivityLogListResponse>(`/activity-logs?${searchParams.toString()}`);
  },
};