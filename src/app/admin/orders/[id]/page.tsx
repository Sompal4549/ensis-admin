"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, ShoppingBag, Save, User, MapPin, CreditCard, Truck, Phone } from "lucide-react";
import { toast } from "react-toastify";
import { orderApi, Order } from "@/lib/api";
import { fieldClass, labelClass, cardClass } from "@/constants";

const getStatusColor = (status: Order["orderStatus"]) => {
  switch (status) {
    case "delivered": return "bg-green-100 text-green-800";
    case "cancelled": return "bg-red-100 text-red-800";
    case "confirmed": return "bg-blue-100 text-blue-800";
    case "shipped": return "bg-purple-100 text-purple-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getPaymentColor = (status: Order["paymentStatus"]) => {
  switch (status) {
    case "paid": return "bg-green-100 text-green-800";
    case "failed": return "bg-red-100 text-red-800";
    default: return "bg-amber-100 text-amber-800";
  }
};

const InfoRow = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex items-start justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
    <span className="text-xs font-medium text-gray-500">{label}</span>
    <span className="text-xs font-semibold text-gray-800 text-right break-all">{value || "—"}</span>
  </div>
);

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>("pending");
  const [paymentStatus, setPaymentStatus] = useState<string>("pending");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await orderApi.get(orderId);
        setOrder(data);
        setOrderStatus(data.orderStatus);
        setPaymentStatus(data.paymentStatus);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch order";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleUpdate = async () => {
    if (!order) return;
    setUpdating(true);
    try {
      const updated = await orderApi.update(order._id, {
        orderStatus,
        paymentStatus,
      } as Partial<Order>);
      setOrder(updated);
      setOrderStatus(updated.orderStatus);
      setPaymentStatus(updated.paymentStatus);
      toast.success("Order updated successfully");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update order";
      toast.error(message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6">
        <Link href="/orders-list-management" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
        <div className="p-4 bg-red-50 text-red-600 rounded-md">{error || "Order not found"}</div>
      </div>
    );
  }

  const customerName = typeof order.user === "object" ? order.user.name : "Guest User";
  const customerEmail = typeof order.user === "object" ? order.user.email : undefined;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Link href="/orders-list-management" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Order #{order._id.slice(-6).toUpperCase()}</h1>
            <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
            {order.orderStatus}
          </span>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPaymentColor(order.paymentStatus)}`}>
            {order.paymentStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className={cardClass}>
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-gray-800">Customer</h2>
            </div>
            <InfoRow label="Name" value={customerName} />
            <InfoRow label="Email" value={customerEmail} />
            <InfoRow label="User ID" value={typeof order.user === "string" ? order.user : order.user._id} />
          </div>

          <div className={cardClass}>
            <div className="flex items-center gap-2 mb-3">
              <Truck className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-gray-800">Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items.map((item, index) => {
                    const productName =
                      typeof item.product === "object" && item.product !== null && "title" in item.product
                        ? item.product.title
                        : item.name || String(item.product ?? "Unknown Product");
                    return (
                      <tr key={index}>
                        <td className="px-4 py-3 text-gray-800 font-medium">{productName}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-gray-600">₹{item.price.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-right text-gray-900 font-bold">
                          ₹{(item.quantity * item.price).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Total</td>
                    <td className="px-4 py-3 text-right text-base font-bold text-gray-900">
                      ₹{order.totalAmount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className={cardClass}>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-gray-800">Shipping Address</h2>
            </div>
            <InfoRow label="Label" value={order.shippingAddress.label} />
            <InfoRow label="Street" value={order.shippingAddress.street} />
            <InfoRow label="City" value={order.shippingAddress.city} />
            <InfoRow label="State" value={order.shippingAddress.state} />
            <InfoRow label="Postal Code" value={order.shippingAddress.postalCode} />
            <InfoRow label="Country" value={order.shippingAddress.country} />
            <div className="flex items-start justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
              <span className="text-xs font-medium text-gray-500">Phone</span>
              <span className="text-xs font-semibold text-gray-800 text-right flex items-center gap-1">
                <Phone className="w-3 h-3" /> {order.shippingAddress.phone}
              </span>
            </div>
          </div>

          <div className={cardClass}>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-gray-800">Details</h2>
            </div>
            <InfoRow label="Order ID" value={order._id} />
            <InfoRow label="Order Status" value={order.orderStatus} />
            <InfoRow label="Payment Status" value={order.paymentStatus} />
            <InfoRow label="Tracking Number" value={order.trackingNumber} />
            <InfoRow label="Placed At" value={new Date(order.createdAt).toLocaleString()} />
            <InfoRow label="Last Updated" value={new Date(order.updatedAt).toLocaleString()} />
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200 shadow-md h-fit sticky top-6">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Update Order</h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Compact status update</p>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className={labelClass}>Order Status</label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className={`${fieldClass} mt-1.5`}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className={`${fieldClass} mt-1.5`}
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <button
              type="button"
              disabled={updating}
              onClick={handleUpdate}
              className="w-full flex items-center justify-center gap-2 bg-[#6f542f] hover:bg-[#5a4325] text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md disabled:opacity-50 mt-2"
            >
              {updating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Updates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
