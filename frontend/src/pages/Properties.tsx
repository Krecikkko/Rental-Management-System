// frontend/src/pages/Properties.tsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { Button } from "../components/ui/Button";
import { Input } from "../components/UI";
import Modal from "../components/ui/Modal";
import api from "../api";
import { useAuth } from "../auth/AuthContext";

interface Property {
  id: number;
  name: string;
  address: string;
  owner_id: number | null;
}

const initialFormData = { name: "", address: "", owner_id: "" };

export default function Properties() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<Property[]>("/properties/");
      setProperties(response.data);
    } catch (err) {
      console.error("Failed to fetch properties:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Handlers for Add/Edit Modal
  const openAddModal = () => {
    setModalMode("add");
    setSelectedProperty(null);
    setFormData(initialFormData);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (property: Property) => {
    setModalMode("edit");
    setSelectedProperty(property);
    setFormData({
      name: property.name,
      address: property.address,
      owner_id: property.owner_id?.toString() || "",
    });
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      name: formData.name,
      address: formData.address,
      owner_id: formData.owner_id ? parseInt(formData.owner_id) : null,
    };

    try {
      if (modalMode === "add") {
        await api.post("/properties/add", payload);
      } else if (selectedProperty) {
        await api.put(`/properties/update/${selectedProperty.id}`, payload);
      }
      fetchProperties();
      closeModal();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Wystąpił nieznany błąd.");
    }
  };

  // Handlers for Delete Modal
  const openDeleteModal = (property: Property) => {
    setSelectedProperty(property);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProperty) return;
    try {
      await api.delete(`/properties/remove/${selectedProperty.id}`);
      fetchProperties();
      closeModal();
    } catch (err) {
      alert(t("errors.delete_property_error"));
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("properties.title")}
          </h1>
          {user?.role === 'admin' && (
            <Button color="accent" className="w-auto" onClick={openAddModal}>
              <PlusIcon className="h-5 w-5 mr-2" />
              {t("properties.add_new")}
            </Button>
          )}
        </div>

        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  {t("properties.table_name")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  {t("properties.table_address")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  {t("properties.table_owner")}
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">
                    {t("properties.table_actions")}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {properties.map((prop) => (
                <tr
                  key={prop.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {prop.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {prop.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {prop.owner_id || t("properties.no_owner")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link
                      to={`/dashboard/properties/${prop.id}`}
                      className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition inline-flex items-center gap-1"
                    >
                      <EyeIcon className="h-5 w-5" />
                      {t("common.manage")}
                    </Link>
                    {user?.role === 'admin' && (
                    <>
                    <button
                      onClick={() => openEditModal(prop)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(prop)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                    </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          modalMode === "add"
            ? "Dodaj nową nieruchomość"
            : "Edytuj nieruchomość"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm border rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}
          <Input
            label="Nazwa"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            required
          />
          <Input
            label="Adres"
            name="address"
            value={formData.address}
            onChange={handleFormChange}
            required
          />
          <Input
            label="ID Właściciela (opcjonalnie)"
            name="owner_id"
            type="number"
            value={formData.owner_id}
            onChange={handleFormChange}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              color="light"
              className="w-auto"
              onClick={closeModal}
            >
              Anuluj
            </Button>
            <Button type="submit" color="accent" className="w-auto">
              Zapisz
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeModal}
        title="Potwierdź usunięcie"
      >
        <p className="text-gray-600 dark:text-gray-300">
          Czy na pewno chcesz usunąć nieruchomość "{selectedProperty?.name}"?
          Tej operacji nie można cofnąć.
        </p>
        <div className="flex justify-end gap-3 pt-6">
          <Button
            type="button"
            color="light"
            className="w-auto"
            onClick={closeModal}
          >
            Anuluj
          </Button>
          <Button
            type="button"
            color="danger"
            className="w-auto"
            onClick={handleConfirmDelete}
          >
            Usuń
          </Button>
        </div>
      </Modal>
    </>
  );
}