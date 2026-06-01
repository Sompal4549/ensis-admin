import React from 'react';
import { z } from 'zod';
import { AdminFormWrapper } from '../AdminFormWrapper';

const productSchema = z.object({
  name: z.string().min(3, "Name is too short"),
  price: z.number().positive("Price must be positive"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
});

export const ProductAddForm = () => {
  const handleSubmit = async (values: z.infer<typeof productSchema>) => {
    const response = await fetch('/api/v1/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    
    if (!response.ok) throw new Error("Failed to add product");
    alert("Product added successfully!");
  };

  return (
    <AdminFormWrapper schema={productSchema} onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4 p-6 border rounded-lg bg-white shadow-sm">
        <h2 className="text-xl font-bold">Add New Product</h2>
        
        <div>
          <label className="block text-sm font-medium">Product Name</label>
          <input name="name" className="w-full border p-2 rounded" placeholder="iPhone 15..." />
        </div>

        <div>
          <label className="block text-sm font-medium">Price</label>
          <input type="number" name="price" className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium">Category ID</label>
          <input name="categoryId" className="w-full border p-2 rounded" placeholder="Category hex ID" />
        </div>

        <button 
          type="submit" 
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Create Product
        </button>
      </div>
    </AdminFormWrapper>
  );
};