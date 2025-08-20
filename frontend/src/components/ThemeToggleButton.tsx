import React, { useState, useEffect } from "react";
import { SunIcon, MoonIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline";

type Theme = "light" | "dark" | "system";

export default function ThemeToggleButton() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system';
    return (localStorage.getItem("theme") as Theme) || "system";
  });

  // Efekt do zmiany klasy na <html> i zapisu w localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    
    root.classList.remove(isDark ? "light" : "dark");
    root.classList.add(isDark ? "dark" : "light");
    
    localStorage.setItem("theme", theme);
  }, [theme]);
  
  // Efekt do nasłuchiwania na zmiany systemowe
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
        if(theme === 'system') {
            // Wymusza ponowne uruchomienie useEffect powyżej
            setTheme('system'); 
        }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      title={`Zmień motyw (aktualny: ${theme})`}
    >
      {theme === "light" && <SunIcon className="h-5 w-5 text-yellow-500" />}
      {theme === "dark" && <MoonIcon className="h-5 w-5 text-indigo-400" />}
      {theme === "system" && <ComputerDesktopIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />}
    </button>
  );
}
