// @ts-ignore
import { useForm, FormProvider } from 'react-hook-form';
// @ts-ignore
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { z } from 'zod';

interface AdminFormWrapperProps<T extends z.ZodTypeAny> {
  schema: T;
  onSubmit: (data: z.infer<T>) => Promise<void>;
  children: React.ReactNode;
  defaultValues?: Partial<z.infer<T>>;
}

export function AdminFormWrapper<T extends z.ZodTypeAny>({
  schema,
  onSubmit,
  children,
  defaultValues,
}: AdminFormWrapperProps<T>) {
  const methods = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleFormSubmit = async (data: z.infer<T>) => {
    try {
      await onSubmit(data);
      methods.reset();
    } catch (error) {
      console.error("Form submission failed:", error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleFormSubmit)} className="space-y-6">
        {children}
      </form>
    </FormProvider>
  );
}