import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

interface SidebarItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  items: SidebarItem[];
  logo?: string;
}

export default function Sidebar({ items, logo }: SidebarProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`flex flex-col h-screen bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
        {logo && (
          <img
            src={logo}
            alt="Logo"
            className={`h-10 object-contain transition-all duration-300 ${collapsed ? "hidden" : "block"}`}
          />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
        >
          {collapsed ? "➡️" : "⬅️"}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto mt-4">
        {items.map((item) => {
          const active = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-2 mx-2 rounded-md transition-colors
                ${active ? "bg-indigo-100 dark:bg-indigo-600 text-indigo-700 dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"}
              `}
            >
              {item.icon && <span className="text-lg">{item.icon}</span>}
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
