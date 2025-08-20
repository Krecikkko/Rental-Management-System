import React from 'react';
import { useAuth } from '../auth/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return <div>Musisz być zalogowany, aby zobaczyć tę stronę.</div>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Profil Użytkownika
      </h1>
      <div className="mt-6 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nazwa użytkownika</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{user.username}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Adres e-mail</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{user.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ID Użytkownika</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{user.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
