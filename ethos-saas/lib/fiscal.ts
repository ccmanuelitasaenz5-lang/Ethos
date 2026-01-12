import { createClient } from '@/lib/supabase/server'

// Configuration constants (Default)
// These could be moved to the database 'tax_config' table later
export const TAX_RATES = {
    IVA_GENERAL: 16.00,
    IVA_REDUCED: 8.00,
    IVA_LUXURY: 26.00, // 16% + 15% surcharge usually, but simplified to rate
    IGTF: 3.00,
    ISLR_RETENTION_DEFAULT: 0 // Depends on concept
}

// Helper to round currency to 2 decimals standard
export function roundCurrency(amount: number): number {
    return Math.round((amount + Number.EPSILON) * 100) / 100
}

export function calculateIVA(baseAmount: number, rate: number = TAX_RATES.IVA_GENERAL) {
    const ivaAmount = roundCurrency(baseAmount * (rate / 100))
    const total = roundCurrency(baseAmount + ivaAmount)
    return { ivaAmount, total }
}

export function calculateIGTF(amountVes: number, isForeignCurrencyPayment: boolean) {
    if (!isForeignCurrencyPayment) return 0

    const igtfAmount = roundCurrency(amountVes * (TAX_RATES.IGTF / 100))
    return igtfAmount
}

// Basic implementation of Decreto 1.808 Retention Table
// This should eventually query a 'retention_concepts' table
export function getISLRRetentionRate(conceptCode: string, entityType: 'PJ' | 'PN'): { percent: number, subtract: number } {
    // Example codes (Simplified)
    const TABLE: Record<string, { pj: number, pn: number, subtract_pj: number, subtract_pn: number }> = {
        'HON_PROF': { pj: 5, pn: 3, subtract_pj: 0, subtract_pn: 268 }, // Honorarios Profesionales
        'SERV_GEN': { pj: 2, pn: 1, subtract_pj: 0, subtract_pn: 0 },   // Servicios en General
        'ALQ_COM': { pj: 5, pn: 3, subtract_pj: 0, subtract_pn: 0 },   // Alquiler Comercial
    }

    const rate = TABLE[conceptCode]
    if (!rate) return { percent: 0, subtract: 0 }

    return {
        percent: entityType === 'PJ' ? rate.pj : rate.pn,
        subtract: entityType === 'PJ' ? rate.subtract_pj : rate.subtract_pn
    }
}

export function calculateISLR(baseAmount: number, conceptCode: string, entityType: 'PJ' | 'PN') {
    const { percent, subtract } = getISLRRetentionRate(conceptCode, entityType)
    let retention = (baseAmount * (percent / 100)) - subtract
    return Math.max(0, roundCurrency(retention))
}

/**
 * Generates a standard SENIAT-compliant control number format
 * Format: 00-000000 or similar depending on provider.
 * For manual input we might just validate.
 */

export function validateControlNumber(control: string): boolean {
    // Regex for standard formats e.g., 00-00000000
    // Adjust based on specific provider requirements
    return /^[\d-]{1,20}$/.test(control)
}

/**
 * Generates the specific Retetion Receipt Number (Comprobante de Retención)
 * Format: YYYYMM + AgentRIF + Sequence (8 digits)
 * Example: 202401J12345678900000005
 */
export function generateRetentionCode(date: Date, agentRif: string, sequence: number): string {
    const yyyymm = date.toISOString().slice(0, 7).replace('-', '') // 202401
    const rif = agentRif.replace('-', '').toUpperCase() // J123456789
    const seq = sequence.toString().padStart(8, '0') // 00000005
    return `${yyyymm}${rif}${seq}`
}
