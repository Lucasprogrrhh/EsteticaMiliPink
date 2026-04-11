import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

interface PortfolioItem {
    id: string;
    imageUrl: string;
    serviceCategory: string;
    specialistName: string;
    description: string | null;
    status: 'PENDING' | 'PUBLISHED' | 'REJECTED';
    isFeatured: boolean;
    createdAt: string;
    client?: { name: string } | null;
}

const CATEGORIES = ['Manicuría', 'Pestañas', 'Estética facial', 'Otros'];

export default function AdminPortfolioPage() {
    const { token } = useAuth();
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal state for direct Admin Upload
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [desc, setDesc] = useState('');
    const [category, setCategory] = useState('Manicuría');
    const [specialist, setSpecialist] = useState('Mili Belleza');
    const [isFeatured, setIsFeatured] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/portfolio/admin', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch portfolio');
            const data = await res.json();
            setItems(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`http://localhost:3001/api/portfolio/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) throw new Error('Failed to update status');
            fetchPortfolio();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
        try {
            const res = await fetch(`http://localhost:3001/api/portfolio/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isFeatured: !currentFeatured })
            });
            if (!res.ok) throw new Error('Failed to update featured status');
            fetchPortfolio();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro de eliminar esta foto?')) return;
        try {
            const res = await fetch(`http://localhost:3001/api/portfolio/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete item');
            fetchPortfolio();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleAdminUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('photo', file);
            fd.append('description', desc);
            fd.append('serviceCategory', category);
            fd.append('specialistName', specialist);
            fd.append('isFeatured', isFeatured.toString());

            const res = await fetch('http://localhost:3001/api/portfolio/admin', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: fd
            });
            
            if (!res.ok) throw new Error('Failed to upload via Admin');
            
            setUploadModalOpen(false);
            setFile(null);
            setDesc('');
            fetchPortfolio();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-white text-center mt-10">Cargando portfolio...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Gestión Portfolio</h2>
                    <p className="text-slate-400 text-sm">Aprobá las fotos de clientes o subí las tuyas.</p>
                </div>
                <button
                    onClick={() => setUploadModalOpen(true)}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">cloud_upload</span>
                    Subir Trabajo
                </button>
            </div>

            {error && <div className="bg-red-500/20 text-red-500 p-3 rounded mb-4">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map(item => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={item.id} 
                        className={`bg-slate-800/80 rounded-xl overflow-hidden border ${
                            item.status === 'PENDING' ? 'border-yellow-500/40' : 
                            item.status === 'REJECTED' ? 'border-red-500/40' : 
                            'border-slate-700/50'
                        } flex flex-col`}
                    >
                        <div className="aspect-square relative">
                            <img 
                                src={`http://localhost:3001${item.imageUrl}`} 
                                className="w-full h-full object-cover" 
                                alt={item.serviceCategory} 
                            />
                            {item.status === 'PENDING' && (
                                <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">PENDIENTE</div>
                            )}
                            {item.isFeatured && (
                                <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">⭐ Destacado</div>
                            )}
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-pink-400 uppercase tracking-widest">{item.serviceCategory}</span>
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                    item.status === 'PUBLISHED' ? 'bg-green-500/20 text-green-300' :
                                    item.status === 'REJECTED' ? 'bg-red-500/20 text-red-300' :
                                    'bg-yellow-500/20 text-yellow-300'
                                }`}>{item.status}</span>
                            </div>
                            <p className="text-sm text-slate-300 mb-1">Por: <span className="text-white font-medium">{item.specialistName}</span></p>
                            {item.client && (
                                <p className="text-xs text-slate-400 mb-2">Cliente: {item.client.name}</p>
                            )}
                            {item.description && (
                                <p className="text-xs text-slate-400 italic mb-4 line-clamp-2">"{item.description}"</p>
                            )}
                            
                            <div className="mt-auto pt-4 border-t border-slate-700/50 grid grid-cols-2 gap-2 text-sm">
                                {item.status === 'PENDING' && (
                                    <>
                                        <button onClick={() => handleUpdateStatus(item.id, 'PUBLISHED')} className="bg-green-500/10 text-green-400 hover:bg-green-500/20 py-1.5 rounded transition">Aprobar</button>
                                        <button onClick={() => handleUpdateStatus(item.id, 'REJECTED')} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 py-1.5 rounded transition">Rechazar</button>
                                    </>
                                )}
                                {item.status === 'PUBLISHED' && (
                                    <>
                                        <button 
                                            onClick={() => handleToggleFeatured(item.id, item.isFeatured)} 
                                            className={`py-1.5 rounded transition ${item.isFeatured ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}
                                        >
                                            {item.isFeatured ? 'Quitar Destacado' : 'Hacer Destacado'}
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 py-1.5 rounded transition">Eliminar</button>
                                    </>
                                )}
                                {item.status === 'REJECTED' && (
                                    <>
                                        <button onClick={() => handleUpdateStatus(item.id, 'PUBLISHED')} className="bg-green-500/10 text-green-400 hover:bg-green-500/20 py-1.5 rounded transition">Restaurar</button>
                                        <button onClick={() => handleDelete(item.id)} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 py-1.5 rounded transition">Eliminar</button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {uploadModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">Subir nuevo trabajo</h3>
                        <form onSubmit={handleAdminUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">Imagen</label>
                                <input type="file" accept="image/*" onChange={e => {
                                    if(e.target.files && e.target.files[0]) setFile(e.target.files[0])
                                }} required className="w-full text-slate-300 text-sm file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:bg-slate-800 file:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">Categoría</label>
                                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white">
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">Especialista</label>
                                <input type="text" value={specialist} onChange={e => setSpecialist(e.target.value)} required className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"/>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">Descripción</label>
                                <textarea value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white resize-none" rows={2}/>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="rounded bg-slate-800 border-slate-700 text-pink-500 focus:ring-pink-500" />
                                <span className="text-sm text-slate-300">Marcar como Destacado (aparece primero)</span>
                            </label>
                            <div className="flex gap-3 justify-end mt-6">
                                <button type="button" onClick={() => setUploadModalOpen(false)} className="text-slate-400 hover:text-white">Cancelar</button>
                                <button type="submit" disabled={submitting} className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded">
                                    {submitting ? 'Subiendo...' : 'Publicar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
