import React from 'react';

type SelectOption = {
  value: string | number;
  label: string;
};

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: SelectOption[];
};

export function Select({ label, options, ...props }: SelectProps) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-900 dark:text-gray-400">{label}</label>}
      <select
        {...props}
        className="block w-full rounded-md border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-400 placeholder-gray-400 shadow-sm text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:outline-none sm:text-base"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}