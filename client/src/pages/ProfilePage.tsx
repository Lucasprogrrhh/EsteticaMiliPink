import React, { useState, useEffect, useRef } from 'react';
import { Camera, User, Phone, Lock, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API = (import.meta.env.VITE_API_URL || '${(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api','') : 'http://localhost:3001')}/api');

export default function ProfilePage() {
  const { token, user: authUser } = useAuth();
  
  const [profile, setProfile] = useState<{name: string, email: string, phone: string, photoUrl: string | null, paymentAlias: string, adminPhone: string, depositPercentage: number, reminderTime: string, remindersActive: boolean}>({
    name: '', email: '', phone: '', photoUrl: null, paymentAlias: '', adminPhone: '', depositPercentage: 50, reminderTime: '10:00', remindersActive: true
  });
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            photoUrl: data.photoUrl || null,
            paymentAlias: data.paymentAlias || '',
            adminPhone: data.adminPhone || '',
            depositPercentage: data.depositPercentage ?? 50,
            reminderTime: data.reminderTime || '10:00',
            remindersActive: data.remindersActive ?? true
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('photo', file);

    try {
      setIsSaving(true);
      const res = await fetch(`${API}/users/profile/photo`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (res.ok) {
        const updatedUser = await res.json();
        setProfile(prev => ({ ...prev, photoUrl: updatedUser.photoUrl }));
        setMessage({ type: 'success', text: 'Foto actualizada correctamente' });
      } else {
        setMessage({ type: 'error', text: 'Error al subir la foto' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ocurrió un error al subir la foto' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    try {
      setIsSaving(true);
      setMessage(null);
      
      const body: any = {
        name: profile.name,
        phone: profile.phone,
        ...(authUser?.role === 'ADMIN' && {
          paymentAlias: profile.paymentAlias,
          adminPhone: profile.adminPhone,
          depositPercentage: profile.depositPercentage,
          reminderTime: profile.reminderTime,
          remindersActive: profile.remindersActive
        })
      };

      if (password) {
        body.password = password;
      }

      const res = await fetch(`${API}/users/profile`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
        setPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: 'Error al actualizar el perfil' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ocurrió un error inesperado' });
    } finally {
      setIsSaving(false);
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
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Mi Perfil</h2>
        <p className="text-slate-400 text-sm">Gestiona tu información personal</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-5 h-5" />}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Photo Section */}
          <div className="flex flex-col items-center gap-4">
            <div 
              onClick={handlePhotoClick}
              className="relative w-32 h-32 rounded-full overflow-hidden bg-slate-700 border-2 border-slate-600 cursor-pointer group flex items-center justify-center transition-all hover:border-pink-500"
            >
              {profile.photoUrl ? (
                <img 
                  src={`${(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api','') : 'http://localhost:3001')}${profile.photoUrl}`} 
                  alt="Perfil" 
                  className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                />
              ) : (
                <User className="w-12 h-12 text-slate-400 group-hover:text-pink-400 transition-colors" />
              )}
              
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handlePhotoChange}
            />
            
            <button 
              onClick={handlePhotoClick}
              className="text-sm text-pink-400 hover:text-pink-300 transition-colors font-medium"
            >
              Cambiar foto
            </button>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="flex-1 w-full space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                Nombre completo
              </label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={e => setProfile({...profile, name: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all font-light"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center font-bold text-slate-400">@</div>
                Correo electrónico
              </label>
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-500 cursor-not-allowed font-light"
              />
              <p className="text-xs text-slate-500 mt-1">El correo no se puede cambiar.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                Teléfono
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={e => setProfile({...profile, phone: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all font-light"
                placeholder="+54 11 1234-5678"
              />
            </div>

            {authUser?.role === 'ADMIN' && (
              <div className="pt-4 border-t border-slate-700/50">
                <h3 className="text-sm font-medium text-white mb-4">Configuración de Pagos / Señas</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                      Alias para Transferencias
                    </label>
                    <input
                      type="text"
                      value={profile.paymentAlias}
                      onChange={e => setProfile({...profile, paymentAlias: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all font-light"
                      placeholder="estetica.alias"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                      WhatsApp para Comprobantes
                    </label>
                    <input
                      type="tel"
                      value={profile.adminPhone}
                      onChange={e => setProfile({...profile, adminPhone: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all font-light"
                      placeholder="+54 9 11 1234 5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                      Porcentaje de Seña (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={profile.depositPercentage}
                      onChange={e => setProfile({...profile, depositPercentage: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all font-light"
                    />
                  </div>
                </div>
              </div>
            )}

            {authUser?.role === 'ADMIN' && (
              <div className="pt-4 border-t border-slate-700/50">
                <h3 className="text-sm font-medium text-white mb-4">Configuración de Recordatorios</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={profile.remindersActive}
                      onChange={e => setProfile({...profile, remindersActive: e.target.checked})}
                      className="w-5 h-5 rounded bg-slate-900 border-slate-700 text-pink-500 focus:ring-pink-500/50"
                    />
                    <label className="text-sm text-slate-300">
                      Activar envío de recordatorios automáticos (Bandeja de Salida)
                    </label>
                  </div>

                  {profile.remindersActive && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                        Hora para generar recordatorios (Formato 24h)
                      </label>
                      <input
                        type="time"
                        value={profile.reminderTime}
                        onChange={e => setProfile({...profile, reminderTime: e.target.value})}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all font-light"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-700/50">
              <h3 className="text-sm font-medium text-white mb-4">Cambiar Contraseña</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-400" />
                    Nueva contraseña
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all font-light"
                    placeholder="Deja en blanco para no cambiar"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-400" />
                    Confirmar nueva contraseña
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all font-light"
                    placeholder="Repite la nueva contraseña"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 text-white font-medium px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 group disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                )}
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
