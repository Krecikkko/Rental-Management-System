import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  CogIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next"; 

interface SidebarItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface SidebarProps {
  logo?: string;
}

export default function Sidebar({ logo }: SidebarProps) {
  const location = useLocation();
  const { t } = useTranslation();

  const sections: SidebarSection[] = [
    {
      title: t("dashboard.main_category"),
      items: [
        { label: "Pulpit", href: "/dashboard", icon: <HomeIcon className="h-5 w-5" /> },
      ],
    },
    {
      title: t("dashboard.managment_category"),
      items: [
        { label: "Nieruchomości", href: "/properties", icon: <BuildingOfficeIcon className="h-5 w-5" /> },
        { label: "Użytkownicy", href: "/users", icon: <UsersIcon className="h-5 w-5" /> },
        { label: "Faktury", href: "/invoices", icon: <DocumentTextIcon className="h-5 w-5" /> },
      ],
    },
    {
      title: t("dashboard.report_settings_category"),
      items: [
        { label: "Statystyki", href: "/statistics", icon: <ChartBarIcon className="h-5 w-5" /> },
        { label: "Ustawienia", href: "/settings", icon: <CogIcon className="h-5 w-5" /> },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 w-64">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-800">
        {logo && (
          <img
            src={logo}
            alt="Logo"
            className="h-10 object-contain"
          />
        )}
      </div>

      {/* Menu Sections */}
      <nav className="flex-1 overflow-y-auto mt-4 px-2">
        {sections.map((section, index) => (
          <div key={index} className="mb-6 last:mb-0">
            <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {section.title}
            </h3>
            <ul className="mt-2 space-y-1">
              {section.items.map((item) => {
                const active = location.pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={`flex items-center p-2 rounded-md transition-colors duration-200
                        ${active
                          ? "bg-indigo-600 text-white shadow-md"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }
                      `}
                    >
                      <div className={`mr-3 ${active ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-indigo-600"}`}>
                        {item.icon}
                      </div>
                      <span className="font-medium">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
