import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle, Send, CheckCircle, Loader2 } from 'lucide-react';

const API = 'http://localhost:3001/api';

interface Reminder {
  id: string;
  type: string;
  status: string;
  message: string;
  phoneTarget: string;
  createdAt: string;
  appointment: {
    client: { name: string };
    specialist?: { name: string };
    service: { name: string };
    dateTime: string;
  };
}

export default function AdminRemindersPage() {
  const { token } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const fetchReminders = async () => {
    try {
      const res = await fetch(`${API}/reminders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReminders(data);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [token]);

  const handleSendReminder = async (reminder: Reminder) => {
    try {
      setSendingId(reminder.id);

      // Limpiar numero
      const cleanPhone = reminder.phoneTarget.replace(/\D/g, '');
      const encodedMsg = encodeURIComponent(reminder.message);
      
      const res = await fetch(`${API}/reminders/${reminder.id}/sent`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        // Remove from list
        setReminders(prev => prev.filter(r => r.id !== reminder.id));
        
        // Open WhatsApp
        window.open(`https://wa.me/${cleanPhone}?text=${encodedMsg}`, '_blank');
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
    } finally {
      setSendingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-pink-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in fade-in">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Bandeja de Recordatorios</h2>
        <p className="text-slate-400 text-sm">
          Mensajes pendientes para enviar por WhatsApp
        </p>
      </div>

      {reminders.length === 0 ? (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">¡Todo al día!</h3>
          <p className="text-slate-400">No hay recordatorios pendientes de envío en este momento.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reminders.map(reminder => (
            <div key={reminder.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between transition-all hover:bg-slate-800/80">
              
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 rounded-xl bg-pink-500/10">
                  <MessageCircle className="w-6 h-6 text-pink-400" />
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">
                      {reminder.type === 'CLIENT_REMINDER' ? 'Para Cliente' : 'Para Especialista'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                      {reminder.phoneTarget}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-400 line-clamp-2 mt-2">
                    "{reminder.message}"
                  </p>
                  
                  <div className="mt-3 text-xs text-slate-500">
                    Turno: {new Date(reminder.appointment.dateTime).toLocaleString('es-ES')} - {reminder.appointment.service.name}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSendReminder(reminder)}
                disabled={sendingId === reminder.id}
                className="w-full md:w-auto shrink-0 px-5 py-2.5 bg-[#25D366] hover:bg-[#1da851] text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingId === reminder.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Enviar por WhatsApp
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
