# 📋 Guía: Crear Pull Request (PR)

## Opción 1: Usando GitHub Web Interface (Recomendado para Principiantes)

### Paso 1: Ir a GitHub
1. Abre https://github.com/zowy4/sistema-taller
2. Verás una notificación de la rama `feature/v2-auth-security` en la parte superior

### Paso 2: Iniciar el PR
1. **Haz clic en "Compare & pull request"** (botón verde)
   - O ve a la rama y haz clic en "New pull request"

### Paso 3: Configurar el PR
- **Base branch**: `master` (donde se mergeará)
- **Compare branch**: `feature/v2-auth-security` (de donde vienen los cambios)

### Paso 4: Rellenar Información
En el formulario PR completa:

**Título:**
```
feat: v2-Auth-Security - Prácticas básicas y OAuth 2.0
```

**Descripción:**
```markdown
## 📝 Descripción
Implementación completa de seguridad v2 con prácticas básicas y autenticación OAuth 2.0 (Google y GitHub).

## ✨ Cambios Principales
- ✅ Seguridad: Helmet para proteger cabeceras HTTP
- ✅ Validación: ValidationPipe con whitelist y forbidNonWhitelisted
- ✅ Sanitización: @Exclude para ocultar contraseñas
- ✅ Manejo de errores: Filtro global de excepciones
- ✅ OAuth 2.0: Google y GitHub
- ✅ Sesiones seguras: Cookies HttpOnly con SameSite

## 🔗 Issues Relacionados
- Cierra: N/A (Crear nuevo issue si es necesario)

## 🧪 Proof of Testing
- [ ] ValidationPipe rechaza campos extra
- [ ] Contraseñas no se exponen en respuestas
- [ ] Errores se sanitizan correctamente
- [ ] OAuth Google funciona
- [ ] OAuth GitHub funciona

## 📋 Checklist
- [x] Código sigue estándares del proyecto
- [x] Comentarios añadidos donde es necesario
- [x] Documentación actualizada
- [x] No nuevo warnings
- [x] Tests pasan (o no aplicables)

## 📂 Archivos Principales Modificados
- `backend/src/main.ts` - Configuración de seguridad
- `backend/src/auth/auth.controller.ts` - Endpoints OAuth
- `backend/src/auth/auth.service.ts` - Lógica OAuth
- `backend/src/auth/strategies/` - Estrategias de OAuth
- `backend/src/common/filters/` - Filtro de excepciones
- `CHANGELOG_V2_SECURITY.md` - Documentación detallada
```

### Paso 5: Revisar Cambios
- Haz scroll para ver todos los archivo modificados
- Verifica que todo se ve correcto

### Paso 6: Crear PR
- Haz clic en **"Create pull request"**

---

## Opción 2: Usando GitHub CLI (Para Usuarios Avanzados)

Si tienes GitHub CLI instalado (`gh`):

```bash
# 1. Asegúrate de estar en la rama feature
git checkout feature/v2-auth-security

# 2. Crear PR interactivamente
gh pr create --base master --title "feat: v2-Auth-Security - Prácticas básicas y OAuth 2.0"

# 3. Agregar descripción (se abrirá editor)
# Si no se abre editor:
gh pr create --base master \
  --title "feat: v2-Auth-Security - Prácticas básicas y OAuth 2.0" \
  --body "Ver CHANGELOG_V2_SECURITY.md para detalles completos"

# 4. Ver PR creada
gh pr view
```

---

## Opción 3: Usando Git + Terminal (Avanzado)

```bash
# Ver el estado de la rama
git status

# Verificar commits
git log master..feature/v2-auth-security

# Ver diferencias
git diff master..feature/v2-auth-security --stat

# Después de crear la PR en GitHub, puedes hacer:
# (Solo si GitHub CLI está instalado)
gh pr create --base master --fill
```

---

## ✅ Checklist Post-PR

Después de crear la PR:

- [ ] La PR aparece en https://github.com/zowy4/sistema-taller/pulls
- [ ] Todos los "checks" de CI/CD pasan (si los hay)
- [ ] Solicita revisión de otros desarrolladores (@zowy4 o colaboradores)
- [ ] Espera feedback
- [ ] Solucion acomenta y haz push de más commits (se agregan automáticamente a la PR)
- [ ] Una vez aprobado, haz clic en "Merge pull request"
- [ ] Elige estrategia de merge:
  - **Squash and merge** - Un solo commit (recomendado)
  - **Create a merge commit** - Mantiene todos los commits
  - **Rebase and merge** - Limpia historial

---

## 📊 Comparación: Master vs Feature

```
master          →  f6d3c59 (commit anterior)
                   
feature/v2      →  0a21c3c 📝 docs: Changelog v2
                   ↓
                   dd02460 ✨ feat: v2-auth-security
                   ↓
                   f6d3c59 (commit anterior)
```

---

## 🔍 Revisión de Cambios en la PR

Los reviews típicos incluyen:
- ¿Se implementó todo lo requerido?
- ¿El código es legible y sigue los estándares?
- ¿Hay vulnerabilidades de seguridad?
- ¿Se necesitan más tests?
- ¿Hay breaking changes?

---

## 🚀 Después de Mergear

1. **Eliminar rama local**:
   ```bash
   git branch -d feature/v2-auth-security
   ```

2. **Eliminar rama remota**:
   ```bash
   git push origin --delete feature/v2-auth-security
   ```

3. **Actualizar master local**:
   ```bash
   git checkout master
   git pull origin master
   ```

4. **Instalar dependencias en local** (si fue necesario cambios en package.json):
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

---

## 📞 Soporte

Si tienes problemas:
- Ver errores en la pestaña "Checks" de la PR
- Revisar logs de CI/CD
- Contactar a otros developers en el equipo

---

## 📚 Referencias

- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)
- [GitHub CLI Documentation](https://cli.github.com/)
- [Git Branching Model](https://nvie.com/posts/a-successful-git-branching-model/)
