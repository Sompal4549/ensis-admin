"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { Loader2, RefreshCw, Mail, Phone, MapPin, FileText, Trash2, Briefcase, Clock } from "lucide-react";
import { applicationApi, Application } from "@/lib/api";

const STATUS_STYLES: Record<Application["status"], string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  reviewed: "bg-blue-100 text-blue-700 border-blue-200",
  shortlisted: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await applicationApi.list();
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error loading applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleUpdateStatus = async (id: string, newStatus: Application["status"]) => {
    setUpdatingId(id);
    try {
      await applicationApi.update(id, { status: newStatus });
      setApplications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
      );
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (application: Application) => {
    if (!window.confirm(`Delete application from ${application.fullName}?`)) return;
    setDeletingId(application._id);
    try {
      await applicationApi.remove(application._id);
      setApplications((prev) => prev.filter((item) => item._id !== application._id));
      toast.success("Application deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete application");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 px-4 sm:px-6 lg:px-8 pb-8">
      <div className="flex flex-col gap-3 bg-white px-4 py-3 sm:px-6 sm:py-4 rounded-2xl border border-slate-100 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Job Applications</h1>
          <p className="text-xs sm:text-sm">Applications submitted from the website</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
            {applications.length} total
          </span>
          <button
            onClick={fetchApplications}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-sm font-semibold transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
        {loading && applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="animate-spin text-[#1d5af2]" size={40} />
            <p className="animate-pulse text-sm font-medium">Fetching applications...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100 font-bold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-3">Applicant</th>
                  <th className="px-3 py-3">Role</th>
                  <th className="px-3 py-3">Cover Letter</th>
                  <th className="px-3 py-3">Applied</th>
                  <th className="px-3 py-3">Resume</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center italic text-sm">
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  applications.map((application) => (
                    <tr key={application._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-3 py-2.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold">{application.fullName}</span>
                          <span className="text-[11px] flex items-center gap-1">
                            <Mail size={11} /> {application.email}
                          </span>
                          <span className="text-[11px] flex items-center gap-1">
                            <Phone size={11} /> {application.phone}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] font-bold flex items-center gap-1">
                            <Briefcase size={11} /> {application.department}
                          </span>
                          <span className="text-[11px]">Exp: {application.experience || "N/A"}</span>
                          <span className="text-[11px] flex items-center gap-1">
                            <MapPin size={11} /> {application.currentLocation}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 max-w-xs">
                        <p className="text-[11px] leading-relaxed line-clamp-3">
                          {application.coverLetter || "—"}
                        </p>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-[11px] flex items-center gap-1 font-medium">
                          <Clock size={11} />
                          {new Date(application.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <a
                          href={application.resume}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1d5af2] hover:underline"
                        >
                          <FileText size={12} /> View
                        </a>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${STATUS_STYLES[application.status] || "bg-slate-100 border-slate-200"}`}
                          >
                            {application.status}
                          </span>
                          <select
                            disabled={updatingId === application._id}
                            value={application.status}
                            onChange={(e) =>
                              handleUpdateStatus(application._id, e.target.value as Application["status"])
                            }
                            className="!w-28 bg-white cursor-pointer rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-bold shadow-sm hover:border-blue-400 transition-all disabled:opacity-50"
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          onClick={() => handleDelete(application)}
                          disabled={deletingId === application._id}
                          className="inline-flex items-center justify-center p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Delete application"
                        >
                          {deletingId === application._id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
