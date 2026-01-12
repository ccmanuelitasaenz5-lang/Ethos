import { format } from 'date-fns'

/**
 * Utility to generate SENIAT XML/TXT formats for ISLR Retentions
 */

interface RetentionDetail {
    rifRetained: string
    invoiceNumber: string
    controlNumber: string
    transactionDate: Date // Fecha de Operacion
    code: string // Concept code e.g. "001"
    baseAmount: number
    retentionPercent: number
}

// Helper to format numbers for XML (1234.56 -> 1234.56)
const fmtNum = (num: number) => num.toFixed(2)

// Helper to format date (dd/mm/yyyy for visual, YYYY-MM-DD for standard)
// SENIAT usually expects YYYYMM or DD/MM/YYYY depending on specific file.
// For XML standard:
const fmtDate = (d: Date) => format(d, 'dd/MM/yyyy')

export function generateISLRXml(data: any[], rifAgent: string, period: string) {
    // Structure based on common SENIAT ISLR XML schema
    // <RelacionRetencionesISLR RifAgente="J000000000" Periodo="202401">
    //   <DetalleRetencion>
    //     <RifRetenido>J123456789</RifRetenido>
    //     <NumeroFactura>001</NumeroFactura>
    //     <NumeroControl>00-00001</NumeroControl>
    //     <FechaOperacion>01/01/2024</FechaOperacion>
    //     <CodigoConcepto>001</CodigoConcepto>
    //     <MontoOperacion>100.00</MontoOperacion>
    //     <PorcentajeRetencion>75.00</PorcentajeRetencion>
    //   </DetalleRetencion>
    // </RelacionRetencionesISLR>

    let xml = `<?xml version="1.0" encoding="ISO-8859-1"?>\n`
    xml += `<RelacionRetencionesISLR RifAgente="${rifAgent}" Periodo="${period}">\n`

    data.forEach(item => {
        // Safe defaults
        const rifRetained = item.supplier_rif || 'J000000000'
        const invoiceNumber = item.invoice_number || '0'
        const controlNumber = item.control_number || '0'
        const date = new Date(item.date)
        const code = item.islr_concept_code || '001' // Would need new field in Expense or logic to map
        const base = item.subtotal || 0
        const percent = item.retention_islr && base > 0 ? (item.retention_islr / base * 100) : 0

        xml += `\t<DetalleRetencion>\n`
        xml += `\t\t<RifRetenido>${rifRetained}</RifRetenido>\n`
        xml += `\t\t<NumeroFactura>${invoiceNumber}</NumeroFactura>\n`
        xml += `\t\t<NumeroControl>${controlNumber}</NumeroControl>\n`
        xml += `\t\t<FechaOperacion>${fmtDate(date)}</FechaOperacion>\n`
        xml += `\t\t<CodigoConcepto>${code}</CodigoConcepto>\n`
        xml += `\t\t<MontoOperacion>${fmtNum(base)}</MontoOperacion>\n`
        xml += `\t\t<PorcentajeRetencion>${fmtNum(percent)}</PorcentajeRetencion>\n`
        xml += `\t</DetalleRetencion>\n`
    })

    xml += `</RelacionRetencionesISLR>`
    return xml
}

export function generateIVAFile(data: any[]) {
    // TBD for future. Usually a TXT file with specific columns separated by tabs.
    return ""
}
