// frontend/src/pages/Dashboard.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom"; // Dodano Outlet i useLocation
import { useAuth } from "../auth/AuthContext";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const { resolvedTheme } = useTheme();

  const logoSrc = resolvedTheme === 'dark' 
    ? "/logo-bg-none-text-white.png" 
    : "/logo-bg-none-text-indygo.png";

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar jest teraz stałym elementem layoutu dashboardu */}
      <Sidebar logo={logoSrc} />
      
      {/* Główna treść dashboardu będzie renderowana tutaj */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <Outlet /> {/* To tutaj React Router wyrenderuje zagnieżdżone komponenty (np. Properties) */}
      </main>
    </div>
  );
}