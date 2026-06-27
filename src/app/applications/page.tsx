"use client";

import { useState } from "react";
import { applicationApi } from "@/lib/api";
import { toast } from "react-toastify";

export default function ApplicationsPage() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    currentLocation: "",
    department: "",
    coverLetter: "",
  });

  const [resume, setResume] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!resume) {
      toast.error("Resume is required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append(
        "fullName",
        form.fullName
      );
      formData.append(
        "email",
        form.email
      );
      formData.append(
        "phone",
        form.phone
      );
      formData.append(
        "currentLocation",
        form.currentLocation
      );
      formData.append(
        "department",
        form.department
      );
      formData.append(
        "coverLetter",
        form.coverLetter
      );
      formData.append(
        "resume",
        resume
      );

      await applicationApi.create(formData);

      toast.success(
        "Application submitted successfully"
      );

      setForm({
        fullName: "",
        email: "",
        phone: "",
        currentLocation: "",
        department: "",
        coverLetter: "",
      });

      setResume(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-6">
          Apply For Job
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <input
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          <input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          <input
            name="currentLocation"
            placeholder="Current Location"
            value={form.currentLocation}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          <input
            name="department"
            placeholder="Department"
            value={form.department}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          <textarea
            name="coverLetter"
            placeholder="Cover Letter (Optional)"
            value={form.coverLetter}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 h-40"
          />

          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) =>
              setResume(
                e.target.files?.[0] || null
              )
            }
            className="w-full"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-6 py-3 rounded-lg"
          >
            {loading
              ? "Submitting..."
              : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}