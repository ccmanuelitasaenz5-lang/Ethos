'use client'

import Link from 'next/link'
import Logo from '@/components/brand/Logo'
import { usePathname } from 'next/navigation'
import {
    HomeIcon,
    CurrencyDollarIcon,
    BanknotesIcon,
    ChartBarIcon,
    CubeIcon,
    FolderIcon,
    BookOpenIcon,
    Cog6ToothIcon,
    BuildingLibraryIcon,
    CreditCardIcon,
} from '@heroicons/react/24/outline'

const navigation = [
    { name: 'PANEL PRINCIPAL', href: '/dashboard', icon: HomeIcon },

    { name: 'Ingresos', href: '/dashboard/ingresos', icon: CurrencyDollarIcon },
    { name: 'Gastos', href: '/dashboard/gastos', icon: BanknotesIcon },
    { name: 'Banco', href: '/dashboard/banco', icon: CreditCardIcon },

    { name: 'Inventario', href: '/dashboard/inventario', icon: CubeIcon },
    { name: 'Expediente', href: '/dashboard/expediente', icon: FolderIcon },
    { name: 'Libro Digital', href: '/dashboard/libro-digital', icon: BookOpenIcon },
    { name: 'Reportes', href: '/dashboard/reportes', icon: ChartBarIcon },
    { name: 'Configuración', href: '/dashboard/configuracion', icon: Cog6ToothIcon },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64">
                <div className="flex flex-col flex-grow bg-primary-700 pt-5 pb-4 overflow-y-auto">
                    <div className="flex items-center flex-shrink-0 px-4">
                        <Logo className="w-10 h-10" textColor="text-white" />
                    </div>
                    <nav className="mt-8 flex-1 px-2 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${isActive
                                            ? 'bg-primary-800 text-white'
                                            : 'text-primary-100 hover:bg-primary-600 hover:text-white'
                                        }
                  `}
                                >
                                    <item.icon
                                        className={`mr-3 h-6 w-6 flex-shrink-0 ${isActive ? 'text-white' : 'text-primary-300 group-hover:text-white'
                                            }`}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </div>
        </div>
    )
}
