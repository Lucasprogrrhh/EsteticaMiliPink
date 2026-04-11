import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [isForgotPassword, setIsForgotPassword] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setMessage('')
        setLoading(true)

        if (isForgotPassword) {
            try {
                const res = await fetch('${import.meta.env.VITE_API_URL || '${(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api','') : 'http://localhost:3001')}/api'}/auth/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                })
                const data = await res.json()
                if (res.ok) {
                    setMessage(data.message)
                } else {
                    setError(data.error || 'Ocurrió un error')
                }
            } catch (err) {
                setError('Error de conexión')
            } finally {
                setLoading(false)
            }
            return
        }

        try {
            await login(email, password)
            navigate('/')
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen mesh-gradient flex items-center justify-center p-4 selection:bg-primary-fixed selection:text-on-primary-fixed">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="relative w-full max-w-md z-10"
            >
                {/* Logo */}
                <div className="flex flex-col items-center mb-8 text-center pt-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-fixed to-primary-container rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-primary-container/20 border border-white/50">
                        <span className="material-symbols-outlined text-white text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>spa</span>
                    </div>
                    <div className="text-3xl font-['Noto_Serif'] italic font-black text-primary mb-2">
                        Mili Belleza Study
                    </div>
                    <p className="text-on-surface-variant font-medium">Iniciá sesión para continuar</p>
                </div>

                {/* Card */}
                <div className="glass-card border border-white/50 rounded-3xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2.5 bg-error-container/50 border border-error/20 text-error text-sm px-4 py-3 rounded-xl"
                            >
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </motion.div>
                        )}
                        
                        {/* Message */}
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2.5 bg-green-500/20 border border-green-500/30 text-green-700 text-sm px-4 py-3 rounded-xl dark:text-green-300"
                            >
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {message}
                            </motion.div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-bold text-on-surface mb-2 font-['Plus_Jakarta_Sans']">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    placeholder="maria@email.com"
                                    className="w-full bg-white/60 border border-outline-variant rounded-xl pl-12 pr-4 py-3 text-on-surface placeholder-outline font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        {!isForgotPassword && (
                            <div>
                                <label className="block text-sm font-bold text-on-surface mb-2 font-['Plus_Jakarta_Sans']">Contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required={!isForgotPassword}
                                        placeholder="••••••••"
                                        className="w-full bg-white/60 border border-outline-variant rounded-xl pl-12 pr-4 py-3 text-on-surface placeholder-outline font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                                    />
                                </div>
                                <div className="flex justify-end mt-2">
                                    <button 
                                        type="button" 
                                        onClick={() => { setError(''); setMessage(''); setIsForgotPassword(true); }}
                                        className="text-primary text-xs font-bold hover:underline transition-all"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                </div>
                            </div>
                        )}

                        {isForgotPassword && (
                            <div className="flex justify-end mt-2">
                                <button 
                                    type="button" 
                                    onClick={() => { setError(''); setMessage(''); setIsForgotPassword(false); }}
                                    className="text-on-surface-variant text-xs font-bold hover:underline transition-all"
                                >
                                    Volver al inicio de sesión
                                </button>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || (isForgotPassword && !email) || (!isForgotPassword && (!email || !password))}
                            className="w-full flex items-center justify-center gap-2 bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-on-primary font-bold py-3.5 rounded-xl transition-all duration-200 mt-2 shadow-[0px_4px_14px_rgba(179,0,105,0.25)] active:scale-[0.98]"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <span className="material-symbols-outlined text-xl">{isForgotPassword ? 'mark_email_unread' : 'login'}</span>
                            )}
                            {loading ? 'Cargando...' : (isForgotPassword ? 'Recuperar contraseña' : 'Ingresar')}
                        </button>
                    </form>

                    <p className="text-center text-sm text-on-surface-variant mt-8 font-medium">
                        ¿No tenés cuenta?{' '}
                        <Link to="/register" className="text-primary hover:text-primary-container font-extrabold hover:underline transition-colors">
                            Registrate
                        </Link>
                    </p>
                </div>
                
                {/* Back to Home Link */}
                <div className="mt-8 text-center flex flex-col items-center gap-4">
                    <Link to="/" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium text-sm">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Volver al inicio
                    </Link>
                    
                    <p className="text-xs text-outline font-medium">
                        Demo: admin@estetica.com / password123
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
