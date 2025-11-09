/**
 * Sistema de Categorías por Edad (Año de Nacimiento)
 * 
 * La categoría se calcula según el año de nacimiento del nadador,
 * independientemente del mes/día de cumpleaños.
 * 
 * El año de competencia determina qué categoría corresponde.
 */

export type CategoryCode = 
  | 'pre_minima'
  | 'minima_1'
  | 'minima_2'
  | 'infantil_a1'
  | 'infantil_a2'
  | 'infantil_b1'
  | 'infantil_b2'
  | 'juvenil_a'
  | 'juvenil_b'
  | 'juvenil_c'
  | 'junior'
  | 'senior'
  | 'master';

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
      code: 'pre_minima',
      name: 'Pre-Mínima',
      description: `Año ${competitionYear - 6} y posteriores`,
      birthYear: competitionYear - 6,
    },
    {
      code: 'minima_1',
      name: 'Mínima 1',
      description: `Años ${competitionYear - 8} - ${competitionYear - 7}`,
      birthYear: competitionYear - 8,
    },
    {
      code: 'minima_2',
      name: 'Mínima 2',
      description: `Años ${competitionYear - 10} - ${competitionYear - 9}`,
      birthYear: competitionYear - 10,
    },
    {
      code: 'infantil_a1',
      name: 'Infantil A1',
      description: `Año ${competitionYear - 11}`,
      birthYear: competitionYear - 11,
    },
    {
      code: 'infantil_a2',
      name: 'Infantil A2',
      description: `Año ${competitionYear - 12}`,
      birthYear: competitionYear - 12,
    },
    {
      code: 'infantil_b1',
      name: 'Infantil B1',
      description: `Año ${competitionYear - 13}`,
      birthYear: competitionYear - 13,
    },
    {
      code: 'infantil_b2',
      name: 'Infantil B2',
      description: `Año ${competitionYear - 14}`,
      birthYear: competitionYear - 14,
    },
    {
      code: 'juvenil_a',
      name: 'Juvenil A',
      description: `Año ${competitionYear - 15}`,
      birthYear: competitionYear - 15,
    },
    {
      code: 'juvenil_b',
      name: 'Juvenil B',
      description: `Año ${competitionYear - 16}`,
      birthYear: competitionYear - 16,
    },
    {
      code: 'juvenil_c',
      name: 'Juvenil C',
      description: `Año ${competitionYear - 17}`,
      birthYear: competitionYear - 17,
    },
    {
      code: 'junior',
      name: 'Junior',
      description: `Años ${competitionYear - 19} - ${competitionYear - 18}`,
      birthYear: competitionYear - 19,
    },
    {
      code: 'senior',
      name: 'Senior',
      description: `Años ${competitionYear - 24} - ${competitionYear - 20}`,
      birthYear: competitionYear - 24,
    },
    {
      code: 'master',
      name: 'Master',
      description: `Año ${competitionYear - 25} y anteriores`,
      birthYear: null,
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
  const yearDifference = compYear - birthYear;

  // Pre-Mínima: ≤6 años (2019+ en 2025)
  if (yearDifference <= 6) {
    return {
      code: 'pre_minima',
      name: 'Pre-Mínima',
      description: `Año ${compYear - 6} y posteriores`,
      birthYear: compYear - 6,
    };
  }

  // Mínima 1: 7-8 años (2017-2018 en 2025)
  if (yearDifference <= 8) {
    return {
      code: 'minima_1',
      name: 'Mínima 1',
      description: `Años ${compYear - 8} - ${compYear - 7}`,
      birthYear: compYear - 8,
    };
  }

  // Mínima 2: 9-10 años (2015-2016 en 2025)
  if (yearDifference <= 10) {
    return {
      code: 'minima_2',
      name: 'Mínima 2',
      description: `Años ${compYear - 10} - ${compYear - 9}`,
      birthYear: compYear - 10,
    };
  }

  // Infantil A1: 11 años (2014 en 2025)
  if (yearDifference === 11) {
    return {
      code: 'infantil_a1',
      name: 'Infantil A1',
      description: `Año ${compYear - 11}`,
      birthYear: compYear - 11,
    };
  }

  // Infantil A2: 12 años (2013 en 2025)
  if (yearDifference === 12) {
    return {
      code: 'infantil_a2',
      name: 'Infantil A2',
      description: `Año ${compYear - 12}`,
      birthYear: compYear - 12,
    };
  }

  // Infantil B1: 13 años (2012 en 2025)
  if (yearDifference === 13) {
    return {
      code: 'infantil_b1',
      name: 'Infantil B1',
      description: `Año ${compYear - 13}`,
      birthYear: compYear - 13,
    };
  }

  // Infantil B2: 14 años (2011 en 2025)
  if (yearDifference === 14) {
    return {
      code: 'infantil_b2',
      name: 'Infantil B2',
      description: `Año ${compYear - 14}`,
      birthYear: compYear - 14,
    };
  }

  // Juvenil A: 15 años (2010 en 2025)
  if (yearDifference === 15) {
    return {
      code: 'juvenil_a',
      name: 'Juvenil A',
      description: `Año ${compYear - 15}`,
      birthYear: compYear - 15,
    };
  }

  // Juvenil B: 16 años (2009 en 2025)
  if (yearDifference === 16) {
    return {
      code: 'juvenil_b',
      name: 'Juvenil B',
      description: `Año ${compYear - 16}`,
      birthYear: compYear - 16,
    };
  }

  // Juvenil C: 17 años (2008 en 2025)
  if (yearDifference === 17) {
    return {
      code: 'juvenil_c',
      name: 'Juvenil C',
      description: `Año ${compYear - 17}`,
      birthYear: compYear - 17,
    };
  }

  // Junior: 18-19 años (2006-2007 en 2025)
  if (yearDifference <= 19) {
    return {
      code: 'junior',
      name: 'Junior',
      description: `Años ${compYear - 19} - ${compYear - 18}`,
      birthYear: compYear - 19,
    };
  }

  // Senior: 20-24 años (2001-2005 en 2025)
  if (yearDifference <= 24) {
    return {
      code: 'senior',
      name: 'Senior',
      description: `Años ${compYear - 24} - ${compYear - 20}`,
      birthYear: compYear - 24,
    };
  }

  // Master: 25+ años (2000- en 2025)
  return {
    code: 'master',
    name: 'Master',
    description: `Año ${compYear - 25} y anteriores`,
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
