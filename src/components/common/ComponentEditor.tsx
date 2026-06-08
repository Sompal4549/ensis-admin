"use client";

import { toast } from "react-toastify";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Save } from "lucide-react";
import RichTextEditor from "@/components/common/RichTextEditor";
import {
  componentContentApi,
  type ComponentContent,
} from "@/lib/api";
import { fieldClass, labelClass } from "@/constants";

interface ComponentEditorProps {
  componentKey: string;
  title: string;
}


export default function ComponentEditor({
  componentKey,
  title,
}: ComponentEditorProps) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<ComponentContent | null>(null);

  const [form, setForm] = useState({
    label: "",
    page: "",
    description: "",
    isActive: true,
    data: "{\n\n}",
  });

  const loadContent = useCallback(async () => {
    try {
      setLoading(true);

      const contents = await componentContentApi.list();

      const item = contents.find(
        (content) => content.key === componentKey
      );

      if (!item) {
        toast.error(`Component "${componentKey}" not found`);
        return;
      }

      setContent(item);

      setForm({
        label: item.label || "",
        page: item.page || "",
        description: item.description || "",
        isActive: item.isActive,
        data: JSON.stringify(item.data || {}, null, 2),
      });
    } catch (error) {
      toast.error((error as Error).message || "Failed to load component");
    } finally {
      setLoading(false);
    }
  }, [componentKey]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!content) return;

    try {
      setLoading(true);

      await componentContentApi.update(content._id, {
        label: form.label,
        page: form.page,
        description: form.description,
        isActive: form.isActive,
        data: JSON.parse(form.data),
      });

      toast.success("Component updated successfully");
    } catch (error) {
      toast.error((error as Error).message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !content) {
    return (
      <div className="rounded-lg border bg-white p-6">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Component Key: {componentKey}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-[#ded3c4] bg-white p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className={labelClass}>
            Label
            <input
              className={`${fieldClass} mt-2`}
              value={form.label}
              onChange={(e) =>
                setForm({
                  ...form,
                  label: e.target.value,
                })
              }
            />
          </label>

          <label className={labelClass}>
            Page
            <input
              className={`${fieldClass} mt-2`}
              value={form.page}
              onChange={(e) =>
                setForm({
                  ...form,
                  page: e.target.value,
                })
              }
            />
          </label>
        </div>

        {/* Description */}
        <div className="mt-6">
          <label className={labelClass}>
            Description
          </label>

          <div className="mt-2">
            <RichTextEditor
              value={form.description}
              onChange={(value: string) =>
                setForm({
                  ...form,
                  description: value,
                })
              }
              placeholder="Enter description..."
              minHeight="250px"
            />
          </div>
        </div>

        {/* Active */}
        <div className="mt-6">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm({
                  ...form,
                  isActive: e.target.checked,
                })
              }
            />
            Active
          </label>
        </div>

        {/* JSON Editor */}
        <div className="mt-6">
          <label className={labelClass}>
            Component Data (JSON)
          </label>

          <div className="mt-2">
            <RichTextEditor
              value={form.data}
              onChange={(value: string) =>
                setForm({
                  ...form,
                  data: value,
                })
              }
              placeholder="Paste JSON..."
              minHeight="600px"
              isCodeEditor={true}
              showColorPicker={false}
            />
          </div>
        </div>

        <div className="mt-8 flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md bg-[#6f542f] px-4 py-2 text-sm font-bold text-white"
          >
            <Save size={16} />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}