"use client";

import { FormEvent, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Lock, Loader2 } from "lucide-react";
import {
  adminApi, authStore, productApi,
  type AuthUser, type Product,
} from "@/lib/api";
import { fieldClass, labelClass } from "@/constants";

function ReviewsPageInner() {
  const searchParams = useSearchParams();
  const productIdFromQuery = searchParams.get("productId") || "";

  const [user, setUser] = useState<AuthUser | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);

  const [selectedProductId, setSelectedProductId] = useState(productIdFromQuery);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [newRating, setNewRating] = useState<number | "">("");
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reviewCustomers = useMemo(
    () => users.filter((u) => u.role !== "admin" && u.role !== "superadmin"),
    [users]
  );

  const selectedProduct = useMemo(
    () => products.find((p) => p._id === selectedProductId),
    [products, selectedProductId]
  );

  const refreshData = useCallback(async () => {
    const [productResult, usersResult] = await Promise.all([
      productApi.list(),
      adminApi.listUsers(),
    ]);
    setProducts(productResult.products);
    setUsers(usersResult);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      const storedUser = authStore.getUser();
      const token = authStore.getToken();
      if (storedUser && token) {
        setUser(storedUser);
        refreshData().catch((error) => setMessage(error.message));
      }
    });
  }, [refreshData]);

  useEffect(() => {
    if (productIdFromQuery) setSelectedProductId(productIdFromQuery);
  }, [productIdFromQuery]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const result = await adminApi.login(email, password);
      authStore.setSession(result.accessToken, result.user);
      setUser(result.user);
      await refreshData();
      setMessage("Signed in successfully.");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      setMessage("Please select a product before adding a review.");
      return;
    }
    if (!selectedCustomerId) {
      setMessage("Please select a customer for this review.");
      return;
    }
    if (!newRating || !newComment) {
      setMessage("Please provide both rating and comment.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      await adminApi.addProductReview(selectedProductId, {
        customerId: selectedCustomerId,
        rating: Number(newRating),
        comment: newComment,
      });

      setNewRating("");
      setNewComment("");
      setSelectedCustomerId("");
      setMessage("Review added for selected customer.");
    } catch (err: any) {
      setMessage(err?.message || "Failed to add review");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-slate-50 px-4 py-12">
        <form onSubmit={handleLogin} className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Lock size={22} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Ensis Admin</h1>
          <p className="mt-1.5 text-xs ">Sign in with your credentials to manage reviews.</p>
          <div className="mt-6 space-y-4">
            <div>
              <label className={labelClass}>Email Address</label>
              <input className={fieldClass} type="email" placeholder="admin@ensis.in" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className={labelClass}>Password</label>
              <input className={fieldClass} type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>
          <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d5af2] hover:bg-[#154dc8] py-3 text-sm font-bold text-white shadow-md shadow-blue-500/10 transition-colors disabled:opacity-75" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
          {message && <p className="mt-4 text-xs font-semibold text-rose-600 bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">{message}</p>}
        </form>
      </main>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white px-5 py-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Database Editor</span>
          <h2 className="text-lg font-bold text-slate-800">Add Product Review</h2>
        </div>
        {message && (
          <p className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">
            {message}
          </p>
        )}
      </div>

      <section className="max-w-xl rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <form onSubmit={handleAddReview} className="grid gap-4">
          <div>
            <label className={labelClass}>Product</label>
            <select
              className={fieldClass}
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              required
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.title}
                </option>
              ))}
            </select>
            {selectedProduct && (
              <p className="mt-1 text-[10px] text-slate-500">
                Code: {selectedProduct.code || "—"} · Rs. {selectedProduct.price?.toLocaleString("en-IN")}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Customer</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className={fieldClass}
              required
            >
              <option value="">Select a customer</option>
              {reviewCustomers.map((customer) => (
                <option key={customer._id} value={customer._id}>
                  {customer.name} ({customer.email || customer.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className={labelClass}>Rating</label>
            <select
              value={newRating}
              onChange={(e) => setNewRating(Number(e.target.value))}
              className={fieldClass}
              required
            >
              <option value="">Select…</option>
              {[1, 2, 3, 4, 5].map((v) => (
                <option key={v} value={v}>{v} ★</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Comment</label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className={`${fieldClass} h-24`}
              placeholder="Write a comment…"
              required
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-60 cursor-pointer"
            disabled={isSubmitting || !selectedProductId}
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
            Add Review
          </button>
        </form>
      </section>
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <Suspense fallback={null}>
      <ReviewsPageInner />
    </Suspense>
  );
}