# Roadmap y Checklist — Time4Swim

Una lista viva de todo lo que vamos a construir. Marca [x] cuando completes un ítem. Si algo cambia de prioridad, muévelo de sección o añade notas.

Notas de uso:
- Para marcar un ítem: edita este archivo y cambia [ ] a [x].
- Cada bloque incluye criterios de aceptación (qué significa “listo”) y archivos/rutas clave cuando aplica.

---

## 0) Hecho recientemente ✅
- [x] Dashboard Admin: barras proporcionales por px, pie con acceso vs total, etiquetas más legibles (`src/app/admin/dashboard/page.tsx`).
- [x] Estadísticas admin (`/api/admin/stats`): padres por mes, clubes con/ sin acceso.
- [x] CRUD Usuarios Admin: buscar/editar/eliminar con modales y toasts (`/api/admin/users/[id]`).
- [x] Trial de 7 días: banner, estado en `/api/auth/me`, registro/login con toasts.
- [x] Roles base y layouts protegidos:
  - Padres: `src/app/parents/layout.tsx` + `parents/dashboard/page.tsx`
  - Club: `src/app/club/layout.tsx` + `club/dashboard/page.tsx`
  - Profesor: `src/app/profesor/layout.tsx` + `profesor/dashboard/page.tsx`

---

## 1) Roles y accesos (estructura base)
- [x] Redirecciones por rol en layouts (hecho).
- [ ] Navegación por rol en `ModernSidebar` (mostrar entradas específicas según ADMIN/PARENT/CLUB/TEACHER).
  - Criterio: Cada rol ve su menú, sin enlaces inválidos; Logout con icono Power.
  - Archivos: `src/components/ModernSidebar.tsx`, `src/components/navigation.tsx` (si aplica).
- [ ] Redirección post-login al dashboard de su rol (server-side si es posible).
  - Criterio: Al autenticarse, el usuario aterriza en `/parents/dashboard`, `/club/dashboard` o `/profesor/dashboard` según rol.
- [ ] Pruebas rápidas de acceso (3 usuarios de prueba por rol) y captura de pantalla.

---

## 2) Club Report (página compartible para convencer al club)
- [ ] Endpoint de preview con token temporal: `GET /api/club-report/[clubId]?token=...`.
  - Criterio: Devuelve KPIs de solo lectura; no expone datos sensibles; token con expiración.
- [ ] Página shareable `/club-report/[clubId]` con CTA “Activar perfil del club (30 días)”.
  - KPIs: nadadores activos, mejoras del mes, PRs recientes, próximos eventos (si existen).
- [ ] Generador de token desde admin o desde dashboard padres.
  - Criterio: Crear URL segura que expira (p.ej., 7 días) para enviar al club.

---

## 3) Agenda y notificaciones (alto impacto para clubes)
- [ ] Modelos Prisma mínimos: `Practice`, `Competition`, `Notification`, `Attendance`.
  - Criterio: migración aplicada; relaciones con `Club` y `Child` funcionales.
- [ ] Endpoints CRUD: crear/editar/listar prácticas y competencias del club.
- [ ] Notificación por email a padres al crear evento (primera versión con Nodemailer).
  - Criterio: ≥95% entregas; fallback y logging básico.
- [ ] Exportación ICS del calendario del club.
- [ ] RSVP de padres (asistir/no asistir) y conteo en UI del club.
- [ ] UI mínima:
  - Club: crear evento, ver lista, ver confirmaciones.
  - Padres: ver próximos eventos y confirmar asistencia.

---

## 4) Pagos y planes (cuando tengamos la demo lista)
- [ ] Stripe: productos y precios (Padre Plus, Club Lite/Pro).
- [ ] Checkout y webhook (activación de suscripción, trial, cancelación, reintentos).
- [ ] Campos de suscripción:
  - `User`: `subscriptionStatus`, `customerId` (opcional), `plan`.
  - `Club`: `subscriptionStatus`, `plan`, `trialEndsAt`.
- [ ] Paywall/feature flags por plan (videos, agenda avanzada, FDPN sync).
- [ ] Página de facturación (cambiar plan, ver estado).

---

## 5) Videos MVP (valor para padres)
- [ ] Elegir storage: Bunny.net (simple + CDN) / S3+CloudFront / Cloudinary.
- [ ] Modelo `Video` (id, childId, url, size, duration, createdAt).
- [ ] Upload UI (arrastrar/soltar), límite por plan, vista previa.
- [ ] Reproducción adaptativa (HLS/MP4 simple al inicio) y mini-análisis básico (tiempos parciales manuales).

---

## 6) Integración FDPN (cuando haya tracción)
- [ ] Buscar por código de afiliado; guardar JSON en `Child.fdpnData`.
- [ ] Sincronización manual, y luego programada.
- [ ] Mostrar resumen: PRs oficiales y comparativa con tiempos de la app.

---

## 7) Visualizaciones y UX
- [ ] Tooltips en gráficos y barras con cero datos visibles (gris tenue).
- [ ] Accesibilidad: roles ARIA, contrastes, navegación teclado.
- [ ] Pequeños pulidos (tipografías consistentes, microcopys).

---

## 8) Calidad, datos y despliegue
- [ ] Lint + Typecheck PASS en CI.
- [ ] Seeds actualizados (usuarios por rol, 2 clubes, 3 nadadores por club, 1–2 eventos ejemplo).
- [ ] `.env.example` con todas las variables requeridas (DB, JWT, SMTP, STRIPE...).
- [ ] Documentación corta de ejecución y troubleshooting (README sección rápida).

---

## 9) Piloto con un club
- [ ] Onboarding: crear primera práctica juntos y notificar a padres.
- [ ] 30 días de prueba Club Lite.
- [ ] Métricas: nº de padres activos, RSVPs, eventos creados.

---

## Backlog (ideas)
- Evaluaciones de técnica por estilo con checklist.
- Rankings internos del club por categoría/edad.
- Plantillas avanzadas de entreno y biblioteca compartida.
- App móvil (PWA primero, nativa después).

---

### Referencias rápidas a archivos relevantes
- API clubs: `src/app/api/clubs/route.ts` (requiere auth).
- Stats admin: `src/app/api/admin/stats/route.ts`.
- Usuarios admin: `src/app/api/admin/users/[id]/route.ts`.
- Layouts por rol: `src/app/parents/layout.tsx`, `src/app/club/layout.tsx`, `src/app/profesor/layout.tsx`.
- Dashboards por rol: `parents/dashboard/page.tsx`, `club/dashboard/page.tsx`, `profesor/dashboard/page.tsx`.
- Prisma schema: `prisma/schema.prisma`.

---

Si necesitas que prioricemos un bloque, súbelo arriba y marca los criterios de aceptación con más detalle. Este documento vive junto al código para que no se nos escape nada. 💪
