import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

interface Course {
    id: string;
    name: string;
    category: string;
    description: string | null;
    contentGuide: string | null;
    coverImageUrl: string | null;
    price: number;
    duration: string | null;
    maxSpots: number;
    status: 'ACTIVE' | 'HIDDEN';
    isFeatured: boolean;
    createdAt: string;
}

export default function AdminCoursesPage() {
    const { token } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Form state
    const [isEditing, setIsEditing] = useState(false);
    const [currentCourseId, setCurrentCourseId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [contentGuide, setContentGuide] = useState('');
    const [duration, setDuration] = useState('');
    const [price, setPrice] = useState(0);
    const [maxSpots, setMaxSpots] = useState(10);
    const [status, setStatus] = useState<'ACTIVE' | 'HIDDEN'>('ACTIVE');
    const [file, setFile] = useState<File | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/courses/admin`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setCourses(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setCategory('');
        setDescription('');
        setContentGuide('');
        setDuration('');
        setPrice(0);
        setMaxSpots(10);
        setStatus('ACTIVE');
        setFile(null);
        setCurrentCourseId(null);
        setIsEditing(false);
        setShowForm(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleEdit = (c: Course) => {
        setName(c.name);
        setCategory(c.category);
        setDescription(c.description || '');
        setContentGuide(c.contentGuide || '');
        setDuration(c.duration || '');
        setPrice(c.price);
        setMaxSpots(c.maxSpots);
        setStatus(c.status);
        setCurrentCourseId(c.id);
        setIsEditing(true);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro de eliminar este curso?')) return;
        try {
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/courses/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchCourses();
        } catch (error) {
            alert('Error al eliminar');
        }
    };

    const handleToggleStatus = async (c: Course) => {
        const newStatus = c.status === 'ACTIVE' ? 'HIDDEN' : 'ACTIVE';
        try {
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/courses/${c.id}`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            fetchCourses();
        } catch (error) {
            alert('Error al cambiar estado');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const fd = new FormData();
        fd.append('name', name);
        fd.append('category', category);
        fd.append('description', description);
        fd.append('contentGuide', contentGuide);
        fd.append('duration', duration);
        fd.append('price', price.toString());
        fd.append('maxSpots', maxSpots.toString());
        fd.append('status', status);
        if (file) fd.append('coverImage', file);

        try {
            const url = isEditing 
                ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/courses/${currentCourseId}`
                : `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/courses`;
                
            const res = await fetch(url, {
                method: isEditing ? 'PATCH' : 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: fd
            });
            
            if (res.ok) {
                resetForm();
                fetchCourses();
            } else {
                alert('Error al guardar');
            }
        } catch (error) {
            alert('Error al guardar');
        }
    };

    if (loading) return <div className="text-white text-center mt-10">Cargando cursos...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Gestión Cursos</h2>
                    <p className="text-slate-400 text-sm">Administrá tus capacitaciones.</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Nuevo Curso
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-4">{isEditing ? 'Editar' : 'Nuevo'} Curso</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">Nombre</label>
                                <input type="text" value={name} onChange={e=>setName(e.target.value)} required className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">Temática / Categoría</label>
                                <input type="text" value={category} onChange={e=>setCategory(e.target.value)} required className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">Duración (ej: "2 días intensivos")</label>
                                <input type="text" value={duration} onChange={e=>setDuration(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">Costo (ARS)</label>
                                <input type="number" value={price} onChange={e=>setPrice(Number(e.target.value))} required className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">Cupo Máximo</label>
                                <input type="number" value={maxSpots} onChange={e=>setMaxSpots(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
                            </div>
                            <div className="flex items-center gap-2 pt-6 border-slate-700 border-t mt-4 col-span-1 md:col-span-2">
                                <label className="text-sm text-slate-300">Visible en Landing:</label>
                                <input type="checkbox" checked={status === 'ACTIVE'} onChange={e => setStatus(e.target.checked ? 'ACTIVE' : 'HIDDEN')} className="w-5 h-5 rounded bg-slate-900 border-slate-700 text-pink-500" />
                            </div>
                            <div className="col-span-1 md:col-span-2 pt-2 border-slate-700 border-t">
                                <label className="block text-sm text-slate-300 mb-1">Descripción</label>
                                <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={2} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white resize-none" />
                            </div>
                            <div className="col-span-1 md:col-span-2 pt-2 border-slate-700 border-t">
                                <label className="block text-sm text-slate-300 mb-1">Guía de Contenidos</label>
                                <textarea value={contentGuide} onChange={e=>setContentGuide(e.target.value)} rows={4} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white resize-none" />
                            </div>
                            <div className="col-span-1 md:col-span-2 pt-2 border-slate-700 border-t">
                                <label className="block text-sm text-slate-300 mb-1">Imagen de Portada (Opcional)</label>
                                <input type="file" accept="image/*" onChange={e => {
                                    if(e.target.files && e.target.files[0]) setFile(e.target.files[0])
                                }} ref={fileInputRef} className="w-full text-slate-300 text-sm file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:bg-slate-900 file:text-white" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-700">
                            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-white">Cancelar</button>
                            <button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded">Guardar</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={course.id} className={`bg-slate-800 rounded-xl overflow-hidden border ${course.status === 'HIDDEN' ? 'border-red-500/50 opacity-60' : 'border-slate-700'}`}>
                        {course.coverImageUrl && (
                            <img src={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api','') : 'http://localhost:3001'}${course.coverImageUrl}`} alt={course.name} className="w-full h-40 object-cover" />
                        )}
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-white text-lg">{course.name}</h4>
                                <span className="text-xs font-medium px-2 py-1 rounded bg-pink-500/20 text-pink-300">{course.category}</span>
                            </div>
                            <p className="text-slate-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                            <div className="text-sm font-medium text-slate-300 mb-4">
                                <p>Duración: <span className="text-white">{course.duration || 'No especificada'}</span></p>
                                <p>Costo: <span className="text-pink-400">${course.price}</span></p>
                            </div>
                            <div className="flex gap-2 pt-4 border-t border-slate-700">
                                <button onClick={() => handleEdit(course)} className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 px-3 py-1.5 rounded transition">Editar</button>
                                <button onClick={() => handleDelete(course.id)} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded transition">Eliminar</button>
                                <button onClick={() => handleToggleStatus(course)} className={`ml-auto px-3 py-1.5 rounded transition ${course.status === 'ACTIVE' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'}`}>
                                    {course.status === 'ACTIVE' ? 'Ocultar' : 'Mostrar'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
