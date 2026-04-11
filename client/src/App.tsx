import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Scissors, Users, LayoutDashboard,
  Clock, DollarSign, CheckCircle2, XCircle,
  AlertCircle, ChevronRight, Star, Activity, LogOut, Plus, Quote, User, MessageCircle, Image
} from 'lucide-react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AppointmentsPage from './pages/AppointmentsPage'
import BookingPage from './pages/BookingPage'
import UsersAdminPage from './pages/UsersAdminPage'
import AdminAppointmentsPage from './pages/AdminAppointmentsPage'
import ServicesAdminPage from './pages/ServicesAdminPage'
import ProfilePage from './pages/ProfilePage'
import AdminRemindersPage from './pages/AdminRemindersPage'
import LandingPage from './pages/LandingPage'
import PublicBookingPage from './pages/PublicBookingPage'
import PublicPortfolioPage from './pages/PublicPortfolioPage'
import AdminPortfolioPage from './pages/AdminPortfolioPage'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Service {
  id: string
  name: string
  description?: string
  price: number
  durationMinutes: number
  active: boolean
}

interface Review {
  id: string
  rating: number
  comment: string | null
  photoUrl: string | null
  createdAt: string
  client: { name: string }
  service: { name: string }
}

interface Appointment {
  id: string
  dateTime: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  notes?: string
  client: { id: string; name: string; email: string }
  specialist?: { id: string; name: string; email: string }
  service: Service
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  CONFIRMED: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  COMPLETED: 'bg-green-500/20 text-green-300 border-green-500/30',
  CANCELLED: 'bg-red-500/20 text-red-300 border-red-500/30',
}

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <AlertCircle className="w-3 h-3" />,
  CONFIRMED: <CheckCircle2 className="w-3 h-3" />,
  COMPLETED: <CheckCircle2 className="w-3 h-3" />,
  CANCELLED: <XCircle className="w-3 h-3" />,
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="p-2 bg-pink-500/10 rounded-xl group-hover:bg-pink-500/20 transition-colors">
          <Scissors className="w-5 h-5 text-pink-400" />
        </div>
        <span className="text-xl font-bold text-pink-400">${Number(service.price).toFixed(0)}</span>
      </div>
      <h3 className="font-bold text-on-surface mb-1 text-sm">{service.name}</h3>
      <p className="text-on-surface-variant text-xs mb-3 line-clamp-2">{service.description}</p>
      <div className="flex items-center gap-1 text-outline text-xs font-medium">
        <Clock className="w-3 h-3" />
        <span>{service.durationMinutes} min</span>
      </div>
    </motion.div>
  )
}

function AppointmentRow({ appt }: { appt: Appointment }) {
  const date = new Date(appt.dateTime)
  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="border-b border-outline-variant/20 hover:bg-surface-container-low/50 transition-colors"
    >
      <td className="py-3 px-4">
        <div className="text-sm text-on-surface font-medium">{date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
        <div className="text-xs text-on-surface-variant">{date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</div>
      </td>
      <td className="py-3 px-4">
        <div className="text-sm font-medium text-on-surface">{appt.client.name}</div>
        <div className="text-xs text-on-surface-variant">{appt.client.email}</div>
      </td>
      <td className="py-3 px-4 text-sm text-on-surface-variant font-medium">{appt.service.name}</td>
      <td className="py-3 px-4">
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${statusColors[appt.status]}`}>
          {statusIcons[appt.status]}
          {appt.status}
        </span>
      </td>
    </motion.tr>
  )
}

function Dashboard({ services, appointments, reviews = [] }: { services: Service[], appointments: Appointment[], reviews?: Review[] }) {
  const { user } = useAuth()
  const [currentReviewIdx, setCurrentReviewIdx] = useState(0)

  useEffect(() => {
    if (reviews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentReviewIdx(prev => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  const pending = appointments.filter(a => a.status === 'PENDING').length
  const confirmed = appointments.filter(a => a.status === 'CONFIRMED').length
  const completed = appointments.filter(a => a.status === 'COMPLETED').length
  const revenue = appointments
    .filter(a => a.status === 'COMPLETED')
    .reduce((acc, a) => acc + Number(a.service.price), 0)

  const stats = [
    { label: 'Servicios activos', value: services.length, icon: <Scissors />, color: 'pink' },
    { label: 'Pendientes (Sin seña)', value: pending, icon: <AlertCircle />, color: 'yellow' },
    { label: 'Confirmadas (Pagadas)', value: confirmed, icon: <CheckCircle2 />, color: 'blue' },
    { label: 'Ingresos completados', value: `$${revenue.toFixed(0)}`, icon: <DollarSign />, color: 'green' },
  ]

  const colorMap: Record<string, string> = {
    pink: 'from-pink-500/20 to-pink-600/5 border-pink-500/20 text-pink-400',
    yellow: 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/20 text-yellow-400',
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400',
    green: 'from-green-500/20 to-green-600/5 border-green-500/20 text-green-400',
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-on-surface mb-1 font-headline">Panel Principal</h2>
        <p className="text-on-surface-variant text-sm font-medium">Resumen general de tu cuenta</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {user?.role !== 'CLIENT' && stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-gradient-to-br ${colorMap[stat.color]} border rounded-2xl p-5`}
          >
            <div className={`w-8 h-8 mb-3 ${colorMap[stat.color].split(' ').find(c => c.startsWith('text-'))}`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/30 shadow-sm rounded-2xl p-6">
        <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2 font-headline">
          <Calendar className="w-4 h-4 text-primary" />
          Próximas citas
        </h3>
        {appointments.slice(0, 5).length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">No hay citas registradas aún.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-on-surface-variant uppercase tracking-wider font-bold border-b border-outline-variant/30">
                <th className="pb-3 px-4">Fecha</th>
                <th className="pb-3 px-4">Cliente</th>
                <th className="pb-3 px-4">Servicio</th>
                <th className="pb-3 px-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              {appointments.slice(0, 5).map(a => <AppointmentRow key={a.id} appt={a} />)}
            </tbody>
          </table>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant/30 shadow-sm rounded-2xl p-6">
          <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2 font-headline">
            <Star className="w-4 h-4 text-primary" />
            Servicios disponibles
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {services.slice(0, 3).map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
                <span className="text-sm font-bold text-on-surface">{s.name}</span>
                <div className="flex items-center gap-3 text-xs text-on-surface-variant font-medium">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.durationMinutes}m</span>
                  <span className="text-pink-400 font-semibold">${Number(s.price).toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {user?.role !== 'CLIENT' && (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-pink-400" />
            Distribución de estados
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Pendientes (Sin seña)', count: pending, total: appointments.length, color: 'bg-yellow-400' },
              { label: 'Confirmadas (Pagadas)', count: confirmed, total: appointments.length, color: 'bg-blue-400' },
              { label: 'Completadas', count: completed, total: appointments.length, color: 'bg-green-400' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="text-white font-medium">{item.count}</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-700`}
                    style={{ width: item.total ? `${(item.count / item.total) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>

      {reviews.length > 0 && (
        <div className="bg-primary-fixed-dim/20 border border-primary-container/20 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-primary">
            <Quote className="w-24 h-24" />
          </div>
          <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2 font-headline">
            <Star className="w-4 h-4 text-primary" fill="currentColor" />
            Lo que dicen nuestros clientes
          </h3>
          <div className="min-h-[120px] relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentReviewIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col justify-center"
              >
                <div className="flex gap-6 items-center">
                  {reviews[currentReviewIdx].photoUrl && (
                    <div className="shrink-0">
                      <img 
                        src={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api','') : 'http://localhost:3001'}${reviews[currentReviewIdx].photoUrl}`} 
                        alt="Trabajo" 
                        className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl shadow-lg border border-pink-500/20"
                      />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1 text-pink-400 mb-2 text-lg">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>{i < reviews[currentReviewIdx].rating ? '★' : '☆'}</span>
                      ))}
                    </div>
                    <p className="text-on-surface text-lg font-medium italic mb-2 line-clamp-3">
                      "{reviews[currentReviewIdx].comment || 'Excelente servicio, muy recomendado.'}"
                    </p>
                    <div className="text-sm text-on-surface-variant flex flex-wrap items-center gap-2 font-medium">
                      <span className="font-bold text-primary">{reviews[currentReviewIdx].client.name}</span>
                      <span className="hidden sm:inline text-outline-variant">•</span>
                      <span>{reviews[currentReviewIdx].service.name}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex gap-2 justify-center mt-4">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentReviewIdx(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === currentReviewIdx ? 'bg-pink-500 w-4' : 'bg-slate-600'}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Main app layout (authenticated)
function AppLayout() {
  const { user, token, logout } = useAuth()
  const location = useLocation()
  const [services, setServices] = useState<Service[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const headers = { 'Authorization': `Bearer ${token}` }
    const fetchData = async () => {
      try {
        const [sRes, aRes, rRes] = await Promise.all([
          fetch(`${API}/services`),
          fetch(`${API}/appointments`, { headers }),
          fetch(`${API}/reviews`),
        ])
        setServices(await sRes.json())
        setAppointments(aRes.ok ? await aRes.json() : [])
        setReviews(rRes.ok ? await rRes.json() : [])
      } catch {
        console.error('Error fetching data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token, location.pathname]) // re-fetch when route changes as well

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { path: '/services', label: 'Servicios', icon: <Scissors className="w-4 h-4" /> },
    { path: '/appointments', label: 'Mis Citas', icon: <Calendar className="w-4 h-4" /> },
    { path: '/booking', label: 'Agendar Cita', icon: <Plus className="w-4 h-4" /> },
    { path: '/profile', label: 'Mi Perfil', icon: <User className="w-4 h-4" /> },
  ]

  // Add Users and Global Appointments tabs only if user is ADMIN
  if (user?.role === 'ADMIN') {
    navItems.push({ path: '/admin/appointments', label: 'Gestión Reservas', icon: <CheckCircle2 className="w-4 h-4" /> })
    navItems.push({ path: '/admin/services', label: 'Gestión Servicios', icon: <Scissors className="w-4 h-4" /> })
    navItems.push({ path: '/admin/portfolio', label: 'Gestión Portfolio', icon: <Image className="w-4 h-4" /> })
    navItems.push({ path: '/admin/reminders', label: 'Recordatorios', icon: <MessageCircle className="w-4 h-4" /> })
    navItems.push({ path: '/users', label: 'Usuarios', icon: <Users className="w-4 h-4" /> })
  }

  return (
    <div className={`min-h-screen ${user?.role === 'CLIENT' ? 'bg-surface mesh-gradient' : 'bg-slate-900'} text-on-surface flex font-body`}>
      {/* Sidebar */}
      <aside className={`w-64 ${user?.role === 'CLIENT' ? 'bg-white/80 border-r border-outline-variant/30 backdrop-blur-md' : 'bg-slate-800/50 border-r border-slate-700/50'} flex flex-col p-4 shrink-0 shadow-lg`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 py-4 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-fixed to-primary-container rounded-xl flex items-center justify-center shadow-md">
            <Scissors className={`w-5 h-5 ${user?.role === 'CLIENT' ? 'text-primary' : 'text-white'}`} />
          </div>
          <div>
            <div className={`text-sm font-bold ${user?.role === 'CLIENT' ? 'text-on-surface' : 'text-white'} leading-tight font-headline italic`}>Mili Belleza</div>
            <div className={`text-xs ${user?.role === 'CLIENT' ? 'text-on-surface-variant font-medium' : 'text-slate-400'} leading-tight tracking-wider`}>STUDY</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path || (item.path === '/appointments' && location.pathname.startsWith('/appointments'));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${isActive
                  ? (user?.role === 'CLIENT' ? 'bg-primary text-on-primary shadow-md' : 'bg-pink-500/20 text-pink-300 border border-pink-500/30')
                  : (user?.role === 'CLIENT' ? 'text-on-surface-variant hover:text-primary hover:bg-primary-fixed/30' : 'text-slate-400 hover:text-white hover:bg-slate-700/50')
                  }`}
              >
                {item.icon}
                {item.label}
                {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* User info + logout */}
        <div className={`mt-4 border-t ${user?.role === 'CLIENT' ? 'border-outline-variant/30' : 'border-slate-700/50'} pt-4 space-y-3`}>
          <div className="px-2">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-8 h-8 rounded-full ${user?.role === 'CLIENT' ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-gradient-to-br from-pink-400 to-blue-500 text-white'} flex items-center justify-center text-sm font-bold shrink-0 shadow-sm`}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-bold ${user?.role === 'CLIENT' ? 'text-on-surface' : 'text-white'} truncate`}>{user?.name}</p>
                <p className={`text-xs ${user?.role === 'CLIENT' ? 'text-on-surface-variant font-medium' : 'text-slate-500'} truncate`}>{user?.role}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              logout()
              window.location.href = '/login'
            }}
            className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${user?.role === 'CLIENT' ? 'text-on-surface-variant hover:text-error hover:bg-error-container' : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'}`}
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <Routes location={location} key={location.pathname}>
              <Route path="/dashboard" element={
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  <Dashboard services={services} appointments={appointments} reviews={reviews} />
                </motion.div>
              } />

              <Route path="/services" element={
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">Servicios</h2>
                      <p className="text-slate-400 text-sm">{services.length} servicios activos disponibles</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {services.map(s => <ServiceCard key={s.id} service={s} />)}
                    </div>
                  </div>
                </motion.div>
              } />

              <Route path="/appointments" element={
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  <AppointmentsPage />
                </motion.div>
              } />

              <Route path="/profile" element={
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  <ProfilePage />
                </motion.div>
              } />

              <Route path="/booking" element={
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  <BookingPage />
                </motion.div>
              } />

              <Route path="/admin/appointments" element={
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  {user?.role === 'ADMIN' ? (
                    <AdminAppointmentsPage />
                  ) : (
                    <Navigate to="/" replace />
                  )}
                </motion.div>
              } />

              <Route path="/admin/services" element={
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  {user?.role === 'ADMIN' ? (
                    <ServicesAdminPage />
                  ) : (
                    <Navigate to="/" replace />
                  )}
                </motion.div>
              } />

              <Route path="/admin/portfolio" element={
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  {user?.role === 'ADMIN' ? (
                    <AdminPortfolioPage />
                  ) : (
                    <Navigate to="/" replace />
                  )}
                </motion.div>
              } />

              <Route path="/admin/reminders" element={
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  {user?.role === 'ADMIN' ? (
                    <AdminRemindersPage />
                  ) : (
                    <Navigate to="/" replace />
                  )}
                </motion.div>
              } />

              <Route path="/users" element={
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  {user?.role === 'ADMIN' ? (
                    <UsersAdminPage />
                  ) : (
                    <Navigate to="/" replace />
                  )}
                </motion.div>
              } />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AnimatePresence>
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PrivateRoute><LandingPage /></PrivateRoute>} />
          <Route path="/reservar" element={<PrivateRoute><PublicBookingPage /></PrivateRoute>} />
          <Route path="/portfolio" element={<PrivateRoute><PublicPortfolioPage /></PrivateRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
