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
  overview: {
    title: string;
    description: string;
    overviewList: string[];
    overviewMaterial: { title: string; description: string }[];
    specifications: { title: string; specificationsList: { title: string; description: string } };
    keyFeatures: { title: string; keyFeaturesList: { title: string; description: string } };
    dimensions: { title: string; dimensionsList: { title: string; description: string } };
    materialAndCare: { title: string; description: string };
    productSpecifications: { highlight: string; title: string; image: string; specifications: { title: string; description: string }[] };
    whatisInclueded: string[];
    smartDesignAppearance: {
      highlight: string;
      title: string;
      woodFinish: string[];
      sizeOptions: { title: string; description: string }[];
    };
    faqs: { question: string; description: string }[];
  };
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
  overview: {
    title: "",
    description: "",
    overviewList: [""],
    overviewMaterial: [{ title: "", description: "" }],
    specifications: { title: "", specificationsList: { title: "", description: "" } },
    keyFeatures: { title: "", keyFeaturesList: { title: "", description: "" } },
    dimensions: { title: "", dimensionsList: { title: "", description: "" } },
    materialAndCare: { title: "", description: "" },
    productSpecifications: { highlight: "", title: "", image: "", specifications: [{ title: "", description: "" }] },
    whatisInclueded: [""],
    smartDesignAppearance: {
      highlight: "",
      title: "",
      woodFinish: [""],
      sizeOptions: [{ title: "", description: "" }],
    },
    faqs: [{ question: "", description: "" }],
  },
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
      overview: productForm.overview,
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
      overview: product.overview || emptyProduct.overview,
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
  className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm space-y-3 h-fit max-h-[90vh] overflow-y-auto"
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

  {/* Detailed Overview Section */}
  <div className="pt-6 border-t border-slate-100 space-y-6">
    <h4 className="text-[10px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-2">
      Technical Overview & Details
    </h4>

    {/* Basic Overview */}
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1">
        <label className={labelClass}>Overview Section Title</label>
        <input className={fieldClass} value={productForm.overview.title} onChange={e => setProductForm({...productForm, overview: {...productForm.overview, title: e.target.value}})} placeholder="e.g., Exquisite Craftsmanship" />
      </div>
      <div className="space-y-1">
        <label className={labelClass}>Overview Description</label>
        <textarea className={fieldClass} rows={1} value={productForm.overview.description} onChange={e => setProductForm({...productForm, overview: {...productForm.overview, description: e.target.value}})} placeholder="Short intro to technical details..." />
      </div>
    </div>

    {/* Overview List & Included items */}
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-2">
        <label className={labelClass}>Overview Bullet Points</label>
        {productForm.overview.overviewList.map((item, idx) => (
          <div key={idx} className="flex gap-2">
            <input className={fieldClass} value={item} onChange={e => {
              const list = [...productForm.overview.overviewList]; list[idx] = e.target.value;
              setProductForm({...productForm, overview: {...productForm.overview, overviewList: list}});
            }} />
            <button type="button" onClick={() => setProductForm({...productForm, overview: {...productForm.overview, overviewList: productForm.overview.overviewList.filter((_, i) => i !== idx)}})} className="text-rose-500 hover:bg-rose-50 p-1 rounded"><Trash2 size={14}/></button>
          </div>
        ))}
        <button type="button" onClick={() => setProductForm({...productForm, overview: {...productForm.overview, overviewList: [...productForm.overview.overviewList, ""]}})} className="text-[10px] font-bold text-blue-600 flex items-center gap-1"><Plus size={12}/> Add Point</button>
      </div>

      <div className="space-y-2">
        <label className={labelClass}>What's Included</label>
        {productForm.overview.whatisInclueded.map((item, idx) => (
          <div key={idx} className="flex gap-2">
            <input className={fieldClass} value={item} onChange={e => {
              const list = [...productForm.overview.whatisInclueded]; list[idx] = e.target.value;
              setProductForm({...productForm, overview: {...productForm.overview, whatisInclueded: list}});
            }} />
            <button type="button" onClick={() => setProductForm({...productForm, overview: {...productForm.overview, whatisInclueded: productForm.overview.whatisInclueded.filter((_, i) => i !== idx)}})} className="text-rose-500 hover:bg-rose-50 p-1 rounded"><Trash2 size={14}/></button>
          </div>
        ))}
        <button type="button" onClick={() => setProductForm({...productForm, overview: {...productForm.overview, whatisInclueded: [...productForm.overview.whatisInclueded, ""]}})} className="text-[10px] font-bold text-blue-600 flex items-center gap-1"><Plus size={12}/> Add Item</button>
      </div>
    </div>

    {/* Materials Table */}
    <div className="space-y-2">
      <label className={labelClass}>Overview Materials</label>
      {productForm.overview.overviewMaterial.map((m, idx) => (
        <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <input className={fieldClass} placeholder="Title (e.g. Wood Type)" value={m.title} onChange={e => {
            const list = [...productForm.overview.overviewMaterial]; list[idx].title = e.target.value;
            setProductForm({...productForm, overview: {...productForm.overview, overviewMaterial: list}});
          }} />
          <input className={fieldClass} placeholder="Description (e.g. Solid Teak)" value={m.description} onChange={e => {
            const list = [...productForm.overview.overviewMaterial]; list[idx].description = e.target.value;
            setProductForm({...productForm, overview: {...productForm.overview, overviewMaterial: list}});
          }} />
          <button type="button" onClick={() => setProductForm({...productForm, overview: {...productForm.overview, overviewMaterial: productForm.overview.overviewMaterial.filter((_, i) => i !== idx)}})} className="text-rose-500"><Trash2 size={14}/></button>
        </div>
      ))}
      <button type="button" onClick={() => setProductForm({...productForm, overview: {...productForm.overview, overviewMaterial: [...productForm.overview.overviewMaterial, {title:"", description:""}]}})} className="text-[10px] font-bold text-blue-600 flex items-center gap-1"><Plus size={12}/> Add Material Info</button>
    </div>

    {/* Technical Specs Blocks */}
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="p-3 border rounded-xl bg-slate-50 space-y-2">
        <label className="text-[10px] font-bold text-slate-500 uppercase">Key Specifications</label>
        <input className={fieldClass} placeholder="Section Title" value={productForm.overview.specifications.title} onChange={e => setProductForm({...productForm, overview: {...productForm.overview, specifications: {...productForm.overview.specifications, title: e.target.value}}})} />
        <div className="grid grid-cols-2 gap-2">
           <input className={fieldClass} placeholder="Label" value={productForm.overview.specifications.specificationsList.title} onChange={e => setProductForm({...productForm, overview: {...productForm.overview, specifications: {...productForm.overview.specifications, specificationsList: {...productForm.overview.specifications.specificationsList, title: e.target.value}}}})} />
           <input className={fieldClass} placeholder="Value" value={productForm.overview.specifications.specificationsList.description} onChange={e => setProductForm({...productForm, overview: {...productForm.overview, specifications: {...productForm.overview.specifications, specificationsList: {...productForm.overview.specifications.specificationsList, description: e.target.value}}}})} />
        </div>
      </div>

      <div className="p-3 border rounded-xl bg-slate-50 space-y-2">
        <label className="text-[10px] font-bold text-slate-500 uppercase">Product Dimensions</label>
        <input className={fieldClass} placeholder="Section Title" value={productForm.overview.dimensions.title} onChange={e => setProductForm({...productForm, overview: {...productForm.overview, dimensions: {...productForm.overview.dimensions, title: e.target.value}}})} />
        <div className="grid grid-cols-2 gap-2">
           <input className={fieldClass} placeholder="Label" value={productForm.overview.dimensions.dimensionsList.title} onChange={e => setProductForm({...productForm, overview: {...productForm.overview, dimensions: {...productForm.overview.dimensions, dimensionsList: {...productForm.overview.dimensions.dimensionsList, title: e.target.value}}}})} />
           <input className={fieldClass} placeholder="Value" value={productForm.overview.dimensions.dimensionsList.description} onChange={e => setProductForm({...productForm, overview: {...productForm.overview, dimensions: {...productForm.overview.dimensions, dimensionsList: {...productForm.overview.dimensions.dimensionsList, description: e.target.value}}}})} />
        </div>
      </div>
    </div>

    {/* Detailed Product Specs with Image */}
    <div className="p-4 border rounded-xl border-blue-100 bg-blue-50/20 space-y-4">
      <h5 className="text-[10px] font-bold text-blue-600 uppercase">Technical Diagram & Specs</h5>
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={fieldClass} placeholder="Highlight Text" value={productForm.overview.productSpecifications.highlight} onChange={e => setProductForm({...productForm, overview: {...productForm.overview, productSpecifications: {...productForm.overview.productSpecifications, highlight: e.target.value}}})} />
        <input className={fieldClass} placeholder="Main Specification Title" value={productForm.overview.productSpecifications.title} onChange={e => setProductForm({...productForm, overview: {...productForm.overview, productSpecifications: {...productForm.overview.productSpecifications, title: e.target.value}}})} />
      </div>
      
      <div className="flex gap-4 items-end">
        <div className="h-16 w-24 rounded border bg-white overflow-hidden shrink-0">
           {productForm.overview.productSpecifications.image && <Image width={100} height={64} src={getImageUrl(productForm.overview.productSpecifications.image)} alt="Diagram" className="h-full w-full object-contain" />}
        </div>
        <label className="cursor-pointer bg-white border border-slate-200 px-3 py-1.5 rounded text-[10px] font-bold hover:bg-blue-50 transition-colors">
          Upload Diagram
          <input type="file" className="hidden" onChange={async (e) => {
            const file = e.target.files?.[0]; if(!file) return;
            const url = await uploadImage(file, "products");
            setProductForm({...productForm, overview: {...productForm.overview, productSpecifications: {...productForm.overview.productSpecifications, image: url}}});
          }} />
        </label>
      </div>

      <div className="space-y-2">
        {productForm.overview.productSpecifications.specifications.map((s, idx) => (
          <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <input className={fieldClass} placeholder="Spec Name" value={s.title} onChange={e => {
              const list = [...productForm.overview.productSpecifications.specifications]; list[idx].title = e.target.value;
              setProductForm({...productForm, overview: {...productForm.overview, productSpecifications: {...productForm.overview.productSpecifications, specifications: list}}});
            }} />
            <input className={fieldClass} placeholder="Detail" value={s.description} onChange={e => {
              const list = [...productForm.overview.productSpecifications.specifications]; list[idx].description = e.target.value;
              setProductForm({...productForm, overview: {...productForm.overview, productSpecifications: {...productForm.overview.productSpecifications, specifications: list}}});
            }} />
            <button type="button" onClick={() => setProductForm({...productForm, overview: {...productForm.overview, productSpecifications: {...productForm.overview.productSpecifications, specifications: productForm.overview.productSpecifications.specifications.filter((_, i) => i !== idx)}}})} className="text-rose-500"><Trash2 size={14}/></button>
          </div>
        ))}
        <button type="button" onClick={() => setProductForm({...productForm, overview: {...productForm.overview, productSpecifications: {...productForm.overview.productSpecifications, specifications: [...productForm.overview.productSpecifications.specifications, {title:"", description:""}]}}})} className="text-[10px] font-bold text-blue-600 flex items-center gap-1"><Plus size={12}/> Add Diagram Point</button>
      </div>
    </div>

    {/* Design Variations */}
    <div className="p-4 border rounded-xl bg-slate-50 space-y-4">
      <h5 className="text-[10px] font-bold text-slate-500 uppercase">Smart Design & Appearance</h5>
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={fieldClass} placeholder="Highlight" value={productForm.overview.smartDesignAppearance.highlight} onChange={e => setProductForm({...productForm, overview: {...productForm.overview, smartDesignAppearance: {...productForm.overview.smartDesignAppearance, highlight: e.target.value}}})} />
        <input className={fieldClass} placeholder="Appearance Title" value={productForm.overview.smartDesignAppearance.title} onChange={e => setProductForm({...productForm, overview: {...productForm.overview, smartDesignAppearance: {...productForm.overview.smartDesignAppearance, title: e.target.value}}})} />
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className={labelClass}>Wood Finishes</label>
          {productForm.overview.smartDesignAppearance.woodFinish.map((item, idx) => (
            <div key={idx} className="flex gap-2">
              <input className={fieldClass} value={item} onChange={e => {
                const list = [...productForm.overview.smartDesignAppearance.woodFinish]; list[idx] = e.target.value;
                setProductForm({...productForm, overview: {...productForm.overview, smartDesignAppearance: {...productForm.overview.smartDesignAppearance, woodFinish: list}}});
              }} />
              <button type="button" onClick={() => setProductForm({...productForm, overview: {...productForm.overview, smartDesignAppearance: {...productForm.overview.smartDesignAppearance, woodFinish: productForm.overview.smartDesignAppearance.woodFinish.filter((_, i) => i !== idx)}}})} className="text-rose-500"><Trash2 size={14}/></button>
            </div>
          ))}
          <button type="button" onClick={() => setProductForm({...productForm, overview: {...productForm.overview, smartDesignAppearance: {...productForm.overview.smartDesignAppearance, woodFinish: [...productForm.overview.smartDesignAppearance.woodFinish, ""]}}})} className="text-[10px] font-bold text-blue-600 flex items-center gap-1"><Plus size={12}/> Add Finish</button>
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Size Options</label>
          {productForm.overview.smartDesignAppearance.sizeOptions.map((opt, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input className={fieldClass} placeholder="Size" value={opt.title} onChange={e => {
                const list = [...productForm.overview.smartDesignAppearance.sizeOptions]; list[idx].title = e.target.value;
                setProductForm({...productForm, overview: {...productForm.overview, smartDesignAppearance: {...productForm.overview.smartDesignAppearance, sizeOptions: list}}});
              }} />
              <input className={fieldClass} placeholder="Info" value={opt.description} onChange={e => {
                const list = [...productForm.overview.smartDesignAppearance.sizeOptions]; list[idx].description = e.target.value;
                setProductForm({...productForm, overview: {...productForm.overview, smartDesignAppearance: {...productForm.overview.smartDesignAppearance, sizeOptions: list}}});
              }} />
              <button type="button" onClick={() => setProductForm({...productForm, overview: {...productForm.overview, smartDesignAppearance: {...productForm.overview.smartDesignAppearance, sizeOptions: productForm.overview.smartDesignAppearance.sizeOptions.filter((_, i) => i !== idx)}}})} className="text-rose-500"><Trash2 size={14}/></button>
            </div>
          ))}
          <button type="button" onClick={() => setProductForm({...productForm, overview: {...productForm.overview, smartDesignAppearance: {...productForm.overview.smartDesignAppearance, sizeOptions: [...productForm.overview.smartDesignAppearance.sizeOptions, {title:"", description:""}]}}})} className="text-[10px] font-bold text-blue-600 flex items-center gap-1"><Plus size={12}/> Add Size</button>
        </div>
      </div>
    </div>

    {/* Care Instructions */}
    <div className="p-4 border rounded-xl bg-amber-50/20 space-y-2">
      <h5 className="text-[10px] font-bold text-amber-600 uppercase">Material & Care</h5>
      <input className={fieldClass} placeholder="Title" value={productForm.overview.materialAndCare.title} onChange={e => setProductForm({...productForm, overview: {...productForm.overview, materialAndCare: {...productForm.overview.materialAndCare, title: e.target.value}}})} />
      <textarea className={fieldClass} rows={2} placeholder="Care instructions..." value={productForm.overview.materialAndCare.description} onChange={e => setProductForm({...productForm, overview: {...productForm.overview, materialAndCare: {...productForm.overview.materialAndCare, description: e.target.value}}})} />
    </div>

    {/* FAQs Section */}
    <div className="space-y-4">
      <label className={labelClass}>Product FAQs</label>
      {productForm.overview.faqs.map((faq, idx) => (
        <div key={idx} className="p-4 border rounded-xl bg-white relative space-y-2 shadow-sm">
          <button type="button" onClick={() => setProductForm({...productForm, overview: {...productForm.overview, faqs: productForm.overview.faqs.filter((_, i) => i !== idx)}})} className="absolute top-2 right-2 text-rose-500"><Trash2 size={16}/></button>
          <input className={fieldClass} placeholder="Question" value={faq.question} onChange={e => {
            const list = [...productForm.overview.faqs]; list[idx].question = e.target.value;
            setProductForm({...productForm, overview: {...productForm.overview, faqs: list}});
          }} />
          <textarea className={fieldClass} rows={1} placeholder="Answer" value={faq.description} onChange={e => {
            const list = [...productForm.overview.faqs]; list[idx].description = e.target.value;
            setProductForm({...productForm, overview: {...productForm.overview, faqs: list}});
          }} />
        </div>
      ))}
      <button type="button" onClick={() => setProductForm({...productForm, overview: {...productForm.overview, faqs: [...productForm.overview.faqs, {question:"", description:""}]}})} className="w-full py-2 border-2 border-dashed rounded-lg text-slate-400 text-[10px] font-bold hover:bg-slate-50">+ Add FAQ</button>
    </div>
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
