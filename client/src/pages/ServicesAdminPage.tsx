import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Search, AlertCircle, CheckCircle2, Copy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API = 'http://localhost:3001/api';

interface Service {
    id: string;
    name: string;
    description: string | null;
    price: number;
    durationMinutes: number;
    active: boolean;
}

export default function ServicesAdminPage() {
    const { token } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [currentService, setCurrentService] = useState<Partial<Service>>({});
    const [saving, setSaving] = useState(false);

    const fetchServices = async () => {
        try {
            const response = await fetch(`${API}/services`);
            if (!response.ok) throw new Error('Error al cargar servicios');
            const data = await response.json();
            // Mostrar todos los servicios para admin, incluso si tuvieran endpoint solo de activos,
            // pero el GET /api/services actual solo devuelve activos. 
            // Para admin, deberíamos ver todos pero como el API filtra por active=true, 
            // veremos los activos.
            setServices(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleOpenModal = (mode: 'create' | 'edit', service?: Service) => {
        setModalMode(mode);
        if (mode === 'edit' && service) {
            setCurrentService({ ...service });
        } else {
            setCurrentService({ name: '', description: '', price: 0, durationMinutes: 30, active: true });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const isEdit = modalMode === 'edit';
            const url = isEdit ? `${API}/services/${currentService.id}` : `${API}/services`;
            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(currentService)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error al guardar el servicio');
            }

            // Refresh list
            fetchServices();
            setIsModalOpen(false);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro que deseas eliminar/desactivar el servicio "${name}"?`)) return;

        try {
            const response = await fetch(`${API}/services/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Error al eliminar el servicio');

            // Refresh list
            fetchServices();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (s.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="w-8 h-8 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                        Gestión de Servicios
                    </h2>
                    <p className="text-slate-400 text-sm">Administra los servicios ofrecidos en la clínica</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar servicio..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-800/50 border border-slate-700/50 text-white text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-pink-500/50 transition-colors"
                        />
                    </div>
                    <button
                        onClick={() => handleOpenModal('create')}
                        className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo Servicio
                    </button>
                </div>
            </div>

            {error ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
                    <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                    <p className="text-red-400 font-medium">{error}</p>
                </div>
            ) : (
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/50">
                                    <th className="p-4">Servicio</th>
                                    <th className="p-4">Duración</th>
                                    <th className="p-4">Precio</th>
                                    <th className="p-4">Estado</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {filteredServices.map((s) => (
                                    <motion.tr
                                        key={s.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="hover:bg-slate-700/20 transition-colors"
                                    >
                                        <td className="p-4">
                                            <div className="font-medium text-white">{s.name}</div>
                                            <div className="text-xs text-slate-400 line-clamp-1 max-w-xs" title={s.description || ''}>{s.description || '-'}</div>
                                        </td>
                                        <td className="p-4 text-slate-300 text-sm">{s.durationMinutes} min</td>
                                        <td className="p-4 text-pink-400 font-semibold text-sm">${Number(s.price).toFixed(0)}</td>
                                        <td className="p-4">
                                            {s.active ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-green-500/20 text-green-300 border-green-500/30">
                                                    Activo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-red-500/20 text-red-300 border-red-500/30">
                                                    Inactivo
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleOpenModal('edit', s)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                                                title="Editar"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(s.id, s.name)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                title="Eliminar/Desactivar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                                {filteredServices.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-400">
                                            No se encontraron servicios.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-800 border border-slate-700/50 p-6 rounded-2xl shadow-2xl w-full max-w-md"
                    >
                        <h2 className="text-xl font-bold text-white mb-4">
                            {modalMode === 'create' ? 'Nuevo Servicio' : 'Editar Servicio'}
                        </h2>
                        
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Nombre</label>
                                <input
                                    required
                                    type="text"
                                    value={currentService.name || ''}
                                    onChange={e => setCurrentService({...currentService, name: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Descripción</label>
                                <textarea
                                    value={currentService.description || ''}
                                    onChange={e => setCurrentService({...currentService, description: e.target.value})}
                                    rows={3}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Precio ($)</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={currentService.price || ''}
                                        onChange={e => setCurrentService({...currentService, price: parseFloat(e.target.value)})}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Duración (min)</label>
                                    <input
                                        required
                                        type="number"
                                        min="5"
                                        step="5"
                                        value={currentService.durationMinutes || ''}
                                        onChange={e => setCurrentService({...currentService, durationMinutes: parseInt(e.target.value)})}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors"
                                    />
                                </div>
                            </div>
                            
                            {modalMode === 'edit' && (
                                <div className="flex items-center gap-2 mt-2">
                                    <input 
                                        type="checkbox" 
                                        id="activeStatus"
                                        checked={currentService.active}
                                        onChange={e => setCurrentService({...currentService, active: e.target.checked})}
                                        className="rounded bg-slate-900 border border-slate-700 text-pink-500 focus:ring-pink-500 focus:ring-offset-slate-900"
                                    />
                                    <label htmlFor="activeStatus" className="text-sm text-slate-300 cursor-pointer">Servicio Activo</label>
                                </div>
                            )}

                            <div className="flex gap-3 justify-end mt-8">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                                    disabled={saving}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
