import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  color?: "accent" | "light" | "dark";
};

export function Button({
  children,
  color = "accent",
  className = "",
  ...props
}: ButtonProps) {
  let baseClasses =
    "flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm transition focus:outline-2 focus:outline-offset-2";

  let colorClasses = "";
  switch (color) {
    case "accent":
      colorClasses =
        "bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-indigo-600";
      break;
    case "light":
      colorClasses =
        "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:outline-gray-400";
      break;
    case "dark":
      colorClasses =
        "bg-gray-700 text-gray-100 hover:bg-gray-600 focus:outline-gray-500";
      break;
  }

  return (
    <button
      {...props}
      className={`${baseClasses} ${colorClasses} ${className}`}
    >
      {children}
    </button>
  );
}
