import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import { useRef } from "react";
import api from "../api";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  // dropdown state
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const navItems = [
    { label: t("app.home"), href: "/" },
    { label: t("app.dashboard"), href: "/dashboard" },
  ];

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-md" : "bg-gray-50"
        }`}
    >
      <div className="mx-auto max-w-screen-xl px-6 flex justify-between items-center h-16">
        {/* Logo + Title */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/logo-text-removebg.png"
            alt="Logo"
            className="h-10 object-contain"
          />
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6 relative">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`transition font-medium ${location.pathname === item.href
                ? "text-indigo-600"
                : "text-gray-700 hover:text-indigo-500"
                }`}
            >
              {item.label}
            </Link>
          ))}

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* User dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold hover:bg-indigo-200 transition"
            >
              {user ? user.username?.[0]?.toUpperCase() : "?"}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                {user ? (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 font-medium">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                        {user.username?.[0]?.toUpperCase()}
                      </div>
                      <span>{user.username}</span>
                    </div>
                    <div className="border-t border-gray-200" />
                    <ul className="py-1">
                      <li>
                        <button
                          onClick={() => {
                            setShowPasswordModal(true);
                            setMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                        >
                          {t("login.change_password")}
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            logout();
                            setMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
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
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                    >
                      {t("login.sign_in")}
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                    >
                      {t("login.sign_up")}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Modal to change password */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold">Zmień hasło</h2>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <input
              type="password"
              placeholder="Nowe hasło"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />

            <input
              type="password"
              placeholder="Powtórz hasło"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 rounded-md border border-gray-300 text-sm"
              >
                Anuluj
              </button>
              <button
                disabled={loading}
                onClick={async () => {
                  if (!newPassword) {
                    setError("Hasło nie może być puste");
                    return;
                  }
                  if (newPassword !== confirmPassword) {
                    setError("Hasła nie są takie same");
                    return;
                  }

                  setLoading(true);
                  setError(null);
                  setSuccess(null);
                  try {
                    await api.put("/change-password", null, {
                      params: { new_password: newPassword },
                    });
                    setSuccess("Hasło zostało zmienione ✅");
                    setNewPassword("");
                    setConfirmPassword("");
                    setTimeout(() => setShowPasswordModal(false), 1500);
                  } catch (err: any) {
                    setError(
                      err.response?.data?.detail || "Błąd przy zmianie hasła"
                    );
                  } finally {
                    setLoading(false);
                  }
                }}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-500 disabled:opacity-50"
              >
                {loading ? "Zapisywanie..." : "Zapisz"}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
