import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { LanguageIcon } from "@heroicons/react/24/outline";

// Interfejs propsów, aby określić kierunek otwierania menu
interface LanguageSwitcherProps {
  direction?: 'up' | 'down';
}

export default function LanguageSwitcher({ direction = 'down' }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Funkcja do zmiany języka i zamknięcia menu
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };
  
  // Efekt do zamykania menu po kliknięciu poza jego obszarem
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  // Dynamiczne pozycjonowanie menu w zależności od propsa 'direction'
  const dropdownPositionClass = direction === 'up' ? 'bottom-full mb-1' : 'top-full mt-1';

  return (
    <div className="relative" ref={menuRef}>
      {/* Przycisk główny pokazujący ikonę i aktualny język */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center p-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <LanguageIcon className="h-5 w-5 mr-1" />
        {i18n.language.toUpperCase()}
      </button>

      {/* Rozwijane menu */}
      {isOpen && (
        <div className={`absolute ${dropdownPositionClass} left-0 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg z-20 overflow-hidden`}>
          <ul className="text-sm">
            <li>
              <button 
                onClick={() => changeLanguage('pl')} 
                className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Polski
              </button>
            </li>
            <li>
              <button 
                onClick={() => changeLanguage('en')} 
                className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                English
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
