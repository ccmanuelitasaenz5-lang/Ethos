'use client'

import { logout } from '@/app/actions/auth'
import { User } from '@supabase/supabase-js'
import GlobalSearch from './GlobalSearch'

interface HeaderProps {
    user: User
    fullName?: string
    organizationName?: string
    rif?: string
    bcvRate?: number
}

export default function Header({ user, fullName, organizationName, rif, bcvRate }: HeaderProps) {
    const displayName = fullName ? fullName.split(' ')[0] : (user.email?.split('@')[0] || 'Usuario')
    return (
        <header className="bg-white shadow-sm sticky top-0 z-30">
            <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center space-x-6">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold text-primary-900 leading-tight">
                            {organizationName || 'Panel de Control'}
                        </h2>
                        {rif && (
                            <span className="text-xs text-primary-600 font-medium">
                                RIF: {rif}
                            </span>
                        )}
                    </div>
                    <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
                    <GlobalSearch />
                </div>

                <div className="flex items-center space-x-6">
                    {bcvRate && (
                        <div className="hidden lg:flex flex-col items-end px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-lg">
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Tasa Oficial BCV</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-black text-blue-900 leading-none">
                                    {bcvRate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                <span className="text-[10px] font-bold text-blue-700 leading-none mt-0.5">Bs/USD</span>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-tighter">Usuario</span>
                        <span className="text-sm font-bold text-gray-900 leading-tight">
                            {displayName}
                        </span>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all group"
                        title="Cerrar Sesión"
                    >
                        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    )
}
