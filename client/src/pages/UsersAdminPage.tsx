import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Search, Users, Shield, ShieldAlert, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API = (import.meta.env.VITE_API_URL || '${(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api','') : 'http://localhost:3001')}/api');

interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'SPECIALIST' | 'CLIENT';
    createdAt: string;
}

export default function UsersAdminPage() {
    const { token, user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API}/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                if (response.status === 403) throw new Error('No tienes permisos para ver esta página');
                throw new Error('Error al cargar usuarios');
            }
            const data = await response.json();
            setUsers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [token]);

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const response = await fetch(`${API}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            if (!response.ok) throw new Error('Error al actualizar el rol');

            // Refresh list
            fetchUsers();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'ADMIN': return <ShieldAlert className="w-4 h-4 text-purple-400" />;
            case 'SPECIALIST': return <Shield className="w-4 h-4 text-blue-400" />;
            default: return <UserIcon className="w-4 h-4 text-slate-400" />;
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
            case 'SPECIALIST': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
            default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="w-8 h-8 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <p className="text-red-400 font-medium">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                        <Users className="w-6 h-6 text-pink-400" />
                        Gestión de Usuarios
                    </h2>
                    <p className="text-slate-400 text-sm">Administra los roles y cuentas del sistema</p>
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar usuario..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-700/50 text-white text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-pink-500/50 transition-colors"
                    />
                </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/50">
                                <th className="p-4">Usuario</th>
                                <th className="p-4">Rol Actual</th>
                                <th className="p-4">Fecha Registro</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {filteredUsers.map((u) => (
                                <motion.tr
                                    key={u.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="hover:bg-slate-700/20 transition-colors"
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold text-white">
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-white">{u.name}</div>
                                                <div className="text-xs text-slate-400">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleBadge(u.role)}`}>
                                            {getRoleIcon(u.role)}
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm text-slate-300">
                                            {new Date(u.createdAt).toLocaleDateString('es-AR', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <select
                                            className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-pink-500/50 transition-colors"
                                            value={u.role}
                                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                            disabled={u.id === currentUser?.id} // Don't let admin demote themselves easily here
                                        >
                                            <option value="CLIENT">Cliente</option>
                                            <option value="SPECIALIST">Especialista</option>
                                            <option value="ADMIN">Administrador</option>
                                        </select>
                                    </td>
                                </motion.tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-400">
                                        No se encontraron usuarios que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
