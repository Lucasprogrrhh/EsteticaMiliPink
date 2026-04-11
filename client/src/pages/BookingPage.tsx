import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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

const BookingPage: React.FC = () => {
    const { token } = useAuth();
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
                    fetch('${import.meta.env.VITE_API_URL || '${(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api','') : 'http://localhost:3001')}/api'}/services'),
                    fetch('${import.meta.env.VITE_API_URL || '${(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api','') : 'http://localhost:3001')}/api'}/users/specialists', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch('${import.meta.env.VITE_API_URL || '${(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api','') : 'http://localhost:3001')}/api'}/users/admin-settings', {
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
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!serviceId) {
            return setError('Please select a service.');
        }
        if (!dateString || !timeString) {
            return setError('Please select a date and time.');
        }

        const dateTime = new Date(`${dateString}T${timeString}`);

        if (dateTime < new Date()) {
            return setError('The selected time is in the past.');
        }

        setSubmitting(true);
        try {
            const response = await fetch('${import.meta.env.VITE_API_URL || '${(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api','') : 'http://localhost:3001')}/api'}/appointments', {
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
            navigate('/appointments');
        } catch (err: any) {
            setError(err.message);
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center mt-10">Loading services...</div>;

    const selectedService = services.find(s => s.id === serviceId);

    // Get tomorrow max for input type="date"
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-3xl font-bold text-pink-500 mb-6 text-center">Book an Appointment</h1>

            <form onSubmit={handleSubmit} className="bg-neutral-800 p-6 md:p-8 rounded-xl shadow-2xl border border-neutral-700">
                {error && <div className="bg-red-500/20 text-red-500 p-3 rounded mb-6 text-sm">{error}</div>}

                <div className="space-y-6">
                    {/* Service Selection */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Select Service <span className="text-pink-500">*</span>
                        </label>
                        <select
                            value={serviceId}
                            onChange={(e) => setServiceId(e.target.value)}
                            required
                            className="w-full bg-neutral-900 border border-neutral-700 rounded p-3 text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition"
                        >
                            <option value="" disabled>-- Choose a service --</option>
                            {services.map(service => (
                                <option key={service.id} value={service.id}>
                                    {service.name}
                                </option>
                            ))}
                        </select>
                        {selectedService && (
                            <div className="mt-2 text-sm text-neutral-400 bg-neutral-900/50 p-2 rounded">
                                <p><span className="text-pink-400 font-medium">Duration:</span> {selectedService.durationMinutes} min</p>
                                <p><span className="text-pink-400 font-medium">Price:</span> ${Number(selectedService.price).toFixed(2)}</p>
                                {selectedService.description && <p className="mt-1 italic">{selectedService.description}</p>}
                            </div>
                        )}
                    </div>

                    {/* Specialist Selection */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Select Specialist <span className="text-neutral-500 text-xs font-normal">(Optional)</span>
                        </label>
                        <select
                            value={specialistId}
                            onChange={(e) => setSpecialistId(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded p-3 text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition"
                        >
                            <option value="">-- No preference --</option>
                            {specialists.map(specialist => (
                                <option key={specialist.id} value={specialist.id}>
                                    {specialist.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                Date <span className="text-pink-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={dateString}
                                min={today}
                                onChange={(e) => setDateString(e.target.value)}
                                required
                                className="w-full bg-neutral-900 border border-neutral-700 rounded p-3 text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                Time <span className="text-pink-500">*</span>
                            </label>
                            <input
                                type="time"
                                value={timeString}
                                onChange={(e) => setTimeString(e.target.value)}
                                required
                                className="w-full bg-neutral-900 border border-neutral-700 rounded p-3 text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Additional Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            placeholder="Any special requests or things we should know?"
                            className="w-full bg-neutral-900 border border-neutral-700 rounded p-3 text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition resize-y"
                        ></textarea>
                    </div>

                    {/* Deposit Info */}
                    {selectedService && adminSettings && adminSettings.depositPercentage > 0 && (
                        <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4 text-sm text-neutral-300 mt-4">
                            <h4 className="font-semibold text-pink-400 mb-2">Información de Pago (Seña)</h4>
                            <p className="mb-1">Para confirmar el turno se requiere una seña del <strong>{adminSettings.depositPercentage}%</strong>.</p>
                            <p className="mb-1">Monto a transferir: <strong className="text-white text-base">${(selectedService.price * (adminSettings.depositPercentage / 100)).toFixed(2)}</strong></p>
                            {adminSettings.paymentAlias && <p className="mb-1">Alias: <strong className="text-white">{adminSettings.paymentAlias}</strong></p>}
                            <p className="text-xs text-neutral-400 mt-2">Al confirmar, serás redirigido a WhatsApp para enviar el comprobante a la administración.</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-pink-500 hover:bg-pink-600 focus:ring-4 focus:ring-pink-500/50 text-white font-bold py-3 px-4 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Confirming...' : 'Confirm Booking'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BookingPage;
