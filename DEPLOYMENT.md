# ETHOS v2.0 - Guía de Deployment en Vercel

Esta guía te ayudará a desplegar ETHOS v2.0 en Vercel de forma rápida y sencilla.

---

## 📋 Requisitos Previos

- [ ] Cuenta en [Vercel](https://vercel.com) (gratuita)
- [ ] Cuenta en [Supabase](https://supabase.com) (gratuita)
- [ ] Repositorio en GitHub (puedes crear uno nuevo)
- [ ] Proyecto Supabase configurado y migraciones ejecutadas

---

## 🚀 Paso 1: Preparar el Repositorio

### 1.1 Inicializar Git (si no está inicializado)

```bash
cd "d:\Aplicaciones\Contabilidad\Ethos V.2\ethos-saas"
git init
```

### 1.2 Crear archivo .gitignore (si no existe)

Asegúrate de que `.gitignore` incluya:

```
node_modules/
.next/
.env*.local
.env
.vercel
*.tsbuildinfo
```

### 1.3 Hacer commit inicial

```bash
git add .
git commit -m "Initial commit - ETHOS v2.0"
```

### 1.4 Crear repositorio en GitHub

1. Ve a [GitHub](https://github.com/new)
2. Crea un nuevo repositorio (público o privado)
3. **NO** inicialices con README, .gitignore o licencia (ya los tienes)

### 1.5 Conectar repositorio local con GitHub

```bash
git remote add origin https://github.com/tu-usuario/ethos-saas.git
git branch -M main
git push -u origin main
```

---

## 🌐 Paso 2: Configurar Vercel

### 2.1 Importar Proyecto

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Clic en **"Add New Project"**
3. Selecciona **"Import Git Repository"**
4. Conecta tu cuenta de GitHub si es necesario
5. Selecciona el repositorio `ethos-saas`
6. Clic en **"Import"**

### 2.2 Configurar el Proyecto

Vercel detectará automáticamente que es un proyecto Next.js:

- **Framework Preset**: Next.js (detectado automáticamente)
- **Root Directory**: `./` (raíz del proyecto)
- **Build Command**: `npm run build` (automático)
- **Output Directory**: `.next` (automático)
- **Install Command**: `npm install` (automático)

### 2.3 Configurar Variables de Entorno

Antes de hacer deploy, configura las variables de entorno:

1. En la sección **"Environment Variables"**, agrega:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
```

2. Para cada variable:
   - Clic en **"Add"**
   - Ingresa el nombre de la variable
   - Ingresa el valor
   - Selecciona los ambientes: **Production**, **Preview**, **Development**
   - Clic en **"Save"**

**⚠️ Importante**: 
- `NEXT_PUBLIC_APP_URL` debe ser la URL de Vercel después del primer deploy
- Puedes actualizarla después del primer deploy si es necesario

### 2.4 Hacer Deploy

1. Clic en **"Deploy"**
2. Espera a que el build complete (2-5 minutos)
3. Verifica que no haya errores en el log de build

---

## ✅ Paso 3: Verificar Deployment

### 3.1 Verificar Build Exitoso

- [ ] El build completa sin errores
- [ ] No hay warnings críticos
- [ ] La URL de producción está disponible

### 3.2 Probar la Aplicación

1. Abre la URL proporcionada por Vercel (ej: `https://ethos-saas.vercel.app`)
2. Verifica:
   - [ ] La página carga correctamente
   - [ ] El login funciona
   - [ ] El signup funciona
   - [ ] El dashboard se muestra correctamente
   - [ ] Las transacciones se cargan

### 3.3 Actualizar Variables de Entorno (si es necesario)

Si necesitas actualizar `NEXT_PUBLIC_APP_URL`:

1. Ve a **Settings** → **Environment Variables**
2. Edita `NEXT_PUBLIC_APP_URL`
3. Cambia el valor a tu URL de Vercel
4. Haz un nuevo deploy (Vercel lo hará automáticamente en el próximo push)

---

## 🔄 Paso 4: Configurar Deploy Automático

### 4.1 Deploy Automático

Vercel ya está configurado para hacer deploy automático:
- Cada push a `main` → deploy a producción
- Cada push a otras ramas → deploy de preview

### 4.2 Verificar Webhooks

Los webhooks de GitHub a Vercel se configuran automáticamente. Puedes verificar en:
- Vercel Dashboard → Settings → Git
- GitHub → Settings → Webhooks

---

## 🌍 Paso 5: Configurar Dominio Personalizado (Opcional)

### 5.1 Agregar Dominio

1. Ve a **Settings** → **Domains**
2. Ingresa tu dominio (ej: `ethos.tu-dominio.com`)
3. Sigue las instrucciones de Vercel para configurar DNS

### 5.2 Configurar DNS

Agrega un registro CNAME en tu proveedor de DNS:

```
Tipo: CNAME
Nombre: ethos (o el subdominio que prefieras)
Valor: cname.vercel-dns.com
```

### 5.3 Actualizar Variables de Entorno

Actualiza `NEXT_PUBLIC_APP_URL` con tu dominio personalizado.

---

## 🔧 Configuración Avanzada

### Verificar Build Localmente

Antes de hacer deploy, verifica que el build funciona:

```bash
npm run build
npm run start
```

### Variables de Entorno por Ambiente

Puedes configurar variables diferentes para:
- **Production**: Variables para producción
- **Preview**: Variables para branches de preview
- **Development**: Variables para desarrollo local

### Monitoreo y Analytics

Vercel incluye analytics básico. Para más funcionalidades:
- Configura Vercel Analytics en el código
- Integra con Sentry para error tracking
- Usa Vercel Speed Insights para performance

---

## 🐛 Troubleshooting

### Error: "Build Failed"

**Causas comunes:**
- Variables de entorno faltantes
- Errores de TypeScript
- Dependencias no instaladas correctamente

**Solución:**
1. Revisa el log de build en Vercel
2. Verifica que todas las variables de entorno estén configuradas
3. Ejecuta `npm run build` localmente para identificar errores

### Error: "Environment Variable Not Found"

**Solución:**
1. Ve a Settings → Environment Variables
2. Verifica que todas las variables estén agregadas
3. Asegúrate de que estén habilitadas para el ambiente correcto (Production/Preview)

### Error: "Cannot connect to Supabase"

**Solución:**
1. Verifica que las credenciales de Supabase sean correctas
2. Verifica que el proyecto de Supabase esté activo
3. Verifica que las políticas RLS permitan acceso desde Vercel

### La aplicación carga pero no funciona

**Solución:**
1. Abre la consola del navegador (F12)
2. Revisa errores en la consola
3. Verifica que las variables de entorno estén disponibles en el cliente (deben empezar con `NEXT_PUBLIC_`)

---

## 📊 Monitoreo Post-Deployment

### Verificar Logs

1. Ve a Vercel Dashboard → Tu Proyecto → **Logs**
2. Revisa logs de producción para errores

### Verificar Performance

1. Ve a Vercel Dashboard → Tu Proyecto → **Analytics**
2. Revisa métricas de performance
3. Identifica páginas lentas o con errores

### Configurar Alertas

1. Ve a Settings → **Notifications**
2. Configura alertas para:
   - Deployments fallidos
   - Errores en producción
   - Performance degradado

---

## 🔐 Seguridad en Producción

### Checklist de Seguridad

- [ ] Variables de entorno sensibles no están en el código
- [ ] `SUPABASE_SERVICE_ROLE_KEY` solo se usa en server-side
- [ ] RLS está configurado correctamente en Supabase
- [ ] HTTPS está habilitado (automático en Vercel)
- [ ] Headers de seguridad están configurados (si es necesario)

### Recomendaciones

1. **Nunca** commitees archivos `.env.local` o `.env`
2. Usa variables de entorno de Vercel para secretos
3. Revisa regularmente los logs de acceso
4. Mantén las dependencias actualizadas

---

## 📈 Optimizaciones

### Performance

- [ ] Imágenes optimizadas (usar `next/image`)
- [ ] Código minificado (automático en Vercel)
- [ ] Caching configurado correctamente
- [ ] Lazy loading de componentes pesados

### SEO

- [ ] Meta tags configurados
- [ ] Sitemap generado (si aplica)
- [ ] Robots.txt configurado (si aplica)

---

## ✅ Checklist Final

- [ ] Repositorio en GitHub creado y conectado
- [ ] Proyecto importado en Vercel
- [ ] Variables de entorno configuradas
- [ ] Build exitoso
- [ ] Aplicación funciona en producción
- [ ] Dominio personalizado configurado (opcional)
- [ ] Monitoreo configurado
- [ ] Documentación actualizada

---

## 🎉 ¡Listo!

Tu aplicación ETHOS v2.0 está desplegada en Vercel y lista para usar.

**URL de producción**: `https://tu-app.vercel.app`

**Próximos pasos**:
1. Compartir la URL con usuarios
2. Configurar dominio personalizado (opcional)
3. Configurar monitoreo y alertas
4. Revisar logs regularmente

---

**Última actualización**: Enero 2026  
**Versión**: 2.0.0
