/**
 * Helper para redirecciones basadas en roles después de login/registro
 */

export type UserRole = 'PARENT' | 'CLUB' | 'TEACHER' | 'ADMIN';

/**
 * Obtiene la ruta del dashboard según el rol del usuario
 */
export function getDashboardRoute(role: UserRole): string {
  const routes: Record<UserRole, string> = {
    PARENT: '/parents/dashboard',
    CLUB: '/club/dashboard',
    TEACHER: '/profesor/dashboard',
    ADMIN: '/admin/dashboard'
  };

  return routes[role] || '/parents/dashboard'; // Default a parents si rol desconocido
}

/**
 * Obtiene mensaje de bienvenida personalizado según rol
 */
export function getWelcomeMessage(role: UserRole, name: string): string {
  const messages: Record<UserRole, string> = {
    PARENT: `¡Bienvenido ${name}! Empieza a gestionar a tus nadadores`,
    CLUB: `¡Bienvenido ${name}! Configura tu club y comienza`,
    TEACHER: `¡Bienvenido ${name}! Listo para entrenar a tus nadadores`,
    ADMIN: `¡Bienvenido ${name}! Panel de administración`
  };

  return messages[role] || `¡Bienvenido ${name}!`;
}

/**
 * Obtiene descripción del rol para UI
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    PARENT: 'Padre/Madre',
    CLUB: 'Administrador de Club',
    TEACHER: 'Entrenador',
    ADMIN: 'Administrador del Sistema'
  };

  return descriptions[role] || 'Usuario';
}

/**
 * Obtiene el emoji/icono del rol
 */
export function getRoleIcon(role: UserRole): string {
  const icons: Record<UserRole, string> = {
    PARENT: '👨‍👩‍👧',
    CLUB: '🏊‍♂️',
    TEACHER: '👨‍🏫',
    ADMIN: '⚙️'
  };

  return icons[role] || '👤';
}
