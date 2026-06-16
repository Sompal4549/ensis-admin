"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { 
  Users, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Loader2, 
  Mail,
  Lock,
  Phone,
  Search,
} from "lucide-react";
import { fieldClass, labelClass } from "@/constants";
import { adminApi, type AuthUser } from "@/lib/api";
import { withRole } from "@/lib/withRole";

function UsersManagementPage() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "admin" });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const data = await adminApi.listUsers();
      setUsers(data || []);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to load users";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (user: AuthUser) => {
    setIsEditing(true);
    setCurrentId(user._id);
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setForm({ name: "", email: "", phone: "", role: "admin" });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (isEditing && currentId) {
        const payload: Partial<typeof form> = { ...form };
        await adminApi.updateUser(currentId, payload);
        toast.success("User updated successfully");
      } else {
        if (!form.phone) {
          toast.error("Phone number is required for new users");
          setFormLoading(false);
          return;
        }
        await adminApi.createUser(form);
        toast.success("User created successfully");
      }
      resetForm();
      fetchUsers();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Operation failed";
      toast.error(message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await adminApi.deleteUser(id);
      toast.success("User deleted");
      fetchUsers();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Delete failed";
      toast.error(message);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search users by name, email or phone..." 
            className={`${fieldClass} pl-10 w-full`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User List */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                <Users size={18} />
              </div>
              <h2 className="text-sm font-bold text-slate-800">Admin Users</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-10 text-center">
                      <Loader2 className="animate-spin mx-auto text-blue-600 mb-2" size={24} />
                      <span className="text-slate-400">Loading users...</span>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-10 text-center text-slate-400 italic">No users found</td>
                  </tr>
                ) : filteredUsers.map(user => (
                  <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-700">{user.name}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">{user.role}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{user.email}</td>
                    <td className="px-6 py-4 text-slate-500">{user.phone || "—"}</td>
                    <td className="px-6 py-4 text-right space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(user)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(user._id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Column */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden self-start sticky top-6">
          <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-800">{isEditing ? "Edit User Details" : "Add New User"}</h2>
            {isEditing && (
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input 
                type="text" required className={fieldClass} 
                value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
              />
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="email" required className={`${fieldClass} pl-9`} 
                  value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>WhatsApp Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="tel" required className={`${fieldClass} pl-9`} 
                  placeholder="91XXXXXXXXXX"
                  value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Role</label>
              <select 
                className={fieldClass} value={form.role} 
                onChange={(e) => setForm({...form, role: e.target.value})}
              >
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
                <option value="editor">Editor</option>
              </select>
            </div>
            <button 
              type="submit" disabled={formLoading}
              className="w-full h-11 bg-[#1d5af2] hover:bg-[#154dc8] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 cursor-pointer"
            >
              {formLoading ? <Loader2 className="animate-spin" size={18} /> : (
                <><Save size={18} /> {isEditing ? "Save Changes" : "Create Account"}</>
            )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default withRole(UsersManagementPage, ["superadmin"]);
