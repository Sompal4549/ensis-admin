import React from 'react';
import { z } from 'zod';
// @ts-expect-error
import { useFormContext } from 'react-hook-form';
import { AdminFormWrapper } from './AdminFormWrapper';

const navSchema = z.object({
  label: z.string().min(1, "Label is required"),
  url: z.string().min(1, "URL is required"),
  priority: z.number().int().default(0),
});

export const NavigationAddForm = () => {
  const handleSubmit = async (values: z.infer<typeof navSchema>) => {
    const response = await fetch('/api/v1/navigation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!response.ok) throw new Error("Failed to add navigation item");
    alert("Navigation item added!");
  };

  return (
    <AdminFormWrapper schema={navSchema} onSubmit={handleSubmit}>
      <NavFields />
    </AdminFormWrapper>
  );
};

const NavFields = () => {
  const { register, formState: { errors } } = useFormContext();
  return (
    <div className="flex flex-col gap-4 p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-bold">Add Navigation Link</h2>
      <div>
        <label className="block text-sm font-medium">Label</label>
        <input {...register('label')} className="w-full border p-2 rounded" placeholder="Home, Shop, etc." />
        {errors.label && <p className="text-red-500 text-xs mt-1">{errors.label.message as string}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium">URL</label>
        <input {...register('url')} className="w-full border p-2 rounded" placeholder="/shop" />
        {errors.url && <p className="text-red-500 text-xs mt-1">{errors.url.message as string}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium">Priority (Ordering)</label>
        <input type="number" {...register('priority', { valueAsNumber: true })} className="w-full border p-2 rounded" />
      </div>
      <button type="submit" className="bg-blue-600 text-white py-2 rounded">Add Link</button>
    </div>
  );
};