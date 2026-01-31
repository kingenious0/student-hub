/**
 * Form Input Component
 * - Text input
 * - Email input
 * - Password input
 * - With validation
 */

import React from 'react';

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="mb-4">
        {label && (
          <label className="form-label">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <input
          ref={ref}
          className={`form-input ${error ? 'border-red-500 focus:ring-red-100' : ''} ${className}`}
          {...props}
        />

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

/**
 * Form Textarea Component
 */
export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="mb-4">
        {label && (
          <label className="form-label">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          className={`form-input resize-none ${error ? 'border-red-500 focus:ring-red-100' : ''} ${className}`}
          {...props}
        />

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';

/**
 * Form Select Component
 */
export interface Option {
  label: string;
  value: string;
}

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Option[];
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, helperText, options, className = '', ...props }, ref) => {
    return (
      <div className="mb-4">
        {label && (
          <label className="form-label">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <select
          ref={ref}
          className={`form-input ${error ? 'border-red-500 focus:ring-red-100' : ''} ${className}`}
          {...props}
        >
          <option value="">Select an option...</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';

/**
 * Form Checkbox Component
 */
export interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const FormCheckbox = React.forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <div className="mb-4 flex items-center">
        <input
          ref={ref}
          type="checkbox"
          className={`h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer ${className}`}
          {...props}
        />
        {label && <label className="ml-2 text-sm text-gray-700 cursor-pointer">{label}</label>}
      </div>
    );
  }
);

FormCheckbox.displayName = 'FormCheckbox';
