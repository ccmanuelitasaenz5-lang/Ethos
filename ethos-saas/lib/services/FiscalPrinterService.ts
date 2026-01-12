export interface FiscalPrinterConfig {
    ip: string
    port?: number
    brand?: 'THE_FACTORY' | 'PNP' | 'HKA'
}

export interface FiscalDocument {
    customerName: string
    customerRif: string
    items: {
        description: string
        quantity: number
        price: number
        taxRate: number // 16.00
    }[]
    paymentMethod: string
}

export abstract class FiscalPrinterService {
    protected config: FiscalPrinterConfig

    constructor(config: FiscalPrinterConfig) {
        this.config = config
    }

    abstract checkStatus(): Promise<boolean>
    abstract printInvoice(doc: FiscalDocument): Promise<{ invoiceNumber: string, fiscalSerial: string }>
    abstract printZReport(): Promise<any>
}

export class MockFiscalPrinter extends FiscalPrinterService {
    async checkStatus() { return true }

    async printInvoice(doc: FiscalDocument) {
        console.log('Printing to Mock Fiscal Printer:', doc)
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        return {
            invoiceNumber: '000' + Math.floor(Math.random() * 10000).toString(),
            fiscalSerial: 'Z' + Math.floor(Math.random() * 10000000).toString()
        }
    }

    async printZReport() {
        return { date: new Date(), total: 0 }
    }
}
