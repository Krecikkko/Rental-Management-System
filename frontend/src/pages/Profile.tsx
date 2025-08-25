import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Profile() {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user) {
    return <div>{t('profile.must_be_logged_in')}</div>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t('profile.title')}
      </h1>
      <div className="mt-6 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('profile.username')}</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{user.username}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('profile.email')}</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{user.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('profile.user_id')}</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{user.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}