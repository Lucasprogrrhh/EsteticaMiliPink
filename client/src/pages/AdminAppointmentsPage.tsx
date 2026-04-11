import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface User {
    id: string;
    name: string;
    email: string;
}

interface Service {
    id: string;
    name: string;
    durationMinutes: number;
    price: number;
}

interface Appointment {
    id: string;
    dateTime: string;
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    notes: string | null;
    depositAmount: number | null;
    service: Service;
    client: User;
    specialist: User | null;
}

const AdminAppointmentsPage: React.FC = () => {
    const { token } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/appointments`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Failed to fetch appointments');

                const data = await response.json();
                setAppointments(data);
            } catch (err: any) {
                setError(err.message || 'Error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchAppointments();
    }, [token]);

    const handleStatusChange = async (id: string, newStatus: string) => {
        let notes = undefined;
        if (newStatus === 'CONFIRMED' || newStatus === 'CANCELLED') {
            const noteInput = window.prompt(`¿Deseas agregar una nota interna (opcional) al cambiar a ${newStatus}?`);
            if (noteInput === null) return; // User cancelled the prompt
            if (noteInput.trim()) notes = noteInput;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/appointments/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus, ...(notes && { notes }) })
            });

            if (!response.ok) throw new Error('Failed to update status');

            setAppointments(prev => prev.map(app =>
                app.id === id ? { ...app, status: newStatus as any } : app
            ));
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading) return <div className="text-center mt-10">Loading appointments...</div>;

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-3xl font-bold text-pink-500 mb-6">Gestión de Reservas Globales</h1>

            {error && <div className="bg-red-500/20 text-red-500 p-3 rounded mb-4">{error}</div>}

            <div className="bg-neutral-800 rounded-xl overflow-hidden shadow-2xl border border-neutral-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead>
                            <tr className="bg-neutral-900 text-neutral-400 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold border-b border-neutral-700">Fecha y Hora</th>
                                <th className="p-4 font-semibold border-b border-neutral-700">Cliente</th>
                                <th className="p-4 font-semibold border-b border-neutral-700">Especialista</th>
                                <th className="p-4 font-semibold border-b border-neutral-700">Servicio</th>
                                <th className="p-4 font-semibold border-b border-neutral-700 text-center">Estado</th>
                                <th className="p-4 font-semibold border-b border-neutral-700 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-700">
                            {appointments.map(app => (
                                <tr key={app.id} className="hover:bg-neutral-800/80 transition text-sm">
                                    <td className="p-4 text-neutral-300">
                                        {new Date(app.dateTime).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-semibold text-white">{app.client.name}</div>
                                        <div className="text-xs text-neutral-500">{app.client.email}</div>
                                    </td>
                                    <td className="p-4 text-neutral-300">
                                        {app.specialist ? app.specialist.name : <span className="text-neutral-500 italic">No asignado</span>}
                                    </td>
                                    <td className="p-4 text-neutral-300">{app.service.name}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 text-[10px] uppercase rounded-full font-bold ${
                                            app.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                            app.status === 'CONFIRMED' ? 'bg-blue-500/20 text-blue-400' :
                                            app.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                                            'bg-red-500/20 text-red-400'
                                        }`}>
                                            {app.status === 'PENDING' ? 'Pendiente pago' : app.status}
                                        </span>
                                        {app.status === 'PENDING' && app.depositAmount && (
                                            <div className="text-xs text-neutral-400 mt-2">Seña: ${Number(app.depositAmount).toFixed(2)}</div>
                                        )}
                                        {app.notes && (
                                            <div className="text-xs text-pink-400 mt-2 italic max-w-[150px] mx-auto truncate" title={app.notes}>
                                                Nota: {app.notes}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex flex-col gap-2 items-center">
                                            {app.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleStatusChange(app.id, 'CONFIRMED')}
                                                    className="bg-pink-500 hover:bg-pink-600 text-white text-[10px] uppercase font-bold px-3 py-1.5 rounded transition shadow shadow-pink-500/20 w-fit"
                                                >
                                                    Confirmar Pago
                                                </button>
                                            )}
                                            <select
                                                value={app.status}
                                                onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                                className="bg-neutral-900 border border-neutral-600 rounded text-xs p-1 text-white focus:outline-none focus:border-pink-500 w-fit mx-auto"
                                            >
                                                <option value="PENDING">PENDING</option>
                                                <option value="CONFIRMED">CONFIRMED</option>
                                                <option value="COMPLETED">COMPLETED</option>
                                                <option value="CANCELLED">CANCELLED</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {appointments.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-6 text-center text-neutral-500">
                                        No hay reservaciones en el sistema.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminAppointmentsPage;
