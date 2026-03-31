#!/usr/bin/env node
/**
 * Script de verificación de variables de entorno
 * Ejecutar con: npx tsx scripts/check-env.ts
 * o: npm run check-env (si se agrega al package.json)
 */

const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_APP_URL'
]

const optionalEnvVars = [
    'RESEND_API_KEY',
    'SENTRY_DSN',
    'VERCEL_ANALYTICS_ID'
]

function checkEnvVars() {
    console.log('🔍 Verificando variables de entorno...\n')
    
    const missing: string[] = []
    const present: string[] = []
    const optionalPresent: string[] = []
    
    // Verificar variables requeridas
    requiredEnvVars.forEach(varName => {
        const value = process.env[varName]
        if (!value || value.trim() === '') {
            missing.push(varName)
        } else {
            present.push(varName)
            // Ocultar valores sensibles
            const displayValue = varName.includes('KEY') || varName.includes('SECRET')
                ? `${value.substring(0, 10)}...`
                : value
            console.log(`✅ ${varName}: ${displayValue}`)
        }
    })
    
    // Verificar variables opcionales
    optionalEnvVars.forEach(varName => {
        const value = process.env[varName]
        if (value && value.trim() !== '') {
            optionalPresent.push(varName)
            console.log(`ℹ️  ${varName}: Configurada (opcional)`)
        }
    })
    
    console.log('\n' + '='.repeat(50) + '\n')
    
    if (missing.length > 0) {
        console.error('❌ Variables de entorno faltantes:')
        missing.forEach(varName => {
            console.error(`   - ${varName}`)
        })
        console.error('\n💡 Crea un archivo .env.local con estas variables.')
        console.error('   Puedes usar .env.local.example como referencia.\n')
        process.exit(1)
    }
    
    // Validaciones adicionales
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
        console.warn('⚠️  NEXT_PUBLIC_SUPABASE_URL no parece ser una URL válida de Supabase')
    }
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!
    if (!appUrl.startsWith('http://') && !appUrl.startsWith('https://')) {
        console.warn('⚠️  NEXT_PUBLIC_APP_URL debe comenzar con http:// o https://')
    }
    
    console.log('✅ Todas las variables de entorno requeridas están configuradas')
    console.log(`📊 Variables opcionales configuradas: ${optionalPresent.length}/${optionalEnvVars.length}\n`)
    
    return true
}

// Ejecutar verificación
if (require.main === module) {
    checkEnvVars()
}

export { checkEnvVars }
