"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Save,
  Pencil,
  Trash2,
  Lock,
  X,
  Loader2,
  ImagePlus,
} from "lucide-react";
import {
  adminApi,
  authStore,
  categoryApi,
  getImageUrl,
  productApi,
  uploadImage,
  type AuthUser,
  type Category,
  type Product,
} from "@/lib/api";
import { fieldClass, labelClass } from "@/constants";
import Image from "next/image";

type ProductForm = {
  id?: string;
  title: string;
  description: string;
  price: string;
  discountPrice: string;
  stock: string;
  category: string;
  images: string[];
  slug: string;
};

const emptyProduct: ProductForm = {
  title: "",
  description: "",
  price: "",
  discountPrice: "",
  stock: "",
  category: "",
  images: [],
  slug: "",
};



export default function ProductsPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProduct);

  const selectedCategoryName = useMemo(() => {
    const category = categories.find((item) => item._id === productForm.category);
    return category?.name || "Select category";
  }, [categories, productForm.category]);

  const refreshData = useCallback(async () => {
    const [productResult, categoryResult] = await Promise.all([
      productApi.list(),
      categoryApi.list(),
    ]);
    setProducts(productResult.products);
    setCategories(categoryResult);
    if (!productForm.category && categoryResult[0]) {
      setProductForm((current) => ({ ...current, category: categoryResult[0]._id }));
    }
  }, [productForm.category]);

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

  const submitProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const payload = {
      title: productForm.title,
      description: productForm.description,
      price: Number(productForm.price || 0),
      discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : undefined,
      stock: productForm.stock ? Number(productForm.stock) : 0,
      category: productForm.category,
      images: productForm.images,
      slug: productForm.slug.trim(),
    };

    try {
      if (productForm.id) {
        await productApi.update(productForm.id, payload);
        setMessage("Product updated successfully.");
      } else {
        await productApi.create(payload);
        setMessage("Product added successfully.");
      }
      setProductForm({ ...emptyProduct, category: categories[0]?._id || "" });
      await refreshData();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const editProduct = (product: Product) => {
    const categoryId = typeof product.category === "string" ? product.category : product.category?._id || "";
    setProductForm({
      id: product._id,
      title: product.title,
      description: product.description,
      price: String(product.price || ""),
      discountPrice: String(product.discountPrice || ""),
      stock: String(product.stock || ""),
      category: categoryId,
      images: product.images || [],
      slug: product.slug || "",
    });
  };

  const deleteProduct = async (product: Product) => {
    if (!confirm(`Delete ${product.title}?`)) return;
    setLoading(true);
    try {
      await productApi.remove(product._id);
      await refreshData();
      setMessage("Product deleted.");
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
            Sign in with your credentials to manage products.
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
      {/* <div className="flex flex-wrap items-center justify-between gap-4 bg-white px-5 py-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Database Editor</span>
          <h2 className="text-lg font-bold text-slate-800">Products Catalog</h2>
        </div>
        {message && (
          <p className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">
            {message}
          </p>
        )}
      </div> */}

      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.95fr]">
           <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm h-fit">
          <div className="border-b border-slate-100 px-5 py-4 text-xs font-bold text-slate-800">
            {products.length} Products Cataloged
          </div>
          <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
            {products.map((product) => (
              <article key={product._id} className="grid gap-4 p-4 sm:grid-cols-[80px_1fr_auto] sm:items-center hover:bg-slate-50/20">
                <div className="h-14 w-20 overflow-hidden rounded-lg bg-slate-50 flex-shrink-0">
                  {product.images?.[0] && (
                    <Image width={100} height={100} src={getImageUrl(product.images[0])} alt={product.title} className="h-full w-full object-cover" crossOrigin="anonymous" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-800 text-xs truncate">{product.title}</h4>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">{product.description}</p>
                  <p className="mt-1 text-[10px] font-bold text-emerald-600">
                    Rs. {product.price?.toLocaleString("en-IN")} ·{" "}
                    {typeof product.category === "string" ? product.category : product.category?.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editProduct(product)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => deleteProduct(product)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
        {/* Add/Edit Product Form */}
     <form
  onSubmit={submitProduct}
  className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm space-y-3 h-fit"
>
  <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
    <Plus size={14} />
    {productForm.id ? "Edit Product Details" : "Add New Product"}
  </h3>

  <div>
    <label className={labelClass}>Title</label>
    <input
      className={fieldClass}
      value={productForm.title}
      onChange={(event) =>
        setProductForm({ ...productForm, title: event.target.value })
      }
      required
    />
  </div>

  <div>
    <label className={labelClass}>Description</label>
    <textarea
      className={`${fieldClass} min-h-20`}
      value={productForm.description}
      onChange={(event) =>
        setProductForm({
          ...productForm,
          description: event.target.value,
        })
      }
      required
    />
  </div>

  <div className="grid gap-3 sm:grid-cols-3">
    <div>
      <label className={labelClass}>Price (INR)</label>
      <input
        className={fieldClass}
        type="number"
        min="0"
        value={productForm.price}
        onChange={(event) =>
          setProductForm({ ...productForm, price: event.target.value })
        }
        required
      />
    </div>

    <div>
      <label className={labelClass}>Discount Price</label>
      <input
        className={fieldClass}
        type="number"
        min="0"
        value={productForm.discountPrice}
        onChange={(event) =>
          setProductForm({
            ...productForm,
            discountPrice: event.target.value,
          })
        }
      />
    </div>

    <div>
      <label className={labelClass}>Stock Quantity</label>
      <input
        className={fieldClass}
        type="number"
        min="0"
        value={productForm.stock}
        onChange={(event) =>
          setProductForm({ ...productForm, stock: event.target.value })
        }
      />
    </div>
  </div>

  <div className="grid gap-3 sm:grid-cols-2">
    <div>
      <label className={labelClass}>Category</label>
      <select
        className={fieldClass}
        value={productForm.category}
        onChange={(event) =>
          setProductForm({
            ...productForm,
            category: event.target.value,
          })
        }
        required
      >
        <option value="">{selectedCategoryName}</option>
        {categories.map((category) => (
          <option key={category._id} value={category._id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className={labelClass}>Url Slug</label>
      <input
        className={fieldClass}
        value={productForm.slug}
        onChange={(event) =>
          setProductForm({ ...productForm, slug: event.target.value })
        }
      />
    </div>
  </div>

  <div>
    <label className={labelClass}>Product Images</label>

    <div className="grid grid-cols-4 gap-2 mb-2">
      {productForm.images.map((url, idx) => (
        <div
          key={idx}
          className="relative group aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-50"
        >
          <Image width={100} height={100}
            src={getImageUrl(url)}
            alt={`Product ${idx}`}
            className="h-full w-full object-cover"
            crossOrigin="anonymous"
          />

          <button
            type="button"
            onClick={() => {
              const newImages = [...productForm.images];
              newImages.splice(idx, 1);
              setProductForm({
                ...productForm,
                images: newImages,
              });
            }}
            className="absolute top-1 right-1 p-0.5 bg-white/90 rounded-full text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-rose-50 cursor-pointer"
          >
            <X size={10} />
          </button>
        </div>
      ))}

      <label className="flex flex-col items-center justify-center aspect-square rounded-lg border border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        ) : (
          <ImagePlus className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
        )}

        <span className="mt-0.5 text-[9px] font-semibold text-slate-500 group-hover:text-blue-600">
          Add Image
        </span>

        <input
          type="file"
          multiple
          className="hidden"
          accept="image/*"
          onChange={async (e) => {
            const files = Array.from(e.target.files || []);

            if (files.length === 0) return;

            setLoading(true);
            setMessage("Uploading images...");

            try {
              const uploadPromises = files.map((file) =>
                uploadImage(file, "products")
              );

              const urls = await Promise.all(uploadPromises);

              setProductForm((prev) => ({
                ...prev,
                images: [...prev.images, ...urls],
              }));

              setMessage(
                `${urls.length} image(s) uploaded successfully.`
              );
            } catch (error) {
              setMessage("Failed to upload one or more images."+
                " "+error
              );
            } finally {
              setLoading(false);
              e.target.value = "";
            }
          }}
        />
      </label>
    </div>

    <p className="text-[8px] italic text-slate-400">
      Images are stored in /uploads/products. You can select multiple files.
    </p>
  </div>

  <div className="flex gap-2 pt-1">
    <button
      className="inline-flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors cursor-pointer"
      disabled={loading}
    >
      <Save size={11} />
      Save Product
    </button>

    {productForm.id && (
      <button
        type="button"
        onClick={() =>
          setProductForm({
            ...emptyProduct,
            category: categories[0]?._id || "",
          })
        }
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
      >
        Cancel
      </button>
    )}
  </div>
</form>

        {/* Product Items Table */}
     
      </section>
    </div>
  );
}
