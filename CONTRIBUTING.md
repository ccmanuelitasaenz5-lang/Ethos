# Contribuir a ETHOS

¡Gracias por tu interés en contribuir a ETHOS! Este documento proporciona pautas para contribuir al proyecto.

## 🚀 Cómo Contribuir

### Reportar Bugs

Si encuentras un bug, por favor crea un issue con:
- Descripción clara del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si es aplicable
- Versión del navegador y sistema operativo

### Sugerir Funcionalidades

Para sugerir nuevas funcionalidades:
- Verifica que no exista un issue similar
- Describe claramente el caso de uso
- Explica por qué sería útil para OSFL venezolanas
- Proporciona ejemplos si es posible

### Pull Requests

1. **Fork el repositorio**
2. **Crea una rama** desde `main`:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. **Realiza tus cambios**:
   - Sigue las convenciones de código
   - Agrega tests si es aplicable
   - Actualiza documentación
4. **Commit con mensajes descriptivos**:
   ```bash
   git commit -m "feat: agregar exportación a PDF"
   ```
5. **Push a tu fork**:
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
6. **Abre un Pull Request**

## 📝 Convenciones de Código

### TypeScript
- Usa tipos explícitos siempre que sea posible
- Evita `any`, usa `unknown` si es necesario
- Interfaces para objetos, types para unions

### React
- Componentes funcionales con hooks
- Props tipadas con interfaces
- Nombres descriptivos en PascalCase

### Estilos
- TailwindCSS para estilos
- Clases ordenadas: layout → spacing → sizing → colors
- Evita estilos inline

### Commits
Formato: `tipo(alcance): descripción`

Tipos:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formato, sin cambios de código
- `refactor`: Refactorización
- `test`: Agregar o modificar tests
- `chore`: Mantenimiento

Ejemplos:
```
feat(reportes): agregar filtro por trimestre
fix(gastos): corregir cálculo de IVA
docs(readme): actualizar instrucciones de instalación
```

## 🧪 Testing

Antes de enviar un PR:
- Verifica que el código compile sin errores
- Prueba la funcionalidad manualmente
- Verifica que no rompas funcionalidades existentes

## 📚 Documentación

Si agregas nuevas funcionalidades:
- Actualiza README.md
- Agrega comentarios en código complejo
- Actualiza CHANGELOG.md
- Considera agregar ejemplos

## 🌍 Localización

ETHOS está diseñado para Venezuela:
- Usa español para UI y mensajes
- Formato de fecha: dd/MM/yyyy
- Formato de moneda: es-VE
- Considera normativas venezolanas (VEN-NIF, SENIAT)

## 🔒 Seguridad

Si encuentras una vulnerabilidad de seguridad:
- **NO** abras un issue público
- Contacta directamente al equipo
- Proporciona detalles del problema
- Espera confirmación antes de divulgar

## 💬 Código de Conducta

- Sé respetuoso y profesional
- Acepta críticas constructivas
- Enfócate en lo mejor para el proyecto
- Ayuda a otros contribuidores

## 📞 Contacto

¿Preguntas? Contacta al equipo:
- Email: [tu-email@ejemplo.com]
- GitHub Issues: Para preguntas técnicas

## 📄 Licencia

Al contribuir, aceptas que tus contribuciones se licencien bajo la misma licencia del proyecto.

---

¡Gracias por ayudar a mejorar ETHOS! 🎉
