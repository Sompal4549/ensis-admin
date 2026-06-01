import React from 'react';
import { z } from 'zod';
import { AdminFormWrapper } from './AdminFormWrapper';

const categorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().optional(),
});

export const CategoryAddForm = () => {
  const handleSubmit = async (values: z.infer<typeof categorySchema>) => {
    const response = await fetch('/api/v1/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!response.ok) throw new Error("Failed to add category");
    alert("Category added successfully!");
  };

  return (
    <AdminFormWrapper schema={categorySchema} onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4 p-6 border rounded-lg bg-white shadow-sm">
        <h2 className="text-xl font-bold">Add New Category</h2>
        
        <div>
          <label className="block text-sm font-medium">Category Name</label>
          <input name="name" className="w-full border p-2 rounded" placeholder="Electronics..." />
        </div>

        <div>
          <label className="block text-sm font-medium">Slug</label>
          <input name="slug" className="w-full border p-2 rounded" placeholder="electronics" />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea name="description" className="w-full border p-2 rounded" rows={3} />
        </div>

        <button 
          type="submit" 
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Create Category
        </button>
      </div>
    </AdminFormWrapper>
  );
};