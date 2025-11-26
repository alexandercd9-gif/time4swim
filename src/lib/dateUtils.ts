/**
 * Convierte una fecha en formato YYYY-MM-DD a un objeto Date
 * ajustado a la zona horaria local (no UTC)
 * 
 * @param dateString - Fecha en formato YYYY-MM-DD o ISO string
 * @returns Date object ajustado a medianoche hora local
 */
export function parseLocalDate(dateString: string): Date {
  // Si viene con hora (ISO), extraer solo la fecha
  const dateOnly = dateString.split('T')[0];
  
  // Crear fecha en hora local (no UTC)
  const [year, month, day] = dateOnly.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0); // Usar mediodía para evitar problemas de DST
}

/**
 * Formatea una fecha a YYYY-MM-DD en hora local
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
