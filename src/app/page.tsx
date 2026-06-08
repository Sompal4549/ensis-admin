"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import PageStatsCards from "@/components/common/PageStatsCards";
import {
  Lock,
  FileText,
  LayoutGrid,
  Image as ImageIcon,
  Building2,
  MessageSquare,
  Activity,
  Eye,
  Pencil,
  Trash,
} from "lucide-react";
import {
  adminApi,
  authStore,
  AuthUser,
  categoryApi,
  componentContentApi,
  productApi,
} from "@/lib/api";
import Link from "next/link";
import { fieldClass, labelClass } from "@/constants";
import Image from "next/image";



// Chart Data Point Schema
interface ChartDataPoint {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
}

// Custom SVG Chart component to handle data rendering dynamically without third party library breaking changes under React 19
function AnalyticsChart({ data }: { data?: ChartDataPoint[] }) {
  const chartData = useMemo(() => {
    if (data && data.length > 0) return data;
    // Default static fallback data matching the image visual mockup
    return [
      { date: "20 Apr", pageViews: 4100, uniqueVisitors: 2200 },
      { date: "22 Apr", pageViews: 4700, uniqueVisitors: 2800 },
      { date: "24 Apr", pageViews: 7400, uniqueVisitors: 4900 },
      { date: "26 Apr", pageViews: 5800, uniqueVisitors: 3800 },
      { date: "28 Apr", pageViews: 5000, uniqueVisitors: 3300 },
      { date: "2 May", pageViews: 6800, uniqueVisitors: 4400 },
      { date: "4 May", pageViews: 6300, uniqueVisitors: 3600 },
      { date: "6 May", pageViews: 7300, uniqueVisitors: 4700 },
      { date: "8 May", pageViews: 6600, uniqueVisitors: 4000 },
      { date: "10 May", pageViews: 7900, uniqueVisitors: 5100 },
      { date: "12 May", pageViews: 6700, uniqueVisitors: 4200 },
      { date: "14 May", pageViews: 7700, uniqueVisitors: 4800 },
      { date: "16 May", pageViews: 7100, uniqueVisitors: 4500 },
      { date: "18 May", pageViews: 9900, uniqueVisitors: 6900 },
    ];
  }, [data]);

  const height = 135;
  const width = 600;
  const paddingLeft = 30;
  const paddingRight = 10;
  const paddingTop = 15;
  const paddingBottom = 20;

  const maxVal = useMemo(() => {
    const vals = chartData.map((d) => Math.max(d.pageViews, d.uniqueVisitors));
    return Math.max(...vals, 10000);
  }, [chartData]);

  // Generate X, Y coordinates
  const points = useMemo(() => {
    const totalPoints = chartData.length;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    return chartData.map((d, index) => {
      const x = paddingLeft + (index / (totalPoints - 1)) * chartWidth;
      // invert Y coordinate for SVG
      const yViews = height - paddingBottom - (d.pageViews / maxVal) * chartHeight;
      const yVisitors = height - paddingBottom - (d.uniqueVisitors / maxVal) * chartHeight;
      return { x, yViews, yVisitors, date: d.date };
    });
  }, [chartData, maxVal]);

  const viewPath = useMemo(() => {
    return "M " + points.map((p) => `${p.x.toFixed(1)},${p.yViews.toFixed(1)}`).join(" L ");
  }, [points]);

  const viewAreaPath = useMemo(() => {
    const startX = points[0].x.toFixed(1);
    const endX = points[points.length - 1].x.toFixed(1);
    const bottomY = (height - paddingBottom).toFixed(1);
    return `${viewPath} L ${endX},${bottomY} L ${startX},${bottomY} Z`;
  }, [points, viewPath]);

  const visitorPath = useMemo(() => {
    return "M " + points.map((p) => `${p.x.toFixed(1)},${p.yVisitors.toFixed(1)}`).join(" L ");
  }, [points]);

  const visitorAreaPath = useMemo(() => {
    const startX = points[0].x.toFixed(1);
    const endX = points[points.length - 1].x.toFixed(1);
    const bottomY = (height - paddingBottom).toFixed(1);
    return `${visitorPath} L ${endX},${bottomY} L ${startX},${bottomY} Z`;
  }, [points, visitorPath]);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none overflow-visible">
        <defs>
          <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1d5af2" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#1d5af2" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="visitorGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = paddingTop + ratio * (height - paddingTop - paddingBottom);
          const valLabel = Math.round((1 - ratio) * maxVal);
          return (
            <g key={ratio} className="opacity-30">
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#cbd5e1"
                strokeWidth="0.75"
                strokeDasharray="4,4"
              />
              <text x={paddingLeft - 6} y={y + 3} fill="#000000" fontSize="8" textAnchor="end">
                {valLabel >= 1000 ? `${(valLabel / 1000).toFixed(0)}K` : valLabel}
              </text>
            </g>
          );
        })}

        {/* Areas under paths */}
        <path d={viewAreaPath} fill="url(#viewsGrad)" />
        <path d={visitorAreaPath} fill="url(#visitorGrad)" />

        {/* Stroke Lines */}
        <path d={viewPath} fill="none" stroke="#1d5af2" strokeWidth="2" strokeLinecap="round" />
        <path d={visitorPath} fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />

        {/* Dots on line intersections */}
        {points.map((p, idx) => (
          <g key={idx}>
            <circle cx={p.x} cy={p.yViews} r="2.5" fill="#1d5af2" stroke="#fff" strokeWidth="1" />
            <circle cx={p.x} cy={p.yVisitors} r="2.5" fill="#f97316" stroke="#fff" strokeWidth="1" />
          </g>
        ))}

        {/* X axis labels */}
        {points
          .filter((_, i) => i % 2 === 0 || i === points.length - 1)
          .map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={height - paddingBottom + 12}
              fill="#000000"
              fontSize="8"
              textAnchor="middle"
            >
              {p.date}
            </text>
          ))}
      </svg>
    </div>
  );
}

export default function AdminHome() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    await Promise.all([
      productApi.list(),
      categoryApi.list(),
      componentContentApi.list(),
    ]);
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
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Sign In Render (styled premium matching navy elements)
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
          <h1 className="text-2xl font-bold ">Ensis Admin</h1>
          <p className="mt-1.5 text-xs ">
            Sign in with your credentials to access the admin control panel.
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

  // Dashboard Page Content: constrained to Calc layout and lock height
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      
      {/* Row 1: Stats Grid */}
      <PageStatsCards pageName="dashboard" />

      {/* Row 2: Website Overview Chart + Recent Inquiries + Quick Actions (Exactly 3 Cards in a Row) */}
      <div className="grid min-h-0 flex-1 grid-cols-12 gap-3">
        
        {/* Card 1: Website Overview (Spans 6 cols) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm col-span-6 h-full flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-50 pb-2 flex-shrink-0">
            <div>
              <h3 className="text-xs font-bold ">Website Overview</h3>
              <p className="text-[9px]  mt-0.5">Track website page views and visitor metrics.</p>
            </div>
            <select className="text-[8px] bg-slate-50 border border-slate-200 rounded-md px-2 outline-none">
              <option className="text-[8px]">Last 30 Days</option>
              <option className="text-[8px]">Last 7 Days</option>
            </select>
          </div>

          {/* Core chart numbers */}
          <div className="grid grid-cols-4 gap-2 py-2 flex-shrink-0 border-b border-slate-50/50">
            <div>
              <p className="text-[9px]  font-medium">Page Views</p>
              <p className="text-xs font-bold leading-tight">12,540</p>
              <span className="text-[8px] font-semibold text-emerald-500 leading-none">↑ 24.5%</span>
            </div>
            <div>
              <p className="text-[9px]  font-medium">Unique Visitors</p>
              <p className="text-xs font-bold leading-tight">8,320</p>
              <span className="text-[8px] font-semibold text-emerald-500 leading-none">↑ 18.7%</span>
            </div>
            <div>
              <p className="text-[9px]  font-medium">Inquiries</p>
              <p className="text-xs font-bold leading-tight">186</p>
              <span className="text-[8px] font-semibold text-emerald-500 leading-none">↑ 18%</span>
            </div>
            <div>
              <p className="text-[9px]  font-medium">Subscribers</p>
              <p className="text-xs font-bold leading-tight">245</p>
              <span className="text-[8px] font-semibold text-emerald-500 leading-none">↑ 12.6%</span>
            </div>
          </div>

          {/* SVG Chart area */}
          <div className="flex-1 min-h-0 flex items-center justify-center pt-2">
            <AnalyticsChart />
          </div>
        </div>

        {/* Card 2: Recent Inquiries (Spans 3 cols) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm col-span-3 h-full flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-50 pb-2 flex-shrink-0">
            <h3 className="text-xs font-bold ">Recent Inquiries</h3>
            <span className="text-[9px] font-bold text-blue-600">View All</span>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-none py-1.5 divide-y divide-slate-50 min-h-0">
            {[
              { name: "Rahul Sharma", company: "Wellness Resort, Rishikesh", tag: "New", tagColor: "text-green-600 bg-green-50", time: "10m ago", avatar: "RS" },
              { name: "Ananya Verma", company: "Ayurveda Clinic, Pune", tag: "Contact", tagColor: "text-amber-600 bg-amber-50", time: "1h ago", avatar: "AV" },
              { name: "Vikram Malhotra", company: "Spa Retreat, Jaipur", tag: "New", tagColor: "text-green-600 bg-green-50", time: "3h ago", avatar: "VM" },
              { name: "Sneha Patel", company: "Health Retreat, Coorg", tag: "Contact", tagColor: "text-amber-600 bg-amber-50", time: "5h ago", avatar: "SP" },
              { name: "Dr. Meera Iyer", company: "Panchakarma, Kochi", tag: "Discuss", tagColor: "text-blue-600 bg-blue-50", time: "1d ago", avatar: "MI" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 first:pt-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                    {item.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold  truncate">{item.name}</p>
                    <p className="text-[9px]  truncate">{item.company}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className={`text-[8px] px-1 py-0.2 rounded font-bold ${item.tagColor}`}>
                    {item.tag}
                  </span>
                  <span className="text-[8px]">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Quick Actions (Spans 3 cols) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm col-span-3 h-full flex flex-col overflow-hidden">
          <h3 className="text-xs font-bold  border-b border-slate-50 pb-2 flex-shrink-0">Quick Actions</h3>

          <div className="flex-1 overflow-y-auto scrollbar-none py-2 min-h-0">
            <div className="grid grid-cols-3 gap-2 h-full">
              {[
                { label: "New Page", icon: <FileText size={28} />,bg:"bg-blue-50", color: "text-blue-600", path: "/homepage-content" },
                { label: "New Project", icon: <Building2 size={28} />,bg:"bg-emerald-50", color: "text-emerald-600", path: "/products" },
                { label: "New Slider", icon: <ImageIcon size={28} />,bg:"bg-purple-50", color: "text-purple-600", path: "/homepage-content/hero" },
                { label: "Manage Services", icon: <LayoutGrid size={28} />,bg:"bg-amber-50", color: "text-amber-600", path: "/products" },
                { label: "Inquiries", icon: <MessageSquare size={28} />,bg:"bg-sky-50", color: "text-sky-600", path: "/homepage-content" },
                { label: "Site Settings", icon: <Activity size={28} />,bg:"bg-slate-100", color: "text-slate-600", path: "/about-page-content" },
              ].map((act, idx) => (
                <Link
                  href={act.path}
                  key={idx}
                  className={"flex flex-col items-center justify-center p-2 rounded-xl border border-slate-50 hover:bg-slate-50/50 text-center transition-all group" +" "+act.bg}
                >
                  <div className={`h-7.5 w-7.5 flex items-center justify-center ${act.color} group-hover:scale-105 transition-transform`}>
                    {act.icon}
                  </div>
                    <span className="text-[9px] font-semibold mt-1.5 truncate w-full">{act.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Row 3: Recent Pages + Recent Sliders + System Status (Exactly 3 Cards in a Row) */}
      <div className="grid min-h-0 flex-1 grid-cols-12 gap-3">
        
        {/* Card 1: Recent Pages (Spans 6 cols) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm col-span-6 h-full flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-50 pb-2 flex-shrink-0">
            <h3 className="text-xs font-bold ">Recent Pages</h3>
            <span className="text-[9px] font-bold text-blue-600">View All</span>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-none py-1.5 min-h-0">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-slate-50 text-[8px] font-bold uppercase tracking-wider ">
                  <th className="py-1.5">Page Title</th>
                  <th className="py-1.5">Template</th>
                  <th className="py-1.5">Status</th>
                  <th className="py-1.5">Last Updated</th>
                  <th className="py-1.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50/80">
                {[
                  { title: "Home", temp: "Home Page", status: "Published", updated: "18 May, 11:30 AM" },
                  { title: "About Us", temp: "Default", status: "Published", updated: "16 May, 04:15 PM" },
                  { title: "Our Solutions", temp: "Default", status: "Published", updated: "15 May, 02:40 PM" },
                  { title: "Wellness Resort", temp: "Services", status: "Published", updated: "14 May, 01:20 PM" },
                  { title: "Projects", temp: "Projects", status: "Published", updated: "13 May, 10:10 AM" },
                ].map((row, idx) => (
                  <tr key={idx} className="group">
                    <td className="py-2 font-bold text-slate-700">{row.title}</td>
                    <td className="py-2 text-slate-500">{row.temp}</td>
                    <td className="py-2">
                      <span className="inline-block bg-green-50 text-green-600 px-1.5 py-0.1 rounded text-[8px] font-bold border border-green-100">
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2 ">{row.updated}</td>
                    <td className="py-2 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button className="p-0.5  hover:text-blue-600 cursor-pointer">
                          <Eye size={11} />
                        </button>
                        <button className="p-0.5  hover:text-amber-600 cursor-pointer">
                          <Pencil size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 2: Recent Sliders / Banners (Spans 3 cols) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm col-span-3 h-full flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-50 pb-2 flex-shrink-0">
            <h3 className="text-xs font-bold ">Recent Sliders / Banners</h3>
            <span className="text-[9px] font-bold text-blue-600">View All</span>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-none py-1.5 space-y-2 min-h-0">
            {[
              {
                title: "Luxury Wellness Retreats",
                desc: "Home Slider",
                status: "Active",
                img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=120&q=80",
              },
              {
                title: "Ayurveda & Healing",
                desc: "Home Slider",
                status: "Active",
                img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=120&q=80",
              },
              {
                title: "Design. Build. Launch.",
                desc: "Home Slider",
                status: "Active",
                img: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=120&q=80",
              },
            ].map((slider, idx) => (
              <div key={idx} className="flex items-center justify-between p-1.5 rounded-xl border border-slate-50 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <Image width={48} height={32}
                    src={slider.img}
                    alt={slider.title}
                    className="h-8 w-12 object-cover rounded-lg bg-slate-50 flex-shrink-0"
                    
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold  truncate">{slider.title}</p>
                    <p className="text-[8px]  truncate mt-0.5">{slider.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="bg-green-50 text-green-600 px-1 py-0.2 rounded text-[7px] font-bold border border-green-100">
                    {slider.status}
                  </span>
                  <button className="p-0.5  hover:text-rose-600 cursor-pointer">
                    <Trash size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: System Status (Spans 3 cols) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm col-span-3 h-full flex flex-col overflow-hidden">
          <h3 className="text-xs font-bold  border-b border-slate-50 pb-2 flex-shrink-0">System Status</h3>

          <div className="flex-1 overflow-y-auto scrollbar-none py-1.5 space-y-3 text-[11px] text-slate-600 min-h-0">
            <div className="flex items-center justify-between">
              <span>Website Status</span>
              <span className="bg-green-500 text-white px-1.5 py-0.2 rounded font-bold text-[8px]">Live</span>
            </div>

            <div className="flex items-center justify-between">
              <span>SSL Certificate</span>
              <span className="bg-green-500 text-white px-1.5 py-0.2 rounded font-bold text-[8px]">Active</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Last Backup</span>
              <span className="font-semibold text-[10px] text-slate-500">19 May, 02:30 AM</span>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <span>Storage Usage</span>
                <span className="font-semibold text-slate-500">2.45 GB / 10 GB</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "24.5%" }} />
              </div>
              <span className="text-[8px]  mt-1 inline-block">24% space used</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
