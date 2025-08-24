// frontend/src/pages/PropertyDetails.tsx

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';

// Importy komponentów UI
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { ArrowLeftIcon, UserCircleIcon, UserPlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../auth/AuthContext';

// Typy danych
interface User { id: number; username: string; role: string; }
interface TenantAssignment { id: number; tenant: User; start_date: string; end_date: string | null; }
interface PropertyDetailsData {
  id: number;
  name: string;
  address: string;
  owner: User | null;
  tenants: TenantAssignment[];
}

// Komponent strony
export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();

  // Stany danych
  const [property, setProperty] = useState<PropertyDetailsData | null>(null);
  const [availableOwners, setAvailableOwners] = useState<User[]>([]);
  const [availableTenants, setAvailableTenants] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stany dla modali
  const [isOwnerModalOpen, setOwnerModalOpen] = useState(false);
  const [isTenantModalOpen, setTenantModalOpen] = useState(false);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');
  const [tenantFormData, setTenantFormData] = useState({ tenant_id: '', start_date: new Date().toISOString().split('T')[0], end_date: '' });
  const [modalError, setModalError] = useState<string | null>(null);


  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [propRes, ownersRes, tenantsRes] = await Promise.all([
        api.get(`/properties/${id}`),
        api.get('/users/', { params: { role: 'owner' } }),
        api.get('/users/', { params: { role: 'tenant' } })
      ]);
      setProperty(propRes.data);
      setAvailableOwners(ownersRes.data);
      if (ownersRes.data.length > 0) setSelectedOwnerId(propRes.data.owner?.id.toString() || ownersRes.data[0].id.toString());
      setAvailableTenants(tenantsRes.data);
      if (tenantsRes.data.length > 0) setTenantFormData(prev => ({ ...prev, tenant_id: tenantsRes.data[0].id.toString() }));

    } catch (err) {
      console.error(err);
      setError("Failed to load property details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Handlers
  const handleAssignOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    try {
      await api.put(`/assignments/properties/${id}/owner`, { user_id: parseInt(selectedOwnerId) });
      setOwnerModalOpen(false);
      fetchData(); // Refresh data
    } catch(err: any) {
      setModalError(err.response?.data?.detail || "An error occurred.");
    }
  };

  const handleAssignTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    const payload = {
        tenant_id: parseInt(tenantFormData.tenant_id),
        start_date: tenantFormData.start_date,
        end_date: tenantFormData.end_date || null
    };
    try {
        await api.post(`/assignments/properties/${id}/tenants`, payload);
        setTenantModalOpen(false);
        fetchData(); // Refresh data
    } catch(err: any) {
        setModalError(err.response?.data?.detail || "An error occurred.");
    }
  };

  const handleUnassignTenant = async (assignmentId: number) => {
    if (window.confirm("Are you sure you want to unassign this tenant?")) {
        try {
            await api.delete(`/assignments/tenants/${assignmentId}`);
            fetchData(); // Refresh data
        } catch(err: any) {
            alert(err.response?.data?.detail || "Failed to unassign tenant.");
        }
    }
  };


  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!property) return <p>Property not found.</p>;

  const isOwner = user?.id === property.owner?.id;

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div>
            <Link to="/dashboard/properties" className="text-sm text-gray-500 hover:text-indigo-600 inline-flex items-center gap-2 mb-4">
                <ArrowLeftIcon className="h-4 w-4" />
                Back to all properties
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{property.name}</h1>
            <p className="text-gray-500 dark:text-gray-400">{property.address}</p>
        </div>

        {/* Owner Section */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Owner</h2>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <UserCircleIcon className="h-10 w-10 text-gray-400" />
                    <div>
                        <p className="font-medium text-gray-900 dark:text-white">{property.owner?.username || "Unassigned"}</p>
                        <p className="text-sm text-gray-500">Current Owner</p>
                    </div>
                </div>
                {user?.role === 'admin' && (
                  <Button color="light" className="w-auto" onClick={() => setOwnerModalOpen(true)}>Change Owner</Button>
                )}
            </div>
        </div>

        {/* Tenants Section */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Tenants</h2>
                {(user?.role === 'admin' || isOwner) && (
                  <Button color="accent" className="w-auto" onClick={() => setTenantModalOpen(true)}>
                      <UserPlusIcon className="h-5 w-5 mr-2" />
                      Assign Tenant
                  </Button>
                )}
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {property.tenants.length > 0 ? property.tenants.map(a => (
                    <li key={a.id} className="py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <UserCircleIcon className="h-10 w-10 text-gray-400" />
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">{a.tenant.username}</p>
                                <p className="text-sm text-gray-500">Since: {new Date(a.start_date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        {(user?.role === 'admin' || isOwner) && (
                          <Button color="light" variant='outline' className="w-auto !py-1" onClick={() => handleUnassignTenant(a.id)}>
                              <TrashIcon className="h-4 w-4" />
                          </Button>
                        )}
                    </li>
                )) : (
                    <p className="text-center text-gray-500 py-4">No tenants assigned to this property.</p>
                )}
            </ul>
        </div>
      </div>
      
      {/* Modals */}
      <Modal isOpen={isOwnerModalOpen} onClose={() => setOwnerModalOpen(false)} title="Assign New Owner">
        <form onSubmit={handleAssignOwner}>
            {modalError && <p className="text-red-500 text-sm mb-4">{modalError}</p>}
            <Select 
                label="Select an Owner"
                value={selectedOwnerId}
                onChange={(e) => setSelectedOwnerId(e.target.value)}
                options={availableOwners.map(u => ({ value: u.id, label: u.username }))}
            />
            <div className="flex justify-end gap-3 pt-6">
                <Button type="button" color="light" onClick={() => setOwnerModalOpen(false)}>Cancel</Button>
                <Button type="submit" color="accent">Assign Owner</Button>
            </div>
        </form>
      </Modal>

      <Modal isOpen={isTenantModalOpen} onClose={() => setTenantModalOpen(false)} title="Assign New Tenant">
        <form onSubmit={handleAssignTenant} className="space-y-4">
            {modalError && <p className="text-red-500 text-sm">{modalError}</p>}
            <Select 
                label="Select a Tenant"
                name="tenant_id"
                value={tenantFormData.tenant_id}
                onChange={(e) => setTenantFormData(p => ({...p, tenant_id: e.target.value}))}
                options={availableTenants.map(u => ({ value: u.id, label: u.username }))}
            />
            <Input 
                label="Start Date"
                name="start_date"
                type="date"
                value={tenantFormData.start_date}
                onChange={(e) => setTenantFormData(p => ({...p, start_date: e.target.value}))}
                required
            />
            <Input 
                label="End Date (Optional)"
                name="end_date"
                type="date"
                value={tenantFormData.end_date}
                onChange={(e) => setTenantFormData(p => ({...p, end_date: e.target.value}))}
            />
             <div className="flex justify-end gap-3 pt-6">
                <Button type="button" color="light" onClick={() => setTenantModalOpen(false)}>Cancel</Button>
                <Button type="submit" color="accent">Assign Tenant</Button>
            </div>
        </form>
      </Modal>
    </>
  );
}