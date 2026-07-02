"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./auth/AuthContext";
import { adminApi, authStore, type AuthUser } from "@/lib/api";

type ReviewFormProps = {
    productId: string;
};

export const ReviewForm = ({ productId }: ReviewFormProps) => {
    const { user } = useAuth();
    const token = authStore.getToken();
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<string>("");
    const [customers, setCustomers] = useState<AuthUser[]>([]);
    const [customerId, setCustomerId] = useState<string>("");

    useEffect(() => {
        if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
            return;
        }

        const loadCustomers = async () => {
            try {
                const users = await adminApi.listUsers();
                setCustomers(users.filter((u) => u.role !== "admin" && u.role !== "superadmin"));
            } catch (error: any) {
                console.error("Failed to load customers:", error);
            }
        };

        loadCustomers();
    }, [user]);

    const isAdminReview = user?.role === "admin" || user?.role === "superadmin";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rating || !comment.trim()) {
            toast.error("Please provide a rating and comment.");
            return;
        }

        if (isAdminReview && !customerId) {
            toast.error("Please select a customer before submitting the review.");
            return;
        }

        setSubmitting(true);
        try {
            if (isAdminReview) {
                await adminApi.addProductReview(productId, {
                    customerId,
                    rating,
                    comment: comment.trim(),
                });
            } else {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/${productId}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ rating, comment: comment.trim() }),
                    }
                );
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || "Failed to add review");
                }
            }

            const successMessage = isAdminReview ? "Customer review saved successfully." : "Review saved successfully.";
            toast.success(successMessage);
            setMessage(successMessage);
            setRating(0);
            setComment("");
            setCustomerId("");
            window.dispatchEvent(new Event("reviewsUpdated"));
        } catch (err: any) {
            const errorMessage = err.message || "Something went wrong";
            toast.error(errorMessage);
            setMessage(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="glass p-6 rounded-xl shadow-lg space-y-4 max-w-md"
        >
            <h3 className="text-xl font-semibold mb-2">Add a Review</h3>

            {isAdminReview && (
                <div>
                    <label className="block mb-2 text-sm font-medium text-slate-600">Customer</label>
                    <select
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                        className="w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    >
                        <option value="">Select a customer</option>
                        {customers.map((customer) => (
                            <option key={customer._id} value={customer._id}>
                                {customer.name} {customer.email ? `(${customer.email})` : customer.phone}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => {
                    const star = i + 1;
                    return (
                        <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            className={`text-2xl ${star <= rating ? "text-yellow-400" : "text-gray-300"} transition-colors`}
                            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                        >
                            ★
                        </button>
                    );
                })}
            </div>

            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review…"
                className="w-full p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
                required
            />

            {message && (
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    {message}
                </div>
            )}

       <button
  type="submit"
  disabled={submitting}
  style={{background:"blue"}}
  className="w-full rounded-md bg-blue px-4 py-3 text-white font-medium transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
>
  {submitting ? "Saving..." : "Save Review"}
</button>
        </form>
    );
};
