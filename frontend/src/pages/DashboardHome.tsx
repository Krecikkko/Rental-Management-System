// frontend/src/pages/DashboardHome.tsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import api from "../api";
import {
  UsersIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  BanknotesIcon,
  HomeModernIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

// Definicje typów dla danych z API
interface AdminSummary {
  total_users: number;
  total_properties: number;
  total_invoices: number;
}

interface OwnerSummary {
  total_properties: number;
  total_tenants: number;
  total_costs: number; // <-- ZMIANA Z total_income
}

interface TenantSummary {
  active_tenancies: number;
  total_paid: number;
}

type SummaryData = AdminSummary | OwnerSummary | TenantSummary | null;

// Komponent karty statystyk
const StatCard = ({ title, value, icon, link }: { title: string, value: string | number, icon: React.ReactNode, link?: string }) => {
  const content = (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex items-center gap-6">
      <div className="bg-indigo-100 dark:bg-indigo-900/50 p-4 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );

  if (link) {
    return (
      <Link to={link} className="transition-transform duration-200 hover:-translate-y-1 block">
        {content}
      </Link>
    );
  }
  return content;
};

export default function DashboardHome() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<SummaryData>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchSummary = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const response = await api.get("/dashboard/summary");
        setSummary(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard summary:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, [user]);

  // Renderowanie panelu dla admina
  const renderAdminDashboard = () => {
    const data = summary as AdminSummary;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title={t('dashboard.sidebar_users')} value={data.total_users} link="/dashboard/users" icon={<UsersIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />} />
        <StatCard title={t('dashboard.sidebar_properties')} value={data.total_properties} link="/dashboard/properties" icon={<BuildingOfficeIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />} />
        <StatCard title={t('dashboard.sidebar_invoices')} value={data.total_invoices} link="/dashboard/invoices" icon={<DocumentTextIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />} />
      </div>
    );
  };

  // Renderowanie panelu dla właściciela
  const renderOwnerDashboard = () => {
    const data = summary as OwnerSummary;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title={t('dashboard.my_properties')} value={data.total_properties} link="/dashboard/properties" icon={<HomeModernIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />} />
        <StatCard title={t('dashboard.my_tenants')} value={data.total_tenants} link="/dashboard/properties" icon={<UsersIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />} />
        <StatCard
          title={t('dashboard.total_costs')} // <-- ZMIANA
          value={`${data.total_costs.toFixed(2)} PLN`} // <-- ZMIANA
          link="/dashboard/invoices"
          icon={<BanknotesIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />} // <-- ZMIANA IKONY
        />
      </div>
    );
  };

  // Renderowanie panelu dla najemcy
  const renderTenantDashboard = () => {
    const data = summary as TenantSummary;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title={t('dashboard.active_tenancies')} value={data.active_tenancies} icon={<BuildingOfficeIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />} />
        <StatCard title={t('dashboard.total_paid')} value={`${data.total_paid.toFixed(2)} PLN`} link="/dashboard/invoices" icon={<BanknotesIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />} />
      </div>
    );
  };

  // Główna funkcja renderująca zawartość
  const renderDashboardContent = () => {
    if (isLoading) {
      return <p className="text-center text-gray-500">{t('messages.loading')}</p>;
    }
    if (!summary) {
      return <p className="text-center text-red-500">{t('dashboard.load_data_error')}</p>;
    }

    switch (user?.role) {
      case "admin":
        return renderAdminDashboard();
      case "owner":
        return renderOwnerDashboard();
      case "tenant":
        return renderTenantDashboard();
      default:
        return <p>{t('dashboard.no_panel_for_role')}</p>;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {t('dashboard.welcome', { username: user?.username })}
      </h1>
      <div>
        {renderDashboardContent()}
      </div>
    </div>
  );
}