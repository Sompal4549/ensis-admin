"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  Trash2,
  RefreshCw,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  History,
  ShieldPlus,
  PencilLine,
} from "lucide-react";
import { activityLogApi, type ActivityLog, type ActivityAction } from "@/lib/api";

// Compact local classes for this page only
const smallFieldClass =
  "rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20";

const ACTION_META: Record<ActivityAction, { label: string; badge: string; icon: React.ReactNode }> = {
  create: {
    label: "Created",
    badge: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30",
    icon: <ShieldPlus size={12} />,
  },
  update: {
    label: "Updated",
    badge: "bg-sky-500/10 text-sky-400 ring-sky-500/30",
    icon: <PencilLine size={12} />,
  },
  delete: {
    label: "Deleted",
    badge: "bg-red-500/10 text-red-400 ring-red-500/30",
    icon: <Trash2 size={12} />,
  },
};

const formatTime = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatRelative = (iso: string) => {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

const changeSummary = (log: ActivityLog): string => {
  if (log.action === "delete") return "Record deleted";
  const changes = log.changes ?? {};
  const keys = Object.keys(changes);
  if (keys.length === 0) return log.action === "create" ? "Record created" : "Record updated";
  if (keys.length <= 3) return keys.map((k) => k.replace(/([A-Z])/g, " $1").trim()).join(", ");
  return `${keys.length} fields changed`;
};

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [entities, setEntities] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [action, setAction] = useState<ActivityAction | "">("");
  const [entity, setEntity] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await activityLogApi.list({ page, limit, action, entity, search });
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      if (data.entities?.length) setEntities(data.entities);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to load activity logs";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, action, entity, search]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const resetPage = () => {
    if (page !== 1) setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold text-slate-100 flex items-center gap-1.5">
            <History size={17} className="text-blue-400" />
            Activity Logs
          </h1>
          <p className="mt-0.5 text-xs text-slate-400">
            Who created, edited and deleted what — tracked in real time on the backend
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                resetPage();
              }}
              placeholder="Search record / user / entity..."
              className={`${smallFieldClass} w-56 pl-8`}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setAction("");
              setEntity("");
              setPage(1);
              fetchLogs();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={13} /> Reset
          </button>
          <button
            type="button"
            onClick={fetchLogs}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-2">
        <select
          value={action}
          onChange={(e) => {
            setAction(e.target.value as ActivityAction | "");
            resetPage();
          }}
          className={smallFieldClass}
        >
          <option value="">All Actions</option>
          <option value="create">Created</option>
          <option value="update">Updated</option>
          <option value="delete">Deleted</option>
        </select>

        <select
          value={entity}
          onChange={(e) => {
            setEntity(e.target.value);
            resetPage();
          }}
          className={smallFieldClass}
        >
          <option value="">All Entities</option>
          {entities.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <span className="text-xs text-slate-500">
          {loading ? "Loading..." : `${total} log${total === 1 ? "" : "s"}`}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={22} className="animate-spin text-blue-500" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <History size={32} className="mb-2 text-slate-300" />
            <p className="text-xs font-medium">No activity logged yet</p>
            <p className="text-[11px]">
              Create, update or delete something as an admin to see it here
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                <th className="px-2 py-2 font-semibold">Action</th>
                <th className="px-2 py-2 font-semibold">User</th>
                <th className="px-2 py-2 font-semibold">Entity</th>
                <th className="px-2 py-2 font-semibold">Record</th>
                <th className="px-2 py-2 font-semibold">Summary</th>
                <th className="px-2 py-2 font-semibold">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => {
                const meta = ACTION_META[log.action] ?? ACTION_META.update;
                return (
                  <tr key={log._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-2 py-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${meta.badge}`}
                      >
                        {meta.icon}
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1.5">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600/10 text-[10px] font-bold uppercase text-blue-600">
                          {(log.userName || "?").slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-slate-700">
                            {log.userName || "Unknown user"}
                          </p>
                          <p className="text-[9px] uppercase tracking-wide text-slate-400">
                            {log.userRole || "admin"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                        {log.entity}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <p className="max-w-[200px] truncate text-[11px] font-medium text-slate-700">
                        {log.title || log.entityId || "-"}
                      </p>
                      <p className="text-[9px] text-slate-400">{log.entityId}</p>
                    </td>
                    <td className="px-2 py-2">
                      <p className="text-[11px] text-slate-600">{changeSummary(log)}</p>
                    </td>
                    <td className="px-2 py-2">
                      <p className="text-[11px] text-slate-700">{formatRelative(log.createdAt)}</p>
                      <p className="text-[9px] text-slate-400">{formatTime(log.createdAt)}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="mt-2 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={12} /> Prev
            </button>
            <span className="text-[11px] font-medium text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}