// frontend/src/pages/Invoices.tsx

import { useEffect, useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { PlusIcon, TrashIcon, DocumentArrowDownIcon, PencilSquareIcon, EyeIcon } from "@heroicons/react/24/outline";
import { Button } from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import api from "../api";
import { useAuth } from "../auth/AuthContext";

// --- Definicje typów ---
interface Tag { id: number; name: string; }
interface PropertyBrief { id: number; name: string; address: string; }
interface Invoice {
  id: number;
  amount: number;
  issue_date: string;
  description: string;
  file_path: string;
  property_id: number;
  tags: Tag[];
  property: PropertyBrief;
}
interface Property { id: number; name: string; }
type GroupedInvoices = { [month: string]: Invoice[] };
type TenantGroupedInvoices = { [propertyName: string]: GroupedInvoices };

const initialFormData = {
  property_id: "",
  issue_date: new Date().toISOString().split("T")[0],
  description: "",
  amount: "",
  new_tags: "",
  file: null as File | null,
};

export default function Invoices() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Stany danych
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [propertyTags, setPropertyTags] = useState<string[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stany dla modali
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditTagsModalOpen, setEditTagsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  
  const [formData, setFormData] = useState(initialFormData);
  const [selectedExistingTags, setSelectedExistingTags] = useState<Set<string>>(new Set());
  const [newTagsInput, setNewTagsInput] = useState("");

  const reloadCurrentView = useCallback(async () => {
    if (!user) return;
    try {
      if (user.role === 'tenant') {
          const invRes = await api.get<Invoice[]>('/invoices/my');
          setInvoices(invRes.data);
      } else if (selectedPropertyId) {
          const [invRes, summaryRes, tagsRes] = await Promise.all([
              api.get<Invoice[]>(`/invoices/property/${selectedPropertyId}`),
              api.get<Record<string, number>>(`/invoices/summary/monthly/${selectedPropertyId}`),
              api.get<string[]>(`/invoices/tags/property/${selectedPropertyId}`),
          ]);
          setInvoices(invRes.data);
          setSummary(summaryRes.data);
          setPropertyTags(tagsRes.data);
      }
    } catch (err) {
      console.error("Failed to reload view:", err);
      setError("Nie udało się odświeżyć danych.");
    }
  }, [user, selectedPropertyId]);

  useEffect(() => {
    const loadData = async () => {
        if (!user) return;

        setIsLoading(true);
        setError(null);

        try {
            if (user.role === 'tenant') {
                const invRes = await api.get<Invoice[]>('/invoices/my');
                setInvoices(invRes.data);
            } else {
                let currentProperties = properties;
                if (currentProperties.length === 0) {
                    const propRes = await api.get<Property[]>("/properties/");
                    setProperties(propRes.data);
                    currentProperties = propRes.data;
                }

                let propertyIdToFetch = selectedPropertyId;
                if (!propertyIdToFetch && currentProperties.length > 0) {
                    propertyIdToFetch = String(currentProperties[0].id);
                    setSelectedPropertyId(propertyIdToFetch);
                }

                if (propertyIdToFetch) {
                    const [invRes, summaryRes, tagsRes] = await Promise.all([
                        api.get<Invoice[]>(`/invoices/property/${propertyIdToFetch}`),
                        api.get<Record<string, number>>(`/invoices/summary/monthly/${propertyIdToFetch}`),
                        api.get<string[]>(`/invoices/tags/property/${propertyIdToFetch}`),
                    ]);
                    setInvoices(invRes.data);
                    setSummary(summaryRes.data);
                    setPropertyTags(tagsRes.data);
                } else {
                    setInvoices([]);
                    setSummary({});
                    setPropertyTags([]);
                }
            }
        } catch (err) {
            console.error("Failed to load data:", err);
            setError("Wystąpił błąd podczas ładowania danych.");
            setInvoices([]);
        } finally {
            setIsLoading(false);
        }
    };

    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedPropertyId]);

  const groupedInvoices = useMemo(() => {
    const filtered = selectedTag
      ? invoices.filter(inv => inv.tags.some(tag => tag.name === selectedTag))
      : invoices;
    
    if (user?.role !== 'tenant') {
      return filtered.reduce((acc, inv) => {
        const month = new Date(inv.issue_date).toLocaleString('pl-PL', { month: 'long', year: 'numeric' });
        if (!acc[month]) acc[month] = [];
        acc[month].push(inv);
        return acc;
      }, {} as GroupedInvoices);
    }

    return filtered.reduce((acc, inv) => {
      const propertyName = inv.property ? `${inv.property.name} (${inv.property.address})` : "Nieruchomość nieznana";
      const month = new Date(inv.issue_date).toLocaleString('pl-PL', { month: 'long', year: 'numeric' });
      
      if (!acc[propertyName]) acc[propertyName] = {};
      if (!acc[propertyName][month]) acc[propertyName][month] = [];
      
      acc[propertyName][month].push(inv);
      return acc;
    }, {} as TenantGroupedInvoices);

  }, [invoices, selectedTag, user?.role]);
  
  const handleOpenAddModal = () => {
    setFormData(prev => ({ ...initialFormData, property_id: selectedPropertyId }));
    setSelectedExistingTags(new Set());
    setNewTagsInput("");
    setError(null);
    setAddModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.file || !formData.property_id || !formData.amount) {
        setError("Proszę wypełnić wszystkie wymagane pola i dodać plik.");
        return;
    }
    
    const combinedTags = [...Array.from(selectedExistingTags), ...newTagsInput.split(',').map(t => t.trim()).filter(Boolean)].join(',');
    
    const apiFormData = new FormData();
    apiFormData.append("property_id", formData.property_id);
    apiFormData.append("issue_date", formData.issue_date);
    apiFormData.append("description", formData.description);
    apiFormData.append("amount", formData.amount);
    apiFormData.append("tags", combinedTags);
    apiFormData.append("file", formData.file);

    try {
        await api.post("/invoices/upload", apiFormData, { headers: { "Content-Type": "multipart/form-data" } });
        setAddModalOpen(false);
        await reloadCurrentView();
    } catch(err: any) {
        setError(err.response?.data?.detail || "Błąd podczas przesyłania faktury.");
    }
  };

  const handleOpenEditTagsModal = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    const currentTags = new Set(invoice.tags.map(t => t.name));
    setSelectedExistingTags(currentTags);
    setNewTagsInput("");
    setError(null);
    setEditTagsModalOpen(true);
  };

  const handleEditTagsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;

    setError(null);
    const combinedTags = [
      ...Array.from(selectedExistingTags),
      ...newTagsInput.split(',').map(t => t.trim()).filter(Boolean)
    ].join(',');

    try {
      await api.put(`/invoices/invoices/${editingInvoice.id}/tags`, { tags: combinedTags });
      setEditTagsModalOpen(false);
      await reloadCurrentView();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Błąd podczas aktualizacji tagów.");
    }
  };

  const handleTagCheckboxChange = (tagName: string) => {
    setSelectedExistingTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tagName)) newSet.delete(tagName);
      else newSet.add(tagName);
      return newSet;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDelete = async (invoiceId: number) => {
    if (window.confirm("Czy na pewno chcesz usunąć tę fakturę?")) {
      try {
        await api.delete(`/invoices/${invoiceId}`);
        await reloadCurrentView();
      } catch (err) {
        alert("Nie udało się usunąć faktury.");
        console.error("Deletion failed:", err);
      }
    }
  };
  
  const handlePreviewPdf = async (invoiceId: number) => {
    try {
      const response = await api.get(`/invoices/view/${invoiceId}`, {
        responseType: 'blob',
      });
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, '_blank');
    } catch (err) {
      console.error("Failed to load PDF for preview:", err);
      alert("Nie udało się załadować podglądu faktury.");
    }
  };

  const renderInvoiceList = (invoices: Invoice[]) => (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {invoices.map(inv => (
        <div key={inv.id} className="py-3 grid grid-cols-3 md:grid-cols-4 gap-4 items-center">
          <div className="col-span-2 md:col-span-2">
            <p className="font-medium text-gray-900 dark:text-white">{inv.description}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(inv.issue_date).toLocaleDateString()}</p>
            <div className="flex gap-2 mt-1 flex-wrap">
              {inv.tags.map(tag => (
                <span key={tag.id} className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
          <div className="font-mono text-right text-gray-800 dark:text-gray-200">{inv.amount.toFixed(2)} PLN</div>
          <div className="flex justify-end space-x-4">
            <button onClick={() => handlePreviewPdf(inv.id)} className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400" title="Podgląd faktury">
              <EyeIcon className="h-5 w-5" />
            </button>
            {user?.role !== 'tenant' && (
              <button onClick={() => handleOpenEditTagsModal(inv)} className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400" title="Edytuj tagi">
                <PencilSquareIcon className="h-5 w-5" />
              </button>
            )}
            <a 
              href={`${api.defaults.baseURL}/${inv.file_path}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400" 
              title="Pobierz fakturę"
              download
            >
              <DocumentArrowDownIcon className="h-5 w-5" />
            </a>
            {user?.role !== 'tenant' && (
              <button onClick={() => handleDelete(inv.id)} className="text-red-500 hover:text-red-700" title="Usuń fakturę">
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderInvoices = () => {
    if (isLoading) return <p className="text-center py-8 text-gray-500">Ładowanie faktur...</p>;
    if (Object.keys(groupedInvoices).length === 0) return <p className="text-center py-8 text-gray-500">Brak faktur do wyświetlenia.</p>;
  
    if (user?.role === 'tenant') {
      return (
        <div className="space-y-8">
          {Object.entries(groupedInvoices as TenantGroupedInvoices).map(([propertyName, months]) => (
            <div key={propertyName}>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">{propertyName}</h2>
              <div className="space-y-6 mt-4">
                {Object.entries(months).map(([month, invoicesInMonth]) => (
                  <div key={month}>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">{month}</h3>
                    {renderInvoiceList(invoicesInMonth)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {Object.entries(groupedInvoices as GroupedInvoices).map(([month, invoicesInMonth]) => (
          <div key={month}>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">{month}</h3>
            {renderInvoiceList(invoicesInMonth)}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Zarządzanie Fakturami</h1>
          {user?.role !== 'tenant' && (
            <Button color="accent" className="w-auto" onClick={handleOpenAddModal}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Dodaj Fakturę
            </Button>
          )}
        </div>

        {(user?.role === 'admin' || user?.role === 'owner') && (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 space-y-4">
                <Select
                    label="Wybierz nieruchomość"
                    value={selectedPropertyId}
                    onChange={(e) => {
                        setSelectedPropertyId(e.target.value);
                        setSelectedTag("");
                    }}
                    options={properties.map(p => ({ value: p.id, label: p.name }))}
                />
                {Object.keys(summary).length > 0 && (
                    <div>
                        <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Podsumowanie miesięczne (PLN)</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(summary).map(([month, total]) => (
                                <div key={month} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <p className="font-bold text-gray-800 dark:text-white">{month}</p>
                                    <p className="text-indigo-600 dark:text-indigo-400 font-semibold">{total.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 space-y-4">
          {propertyTags.length > 0 && user?.role !== 'tenant' && (
              <div className="flex items-center gap-2">
                  <label htmlFor="tag-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtruj po tagu:</label>
                  <Select
                      id="tag-filter"
                      value={selectedTag}
                      onChange={(e) => setSelectedTag(e.target.value)}
                      options={[{value: "", label: "Wszystkie"}, ...propertyTags.map(tag => ({ value: tag, label: tag }))]}
                  />
              </div>
          )}
          
          {renderInvoices()}
        </div>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Dodaj nową fakturę">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
          <Select
            label="Nieruchomość" name="property_id" value={formData.property_id}
            onChange={(e) => handleFormChange(e)}
            options={properties.map(p => ({ value: p.id, label: p.name }))} required
          />
          <Input label="Opis" name="description" value={formData.description} onChange={(e) => handleFormChange(e)} required />
          <Input label="Kwota (np. 123.45)" name="amount" type="number" step="0.01" value={formData.amount} onChange={(e) => handleFormChange(e)} required />
          <Input label="Data wystawienia" type="date" name="issue_date" value={formData.issue_date} onChange={(e) => handleFormChange(e)} required />
          
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-400">Istniejące Tagi</label>
            {propertyTags.length > 0 ? (
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 border border-gray-300 dark:border-gray-700 rounded-md max-h-32 overflow-y-auto">
                {propertyTags.map(tag => (
                  <label key={tag} className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                    <input type="checkbox"
                      checked={selectedExistingTags.has(tag)}
                      onChange={() => handleTagCheckboxChange(tag)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    {tag}
                  </label>
                ))}
              </div>
            ) : <p className="text-sm text-gray-500 mt-1">Brak tagów dla tej nieruchomości.</p>}
          </div>

          <Input label="Nowe Tagi (oddzielone przecinkami)" name="new_tags"
            placeholder="np. media, naprawa, remont"
            value={newTagsInput}
            onChange={(e) => setNewTagsInput(e.target.value)}
          />
          <Input label="Plik faktury" type="file" onChange={handleFileChange} required />

          <div className="flex justify-end gap-3 pt-4">
              <Button type="button" color="light" onClick={() => setAddModalOpen(false)}>Anuluj</Button>
              <Button type="submit" color="accent">Zapisz</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditTagsModalOpen} onClose={() => setEditTagsModalOpen(false)} title={`Edytuj tagi dla faktury`}>
        <form onSubmit={handleEditTagsSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Faktura: <span className="font-semibold">{editingInvoice?.description}</span>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-400">Dostępne Tagi</label>
            {propertyTags.length > 0 ? (
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 border border-gray-300 dark:border-gray-700 rounded-md max-h-32 overflow-y-auto">
                {propertyTags.map(tag => (
                  <label key={tag} className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                    <input type="checkbox"
                      checked={selectedExistingTags.has(tag)}
                      onChange={() => handleTagCheckboxChange(tag)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    {tag}
                  </label>
                ))}
              </div>
            ) : <p className="text-sm text-gray-500 mt-1">Brak zdefiniowanych tagów dla tej nieruchomości.</p>}
          </div>
          <Input label="Nowe Tagi (oddzielone przecinkami)" name="new_tags"
            placeholder="np. media, naprawa, remont"
            value={newTagsInput}
            onChange={(e) => setNewTagsInput(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" color="light" onClick={() => setEditTagsModalOpen(false)}>Anuluj</Button>
            <Button type="submit" color="accent">Zapisz Tagi</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}