import React, { useState } from 'react';
import Modal from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api';
import { useTranslation } from 'react-i18next';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError(t('change_password.passwords_not_match'));
      return;
    }
    if (!user) {
      setError(t('change_password.no_user'));
      return;
    }

    try {
      // Endpoint do zmiany hasła - upewnij się, że jest poprawny
      await api.put(`/change_password`, {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setSuccess(t('change_password.success'));

      setTimeout(() => {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
        setSuccess(''); // Wyczyść komunikat o sukcesie
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.detail || t('change_password.error'));
    }
  };

  // Reset stanu przy zamykaniu modala
  const handleClose = () => {
    setError('');
    setSuccess('');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('user_menu.change_password')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('change_password.old_password')}
          </label>
          <Input
            id="oldPassword"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('change_password.new_password')}
          </label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('change_password.confirm_new_password')}
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit">
            {t('user_menu.change_password')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}