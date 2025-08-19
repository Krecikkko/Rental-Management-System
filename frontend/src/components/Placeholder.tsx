import { type ReactNode } from 'react';

interface PlaceholderProps {
  title: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export default function Placeholder({ title, icon, children }: PlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full text-gray-500 dark:text-gray-400">
      <div className="mb-4">
        {icon}
      </div>
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">{title}</h2>
      <p className="mt-2 max-w-md">
        {children || "Ta sekcja jest w budowie. Zapraszamy wkrótce po więcej funkcjonalności!"}
      </p>
    </div>
  );
}