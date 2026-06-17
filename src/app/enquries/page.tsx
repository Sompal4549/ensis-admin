"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Loader2, RefreshCw, Mail, User, Clock } from 'lucide-react';
import { fieldClass } from "@/constants";
import { api, API_URL } from '@/lib/api';

interface Enquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'pending' | 'contacted' | 'closed';
  createdAt: string;
}


const EnquiriesPage = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      // Using the 'api' instance automatically includes the Bearer token in the headers
      const response = await api.get(`${API_URL}/admin/enquiries`);
      const data = response.data?.data || response.data;

      // Standardizing data access
      setEnquiries(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Error loading enquiries");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await api.put(`${API_URL}/admin/enquiries/${id}`, {
        status: newStatus,
      });
      
      toast.success(`Status updated to ${newStatus}`);
      
      // Local state update for immediate UI feedback
      setEnquiries(prev => 
        prev.map(item => item._id === id ? { ...item, status: newStatus as any } : item)
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'contacted': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'closed': return 'bg-emerald-100 text-green-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 px-4 sm:px-6 lg:px-8 pb-8">
      <div className="flex flex-col gap-3 bg-white px-4 py-3 sm:px-6 sm:py-4 rounded-2xl border border-slate-100 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Customer Enquiries</h1>
          <p className="text-slate-500 text-xs sm:text-sm">View and manage incoming contact requests</p>
        </div>
        <button 
          onClick={fetchEnquiries}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-sm font-semibold transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
        {loading && enquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-20 space-y-4">
            <Loader2 className="animate-spin text-[#1d5af2]" size={40} />
            <p className="text-slate-400 animate-pulse text-sm font-medium">Fetching enquiries...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Sender Details</th>
                  <th className="px-6 py-4">Enquiry Content</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {enquiries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                      No enquiries found.
                    </td>
                  </tr>
                ) : (
                  enquiries.map((enquiry) => (
                    <tr key={enquiry._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                            <User size={14} className="text-slate-400" /> {enquiry.name}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1.5">
                            <Mail size={14} className="text-slate-400" /> {enquiry.email}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
                            <Clock size={12} /> {new Date(enquiry.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric', month: 'short', day: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs lg:max-w-md">
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-slate-600 uppercase">{enquiry.subject || 'General Inquiry'}</span>
                          <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                            {enquiry.message}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(enquiry.status)}`}>
                          {enquiry.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select
                          disabled={updatingId === enquiry._id}
                          value={enquiry.status}
                          onChange={(e) => handleUpdateStatus(enquiry._id, e.target.value)}
                          className={`${fieldClass} !w-32 bg-white cursor-pointer shadow-sm hover:border-blue-400 transition-all text-[11px] font-bold`}
                        >
                          <option value="pending">Pending</option>
                          <option value="contacted">Contacted</option>
                          <option value="closed">Closed</option>
                        </select>
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
};

export default EnquiriesPage;