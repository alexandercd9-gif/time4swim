import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { JSDOM } from 'jsdom';

// Mapeo de eventos para normalizar nombres
const eventMapping: { [key: string]: string } = {
	'50 Free': '50m Libre',
	'100 Free': '100m Libre',
	'200 Free': '200m Libre',
	'400 Free': '400m Libre',
	'800 Free': '800m Libre',
	'1500 Free': '1500m Libre',
	'50 Back': '50m Espalda',
	'100 Back': '100m Espalda',
	'200 Back': '200m Espalda',
	'50 Breast': '50m Pecho',
	'100 Breast': '100m Pecho',
	'200 Breast': '200m Pecho',
	'50 Fly': '50m Mariposa',
	'100 Fly': '100m Mariposa',
	'200 Fly': '200m Mariposa',
	'200 IM': '200m Individual Medley',
	'400 IM': '400m Individual Medley'
};

// Función para hacer scraping de la web de FDPN
async function searchSwimmerInFDPN(swimmerName: string, affiliateCode?: string) {
	try {
		console.log(`🔍 Buscando nadador: ${swimmerName}${affiliateCode ? ` (Código: ${affiliateCode})` : ''} en FDPN`);

		const baseUrl = 'https://www.fdpn.org/resultados/nadadores';
		const searchQuery = encodeURIComponent(swimmerName || '');
		const searchUrl = `${baseUrl}?search=${searchQuery}`;

		const response = await fetch(searchUrl, {
			method: 'GET',
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
				'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
			}
		});

		if (!response.ok) {
			console.error(`❌ Error HTTP: ${response.status}`);
			return { name: '', club: '', category: '', affiliateCode: '', times: [] };
		}

		const html = await response.text();
		const dom = new JSDOM(html);
		const doc = dom.window.document; // use `doc` to avoid shadowing global `document`

		// Estructura de salida
		const swimmerData: any = {
			name: '',
			club: '',
			category: '',
			affiliateCode: '',
			times: [] as Array<any>
		};

		// Si se proporciona affiliateCode, tratar de encontrarlo en la lista de resultados
		if (affiliateCode) {
			const rows = doc.querySelectorAll('table tr');
			for (const row of Array.from(rows)) {
				const cells = row.querySelectorAll('td');
				if (cells.length === 0) continue;

				// Buscar el código exacto en las celdas
				for (const cell of Array.from(cells)) {
					const text = cell.textContent?.trim() || '';
					if (text === affiliateCode) {
						// Asumir nombre en primera columna y club en alguna columna posterior
						const name = (cells[0]?.textContent || '').trim();
						const club = (cells[2]?.textContent || '').trim();
						return { name, club, category: '', affiliateCode, times: [] };
					}
				}
			}

			// Si no se encuentra por código, devolver vacío
			return { name: '', club: '', category: '', affiliateCode: '', times: [] };
		}

		// Intentar extraer club y código en la página del nadador
		const clubSelectors = ['.club', '.swimmer-club', '.athlete-club', '[class*="club"]'];
		for (const sel of clubSelectors) {
			const el = doc.querySelector(sel);
			if (el?.textContent) {
				swimmerData.club = el.textContent.trim();
				break;
			}
		}

		const codeSelectors = ['.affiliate-code', '.swimmer-code', '.athlete-code', '[class*="code"]'];
		for (const sel of codeSelectors) {
			const el = doc.querySelector(sel);
			if (el?.textContent) {
				swimmerData.affiliateCode = el.textContent.trim();
				break;
			}
		}

		// Nombre posible
		const possibleNameSelectors = ['h1', 'h2', 'h3', '.swimmer-name', '.nadador-nombre', '.athlete-name', '.nombre', '[class*="name"]'];
		for (const sel of possibleNameSelectors) {
			const el = doc.querySelector(sel);
			if (el?.textContent && swimmerName) {
				if (el.textContent.toLowerCase().includes(swimmerName.toLowerCase().split(' ')[0])) {
					swimmerData.name = el.textContent.trim();
					break;
				}
			} else if (el?.textContent && !swimmerName) {
				swimmerData.name = el.textContent.trim();
				break;
			}
		}

		// Buscar tabla(s) de resultados y parsear
		const tables = doc.querySelectorAll('table');
		for (const table of Array.from(tables)) {
			const headerRow = table.querySelector('tr');
			if (!headerRow) continue;
			const headerText = headerRow.textContent || '';
			if (headerText.includes('Evento') || headerText.includes('Event') || headerText.includes('Tiempo') || headerText.includes('Time')) {
				parseResultsTable(table, swimmerData);
				break;
			}
		}

		if (!swimmerData.name && swimmerData.times.length === 0) {
			return { name: '', club: '', category: '', affiliateCode: '', times: [] };
		}

		return swimmerData;
	} catch (error) {
		console.error('❌ Error buscando en FDPN:', error);
		return { name: '', club: '', category: '', affiliateCode: '', times: [] };
	}
}

// Función auxiliar para parsear tabla de resultados
function parseResultsTable(table: Element, swimmerData: any) {
	const rows = table.querySelectorAll('tr');
	rows.forEach((row, index) => {
		if (index === 0) return; // header
		const cells = row.querySelectorAll('td, th');
		if (cells.length < 3) return;

		const event = (cells[0]?.textContent || '').trim();
		const time = (cells[1]?.textContent || '').trim();
		const competition = (cells[2]?.textContent || '').trim();
		const date = (cells[3]?.textContent || '').trim();
		const place = (cells[4]?.textContent || '').trim();

		if (event && time && isValidTime(time)) {
			swimmerData.times.push({
				event: normalizeEventName(event),
				time: normalizeTime(time),
				date: normalizeDate(date),
				competition,
				place,
				pool: detectPoolSize(competition),
				round: detectRound(competition)
			});
		}
	});
}

function normalizeEventName(event: string): string {
	return eventMapping[event] || event;
}

function normalizeTime(time: string): string {
	const timeRegex = /(\d{1,2})[:\.](\d{2})[:\.]?\d{2}?/;
	const match = time.match(timeRegex);
	if (match) return `${match[1]}:${match[2]}`;
	return time;
}

function normalizeDate(date: string): string {
	if (!date) return date;
	if (date.includes('/')) {
		const parts = date.split('/');
		if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
	}
	return date;
}

function isValidTime(time: string): boolean {
	return /\d{1,2}[:\.]?\d{2}[:\.]?\d{2}/.test(time);
}

function detectPoolSize(competition: string): string {
	if (!competition) return '25m';
	if (competition.toLowerCase().includes('50m') || competition.toLowerCase().includes('piscina olímpica')) return '50m';
	return '25m';
}

function detectRound(competition: string): string {
	if (!competition) return 'Final';
	const c = competition.toLowerCase();
	if (c.includes('final')) return 'Final';
	if (c.includes('preliminar')) return 'Preliminar';
	if (c.includes('serie')) return 'Serie';
	return 'Final';
}

function getPersonalBests(times: any[]) {
	const eventGroups = times.reduce((acc, time) => {
		if (!acc[time.event]) acc[time.event] = [];
		acc[time.event].push(time);
		return acc;
	}, {} as { [key: string]: any[] });

	return Object.entries(eventGroups).map(([event, eventTimes]) => {
		const sorted = (eventTimes as any[]).sort((a, b) => convertTimeToSeconds(a.time) - convertTimeToSeconds(b.time));
		return {
			event,
			bestTime: sorted[0].time,
			competition: sorted[0].competition,
			date: sorted[0].date,
			place: sorted[0].place,
			improvement: sorted.length > 1 ? calculateImprovement(sorted[sorted.length - 1].time, sorted[0].time) : null
		};
	});
}

function getRecentProgress(times: any[]) {
	const sortedByDate = [...times].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	return sortedByDate.slice(0, 5).map(t => ({ event: t.event, time: t.time, date: t.date, competition: t.competition, place: t.place, isPersonalBest: false }));
}

function convertTimeToSeconds(timeStr: string): number {
	const parts = timeStr.split(':');
	if (parts.length === 2) return parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
	return parseFloat(timeStr) || 0;
}

function calculateImprovement(oldTime: string, newTime: string): number {
	return convertTimeToSeconds(oldTime) - convertTimeToSeconds(newTime);
}

// GET endpoint
export async function GET(request: NextRequest) {
	try {
		await requireAuth(request, ['ADMIN', 'CLUB', 'TEACHER', 'PARENT']);
		const { searchParams } = new URL(request.url);
		const swimmerName = searchParams.get('name') || '';
		const affiliateCode = searchParams.get('affiliateCode') || '';
		if (!swimmerName && !affiliateCode) return NextResponse.json({ message: 'Se requiere el nombre del nadador o código de afiliado' }, { status: 400 });

		const fdpnData = await searchSwimmerInFDPN(swimmerName, affiliateCode || undefined);

		return NextResponse.json({
			fdpnData,
			found: !!fdpnData.name,
			summary: {
				totalTimes: fdpnData.times.length,
				bestEvents: fdpnData.times.slice(0, 3).map((t: any) => ({ event: t.event, time: t.time, competition: t.competition, place: t.place })),
				lastCompetition: fdpnData.times.length > 0 ? fdpnData.times[0].competition : null,
				categories: [...new Set(fdpnData.times.map((t: any) => t.event.split('m')[0] + 'm'))],
				personalBests: getPersonalBests(fdpnData.times),
				recentProgress: getRecentProgress(fdpnData.times)
			}
		});
	} catch (error) {
		console.error('Error en búsqueda FDPN:', error);
		return NextResponse.json({ message: 'Error al buscar en FDPN', error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 });
	}
}

// POST kept as before (minimal behavior)
export async function POST(request: NextRequest) {
	try {
		await requireAuth(request, ['ADMIN', 'CLUB']);
		const { swimmerIds } = await request.json();
		if (!Array.isArray(swimmerIds) || swimmerIds.length === 0) return NextResponse.json({ message: 'Se requiere una lista de IDs de nadadores' }, { status: 400 });

		const results: any[] = [];
		for (const swimmerId of swimmerIds) {
			try {
				const swimmer = await (prisma as any).child.findUnique({ where: { id: swimmerId }, select: { id: true, firstName: true, lastName: true, club: { select: { name: true } } } });
				if (!swimmer) {
					results.push({ swimmerId, status: 'error', message: 'Nadador no encontrado' });
					continue;
				}
				const nameToSearch = `${swimmer.firstName} ${swimmer.lastName}`;
				const fdpnData = await searchSwimmerInFDPN(nameToSearch);
				if (fdpnData.name) {
					await (prisma as any).child.update({ where: { id: swimmerId }, data: { fdpnData: JSON.stringify(fdpnData), fdpnLastSync: new Date() } });
					results.push({ swimmerId, status: 'success', swimmerName: nameToSearch, timesFound: fdpnData.times.length });
				} else {
					results.push({ swimmerId, status: 'not_found', swimmerName: nameToSearch, message: 'No se encontraron datos en FDPN' });
				}
				await new Promise(resolve => setTimeout(resolve, 1000));
			} catch (error) {
				results.push({ swimmerId, status: 'error', message: error instanceof Error ? error.message : 'Error desconocido' });
			}
		}

		return NextResponse.json({ message: 'Sincronización completada', results, total: swimmerIds.length, successful: results.filter(r => r.status === 'success').length, errors: results.filter(r => r.status === 'error').length, notFound: results.filter(r => r.status === 'not_found').length });
	} catch (error) {
		console.error('Error en sincronización masiva:', error);
		return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
	}
}

