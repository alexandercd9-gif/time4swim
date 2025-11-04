import { NextResponse } from 'next/server';
import { getCategoriesForCompetitionYear } from '@/lib/categories';

/**
 * GET /api/config/categories
 * Retorna todas las categorías para un año de competencia
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const competitionYear = yearParam ? parseInt(yearParam) : new Date().getFullYear();

    const categories = getCategoriesForCompetitionYear(competitionYear);

    return NextResponse.json({
      competitionYear,
      categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    );
  }
}
