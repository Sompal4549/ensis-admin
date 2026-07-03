"use client";

import { toast } from "react-toastify";
import { useState } from "react";
import { X, Loader2, ShieldCheck, Phone } from "lucide-react";
import { fieldClass, labelClass } from "@/constants";
import { api } from "@/lib/api";

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserManagementModal({ isOpen, onClose }: UserManagementModalProps) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "admin" });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/admin/users", form);
      
      toast.success("User created successfully!");
      setTimeout(() => {
        onClose();
        setForm({ name: "", email: "", phone: "", role: "admin" });
      }, 1500);
    } catch (error) {
      const errMsg = (error as any).response?.data?.message || "Failed to create user";
      toast.error(errMsg);
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
            <h2 className="text-sm font-bold ">Create New Admin User</h2>
          </div>
          <button onClick={onClose} className=" hover: transition-colors">
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
            <label className={labelClass}>WhatsApp Number</label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 " size={14} />
            <input
              type="tel"
              required
              className={`${fieldClass} pl-9`}
              placeholder="91XXXXXXXXXX"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            </div>
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
              <option value="user">User</option>
            </select>
          </div>

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
