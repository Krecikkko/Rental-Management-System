// frontend/src/pages/Dashboard.tsx
import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";
import { Bars3Icon } from "@heroicons/react/24/outline";

export default function Dashboard() {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Stan do zarządzania widocznością sidebara

  const logoSrc = resolvedTheme === 'dark' 
    ? "/logo-bg-none-text-white.png" 
    : "/logo-bg-none-text-indygo.png";

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="relative flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - teraz z logiką do chowania na mobile */}
      <Sidebar logo={logoSrc} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Główna treść */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Przycisk "hamburger" widoczny tylko na małych ekranach */}
        <button 
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 mb-4 rounded-md text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <Outlet />
      </main>
    </div>
  );
}