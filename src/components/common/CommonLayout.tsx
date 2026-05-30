"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  ImageUp,
  Layers,
  LayoutDashboard,
  UploadCloud,
} from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  children?: Array<{
    label: string;
    path: string;
  }>;
}

interface SidebarProps {
  activePath?: string;
  onNavigate?: (path: string) => void;
}

interface TopbarProps {
  title?: string;
  subtitle?: string;
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
    label: "Home Page",
    path: "/homepage-content",
    icon: <Home size={18} />,
    children: [
      { label: "Hero", path: "/homepage-content?component=home.hero" },
      { label: "Wellness Section", path: "/homepage-content?component=home.wellnessSection" },
      { label: "Full Width Features", path: "/homepage-content?component=home.fullWidthFeatures" },
      { label: "Products Grid", path: "/homepage-content?component=home.productsGrid" },
      { label: "Turnkey Solutions", path: "/homepage-content?component=home.turnkeySolutions" },
      { label: "Room Setups", path: "/homepage-content?component=home.wellnessRoomSetups" },
      { label: "Manufacturing Projects", path: "/homepage-content?component=home.manufacturingAndProjects" },
      { label: "Global Presence", path: "/homepage-content?component=home.globalPresence" },
      { label: "Testimonials", path: "/homepage-content?component=home.testimonials" },
      { label: "Blog Insights", path: "/homepage-content?component=home.blogInsights" },
    ],
  },
  {
    label: "Home Images Upload",
    path: "/bulk-image-upload?page=home",
    icon: <ImageUp size={18} />,
    children: [
      { label: "Hero Images", path: "/bulk-image-upload?page=home&component=hero" },
      { label: "Feature Images", path: "/bulk-image-upload?page=home&component=features" },
      { label: "Turnkey Images", path: "/bulk-image-upload?page=home&component=turnkey" },
      { label: "Global Presence Image", path: "/bulk-image-upload?page=home&component=globalPresence" },
    ],
  },
];

export function Sidebar({ activePath, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    "/homepage-content": true,
  });

  const currentPath = activePath || pathname || "/";

  const handleNavigate = (path: string) => {
    onNavigate?.(path);
  };

  return (
    <aside className={`relative flex min-h-screen flex-shrink-0 flex-col border-r border-gray-100 bg-white transition-all duration-200 ${collapsed ? "w-16" : "w-72"}`}>
      <div className="flex items-center justify-between px-4 pb-3 pt-5">
        {!collapsed && (
          <div>
            <span className="text-[22px] font-bold tracking-tight text-gray-900">Ensis</span>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8d6a3a]">Admin Panel</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 ${collapsed ? "mx-auto" : ""}`}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {!collapsed && (
        <div className="mx-3 mb-2">
          <div className="flex w-full items-center gap-2.5 rounded-xl bg-gray-50 px-3 py-2.5">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#f3eee6] text-[#6f542f]">
              <Layers size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-gray-900">Frontend Content</p>
              <span className="mt-0.5 inline-block rounded bg-[#f3eee6] px-1.5 py-0.5 text-[10px] font-medium text-[#6f542f]">
                Page components
              </span>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-2">
        {NAV_ITEMS.map((item) => {
          const isOpen = openMenus[item.path];
          const hasChildren = Boolean(item.children?.length);
          const isActive = currentPath === item.path || (item.path !== "/" && currentPath.startsWith(item.path.split("?")[0]));

          return (
            <div key={item.path}>
              <div className="flex items-center gap-1">
                <Link
                  href={item.path}
                  onClick={() => handleNavigate(item.path)}
                  title={collapsed ? item.label : undefined}
                  className={`flex min-h-10 flex-1 items-center gap-2.5 rounded-xl text-[13.5px] font-medium transition-colors ${
                    collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
                  } ${isActive ? "bg-[#f3eee6] text-[#6f542f]" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
                {!collapsed && hasChildren && (
                  <button
                    type="button"
                    onClick={() => setOpenMenus((current) => ({ ...current, [item.path]: !current[item.path] }))}
                    className="flex h-10 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                    aria-label={`Toggle ${item.label} submenu`}
                  >
                    <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                )}
              </div>
              {!collapsed && hasChildren && isOpen && (
                <div className="ml-7 mt-1 space-y-0.5 border-l border-gray-100 pl-2">
                  {item.children?.map((child) => (
                    <Link
                      key={child.path}
                      href={child.path}
                      onClick={() => handleNavigate(child.path)}
                      className="block rounded-lg px-3 py-2 text-[12.5px] font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 px-3 py-3">
        <div className={`flex items-center gap-2.5 ${collapsed ? "justify-center" : ""}`}>
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6f542f] to-[#b08a52] text-xs font-bold text-white">
            EA
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-semibold text-gray-900">Ensis Admin</p>
              <p className="truncate text-[11px] text-gray-400">content manager</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export function Topbar({ title = "Dashboard", subtitle }: TopbarProps) {
  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white px-7">
      <div>
        <h1 className="text-[19px] font-bold leading-tight text-gray-900">{title}</h1>
        {subtitle && <p className="mt-0.5 text-[12.5px] text-gray-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2.5">
        <Link
          href="/bulk-image-upload"
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-[12px] font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          <UploadCloud size={15} />
          Upload Images
        </Link>
        <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white py-1 pl-1 pr-3 transition-colors hover:bg-gray-50">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#6f542f] to-[#b08a52] text-[11px] font-bold text-white">
            EA
          </div>
          <div className="text-left">
            <p className="text-[12px] font-semibold leading-tight text-gray-900">Ensis Admin</p>
            <p className="text-[10.5px] leading-tight text-gray-400">Content</p>
          </div>
          <ChevronDown size={13} className="ml-1 text-gray-400" />
        </button>
      </div>
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
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activePath={activePath} onNavigate={onNavigate} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={pageTitle} subtitle={pageSubtitle} />
        <main className="flex-1 overflow-y-auto p-7">{children}</main>
      </div>
    </div>
  );
}
