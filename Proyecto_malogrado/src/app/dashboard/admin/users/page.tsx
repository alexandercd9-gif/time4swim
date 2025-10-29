'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TrialUser {
  id: string;
  name: string;
  email: string;
  role: string;
  accountStatus: string;
  isTrialAccount: boolean;
  trialExpiresAt: string | null;
  daysLeft: number | null;
  createdAt: string;
}

const UserManagementPage = () => {
  const [users, setUsers] = useState<TrialUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PARENT',
    trialDays: 7,
    accountType: 'trial' // 'trial' o 'permanent'
  });

  // Estadísticas calculadas
  const stats = {
    total: users.length,
    trial: users.filter(u => u.isTrialAccount && u.accountStatus === 'TRIAL').length,
    permanent: users.filter(u => !u.isTrialAccount && u.accountStatus === 'ACTIVE').length,
    expired: users.filter(u => u.accountStatus === 'EXPIRED').length,
    expiringSoon: users.filter(u => u.daysLeft !== null && u.daysLeft <= 2 && u.daysLeft >= 0).length,
    expiringToday: users.filter(u => u.daysLeft === 0).length
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/trial?filter=${filter}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const handleExtendTrial = async (userId: string, days: number) => {
    try {
      setActionLoading(userId);
      const response = await fetch(`/api/admin/users/trial/${userId}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ days })
      });

      if (response.ok) {
        await fetchUsers();
        alert(`Trial extendido ${days} días exitosamente`);
      } else {
        const error = await response.json();
        alert(error.message || 'Error extendiendo trial');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error extendiendo trial');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConvertToPermanent = async (userId: string) => {
    try {
      setActionLoading(userId);
      const response = await fetch(`/api/admin/users/trial/${userId}/convert`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        await fetchUsers();
        alert('Usuario convertido a permanente exitosamente');
      } else {
        const error = await response.json();
        alert(error.message || 'Error convirtiendo usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error convirtiendo usuario');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreateLoading(true);
      
      const payload = {
        ...formData,
        isTrialAccount: formData.accountType === 'trial',
        trialDays: formData.accountType === 'trial' ? formData.trialDays : undefined
      };

      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Resetear formulario
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'PARENT',
          trialDays: 7,
          accountType: 'trial'
        });
        setShowCreateForm(false);
        await fetchUsers(); // Recargar lista
        alert('Usuario creado exitosamente');
      } else {
        const error = await response.json();
        alert(error.message || 'Error al crear usuario');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error al crear usuario');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCleanupExpired = async () => {
    if (!confirm('¿Estás seguro de eliminar todos los usuarios trial expirados?')) {
      return;
    }

    try {
      setActionLoading('cleanup');
      const response = await fetch('/api/admin/users/trial/cleanup', {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        await fetchUsers();
        alert(result.message);
      } else {
        const error = await response.json();
        alert(error.message || 'Error eliminando usuarios');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error eliminando usuarios');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (user: TrialUser) => {
    if (!user.isTrialAccount && user.accountStatus === 'ACTIVE') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          🟢 PERMANENTE
        </span>
      );
    }
    
    if (user.accountStatus === 'EXPIRED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          🔴 EXPIRADO
        </span>
      );
    }
    
    if (user.isTrialAccount && user.daysLeft !== null) {
      const color = user.daysLeft <= 1 ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800';
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
          🟡 TRIAL ({user.daysLeft}d)
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        ⚪ TRIAL
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Crear Usuario
          </button>
          <button
            onClick={handleCleanupExpired}
            disabled={actionLoading === 'cleanup'}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {actionLoading === 'cleanup' ? 'Eliminando...' : '🗑️ Limpiar Expirados'}
          </button>
        </div>
      </div>

      {/* Modal de crear usuario */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Crear Nuevo Usuario</h2>
              <button 
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="juan@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="PARENT">Padre/Madre</option>
                  <option value="CLUB">Administrador de Club</option>
                  <option value="TEACHER">Instructor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de cuenta
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="accountType"
                      value="trial"
                      checked={formData.accountType === 'trial'}
                      onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                      className="mr-2"
                    />
                    <span>Cuenta Trial (temporal)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="accountType"
                      value="permanent"
                      checked={formData.accountType === 'permanent'}
                      onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                      className="mr-2"
                    />
                    <span>Cuenta Permanente</span>
                  </label>
                </div>
              </div>

              {formData.accountType === 'trial' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Días de trial
                  </label>
                  <select
                    value={formData.trialDays}
                    onChange={(e) => setFormData({...formData, trialDays: parseInt(e.target.value)})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={3}>3 días</option>
                    <option value={7}>7 días (recomendado)</option>
                    <option value={15}>15 días</option>
                    <option value={30}>30 días</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {createLoading ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Usuarios</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">👥</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.permanent}</div>
                <div className="text-sm text-gray-600">Permanentes</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">⭐</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.trial}</div>
                <div className="text-sm text-gray-600">En Trial</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">⏱️</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.expiringSoon}</div>
                <div className="text-sm text-gray-600">Expiran Pronto</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">⚠️</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.expiringToday}</div>
                <div className="text-sm text-gray-600">Expiran Hoy</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">🚨</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.expired}</div>
                <div className="text-sm text-gray-600">Expirados</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">❌</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Todos', icon: '👥' },
              { key: 'trial', label: 'Trial Activos', icon: '🟡' },
              { key: 'permanent', label: 'Permanentes', icon: '🟢' },
              { key: 'expiring_soon', label: 'Expiran Pronto', icon: '🟠' },
              { key: 'expired', label: 'Expirados', icon: '🔴' }
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabla de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Cargando usuarios...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No hay usuarios para este filtro</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Usuario</th>
                    <th className="text-left py-3 px-4">Estado</th>
                    <th className="text-left py-3 px-4">Registro</th>
                    <th className="text-left py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">{user.role}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(user)}
                        {user.trialExpiresAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            Expira: {new Date(user.trialExpiresAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {user.isTrialAccount && user.accountStatus !== 'EXPIRED' && (
                            <>
                              <button
                                onClick={() => handleExtendTrial(user.id, 7)}
                                disabled={actionLoading === user.id}
                                className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200 disabled:opacity-50"
                              >
                                +7d
                              </button>
                              <button
                                onClick={() => handleExtendTrial(user.id, 15)}
                                disabled={actionLoading === user.id}
                                className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded hover:bg-orange-200 disabled:opacity-50"
                              >
                                +15d
                              </button>
                              <button
                                onClick={() => handleConvertToPermanent(user.id)}
                                disabled={actionLoading === user.id}
                                className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 disabled:opacity-50"
                              >
                                ⭐ Permanente
                              </button>
                            </>
                          )}
                          {user.accountStatus === 'EXPIRED' && (
                            <button
                              onClick={() => handleExtendTrial(user.id, 7)}
                              disabled={actionLoading === user.id}
                              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 disabled:opacity-50"
                            >
                              🔄 Reactivar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementPage;