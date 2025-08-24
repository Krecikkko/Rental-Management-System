// frontend/src/pages/TagManagement.tsx

import { useEffect, useState } from 'react';
import api from '../api';
import { Button } from '../components/ui/Button';
import { TrashIcon, TagIcon } from '@heroicons/react/24/outline';

interface Tag {
  id: number;
  name: string;
}

export default function TagManagement() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<Tag[]>('/tags/');
      setTags(response.data);
    } catch (err) {
      setError('Nie udało się załadować tagów.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleDelete = async (tagId: number, tagName: string) => {
    if (window.confirm(`Czy na pewno chcesz usunąć tag "${tagName}"? Zostanie on usunięty ze wszystkich faktur.`)) {
      try {
        await api.delete(`/tags/${tagId}`);
        // Po usunięciu odśwież listę
        setTags(prevTags => prevTags.filter(tag => tag.id !== tagId));
      } catch (err) {
        alert('Nie udało się usunąć tagu.');
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Zarządzanie Tagami</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        {isLoading && <p className="p-4">Ładowanie...</p>}
        {error && <p className="p-4 text-red-500">{error}</p>}
        {!isLoading && !error && (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {tags.length > 0 ? tags.map(tag => (
              <li key={tag.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TagIcon className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-gray-800 dark:text-gray-200">{tag.name}</span>
                </div>
                <Button
                  color="danger"
                  variant="outline"
                  className="!py-1 !px-2 w-auto"
                  onClick={() => handleDelete(tag.id, tag.name)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </li>
            )) : <p className="text-center text-gray-500 py-6">Brak zdefiniowanych tagów.</p>}
          </ul>
        )}
      </div>
    </div>
  );
}