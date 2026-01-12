import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Toaster from '@/components/shared/Toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'ETHOS - Sistema de Contabilidad para OSFL',
    description: 'Sistema de contabilidad diseñado para Organizaciones Sin Fines de Lucro venezolanas',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es">
            <body className={inter.className}>
                {children}
                <Toaster />
            </body>
        </html>
    )
}
