"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Boxes, Code2, ExternalLink, LayoutDashboard, LogOut, Pencil, Plus, Save, ShieldCheck, Trash2 } from "lucide-react";
import {
  adminApi,
  authStore,
  categoryApi,
  componentContentApi,
  getImageUrl,
  productApi,
  type AuthUser,
  type Category,
  type ComponentContent,
  type Product,
} from "@/app/lib/api";

type ProductForm = {
  id?: string;
  title: string;
  description: string;
  price: string;
  discountPrice: string;
  stock: string;
  category: string;
  images: string;
};

type CategoryForm = {
  id?: string;
  name: string;
  description: string;
};

type ContentForm = {
  id?: string;
  key: string;
  label: string;
  page: string;
  description: string;
  data: string;
  isActive: boolean;
};

const emptyProduct: ProductForm = {
  title: "",
  description: "",
  price: "",
  discountPrice: "",
  stock: "",
  category: "",
  images: "",
};

const emptyCategory: CategoryForm = {
  name: "",
  description: "",
};

const defaultComponentContents: ContentForm[] = [
  {
    key: "layout.header",
    label: "Header",
    page: "layout",
    description: "Navigation, contact details, social links, brochure URL, and login links.",
    isActive: true,
    data: JSON.stringify(
      {
        phone: "+91 9654900525",
        email: "info@ensis.in",
        brochureUrl: "https://ensis.in/pdf/e-broucher.pdf",
        badges: ["Exporting Worldwide", "ISO 9001:2015 Certified", "Manufactured in India"],
        navLinks: [
          { label: "Home", href: "/" },
          { label: "About Us", href: "/about" },
          { label: "Furniture & Equipment", href: "/products" },
          { label: "Turnkey Solutions", href: "/turnkey" },
          { label: "Consultancy", href: "/projects" },
          { label: "Projects And Clients", href: "/manufacturing" },
          { label: "Blog", href: "/certifications" },
          { label: "Enquiry", href: "/blog" },
          { label: "Contact Us", href: "/contact" }
        ],
        socialLinks: []
      },
      null,
      2
    ),
  },
  {
    key: "home.hero",
    label: "Home Hero",
    page: "home",
    description: "Homepage slider text, button labels, and image paths.",
    isActive: true,
    data: JSON.stringify(
      {
        slides: [
          {
            title: "Rooted in Tradition",
            highlight: "Crafted for Healing",
            description: "Authentic Panchakarma. Timeless wellness",
            image: "",
            primaryBtn: "EXPLORE COLLECTION"
          }
        ]
      },
      null,
      2
    ),
  },
  {
    key: "home.features",
    label: "Home Feature Cards",
    page: "home",
    description: "Four feature cards shown below the home hero.",
    isActive: true,
    data: JSON.stringify(
      {
        features: [
          { title: "In-house Manufacturing", desc: "Premium quality products crafted in our own facility", imgurl: "" },
          { title: "Customized Solutions", desc: "Tailored equipment as per your space & requirement", imgurl: "" },
          { title: "Export Quality Standards", desc: "International standards with strict quality control", imgurl: "" },
          { title: "Turnkey Wellness Solutions", desc: "From concept to complete wellness setup", imgurl: "" }
        ]
      },
      null,
      2
    ),
  },
  {
    key: "home.turnkeySolutions",
    label: "Home Turnkey Solutions",
    page: "home",
    description: "Turnkey solutions section heading, CTA, background, and service cards.",
    isActive: true,
    data: JSON.stringify(
      {
        eyebrow: "TURNKEY WELLNESS SOLUTIONS",
        heading: "From Concept to\nComplete Wellness Setup",
        description: "We provide end-to-end solutions for Panchkarma Clinics, Resorts, Hospitals & Wellness Centers.",
        buttonText: "BOOK DESIGN CONSULTATION",
        backgroundImage: "",
        solutions: [
          { title: "Panchkarma Clinic Setup", imgUrl: "" },
          { title: "Resort & Spa Setup", imgUrl: "" },
          { title: "Wellness Retreat Design", imgUrl: "" },
          { title: "Ayurveda Hospital Equipment", imgUrl: "" },
          { title: "Interior & Equipment Integration", imgUrl: "" }
        ]
      },
      null,
      2
    ),
  },
  {
    key: "home.globalPresence",
    label: "Home Global Presence",
    page: "home",
    description: "Global presence section text, image, and statistics.",
    isActive: true,
    data: JSON.stringify(
      {
        eyebrow: "GLOBAL PRESENCE",
        heading: "Trusted by Wellness\nProfessionals Worldwide",
        description: "Exporting to 25+ countries and growing stronger every day",
        image: "",
        stats: [
          { value: "25+", label: "Countries" },
          { value: "500+", label: "Projects" },
          { value: "10+", label: "Years of Excellence" },
          { value: "100%", label: "Customer Satisfaction" }
        ]
      },
      null,
      2
    ),
  },
  {
    key: "home.wellnessSection",
    label: "Wellness Section",
    page: "home",
    description: "Wellness section welcome info, welcome image, and services list.",
    isActive: true,
    data: JSON.stringify(
      {
        welcomeImage: "/uploads/1780037261719-chatgpt-image-may-29-2026-10_39_53-am.png",
        eyebrow: "Welcome To Ensis",
        heading: "Where Tradition Meets Transformative Wellness.",
        description: "At Ensis, we blend ancient Ayurvedic wisdom with exceptional craftsmanship to create timeless wellness solutions for modern lives.",
        buttonText: "Know More",
        buttonHref: "/about",
        services: [
          {
            image: "",
            title: "PANCHAKARMA TABLES",
            description: "Experience authentic therapies with comfort and precision."
          },
          {
            image: "",
            title: "SHIRODHARA EQUIPMENTS",
            description: "Precision-crafted for deep relaxation and mental clarity."
          },
          {
            image: "",
            title: "STEAM & SAUNA",
            description: "Detoxify. Rejuvenate. Restore balance naturally."
          },
          {
            image: "",
            title: "WELLNESS ACCESSORIES",
            description: "Thoughtful additions for a complete wellness journey."
          }
        ]
      },
      null,
      2
    ),
  },
  {
    key: "contact.details",
    label: "Contact Details",
    page: "contact",
    description: "Address, phone, email, business hours, and social links on the contact page.",
    isActive: true,
    data: JSON.stringify(
      {
        heading: "Get In Touch",
        intro: "Have a question or need assistance? We're here to help you on your wellness journey.",
        address: "12/29, Site-II, Loni Road, Industrial Area, Mohan Nagar - 201007, Ghaziabad, Uttar Pradesh, India",
        phone: "+91-9654900525",
        email: "info@ensis.in",
        hours: "Mon - Sat: 9:00 AM - 6:00 PM",
        socialLinks: []
      },
      null,
      2
    ),
  },
];

const emptyContent: ContentForm = {
  key: "",
  label: "",
  page: "",
  description: "",
  data: "{\n  \n}",
  isActive: true,
};

const fieldClass = "w-full rounded-md border border-[#d9cdbb] bg-white px-3 py-2 text-sm outline-none focus:border-[#8d6a3a]";
const labelClass = "block text-xs font-bold uppercase tracking-wide text-[#5f5a50]";

export default function AdminHome() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"components" | "products" | "categories">("components");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [contents, setContents] = useState<ComponentContent[]>([]);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProduct);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(emptyCategory);
  const [contentForm, setContentForm] = useState<ContentForm>(emptyContent);

  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

  const selectedCategoryName = useMemo(() => {
    const category = categories.find((item) => item._id === productForm.category);
    return category?.name || "Select category";
  }, [categories, productForm.category]);

  const refreshData = async () => {
    const [productResult, categoryResult, contentResult] = await Promise.all([productApi.list(), categoryApi.list(), componentContentApi.list()]);
    setProducts(productResult.products);
    setCategories(categoryResult);
    setContents(contentResult);
    if (!productForm.category && categoryResult[0]) {
      setProductForm((current) => ({ ...current, category: categoryResult[0]._id }));
    }
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

  const handleLogout = () => {
    authStore.clear();
    setUser(null);
    setProducts([]);
    setCategories([]);
    setMessage("Signed out.");
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
      images: productForm.images.split(",").map((item) => item.trim()).filter(Boolean),
    };

    try {
      if (productForm.id) {
        await productApi.update(productForm.id, payload);
        setMessage("Product updated.");
      } else {
        await productApi.create(payload);
        setMessage("Product added.");
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
      images: product.images?.join(", ") || "",
    });
    setActiveTab("products");
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

  const submitCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      if (categoryForm.id) {
        await categoryApi.update(categoryForm.id, categoryForm);
        setMessage("Category updated.");
      } else {
        await categoryApi.create(categoryForm);
        setMessage("Category added.");
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

  const seedDefaultContents = async () => {
    setLoading(true);
    setMessage("");
    try {
      for (const item of defaultComponentContents) {
        await componentContentApi.create({
          key: item.key,
          label: item.label,
          page: item.page,
          description: item.description,
          isActive: item.isActive,
          data: JSON.parse(item.data),
        });
      }
      await refreshData();
      setMessage("Default editable components added.");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const submitContent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const payload = {
        key: contentForm.key.trim(),
        label: contentForm.label.trim(),
        page: contentForm.page.trim(),
        description: contentForm.description.trim(),
        isActive: contentForm.isActive,
        data: JSON.parse(contentForm.data),
      };
      if (contentForm.id) {
        await componentContentApi.update(contentForm.id, payload);
        setMessage("Component content updated.");
      } else {
        await componentContentApi.create(payload);
        setMessage("Component content added.");
      }
      setContentForm(emptyContent);
      await refreshData();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const editContent = (content: ComponentContent) => {
    setContentForm({
      id: content._id,
      key: content.key,
      label: content.label,
      page: content.page,
      description: content.description || "",
      isActive: content.isActive,
      data: JSON.stringify(content.data || {}, null, 2),
    });
    setActiveTab("components");
  };

  const deleteContent = async (content: ComponentContent) => {
    if (!confirm(`Delete ${content.label}?`)) return;
    setLoading(true);
    try {
      await componentContentApi.remove(content._id);
      await refreshData();
      setMessage("Component content deleted.");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center px-4 py-10">
        <form onSubmit={handleLogin} className="w-full max-w-md rounded-lg border border-[#ded3c4] bg-white p-8 shadow-sm">
          <div className="mb-6 inline-flex size-12 items-center justify-center rounded-full bg-[#f3eee6] text-[#6f542f]">
            <ShieldCheck size={24} />
          </div>
          <h1 className="font-serif text-3xl text-[#1f261b]">Ensis Admin</h1>
          <p className="mt-2 text-sm leading-6 text-[#5f5a50]">Sign in with an admin account to manage frontend product and category data.</p>
          <label className={`${labelClass} mt-6`}>
            Email
            <input className={`${fieldClass} mt-2`} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className={`${labelClass} mt-4`}>
            Password
            <input className={`${fieldClass} mt-2`} type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#6f542f] px-4 py-3 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-70" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
          {message && <p className="mt-4 text-sm font-semibold text-[#7a3f22]">{message}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-[#ded3c4] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#8d6a3a]">Ensis Admin</span>
            <h1 className="font-serif text-3xl text-[#1f261b]">Content Manager</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href={frontendUrl} target="_blank" className="inline-flex items-center gap-2 rounded-md border border-[#d9cdbb] bg-white px-4 py-2 text-sm font-bold text-[#263016]">
              <ExternalLink size={16} /> View Site
            </Link>
            <Link href="/homepage-content" className="inline-flex items-center gap-2 rounded-md border border-[#d9cdbb] bg-white px-4 py-2 text-sm font-bold text-[#263016]">
              <LayoutDashboard size={16} /> Homepage Content
            </Link>
            <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-md bg-[#263016] px-4 py-2 text-sm font-bold text-white">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-6">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <button onClick={() => setActiveTab("components")} className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold ${activeTab === "components" ? "bg-[#6f542f] text-white" : "border border-[#d9cdbb] bg-white text-[#263016]"}`}>
            <Code2 size={16} /> Components
          </button>
          <button onClick={() => setActiveTab("products")} className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold ${activeTab === "products" ? "bg-[#6f542f] text-white" : "border border-[#d9cdbb] bg-white text-[#263016]"}`}>
            <Boxes size={16} /> Products
          </button>
          <button onClick={() => setActiveTab("categories")} className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold ${activeTab === "categories" ? "bg-[#6f542f] text-white" : "border border-[#d9cdbb] bg-white text-[#263016]"}`}>
            <LayoutDashboard size={16} /> Categories
          </button>
          {message && <p className="text-sm font-semibold text-[#7a3f22]">{message}</p>}
        </div>

        {activeTab === "components" ? (
          <section className="grid gap-6 lg:grid-cols-[0.95fr_1.4fr]">
            <form onSubmit={submitContent} className="rounded-lg border border-[#ded3c4] bg-white p-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-lg font-bold"><Code2 size={18} /> {contentForm.id ? "Edit Component Data" : "Add Component Data"}</h2>
                <button type="button" onClick={seedDefaultContents} className="rounded-md border border-[#d9cdbb] px-3 py-2 text-xs font-bold" disabled={loading}>Add Defaults</button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>Key<input className={`${fieldClass} mt-2`} value={contentForm.key} onChange={(event) => setContentForm({ ...contentForm, key: event.target.value })} placeholder="home.hero" required /></label>
                <label className={labelClass}>Label<input className={`${fieldClass} mt-2`} value={contentForm.label} onChange={(event) => setContentForm({ ...contentForm, label: event.target.value })} placeholder="Home Hero" required /></label>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <label className={labelClass}>Page<input className={`${fieldClass} mt-2`} value={contentForm.page} onChange={(event) => setContentForm({ ...contentForm, page: event.target.value })} placeholder="home" required /></label>
                <label className="flex items-center gap-2 text-sm font-bold text-[#263016]"><input type="checkbox" checked={contentForm.isActive} onChange={(event) => setContentForm({ ...contentForm, isActive: event.target.checked })} /> Active</label>
              </div>
              <label className={`${labelClass} mt-4`}>Description<textarea className={`${fieldClass} mt-2 min-h-20`} value={contentForm.description} onChange={(event) => setContentForm({ ...contentForm, description: event.target.value })} /></label>
              <label className={`${labelClass} mt-4`}>JSON Data<textarea className={`${fieldClass} mt-2 min-h-80 font-mono text-xs`} value={contentForm.data} onChange={(event) => setContentForm({ ...contentForm, data: event.target.value })} required /></label>
              <div className="mt-5 flex gap-3">
                <button className="inline-flex items-center gap-2 rounded-md bg-[#6f542f] px-4 py-2 text-sm font-bold text-white" disabled={loading}><Save size={16} /> Save</button>
                {contentForm.id && <button type="button" onClick={() => setContentForm(emptyContent)} className="rounded-md border border-[#d9cdbb] px-4 py-2 text-sm font-bold">Cancel</button>}
              </div>
            </form>

            <div className="overflow-hidden rounded-lg border border-[#ded3c4] bg-white">
              <div className="border-b border-[#ded3c4] px-5 py-4 text-sm font-bold">{contents.length} Editable Components</div>
              <div className="divide-y divide-[#eee5d9]">
                {contents.map((content) => (
                  <article key={content._id} className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-[#1f261b]">{content.label}</h3>
                        <span className="rounded-full bg-[#f3eee6] px-2 py-1 text-[11px] font-bold text-[#6f542f]">{content.key}</span>
                        {!content.isActive && <span className="rounded-full bg-[#f8e7e7] px-2 py-1 text-[11px] font-bold text-[#9b2c2c]">Inactive</span>}
                      </div>
                      <p className="mt-1 text-sm text-[#5f5a50]">{content.description || `Page: ${content.page}`}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => editContent(content)} className="inline-flex size-10 items-center justify-center rounded-md border border-[#d9cdbb]" aria-label="Edit component content"><Pencil size={16} /></button>
                      <button onClick={() => deleteContent(content)} className="inline-flex size-10 items-center justify-center rounded-md border border-[#d9cdbb] text-[#9b2c2c]" aria-label="Delete component content"><Trash2 size={16} /></button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : activeTab === "products" ? (
          <section className="grid gap-6 lg:grid-cols-[0.95fr_1.4fr]">
            <form onSubmit={submitProduct} className="rounded-lg border border-[#ded3c4] bg-white p-5">
              <h2 className="mb-5 flex items-center gap-2 text-lg font-bold"><Plus size={18} /> {productForm.id ? "Edit Product" : "Add Product"}</h2>
              <label className={labelClass}>Title<input className={`${fieldClass} mt-2`} value={productForm.title} onChange={(event) => setProductForm({ ...productForm, title: event.target.value })} required /></label>
              <label className={`${labelClass} mt-4`}>Description<textarea className={`${fieldClass} mt-2 min-h-28`} value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} required /></label>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <label className={labelClass}>Price<input className={`${fieldClass} mt-2`} type="number" min="0" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} required /></label>
                <label className={labelClass}>Discount<input className={`${fieldClass} mt-2`} type="number" min="0" value={productForm.discountPrice} onChange={(event) => setProductForm({ ...productForm, discountPrice: event.target.value })} /></label>
                <label className={labelClass}>Stock<input className={`${fieldClass} mt-2`} type="number" min="0" value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} /></label>
              </div>
              <label className={`${labelClass} mt-4`}>Category<select className={`${fieldClass} mt-2`} value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })} required><option value="">{selectedCategoryName}</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></label>
              <label className={`${labelClass} mt-4`}>Images<input className={`${fieldClass} mt-2`} value={productForm.images} onChange={(event) => setProductForm({ ...productForm, images: event.target.value })} placeholder="/uploads/product.webp, https://..." /></label>
              <div className="mt-5 flex gap-3">
                <button className="inline-flex items-center gap-2 rounded-md bg-[#6f542f] px-4 py-2 text-sm font-bold text-white" disabled={loading}><Save size={16} /> Save</button>
                {productForm.id && <button type="button" onClick={() => setProductForm({ ...emptyProduct, category: categories[0]?._id || "" })} className="rounded-md border border-[#d9cdbb] px-4 py-2 text-sm font-bold">Cancel</button>}
              </div>
            </form>

            <div className="overflow-hidden rounded-lg border border-[#ded3c4] bg-white">
              <div className="border-b border-[#ded3c4] px-5 py-4 text-sm font-bold">{products.length} Products</div>
              <div className="divide-y divide-[#eee5d9]">
                {products.map((product) => (
                  <article key={product._id} className="grid gap-4 p-4 md:grid-cols-[96px_1fr_auto] md:items-center">
                    <div className="h-20 overflow-hidden rounded-md bg-[#e5dccf]">{product.images?.[0] && <img src={getImageUrl(product.images[0])} alt={product.title} className="h-full w-full object-cover" />}</div>
                    <div>
                      <h3 className="font-bold text-[#1f261b]">{product.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-[#5f5a50]">{product.description}</p>
                      <p className="mt-2 text-sm font-bold text-[#334022]">Rs. {product.price?.toLocaleString("en-IN")} · {typeof product.category === "string" ? product.category : product.category?.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => editProduct(product)} className="inline-flex size-10 items-center justify-center rounded-md border border-[#d9cdbb]" aria-label="Edit product"><Pencil size={16} /></button>
                      <button onClick={() => deleteProduct(product)} className="inline-flex size-10 items-center justify-center rounded-md border border-[#d9cdbb] text-[#9b2c2c]" aria-label="Delete product"><Trash2 size={16} /></button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <form onSubmit={submitCategory} className="rounded-lg border border-[#ded3c4] bg-white p-5">
              <h2 className="mb-5 flex items-center gap-2 text-lg font-bold"><Plus size={18} /> {categoryForm.id ? "Edit Category" : "Add Category"}</h2>
              <label className={labelClass}>Name<input className={`${fieldClass} mt-2`} value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} required /></label>
              <label className={`${labelClass} mt-4`}>Description<textarea className={`${fieldClass} mt-2 min-h-28`} value={categoryForm.description} onChange={(event) => setCategoryForm({ ...categoryForm, description: event.target.value })} /></label>
              <div className="mt-5 flex gap-3">
                <button className="inline-flex items-center gap-2 rounded-md bg-[#6f542f] px-4 py-2 text-sm font-bold text-white" disabled={loading}><Save size={16} /> Save</button>
                {categoryForm.id && <button type="button" onClick={() => setCategoryForm(emptyCategory)} className="rounded-md border border-[#d9cdbb] px-4 py-2 text-sm font-bold">Cancel</button>}
              </div>
            </form>

            <div className="overflow-hidden rounded-lg border border-[#ded3c4] bg-white">
              <div className="border-b border-[#ded3c4] px-5 py-4 text-sm font-bold">{categories.length} Categories</div>
              <div className="divide-y divide-[#eee5d9]">
                {categories.map((category) => (
                  <article key={category._id} className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="font-bold text-[#1f261b]">{category.name}</h3>
                      <p className="mt-1 text-sm text-[#5f5a50]">{category.description || "No description"}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setCategoryForm({ id: category._id, name: category.name, description: category.description || "" })} className="inline-flex size-10 items-center justify-center rounded-md border border-[#d9cdbb]" aria-label="Edit category"><Pencil size={16} /></button>
                      <button onClick={() => deleteCategory(category)} className="inline-flex size-10 items-center justify-center rounded-md border border-[#d9cdbb] text-[#9b2c2c]" aria-label="Delete category"><Trash2 size={16} /></button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
