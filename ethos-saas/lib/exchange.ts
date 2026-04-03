'use server'
 
import { createClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
 
const FALLBACK_RATE = 311.88
 
// ── Scraping BCV (solo se llama internamente) ──────────
async function scrapeBCVRate(): Promise<number> {
  return new Promise((resolve) => {
    const https = require('https')
    const options = {
      hostname: 'www.bcv.org.ve',
      port: 443, path: '/', method: 'GET',
      // REMOVIDO: rejectUnauthorized: false
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }
    const req = https.request(options, (res: any) => {
      let data = ''
      res.on('data', (c: any) => { data += c })
      res.on('end', () => {
        const match = data.match(/id="dolar"[\s\S]*?<strong>\s*([\d,.]+)\s*<\/strong>/i)
        if (match?.[1]) {
          const rate = parseFloat(match[1].replace(',', '.'))
          if (!isNaN(rate) && rate > 0) { resolve(rate); return }
        }
        resolve(FALLBACK_RATE)
      })
    })
    req.on('error', () => resolve(FALLBACK_RATE))
    req.end()
  })
}
 
// ── Obtener tasa del día (con persistencia) ────────────
export async function getTodayRate(): Promise<number> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
 
  // 1. Buscar en BD primero
  const { data: stored } = await supabase
    .from('exchange_rates')
    .select('rate_usd_ves')
    .eq('date', today)
    .maybeSingle()
 
  if (stored) return stored.rate_usd_ves
 
  // 2. No está en BD — hacer scraping y guardar
  const rate = await scrapeBCVRate()
  await supabase.from('exchange_rates').upsert({
    date: today, rate_usd_ves: rate, source: 'BCV'
  }, { onConflict: 'date' })
 
  return rate
}
 
// ── Con caché de Next.js (revalida cada hora) ──────────
// IMPORTANTE: No usamos unstable_cache con el cliente de servidor (cookies)
// porque causa un crash en Next.js 14. Usamos un fetch directo para la tasa pública.
export const getBCVRate = async () => {
  return getTodayRate()
}
 
// ── Tasa de una fecha específica (para registros históricos)
export async function getRateForDate(date: string): Promise<number> {
  const supabase = await createClient()
 
  const { data } = await supabase
    .from('exchange_rates')
    .select('rate_usd_ves')
    .eq('date', date)
    .maybeSingle()
 
  // Si no hay tasa exacta, tomar la más cercana anterior
  if (!data) {
    const { data: closest } = await supabase
      .from('exchange_rates')
      .select('rate_usd_ves, date')
      .lt('date', date)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle()
    return closest?.rate_usd_ves ?? FALLBACK_RATE
  }
 
  return data.rate_usd_ves
}
