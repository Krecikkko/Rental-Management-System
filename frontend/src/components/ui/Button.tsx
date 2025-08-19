// frontend/src/components/UI/Button.tsx
import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  color?: "accent" | "light" | "dark" | "danger";
  variant?: "solid" | "outline";
};

export function Button({
  children,
  color = "accent",
  variant = "solid",
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses =
    "flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800";

  const colorConfig = {
    accent: {
      solid: "bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500",
      outline: "bg-transparent border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
    },
    danger: {
      solid: "bg-red-600 text-white hover:bg-red-500 focus:ring-red-500",
      outline: "bg-transparent border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20",
    },
    light: {
      solid: "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 focus:ring-gray-500",
      outline: "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800",
    },
    dark: {
      solid: "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900",
      outline: "bg-transparent border border-gray-900 text-gray-900 hover:bg-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-800",
    },
    // Dodaj więcej wariantów, jeśli potrzebujesz
  };
  
  const colorClasses = colorConfig[color]?.[variant] || colorConfig.accent.solid;

  return (
    <button
      {...props}
      className={`${baseClasses} ${colorClasses} ${className}`}
    >
      {children}
    </button>
  );
}