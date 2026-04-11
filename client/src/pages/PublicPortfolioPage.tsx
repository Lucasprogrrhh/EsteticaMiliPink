import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface PortfolioItem {
    id: string;
    imageUrl: string;
    serviceCategory: string;
    specialistName: string;
    description: string | null;
    status: string;
    isFeatured: boolean;
    createdAt: string;
}

const CATEGORIES = ['Todos', 'Manicuría', 'Pestañas', 'Estética facial', 'Otros'];

export default function PublicPortfolioPage() {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

    useEffect(() => {
        const fetchPortfolio = async () => {
            setLoading(true);
            try {
                const url = activeCategory === 'Todos' 
                    ? '${import.meta.env.VITE_API_URL || '${(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api','') : 'http://localhost:3001')}/api'}/portfolio'
                    : `${import.meta.env.VITE_API_URL || '${(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api','') : 'http://localhost:3001')}/api'}/portfolio?category=${encodeURIComponent(activeCategory)}`;
                
                const res = await fetch(url);
                const data = await res.json();
                if (res.ok) {
                    setItems(data);
                }
            } catch (err) {
                console.error('Error fetching portfolio:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPortfolio();
    }, [activeCategory]);

    return (
        <div className="min-h-screen mesh-gradient font-body text-on-surface">
            {/* TopNavBar */}
            <nav className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-md shadow-[0px_10px_30px_rgba(179,0,105,0.08)] border-none">
                <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
                    <Link to="/" className="text-2xl font-['Noto_Serif'] italic font-black text-pink-700 hover:opacity-80 transition-opacity">
                        Mili Belleza Study
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard" className="text-sm font-bold text-pink-700 hover:text-pink-600 flex items-center gap-2">
                            <span className="material-symbols-outlined">dashboard</span>
                            Mi Panel
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-headline font-black text-on-surface mb-4">
                        Nuestro <span className="text-primary italic">Portfolio</span>
                    </h1>
                    <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
                        Descubrí los increíbles resultados y el arte de nuestras especialistas y alumnas.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
                                activeCategory === cat
                                ? 'bg-primary text-on-primary shadow-lg scale-105'
                                : 'bg-surface-container-low text-on-surface-variant hover:bg-primary-fixed/50 hover:text-primary'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-20 bg-surface-container-lowest rounded-3xl border border-outline-variant/30">
                        <span className="material-symbols-outlined text-outline text-4xl mb-3">imagesmode</span>
                        <p className="text-on-surface-variant font-medium text-lg">No hay trabajos en esta categoría aún.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {items.map(item => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    className="group relative cursor-pointer rounded-2xl overflow-hidden aspect-[4/5] bg-surface-container shadow-sm hover:shadow-xl hover:shadow-primary/20 transition-all border border-outline-variant/20"
                                    onClick={() => setSelectedItem(item)}
                                >
                                    <img 
                                        src={`${(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api','') : 'http://localhost:3001')}${item.imageUrl}`} 
                                        alt={item.serviceCategory}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                                        {item.isFeatured && (
                                            <span className="absolute top-4 right-4 bg-tertiary-container text-on-tertiary-container text-xs font-bold px-2 py-1 rounded flex items-center gap-1 shadow-md">
                                                <span className="material-symbols-outlined text-[14px]">star</span> Escaparate
                                            </span>
                                        )}
                                        <p className="text-white font-headline font-bold text-xl mb-1 truncate">{item.serviceCategory}</p>
                                        <p className="text-white/80 text-sm font-medium flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[16px]">brush</span>
                                            {item.specialistName}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            {/* Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setSelectedItem(null)}
                    >
                        <motion.div 
                            initial={{ y: 50, scale: 0.95 }}
                            animate={{ y: 0, scale: 1 }}
                            exit={{ y: 20, scale: 0.95 }}
                            className="bg-surface rounded-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row shadow-2xl border border-white/10"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="md:w-3/5 bg-black flex items-center justify-center relative">
                                <img 
                                    src={`${(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api','') : 'http://localhost:3001')}${selectedItem.imageUrl}`} 
                                    alt={selectedItem.serviceCategory} 
                                    className="w-full h-auto max-h-[80vh] object-contain"
                                />
                            </div>
                            <div className="md:w-2/5 p-8 flex flex-col justify-center">
                                <span className="inline-flex items-start text-xs font-bold uppercase tracking-widest text-primary mb-2">
                                    {selectedItem.serviceCategory}
                                </span>
                                <h3 className="text-2xl font-headline font-bold text-on-surface mb-6">
                                    Trabajo realizado por {selectedItem.specialistName}
                                </h3>
                                {selectedItem.description && (
                                    <p className="text-on-surface-variant font-medium leading-relaxed mb-6">
                                        "{selectedItem.description}"
                                    </p>
                                )}
                                <div className="text-sm text-outline font-medium flex items-center gap-2 mt-auto">
                                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                                    {new Date(selectedItem.createdAt).toLocaleDateString('es-AR', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    })}
                                </div>
                                <button 
                                    onClick={() => setSelectedItem(null)}
                                    className="absolute top-4 right-4 md:static md:mt-8 bg-surface-container text-on-surface py-2.5 rounded-xl font-bold hover:bg-outline-variant/30 transition-colors flex items-center justify-center w-10 h-10 md:w-full md:h-auto"
                                >
                                    <span className="hidden md:block">Cerrar detalle</span>
                                    <span className="material-symbols-outlined md:hidden">close</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
