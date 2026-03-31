# ETHOS v2.0 - Sistema de Contabilidad para OSFL

Sistema de contabilidad diseñado específicamente para Organizaciones Sin Fines de Lucro (OSFL) venezolanas, con enfoque en condominios y comunidades organizadas.

> **🚀 [Guía de Inicio Rápido](./QUICKSTART.md)** - Pon en marcha ETHOS en menos de 10 minutos

## 🚀 Características

- ✅ **Multi-tenant**: Soporte para múltiples organizaciones con aislamiento de datos
- ✅ **Dashboard Financiero**: KPIs en tiempo real (ingresos, gastos, balance)
- ✅ **Gestión de Ingresos**: Registro de recibos con conversión USD/VES automática
- ✅ **Gestión de Gastos**: Cálculo automático de IVA (16%) y retenciones
- ✅ **Reportes Financieros**: Resumen completo con filtros por período y categorías
- ✅ **Exportación a Excel**: Descarga ingresos, gastos y resumen financiero
- ✅ **Seguridad**: Row Level Security (RLS) en PostgreSQL
- ✅ **Autenticación**: Sistema de login con roles (admin, auditor, resident)
- 🔄 **Próximamente**: Inventario, Expediente Digital, Gráficos avanzados

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), React 18, TailwindCSS
- **Backend**: Next.js Server Actions
- **Base de Datos**: PostgreSQL (Supabase)
- **Autenticación**: Supabase Auth
- **Hosting**: Vercel
- **Lenguaje**: TypeScript

## 📋 Requisitos Previos

- Node.js 18+ y npm
- Cuenta en [Supabase](https://supabase.com) (gratuita)
- Cuenta en [Vercel](https://vercel.com) (gratuita)

## 🔧 Instalación Local

### 1. Clonar el repositorio

```bash
cd "d:\Aplicaciones\Contabilidad\Ethos V.2\ethos-saas"
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

#### a) Crear proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Guarda las credenciales (URL y Anon Key)

#### b) Ejecutar migraciones de base de datos

1. En el panel de Supabase, ve a **SQL Editor**
2. Copia y pega el contenido de `supabase/migrations/001_initial_schema.sql`
3. Ejecuta el script (Run)

### 4. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Iniciar servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 👤 Crear Primera Organización y Usuario

### Opción 1: Mediante SQL (Recomendado para pruebas)

En el SQL Editor de Supabase:

```sql
-- 1. Crear organización
INSERT INTO organizations (name, rif, address, email)
VALUES ('Mi Condominio', 'J-12345678-9', 'Calle Principal', 'info@micondominio.com');

-- 2. Registrar usuario en la app (signup)
-- Luego vincular a la organización:
INSERT INTO users (id, organization_id, role, full_name)
VALUES (
  'uuid-del-usuario-auth',  -- Obtenido de auth.users después del signup
  (SELECT id FROM organizations WHERE name = 'Mi Condominio'),
  'admin',
  'Juan Pérez'
);
```

### Opción 2: Mediante la aplicación

1. Regístrate en `/signup`
2. Usa SQL para vincular tu usuario a una organización (ver Opción 1, paso 2)

## 📊 Uso del Sistema

### Dashboard
- Visualiza ingresos totales, gastos totales y balance
- Revisa las últimas 10 transacciones

### Ingresos
- Clic en "Nuevo Ingreso"
- Completa: fecha, concepto, monto USD
- Opcional: tasa de cambio para conversión a VES
- Guarda y verifica en la tabla

### Gastos
- Clic en "Nuevo Gasto"
- Completa: proveedor, concepto, subtotal
- El IVA se calcula automáticamente (16% por defecto)
- Opcional: retenciones de IVA e ISLR
- Guarda y verifica en la tabla

## 🚀 Deployment en Vercel

### 1. Conectar repositorio

```bash
# Inicializar Git (si no está inicializado)
git init
git add .
git commit -m "Initial commit - ETHOS v2.0"

# Crear repositorio en GitHub y conectar
git remote add origin https://github.com/tu-usuario/ethos-saas.git
git push -u origin main
```

### 2. Importar en Vercel

1. Ve a [https://vercel.com](https://vercel.com)
2. Clic en "Add New Project"
3. Importa tu repositorio de GitHub
4. Configura las variables de entorno (mismas que `.env.local`)
5. Deploy

### 3. Configurar dominio (opcional)

En Vercel → Settings → Domains, agrega tu dominio personalizado.

## 🗂️ Estructura del Proyecto

```
ethos-saas/
├── app/
│   ├── actions/          # Server Actions (auth, income, expense)
│   ├── dashboard/        # Páginas del dashboard
│   │   ├── ingresos/
│   │   ├── gastos/
│   │   └── page.tsx
│   ├── login/
│   ├── signup/
│   └── layout.tsx
├── components/
│   ├── layout/           # Sidebar, Header
│   ├── dashboard/        # StatsCards, RecentTransactions
│   ├── ingresos/         # IncomeTable, IncomeForm
│   └── gastos/           # ExpenseTable, ExpenseForm
├── lib/
│   └── supabase/         # Clientes de Supabase
├── types/
│   └── database.ts       # TypeScript interfaces
├── supabase/
│   └── migrations/       # SQL migrations
└── public/
```

## 🔒 Seguridad

- **Row Level Security (RLS)**: Cada organización solo ve sus propios datos
- **Autenticación**: JWT tokens manejados por Supabase
- **Roles**: Admin (CRUD completo), Auditor (solo lectura), Resident (limitado)

## 📝 Roadmap

- [x] Autenticación y autorización (roles: admin, auditor, resident)
- [x] Dashboard con KPIs en tiempo real
- [x] Módulo de Ingresos con conversión USD/VES
- [x] Módulo de Gastos con IVA, ISLR e IGTF
- [x] Reportes financieros con filtros por período y categorías
- [x] Exportación a Excel (ingresos, gastos, resumen)
- [x] Módulo de Inventario (activos fijos con depreciación)
- [x] Expediente Digital (documentos en Supabase Storage)
- [x] Libro Diario y Mayor contable
- [x] Gráficos interactivos (Recharts)
- [x] Exportación a PDF (react-pdf/renderer)
- [x] Sistema de backup y logs de auditoría
- [x] Portal del Residente
- [x] Rate limiting y logs de seguridad
- [x] Módulo Bancario con conciliación
- [x] Cierre mensual por períodos
- [ ] Notificaciones por email
- [ ] Facturación electrónica SENIAT

## 🤝 Contribuir

Este proyecto está en desarrollo activo. Para contribuir:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto para uso en organizaciones sin fines de lucro venezolanas.

## 📧 Soporte

Para preguntas o soporte, contacta a [tu-email@ejemplo.com]

---

**ETHOS v2.0** - Desarrollado con ❤️ para comunidades venezolanas
