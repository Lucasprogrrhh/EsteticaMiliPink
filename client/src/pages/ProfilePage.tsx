import React, { useState, useEffect, useRef } from 'react';
import { Camera, User, Phone, Lock, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function ProfilePage() {
  const { token, user: authUser } = useAuth();
  
  const [profile, setProfile] = useState<{name: string, email: string, phone: string, photoUrl: string | null, paymentAlias: string, adminPhone: string, depositPercentage: number, reminderTime: string, remindersActive: boolean, points: number, pointTransactions: any[], stats: any}>({
    name: '', email: '', phone: '', photoUrl: null, paymentAlias: '', adminPhone: '', depositPercentage: 50, reminderTime: '10:00', remindersActive: true, points: 0, pointTransactions: [], stats: { services: 0, courses: 0, redemptions: 0 }
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
            remindersActive: data.remindersActive ?? true,
            points: data.points || 0,
            pointTransactions: data.pointTransactions || [],
            stats: {
              services: data._count?.clientAppointments || 0,
              courses: data._count?.courseEnrollments || 0,
              redemptions: data._count?.pointTransactions || 0
            }
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
                  src={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api','') : 'http://localhost:3001'}${profile.photoUrl}`} 
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

      {/* Club de Puntos Mili Panel */}
      {authUser?.role === 'CLIENT' && (
        <div 
          className="rounded-2xl p-6 md:p-8 overflow-hidden relative shadow-[0_10px_30px_rgba(0,0,0,0.5)]" 
          style={{ background: 'linear-gradient(135deg, #3d0f1e 0%, #5a1a2a 100%)', border: '1px solid #c9a227' }}
        >
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-[150px] text-[#e8b84b]">stars</span>
          </div>

          <div className="relative z-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-2 tracking-wide" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#fff8e7' }}>
                Club de Puntos Mili
              </h2>
              <p style={{ color: '#e8b84b', fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="text-sm font-medium uppercase tracking-widest">
                Tus recompensas exclusivas
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start justify-between">
              
              {/* Points Display & Progress */}
              <div className="flex-1 w-full text-center md:text-left flex flex-col items-center md:items-start">
                <div className="mb-2">
                  <span className="text-6xl font-black drop-shadow-md" style={{ color: '#e8b84b', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {profile.points}
                  </span>
                  <span className="text-xl ml-2 font-medium" style={{ color: '#fff8e7', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    pts
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-sm mt-4">
                  <div className="flex justify-between text-xs mb-2 font-bold" style={{ color: '#e8b84b', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    <span>0 pts</span>
                    <span>Meta: 500 pts</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-black/40 overflow-hidden border border-[#c9a227]/30">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out relative"
                      style={{ 
                        width: `${Math.min((profile.points / 500) * 100, 100)}%`, 
                        background: 'linear-gradient(90deg, #c9a227 0%, #e8b84b 100%)',
                        boxShadow: '0 0 10px rgba(232, 184, 75, 0.5)'
                      }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
                    </div>
                  </div>
                  <p className="text-xs mt-3 opacity-80" style={{ color: '#fff8e7', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {profile.points >= 500 
                      ? '¡Felicidades! Ya podés canjear un premio.' 
                      : `Te faltan ${500 - profile.points} pts para tu próximo beneficio.`}
                  </p>
                </div>

                <div className="flex gap-4 mt-8 w-full justify-center md:justify-start">
                  <button 
                    onClick={() => window.open('https://wa.me/5492664734034?text=Hola!%20Quiero%20canjear%20mis%20puntos%20del%20Club%20Mili', '_blank')}
                    className="px-6 py-3 rounded-xl font-bold transition-transform hover:scale-105 shadow-lg flex items-center gap-2"
                    style={{ background: 'linear-gradient(90deg, #c9a227 0%, #e8b84b 100%)', color: '#3d0f1e', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    <span className="material-symbols-outlined text-[20px]">redeem</span>
                    Canjear Puntos
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="w-full md:w-auto flex flex-row md:flex-col gap-4 justify-center">
                <div className="bg-black/20 p-4 rounded-xl border border-[#c9a227]/30 flex flex-col items-center w-28 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[28px] mb-1" style={{ color: '#e8b84b' }}>spa</span>
                  <span className="text-2xl font-bold" style={{ color: '#fff8e7', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{profile.stats.services}</span>
                  <span className="text-[10px] uppercase tracking-wider text-center mt-1" style={{ color: '#c9a227' }}>Servicios</span>
                </div>
                <div className="bg-black/20 p-4 rounded-xl border border-[#c9a227]/30 flex flex-col items-center w-28 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[28px] mb-1" style={{ color: '#e8b84b' }}>school</span>
                  <span className="text-2xl font-bold" style={{ color: '#fff8e7', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{profile.stats.courses}</span>
                  <span className="text-[10px] uppercase tracking-wider text-center mt-1" style={{ color: '#c9a227' }}>Cursos</span>
                </div>
                <div className="bg-black/20 p-4 rounded-xl border border-[#c9a227]/30 flex flex-col items-center w-28 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[28px] mb-1" style={{ color: '#e8b84b' }}>stars</span>
                  <span className="text-2xl font-bold" style={{ color: '#fff8e7', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{profile.stats.redemptions}</span>
                  <span className="text-[10px] uppercase tracking-wider text-center mt-1" style={{ color: '#c9a227' }}>Canjes</span>
                </div>
              </div>
            </div>

            {/* Reward Table & History */}
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Rewards Table */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#fff8e7', fontFamily: "'Playfair Display', Georgia, serif" }}>
                  <span className="material-symbols-outlined text-[#e8b84b]">military_tech</span>
                  Niveles de Canje
                </h3>
                <div className="space-y-3">
                  {[
                    { pts: 500, desc: '10% OFF en próximo servicio' },
                    { pts: 1000, desc: 'Sesión de uñas gratis' },
                    { pts: 2000, desc: '25% OFF en cualquier curso' },
                    { pts: 3000, desc: 'Kit de productos Mili' },
                    { pts: 5000, desc: 'Curso completo de regalo' }
                  ].map((reward, i) => {
                    const achieved = profile.points >= reward.pts;
                    return (
                      <div key={i} className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${achieved ? 'bg-[#e8b84b]/10 border-[#e8b84b]/50' : 'bg-black/20 border-white/5 opacity-60'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${achieved ? 'bg-[#e8b84b] text-[#3d0f1e]' : 'bg-black/40 text-white/50'}`}>
                            {achieved ? '✓' : '🔒'}
                          </div>
                          <div>
                            <p className="font-bold text-sm" style={{ color: achieved ? '#e8b84b' : '#fff8e7', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{reward.pts} pts</p>
                            <p className="text-xs" style={{ color: '#fff8e7', opacity: 0.8 }}>{reward.desc}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transaction History */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#fff8e7', fontFamily: "'Playfair Display', Georgia, serif" }}>
                  <span className="material-symbols-outlined text-[#e8b84b]">history</span>
                  Últimos Movimientos
                </h3>
                
                {profile.pointTransactions.length === 0 ? (
                  <div className="bg-black/20 border border-white/10 rounded-xl p-6 text-center">
                    <p style={{ color: '#fff8e7', opacity: 0.7, fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="text-sm">
                      Aún no tenés movimientos de puntos. ¡Completá un servicio o curso para empezar a sumar!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {profile.pointTransactions.map((tx, i) => (
                      <div key={i} className="bg-black/20 border border-[#c9a227]/20 p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#fff8e7', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{tx.description || (tx.type === 'earned' ? 'Puntos ganados' : 'Canje de puntos')}</p>
                          <p className="text-[10px] mt-1" style={{ color: '#c9a227', opacity: 0.8 }}>
                            {new Date(tx.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div className={`font-bold text-lg ${tx.type === 'earned' ? '' : 'text-red-400'}`} style={{ color: tx.type === 'earned' ? '#e8b84b' : undefined, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {tx.type === 'earned' ? '+' : '-'}{tx.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
