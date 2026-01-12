export interface DigitalInvoiceProvider {
    emitInvoice(doc: any): Promise<{ success: boolean, pdfUrl?: string, xmlUrl?: string, number?: string, error?: string }>
    cancelInvoice(number: string, reason: string): Promise<{ success: boolean, error?: string }>
}
