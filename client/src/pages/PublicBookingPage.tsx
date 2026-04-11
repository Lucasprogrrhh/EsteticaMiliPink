import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

interface Service {
    id: string;
    name: string;
    description: string | null;
    price: number;
    durationMinutes: number;
}

interface UserRes {
    id: string;
    name: string;
}

const PublicBookingPage: React.FC = () => {
    const { token, user } = useAuth();
    const navigate = useNavigate();

    const [services, setServices] = useState<Service[]>([]);
    const [specialists, setSpecialists] = useState<UserRes[]>([]);
    const [adminSettings, setAdminSettings] = useState<{paymentAlias: string, adminPhone: string, depositPercentage: number} | null>(null);
    const [loading, setLoading] = useState(true);

    // Form state
    const [serviceId, setServiceId] = useState('');
    const [specialistId, setSpecialistId] = useState('');
    const [dateString, setDateString] = useState('');
    const [timeString, setTimeString] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [servicesRes, specialistsRes, settingsRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/services`),
                    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/users/specialists`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/users/admin-settings`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);
                
                if (!servicesRes.ok || !specialistsRes.ok) {
                    throw new Error('Failed to fetch data');
                }
                
                const servicesData = await servicesRes.json();
                const specialistsData = await specialistsRes.json();
                const settingsData = await settingsRes.json();
                
                setServices(servicesData.filter((s: any) => s.active));
                setSpecialists(specialistsData);
                setAdminSettings(settingsData);
            } catch (err: any) {
                setError(err.message || 'Could not load required data.');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchData();
        }

        // Formatear la fecha para que el mínimo sea hoy
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        setDateString(`${year}-${month}-${day}`);
    }, [token]);

    const handleReserveClick = () => {
        if (user) {
            navigate('/reservar'); // Already here, but just in case
        } else {
            navigate('/login');
        }
    };

    const handleNavClick = (id: string) => {
        // Here we'd normally smooth scroll if we were fully on home page
        // But since we are on /reservar, we would navigate to /#id
        navigate(`/#${id}`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!serviceId) {
            return setError('Por favor, seleccioná un servicio.');
        }
        if (!dateString || !timeString) {
            return setError('Por favor, seleccioná una fecha y hora.');
        }

        const dateTime = new Date(`${dateString}T${timeString}`);

        if (dateTime < new Date()) {
            return setError('La fecha y hora seleccionada ya pasó.');
        }

        setSubmitting(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/appointments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    serviceId,
                    specialistId: specialistId || undefined,
                    dateTime: dateTime.toISOString(),
                    notes: notes || undefined
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to book appointment');
            }

            const selectedService = services.find(s => s.id === serviceId);

            // WhatsApp Redirection
            if (adminSettings?.adminPhone && selectedService) {
                const depositAmount = (selectedService.price * (adminSettings.depositPercentage / 100)).toFixed(2);
                const formatDate = new Date(dateTime).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
                
                const message = `✅ ¡Tu turno está casi confirmado!\n\n📅 Servicio: ${selectedService.name}\n🗓️ Fecha y hora: ${formatDate}\n\n💰 Para confirmar tu turno, abonás una seña de:\n$${depositAmount} (${adminSettings.depositPercentage}% del servicio)\n\n🏦 Transferí al alias: ${adminSettings.paymentAlias || 'No especificado'}\n\n📲 Una vez realizado el pago, enviá el comprobante por aquí.\n\n¡Gracias! Te esperamos 💅`;
                
                const cleanPhone = adminSettings.adminPhone.replace(/\D/g, ''); // leave only numbers
                const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
                window.open(waUrl, '_blank');
            }

            // Redirect to appointments list
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message);
            setSubmitting(false);
        }
    };

    const selectedService = services.find(s => s.id === serviceId);
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="bg-surface text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed overflow-x-hidden w-full m-0 p-0 min-h-screen flex flex-col">
            {/* TopNavBar */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-[0px_10px_30px_rgba(179,0,105,0.08)] border-none">
                <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
                    <Link to="/" className="text-2xl font-['Noto_Serif'] italic font-black text-pink-700 dark:text-pink-500 hover:opacity-80 transition-opacity">
                        Mili Belleza Study
                    </Link>
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/#servicios" className="font-['Noto_Serif'] font-bold tracking-tight text-zinc-600 dark:text-zinc-400 hover:text-pink-500 transition-all duration-300 hover:opacity-80">Servicios</Link>
                        <Link to="/#cursos" className="font-['Noto_Serif'] font-bold tracking-tight text-zinc-600 dark:text-zinc-400 hover:text-pink-500 transition-all duration-300 hover:opacity-80">Cursos</Link>
                        <Link to="/#portfolio" className="font-['Noto_Serif'] font-bold tracking-tight text-zinc-600 dark:text-zinc-400 hover:text-pink-500 transition-all duration-300 hover:opacity-80">Portfolio</Link>
                        <Link to="/#promociones" className="font-['Noto_Serif'] font-bold tracking-tight text-zinc-600 dark:text-zinc-400 hover:text-pink-500 transition-all duration-300 hover:opacity-80">Promociones</Link>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {user ? (
                            <Link to="/dashboard" className="text-sm font-bold text-pink-700 hover:text-pink-600 flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">dashboard</span>
                                Mi Panel
                            </Link>
                        ) : (
                            <Link to="/login" className="text-sm font-bold text-zinc-600 hover:text-pink-600">
                                Iniciar Sesión
                            </Link>
                        )}
                        <button 
                            onClick={handleReserveClick}
                            className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:opacity-80 active:scale-95 duration-150"
                        >
                            Reservar
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="mesh-gradient flex-1 pt-32 pb-20 px-4 flex justify-center items-center">
                <div className="max-w-2xl w-full">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-headline font-black text-on-surface leading-tight">
                            Agendá tu <span className="text-primary italic">cita</span>
                        </h1>
                        <p className="text-on-surface-variant mt-3 text-lg font-medium">Estás a un paso de potenciar tu belleza.</p>
                    </div>

                    <div className="glass-card border border-white/50 p-6 md:p-10 rounded-3xl shadow-xl">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-error-container/50 border border-error/20 text-error p-3 rounded-xl text-sm flex items-center gap-2 font-medium">
                                        <span className="material-symbols-outlined text-[18px]">error</span>
                                        {error}
                                    </div>
                                )}

                                {/* Service Selection */}
                                <div>
                                    <label className="block text-sm font-bold text-on-surface mb-2 font-['Plus_Jakarta_Sans']">
                                        Servicio <span className="text-primary">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={serviceId}
                                            onChange={(e) => setServiceId(e.target.value)}
                                            required
                                            className="w-full bg-white/60 border border-outline-variant rounded-xl p-3.5 pl-4 pr-10 text-on-surface font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>-- Elegí un servicio --</option>
                                            {services.map(service => (
                                                <option key={service.id} value={service.id}>
                                                    {service.name} (${Number(service.price).toFixed(2)})
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-on-surface-variant">
                                            <span className="material-symbols-outlined text-[20px]">expand_more</span>
                                        </div>
                                    </div>
                                    
                                    {selectedService && (
                                        <div className="mt-3 bg-primary-fixed-dim/20 border border-primary-container/20 p-4 rounded-xl text-sm text-on-surface-variant flex flex-col gap-1.5">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-on-surface">Duración:</span>
                                                <span className="bg-white/50 px-2 py-0.5 rounded-md font-medium text-primary">{selectedService.durationMinutes} min</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-on-surface">Precio total:</span>
                                                <span className="bg-white/50 px-2 py-0.5 rounded-md font-medium text-primary">${Number(selectedService.price).toFixed(2)}</span>
                                            </div>
                                            {selectedService.description && <p className="mt-2 text-xs italic opacity-80 border-t border-outline-variant/30 pt-2">{selectedService.description}</p>}
                                        </div>
                                    )}
                                </div>

                                {/* Specialist Selection */}
                                <div>
                                    <label className="block text-sm font-bold text-on-surface mb-2 font-['Plus_Jakarta_Sans']">
                                        Especialista <span className="text-outline text-xs font-medium ml-1">(Opcional)</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={specialistId}
                                            onChange={(e) => setSpecialistId(e.target.value)}
                                            className="w-full bg-white/60 border border-outline-variant rounded-xl p-3.5 pl-4 pr-10 text-on-surface font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm appearance-none cursor-pointer"
                                        >
                                            <option value="">-- Sin preferencia --</option>
                                            {specialists.map(specialist => (
                                                <option key={specialist.id} value={specialist.id}>
                                                    {specialist.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-on-surface-variant">
                                            <span className="material-symbols-outlined text-[20px]">expand_more</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Date and Time */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-on-surface mb-2 font-['Plus_Jakarta_Sans']">
                                            Fecha <span className="text-primary">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={dateString}
                                            min={today}
                                            onChange={(e) => setDateString(e.target.value)}
                                            required
                                            className="w-full bg-white/60 border border-outline-variant rounded-xl p-3.5 text-on-surface font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-on-surface mb-2 font-['Plus_Jakarta_Sans']">
                                            Hora <span className="text-primary">*</span>
                                        </label>
                                        <input
                                            type="time"
                                            value={timeString}
                                            onChange={(e) => setTimeString(e.target.value)}
                                            required
                                            className="w-full bg-white/60 border border-outline-variant rounded-xl p-3.5 text-on-surface font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-bold text-on-surface mb-2 font-['Plus_Jakarta_Sans']">
                                        Notas Adicionales <span className="text-outline text-xs font-medium ml-1">(Opcional)</span>
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={3}
                                        placeholder="¿Algún detalle o condición que debamos saber?"
                                        className="w-full bg-white/60 border border-outline-variant rounded-xl p-3.5 text-on-surface font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm resize-y"
                                    ></textarea>
                                </div>

                                {/* Deposit Info */}
                                {selectedService && adminSettings && adminSettings.depositPercentage > 0 && (
                                    <div className="bg-tertiary-fixed/40 border border-tertiary-container/30 rounded-xl p-5 text-sm text-on-surface-variant flex gap-4">
                                        <div className="shrink-0 pt-0.5">
                                            <span className="material-symbols-outlined text-tertiary text-2xl">info</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-on-surface mb-1">Información de Pago (Seña)</h4>
                                            <p className="mb-1 leading-relaxed">Para confirmar el turno se requiere abonar una seña del <strong>{adminSettings.depositPercentage}%</strong> del valor total.</p>
                                            <div className="my-3 bg-white/50 p-3 rounded-lg border border-white/80">
                                                <p className="mb-1 flex justify-between"><span className="text-on-surface-variant font-medium">Monto a abonar:</span> <strong className="text-primary text-base">${(selectedService.price * (adminSettings.depositPercentage / 100)).toFixed(2)}</strong></p>
                                                {adminSettings.paymentAlias && <p className="flex justify-between"><span className="text-on-surface-variant font-medium">Alias bancario:</span> <strong className="text-on-surface">{adminSettings.paymentAlias}</strong></p>}
                                            </div>
                                            <p className="text-xs font-medium opacity-80">Al confirmar, serás redirigida a WhatsApp para enviar el comprobante directamente a la administración.</p>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-on-primary font-bold py-4 rounded-xl transition-all duration-200 shadow-[0px_4px_14px_rgba(179,0,105,0.25)] active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
                                >
                                    {submitting ? 'Confirmando...' : 'Confirmar Reserva'}
                                    {!submitting && <span className="material-symbols-outlined text-xl">event_available</span>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-zinc-50 dark:bg-zinc-950 w-full py-12 px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
                    <div className="space-y-6">
                        <div className="text-xl font-['Noto_Serif'] font-bold text-pink-700">Mili Belleza Study</div>
                        <p className="text-zinc-500 max-w-xs lowercase">DONDE LA TÉCNICA SE CONVIERTE EN ARTE. TU FUTURO EN LA ESTÉTICA COMIENZA AQUÍ.</p>
                    </div>
                    <div className="flex flex-col space-y-4">
                        <span className="font-['Plus_Jakarta_Sans'] text-sm uppercase tracking-widest text-pink-600">Navegación</span>
                        <a className="text-zinc-500 hover:text-pink-400 hover:translate-x-1 transition-transform font-['Plus_Jakarta_Sans'] text-sm uppercase tracking-widest" href="#">Instagram</a>
                        <a className="text-zinc-500 hover:text-pink-400 hover:translate-x-1 transition-transform font-['Plus_Jakarta_Sans'] text-sm uppercase tracking-widest" href="#">WhatsApp</a>
                        <a className="text-zinc-500 hover:text-pink-400 hover:translate-x-1 transition-transform font-['Plus_Jakarta_Sans'] text-sm uppercase tracking-widest" href="#">Ubicación</a>
                        <a className="text-zinc-500 hover:text-pink-400 hover:translate-x-1 transition-transform font-['Plus_Jakarta_Sans'] text-sm uppercase tracking-widest" href="#">Términos</a>
                    </div>
                    <div className="flex flex-col space-y-4">
                        <span className="font-['Plus_Jakarta_Sans'] text-sm uppercase tracking-widest text-pink-600">Newsletter</span>
                        <div className="flex">
                            <input className="bg-zinc-100 dark:bg-zinc-900 border-none rounded-l-lg w-full px-4 focus:ring-2 focus:ring-pink-300" placeholder="TU EMAIL" type="email"/>
                            <button className="bg-pink-600 text-white px-4 py-2 rounded-r-lg">
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-900 text-center md:text-left">
                    <p className="text-zinc-400 text-xs tracking-widest uppercase">© 2024 Mili Belleza Study. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

export default PublicBookingPage;
