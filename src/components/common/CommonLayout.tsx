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
  Search,
  UploadCloud,
} from "lucide-react";

interface NavItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
  children?: NavItem[];
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
    label: "Pages",
    // path: "/pages",
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
        ],
      },
    ],
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
}: {
  item: NavItem;
  level?: number;
  currentPath: string;
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
      (item.path !== "/" && currentPath.startsWith(item.path.split("?")[0])));

  return (
    <div>
      <div className="flex items-center gap-1">
        {item.path ? (
          <Link
            href={item.path}
            onClick={() => handleNavigate(item.path!)}
            className={`flex min-h-10 flex-1 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive ? "bg-[#f3eee6] text-[#6f542f]" : "text-gray-600 hover:bg-gray-50"
            }`}
            style={{ paddingLeft: `${12 + level * 16}px` }}
          >
            {item.icon && <span>{item.icon}</span>}
            <span>{item.label}</span>
          </Link>
        ) : (
          <div
            className="flex min-h-10 flex-1 items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 cursor-default"
            style={{ paddingLeft: `${12 + level * 16}px` }}
          >
            {item.icon && <span>{item.icon}</span>}
            <span>{item.label}</span>
          </div>
        )}

        {hasChildren && (
          <button
            type="button"
            onClick={() =>
              setOpenMenus((prev) => ({
                ...prev,
                [menuKey]: !prev[menuKey],
              }))
            }
            className="p-2"
          >
            <ChevronDown
              size={14}
              className={`transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
      </div>

      {hasChildren && isOpen && (
        <div className="ml-2 border-l border-gray-100">
          {item.children!.map((child) => (
            <MenuItem
              key={child.label}
              item={child}
              level={level + 1}
              currentPath={currentPath}
              openMenus={openMenus}
              setOpenMenus={setOpenMenus}
              handleNavigate={handleNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
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
       {NAV_ITEMS.map((item) => (
  <MenuItem
    key={item.label}
    item={item}
    currentPath={currentPath}
    openMenus={openMenus}
    setOpenMenus={setOpenMenus}
    handleNavigate={handleNavigate}
  />
))}
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
