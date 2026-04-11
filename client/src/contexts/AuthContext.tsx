import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const API = 'http://localhost:3001/api'

interface AuthUser {
    id: string
    name: string
    email: string
    role: 'ADMIN' | 'SPECIALIST' | 'CLIENT'
}

interface AuthContextValue {
    user: AuthUser | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (name: string, email: string, password: string) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Restore session from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token')
        const storedUser = localStorage.getItem('auth_user')
        if (storedToken && storedUser) {
            try {
                setToken(storedToken)
                setUser(JSON.parse(storedUser))
            } catch {
                localStorage.removeItem('auth_token')
                localStorage.removeItem('auth_user')
            }
        }
        setIsLoading(false)
    }, [])

    const saveSession = (t: string, u: AuthUser) => {
        localStorage.setItem('auth_token', t)
        localStorage.setItem('auth_user', JSON.stringify(u))
        setToken(t)
        setUser(u)
    }

    const login = useCallback(async (email: string, password: string) => {
        const res = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión')
        saveSession(data.token, data.user)
    }, [])

    const register = useCallback(async (name: string, email: string, password: string) => {
        const res = await fetch(`${API}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error al registrarse')
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        setToken(null)
        setUser(null)
    }, [])

    return (
        <AuthContext.Provider value={{
            user, token, isAuthenticated: !!user, isLoading, login, register, logout
        }}>
            {children}
        </AuthContext.Provider>
    )
}

// Helper hook to get auth headers
export const useAuthHeaders = () => {
    const { token } = useAuth()
    return token ? { 'Authorization': `Bearer ${token}` } : {}
}
