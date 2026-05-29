"use client"
import { useState } from "react";
import {
  LayoutDashboard,
  Megaphone,
  Zap,
  Users,
  Bot,
  Plug2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Gift,
  Bell,
  Command,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
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

// ─── Nav Config ───────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  {
    label: "Overview",
    path: "/overview",
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: "Create campaign",
    path: "/create-campaign",
    icon: <Megaphone size={18} />,
  },
  {
    label: "Automation",
    path: "/automation",
    icon: <Zap size={18} />,
  },
  {
    label: "Subscriptions",
    path: "/subscriptions",
    icon: <Users size={18} />,
  },
  {
    label: "AI Chatbot",
    path: "/ai-chatbot",
    icon: <Bot size={18} />,
  },
  {
    label: "Integrations",
    path: "/integrations",
    icon: <Plug2 size={18} />,
  },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar({ activePath = "/overview", onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        relative flex flex-col min-h-screen bg-white border-r border-gray-100
        transition-all duration-200 ease-in-out flex-shrink-0
        ${collapsed ? "w-16" : "w-56"}
      `}
    >
      {/* Logo + collapse toggle */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        {!collapsed && (
          <span className="text-[22px] font-bold tracking-tight text-gray-900">
            emitly
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`
            p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600
            transition-colors cursor-pointer
            ${collapsed ? "mx-auto" : ""}
          `}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Workspace selector */}
      {!collapsed && (
        <div className="mx-3 mb-2">
          <button className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600 flex-shrink-0">
              <LayoutDashboard size={15} />
            </div>
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-[13px] font-semibold text-gray-900 truncate">
                My Workspace
              </p>
              <span className="text-[10px] font-medium text-violet-500 bg-violet-50 rounded px-1.5 py-0.5 inline-block mt-0.5">
                Free plan
              </span>
            </div>
            <ChevronDown size={13} className="text-gray-400 flex-shrink-0" />
          </button>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-2.5 py-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = activePath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate?.(item.path)}
              title={collapsed ? item.label : undefined}
              className={`
                w-full flex items-center gap-2.5 rounded-xl text-[13.5px] font-medium
                transition-colors cursor-pointer
                ${collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"}
                ${
                  isActive
                    ? "bg-violet-50 text-violet-600"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }
              `}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom user */}
      <div className="border-t border-gray-100 px-3 py-3">
        <div
          className={`flex items-center gap-2.5 ${collapsed ? "justify-center" : ""}`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-violet-300 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            JP
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-[12.5px] font-semibold text-gray-900 truncate">
                James Passaquindici
              </p>
              <p className="text-[11px] text-gray-400 truncate">
                jamespass@emi.com
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

export function Topbar({ title = "Dashboard", subtitle }: TopbarProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-7 flex-shrink-0">
      {/* Page title */}
      <div>
        <h1 className="text-[19px] font-bold text-gray-900 leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[12.5px] text-gray-400 mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2.5">
        {/* Search */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
          <Search size={14} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent outline-none text-[13px] text-gray-700 placeholder:text-gray-400 w-36"
          />
          <div className="flex items-center gap-0.5 ml-1">
            <kbd className="text-[10px] text-gray-400 bg-gray-200 rounded px-1 py-0.5 font-mono">
              <Command size={9} className="inline" />
            </kbd>
            <kbd className="text-[10px] text-gray-400 bg-gray-200 rounded px-1 py-0.5 font-mono">
              K
            </kbd>
          </div>
        </div>

        {/* Gift */}
        <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
          <Gift size={16} />
        </button>

        {/* Bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full border-2 border-white" />
        </button>

        {/* User */}
        <button className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-violet-300 flex items-center justify-center text-white text-[11px] font-bold">
            JP
          </div>
          <div className="text-left">
            <p className="text-[12px] font-semibold text-gray-900 leading-tight">
              James Passaquindici
            </p>
            <p className="text-[10.5px] text-gray-400 leading-tight">
              ID: 4827682
            </p>
          </div>
          <ChevronDown size={13} className="text-gray-400 ml-1" />
        </button>
      </div>
    </header>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

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
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={pageTitle} subtitle={pageSubtitle} />
        <main className="flex-1 p-7 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

// ─── Usage example ────────────────────────────────────────────────────────────
// Wrap any page like this:
//
// import { Layout } from "@/components/Layout";
//
// export default function OverviewPage() {
//   return (
//     <Layout
//       activePath="/overview"
//       pageTitle="Dashboard"
//       pageSubtitle="Welcome, let's dive into your personalized setup guide."
//     >
//       {/* page content */}
//     </Layout>
//   );
// }