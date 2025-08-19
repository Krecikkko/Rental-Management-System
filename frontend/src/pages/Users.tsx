import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PlusIcon, PencilIcon, TrashIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import Modal from "../components/ui/Modal";
import api from "../api";

interface User {
  id: number;
  username: string;
  role: 'admin' | 'owner' | 'tenant';
}

const initialFormData = { username: "", password: "", role: "tenant" as User['role'] };
const ROLES = [
  { value: "tenant", label: "Tenant" },
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
];

export default function Users() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState(initialFormData);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<User[]>("/users/");
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(t("users.fetch_error"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [t]);

  // Modal Handlers
  const openAddModal = () => {
    setModalMode('add');
    setSelectedUser(null);
    setFormData(initialFormData);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({ username: user.username, role: user.role, password: "" });
    setError(null);
    setIsModalOpen(true);
  };
  
  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (modalMode === 'add') {
        await api.post("/users/", formData);
      } else if (selectedUser) {
        // Przy edycji wysyłamy tylko username i role
        const { username, role } = formData;
        await api.put(`/users/${selectedUser.id}`, { username, role });
      }
      await fetchUsers();
      closeModal();
    } catch (err: any) {
      setError(err.response?.data?.detail || t("errors.unknown"));
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    try {
      await api.delete(`/users/${selectedUser.id}`);
      await fetchUsers();
      closeModal();
    } catch (err: any) {
      alert(err.response?.data?.detail || t("users.delete_error"));
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("users.title")}</h1>
          <Button color="accent" className="w-auto" onClick={openAddModal}>
            <PlusIcon className="h-5 w-5 mr-2" />{t("users.add_new")}
          </Button>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('users.table_user')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('users.table_role')}</th>
                <th className="relative px-6 py-3"><span className="sr-only">{t('users.table_actions')}</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white flex items-center gap-3">
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' :
                      user.role === 'owner' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>{t(`roles.${user.role}`)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => openEditModal(user)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 transition"><PencilIcon className="h-5 w-5" /></button>
                    <button onClick={() => openDeleteModal(user)} className="text-red-600 hover:text-red-900 dark:text-red-400 transition"><TrashIcon className="h-5 w-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modals */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={modalMode === 'add' ? t('users.modal_add_title') : t('users.modal_edit_title')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 text-sm rounded-lg bg-red-100 text-red-700">{error}</div>}
          <Input label={t('users.form_username')} name="username" value={formData.username} onChange={handleFormChange} required />
          {modalMode === 'add' && (
            <Input label={t('users.form_password')} name="password" type="password" value={formData.password} onChange={handleFormChange} required />
          )}
          <Select label={t('users.form_role')} name="role" value={formData.role} onChange={handleFormChange} options={ROLES} />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" color="light" onClick={closeModal}>{t('common.cancel')}</Button>
            <Button type="submit" color="accent">{t('common.save')}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={closeModal} title={t('users.modal_delete_title')}>
        <p>{t('users.delete_confirm', { username: selectedUser?.username })}</p>
        <div className="flex justify-end gap-3 pt-6">
          <Button type="button" color="light" onClick={closeModal}>{t('common.cancel')}</Button>
          <Button type="button" color="danger" onClick={handleConfirmDelete}>{t('common.delete')}</Button>
        </div>
      </Modal>
    </>
  );
}