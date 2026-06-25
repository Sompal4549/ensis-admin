"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Save, Pencil, Trash2, Lock, X, Loader2, ImagePlus } from "lucide-react";
import {
  adminApi, authStore, categoryApi, getImageUrl, productApi, uploadImage,
  type AuthUser, type Category, type Product,
} from "@/lib/api";
import { fieldClass, labelClass } from "@/constants";
import Image from "next/image";

type ProductForm = {
  id?: string;
  title: string;
  code: string;
  description: string;
  shortDescription: string;
  price: string;
  discountPrice: string;
  stock: string;
  category: string;
  subcategory: string;
  material: string;
  weight: string;
  tags: string[];
  images: string[];
  slug: string;
  overview: {
    title: string;
    description: string;
    seeItInRealSpaces: { title: string; images: { image: string; imageAlt: string }[] };
    productPricingFeatures: { title: string; image: string }[];
    emiOptions: boolean;
    customSize: boolean;
    overviewList: string[];
    specifications: { title: string; specificationsList: { title: string; description: string }[] };
    keyFeatures: { title: string; keyFeaturesList: string[] };
    dimensions: { title: string; dimensionsList: { title: string; description: string }[] };
    materialAndCare: { title: string; description: string };
    productSpecifications: { highlight: string; title: string; image: string; specifications: { title: string; description: string }[] }[];
    whatisInclueded: string[];
    items: { image: string; title: string; description: string }[];
    smartDesignAppearance: {
      highlight: string;
      title: string;
      woodFinish: { image: string; title: string }[];
      sizeOptions: { title: string; description: string }[];
    };
    faqs: { question: string; description: string }[];
  };
  isFeatured: boolean;
  isActive: boolean;
};

const emptyProduct: ProductForm = {
  title: "", code: "", description: "", shortDescription: "",
  price: "", discountPrice: "", stock: "", category: "",
  subcategory: "", material: "", weight: "",
  tags: [""], images: [], slug: "",
  overview: {
    title: "", description: "",
    seeItInRealSpaces: { title: "", images: [] },
    productPricingFeatures: [],
    emiOptions: false,
    customSize: false,
    overviewList: [""],
    specifications: { title: "", specificationsList: [{ title: "", description: "" }] },
    keyFeatures: { title: "", keyFeaturesList: [""] },
    dimensions: { title: "", dimensionsList: [{ title: "", description: "" }] },
    materialAndCare: { title: "", description: "" },
    productSpecifications: [{ highlight: "", title: "", image: "", specifications: [{ title: "", description: "" }] }],
    whatisInclueded: [""],
    items: [{ image: "", title: "", description: "" }],
    smartDesignAppearance: { highlight: "", title: "", woodFinish: [], sizeOptions: [{ title: "", description: "" }] },
    faqs: [{ question: "", description: "" }],
  },
  isFeatured: false, isActive: true,
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
    const [productResult, categoryResult] = await Promise.all([productApi.list(), categoryApi.list()]);
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
      title: productForm.title, code: productForm.code,
      description: productForm.description, shortDescription: productForm.shortDescription,
      price: Number(productForm.price || 0),
      discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : undefined,
      stock: productForm.stock ? Number(productForm.stock) : 0,
      category: productForm.category, subcategory: productForm.subcategory,
      material: productForm.material, weight: productForm.weight,
      tags: productForm.tags.filter(t => t.trim() !== ""),
      images: productForm.images, slug: productForm.slug.trim(),
      overview: productForm.overview,
      isFeatured: productForm.isFeatured, isActive: productForm.isActive,
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
    const toArray = <T,>(val: T | T[] | undefined, fallback: T[]): T[] =>
      val ? (Array.isArray(val) ? val : [val]) : fallback;

    setProductForm({
      id: product._id,
      title: product.title || "",
      code: product.code || "",
      description: product.description || "",
      shortDescription: product.shortDescription || "",
      price: String(product.price || ""),
      discountPrice: String(product.discountPrice || ""),
      stock: String(product.stock || ""),
      category: categoryId,
      subcategory: product.subcategory || "",
      material: product.material || "",
      weight: String(product.weight || ""),
      tags: product.tags?.length ? product.tags : [""],
      images: product.images || [],
      slug: product.slug || "",
      overview: {
        title: product.overview?.title || "",
        description: product.overview?.description || "",

        seeItInRealSpaces: {
          title: product.overview?.seeItInRealSpaces?.title || "",
          images: (product.overview?.seeItInRealSpaces?.images || []).map((img: any) => ({
            image: img?.image || "",
            imageAlt: img?.imageAlt || "",
          })),
        },

        productPricingFeatures: (product.overview?.productPricingFeatures || []).map((pf: any) => ({
          title: pf?.title || "",
          image: pf?.image || "",
        })),

        emiOptions: product.overview?.emiOptions || false,
        customSize: product.overview?.customSize || false,

        overviewList: product.overview?.overviewList?.length
          ? product.overview.overviewList
          : [""],

        specifications: {
          title: product.overview?.specifications?.title || "",
          specificationsList: (product.overview?.specifications?.specificationsList || [{ title: "", description: "" }]).map((s: any) => ({
            title: s?.title || "",
            description: s?.description || "",
          })),
        },

        keyFeatures: {
          title: product.overview?.keyFeatures?.title || "",
          keyFeaturesList: (product.overview?.keyFeatures?.keyFeaturesList || [""]).map((item: any) =>
            typeof item === "string" ? item : item?.title || item?.description || ""
          ),
        },

        dimensions: {
          title: product.overview?.dimensions?.title || "",
          dimensionsList: (product.overview?.dimensions?.dimensionsList || [{ title: "", description: "" }]).map((item: any) => ({
            title: item?.title || "",
            description: item?.description || "",
          })),
        },

        materialAndCare: {
          title: product.overview?.materialAndCare?.title || "",
          description: product.overview?.materialAndCare?.description || "",
        },

        productSpecifications: toArray(
          product.overview?.productSpecifications,
          [{ highlight: "", title: "", image: "", specifications: [{ title: "", description: "" }] }]
        ).map((ps: any) => ({
          highlight: ps?.highlight || "",
          title: ps?.title || "",
          image: ps?.image || "",
          specifications: (ps?.specifications || [{ title: "", description: "" }]).map((s: any) => ({
            title: s?.title || "",
            description: s?.description || "",
          })),
        })),

        whatisInclueded: product.overview?.whatisInclueded?.length
          ? product.overview.whatisInclueded
          : [""],

        items: (product.overview?.items || [{ image: "", title: "", description: "" }]).map((item: any) => ({
          image: item?.image || "",
          title: item?.title || "",
          description: item?.description || "",
        })),

        smartDesignAppearance: {
          highlight: product.overview?.smartDesignAppearance?.highlight || "",
          title: product.overview?.smartDesignAppearance?.title || "",
          woodFinish: (product.overview?.smartDesignAppearance?.woodFinish || []).map((wf: any) => ({
            image: wf?.image || "",
            title: wf?.title || "",
          })),
          sizeOptions: (product.overview?.smartDesignAppearance?.sizeOptions || [{ title: "", description: "" }]).map((opt: any) => ({
            title: opt?.title || "",
            description: opt?.description || "",
          })),
        },

        faqs: (product.overview?.faqs || [{ question: "", description: "" }]).map((faq: any) => ({
          question: faq?.question || "",
          description: faq?.description || "",
        })),
      },
      isFeatured: !!product.isFeatured,
      isActive: product.isActive !== false,
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
        <form onSubmit={handleLogin} className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Lock size={22} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Ensis Admin</h1>
          <p className="mt-1.5 text-xs ">Sign in with your credentials to manage products.</p>
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
      <section className="grid gap-3 lg:grid-cols-[0.95fr_1.4fr]">
        {/* Product List */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm h-fit">
          <div className="border-b border-slate-100 px-5 py-4 text-xs font-bold text-slate-800">
            {products.length} Products Cataloged
          </div>
          <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
            {products.map((product) => (
              <article key={product._id} className="grid gap-4 p-4 sm:grid-cols-[80px_1fr_auto] sm:items-center hover:bg-slate-50/20">
                <div className="h-14 w-20 overflow-hidden rounded-lg bg-slate-50 shrink-0">
                  {product.images?.[0] && (
                    <Image width={100} height={100} src={getImageUrl(product.images[0])} alt={product.title} className="h-full w-full object-cover" crossOrigin="anonymous" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-800 text-xs truncate">{product.title}</h4>
                  <p className="mt-0.5 line-clamp-1 text-[11px] ">{product.description}</p>
                  <p className="mt-1 text-[10px] font-bold text-emerald-600">
                    Rs. {product.price?.toLocaleString("en-IN")} · {typeof product.category === "string" ? product.category : product.category?.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editProduct(product)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"><Pencil size={12} /></button>
                  <button onClick={() => deleteProduct(product)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"><Trash2 size={12} /></button>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submitProduct} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm space-y-3 h-fit max-h-[90vh] overflow-y-auto">
          <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Plus size={14} />
            {productForm.id ? "Edit Product Details" : "Add New Product"}
          </h3>

          {/* Title & Code */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Title</label>
              <input className={fieldClass} value={productForm.title} onChange={(e) => setProductForm({ ...productForm, title: e.target.value })} required />
            </div>
            <div>
              <label className={labelClass}>Product Code</label>
              <input className={fieldClass} value={productForm.code} onChange={(e) => setProductForm({ ...productForm, code: e.target.value })} placeholder="e.g. ENS-001" />
            </div>
          </div>
{/* ────── Pricing Section ────── */}
          <fieldset className="border border-slate-200 rounded-xl p-4 space-y-4">
            <legend className="text-[10px] font-black uppercase text-blue-600 tracking-widest px-1">Pricing Section</legend>

            {/* See It In Real Spaces */}
            <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
              <h5 className="text-[10px] font-bold uppercase">See It In Real Spaces</h5>
              <div>
                <label className={labelClass}>Section Title</label>
                <input className={fieldClass} placeholder="e.g. See It In Real Spaces" value={productForm.overview.seeItInRealSpaces.title} onChange={e => setProductForm({ ...productForm, overview: { ...productForm.overview, seeItInRealSpaces: { ...productForm.overview.seeItInRealSpaces, title: e.target.value } } })} />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Images</label>
                {productForm.overview.seeItInRealSpaces.images.map((item, idx) => (
                  <div key={idx} className="p-3 border border-slate-200 rounded-xl bg-white space-y-2 relative">
                    <button type="button" onClick={() => { const list = productForm.overview.seeItInRealSpaces.images.filter((_, i) => i !== idx); setProductForm({ ...productForm, overview: { ...productForm.overview, seeItInRealSpaces: { ...productForm.overview.seeItInRealSpaces, images: list } } }); }} className="absolute top-2 right-2 text-rose-500"><Trash2 size={13} /></button>
                    <input className={fieldClass} placeholder="Alt Text" value={item.imageAlt} onChange={e => { const list = [...productForm.overview.seeItInRealSpaces.images]; list[idx].imageAlt = e.target.value; setProductForm({ ...productForm, overview: { ...productForm.overview, seeItInRealSpaces: { ...productForm.overview.seeItInRealSpaces, images: list } } }); }} />
                    <div className="flex gap-3 items-end">
                      {item.image && <Image width={80} height={56} src={getImageUrl(item.image)} alt="Space" className="h-14 w-20 rounded object-cover border shrink-0" crossOrigin="anonymous" />}
                      <div className="flex-1 space-y-1.5">
                        <input className={fieldClass} placeholder="Paste image URL" value={item.image} onChange={e => { const list = [...productForm.overview.seeItInRealSpaces.images]; list[idx].image = e.target.value; setProductForm({ ...productForm, overview: { ...productForm.overview, seeItInRealSpaces: { ...productForm.overview.seeItInRealSpaces, images: list } } }); }} />
                        <label className="cursor-pointer inline-flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded text-[10px] font-bold hover:bg-blue-50 transition-colors">
                          <ImagePlus size={11} /> Upload
                          <input type="file" className="hidden" accept="image/*" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; const url = await uploadImage(file, "products"); const list = [...productForm.overview.seeItInRealSpaces.images]; list[idx].image = url; setProductForm({ ...productForm, overview: { ...productForm.overview, seeItInRealSpaces: { ...productForm.overview.seeItInRealSpaces, images: list } } }); }} />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => setProductForm({ ...productForm, overview: { ...productForm.overview, seeItInRealSpaces: { ...productForm.overview.seeItInRealSpaces, images: [...productForm.overview.seeItInRealSpaces.images, { image: "", imageAlt: "" }] } } })} className="w-full py-2 border-2 border-dashed rounded-lg text-[10px] font-bold hover:bg-slate-50">+ Add Image</button>
              </div>
            </div>

            {/* Product Pricing Features — array */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-[10px] font-bold uppercase">Product Pricing Features</h5>
                <button type="button" onClick={() => setProductForm({ ...productForm, overview: { ...productForm.overview, productPricingFeatures: [...productForm.overview.productPricingFeatures, { title: "", image: "" }] } })} className="text-[10px] font-bold text-blue-600 flex items-center gap-1"><Plus size={11} /> Add</button>
              </div>
              {productForm.overview.productPricingFeatures.map((pf, idx) => (
                <div key={idx} className="p-3 border border-slate-200 rounded-xl bg-slate-50 space-y-2 relative">
                  <button type="button" onClick={() => setProductForm({ ...productForm, overview: { ...productForm.overview, productPricingFeatures: productForm.overview.productPricingFeatures.filter((_, i) => i !== idx) } })} className="absolute top-2 right-2 text-rose-500"><Trash2 size={13} /></button>
                  <input className={fieldClass} placeholder="Feature Title" value={pf.title} onChange={e => { const list = [...productForm.overview.productPricingFeatures]; list[idx].title = e.target.value; setProductForm({ ...productForm, overview: { ...productForm.overview, productPricingFeatures: list } }); }} />
                  <div className="flex gap-3 items-end">
                    {pf.image && <Image width={80} height={56} src={getImageUrl(pf.image)} alt="Feature" className="h-14 w-20 rounded object-cover border shrink-0" crossOrigin="anonymous" />}
                    <div className="flex-1 space-y-1.5">
                      <input className={fieldClass} placeholder="Paste image URL" value={pf.image} onChange={e => { const list = [...productForm.overview.productPricingFeatures]; list[idx].image = e.target.value; setProductForm({ ...productForm, overview: { ...productForm.overview, productPricingFeatures: list } }); }} />
                      <label className="cursor-pointer inline-flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded text-[10px] font-bold hover:bg-blue-50 transition-colors">
                        <ImagePlus size={11} /> Upload
                        <input type="file" className="hidden" accept="image/*" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; const url = await uploadImage(file, "products"); const list = [...productForm.overview.productPricingFeatures]; list[idx].image = url; setProductForm({ ...productForm, overview: { ...productForm.overview, productPricingFeatures: list } }); }} />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* EMI & Custom Size */}
            <div className="flex gap-6 py-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={productForm.overview.emiOptions} onChange={e => setProductForm({ ...productForm, overview: { ...productForm.overview, emiOptions: e.target.checked } })} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-xs font-semibold text-slate-700">EMI Available</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={productForm.overview.customSize} onChange={e => setProductForm({ ...productForm, overview: { ...productForm.overview, customSize: e.target.checked } })} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-xs font-semibold text-slate-700">Custom Size Available</span>
              </label>
            </div>
          </fieldset>
          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea className={`${fieldClass} min-h-20`} value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} required />
          </div>

          {/* Short Description */}
          <div>
            <label className={labelClass}>Short Description</label>
            <textarea className={`${fieldClass} min-h-12`} value={productForm.shortDescription} onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })} />
          </div>

          {/* Price, Discount, Stock */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Price (INR)</label>
              <input className={fieldClass} type="number" min="0" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required />
            </div>
            <div>
              <label className={labelClass}>Discount Price</label>
              <input className={fieldClass} type="number" min="0" value={productForm.discountPrice} onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Stock Quantity</label>
              <input className={fieldClass} type="number" min="0" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} />
            </div>
          </div>

          {/* Category & Slug */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Category</label>
              <select className={fieldClass} value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} required>
                <option value="">{selectedCategoryName}</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>URL Slug</label>
              <input className={fieldClass} value={productForm.slug} onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })} />
            </div>
          </div>

          {/* Subcategory, Material, Weight */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Subcategory</label>
              <input className={fieldClass} value={productForm.subcategory} onChange={(e) => setProductForm({ ...productForm, subcategory: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Material</label>
              <input className={fieldClass} value={productForm.material} onChange={(e) => setProductForm({ ...productForm, material: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Weight (kg)</label>
              <input className={fieldClass} type="number" value={productForm.weight} onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })} />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex gap-6 py-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={productForm.isActive} onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-xs font-semibold text-slate-700">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={productForm.isFeatured} onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-xs font-semibold text-slate-700">Featured Product</span>
            </label>
          </div>

          {/* Product Images */}
          <div>
            <label className={labelClass}>Product Images</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {productForm.images.map((url, idx) => (
                <div key={idx} className="relative group aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                  <Image width={100} height={100} src={getImageUrl(url)} alt={`Product ${idx}`} className="h-full w-full object-cover" crossOrigin="anonymous" />
                  <button type="button" onClick={() => { const imgs = [...productForm.images]; imgs.splice(idx, 1); setProductForm({ ...productForm, images: imgs }); }} className="absolute top-1 right-1 p-0.5 bg-white/90 rounded-full text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-rose-50 cursor-pointer"><X size={10} /></button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center aspect-square rounded-lg border border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group">
                {loading ? <Loader2 className="h-4 w-4 animate-spin text-blue-500" /> : <ImagePlus className="h-4 w-4  group-hover:text-blue-500 transition-colors" />}
                <span className="mt-0.5 text-[9px] font-semibold  group-hover:text-blue-600">Add Image</span>
                <input type="file" multiple className="hidden" accept="image/*" onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (!files.length) return;
                  setLoading(true);
                  setMessage("Uploading images...");
                  try {
                    const urls = await Promise.all(files.map(f => uploadImage(f, "products")));
                    setProductForm(prev => ({ ...prev, images: [...prev.images, ...urls] }));
                    setMessage(`${urls.length} image(s) uploaded successfully.`);
                  } catch (error) {
                    setMessage("Failed to upload one or more images. " + error);
                  } finally {
                    setLoading(false);
                    e.target.value = "";
                  }
                }} />
              </label>
            </div>
            <p className="text-[8px] italic ">Images are stored in /uploads/products. You can select multiple files.</p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className={labelClass}>Search Tags</label>
            <div className="flex flex-wrap gap-2">
              {productForm.tags.map((tag, idx) => (
                <div key={idx} className="flex gap-1 items-center bg-slate-50 border border-slate-200 rounded-md px-2 py-1">
                  <input className="bg-transparent border-none p-0 text-[11px] focus:ring-0 w-20" value={tag} onChange={e => { const list = [...productForm.tags]; list[idx] = e.target.value; setProductForm({ ...productForm, tags: list }); }} />
                  <button type="button" onClick={() => setProductForm({ ...productForm, tags: productForm.tags.filter((_, i) => i !== idx) })} className="text-rose-500 hover:bg-rose-50 p-1 rounded transition-colors"><X size={12} /></button>
                </div>
              ))}
              <button type="button" onClick={() => setProductForm({ ...productForm, tags: [...productForm.tags, ""] })} className="text-[10px] font-bold text-blue-600 flex items-center gap-1"><Plus size={12} /> Add Tag</button>
            </div>
          </div>

          {/* ────── Technical Overview ────── */}
          <div className="pt-6 border-t border-slate-100 space-y-5">
            <h4 className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Technical Overview & Details</h4>

            {/* Basic Overview */}
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Overview Section Title</label>
                <input className={fieldClass} value={productForm.overview.title} onChange={e => setProductForm({ ...productForm, overview: { ...productForm.overview, title: e.target.value } })} placeholder="e.g. Exquisite Craftsmanship" />
              </div>
              <div>
                <label className={labelClass}>Overview Description</label>
                <textarea className={`${fieldClass} min-h-16`} value={productForm.overview.description} onChange={e => setProductForm({ ...productForm, overview: { ...productForm.overview, description: e.target.value } })} placeholder="Short intro to technical details..." />
              </div>
            </div>

            {/* Overview Items */}
            <div>
              <label className={labelClass}>Overview Items</label>
              <div className="space-y-3 mt-1">
                {productForm.overview.items.map((item, idx) => (
                  <div key={idx} className="p-3 border border-slate-200 rounded-xl bg-white space-y-2 relative">
                    <button type="button" onClick={() => setProductForm({ ...productForm, overview: { ...productForm.overview, items: productForm.overview.items.filter((_, i) => i !== idx) } })} className="absolute top-2 right-2 text-rose-500"><Trash2 size={13} /></button>
                    <input className={fieldClass} placeholder="Title" value={item.title} onChange={e => { const list = [...productForm.overview.items]; list[idx].title = e.target.value; setProductForm({ ...productForm, overview: { ...productForm.overview, items: list } }); }} />
                    <textarea className={`${fieldClass} min-h-12`} placeholder="Description" value={item.description} onChange={e => { const list = [...productForm.overview.items]; list[idx].description = e.target.value; setProductForm({ ...productForm, overview: { ...productForm.overview, items: list } }); }} />
                    <div className="flex gap-3 items-end">
                      {item.image && <Image width={80} height={56} src={getImageUrl(item.image)} alt="Item" className="h-14 w-20 rounded object-cover border shrink-0" crossOrigin="anonymous" />}
                      <div className="flex-1 space-y-1.5">
                        <input className={fieldClass} placeholder="Paste image URL" value={item.image} onChange={e => { const list = [...productForm.overview.items]; list[idx].image = e.target.value; setProductForm({ ...productForm, overview: { ...productForm.overview, items: list } }); }} />
                        <label className="cursor-pointer inline-flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded text-[10px] font-bold hover:bg-blue-50 transition-colors">
                          <ImagePlus size={11} /> Upload
                          <input type="file" className="hidden" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const url = await uploadImage(file, "products"); const list = [...productForm.overview.items]; list[idx].image = url; setProductForm({ ...productForm, overview: { ...productForm.overview, items: list } }); }} />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => setProductForm({ ...productForm, overview: { ...productForm.overview, items: [...productForm.overview.items, { image: "", title: "", description: "" }] } })} className="w-full py-2 border-2 border-dashed rounded-lg  text-[10px] font-bold hover:bg-slate-50">+ Add Item</button>
              </div>
            </div>

            {/* Overview Bullet Points */}
            <div>
              <label className={labelClass}>Overview Bullet Points</label>
              <div className="space-y-2 mt-1">
                {productForm.overview.overviewList.map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input className={fieldClass} value={item} onChange={e => { const list = [...productForm.overview.overviewList]; list[idx] = e.target.value; setProductForm({ ...productForm, overview: { ...productForm.overview, overviewList: list } }); }} />
                    <button type="button" onClick={() => setProductForm({ ...productForm, overview: { ...productForm.overview, overviewList: productForm.overview.overviewList.filter((_, i) => i !== idx) } })} className="shrink-0 text-rose-500 hover:bg-rose-50 p-1.5 rounded"><Trash2 size={13} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setProductForm({ ...productForm, overview: { ...productForm.overview, overviewList: [...productForm.overview.overviewList, ""] } })} className="text-[10px] font-bold text-blue-600 flex items-center gap-1"><Plus size={12} /> Add Point</button>
              </div>
            </div>

            {/* What's Included */}
            <div>
              <label className={labelClass}>What's Included</label>
              <div className="space-y-2 mt-1">
                {productForm.overview.whatisInclueded.map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input className={fieldClass} value={item} onChange={e => { const list = [...productForm.overview.whatisInclueded]; list[idx] = e.target.value; setProductForm({ ...productForm, overview: { ...productForm.overview, whatisInclueded: list } }); }} />
                    <button type="button" onClick={() => setProductForm({ ...productForm, overview: { ...productForm.overview, whatisInclueded: productForm.overview.whatisInclueded.filter((_, i) => i !== idx) } })} className="shrink-0 text-rose-500 hover:bg-rose-50 p-1.5 rounded"><Trash2 size={13} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setProductForm({ ...productForm, overview: { ...productForm.overview, whatisInclueded: [...productForm.overview.whatisInclueded, ""] } })} className="text-[10px] font-bold text-blue-600 flex items-center gap-1"><Plus size={12} /> Add Item</button>
              </div>
            </div>

            {/* Key Specifications */}
            <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
              <label className="text-[10px] font-bold uppercase block">Key Specifications</label>
              <input className={fieldClass} placeholder="Section Title"
                value={productForm.overview.specifications.title}
                onChange={e => setProductForm({ ...productForm, overview: { ...productForm.overview, specifications: { ...productForm.overview.specifications, title: e.target.value } } })} />
              <div className="space-y-2">
                {productForm.overview.specifications.specificationsList.map((row, rIdx) => (
                  <div key={rIdx} className="flex gap-2">
                    <input className={fieldClass} placeholder="Label" value={row.title}
                      onChange={e => { const list = [...productForm.overview.specifications.specificationsList]; list[rIdx].title = e.target.value; setProductForm({ ...productForm, overview: { ...productForm.overview, specifications: { ...productForm.overview.specifications, specificationsList: list } } }); }} />
                    <input className={fieldClass} placeholder="Value" value={row.description}
                      onChange={e => { const list = [...productForm.overview.specifications.specificationsList]; list[rIdx].description = e.target.value; setProductForm({ ...productForm, overview: { ...productForm.overview, specifications: { ...productForm.overview.specifications, specificationsList: list } } }); }} />
                    <button type="button" onClick={() => { const list = productForm.overview.specifications.specificationsList.filter((_, i) => i !== rIdx); setProductForm({ ...productForm, overview: { ...productForm.overview, specifications: { ...productForm.overview.specifications, specificationsList: list } } }); }} className="shrink-0 text-rose-500 p-1 rounded"><Trash2 size={12} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => { const list = [...productForm.overview.specifications.specificationsList, { title: "", description: "" }]; setProductForm({ ...productForm, overview: { ...productForm.overview, specifications: { ...productForm.overview.specifications, specificationsList: list } } }); }} className="text-[10px] font-bold text-blue-600 flex items-center gap-1"><Plus size={11} /> Add Row</button>
              </div>
            </div>

            {/* Key Features */}
            <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
              <label className="text-[10px] font-bold  uppercase block">Key Features</label>
              <input className={fieldClass} placeholder="Section Title" value={productForm.overview.keyFeatures.title} onChange={e => setProductForm({ ...productForm, overview: { ...productForm.overview, keyFeatures: { ...productForm.overview.keyFeatures, title: e.target.value } } })} />
              <div className="space-y-2">
                {productForm.overview.keyFeatures.keyFeaturesList.map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input className={fieldClass} placeholder="Feature detail..." value={item} onChange={e => { const list = [...productForm.overview.keyFeatures.keyFeaturesList]; list[idx] = e.target.value; setProductForm({ ...productForm, overview: { ...productForm.overview, keyFeatures: { ...productForm.overview.keyFeatures, keyFeaturesList: list } } }); }} />
                    <button type="button" onClick={() => { const list = productForm.overview.keyFeatures.keyFeaturesList.filter((_, i) => i !== idx); setProductForm({ ...productForm, overview: { ...productForm.overview, keyFeatures: { ...productForm.overview.keyFeatures, keyFeaturesList: list } } }); }} className="shrink-0 text-rose-500 hover:bg-rose-50 p-1 rounded"><Trash2 size={12} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => { const list = [...productForm.overview.keyFeatures.keyFeaturesList, ""]; setProductForm({ ...productForm, overview: { ...productForm.overview, keyFeatures: { ...productForm.overview.keyFeatures, keyFeaturesList: list } } }); }} className="text-[10px] font-bold text-blue-600 flex items-center gap-1"><Plus size={11} /> Add Feature</button>
              </div>
            </div>

            {/* Product Dimensions */}
            <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
              <label className="text-[10px] font-bold uppercase block">
                Product Dimensions
              </label>

              <input
                className={fieldClass}
                placeholder="Section Title"
                value={productForm.overview.dimensions.title}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    overview: {
                      ...productForm.overview,
                      dimensions: {
                        ...productForm.overview.dimensions,
                        title: e.target.value,
                      },
                    },
                  })
                }
              />

              <div className="space-y-2">
                {productForm.overview.dimensions.dimensionsList.map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      className={fieldClass}
                      placeholder="Label"
                      value={item.title}
                      onChange={(e) => {
                        const list = [...productForm.overview.dimensions.dimensionsList];
                        list[idx].title = e.target.value;

                        setProductForm({
                          ...productForm,
                          overview: {
                            ...productForm.overview,
                            dimensions: {
                              ...productForm.overview.dimensions,
                              dimensionsList: list,
                            },
                          },
                        });
                      }}
                    />

                    <input
                      className={fieldClass}
                      placeholder="Value"
                      value={item.description}
                      onChange={(e) => {
                        const list = [...productForm.overview.dimensions.dimensionsList];
                        list[idx].description = e.target.value;

                        setProductForm({
                          ...productForm,
                          overview: {
                            ...productForm.overview,
                            dimensions: {
                              ...productForm.overview.dimensions,
                              dimensionsList: list,
                            },
                          },
                        });
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const list =
                          productForm.overview.dimensions.dimensionsList.filter(
                            (_, i) => i !== idx
                          );

                        setProductForm({
                          ...productForm,
                          overview: {
                            ...productForm.overview,
                            dimensions: {
                              ...productForm.overview.dimensions,
                              dimensionsList: list,
                            },
                          },
                        });
                      }}
                      className="shrink-0 text-rose-500 hover:bg-rose-50 p-1 rounded"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    const list = [
                      ...productForm.overview.dimensions.dimensionsList,
                      {
                        title: "",
                        description: "",
                      },
                    ];

                    setProductForm({
                      ...productForm,
                      overview: {
                        ...productForm.overview,
                        dimensions: {
                          ...productForm.overview.dimensions,
                          dimensionsList: list,
                        },
                      },
                    });
                  }}
                  className="text-[10px] font-bold text-blue-600 flex items-center gap-1"
                >
                  <Plus size={11} /> Add Dimension
                </button>
              </div>
            </div>

            {/* Technical Diagram & Specs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-[10px] font-bold text-blue-600 uppercase">Technical Diagram & Specs</h5>
                <button type="button" onClick={() => setProductForm({ ...productForm, overview: { ...productForm.overview, productSpecifications: [...productForm.overview.productSpecifications, { highlight: "", title: "", image: "", specifications: [{ title: "", description: "" }] }] } })} className="text-[10px] font-bold text-blue-600 flex items-center gap-1"><Plus size={11} /> Add</button>
              </div>
              {productForm.overview.productSpecifications.map((ps, psIdx) => (
                <div key={psIdx} className="p-4 border border-blue-100 rounded-xl bg-blue-50/20 space-y-3 relative">
                  {productForm.overview.productSpecifications.length > 1 && (
                    <button type="button" onClick={() => setProductForm({ ...productForm, overview: { ...productForm.overview, productSpecifications: productForm.overview.productSpecifications.filter((_, i) => i !== psIdx) } })} className="absolute top-2 right-2 text-rose-500"><Trash2 size={12} /></button>
                  )}
                  <input className={fieldClass} placeholder="Highlight Text" value={ps.highlight} onChange={e => { const list = [...productForm.overview.productSpecifications]; list[psIdx].highlight = e.target.value; setProductForm({ ...productForm, overview: { ...productForm.overview, productSpecifications: list } }); }} />
                  <input className={fieldClass} placeholder="Main Specification Title" value={ps.title} onChange={e => { const list = [...productForm.overview.productSpecifications]; list[psIdx].title = e.target.value; setProductForm({ ...productForm, overview: { ...productForm.overview, productSpecifications: list } }); }} />
                  <div>
                    <label className={labelClass}>Diagram Image</label>
                    <div className="flex gap-3 items-end mt-1">
                      <div className="h-16 w-24 rounded border bg-white overflow-hidden shrink-0">
                        {ps.image && <Image width={100} height={64} src={getImageUrl(ps.image)} alt="Diagram" className="h-full w-full object-contain" />}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <input className={fieldClass} placeholder="Paste image URL" value={ps.image} onChange={e => { const list = [...productForm.overview.productSpecifications]; list[psIdx].image = e.target.value; setProductForm({ ...productForm, overview: { ...productForm.overview, productSpecifications: list } }); }} />
                        <label className="cursor-pointer inline-flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded text-[10px] font-bold hover:bg-blue-50 transition-colors">
                          <ImagePlus size={11} /> Upload
                          <input type="file" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const url = await uploadImage(file, "products"); const list = [...productForm.overview.productSpecifications]; list[psIdx].image = url; setProductForm({ ...productForm, overview: { ...productForm.overview, productSpecifications: list } }); }} />
                        </label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Specifications</label>
                    <div className="space-y-2 mt-1">
                      {ps.specifications.map((s, sIdx) => (
                        <div key={sIdx} className="flex gap-2">
                          <input className={fieldClass} placeholder="Label" value={s.title} onChange={e => { const list = [...productForm.overview.productSpecifications]; list[psIdx].specifications[sIdx].title = e.target.value; setProductForm({ ...productForm, overview: { ...productForm.overview, productSpecifications: list } }); }} />
                          <input className={fieldClass} placeholder="Value" value={s.description} onChange={e => { const list = [...productForm.overview.productSpecifications]; list[psIdx].specifications[sIdx].description = e.target.value; setProductForm({ ...productForm, overview: { ...productForm.overview, productSpecifications: list } }); }} />
                          <button type="button" onClick={() => { const list = [...productForm.overview.productSpecifications]; list[psIdx].specifications = list[psIdx].specifications.filter((_, i) => i !== sIdx); setProductForm({ ...productForm, overview: { ...productForm.overview, productSpecifications: list } }); }} className="shrink-0 text-rose-500 hover:bg-rose-50 p-1 rounded"><Trash2 size={13} /></button>
                        </div>
                      ))}
                      <button type="button" onClick={() => { const list = [...productForm.overview.productSpecifications]; list[psIdx].specifications.push({ title: "", description: "" }); setProductForm({ ...productForm, overview: { ...productForm.overview, productSpecifications: list } }); }} className="text-[10px] font-bold text-blue-600 flex items-center gap-1"><Plus size={12} /> Add Row</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Smart Design & Appearance */}
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
              <h5 className="text-[10px] font-bold  uppercase">Smart Design & Appearance</h5>
              <input className={fieldClass} placeholder="Highlight" value={productForm.overview.smartDesignAppearance.highlight} onChange={e => setProductForm({ ...productForm, overview: { ...productForm.overview, smartDesignAppearance: { ...productForm.overview.smartDesignAppearance, highlight: e.target.value } } })} />
              <input className={fieldClass} placeholder="Appearance Title" value={productForm.overview.smartDesignAppearance.title} onChange={e => setProductForm({ ...productForm, overview: { ...productForm.overview, smartDesignAppearance: { ...productForm.overview.smartDesignAppearance, title: e.target.value } } })} />
             <div>
                <label className={labelClass}>Wood Finishes</label>
                <div className="space-y-2 mt-1">
                  {productForm.overview.smartDesignAppearance.woodFinish.map((item, idx) => (
                    <div key={idx} className="p-3 border border-slate-200 rounded-xl bg-white space-y-2 relative">
                      <button type="button" onClick={() => setProductForm({ ...productForm, overview: { ...productForm.overview, smartDesignAppearance: { ...productForm.overview.smartDesignAppearance, woodFinish: productForm.overview.smartDesignAppearance.woodFinish.filter((_, i) => i !== idx) } } })} className="absolute top-2 right-2 text-rose-500"><Trash2 size={13} /></button>
                      <input className={fieldClass} placeholder="Finish Name e.g. Walnut" value={item.title} onChange={e => { const list = [...productForm.overview.smartDesignAppearance.woodFinish]; list[idx] = { ...list[idx], title: e.target.value }; setProductForm({ ...productForm, overview: { ...productForm.overview, smartDesignAppearance: { ...productForm.overview.smartDesignAppearance, woodFinish: list } } }); }} />
                      <div className="flex gap-3 items-end">
                        {item.image && <Image width={80} height={56} src={getImageUrl(item.image)} alt={item.title} className="h-14 w-20 rounded object-cover border shrink-0" crossOrigin="anonymous" />}
                        <div className="flex-1 space-y-1.5">
                          <input className={fieldClass} placeholder="Paste image URL" value={item.image} onChange={e => { const list = [...productForm.overview.smartDesignAppearance.woodFinish]; list[idx] = { ...list[idx], image: e.target.value }; setProductForm({ ...productForm, overview: { ...productForm.overview, smartDesignAppearance: { ...productForm.overview.smartDesignAppearance, woodFinish: list } } }); }} />
                          <label className="cursor-pointer inline-flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded text-[10px] font-bold hover:bg-blue-50 transition-colors">
                            <ImagePlus size={11} /> Upload
                            <input type="file" className="hidden" accept="image/*" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; const url = await uploadImage(file, "products"); const list = [...productForm.overview.smartDesignAppearance.woodFinish]; list[idx] = { ...list[idx], image: url }; setProductForm({ ...productForm, overview: { ...productForm.overview, smartDesignAppearance: { ...productForm.overview.smartDesignAppearance, woodFinish: list } } }); }} />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => setProductForm({ ...productForm, overview: { ...productForm.overview, smartDesignAppearance: { ...productForm.overview.smartDesignAppearance, woodFinish: [...productForm.overview.smartDesignAppearance.woodFinish, { title: "", image: "" }] } } })} className="text-[10px] font-bold text-blue-600 flex items-center gap-1"><Plus size={12} /> Add Finish</button>
                </div>
              </div>
              <div>
                <label className={labelClass}>Size Options</label>
                <div className="space-y-2 mt-1">
                  {productForm.overview.smartDesignAppearance.sizeOptions.map((opt, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input className={fieldClass} placeholder="Size" value={opt.title} onChange={e => { const list = [...productForm.overview.smartDesignAppearance.sizeOptions]; list[idx].title = e.target.value; setProductForm({ ...productForm, overview: { ...productForm.overview, smartDesignAppearance: { ...productForm.overview.smartDesignAppearance, sizeOptions: list } } }); }} />
                      <input className={fieldClass} placeholder="Info" value={opt.description} onChange={e => { const list = [...productForm.overview.smartDesignAppearance.sizeOptions]; list[idx].description = e.target.value; setProductForm({ ...productForm, overview: { ...productForm.overview, smartDesignAppearance: { ...productForm.overview.smartDesignAppearance, sizeOptions: list } } }); }} />
                      <button type="button" onClick={() => setProductForm({ ...productForm, overview: { ...productForm.overview, smartDesignAppearance: { ...productForm.overview.smartDesignAppearance, sizeOptions: productForm.overview.smartDesignAppearance.sizeOptions.filter((_, i) => i !== idx) } } })} className="shrink-0 text-rose-500"><Trash2 size={13} /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setProductForm({ ...productForm, overview: { ...productForm.overview, smartDesignAppearance: { ...productForm.overview.smartDesignAppearance, sizeOptions: [...productForm.overview.smartDesignAppearance.sizeOptions, { title: "", description: "" }] } } })} className="text-[10px] font-bold text-blue-600 flex items-center gap-1"><Plus size={12} /> Add Size</button>
                </div>
              </div>
            </div>

            {/* Material & Care */}
            <div className="p-4 border border-amber-100 rounded-xl bg-amber-50/20 space-y-2">
              <h5 className="text-[10px] font-bold text-amber-600 uppercase">Material & Care</h5>
              <input className={fieldClass} placeholder="Title" value={productForm.overview.materialAndCare.title} onChange={e => setProductForm({ ...productForm, overview: { ...productForm.overview, materialAndCare: { ...productForm.overview.materialAndCare, title: e.target.value } } })} />
              <textarea className={`${fieldClass} min-h-16`} placeholder="Care instructions..." value={productForm.overview.materialAndCare.description} onChange={e => setProductForm({ ...productForm, overview: { ...productForm.overview, materialAndCare: { ...productForm.overview.materialAndCare, description: e.target.value } } })} />
            </div>

            {/* FAQs */}
            <div className="space-y-3">
              <label className={labelClass}>Product FAQs</label>
              {productForm.overview.faqs.map((faq, idx) => (
                <div key={idx} className="p-3 border border-slate-200 rounded-xl bg-white relative space-y-2">
                  <button type="button" onClick={() => setProductForm({ ...productForm, overview: { ...productForm.overview, faqs: productForm.overview.faqs.filter((_, i) => i !== idx) } })} className="absolute top-2 right-2 text-rose-500"><Trash2 size={14} /></button>
                  <input className={fieldClass} placeholder="Question" value={faq.question} onChange={e => { const list = [...productForm.overview.faqs]; list[idx].question = e.target.value; setProductForm({ ...productForm, overview: { ...productForm.overview, faqs: list } }); }} />
                  <textarea className={`${fieldClass} min-h-12`} placeholder="Answer" value={faq.description} onChange={e => { const list = [...productForm.overview.faqs]; list[idx].description = e.target.value; setProductForm({ ...productForm, overview: { ...productForm.overview, faqs: list } }); }} />
                </div>
              ))}
              <button type="button" onClick={() => setProductForm({ ...productForm, overview: { ...productForm.overview, faqs: [...productForm.overview.faqs, { question: "", description: "" }] } })} className="w-full py-2 border-2 border-dashed rounded-lg  text-[10px] font-bold hover:bg-slate-50">+ Add FAQ</button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-1">
            <button className="inline-flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors cursor-pointer" disabled={loading}>
              <Save size={11} /> Save Product
            </button>
            {productForm.id && (
              <button type="button" onClick={() => setProductForm({ ...emptyProduct, category: categories[0]?._id || "" })} className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}