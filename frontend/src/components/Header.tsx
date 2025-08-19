import { Link, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggleButton from "./ThemeToggleButton"; // Import nowego komponentu
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function Header() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false); // user dropdown
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // mobile nav
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: t("app.home"), href: "/" },
    { label: t("app.dashboard"), href: "/dashboard" },
  ];

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-md dark:bg-gray-800"
          : "bg-gray-50 dark:bg-gray-900"
      }`}
    >
      <div className="mx-auto px-6 flex justify-between items-center h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/logo-text-removebg.png"
            alt="Logo"
            className="h-10 object-contain"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 relative">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`transition font-medium ${
                location.pathname === item.href
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-gray-700 hover:text-indigo-500 dark:text-gray-300 dark:hover:text-indigo-400"
              }`}
            >
              {item.label}
            </Link>
          ))}

          <LanguageSwitcher />

          {/* 🌙 Theme toggle button */}
          <ThemeToggleButton /> {/* Użycie nowego komponentu */}

          {/* Avatar + dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold hover:bg-indigo-200 transition"
            >
              {user ? user.username?.[0]?.toUpperCase() : "?"}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                {user ? (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 font-medium">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                        {user.username?.[0]?.toUpperCase()}
                      </div>
                      <span>{user.username}</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700" />
                    <ul className="py-1">
                      <li>
                        <button
                          onClick={() => logout()}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-600/30"
                        >
                          {t("login.logout")}
                        </button>
                      </li>
                    </ul>
                  </>
                ) : (
                  <div className="py-2">
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-600/30"
                    >
                      {t("login.sign_in")}
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-600/30"
                    >
                      {t("login.sign_up")}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          <Bars3Icon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
        </button>
      </div>

      {/* Mobile menu drawer */}
      <div
        className={`fixed inset-0 z-50 flex transition ${
          mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* Overlay z blur */}
        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Drawer */}
        <div
          className={`relative w-64 bg-white dark:bg-gray-900 shadow-xl h-full p-6 flex flex-col transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-md hover:bg-gray-200 transition"
          >
            <XMarkIcon className="h-6 w-6 text-gray-700" />
          </button>

          <Link to="/" className="flex items-center gap-2 mb-6">
            <img
              src="/logo-text-removebg.png"
              alt="Logo"
              className="h-10 object-contain"
            />
          </Link>

          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`transition font-medium ${
                  location.pathname === item.href
                    ? "text-indigo-600"
                    : "text-gray-700 dark:text-gray-400 hover:text-indigo-500"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto">
            <LanguageSwitcher />
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
              >
                {t("login.logout")}
              </button>
            ) : (
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2 rounded-md border border-gray-300 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {t("login.sign_in")}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
                >
                  {t("login.sign_up")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}