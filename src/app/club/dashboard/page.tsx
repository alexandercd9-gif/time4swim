export default function ClubDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard - Club Natación
        </h1>
        <div className="text-sm text-gray-600">
          Club: <span className="font-semibold">Acuáticos Madrid</span>
        </div>
      </div>

      {/* Estadísticas del club */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="text-3xl font-bold text-blue-600">45</div>
          <div className="text-gray-600">Nadadores Activos</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="text-3xl font-bold text-green-600">8</div>
          <div className="text-gray-600">Entrenadores</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="text-3xl font-bold text-purple-600">12</div>
          <div className="text-gray-600">Grupos de Entrenamiento</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="text-3xl font-bold text-orange-600">5</div>
          <div className="text-gray-600">Competiciones Este Mes</div>
        </div>
      </div>

      {/* Acciones rápidas para club */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Gestionar Club</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
            <i className="fas fa-user-friends text-blue-600 mb-2"></i>
            <div className="font-medium">Gestionar Nadadores</div>
            <div className="text-sm text-gray-600">Inscripciones y altas</div>
          </button>
          <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
            <i className="fas fa-users text-green-600 mb-2"></i>
            <div className="font-medium">Entrenadores</div>
            <div className="text-sm text-gray-600">Staff del club</div>
          </button>
          <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
            <i className="fas fa-trophy text-purple-600 mb-2"></i>
            <div className="font-medium">Competiciones</div>
            <div className="text-sm text-gray-600">Organizar eventos</div>
          </button>
          <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
            <i className="fas fa-receipt text-orange-600 mb-2"></i>
            <div className="font-medium">Pagos y Cuotas</div>
            <div className="text-sm text-gray-600">Gestión financiera</div>
          </button>
        </div>
      </div>
    </div>
  );
}