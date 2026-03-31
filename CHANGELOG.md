# Changelog - ETHOS v2.0

Todos los cambios notables en este proyecto serán documentados en este archivo.

## [2.0.1] - 2026-01-06

### ✨ Agregado
- **Sistema de Backup Completo**:
  - Exportación JSON con todos los datos de la organización
  - Exportación CSV (ingresos y gastos por separado)
  - Exportación Excel multi-hoja (resumen + detalles)
  - Página de Configuración con información de organización y usuario
  - Componente BackupManager con 3 opciones de respaldo

- **Módulo de Reportes Financieros**:
  - Filtros por período (Todos, Este Mes, Último Trimestre)
  - Tarjetas de resumen (Ingresos, Gastos, Balance)
  - Análisis de gastos por categoría con barras de progreso
  - Estadísticas del período (promedios, totales)
  - Exportación de resumen completo

- **Exportación a Excel**:
  - Botón de exportación en tabla de Ingresos
  - Botón de exportación en tabla de Gastos
  - Exportación de resumen financiero completo
  - Nombres de archivo automáticos con organización y fecha
  - Formato profesional con anchos de columna optimizados

- **Documentación**:
  - QUICKSTART.md - Guía de inicio rápido (10 minutos)
  - CHANGELOG.md - Registro de cambios
  - Walkthrough actualizado con todas las funcionalidades
  - README mejorado con enlace a Quick Start

### 🔧 Mejorado
- Sidebar ahora incluye enlace a Configuración
- Tablas muestran contador de registros
- Páginas de Ingresos y Gastos obtienen nombre de organización
- Mejor organización de componentes y utilidades

### 📚 Documentación
- Guía de inicio rápido completa
- Instrucciones paso a paso para Supabase
- Troubleshooting común
- Roadmap actualizado

---

## [2.0.0] - 2026-01-06

### ✨ Lanzamiento Inicial

#### Infraestructura
- Proyecto Next.js 14 con App Router
- TypeScript para type safety
- TailwindCSS para estilos responsivos
- Configuración de ESLint y Prettier

#### Base de Datos
- Schema PostgreSQL completo
- 5 tablas principales (organizations, users, transactions_income, transactions_expense, assets)
- Row Level Security (RLS) implementado
- Políticas de seguridad por organización y rol
- Índices para optimización de queries
- Triggers para updated_at automático

#### Autenticación
- Sistema de login con email/password
- Registro de nuevos usuarios
- Manejo de sesiones con JWT (Supabase Auth)
- Logout seguro
- Redirección automática según estado de autenticación

#### Dashboard
- 4 KPIs en tiempo real (Ingresos, Gastos, Balance, Transacciones)
- Tabla de últimas 10 transacciones
- Código de colores (verde/rojo)
- Formato de moneda localizado (es-VE)

#### Módulo de Ingresos
- Listado completo de ingresos
- Formulario de registro con validación
- Conversión automática USD → VES
- Métodos de pago (efectivo, transferencia, pago móvil, cheque, tarjeta)
- Código de cuenta contable
- Eliminación de registros

#### Módulo de Gastos
- Listado completo de gastos
- Formulario de registro con validación
- Cálculo automático de IVA (16% por defecto)
- Conversión automática USD → VES
- Retenciones de IVA e ISLR
- Categorización (Servicios, Mantenimiento, Suministros, etc.)
- Eliminación de registros

#### Layout y Navegación
- Sidebar con navegación principal
- Header con información de usuario
- Estado activo en navegación
- Diseño responsivo
- Logout desde header

#### Seguridad
- Row Level Security en todas las tablas
- Aislamiento de datos por organización
- Permisos por rol (admin, auditor, resident)
- Validación de inputs
- Sanitización de datos

#### Documentación
- README completo con instrucciones
- SUPABASE_SETUP.md con guía detallada
- Walkthrough de implementación
- Comentarios en código

---

## Tipos de Cambios
- `✨ Agregado` - Nuevas funcionalidades
- `🔧 Mejorado` - Mejoras en funcionalidades existentes
- `🐛 Corregido` - Corrección de bugs
- `🔒 Seguridad` - Mejoras de seguridad
- `📚 Documentación` - Cambios en documentación
- `⚡ Rendimiento` - Mejoras de rendimiento
- `🗑️ Eliminado` - Funcionalidades eliminadas
