# ETHOS v2.0 - Checklist de Pruebas Funcionales

Este documento contiene el checklist completo de pruebas funcionales para ETHOS v2.0.

**Fecha de creación**: Enero 2026  
**Versión**: 2.0.0

---

## 🔐 Autenticación y Seguridad

### Login
- [ ] Login con email y contraseña válidos funciona correctamente
- [ ] Login con credenciales inválidas muestra error apropiado
- [ ] Login redirige al dashboard después de autenticación exitosa
- [ ] Campo de contraseña oculta el texto ingresado
- [ ] Botón de login se deshabilita durante el proceso de autenticación

### Signup (Registro)
- [ ] Registro con datos válidos crea usuario y organización correctamente
- [ ] Validación de email (formato correcto)
- [ ] Validación de contraseña (mínimo 8 caracteres, mayúsculas, números)
- [ ] Error claro cuando el email ya está registrado
- [ ] Error claro cuando falta algún campo obligatorio
- [ ] Registro redirige al dashboard después de creación exitosa
- [ ] Organización se crea automáticamente con el nombre proporcionado

### Logout
- [ ] Logout cierra la sesión correctamente
- [ ] Después de logout, redirige a la página de login
- [ ] No se puede acceder al dashboard después de logout sin login

### Reset Password
- [ ] Solicitud de reset de contraseña envía email (si está configurado)
- [ ] Formulario de reset de contraseña funciona correctamente
- [ ] Actualización de contraseña funciona con token válido

---

## 📊 Dashboard

### KPIs y Estadísticas
- [ ] Muestra ingresos totales correctamente (USD y VES)
- [ ] Muestra gastos totales correctamente (USD y VES)
- [ ] Calcula balance correctamente (ingresos - gastos)
- [ ] Muestra número de transacciones correctamente
- [ ] Muestra saldo bancario si hay cuentas configuradas
- [ ] Los valores se formatean correctamente (separadores de miles, decimales)

### Transacciones Recientes
- [ ] Muestra las últimas 10 transacciones (ingresos y gastos combinados)
- [ ] Las transacciones se ordenan por fecha (más recientes primero)
- [ ] Muestra iconos correctos (verde para ingresos, rojo para gastos)
- [ ] Muestra montos en USD y VES cuando aplica
- [ ] Los enlaces a transacciones funcionan correctamente

### Gráficos (si están implementados)
- [ ] Gráfico de tendencias muestra datos correctos
- [ ] Gráfico de categorías muestra distribución correcta
- [ ] Los gráficos son responsivos (se adaptan al tamaño de pantalla)

---

## 💰 Módulo de Ingresos

### Listado de Ingresos
- [ ] Tabla muestra todos los ingresos de la organización
- [ ] Los ingresos se ordenan por fecha (más recientes primero)
- [ ] Muestra todos los campos relevantes (fecha, concepto, monto USD, monto VES, método de pago)
- [ ] Filtros funcionan correctamente (por método de pago, monto mínimo)
- [ ] Búsqueda por texto funciona (si está implementada)
- [ ] Paginación funciona correctamente (si está implementada)

### Crear Ingreso
- [ ] Formulario permite crear nuevo ingreso
- [ ] Validación de campos obligatorios (fecha, concepto, monto)
- [ ] Conversión automática USD → VES funciona correctamente
- [ ] Tasa de cambio se puede ingresar manualmente o usar automática
- [ ] Selección de método de pago funciona
- [ ] Selección de cuenta contable funciona (si está implementada)
- [ ] Después de crear, el ingreso aparece en la tabla
- [ ] Se genera asiento contable automáticamente

### Editar Ingreso
- [ ] Permite editar ingresos existentes (si está implementado)
- [ ] Los cambios se guardan correctamente
- [ ] Los asientos contables se actualizan correctamente

### Eliminar Ingreso
- [ ] Confirmación antes de eliminar
- [ ] Eliminación funciona correctamente
- [ ] Los asientos contables asociados se eliminan
- [ ] Después de eliminar, el ingreso desaparece de la tabla

### Exportación
- [ ] Exportación a Excel funciona correctamente
- [ ] El archivo Excel contiene todos los datos correctos
- [ ] Exportación a PDF funciona correctamente (si está implementada)

---

## 💸 Módulo de Gastos

### Listado de Gastos
- [ ] Tabla muestra todos los gastos de la organización
- [ ] Los gastos se ordenan por fecha (más recientes primero)
- [ ] Muestra todos los campos relevantes (fecha, proveedor, concepto, subtotal, IVA, total)
- [ ] Filtros funcionan correctamente (por categoría, monto mínimo)
- [ ] Búsqueda por texto funciona (si está implementada)
- [ ] Paginación funciona correctamente (si está implementada)

### Crear Gasto
- [ ] Formulario permite crear nuevo gasto
- [ ] Validación de campos obligatorios (fecha, proveedor, concepto, subtotal)
- [ ] Cálculo automático de IVA funciona correctamente (16% por defecto)
- [ ] IVA se puede ajustar manualmente
- [ ] Retenciones (IVA e ISLR) se pueden agregar
- [ ] Conversión automática USD → VES funciona correctamente
- [ ] Selección de categoría funciona
- [ ] Selección de método de pago funciona
- [ ] Después de crear, el gasto aparece en la tabla
- [ ] Se genera asiento contable automáticamente (partida doble)

### Editar Gasto
- [ ] Permite editar gastos existentes (si está implementado)
- [ ] Los cambios se guardan correctamente
- [ ] Los asientos contables se actualizan correctamente

### Eliminar Gasto
- [ ] Confirmación antes de eliminar
- [ ] Eliminación funciona correctamente
- [ ] Los asientos contables asociados se eliminan
- [ ] Después de eliminar, el gasto desaparece de la tabla

### Exportación
- [ ] Exportación a Excel funciona correctamente
- [ ] El archivo Excel contiene todos los datos correctos
- [ ] Exportación a PDF funciona correctamente (si está implementada)

---

## 🏦 Módulo de Banco

### Cuentas Bancarias
- [ ] Listado muestra todas las cuentas bancarias
- [ ] Crear nueva cuenta bancaria funciona
- [ ] Editar cuenta bancaria funciona
- [ ] Eliminar cuenta bancaria funciona (con confirmación)
- [ ] Saldos se calculan correctamente
- [ ] Soporte para múltiples monedas (USD y VES)

### Movimientos Bancarios
- [ ] Los movimientos se vinculan correctamente con transacciones
- [ ] Saldos se actualizan automáticamente
- [ ] Conciliación bancaria funciona (si está implementada)

---

## 📦 Módulo de Inventario

### Activos Fijos
- [ ] Listado muestra todos los activos
- [ ] Filtros funcionan (por estado, categoría)
- [ ] Crear nuevo activo funciona
- [ ] Editar activo funciona
- [ ] Cambiar estado de activo funciona (activo/inactivo/disposed)
- [ ] Eliminar activo funciona (con confirmación)
- [ ] Cálculo de depreciación funciona (si está implementado)
- [ ] Exportación a Excel funciona

---

## 📁 Módulo de Expediente

### Documentos
- [ ] Listado muestra todos los documentos
- [ ] Subir documento funciona
- [ ] Validación de tipo de archivo funciona (PDF, imágenes, etc.)
- [ ] Validación de tamaño de archivo funciona (máx 5MB o configurado)
- [ ] Descargar documento funciona
- [ ] Eliminar documento funciona (con confirmación)
- [ ] Los documentos se organizan por organización (aislamiento de datos)

---

## 📖 Libro Digital

### Libro Diario
- [ ] Muestra todos los asientos contables
- [ ] Los asientos se ordenan por fecha y número de asiento
- [ ] Muestra débitos y créditos correctamente
- [ ] Totales de débito = totales de crédito (partida doble)
- [ ] Filtros por período funcionan
- [ ] Exportación a Excel funciona
- [ ] Exportación a PDF funciona (si está implementada)

### Libro Mayor
- [ ] Agrupa asientos por cuenta contable
- [ ] Calcula saldos iniciales y finales correctamente
- [ ] Filtros por cuenta funcionan
- [ ] Filtros por período funcionan
- [ ] Exportación funciona

---

## 📈 Módulo de Reportes

### Reportes Financieros
- [ ] Filtros por período funcionan (Todos, Este Mes, Último Trimestre)
- [ ] Tarjetas de resumen muestran datos correctos
- [ ] Análisis de gastos por categoría es correcto
- [ ] Gráficos muestran datos correctos (si están implementados)
- [ ] Exportación a Excel funciona
- [ ] Exportación a PDF funciona (si está implementada)

### Reportes Fiscales (SENIAT)
- [ ] Libro de Ventas se genera correctamente
- [ ] Libro de Compras se genera correctamente
- [ ] Reporte ISLR se genera correctamente
- [ ] Filtros por mes funcionan
- [ ] Exportación funciona

---

## 💾 Sistema de Backup

### Exportación de Datos
- [ ] Exportación JSON funciona correctamente
- [ ] Exportación CSV funciona correctamente (múltiples archivos)
- [ ] Exportación Excel multi-hoja funciona correctamente
- [ ] Los archivos contienen todos los datos necesarios
- [ ] Información de organización y usuario está incluida

---

## ⚙️ Configuración

### Plan Contable
- [ ] Visualización de cuentas contables funciona
- [ ] Crear cuenta manual funciona
- [ ] Importar cuentas desde archivo funciona
- [ ] Inicialización de Plan Contable VEN-NIF funciona

### Organización
- [ ] Editar datos de organización funciona
- [ ] Cambios se guardan correctamente

---

## 🔒 Seguridad y Aislamiento de Datos

### Row Level Security (RLS)
- [ ] Usuario solo ve datos de su organización
- [ ] No puede acceder a datos de otras organizaciones
- [ ] Intentos de acceso no autorizado son bloqueados

### Roles y Permisos
- [ ] Admin puede realizar todas las operaciones
- [ ] Auditor solo puede ver (no puede crear/editar/eliminar)
- [ ] Resident tiene permisos limitados (si está implementado)

---

## 📱 Responsividad y UX

### Diseño Responsivo
- [ ] Dashboard se ve bien en desktop (1920x1080)
- [ ] Dashboard se ve bien en tablet (768px)
- [ ] Dashboard se ve bien en móvil (375px)
- [ ] Sidebar se adapta correctamente en móvil
- [ ] Tablas son scrollables en pantallas pequeñas

### Estados de Carga
- [ ] Loading spinners aparecen durante operaciones
- [ ] Botones se deshabilitan durante operaciones
- [ ] Mensajes de éxito aparecen después de operaciones exitosas
- [ ] Mensajes de error son claros y útiles

### Navegación
- [ ] Sidebar funciona correctamente
- [ ] Links de navegación funcionan
- [ ] Breadcrumbs funcionan (si están implementados)
- [ ] Botón de logout funciona desde cualquier página

---

## 🌐 Deployment y Producción

### Build
- [ ] `npm run build` completa sin errores
- [ ] No hay warnings críticos en el build
- [ ] El build genera archivos estáticos correctamente

### Variables de Entorno
- [ ] Todas las variables requeridas están configuradas
- [ ] Las variables funcionan correctamente en producción

### Performance
- [ ] La aplicación carga rápidamente (< 3 segundos)
- [ ] Las imágenes se optimizan correctamente
- [ ] No hay memory leaks evidentes

---

## 📝 Notas de Prueba

**Ambiente de prueba**: [Desarrollo / Producción]  
**Fecha de ejecución**: _______________  
**Ejecutado por**: _______________  

### Problemas Encontrados

1. 
2. 
3. 

### Observaciones

- 
- 
- 

---

## ✅ Resultado Final

- [ ] Todas las pruebas pasaron exitosamente
- [ ] Algunas pruebas fallaron (ver notas arriba)
- [ ] Se requiere revisión adicional

**Estado general**: [ ] ✅ Aprobado  [ ] ⚠️ Requiere correcciones  [ ] ❌ Rechazado

---

**Última actualización**: Enero 2026
