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
  UserRoundCog,
  X,
  TrendingUp,
  ScrollText,
} from "lucide-react";
import { LoginForm, useAuth } from "@/components/auth/AuthContext";
import sidebarBg from "@/assets/sidebarbg.webp";
import UserManagementModal from "./UserManagementModal";
import PageStatsCards from "./PageStatsCards";
import LivePreviewIframe from "./LivePreviewIframe";
import { api, ComponentContent, componentContentApi } from "@/lib/api";
import { cardClass, frontendUrl } from "@/constants";
import Image from "next/image";
import ComponentList from "./ComponentList";
import ConfirmDialog from "@/components/common/ConfirmDialog";

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
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface TopbarProps {
  title?: string;
  subtitle?: string;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onMobileMenuToggle: () => void;
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
          { label: "Hero", path: "/homepage-content/hero" },
          { label: "Features", path: "/homepage-content/features" },
          { label: "Wellness Section", path: "/homepage-content/wellness-section" },
          { label: "Full Width Features", path: "/homepage-content/full-width-features" },
          { label: "Products Grid", path: "/homepage-content/products-grid" },
          { label: "Turnkey Solutions", path: "/homepage-content/turnkey-solutions" },
          { label: "Room Setups", path: "/homepage-content/room-setups" },
          { label: "Manufacturing Projects", path: "/homepage-content/manufacturing-projects" },
          { label: "Global Presence", path: "/homepage-content/global-presence" },
          { label: "Testimonials", path: "/homepage-content/testimonials" },
          { label: "Blog Insights", path: "/homepage-content/blog-insights" },
          { label: "Ready To Build", path: "/homepage-content/ready-to-build" },
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
        children: [
          { label: "Banner", path: "/turnkey-page-content/banner" },
          { label: "What is Turnkey", path: "/turnkey-page-content/what-is-turnkey" },
          { label: "Complete Solutions", path: "/turnkey-page-content/complete-solutions" },
          { label: "Facilities", path: "/turnkey-page-content/facilities" },
          { label: "Customized", path: "/turnkey-page-content/customized" },
          { label: "Featured Projects", path: "/turnkey-page-content/featured-projects" },
          { label: "Ready to Build", path: "/turnkey-page-content/ready-to-build" },
          { label: "Features Strip", path: "/turnkey-page-content/features-strip" },
        ],
      },
      {
        label: "Consultancy",
        path: "/consultancy-page-management",
        icon: <Users size={16} />,
        children: [
          { label: "Hero", path: "/consultancy-page-management/hero" },
          { label: "Features", path: "/consultancy-page-management/features" },
          { label: "What We Offer", path: "/consultancy-page-management/what-we-offer" },
          { label: "Process & Values", path: "/consultancy-page-management/process-values" },
          { label: "Ready to Start", path: "/consultancy-page-management/ready-to-start" },
          { label: "Features Strip", path: "/consultancy-page-management/features-strip" },
        ],
      },
      {
        label: "Blogs Page Management",
        path: "/blogs-page-management",
        icon: <MessageSquare size={16} />,
        children: [
          { label: "Hero", path: "/blogs-page-management/hero" },
          { label: "Featured Articles", path: "/blogs-page-management/featured-articles" },
          { label: "Voice of Experts", path: "/blogs-page-management/voice-of-experts" },
          { label: "All Blogs", path: "/blogs-page-management/all-blogs" },
          { label: "Media & Resources", path: "/blogs-page-management/media-resources" },
          { label: "Stay Inspired", path: "/blogs-page-management/stay-inspired" },
          { label: "Support Wellness", path: "/blogs-page-management/support-wellness" },
          { label: "Features Strip", path: "/blogs-page-management/features-strip" },
        ],
      },
      {
        label: "Contact Us",
        path: "/contact-page-management",
        icon: <Headphones size={16} />,
        children: [
          { label: "Hero", path: "/contact-page-management/hero" },
          { label: "Get In Touch", path: "/contact-page-management/get-in-touch" },
          { label: "Features Strip", path: "/contact-page-management/features-strip" },
          { label: "CTA Banner", path: "/contact-page-management/cta-banner" },
          { label: "Premium Map", path: "/contact-page-management/premium-map" },
        ],
      },
      { label: "Career Page", path: "/career-page-managment", icon: <UserRoundPlus size={16} /> },
      { label: "Product listing", path: "/product-listing", icon: <Boxes size={16} /> },
      { label: "Projects & Clients", path: "/projects-and-clients", icon: <FolderOpen size={16} /> },
      { label: "Enquary Page Management", path: "/enquiry-page-management", icon: <UserRoundPlus size={16} /> },
      { label: "Products Page Management", path: "/product-page-management", icon: <Boxes size={16} /> },
    ],
  },
  { label: "Social Click", path: "/social-clicks-page", icon: <TrendingUp size={16} /> },

  { label: "Products", path: "/products", icon: <Boxes size={16} /> },
  { label: "blogs", path: "/blogs", icon: <MessageSquare size={16} /> },
  { label: "Categories", path: "/categories-management", icon: <LayoutGrid size={16} /> },
  { label: "Site Header", path: "/header", icon: <AlignJustify size={16} /> },
  { label: "Site Footer", path: "/footer", icon: <PanelBottom size={16} /> },
  { label: "Careers", path: "/careers-management", icon: <UserRoundPlus size={16} /> },
  { label: "Orders", path: "/orders-list-management", icon: <ArrowDownToLine size={16} /> },
  { label: "Projects", path: "/projects-management", icon: <FolderOpen size={16} /> },
  { label: "Activity Logs", path: "/activity-logs", icon: <ScrollText size={16} /> },
  { label: "User Management", path: "/users-management", icon: <UserRoundCog size={16} /> },
  { label: "Enquaries", path: "/enquries", icon: <UserRoundCog size={16} /> },
  { label: "Applications", path: "/applications", icon: <UserRoundCog size={16} /> },
{label: "Reviews Management", path:"/reviews-page", icon:<CheckCircle size={16}/>},
  {
    label: "SEO",
    path: "/seo",
    icon: <Search size={18} />,
    children: [
      { label: "Home SEO", path: "/seo/home" },
      { label: "About SEO", path: "/seo/about" },
      { label: "Products SEO", path: "/seo/products" },
      { label: "Turnkey SEO", path: "/seo/turnkey" },
      { label: "Consultancy SEO", path: "/seo/consultancy" },
      { label: "Blog SEO", path: "/seo/blog" },
      { label: "Career SEO", path: "/seo/career" },
      { label: "Contact SEO", path: "/seo/contact" },
      { label: "Enquiry SEO", path: "/seo/enquiry" },
      { label: "Projects & Clients SEO", path: "/seo/projects-and-clients" },
    ],
  },
  {
    label: "Media",
    path: "/media",
    icon: <ImageUp size={18} />,
    children: [
      { label: "All Images", path: "/media/all-media" },
      { label: "Home Images", path: "/media/home" },
      { label: "About Images", path: "/media/about" },
      { label: "Products Images", path: "/media/products" },
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
            className={`flex min-h-7 flex-1 items-center gap-1.5 rounded-lg px-2 py-1 text-[12px] font-medium transition-all ${
              isActive
                ? "bg-[#1d5af2] text-white shadow-md shadow-blue-500/10"
                : "text-slate-400 hover:text-white hover:bg-[#111e38]"
            } ${collapsed ? "justify-center px-0" : "px-2"}`}
            style={{ marginLeft: collapsed ? 0 : `${level * 10}px` }}
          >
            {item.icon && (
              <span className={`${isActive ? "text-white" : "text-slate-400 group-hover:text-white"} transition-colors`}>
                {item.icon}
              </span>
            )}
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ) : (
          <div
            className={`flex min-h-7 flex-1 cursor-default items-center gap-1.5 rounded-lg py-1 text-[12px] font-medium text-slate-400 ${
              collapsed ? "justify-center px-0" : "px-2"
            }`}
            style={{ marginLeft: collapsed ? 0 : `${level * 10}px` }}
          >
            {item.icon && <span className="text-slate-400">{item.icon}</span>}
            {!collapsed && <span>{item.label}</span>}
          </div>
        )}

        {hasChildren && !collapsed && (
          <button
            type="button"
            onClick={() =>
              setOpenMenus((prev) => ({ ...prev, [menuKey]: !prev[menuKey] }))
            }
            className="p-1 text-slate-500 hover:text-white"
          >
            <ChevronDown
              size={12}
              className={`transition-transform duration-200 ${isOpen ? "rotate-180" : "-rotate-90"}`}
            />
          </button>
        )}
      </div>

      {hasChildren && isOpen && !collapsed && (
        <div className="ml-2 space-y-0 border-l border-slate-800">
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

// Shared sidebar content — used by both desktop sidebar & mobile offcanvas
function SidebarContent({
  collapsed,
  setCollapsed,
  currentPath,
  openMenus,
  setOpenMenus,
  filteredNavItems,
  handleNavigate,
  onClose,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  currentPath: string;
  openMenus: Record<string, boolean>;
  setOpenMenus: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  filteredNavItems: NavItem[];
  handleNavigate: (path: string) => void;
  onClose?: () => void; // mobile close button
}) {
  const { user } = useAuth();

  return (
    <>
      {/* Logo Header */}
      <div className="flex items-center justify-between border-b border-[#162544] px-3 py-2">
        {!collapsed ? (
          <Image
            width={150}
            height={28}
            src="/images/ensis-logo.png"
            alt="Ensis Logo"
            className="h-10 w-auto object-contain"
          />
        ) : (
          <Image
            width={150}
            height={28}
            src="/images/ensis-logo.png"
            alt="Ensis Logo"
            className="h-7 w-auto mx-auto object-contain"
          />
        )}
        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#111e38] transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* User Card */}
      {!collapsed && (
        <div className="mx-2 my-1.5 flex items-center justify-between rounded-xl border border-[#162544] bg-[#111e38] p-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
              <User size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-white">{user?.name || "Admin User"}</p>
              <p className="truncate text-[9px] text-slate-400 uppercase font-medium tracking-wider">
                {user?.role || "Admin"}
              </p>
            </div>
          </div>
          <ChevronDown size={12} className="text-slate-400 shrink-0" />
        </div>
      )}

      {/* Nav */}
      <nav className="scrollbar-none flex-1 space-y-1 overflow-y-auto px-2 py-1.5">
        <div className="space-y-0">
          {!collapsed && (
            <p className="mb-1 px-2 text-[9px] font-bold uppercase tracking-wider text-slate-500">
              Navigation
            </p>
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

      {/* Need Help */}
      {!collapsed ? (
        <div className="mx-2 mb-2 mt-auto flex items-center justify-between rounded-xl bg-linear-to-r from-blue-600 to-blue-700 p-2 text-white shadow-lg shadow-blue-900/10">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-white">
              <Headphones size={12} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white/90">Need Help?</p>
              <p className="text-[9px] text-white/75">Contact Support</p>
            </div>
          </div>
          <ArrowRight size={12} className="text-white/80" />
        </div>
      ) : (
        <div className="mx-auto mb-3 mt-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#111e38] text-slate-400 hover:text-white cursor-pointer">
          <Headphones size={14} />
        </div>
      )}
    </>
  );
}

export function Sidebar({
  activePath,
  onNavigate,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    "/homepage-content": true,
    Pages: true,
  });

  const currentPath = activePath || pathname || "/";

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (item.path === "/users-management") {
      return user?.role?.toLowerCase() === "superadmin";
    }
    return true;
  });

  const handleNavigate = (path: string) => {
    onNavigate?.(path);
    setMobileOpen(false); // close offcanvas on nav
  };

  const sidebarStyle = {
    backgroundImage: `url(${sidebarBg.src})`,
    backgroundSize: "100% 100%",
    backgroundRepeat: "no-repeat",
  };

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className={`fixed top-0 left-0 z-40 hidden lg:flex h-screen shrink-0 flex-col transition-all duration-300 ${
          collapsed ? "w-14" : "w-56"
        }`}
        style={sidebarStyle}
      >
        <SidebarContent
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          currentPath={currentPath}
          openMenus={openMenus}
          setOpenMenus={setOpenMenus}
          filteredNavItems={filteredNavItems}
          handleNavigate={handleNavigate}
        />
      </aside>

      {/* ── MOBILE OFFCANVAS OVERLAY ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}
          <aside
            className="absolute top-0 left-0 h-full w-72 flex flex-col overflow-hidden shadow-2xl animate-slide-in"
            style={sidebarStyle}
          >
            <SidebarContent
              collapsed={false}
              setCollapsed={setCollapsed}
              currentPath={currentPath}
              openMenus={openMenus}
              setOpenMenus={setOpenMenus}
              filteredNavItems={filteredNavItems}
              handleNavigate={handleNavigate}
              onClose={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}
    </>
  );
}

export function Topbar({
  title = "Dashboard",
  collapsed,
  setCollapsed,
  onMobileMenuToggle,
}: TopbarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  const getBreadcrumbs = () => {
    if (pathname === "/") return ["Home", "Dashboard"];
    const segments = pathname.split("/").filter(Boolean);
    const crumbs = ["Home"];
    segments.forEach((seg) => {
      if (seg === "homepage-content") crumbs.push("Pages", "Home");
      else if (seg === "about-page-content") crumbs.push("Pages", "About");
      else if (seg === "turnkey-page-content") crumbs.push("Pages", "Turnkey");
      else if (seg === "consultancy-page-management") crumbs.push("Pages", "Consultancy");
      else if (seg === "blogs-page-management") crumbs.push("Pages", "Blogs");
      else if (seg === "contact-page-management") crumbs.push("Pages", "Contact");
      else if (seg === "seo") crumbs.push("SEO");
      else if (seg === "media") crumbs.push("Media");
      else crumbs.push(seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "));
    });
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const fUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:5000";

  const handleLogout = async () => {
    setShowProfileMenu(false);
    try {
      await api.post("/admin/logout");
    } catch (error) {
      console.error("Logout API call failed:", error);
    }
    logout();
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  const isSuperAdmin = user?.role?.toLowerCase() === "superadmin";

  return (
    <header className="flex h-11 md:h-12 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-2 md:px-4 z-30">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-1.5 md:gap-3 min-w-0">
        {/* Mobile hamburger */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        {/* Desktop collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        <div className="flex flex-col min-w-0">
          <h1 className="text-sm md:text-base font-bold text-slate-800 leading-tight truncate">{title}</h1>
          <div className="hidden sm:flex items-center gap-1 mt-0.5 text-[11px] font-medium text-slate-400">
            {breadcrumbs.map((crumb, idx) => (
              <div key={`${crumb}-${idx}`} className="flex items-center gap-1">
                {idx > 0 && <span className="text-[9px] text-slate-300">/</span>}
                <span className={idx === breadcrumbs.length - 1 ? "text-slate-500 font-semibold" : ""}>
                  {crumb}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 md:gap-2 shrink-0">
        {/* Search — desktop only */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-48 lg:w-56 bg-slate-50 border border-slate-100 pl-9 pr-4 py-1.5 rounded-full text-xs outline-none transition-all focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Visit Website — hidden on small mobile */}
        <Link
          href={fUrl}
          target="_blank"
          className="hidden sm:inline-flex h-8 md:h-9 items-center gap-1.5 rounded-lg bg-[#1d5af2] hover:bg-[#154dc8] px-2.5 md:px-3.5 text-xs font-semibold text-white shadow-sm shadow-blue-500/10 transition-colors"
        >
          <span className="hidden md:inline">Visit Website</span>
          <ExternalLink size={12} />
        </Link>

        {/* User Management (SuperAdmin) */}
        {isSuperAdmin && (
          <button
            onClick={() => setShowUserModal(true)}
            className="p-1.5 md:p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer outline-none"
            title="Manage Users"
          >
            <UserPlus size={16} />
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 md:p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer outline-none"
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
              8
            </span>
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-64 md:w-72 rounded-xl border border-slate-100 bg-white shadow-lg shadow-slate-200/50 z-50 overflow-hidden"
              onMouseLeave={() => setShowNotifications(false)}
            >
              <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <p className="text-xs font-bold text-slate-800">Notifications</p>
                <button className="text-[10px] font-medium text-blue-600 cursor-pointer hover:underline border-none bg-transparent p-0">
                  Mark all as read
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto scrollbar-none">
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
                <button className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent p-0">
                  Clear all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-1.5 md:gap-2.5 pl-1.5 md:pl-2 pr-2 md:pr-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-full cursor-pointer transition-colors outline-none"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-[11px]">
              {initials}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-[11px] font-semibold text-slate-800 leading-tight">{user?.name || "Admin"}</p>
            </div>
            <ChevronDown size={12} className="text-slate-400 ml-0.5 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div
              className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-100 bg-white p-1 shadow-lg shadow-slate-200/50 z-50"
              onMouseLeave={() => setShowProfileMenu(false)}
            >
              <div className="px-3 py-2 border-b border-slate-50">
                <p className="text-[11px] font-bold text-slate-800">{user?.name || "Super Admin"}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">{user?.email || "admin@ensis.in"}</p>
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

      <UserManagementModal isOpen={showUserModal} onClose={() => setShowUserModal(false)} />
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pathname = usePathname();
  const isComponentPage =
    pathname.startsWith("/homepage-content/") ||
    pathname.startsWith("/about-page-content/") ||
    pathname.startsWith("/turnkey-page-content/") ||
    pathname.startsWith("/consultancy-page-management/") ||
    pathname.startsWith("/blogs-page-management/") ||
    pathname.startsWith("/contact-page-management/") ||
    pathname.startsWith("/product-listing");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [records, setRecords] = useState<ComponentContent[]>([]);
  const [pendingDelete, setPendingDelete] = useState<{ message: string; id: string } | null>(null);
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
      "career-page-management": { name: "career", path: "/career" },
      "enquiry-page-managment": { name: "enquiry", path: "enquiry" },
      "projects-and-clients": { name: "projects", path: "projects-and-clients" },
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
    try {
      await componentContentApi.remove(id);
      toast.success("Component deleted");
      refreshComponents();
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  const confirmDeleteClick = (id: string, message: string) => setPendingDelete({ id, message });

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
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main content — on desktop offset by sidebar width, on mobile full width */}
      <div
        className={`flex h-full flex-col transition-all duration-300 ${
          collapsed ? "lg:ml-14" : "lg:ml-56"
        }`}
      >
        <Topbar
          title={pageTitle}
          subtitle={pageSubtitle}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onMobileMenuToggle={() => setMobileOpen(true)}
        />

        <main className="flex-1 overflow-y-auto bg-[#f6f8fc] px-2 md:px-4 py-2">
          {!editingKey && !isComponentPage && (
            <div className="mb-2">
              <PageStatsCards pageName={pageConfig.name} />
            </div>
          )}

          <div
            className={`grid gap-3 ${
              !editingKey && !isComponentPage
                ? pageConfig.name !== "dashboard"
                  ? "xl:grid-cols-[320px_1fr_420px]"
                  : "xl:grid-cols-[1fr_420px]"
                : "grid-cols-1"
            }`}
          >
            {pageConfig.name !== "dashboard" && !editingKey && !isComponentPage && (
              <aside className="space-y-2">
                <section className="space-y-2">
                  <div className={cardClass}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div>
                        <h2 className="text-sm font-semibold">Components</h2>
                        <p className="text-[11px] text-[#5f5a50]">
                          List of {pageConfig.name} component content records.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={refreshComponents}
                        className="rounded-md border border-[#d9cdbb] bg-white px-2 py-1 text-[11px] font-semibold text-[#263016]"
                      >
                        Refresh
                      </button>
                    </div>
                    <div className="p-0">
                      <ComponentList
                        records={records}
                        onEdit={(r) => router.push(`?component=${r.key}`)}
                        onDelete={(id) => confirmDeleteClick(id, "Delete this component?")}
                        onReorder={onReorder}
                        editingId={records.find((r) => r.key === editingKey)?._id || null}
                        knownKeys={records.map((r) => r.key)}
                      />
                    </div>
                  </div>
                </section>
              </aside>
            )}

            <div className="space-y-2 min-w-0">{children}</div>

            {!editingKey && !isComponentPage && (
              <aside className="hidden xl:block space-y-2">
                <div className="sticky top-2">
                  <div className="mb-2">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Live Preview
                    </h3>
                    <p className="text-[10px] text-slate-500 italic truncate">
                      Visualizing: {pageConfig.url}
                    </p>
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

      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        theme="light"
      />

      <ConfirmDialog
        isOpen={!!pendingDelete}
        title="Confirm Delete"
        message={pendingDelete?.message}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await handleDelete(pendingDelete.id);
        }}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}