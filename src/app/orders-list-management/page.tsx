"use client";

import { useEffect, useState } from "react";
import { orderApi, Order } from "@/lib/api";
import Link from "next/link";
import { Loader2, Eye, ShoppingBag, Edit2, X, Save } from "lucide-react";
import { toast } from "react-toastify";
import { fieldClass, labelClass } from "@/constants";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  const [formName, setFormName] = useState("");
  const [formStatus, setFormStatus] = useState<string>("pending");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderApi.list();
        setOrders(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch orders";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    if (selectedOrder) {
      setFormName(typeof selectedOrder.user === "object" ? selectedOrder.user.name : "Guest User");
      setFormStatus(selectedOrder.status);
    }
  }, [selectedOrder]);

  const handleUpdate = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const updated = await orderApi.update(selectedOrder._id, {
        status: formStatus,
        name: formName,
      } as Partial<Order>);
      setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
      setSelectedOrder(null);
      toast.success(`Order #${updated.orderNumber} updated!`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update order";
      toast.error(message);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "returned": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-600 rounded-md m-4">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${selectedOrder ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm">
              {orders.map((order) => (
                <tr key={order._id} className={`hover:bg-gray-50 transition-colors ${selectedOrder?._id === order._id ? 'bg-indigo-50/50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-indigo-600">
                    #{order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {typeof order.user === "object" ? order.user.name : "Guest User"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-bold">
                    ${order.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium space-x-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className={`inline-flex items-center p-1.5 rounded-lg transition-colors ${selectedOrder?._id === order._id ? 'bg-indigo-600 text-white' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'}`}
                      title="Quick Update"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="inline-flex items-center text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
                      title="View Full Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">No orders available to display.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selectedOrder && (
          <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200 shadow-md h-fit sticky top-6 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Update Order</h2>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Order #{selectedOrder.orderNumber}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Customer Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className={`${fieldClass} mt-1.5`}
                    placeholder="Enter customer name"
                  />
                </div>

                <div>
                  <label className={labelClass}>Order Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className={`${fieldClass} mt-1.5`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="returned">Returned</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                <button
                  type="button"
                  disabled={updating}
                  onClick={handleUpdate}
                  className="w-full flex items-center justify-center gap-2 bg-[#6f542f] hover:bg-[#5a4325] text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md disabled:opacity-50"
                >
                  {updating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Save Updates
                </button>
                
                <Link
                  href={`/admin/orders/${selectedOrder._id}`}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 py-3 rounded-xl font-bold text-sm transition-all"
                >
                  <Eye size={18} />
                  View Details
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
