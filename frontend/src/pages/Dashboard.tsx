import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useTranslation } from "react-i18next";
import { HomeIcon, UserIcon, CogIcon } from "@heroicons/react/24/outline";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { label: "Home", href: "/dashboard", icon: <HomeIcon /> },
    { label: "Users", href: "/dashboard/users", icon: <UserIcon /> },
    { label: "Settings", href: "/dashboard/settings", icon: <CogIcon /> },
  ];


  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar items={navItems} logo=".../public/logo.png" />
    </div>
  );
}
