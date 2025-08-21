// frontend/src/components/ThemeToggleButton.tsx

import { SunIcon, MoonIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../context/ThemeContext"; // Używamy Twojego hooka

export default function ThemeToggleButton() {
  // Pobieramy stan i funkcje z globalnego kontekstu
  const { theme, toggleTheme } = useTheme();

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