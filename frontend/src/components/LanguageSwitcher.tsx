import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "pl", label: "Polski", flag: "🇵🇱" },
];

// NOWOŚĆ: Definicja propsów komponentu
interface LanguageSwitcherProps {
  direction?: 'up' | 'down';
}

// NOWOŚĆ: Komponent akceptuje props 'direction' z domyślną wartością 'down'
export default function LanguageSwitcher({ direction = 'down' }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const current = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  useEffect(() => {
    // ... (reszta logiki bez zmian)
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // NOWOŚĆ: Dynamiczne klasy CSS w zależności od kierunku
  const dropdownPositionClass = direction === 'up'
    ? 'bottom-full mb-2' // Otwieraj w górę
    : 'mt-2';            // Otwieraj w dół (domyślnie)

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div 
          className={`absolute right-0 w-36 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-50 ${dropdownPositionClass}`}
        >
          <ul className="py-1">
            {LANGUAGES.map((lang) => (
              <li key={lang.code}>
                <button
                  onClick={() => changeLanguage(lang.code)}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-indigo-50 dark:hover:bg-gray-700 ${
                    current.code === lang.code
                      ? "text-indigo-600 font-semibold"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}