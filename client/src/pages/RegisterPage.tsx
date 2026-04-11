import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Scissors, Mail, Lock, User, AlertCircle, UserPlus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function RegisterPage() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.')
            return
        }
        if (password !== confirm) {
            setError('Las contraseñas no coinciden.')
            return
        }

        setLoading(true)
        try {
            await register(name, email, password)
            navigate('/login')
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al registrarse')
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
                    <p className="text-on-surface-variant font-medium">Registrate para agendar tu cita</p>
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

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-bold text-on-surface mb-2 font-['Plus_Jakarta_Sans']">Nombre completo</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                    placeholder="María García"
                                    className="w-full bg-white/60 border border-outline-variant rounded-xl pl-12 pr-4 py-3 text-on-surface placeholder-outline font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                                />
                            </div>
                        </div>

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
                        <div>
                            <label className="block text-sm font-bold text-on-surface mb-2 font-['Plus_Jakarta_Sans']">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full bg-white/60 border border-outline-variant rounded-xl pl-12 pr-4 py-3 text-on-surface placeholder-outline font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Confirm password */}
                        <div>
                            <label className="block text-sm font-bold text-on-surface mb-2 font-['Plus_Jakarta_Sans']">Confirmar contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                                <input
                                    type="password"
                                    value={confirm}
                                    onChange={e => setConfirm(e.target.value)}
                                    required
                                    placeholder="Repetí la contraseña"
                                    className="w-full bg-white/60 border border-outline-variant rounded-xl pl-12 pr-4 py-3 text-on-surface placeholder-outline font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-on-primary font-bold py-3.5 rounded-xl transition-all duration-200 mt-2 shadow-[0px_4px_14px_rgba(179,0,105,0.25)] active:scale-[0.98]"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <span className="material-symbols-outlined text-xl">how_to_reg</span>
                            )}
                            {loading ? 'Registrando...' : 'Crear cuenta'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-on-surface-variant mt-8 font-medium">
                        ¿Ya tenés cuenta?{' '}
                        <Link to="/login" className="text-primary hover:text-primary-container font-extrabold hover:underline transition-colors">
                            Iniciá sesión
                        </Link>
                    </p>
                </div>
                
                {/* Back to Home Link */}
                <div className="mt-8 text-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium text-sm">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Volver al inicio
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}
