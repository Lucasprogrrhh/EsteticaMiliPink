import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface TimeSlot {
  id: string;
  time: string;
  active: boolean;
}

export default function AdminTimeSlotsPage() {
  const { token } = useAuth();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTime, setNewTime] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001/api' : 'https://esteticamilipink.onrender.com/api');

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const res = await fetch(`${API}/time-slots`);
      const data = await res.json();
      setSlots(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar horarios');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!newTime) return;

    try {
      const res = await fetch(`${API}/time-slots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ time: newTime })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setSlots([...slots, data].sort((a, b) => a.time.localeCompare(b.time)));
      setNewTime('');
      setSuccess('Horario agregado exitosamente.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`${API}/time-slots/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active: !active })
      });
      
      if (!res.ok) throw new Error('Error al actualizar');
      
      setSlots(slots.map(s => s.id === id ? { ...s, active: !active } : s));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este horario?')) return;
    try {
      const res = await fetch(`${API}/time-slots/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('Error al eliminar');
      
      setSlots(slots.filter(s => s.id !== id));
      setSuccess('Horario eliminado.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Clock className="w-6 h-6 text-pink-500" />
          Gestión de Horarios
        </h2>
        <p className="text-slate-400 text-sm">Configura los horarios disponibles para las reservas de los clientes.</p>
      </div>

      {error && <div className="bg-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-2"><AlertCircle className="w-5 h-5"/> {error}</div>}
      {success && <div className="bg-green-500/20 text-green-400 p-4 rounded-xl">{success}</div>}

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <form onSubmit={handleAdd} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-2">Nuevo Horario (Ej: 09:00, 14:30)</label>
            <input 
              type="time" 
              value={newTime}
              onChange={e => setNewTime(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-pink-500 outline-none"
            />
          </div>
          <button 
            type="submit"
            className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-xl transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Agregar
          </button>
        </form>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Cargando...</div>
        ) : slots.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No hay horarios configurados.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="p-4 text-slate-300 font-semibold">Horario</th>
                <th className="p-4 text-slate-300 font-semibold text-center">Estado</th>
                <th className="p-4 text-slate-300 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {slots.map(slot => (
                <motion.tr 
                  key={slot.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-slate-800/50 transition-colors"
                >
                  <td className="p-4 font-bold text-white text-lg">{slot.time}</td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleToggle(slot.id, slot.active)}
                      className={`px-3 py-1 rounded-full text-xs font-bold ${slot.active ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}
                    >
                      {slot.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => handleDelete(slot.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
