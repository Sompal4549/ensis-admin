import React from 'react';
import { Loader2 } from 'lucide-react';

interface FormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  loading?: boolean;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
}

export const FormButton: React.FC<FormButtonProps> = ({ 
  label, 
  loading, 
  icon, 
  variant = 'primary', 
  className, 
  ...props 
}) => {
  const variants = {
    primary: "bg-[#263016] text-white hover:bg-[#1a210f]",
    secondary: "bg-[#8d6a3a] text-white hover:bg-[#6f542f]",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
    outline: "bg-white border border-[#d9cdbb] text-[#263016] hover:bg-gray-50",
  };

  return (
    <button
      disabled={loading || props.disabled}
      className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 ${variants[variant]} ${className || ''}`}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" size={18} /> : (icon || null)}
      {label}
    </button>
  );
};
