"use client";

import { fieldClass, labelClass } from "@/constants";

interface TextFieldProps {
  label?: string;
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  readOnly?: boolean;
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
  readOnly = false,
}: TextFieldProps) {
  const inputEl = (
    <input
      type={type}
      className={`${fieldClass} ${className}`}
      value={value ?? ""}
      placeholder={placeholder}
      readOnly={readOnly}
      onChange={(e) => onChange(e.target.value)}
    />
  );

  if (!label) return inputEl;

  return (
    <label className={labelClass}>
      {label}
      <div className="mt-1">{inputEl}</div>
    </label>
  );
}

interface TextAreaFieldProps {
  label?: string;
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  className = "",
}: TextAreaFieldProps) {
  const textareaEl = (
    <textarea
      className={`${fieldClass} ${className}`}
      value={value ?? ""}
      placeholder={placeholder}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
    />
  );

  if (!label) return textareaEl;

  return (
    <label className={labelClass}>
      {label}
      <div className="mt-1">{textareaEl}</div>
    </label>
  );
}

interface LinkActionFieldProps {
  heading: string;
  buttonText: string | undefined;
  buttonHref: string | undefined;
  onChangeText: (value: string) => void;
  onChangeHref: (value: string) => void;
}

export function LinkActionField({
  heading,
  buttonText,
  buttonHref,
  onChangeText,
  onChangeHref,
}: LinkActionFieldProps) {
  return (
    <div className="p-3 border rounded bg-gray-50 space-y-2">
      <h4 className="text-[10px] font-bold text-[#8d6a3a] uppercase">{heading}</h4>
      <div className="grid grid-cols-2 gap-2">
        <TextField
          placeholder="Label"
          value={buttonText}
          onChange={onChangeText}
        />
        <TextField
          placeholder="URL"
          value={buttonHref}
          onChange={onChangeHref}
        />
      </div>
    </div>
  );
}
