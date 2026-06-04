"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Plus,
  Save,
  Pencil,
  Trash2,
  Lock,
} from "lucide-react";
import {
  adminApi,
  authStore,
  categoryApi,
  type AuthUser,
  type Category,
} from "@/lib/api";

type CategoryForm = {
  id?: string;
  name: string;
  description: string;
};

const emptyCategory: CategoryForm = {
  name: "",
  description: "",
};

const fieldClass = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";
const labelClass = "block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5";

export default function CategoriesPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(emptyCategory);

  const refreshData = async () => {
    const categoryResult = await categoryApi.list();
    setCategories(categoryResult);
  };

  useEffect(() => {
    queueMicrotask(() => {
      const storedUser = authStore.getUser();
      const token = authStore.getToken();
      if (storedUser && token) {
        setUser(storedUser);
        refreshData().catch((error) => setMessage(error.message));
      }
    });
  }, []);

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

  const submitCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      if (categoryForm.id) {
        await categoryApi.update(categoryForm.id, categoryForm);
        setMessage("Category updated successfully.");
      } else {
        await categoryApi.create(categoryForm);
        setMessage("Category added successfully.");
      }
      setCategoryForm(emptyCategory);
      await refreshData();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (category: Category) => {
    if (!confirm(`Delete ${category.name}? Products using this category may need reassignment.`)) return;
    setLoading(true);
    try {
      await categoryApi.remove(category._id);
      await refreshData();
      setMessage("Category deleted.");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-slate-50 px-4 py-12">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50"
        >
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Lock size={22} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Ensis Admin</h1>
          <p className="mt-1.5 text-xs text-slate-400">
            Sign in with your credentials to manage categories.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className={labelClass}>Email Address</label>
              <input
                className={fieldClass}
                type="email"
                placeholder="admin@ensis.in"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Password</label>
              <input
                className={fieldClass}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
          </div>

          <button
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d5af2] hover:bg-[#154dc8] py-3 text-sm font-bold text-white shadow-md shadow-blue-500/10 transition-colors disabled:opacity-75"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
          {message && (
            <p className="mt-4 text-xs font-semibold text-rose-600 bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
              {message}
            </p>
          )}
        </form>
      </main>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white px-5 py-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Database Editor</span>
          <h2 className="text-lg font-bold text-slate-800">Product Categories</h2>
        </div>
        {message && (
          <p className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">
            {message}
          </p>
        )}
      </div>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        {/* Add Category Form */}
        <form onSubmit={submitCategory} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4 h-fit">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Plus size={16} /> {categoryForm.id ? "Edit Category Details" : "Add New Category"}
          </h3>
          <div>
            <label className={labelClass}>Name</label>
            <input
              className={fieldClass}
              value={categoryForm.name}
              onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              className={`${fieldClass} min-h-24`}
              value={categoryForm.description}
              onChange={(event) => setCategoryForm({ ...categoryForm, description: event.target.value })}
            />
          </div>
          <div className="flex gap-2.5 pt-2">
            <button
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
              disabled={loading}
            >
              <Save size={12} /> Save Category
            </button>
            {categoryForm.id && (
              <button
                type="button"
                onClick={() => setCategoryForm(emptyCategory)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Categories List */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm h-fit">
          <div className="border-b border-slate-100 px-5 py-4 text-xs font-bold text-slate-800">
            {categories.length} Categories Available
          </div>
          <div className="divide-y divide-slate-100 max-h-[65vh] overflow-y-auto">
            {categories.map((category) => (
              <article key={category._id} className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between hover:bg-slate-50/20">
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-800 text-xs">{category.name}</h4>
                  <p className="mt-0.5 text-[11px] text-slate-400">{category.description || "No description provided"}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCategoryForm({ id: category._id, name: category.name, description: category.description || "" })}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => deleteCategory(category)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
