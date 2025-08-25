import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface PlaceholderProps {
  title: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export default function Placeholder({ title, icon, children }: PlaceholderProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center text-center h-full text-gray-500 dark:text-gray-400">
      <div className="mb-4">
        {icon}
      </div>
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">{title}</h2>
      <p className="mt-2 max-w-md">
        {children || t('placeholder.under_construction')}
      </p>
    </div>
  );
}