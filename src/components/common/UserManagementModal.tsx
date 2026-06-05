"use client";

import axios from "axios";
import { useState } from "react";
import { X, Loader2, ShieldCheck } from "lucide-react";
import { fieldClass, labelClass } from "@/constants";
import { authStore } from "@/lib/api";

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserManagementModal({ isOpen, onClose }: UserManagementModalProps) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "admin" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", isError: false });

    try {
      const token = authStore.getToken();
      await axios.post(`${API_BASE_URL}/api/v1/admin/users`, form, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setMessage({ text: "User created successfully!", isError: false });
      setTimeout(() => {
        onClose();
        setForm({ name: "", email: "", password: "", role: "admin" });
        setMessage({ text: "", isError: false });
      }, 1500);
    } catch (error) {
      const errMsg = axios.isAxiosError(error) 
        ? error.response?.data?.message 
        : "An unexpected error occurred";
      setMessage({ text: errMsg || "Failed to create user", isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
              <ShieldCheck size={18} />
            </div>
            <h2 className="text-sm font-bold text-slate-800">Create New Admin User</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              type="text"
              required
              className={`${fieldClass} mt-1`}
              placeholder="e.g. Jane Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className={labelClass}>Email Address</label>
            <input
              type="email"
              required
              className={`${fieldClass} mt-1`}
              placeholder="jane@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className={labelClass}>Initial Password</label>
            <input
              type="password"
              required
              minLength={8}
              className={`${fieldClass} mt-1`}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div>
            <label className={labelClass}>Assign Role</label>
            <select
              className={`${fieldClass} mt-1`}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
              <option value="editor">Editor</option>
            </select>
          </div>

          {message.text && (
            <div className={`p-3 rounded-lg text-xs font-semibold ${message.isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {message.text}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 flex items-center justify-center gap-2 bg-[#1d5af2] hover:bg-[#154dc8] text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
