import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
  ];

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-gray-50"
      }`}
    >
      <div className="mx-auto max-w-screen-xl px-6 flex justify-between items-center h-16">
        {/* Logo + Title */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-10 object-contain"
          />
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`transition font-medium ${
                location.pathname === item.href
                  ? "text-indigo-600"
                  : "text-gray-700 hover:text-indigo-500"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
