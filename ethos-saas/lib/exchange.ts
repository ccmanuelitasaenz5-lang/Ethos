'use server'

/**
 * Utility to fetch the official exchange rate (USD to VES) from BCV (Banco Central de Venezuela)
 */
export async function getBCVRate(): Promise<number> {
    const FALLBACK_RATE = 311.88 // Updated to current verified rate

    return new Promise((resolve) => {
        const https = require('https')

        const options = {
            hostname: 'www.bcv.org.ve',
            port: 443,
            path: '/',
            method: 'GET',
            rejectUnauthorized: false, // Bypass SSL issue
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            }
        }

        const req = https.request(options, (res: any) => {
            let data = ''
            res.on('data', (chunk: any) => { data += chunk })
            res.on('end', () => {
                // Attempt 1: Specific ID and Strong tag
                const dolarRegex = /id="dolar"[\s\S]*?<strong>\s*([\d,.]+)\s*<\/strong>/i
                // Attempt 2: Search for USD text near a rate
                const usdNearRegex = /USD[\s\S]*?<strong>\s*([\d,.]+)\s*<\/strong>/i

                const match = data.match(dolarRegex) || data.match(usdNearRegex)

                if (match && match[1]) {
                    const valueStr = match[1].trim().replace(',', '.')
                    const rate = parseFloat(valueStr)
                    if (!isNaN(rate) && rate > 0) {
                        console.log('BCV Rate successfully updated (via https):', rate)
                        resolve(rate)
                        return
                    }
                }
                console.warn('BCV Rate not found in HTML response')
                resolve(FALLBACK_RATE)
            })
        })

        req.on('error', (error: any) => {
            console.error('Error fetching BCV rate (https):', error)
            resolve(FALLBACK_RATE)
        })

        req.end()
    })
}
