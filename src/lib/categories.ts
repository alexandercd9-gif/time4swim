/**
 * Sistema de Categorías por Edad (Año de Nacimiento)
 * 
 * La categoría se calcula según el año de nacimiento del nadador,
 * independientemente del mes/día de cumpleaños.
 * 
 * El año de competencia determina qué categoría corresponde.
 */

export type CategoryCode = 
  | 'preminima'
  | 'minima_1'
  | 'minima_2'
  | 'infantil_a1'
  | 'infantil_a2'
  | 'infantil_b1'
  | 'infantil_b2'
  | 'juvenil_a'
  | 'juvenil_b'
  | 'mayores';

export interface Category {
  code: CategoryCode;
  name: string;
  description: string;
  birthYear: number | null; // null para mayores (rango abierto)
}

/**
 * Obtener todas las categorías para un año de competencia dado
 */
export function getCategoriesForCompetitionYear(competitionYear: number): Category[] {
  return [
    {
      code: 'preminima',
      name: 'Pre-Mínima',
      description: 'Año 2018 y posteriores',
      birthYear: 2018,
    },
    {
      code: 'minima_1',
      name: 'Mínima 1',
      description: 'Año 2017',
      birthYear: 2017,
    },
    {
      code: 'minima_2',
      name: 'Mínima 2',
      description: 'Año 2016',
      birthYear: 2016,
    },
    {
      code: 'infantil_a1',
      name: 'Infantil A1',
      description: 'Año 2015',
      birthYear: 2015,
    },
    {
      code: 'infantil_a2',
      name: 'Infantil A2',
      description: 'Año 2014',
      birthYear: 2014,
    },
    {
      code: 'infantil_b1',
      name: 'Infantil B1',
      description: 'Año 2013',
      birthYear: 2013,
    },
    {
      code: 'infantil_b2',
      name: 'Infantil B2',
      description: 'Año 2012',
      birthYear: 2012,
    },
    {
      code: 'juvenil_a',
      name: 'Juvenil A',
      description: 'Año 2011',
      birthYear: 2011,
    },
    {
      code: 'juvenil_b',
      name: 'Juvenil B',
      description: 'Año 2010',
      birthYear: 2010,
    },
    {
      code: 'mayores',
      name: 'Mayores',
      description: 'Año 2009 y anteriores',
      birthYear: null, // Rango abierto
    },
  ];
}

/**
 * Calcular la categoría de un nadador según su fecha de nacimiento
 * y el año de la competencia
 * 
 * @param birthDate - Fecha de nacimiento del nadador
 * @param competitionYear - Año de la competencia (por defecto: año actual)
 * @returns La categoría correspondiente
 */
export function calculateCategory(
  birthDate: Date | string,
  competitionYear?: number
): Category {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const birthYear = birth.getFullYear();
  const compYear = competitionYear || new Date().getFullYear();

  // Pre-Mínima: 2018 y posteriores (relativo al año de competencia)
  const preMinimaYear = compYear - 7; // Ejemplo: 2025 - 7 = 2018
  if (birthYear >= preMinimaYear) {
    return {
      code: 'preminima',
      name: 'Pre-Mínima',
      description: `Año ${preMinimaYear} y posteriores`,
      birthYear: preMinimaYear,
    };
  }

  // Mínima 1: 2017
  if (birthYear === compYear - 8) {
    return {
      code: 'minima_1',
      name: 'Mínima 1',
      description: `Año ${compYear - 8}`,
      birthYear: compYear - 8,
    };
  }

  // Mínima 2: 2016
  if (birthYear === compYear - 9) {
    return {
      code: 'minima_2',
      name: 'Mínima 2',
      description: `Año ${compYear - 9}`,
      birthYear: compYear - 9,
    };
  }

  // Infantil A1: 2015
  if (birthYear === compYear - 10) {
    return {
      code: 'infantil_a1',
      name: 'Infantil A1',
      description: `Año ${compYear - 10}`,
      birthYear: compYear - 10,
    };
  }

  // Infantil A2: 2014
  if (birthYear === compYear - 11) {
    return {
      code: 'infantil_a2',
      name: 'Infantil A2',
      description: `Año ${compYear - 11}`,
      birthYear: compYear - 11,
    };
  }

  // Infantil B1: 2013
  if (birthYear === compYear - 12) {
    return {
      code: 'infantil_b1',
      name: 'Infantil B1',
      description: `Año ${compYear - 12}`,
      birthYear: compYear - 12,
    };
  }

  // Infantil B2: 2012
  if (birthYear === compYear - 13) {
    return {
      code: 'infantil_b2',
      name: 'Infantil B2',
      description: `Año ${compYear - 13}`,
      birthYear: compYear - 13,
    };
  }

  // Juvenil A: 2011
  if (birthYear === compYear - 14) {
    return {
      code: 'juvenil_a',
      name: 'Juvenil A',
      description: `Año ${compYear - 14}`,
      birthYear: compYear - 14,
    };
  }

  // Juvenil B: 2010
  if (birthYear === compYear - 15) {
    return {
      code: 'juvenil_b',
      name: 'Juvenil B',
      description: `Año ${compYear - 15}`,
      birthYear: compYear - 15,
    };
  }

  // Mayores: 2009 y anteriores
  return {
    code: 'mayores',
    name: 'Mayores',
    description: `Año ${compYear - 16} y anteriores`,
    birthYear: null,
  };
}

/**
 * Obtener categoría a partir del código
 */
export function getCategoryByCode(code: CategoryCode, competitionYear?: number): Category | null {
  const categories = getCategoriesForCompetitionYear(competitionYear || new Date().getFullYear());
  return categories.find(cat => cat.code === code) || null;
}

/**
 * Formatear categoría para mostrar
 */
export function formatCategory(category: Category): string {
  return `${category.name} (${category.description})`;
}
