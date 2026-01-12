'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { ReportData } from '@/app/actions/reports'
import JournalPDF from './JournalPDF'

// Dynamic import is essential for @react-pdf/renderer in Next.js to avoid SSR errors
const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
    {
        ssr: false,
        loading: () => (
            <button disabled className="px-4 py-2 bg-gray-100 text-gray-400 font-bold rounded-lg cursor-wait flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cargando motor PDF...
            </button>
        ),
    }
)

interface PDFDownloadButtonProps {
    reportType: 'journal' | 'ledger' | 'balance'
    data: ReportData
    fileName?: string
    label?: string
    className?: string
}

export default function PDFDownloadButton({
    reportType,
    data,
    fileName = 'reporte.pdf',
    label = 'Descargar PDF',
    className
}: PDFDownloadButtonProps) {

    // Select the correct PDF template based on reportType
    const getDocument = () => {
        switch (reportType) {
            case 'journal':
                return <JournalPDF data={data} />
            // TODO: Add other report templates here
            default:
                return <JournalPDF data={data} />
        }
    }

    const defaultClasses = "inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors shadow-sm"

    return (
        <PDFDownloadLink
            document={getDocument()}
            fileName={fileName}
            className={className || defaultClasses}
        >
            {({ blob, url, loading, error }) => (
                <>
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generando...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            {label}
                        </>
                    )}
                </>
            )}
        </PDFDownloadLink>
    )
}
