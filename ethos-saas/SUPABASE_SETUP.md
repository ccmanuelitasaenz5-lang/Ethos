# Guía de Configuración de Supabase para ETHOS

Esta guía te ayudará a configurar Supabase paso a paso para el sistema ETHOS.

## Paso 1: Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com) y crea una cuenta (gratis)
2. Clic en "New Project"
3. Completa:
   - **Name**: ETHOS Production (o el nombre que prefieras)
   - **Database Password**: Genera una contraseña segura (guárdala)
   - **Region**: South America (São Paulo) - más cercano a Venezuela
4. Clic en "Create new project" (tarda ~2 minutos)

## Paso 2: Obtener Credenciales

1. En el panel de Supabase, ve a **Settings** → **API**
2. Copia estos valores:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: La clave pública (anon key)
   - **service_role**: La clave privada (solo para servidor)

## Paso 3: Ejecutar Migraciones de Base de Datos

1. En Supabase, ve a **SQL Editor** (icono de base de datos en el menú lateral)
2. Clic en "New query"
3. Abre el archivo `supabase/migrations/001_initial_schema.sql` de tu proyecto
4. Copia TODO el contenido y pégalo en el editor SQL
5. Clic en "Run" (esquina inferior derecha)
6. Verifica que aparezca "Success. No rows returned"

## Paso 4: Verificar Tablas Creadas

1. Ve a **Table Editor** en Supabase
2. Deberías ver estas tablas:
   - `organizations`
   - `users`
   - `transactions_income`
   - `transactions_expense`
   - `assets`

## Paso 5: Configurar Variables de Entorno

En tu proyecto local, edita `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Paso 6: Crear Primera Organización (Opcional)

En SQL Editor de Supabase:

```sql
INSERT INTO organizations (name, rif, address, phone, email)
VALUES (
  'Condominio Ejemplo',
  'J-12345678-9',
  'Av. Principal, Caracas',
  '+58 212 1234567',
  'admin@ejemplo.com'
);
```

## Paso 7: Vincular Usuario a Organización

Después de registrarte en la app (`/signup`):

1. Ve a **Authentication** → **Users** en Supabase
2. Copia el **UUID** de tu usuario
3. En SQL Editor:

```sql
INSERT INTO users (id, organization_id, role, full_name)
VALUES (
  'uuid-copiado-aqui',
  (SELECT id FROM organizations WHERE name = 'Condominio Ejemplo'),
  'admin',
  'Tu Nombre Completo'
);
```

## Verificación Final

1. Inicia tu app local: `npm run dev`
2. Ve a `http://localhost:3000`
3. Inicia sesión con tu email y contraseña
4. Deberías ver el Dashboard con datos de tu organización

## Troubleshooting

### Error: "Usuario no asociado a una organización"
- Verifica que ejecutaste el Paso 7 correctamente
- Confirma que el UUID del usuario es correcto

### Error: "No se pudo conectar a Supabase"
- Verifica que las credenciales en `.env.local` sean correctas
- Asegúrate de que el proyecto de Supabase esté activo

### Tablas no aparecen
- Verifica que ejecutaste la migración completa (Paso 3)
- Revisa si hay errores en el SQL Editor

### Error: "Invalid login credentials" tras registrarse
- Por defecto, Supabase requiere **verificación de email**.
- Revisa tu bandeja de entrada (o SPAM) y haz clic en el enlace.
- **Para desactivarlo**: Ve a `Authentication` -> `Settings` -> `Email Auth` y apaga "Confirm email".

## Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
