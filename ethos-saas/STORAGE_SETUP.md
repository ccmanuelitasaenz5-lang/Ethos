# Configuración de Supabase Storage para Expediente Digital

Esta guía te ayudará a configurar Supabase Storage para el módulo de Expediente Digital.

## 📦 Paso 1: Crear el Bucket de Storage

1. **Accede a tu proyecto en Supabase**:
   - Ve a [supabase.com](https://supabase.com)
   - Abre tu proyecto ETHOS

2. **Navega a Storage**:
   - En el menú lateral, clic en **Storage**
   - Clic en **Create a new bucket**

3. **Configurar el bucket**:
   ```
   Name: documents
   Public bucket: ✓ (marcado)
   ```
   - Clic en **Create bucket**

## 🔒 Paso 2: Configurar Políticas de Seguridad (RLS)

Las políticas de Storage son independientes de las políticas de base de datos. Necesitas configurarlas manualmente.

### Política 1: Permitir subir archivos (INSERT)

1. En Storage, selecciona el bucket `documents`
2. Ve a la pestaña **Policies**
3. Clic en **New Policy**
4. Selecciona **Custom policy**
5. Configura:

```sql
-- Nombre de la política
Allow authenticated users to upload files

-- Operación
INSERT

-- Target roles
authenticated

-- Policy definition (USING)
(bucket_id = 'documents'::text) AND 
(auth.uid() IN (
  SELECT id FROM public.users
))

-- Policy definition (WITH CHECK)
(bucket_id = 'documents'::text) AND
(storage.foldername(name))[1] IN (
  SELECT organization_id::text FROM public.users WHERE id = auth.uid()
)
```

### Política 2: Permitir ver archivos (SELECT)

1. Clic en **New Policy** nuevamente
2. Selecciona **Custom policy**
3. Configura:

```sql
-- Nombre de la política
Allow users to view their organization files

-- Operación
SELECT

-- Target roles
authenticated

-- Policy definition (USING)
(bucket_id = 'documents'::text) AND
(storage.foldername(name))[1] IN (
  SELECT organization_id::text FROM public.users WHERE id = auth.uid()
)
```

### Política 3: Permitir eliminar archivos (DELETE)

1. Clic en **New Policy** nuevamente
2. Selecciona **Custom policy**
3. Configura:

```sql
-- Nombre de la política
Allow admins to delete files

-- Operación
DELETE

-- Target roles
authenticated

-- Policy definition (USING)
(bucket_id = 'documents'::text) AND
(storage.foldername(name))[1] IN (
  SELECT organization_id::text FROM public.users 
  WHERE id = auth.uid() AND role = 'admin'
)
```

## 📋 Paso 3: Agregar Tabla de Documentos

Si aún no has ejecutado la migración actualizada, ejecuta este SQL adicional:

```sql
-- Tabla de documentos
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  uploaded_by UUID REFERENCES users ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view documents in their organization"
  ON documents FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can manage documents"
  ON documents FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND role IN ('admin')
    )
  );

-- Índice
CREATE INDEX idx_documents_org ON documents(organization_id);
```

## ✅ Paso 4: Verificar Configuración

1. **Verificar el bucket**:
   - En Storage, deberías ver el bucket `documents`
   - Debe estar marcado como **Public**

2. **Verificar políticas**:
   - En la pestaña Policies del bucket, deberías ver 3 políticas:
     - Allow authenticated users to upload files (INSERT)
     - Allow users to view their organization files (SELECT)
     - Allow admins to delete files (DELETE)

3. **Verificar tabla**:
   - En SQL Editor, ejecuta:
     ```sql
     SELECT * FROM documents LIMIT 1;
     ```
   - No debería dar error (aunque esté vacía)

## 🧪 Paso 5: Probar la Funcionalidad

1. **Inicia la aplicación**:
   ```bash
   npm run dev
   ```

2. **Navega a Expediente**:
   - Login en la aplicación
   - Ve a `/dashboard/expediente`

3. **Sube un documento de prueba**:
   - Clic en "Subir Documento"
   - Completa el formulario
   - Selecciona un archivo (PDF, imagen, etc.)
   - Clic en "Subir Documento"

4. **Verifica**:
   - El documento debería aparecer en la lista
   - Deberías poder descargarlo
   - Deberías poder eliminarlo

## 🔧 Troubleshooting

### Error: "new row violates row-level security policy"
**Solución**: Verifica que las políticas RLS estén configuradas correctamente tanto en la tabla `documents` como en Storage.

### Error: "storage/object-not-found"
**Solución**: Verifica que el bucket `documents` exista y sea público.

### Error: "Failed to upload file"
**Solución**: 
1. Verifica que las políticas de Storage estén configuradas
2. Verifica que el usuario esté autenticado
3. Verifica que el usuario tenga una organización asignada

### Los archivos no se descargan
**Solución**: Verifica que el bucket sea **Public**. Si es privado, necesitas generar URLs firmadas.

## 📊 Límites de Storage

- **Plan gratuito de Supabase**: 1 GB de storage
- **Tamaño máximo por archivo**: 10 MB (configurado en la aplicación)
- **Formatos permitidos**: PDF, Word, Excel, Imágenes (JPG, PNG)

## 🔐 Seguridad

- ✅ Los archivos se organizan por `organization_id`
- ✅ Solo usuarios de la misma organización pueden ver los archivos
- ✅ Solo admins pueden subir y eliminar archivos
- ✅ Los archivos se almacenan en Supabase Storage (seguro y escalable)

---

**¡Listo!** El módulo de Expediente Digital está configurado y funcionando.
