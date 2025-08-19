import React from 'react';

// Definiujemy typ propsów.
// Rozszerzamy standardowe atrybuty HTML dla elementu <input>,
// dzięki czemu możemy przekazywać np. `type`, `placeholder`, `name` itd.
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string; // Opcjonalna etykieta, która wyświetli się nad polem
  containerClassName?: string; // Dodatkowe klasy dla kontenera
};

export function Input({ label, id, containerClassName = "", ...props }: InputProps) {
  // Jeśli ID nie zostanie przekazane, użyjemy nazwy (name) jako ID dla etykiety
  const inputId = id || props.name;

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-800 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...props} // Przekazujemy wszystkie pozostałe propsy (value, onChange, etc.)
        className={`
          block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900
          shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2
          focus:ring-indigo-600 sm:text-sm
          dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200
          dark:placeholder:text-gray-500 dark:focus:ring-indigo-500
          transition-colors duration-200
          ${props.className || ''}
        `}
      />
    </div>
  );
}