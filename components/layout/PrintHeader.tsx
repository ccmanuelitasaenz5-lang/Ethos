'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Logo from '@/components/brand/Logo'

interface PrintHeaderProps {
    title: string
    organizationName: string
}

export default function PrintHeader({ title, organizationName }: PrintHeaderProps) {
    return (
        <div className="print-header w-full mb-8 border-b-2 border-gray-900 pb-4">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <Logo className="w-12 h-12" showText={false} />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 uppercase">{organizationName}</h1>
                        <p className="text-sm text-gray-600 mt-1">Sistema de Gestión Contable - ETHOS v2.0</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Generado el: {format(new Date(), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                    </p>
                </div>
            </div>
        </div>
    )
}
