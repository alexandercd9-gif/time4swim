"use client";

import { useEffect, useState } from "react";
import { Users, CalendarClock, ClipboardList, Target, Activity } from "lucide-react";

interface CoachStats {
	swimmers: number;
	sessionsThisWeek: number;
	groups: number;
	upcomingEvents: number;
}

export default function TeacherDashboard() {
	const [stats, setStats] = useState<CoachStats | null>(null);

	useEffect(() => {
		// TODO: Reemplazar con llamada a API real del profesor
		setStats({ swimmers: 18, sessionsThisWeek: 5, groups: 3, upcomingEvents: 2 });
	}, []);

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900">Dashboard - Profesor</h1>
				<div className="text-sm text-gray-600">Semana actual</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<div className="bg-white p-6 rounded-xl shadow-sm border">
					<div className="flex items-center justify-between">
						<div>
							<div className="text-3xl font-bold text-blue-600">{stats?.swimmers ?? 0}</div>
							<div className="text-gray-600">Nadadores</div>
						</div>
						<Users className="h-8 w-8 text-blue-600" />
					</div>
				</div>
				<div className="bg-white p-6 rounded-xl shadow-sm border">
					<div className="flex items-center justify-between">
						<div>
							<div className="text-3xl font-bold text-green-600">{stats?.sessionsThisWeek ?? 0}</div>
							<div className="text-gray-600">Sesiones esta semana</div>
						</div>
						<CalendarClock className="h-8 w-8 text-green-600" />
					</div>
				</div>
				<div className="bg-white p-6 rounded-xl shadow-sm border">
					<div className="flex items-center justify-between">
						<div>
							<div className="text-3xl font-bold text-purple-600">{stats?.groups ?? 0}</div>
							<div className="text-gray-600">Grupos</div>
						</div>
						<ClipboardList className="h-8 w-8 text-purple-600" />
					</div>
				</div>
				<div className="bg-white p-6 rounded-xl shadow-sm border">
					<div className="flex items-center justify-between">
						<div>
							<div className="text-3xl font-bold text-amber-600">{stats?.upcomingEvents ?? 0}</div>
							<div className="text-gray-600">Próximos eventos</div>
						</div>
						<Target className="h-8 w-8 text-amber-600" />
					</div>
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-sm border p-6">
				<h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
					<Activity className="h-5 w-5 text-blue-600" />
					Acciones rápidas
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<button className="p-4 border rounded-lg hover:bg-gray-50 text-left">Crear sesión de entrenamiento</button>
					<button className="p-4 border rounded-lg hover:bg-gray-50 text-left">Tomar asistencia</button>
					<button className="p-4 border rounded-lg hover:bg-gray-50 text-left">Enviar anuncio al grupo</button>
				</div>
			</div>
		</div>
	);
}