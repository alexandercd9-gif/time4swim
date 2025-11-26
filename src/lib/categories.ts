/**
 * Sistema de Categorías por Edad (Año de Nacimiento)
 * 
 * La categoría se calcula según el año de nacimiento del nadador,
 * independientemente del mes/día de cumpleaños.
 * 
 * El año de competencia determina qué categoría corresponde.
 */

export type CategoryCode = 
  | 'baby_splash'
  | 'pre_minima_1'
  | 'pre_minima_2'
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
      code: 'baby_splash',
      name: 'Baby Splash',
      description: `Año ${competitionYear - 4} y posteriores (< 5 años)`,
      birthYear: competitionYear - 4,
    },
    {
      code: 'pre_minima_1',
      name: 'Pre-Mínima',
      description: `Año ${competitionYear - 6} (6 años)`,
      birthYear: competitionYear - 6,
    },
    {
      code: 'pre_minima_2',
      name: 'Pre-Mínima',
      description: `Año ${competitionYear - 7} (7 años)`,
      birthYear: competitionYear - 7,
    },
    {
      code: 'minima_1',
      name: 'Mínima 1',
      description: `Año ${competitionYear - 8} (8 años)`,
      birthYear: competitionYear - 8,
    },
    {
      code: 'minima_2',
      name: 'Mínima 2',
      description: `Año ${competitionYear - 9} (9 años)`,
      birthYear: competitionYear - 9,
    },
    {
      code: 'infantil_a1',
      name: 'Infantil A1',
      description: `Año ${competitionYear - 10} (10 años)`,
      birthYear: competitionYear - 10,
    },
    {
      code: 'infantil_a2',
      name: 'Infantil A2',
      description: `Año ${competitionYear - 11} (11 años)`,
      birthYear: competitionYear - 11,
    },
    {
      code: 'infantil_b1',
      name: 'Infantil B1',
      description: `Año ${competitionYear - 12} (12 años)`,
      birthYear: competitionYear - 12,
    },
    {
      code: 'infantil_b2',
      name: 'Infantil B2',
      description: `Año ${competitionYear - 13} (13 años)`,
      birthYear: competitionYear - 13,
    },
    {
      code: 'juvenil_a',
      name: 'Juvenil A',
      description: `Año ${competitionYear - 14} (14 años)`,
      birthYear: competitionYear - 14,
    },
    {
      code: 'juvenil_b',
      name: 'Juvenil B',
      description: `Año ${competitionYear - 15} (15 años)`,
      birthYear: competitionYear - 15,
    },
    {
      code: 'juvenil_c',
      name: 'Juvenil C',
      description: `Año ${competitionYear - 16} (16 años)`,
      birthYear: competitionYear - 16,
    },
    {
      code: 'junior',
      name: 'Junior',
      description: `Años ${competitionYear - 18} - ${competitionYear - 17} (17-18 años)`,
      birthYear: competitionYear - 18,
    },
    {
      code: 'senior',
      name: 'Senior',
      description: `Años ${competitionYear - 24} - ${competitionYear - 19} (19-24 años)`,
      birthYear: competitionYear - 24,
    },
    {
      code: 'master',
      name: 'Master',
      description: `Año ${competitionYear - 25} y anteriores (25+ años)`,
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

  // Baby Splash: 2020-2021 en 2025 (nacidos compYear-4 o después)
  if (birthYear >= compYear - 4) {
    return {
      code: 'baby_splash',
      name: 'Baby Splash',
      description: `Año ${compYear - 4} y posteriores`,
      birthYear: compYear - 4,
    };
  }

  // Pre-Mínima 1: 2019 en 2025 (nacidos compYear-6)
  if (birthYear === compYear - 6) {
    return {
      code: 'pre_minima_1',
      name: 'Pre-Mínima',
      description: `Año ${compYear - 6}`,
      birthYear: compYear - 6,
    };
  }

  // Pre-Mínima 2: 2018 en 2025 (nacidos compYear-7)
  if (birthYear === compYear - 7) {
    return {
      code: 'pre_minima_2',
      name: 'Pre-Mínima',
      description: `Año ${compYear - 7}`,
      birthYear: compYear - 7,
    };
  }

  // Mínima 1: 2017 en 2025 (nacidos compYear-8)
  if (birthYear === compYear - 8) {
    return {
      code: 'minima_1',
      name: 'Mínima 1',
      description: `Año ${compYear - 8}`,
      birthYear: compYear - 8,
    };
  }

  // Mínima 2: 2016 en 2025 (nacidos compYear-9)
  if (birthYear === compYear - 9) {
    return {
      code: 'minima_2',
      name: 'Mínima 2',
      description: `Año ${compYear - 9}`,
      birthYear: compYear - 9,
    };
  }

  // Infantil A1: 2015 en 2025 (nacidos compYear-10)
  if (birthYear === compYear - 10) {
    return {
      code: 'infantil_a1',
      name: 'Infantil A1',
      description: `Año ${compYear - 10}`,
      birthYear: compYear - 10,
    };
  }

  // Infantil A2: 2014 en 2025 (nacidos compYear-11)
  if (birthYear === compYear - 11) {
    return {
      code: 'infantil_a2',
      name: 'Infantil A2',
      description: `Año ${compYear - 11}`,
      birthYear: compYear - 11,
    };
  }

  // Infantil B1: 2013 en 2025 (nacidos compYear-12)
  if (birthYear === compYear - 12) {
    return {
      code: 'infantil_b1',
      name: 'Infantil B1',
      description: `Año ${compYear - 12}`,
      birthYear: compYear - 12,
    };
  }

  // Infantil B2: 2012 en 2025 (nacidos compYear-13)
  if (birthYear === compYear - 13) {
    return {
      code: 'infantil_b2',
      name: 'Infantil B2',
      description: `Año ${compYear - 13}`,
      birthYear: compYear - 13,
    };
  }

  // Juvenil A: 2011 en 2025 (nacidos compYear-14)
  if (birthYear === compYear - 14) {
    return {
      code: 'juvenil_a',
      name: 'Juvenil A',
      description: `Año ${compYear - 14}`,
      birthYear: compYear - 14,
    };
  }

  // Juvenil B: 2010 en 2025 (nacidos compYear-15)
  if (birthYear === compYear - 15) {
    return {
      code: 'juvenil_b',
      name: 'Juvenil B',
      description: `Año ${compYear - 15}`,
      birthYear: compYear - 15,
    };
  }

  // Juvenil C: 2009 en 2025 (nacidos compYear-16)
  if (birthYear === compYear - 16) {
    return {
      code: 'juvenil_c',
      name: 'Juvenil C',
      description: `Año ${compYear - 16}`,
      birthYear: compYear - 16,
    };
  }

  // Junior: 2007-2008 en 2025 (nacidos compYear-17 o compYear-18)
  if (birthYear === compYear - 17 || birthYear === compYear - 18) {
    return {
      code: 'junior',
      name: 'Junior',
      description: `Años ${compYear - 18} - ${compYear - 17}`,
      birthYear: compYear - 18,
    };
  }

  // Senior: 2001-2006 en 2025 (nacidos entre compYear-19 y compYear-24)
  if (birthYear >= compYear - 24 && birthYear <= compYear - 19) {
    return {
      code: 'senior',
      name: 'Senior',
      description: `Años ${compYear - 24} - ${compYear - 19}`,
      birthYear: compYear - 24,
    };
  }

  // Master: 2000 y anteriores en 2025 (nacidos compYear-25 o antes)
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
