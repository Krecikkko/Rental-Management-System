import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  CogIcon,
  ChartBarIcon,
  UserCircleIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggleButton from "./ThemeToggleButton";
import { useAuth } from "../auth/AuthContext";
import ChangePasswordModal from "./ChangePasswordModal"; // Upewnij się, że ten import jest poprawny

// --- INTERFEJSY ---
interface SidebarItem { label: string; href: string; icon?: React.ReactNode; }
interface SidebarSection { title: string; items: SidebarItem[]; }
interface SidebarProps { logo?: string; }

export default function Sidebar({ logo }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sections: SidebarSection[] = [
    { title: t("dashboard.main_category"), items: [{ label: t("dashboard.sidebar_desktop"), href: "/dashboard", icon: <HomeIcon className="h-5 w-5" /> }] },
    { title: t("dashboard.managment_category"), items: [
        { label: t("dashboard.sidebar_properties"), href: "/dashboard/properties", icon: <BuildingOfficeIcon className="h-5 w-5" /> },
        { label: t("dashboard.sidebar_users"), href: "/dashboard/users", icon: <UsersIcon className="h-5 w-5" /> },
        { label: t("dashboard.sidebar_invoices"), href: "/dashboard/invoices", icon: <DocumentTextIcon className="h-5 w-5" /> },
    ]},
    { title: t("dashboard.report_settings_category"), items: [
        { label: t("dashboard.sidebar_stats"), href: "/dashboard/statistics", icon: <ChartBarIcon className="h-5 w-5" /> },
        { label: t("dashboard.sidebar_settings"), href: "/dashboard/settings", icon: <CogIcon className="h-5 w-5" /> },
    ]},
  ];

  return (
    <>
      <div className="flex flex-col h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 w-64">
        <Link to="/" className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
          {logo && <img src={logo} alt="Logo" className="h-10 object-contain" />}
        </Link>
        <nav className="flex-1 overflow-y-auto mt-4 px-2">
          {sections.map((section, index) => (
            <div key={index} className="mb-6 last:mb-0">
              <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{section.title}</h3>
              <ul className="mt-2 space-y-1">
                {section.items.map((item) => {
                  const active = location.pathname === item.href || (item.href !== "/dashboard" && location.pathname.startsWith(item.href));
                  return (
                    <li key={item.href}>
                      <Link to={item.href} className={`flex items-center p-2 rounded-md transition-colors duration-200 group ${active ? "bg-indigo-600 text-white shadow-md" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                        <div className={`mr-3 ${active ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"}`}>{item.icon}</div>
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="mt-auto p-2 border-t border-gray-200 dark:border-gray-700">
          {user ? (
            <div className="relative" ref={userMenuRef}>
              {isUserMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg mx-2 overflow-hidden z-10">
                  <ul className="text-sm text-gray-700 dark:text-gray-200">
                    <li><Link to="/dashboard/profile" className="flex items-center w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"><UserCircleIcon className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" /><span>{t('user_menu.my_profile')}</span></Link></li>
                    <li>
                      <button
                        onClick={() => {
                          setChangePasswordModalOpen(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <KeyIcon className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                        <span>{t('user_menu.change_password')}</span>
                      </button>
                    </li>
                    <li><button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" /><span>{t('user_menu.logout')}</span></button></li>
                  </ul>
                </div>
              )}
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="w-full flex items-center p-2 text-left rounded-md transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3 flex-1 overflow-hidden">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{user.username}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                </div>
                <ChevronUpIcon className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-0' : 'rotate-180'}`} />
              </button>
            </div>
          ) : (
            <div className="p-2 text-center text-sm text-gray-500">
              Brak zalogowanego użytkownika.
            </div>
          )}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <LanguageSwitcher direction="up"/>
            <ThemeToggleButton />
          </div>
        </div>
      </div>
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
      />
    </>
  );
}
