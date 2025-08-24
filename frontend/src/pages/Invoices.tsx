// frontend/src/pages/Invoices.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PlusIcon, TrashIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { Button } from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import api from "../api";
import { useAuth } from "../auth/AuthContext";

// --- Definicje typów ---
interface Invoice {
  id: number;
  amount: number;
  issue_date: string;
  description: string;
  file_path: string;
  property_id: number;
}
interface Property {
  id: number;
  name: string;
}

const initialFormData = {
  property_id: "",
  issue_date: new Date().toISOString().split("T")[0],
  description: "",
  amount: "",
  file: null as File | null,
};

export default function Invoices() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");

  // Stany modali i formularzy
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      if (user?.role === 'admin' || user?.role === 'owner') {
        const propRes = await api.get<Property[]>("/properties/");
        setProperties(propRes.data);
        if (propRes.data.length > 0) {
          const firstId = String(propRes.data[0].id);
          setSelectedPropertyId(firstId);
          setFormData(prev => ({ ...prev, property_id: firstId}));
        }
      }
      if (user?.role === 'admin') {
        const summaryRes = await api.get<Record<string, number>>("/invoices/summary/monthly");
        setSummary(summaryRes.data);
      }
    } catch (err) {
      console.error(err);
      setError("Nie udało się załadować danych.");
    }
  };

  const fetchInvoicesForProperty = async (propertyId: string) => {
    if (!propertyId) return;
    try {
      const invRes = await api.get<Invoice[]>(`/invoices/property/${propertyId}`);
      setInvoices(invRes.data);
    } catch (err) {
      console.error(err);
      setInvoices([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  useEffect(() => {
    fetchInvoicesForProperty(selectedPropertyId);
  }, [selectedPropertyId]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.file || !formData.property_id || !formData.amount) {
        setError("Proszę wypełnić wszystkie pola i dodać plik.");
        return;
    }
    
    const apiFormData = new FormData();
    apiFormData.append("property_id", formData.property_id);
    apiFormData.append("issue_date", formData.issue_date);
    apiFormData.append("description", formData.description);
    apiFormData.append("amount", formData.amount);
    apiFormData.append("file", formData.file);

    try {
        await api.post("/invoices/upload", apiFormData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        setIsModalOpen(false);
        setFormData(initialFormData);
        fetchInvoicesForProperty(selectedPropertyId);
    } catch(err: any) {
        setError(err.response?.data?.detail || "Błąd podczas przesyłania faktury.");
    }
  };
  
  const handleDelete = async (invoiceId: number) => {
    if (window.confirm("Czy na pewno chcesz usunąć tę fakturę?")) {
        try {
            await api.delete(`/invoices/${invoiceId}`);
            fetchInvoicesForProperty(selectedPropertyId);
        } catch (err) {
            alert("Nie udało się usunąć faktury.");
        }
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Zarządzanie Fakturami</h1>
          {user?.role !== 'tenant' && (
            <Button color="accent" onClick={() => setIsModalOpen(true)}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Dodaj Fakturę
            </Button>
          )}
        </div>

        {user?.role === 'admin' && Object.keys(summary).length > 0 && (
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">Podsumowanie miesięczne (PLN)</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(summary).map(([month, total]) => (
                      <div key={month} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                          <p className="font-bold text-gray-800 dark:text-white">{month}</p>
                          <p className="text-indigo-600 dark:text-indigo-400">{total.toFixed(2)}</p>
                      </div>
                  ))}
              </div>
          </div>
        )}

        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
          {(user?.role === 'admin' || user?.role === 'owner') && (
             <Select
                label="Wybierz nieruchomość"
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                options={properties.map(p => ({ value: p.id, label: p.name }))}
              />
          )}
          
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Opis</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Kwota</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Akcje</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {invoices.length > 0 ? invoices.map(inv => (
                <tr key={inv.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{inv.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(inv.issue_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono">{inv.amount.toFixed(2)} PLN</td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-4">
                        <a href={`${api.defaults.baseURL}/${inv.file_path.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-gray-500 hover:text-indigo-600">
                            <DocumentArrowDownIcon className="h-5 w-5" />
                        </a>
                        {user?.role !== 'tenant' && (
                            <button onClick={() => handleDelete(inv.id)}>
                                <TrashIcon className="h-5 w-5 text-red-500 hover:text-red-700" />
                            </button>
                        )}
                    </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">Brak faktur dla wybranej nieruchomości.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Dodaj nową fakturę">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
          <Select
            label="Nieruchomość"
            name="property_id"
            value={formData.property_id}
            onChange={handleFormChange}
            options={properties.map(p => ({ value: p.id, label: p.name }))}
          />
          <Input label="Opis" name="description" value={formData.description} onChange={handleFormChange} required />
          <Input label="Kwota (np. 123.45)" name="amount" type="number" step="0.01" value={formData.amount} onChange={handleFormChange} required />
          <Input label="Data wystawienia" type="date" name="issue_date" value={formData.issue_date} onChange={handleFormChange} required />
          <Input label="Plik faktury" type="file" onChange={handleFileChange} required />
          <div className="flex justify-end gap-3 pt-4">
              <Button type="button" color="light" onClick={() => setIsModalOpen(false)}>Anuluj</Button>
              <Button type="submit" color="accent">Zapisz</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}