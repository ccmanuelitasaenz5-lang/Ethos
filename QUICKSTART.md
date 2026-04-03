# ETHOS v2.0 - Guía de Inicio Rápido

Esta guía te ayudará a poner en marcha ETHOS v2.0 en menos de 10 minutos.

## ⚡ Inicio Rápido

### 1. Configurar Supabase (5 minutos)

1. **Crear cuenta y proyecto**:
   - Ve a [supabase.com](https://supabase.com)
   - Crea una cuenta gratuita
   - Crea un nuevo proyecto
   - Región recomendada: South America (São Paulo)

2. **Ejecutar migración de base de datos**:
   - En Supabase, ve a **SQL Editor**
   - Abre el archivo `supabase/migrations/001_initial_schema.sql`
   - Copia TODO el contenido
   - Pégalo en el SQL Editor
   - Clic en "Run"

3. **Obtener credenciales**:
   - Ve a **Settings** → **API**
   - Copia:
     - Project URL
     - anon public key
     - service_role key (opcional)

### 2. Configurar Variables de Entorno (1 minuto)

Crea el archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Instalar y Ejecutar (2 minutos)

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### 4. Crear Primera Organización (2 minutos)

#### Opción A: Mediante SQL (Recomendado)

En el SQL Editor de Supabase:

```sql
-- Crear organización
INSERT INTO organizations (name, rif, address, email)
VALUES ('Mi Condominio', 'J-12345678-9', 'Caracas, Venezuela', 'admin@micondominio.com')
RETURNING id;
```

Guarda el `id` que te devuelve.

#### Opción B: Registro en la App

1. Ve a `/signup` en tu navegador
2. Completa el formulario de registro
3. Luego vincula tu usuario a la organización con SQL (ver abajo)

### 5. Vincular Usuario a Organización

Después de registrarte en la app:

1. Ve a **Authentication** → **Users** en Supabase
2. Copia el **UUID** de tu usuario
3. En SQL Editor:

```sql
INSERT INTO users (id, organization_id, role, full_name)
VALUES (
  'uuid-de-tu-usuario',  -- UUID copiado
  (SELECT id FROM organizations WHERE name = 'Mi Condominio'),
  'admin',
  'Tu Nombre Completo'
);
```

### 6. ¡Listo! 🎉

Ahora puedes:
- ✅ Iniciar sesión en `/login`
- ✅ Ver el dashboard financiero
- ✅ Registrar ingresos y gastos
- ✅ Exportar reportes a Excel

---

## 📊 Funcionalidades Disponibles

### Dashboard
- KPIs en tiempo real (ingresos, gastos, balance)
- Últimas 10 transacciones
- Resumen visual con gráficos

### Ingresos
- Registro de recibos
- Conversión automática USD → VES
- Exportación a Excel
- Métodos de pago

### Gastos
- Registro de facturas
- Cálculo automático de IVA (16%)
- Retenciones (IVA e ISLR)
- Categorización
- Exportación a Excel

### Reportes
- Resumen financiero completo
- Filtros por período (mes, trimestre, histórico)
- Gastos por categoría
- Exportación multi-hoja a Excel

---

## 🚀 Deployment en Vercel (Opcional)

### Preparar Repositorio

```bash
git init
git add .
git commit -m "Initial commit - ETHOS v2.0"
git remote add origin https://github.com/tu-usuario/ethos-saas.git
git push -u origin main
```

### Desplegar

1. Ve a [vercel.com](https://vercel.com)
2. Clic en "Add New Project"
3. Importa tu repositorio de GitHub
4. Configura las variables de entorno (mismas que `.env.local`)
5. Clic en "Deploy"

¡Tu app estará en línea en ~2 minutos!

---

## 🆘 Problemas Comunes

### "Usuario no asociado a una organización"
**Solución**: Ejecuta el paso 5 (vincular usuario)

### "No se pudo conectar a Supabase"
**Solución**: Verifica las credenciales en `.env.local`

### Tablas no aparecen en Supabase
**Solución**: Ejecuta nuevamente la migración SQL (paso 1.2)

### Error al exportar a Excel
**Solución**: Verifica que `xlsx` esté instalado: `npm install xlsx`

---

## 📚 Documentación Completa

- [README.md](./README.md) - Documentación completa
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Guía detallada de Supabase

---

## 🎯 Próximos Pasos

Una vez que tengas el sistema funcionando:

1. **Personaliza tu organización**: Edita nombre, RIF, dirección
2. **Invita usuarios**: Crea más usuarios con roles (admin, auditor)
3. **Registra transacciones**: Comienza a llevar tu contabilidad
4. **Genera reportes**: Exporta tus datos a Excel
5. **Despliega en producción**: Usa Vercel para tener tu app en línea

---

**¿Necesitas ayuda?** Revisa la documentación completa o contacta al soporte.
