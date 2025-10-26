import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: React.FC<InputProps> = ({ label, id, className, ...props }) => {
  const baseClasses = "w-full bg-brand-dark/50 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-orange focus:border-transparent focus:bg-brand-surface transition-all duration-200 shadow-inner shadow-black/20";
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-brand-gray mb-2">
        {label}
      </label>
      <input
        id={id}
        className={`${baseClasses} ${className || ''}`.trim()}
        {...props}
      />
    </div>
  );
};

export default Input;
