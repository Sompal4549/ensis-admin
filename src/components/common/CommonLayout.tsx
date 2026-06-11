"use client";

import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import {
  Menu,
  ChevronDown,
  Home,
  Info,
  AlignJustify,
  ArrowDownToLine,
  LayoutDashboard,
  Layers,
  Search,
  Briefcase,
  ImageUp,
  ExternalLink,
  Bell,
  User,
  Headphones,
  ArrowRight,
  MessageSquare,
  Activity,
  CheckCircle,
  Users,
  Boxes,
  LayoutGrid,
  LogOut,
  FolderOpen,
  UserPlus,
  PanelBottom,
  UserRoundPlus,
  UserRoundCog
} from "lucide-react";
import { LoginForm, useAuth } from "@/components/auth/AuthContext";
import sidebarBg from "@/assets/sidebarbg.webp"
import UserManagementModal from "./UserManagementModal";
import PageStatsCards from "./PageStatsCards";
import LivePreviewIframe from "./LivePreviewIframe";
import { api, ComponentContent, componentContentApi } from "@/lib/api";
import { cardClass, frontendUrl } from "@/constants";
import Image from "next/image";
import ComponentList from "./ComponentList";

interface NavItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

interface SidebarProps {
  activePath?: string;
  onNavigate?: (path: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

interface TopbarProps {
  title?: string;
  subtitle?: string;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

interface LayoutProps {
  children: React.ReactNode;
  activePath?: string;
  pageTitle?: string;
  pageSubtitle?: string;
  onNavigate?: (path: string) => void;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    path: "/",
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: "Pages",
    icon: <Layers size={18} />,
    children: [
      {
        label: "Home",
        path: "/homepage-content",
        icon: <Home size={16} />,
        children: [
          {
            label: "Hero",
            path: "/homepage-content/hero",
          },
          {
            label: "Features",
            path: "/homepage-content/features",
          },
          {
            label: "Wellness Section",
            path: "/homepage-content/wellness-section",
          },
          {
            label: "Full Width Features",
            path: "/homepage-content/full-width-features",
          },
          {
            label: "Products Grid",
            path: "/homepage-content/products-grid",
          },
          {
            label: "Turnkey Solutions",
            path: "/homepage-content/turnkey-solutions",
          },
          {
            label: "Room Setups",
            path: "/homepage-content/room-setups",
          },
          {
            label: "Manufacturing Projects",
            path: "/homepage-content/manufacturing-projects",
          },
          {
            label: "Global Presence",
            path: "/homepage-content/global-presence",
          },
          {
            label: "Testimonials",
            path: "/homepage-content/testimonials",
          },
          {
            label: "Blog Insights",
            path: "/homepage-content/blog-insights",
          },
           {
            label: "Ready To Build",
            path: "/homepage-content/ready-to-build",
          },
        ],
      },
      {
        label: "About",
        path: "/about-page-content",
        icon: <Info size={16} />,
        children: [
          { label: "Hero", path: "/about-page-content/hero" },
          { label: "Our Story", path: "/about-page-content/our-story" },
          { label: "Expertise", path: "/about-page-content/expertise" },
          { label: "Stats Strip", path: "/about-page-content/stats-strip" },
          { label: "Why Choose Ensis", path: "/about-page-content/why-choose-ensis" },
          { label: "Turnkey Process", path: "/about-page-content/turnkey-process" },
          { label: "Industries We Serve", path: "/about-page-content/industries-we-serve" },
          { label: "Testimonials", path: "/about-page-content/testimonials" },
          { label: "Founder Vision", path: "/about-page-content/founder-vision" },
          { label: "Lets Build", path: "/about-page-content/lets-build" },
        ],
      },
        {
        label: "Turnkey",
        path: "/turnkey-page-content",
        icon: <Briefcase size={16} />,
      },
      {
        label: "Consultancy",
        path: "/consultancy-page-management",
        icon: <Users size={16} />,
      },
      {
        label: "Blogs",
        path: "/blogs-page-management",
        icon: <MessageSquare size={16} />,
      },
      {
        label: "Contact Us",
        path: "/contact-page-management",
        icon: <Headphones size={16} />,
      },
    
    
   
    
      {
        label: "Careers",
        path: "/careers-management",
        icon: <UserRoundPlus size={16} />,
      },
  
    ],
  },
     {
        label: "Products Page Management",
        path: "/product-page-management",
        icon: <Boxes size={16} />,
      },
         {
        label: "Products",
        path: "/products",
        icon: <Boxes size={16} />,
      },
      {
        label: "Categories",
        path: "/categories-management", // Assuming a new page for categories
        icon: <LayoutGrid size={16} />,
      },
    {
        label: "Site Header",
        path: "/header",
        icon: <AlignJustify size={16} />,
      },
    
      {
        label: "Site Footer",
        path: "/footer",
        icon: <PanelBottom size={16} />,
      },
      {
        label: "Orders",
        path: "/orders-list-management",
        icon: <ArrowDownToLine size={16} />,
      },
    {
        label: "Projects",
        path: "/projects-management",
        icon: <FolderOpen size={16} />,
      },
      {
        label: "User Management",
        path: "/users-management",
        icon: < UserRoundCog size={16} />,
      },
  {
    label: "SEO",
    path: "/seo",
    icon: <Search size={18} />,
    children: [
      {
        label: "Home SEO",
        path: "/seo/home",
      },
      {
        label: "About SEO",
        path: "/seo/about",
      },
      {
        label: "Products SEO",
        path: "/seo/products",
      },
      {
        label: "Turnkey SEO",
        path: "/seo/turnkey",
      },
      {
        label: "Blog SEO",
        path: "/seo/blog",
      },
      {
        label: "Contact SEO",
        path: "/seo/contact",
      },
    ],
  },
  {
    label: "Media",
    path: "/media",
    icon: <ImageUp size={18} />,
    children: [
      {
        label: "All Images",
        path: "/media/all-media",
      },
      {
        label: "Home Images",
        path: "/media/home",
      },
      {
        label: "About Images",
        path: "/media/about",
      },
         {
        label: "Products Images",
        path: "/media/products",
      },
    ],
  },
];

function MenuItem({
  item,
  level = 0,
  currentPath,
  openMenus,
  setOpenMenus,
  handleNavigate,
  collapsed,
}: {
  item: NavItem;
  level?: number;
  currentPath: string;
  collapsed: boolean;
  openMenus: Record<string, boolean>;
  setOpenMenus: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  handleNavigate: (path: string) => void;
}) {
  const hasChildren = !!item.children?.length;
  const menuKey = item.path || item.label;
  const isOpen = openMenus[menuKey];

  const isActive =
    !!item.path &&
    (currentPath === item.path ||
      (item.path !== "/" && currentPath.split("?")[0].startsWith(item.path.split("?")[0])));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between group">
        {item.path ? (
          <Link
            href={item.path}
            onClick={() => handleNavigate(item.path!)}
            className={`flex min-h-8 flex-1 items-center gap-2.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all ${
              isActive
                ? "bg-[#1d5af2] text-white shadow-md shadow-blue-500/10"
                : "text-slate-400 hover:text-white hover:bg-[#111e38]"
            } ${collapsed ? "justify-center px-0" : "px-3"}`}
            style={{ marginLeft: collapsed ? 0 : `${level * 12}px` }}
          >
            {item.icon && <span className={`${isActive ? "text-white" : "text-slate-400 group-hover:text-white"} transition-colors`}>{item.icon}</span>}
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ) : (
          <div
            className={`flex min-h-8 flex-1 cursor-default items-center gap-2.5 rounded-lg py-1.5 text-[13px] font-medium text-slate-400 ${
              collapsed ? "justify-center px-0" : "px-3"
            }`}
            style={{ marginLeft: collapsed ? 0 : `${level * 12}px` }}
          >
            {item.icon && <span className="text-slate-400">{item.icon}</span>}
            {!collapsed && <span>{item.label}</span>}
          </div>
        )}

        {hasChildren && !collapsed && (
          <button
            type="button"
            onClick={() =>
              setOpenMenus((prev) => ({
                ...prev,
                [menuKey]: !prev[menuKey],
              }))
            }
            className="p-1.5 text-slate-500 hover:text-white"
          >
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${
                isOpen ? "rotate-180" : "-rotate-90"
              }`}
            />
          </button>
        )}
      </div>

      {hasChildren && isOpen && !collapsed && (
        <div className="ml-3 mt-0.5 space-y-0.5 border-l border-slate-800">
          {item.children!.map((child) => (
            <MenuItem
              key={child.label}
              item={child}
              level={level + 1}
              currentPath={currentPath}
              openMenus={openMenus}
              setOpenMenus={setOpenMenus}
              handleNavigate={handleNavigate}
              collapsed={collapsed}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ activePath, onNavigate, collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    "/homepage-content": true,
    "Pages": true,
  });

  const currentPath = activePath || pathname || "/";

  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (item.path === "/users-management") {
      return user?.role?.toLowerCase() === "superadmin";
    }
    return true;
  });

  const handleNavigate = (path: string) => {
    onNavigate?.(path);
  };

  return (
    <aside className={`fixed top-0 left-0 z-40 flex h-screen flex-shrink-0 flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-64"} `} style={{backgroundImage:`url(${sidebarBg.src})`, backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat'}}>
      {/* Logo Header */}
      <div className="flex items-center border-b border-[#162544] px-5 py-4">
        {!collapsed ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Image width={150} height={28}src="/images/ensis-logo.png" alt="Ensis Logo" className="h-10 w-auto object-contain" />
            </div>
          </div>
        ) : (
          <Image width={150} height={28} src="/images/ensis-logo.png" alt="Ensis Logo" className="h-7 w-auto mx-auto object-contain" />
        )}
      </div>

      {/* User Card */}
      {!collapsed && (
        <div className="mx-3 my-3 flex items-center justify-between rounded-xl border border-[#162544] bg-[#111e38] p-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
              <User size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-white">{user?.name || 'Admin User'}</p>
              <p className="truncate text-[10px] text-slate-400 uppercase font-medium tracking-wider">{user?.role || 'Admin'}</p>
            </div>
          </div>
          <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
        </div>
      )}

      {/* Menu Sections */}
      <nav className="scrollbar-none flex-1 space-y-2 overflow-y-auto px-3 py-2">
        {/* Navigation Tree */}
        <div className="space-y-0.5">
          {!collapsed && (
            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Navigation</p>
          )}
          {filteredNavItems.map((item) => (
            <MenuItem
              key={item.label}
              item={item}
              currentPath={currentPath}
              openMenus={openMenus}
              setOpenMenus={setOpenMenus}
              handleNavigate={handleNavigate}
              collapsed={collapsed}
            />
          ))}
        </div>
      </nav>

      {/* Need Help Card */}
      {!collapsed ? (
        <div className="mx-3 mb-4 mt-auto flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-3 text-white shadow-lg shadow-blue-900/10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white">
              <Headphones size={16} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white/90">Need Help?</p>
              <p className="text-[10px] text-white/75">Contact Support</p>
            </div>
          </div>
          <ArrowRight size={14} className="text-white/80" />
        </div>
      ) : (
        <div className="mx-auto mb-6 mt-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#111e38] text-slate-400 hover:text-white cursor-pointer">
          <Headphones size={16} />
        </div>
      )}
    </aside>
  );
}

export function Topbar({ title = "Dashboard", collapsed, setCollapsed }: TopbarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  // Helper to generate dynamic breadcrumbs
  const getBreadcrumbs = () => {
    if (pathname === "/") return ["Home", "Dashboard"];
    const segments = pathname.split("/").filter(Boolean);
    const crumbs = ["Home"];
    
    segments.forEach((seg) => {
      if (seg === "homepage-content") {
        crumbs.push("Pages", "Home");
      } else if (seg === "about-page-content") {
        crumbs.push("Pages", "About");
      } else if (seg === "seo") {
        crumbs.push("SEO");
      } else if (seg === "media") {
        crumbs.push("Media");
      } else {
        crumbs.push(seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "));
      }
    });
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:5000";
  // const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleLogout = async () => {
    setShowProfileMenu(false);
    try {
      await api.post("/admin/logout");
    } catch (error) {
      console.error("Logout API call failed:", error);
    }
    logout();
  };

  // Generate initials for the avatar badge
  const initials = user?.name 
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  const isSuperAdmin = user?.role?.toLowerCase() === "superadmin";

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6 z-30">
      {/* Title & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>
        <div className="flex flex-col">
          <h1 className="text-base font-bold text-slate-800 leading-tight">{title}</h1>
          <div className="flex items-center gap-1 mt-0.5 text-[11px] font-medium text-slate-400">
            {breadcrumbs.map((crumb, idx) => (
              <div key={`${crumb}-${idx}`} className="flex items-center gap-1">
                {idx > 0 && <span className="text-[9px] text-slate-300">/</span>}
                <span className={idx === breadcrumbs.length - 1 ? "text-slate-500 font-semibold" : ""}>{crumb}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Hand Actions */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-56 bg-slate-50 border border-slate-100 pl-9 pr-4 py-1.5 rounded-full text-xs outline-none transition-all focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Visit Website Button */}
        <Link
          href={frontendUrl}
          target="_blank"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1d5af2] hover:bg-[#154dc8] px-3.5 text-xs font-semibold text-white shadow-sm shadow-blue-500/10 transition-colors"
        >
          <span>Visit Website</span>
          <ExternalLink size={12} />
        </Link>

        {/* User Management (SuperAdmin Only) */}
        {isSuperAdmin && (
          <button
            onClick={() => setShowUserModal(true)}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer outline-none"
            title="Manage Users"
          >
            <UserPlus size={18} />
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer outline-none"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
              8
            </span>
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-100 bg-white shadow-lg shadow-slate-200/50 z-50 overflow-hidden"
              onMouseLeave={() => setShowNotifications(false)}
            >
              <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <p className="text-xs font-bold text-slate-800">Notifications</p>
                <button className="text-[10px] font-medium text-blue-600 cursor-pointer hover:underline border-none bg-transparent p-0">Mark all as read</button>
              </div>
              <div className="max-h-80 overflow-y-auto scrollbar-none">
                {[
                  { title: "New Inquiry", desc: "Rahul Sharma sent a new inquiry for Wellness Resort.", time: "10m ago", icon: <MessageSquare size={14} className="text-blue-500" />, bg: "bg-blue-50" },
                  { title: "Stock Alert", desc: "Panchkarma Bed (Teak Wood) is low in stock.", time: "1h ago", icon: <Activity size={14} className="text-amber-500" />, bg: "bg-amber-50" },
                  { title: "System Update", desc: "Server maintenance scheduled for 2 AM tonight.", time: "3h ago", icon: <CheckCircle size={14} className="text-emerald-500" />, bg: "bg-emerald-50" },
                ].map((n, i) => (
                  <div key={i} className="p-3 border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer flex gap-3 text-left">
                    <div className={`h-8 w-8 rounded-full ${n.bg} flex items-center justify-center shrink-0`}>
                      {n.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-800 leading-none">{n.title}</p>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{n.desc}</p>
                      <p className="text-[9px] text-slate-400 mt-1">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-slate-50 text-center">
                <button className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent p-0">Clear all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-full cursor-pointer transition-colors outline-none"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-[11px]">
              {initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[11px] font-semibold text-slate-800 leading-tight">{user?.name || 'Admin'}</p>
            </div>
            <ChevronDown size={12} className="text-slate-400 ml-0.5" />
          </button>

          {showProfileMenu && (
            <div
              className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-100 bg-white p-1 shadow-lg shadow-slate-200/50 z-50"
              onMouseLeave={() => setShowProfileMenu(false)}
            >
              <div className="px-3 py-2 border-b border-slate-50">
                <p className="text-[11px] font-bold text-slate-800">{user?.name || 'Super Admin'}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">{user?.email || 'admin@ensis.in'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut size={13} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal for User Management */}
      <UserManagementModal 
        isOpen={showUserModal} 
        onClose={() => setShowUserModal(false)} 
      />
    </header>
  );
}

export function CommonLayout({
  children,
  activePath,
  pageTitle,
  pageSubtitle,
  onNavigate,
}: LayoutProps) {
  const { user, isReady } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pathname = usePathname();
  const isComponentPage =
    pathname.startsWith("/homepage-content/") ||
    pathname.startsWith("/about-page-content/");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [records, setRecords] = useState<ComponentContent[]>([]);
  const editingKey = searchParams.get("component");

  const getPageConfig = () => {
    const fUrl = frontendUrl || "";
    const configMap: Record<string, { name: string; path: string }> = {
      "homepage-content": { name: "home", path: "" },
      "about-page-content": { name: "about", path: "/about" },
      "turnkey-page-content": { name: "turnkey", path: "/turnkey" },
      "consultancy-page-management": { name: "consultancy", path: "/consultancy" },
      "blogs-page-management": { name: "blog", path: "/blog" },
      "products-page-management": { name: "product", path: "/products" },
      "contact-page-management": { name: "contact", path: "/contact" },
    };

    const match = Object.keys(configMap).find((key) => pathname.includes(key));
    if (match) {
      const { name, path } = configMap[match];
      return { name, url: `${fUrl}${path}` };
    }

    return { name: "dashboard", url: fUrl };
  };

  const pageConfig = getPageConfig();

  const refreshComponents = useCallback(async () => {
    if (pageConfig.name === "dashboard") {
      setRecords([]);
      return;
    }
    try {
      const list = await componentContentApi.getByPage(pageConfig.name);
      setRecords(list);
    } catch (error) {
      console.error("Failed to fetch page components:", error);
    }
  }, [pageConfig.name]);

  useEffect(() => {
    refreshComponents();
  }, [refreshComponents]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this component?")) return;
    try {
      await componentContentApi.remove(id);
      toast.success("Component deleted");
      refreshComponents();
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  const onReorder = async (result: any) => {
    if (!result.destination) return;
    const items = Array.from(records);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setRecords(items);
    try {
      await Promise.all(items.map((item, index) => componentContentApi.update(item._id, { index })));
      toast.success("Order updated");
    } catch (e) {
      toast.error("Reorder sync failed");
      refreshComponents();
    }
  };

  if (!mounted || !isReady) {
    return <main className="min-h-screen bg-slate-50" />;
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="h-screen bg-[#f6f8fc]">
      <Sidebar
        activePath={activePath}
        onNavigate={onNavigate}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <div className={`flex h-full flex-col transition-all duration-300 ${collapsed ? "ml-16" : "ml-64"}`}>
        <Topbar
          title={pageTitle}
          subtitle={pageSubtitle}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
        <main className="flex-1 overflow-y-auto bg-[#f6f8fc] p-3">
          {!editingKey && !isComponentPage && (
            <div className="mb-4">
              <PageStatsCards pageName={pageConfig.name} />
            </div>
          )}

          <div className={`grid gap-6 ${
            !editingKey && !isComponentPage
              ? (pageConfig.name !== "dashboard" ? "xl:grid-cols-[320px_1fr_420px]" : "xl:grid-cols-[1fr_420px]") 
              : "grid-cols-1"
          }`}>
            {pageConfig.name !== "dashboard" && !editingKey && !isComponentPage && (
              <aside className="space-y-4">
                <section className="space-y-4">
                  <div className={cardClass}>
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold">Components</h2>
                        <p className="text-sm text-[#5f5a50]">List of {pageConfig.name} component content records.</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={refreshComponents} 
                        className="rounded-md border border-[#d9cdbb] bg-white px-3 py-2 text-sm font-semibold text-[#263016]"
                      >
                        Refresh
                      </button>
                    </div>
                    <div className="p-0">
                      <ComponentList 
                        records={records} 
                        onEdit={(r) => router.push(`?component=${r.key}`)} 
                        onDelete={handleDelete} 
                        onReorder={onReorder}
                        editingId={records.find(r => r.key === editingKey)?._id || null}
                        knownKeys={records.map(r => r.key)}
                      />
                    </div>
                  </div>
                </section>
              </aside>
            )}
            <div className="space-y-4 min-w-0">
              {children}
            </div>

            {!editingKey && !isComponentPage && (
              <aside className="hidden xl:block space-y-4">
                <div className="sticky top-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Live Preview</h3>
                    <p className="text-[10px] text-slate-500 italic truncate">Visualizing: {pageConfig.url}</p>
                  </div>
                  <LivePreviewIframe 
                    iframeSrc={pageConfig.url}
                    ctaHref={pageConfig.url}
                    pageName={pageConfig.name}
                  />
                </div>
              </aside>
            )}
          </div>
        </main>
      </div>
      <ToastContainer position="top-center" autoClose={4000} hideProgressBar={false} theme="light" />
    </div>
  );
}
