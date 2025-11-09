"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users as UsersIcon,
  BadgeCheck,
  Clock,
  AlertTriangle,
  AlarmClock,
  XCircle,
  Plus,
  RefreshCcw,
  Star,
  Trash2,
  Edit,
  Search
} from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteUserConfirm, setShowDeleteUserConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TrialUser | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PARENT',
    trialDays: 7,
    accountType: 'trial' // 'trial' o 'permanent'
  });

  // Solo mostrar usuarios con rol PARENT
  const parentUsers = users.filter(u => (u.role || '').toUpperCase() === 'PARENT');

  // Filtrar por búsqueda
  const filteredUsers = parentUsers.filter(u => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search)
    );
  });

  // Estadísticas calculadas sobre padres filtrados
  const stats = {
    total: filteredUsers.length,
    trial: filteredUsers.filter(u => u.isTrialAccount && u.accountStatus === 'TRIAL').length,
    permanent: filteredUsers.filter(u => !u.isTrialAccount && u.accountStatus === 'ACTIVE').length,
    expired: filteredUsers.filter(u => u.accountStatus === 'EXPIRED').length,
    expiringSoon: filteredUsers.filter(u => u.daysLeft !== null && u.daysLeft <= 2 && u.daysLeft >= 0).length,
    expiringToday: filteredUsers.filter(u => u.daysLeft === 0).length
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
      } else {
        toast.error('Error al cargar usuarios', {
          position: 'top-right',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error de conexión al cargar usuarios', {
        position: 'top-right',
        duration: 3000,
      });
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
        toast.success(`Trial extendido ${days} días exitosamente`, {
          position: 'top-right',
          duration: 4000,
          icon: '⏰',
          style: {
            background: '#10b981',
            color: '#fff',
            fontWeight: '500',
          },
        });
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error extendiendo trial', {
          position: 'top-right',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión', {
        position: 'top-right',
        duration: 3000,
      });
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
        toast.success('Usuario convertido a permanente exitosamente', {
          position: 'top-right',
          duration: 4000,
          icon: '⭐',
          style: {
            background: '#10b981',
            color: '#fff',
            fontWeight: '500',
          },
        });
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error convirtiendo usuario', {
          position: 'top-right',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión', {
        position: 'top-right',
        duration: 3000,
      });
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
        toast.success('Usuario creado exitosamente', {
          position: 'top-right',
          duration: 4000,
          icon: '✅',
          style: {
            background: '#10b981',
            color: '#fff',
            fontWeight: '500',
          },
        });
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al crear usuario', {
          position: 'top-right',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Error de conexión', {
        position: 'top-right',
        duration: 3000,
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCleanupExpired = async () => {
    setShowDeleteConfirm(true);
  };

  const confirmCleanup = async () => {
    try {
      setActionLoading('cleanup');
      setShowDeleteConfirm(false);
      
      const response = await fetch('/api/admin/users/trial/cleanup', {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        await fetchUsers();
        toast.success(result.message || 'Usuarios expirados eliminados', {
          position: 'top-right',
          duration: 4000,
          icon: '🗑️',
          style: {
            background: '#10b981',
            color: '#fff',
            fontWeight: '500',
          },
        });
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error eliminando usuarios', {
          position: 'top-right',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión', {
        position: 'top-right',
        duration: 3000,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditUser = (user: TrialUser) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      trialDays: 7,
      accountType: user.isTrialAccount ? 'trial' : 'permanent'
    });
    setShowEditForm(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setCreateLoading(true);
      
      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      // Solo incluir password si se proporcionó uno nuevo
      if (formData.password) {
        payload.password = formData.password;
      }

      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowEditForm(false);
        setSelectedUser(null);
        await fetchUsers();
        toast.success('Usuario actualizado exitosamente', {
          position: 'top-right',
          duration: 4000,
          icon: '✅',
          style: {
            background: '#10b981',
            color: '#fff',
            fontWeight: '500',
          },
        });
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al actualizar usuario', {
          position: 'top-right',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error de conexión', {
        position: 'top-right',
        duration: 3000,
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteUser = (user: TrialUser) => {
    setSelectedUser(user);
    setShowDeleteUserConfirm(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(selectedUser.id);
      setShowDeleteUserConfirm(false);
      
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await fetchUsers();
        toast.success('Usuario eliminado exitosamente', {
          position: 'top-right',
          duration: 4000,
          icon: '🗑️',
          style: {
            background: '#10b981',
            color: '#fff',
            fontWeight: '500',
          },
        });
        setSelectedUser(null);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error eliminando usuario', {
          position: 'top-right',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión', {
        position: 'top-right',
        duration: 3000,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (user: TrialUser) => {
    if (!user.isTrialAccount && user.accountStatus === 'ACTIVE') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <BadgeCheck className="h-3 w-3 mr-1" /> PERMANENTE
        </span>
      );
    }
    
    if (user.accountStatus === 'EXPIRED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" /> EXPIRADO
        </span>
      );
    }
    
    if (user.isTrialAccount && user.daysLeft !== null) {
      const color = user.daysLeft <= 1 ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800';
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
          <Clock className="h-3 w-3 mr-1" /> TRIAL ({user.daysLeft}d)
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <Clock className="h-3 w-3 mr-1" /> TRIAL
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
      {/* Toaster para notificaciones */}
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <UsersIcon className="h-8 w-8 text-blue-600" />
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600 mt-1">Administra usuarios, trials y permisos</p>
          
          {/* Barra de búsqueda movida debajo de filtros */}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setFormData({
                name: '',
                email: '',
                password: '',
                role: 'PARENT',
                trialDays: 7,
                accountType: 'trial'
              });
              setShowCreateForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Crear Usuario
          </button>
          <button
            onClick={handleCleanupExpired}
            disabled={actionLoading === 'cleanup'}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
          >
            {actionLoading === 'cleanup' ? 'Eliminando...' : 'Limpiar Expirados'}
          </button>
        </div>
      </div>

      {/* Modal de crear usuario */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => {
          setShowCreateForm(false);
        }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
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
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {createLoading ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de editar usuario */}
      {showEditForm && selectedUser && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => {
          setShowEditForm(false);
          setSelectedUser(null);
        }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Editar Usuario</h2>
              <button 
                onClick={() => {
                  setShowEditForm(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="space-y-4">
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
                  Nueva contraseña (opcional)
                </label>
                <input
                  type="password"
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Dejar vacío para no cambiar"
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

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {createLoading ? 'Actualizando...' : 'Actualizar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar usuario individual */}
      {showDeleteUserConfirm && selectedUser && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => {
          setShowDeleteUserConfirm(false);
          setSelectedUser(null);
        }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-lg">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ¿Eliminar usuario?
                </h3>
                <p className="text-sm text-gray-600">
                  Estás a punto de eliminar a <span className="font-semibold">{selectedUser.name}</span> ({selectedUser.email}).
                </p>
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    ⚠️ Esta acción es permanente y no se puede deshacer. Todos los datos asociados a este usuario serán eliminados.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteUserConfirm(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteUser}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar usuarios expirados */}
      {showDeleteConfirm && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Confirmar Eliminación</h2>
                <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                ¿Estás seguro de que deseas eliminar todos los usuarios trial expirados?
              </p>
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Esto eliminará permanentemente todos los usuarios cuyas cuentas trial hayan expirado.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmCleanup}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium inline-flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </button>
            </div>
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
                <div className="text-sm text-gray-600">Total Padres</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                <UsersIcon className="h-5 w-5" />
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
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white">
                <BadgeCheck className="h-5 w-5" />
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
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center text-white">
                <Clock className="h-5 w-5" />
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
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white">
                <AlertTriangle className="h-5 w-5" />
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
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white">
                <AlarmClock className="h-5 w-5" />
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
              <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center text-white">
                <XCircle className="h-5 w-5" />
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
              { key: 'all', label: 'Todos', icon: <UsersIcon className="h-4 w-4" /> },
              { key: 'trial', label: 'Trial Activos', icon: <Clock className="h-4 w-4" /> },
              { key: 'permanent', label: 'Permanentes', icon: <BadgeCheck className="h-4 w-4" /> },
              { key: 'expiring_soon', label: 'Expiran Pronto', icon: <AlertTriangle className="h-4 w-4" /> },
              { key: 'expired', label: 'Expirados', icon: <XCircle className="h-4 w-4" /> }
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
                <span className="inline-flex items-center gap-2">{icon} {label}</span>
              </button>
            ))}
          </div>

          {/* Barra de búsqueda debajo de los filtros */}
          <div className="relative mt-4 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios Padres ({parentUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Cargando usuarios...</div>
          ) : parentUsers.length === 0 ? (
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
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">Padre/Madre</div>
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
                        <div className="flex gap-2 flex-wrap">
                          {/* Botones de trial */}
                          {user.isTrialAccount && user.accountStatus !== 'EXPIRED' && (
                            <>
                              <button
                                onClick={() => handleExtendTrial(user.id, 7)}
                                disabled={actionLoading === user.id}
                                className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200 disabled:opacity-50 inline-flex items-center gap-1"
                              >
                                <RefreshCcw className="h-3 w-3" /> +7d
                              </button>
                              <button
                                onClick={() => handleExtendTrial(user.id, 15)}
                                disabled={actionLoading === user.id}
                                className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded hover:bg-orange-200 disabled:opacity-50 inline-flex items-center gap-1"
                              >
                                <RefreshCcw className="h-3 w-3" /> +15d
                              </button>
                              <button
                                onClick={() => handleConvertToPermanent(user.id)}
                                disabled={actionLoading === user.id}
                                className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 disabled:opacity-50 inline-flex items-center gap-1"
                              >
                                <Star className="h-3 w-3" /> Permanente
                              </button>
                            </>
                          )}
                          {user.accountStatus === 'EXPIRED' && (
                            <button
                              onClick={() => handleExtendTrial(user.id, 7)}
                              disabled={actionLoading === user.id}
                              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 disabled:opacity-50 inline-flex items-center gap-1"
                            >
                              <RefreshCcw className="h-3 w-3" /> Reactivar
                            </button>
                          )}
                          
                          {/* Botones de editar y eliminar */}
                          <button
                            onClick={() => handleEditUser(user)}
                            disabled={actionLoading === user.id}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 disabled:opacity-50 inline-flex items-center gap-1"
                            title="Editar usuario"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            disabled={actionLoading === user.id}
                            className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200 disabled:opacity-50 inline-flex items-center gap-1"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
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
    </div>
  );
};

export default UserManagementPage;
