import React from 'react';
import { fieldClass, labelClass } from '@/constants';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelClassName?: string;
}

export const FormInput: React.FC<FormInputProps> = ({ label, labelClassName, className, ...props }) => {
  return (
    <div className="w-full">
      {label && <label className={`${labelClass} ${labelClassName || ''}`}>{label}</label>}
      <input className={`${fieldClass} ${label ? 'mt-1' : ''} ${className || ''}`} {...props} />
    </div>
  );
};
