"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./auth/AuthContext";

type ReviewFormProps = {
    productId: string;
};

export const ReviewForm = ({ productId }: ReviewFormProps) => {
    const { token } = useAuth(); // token should be a JWT string
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rating || !comment.trim()) {
            toast.error("Please provide a rating and comment.");
            return;
        }
        setSubmitting(true);
        try {
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
                // Backend sends `message` on error (e.g., duplicate review)
                throw new Error(data.message || "Failed to add review");
            }
            toast.success("Review added!");
            // clear form
            setRating(0);
            setComment("");
            // optional: trigger a refresh of the reviews list
            // you can use a context, SWR, or a simple custom event
            // Example with a custom event:
            window.dispatchEvent(new Event("reviewsUpdated"));
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
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

            {/* Rating selector – simple star buttons */}
            <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => {
                    const star = i + 1;
                    return (
                        <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            className={`text-2xl ${star <= rating ? "text-yellow-400" : "text-gray-300"
                                } transition-colors`}
                            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                        >
                            ★
                        </button>
                    );
                })}
            </div>

            {/* Comment textarea */}
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review…"
                className="w-full p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
                required
            />

            <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
            >
                {submitting ? "Submitting…" : "Submit Review"}
            </button>
        </form>
    );
};
