"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Calendar,
  Trash2,
  Edit,
  Eye,
  EyeOff
} from "lucide-react";

interface Parent {
  id: string;
  name: string;
  email: string;
  role: string;
  parentType?: string | null;
  createdAt: string;
  _count: {
    children: number;
  };
}

export default function ParentsManagement() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    parentType: ''
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    password: '',
    parentType: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Opciones de tipo de parentesco
  const parentTypeOptions = [
    { value: 'PADRE', label: 'Padre' },
    { value: 'MADRE', label: 'Madre' },
    { value: 'TUTOR', label: 'Tutor' },
    { value: 'ABUELO', label: 'Abuelo' },
    { value: 'ABUELA', label: 'Abuela' },
    { value: 'OTRO', label: 'Otro' },
  ];

  const getParentTypeLabel = (type: string | null | undefined) => {
    if (!type) return 'No especificado';
    const option = parentTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  };

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      const response = await fetch('/api/admin/parents');
      if (response.ok) {
        const data = await response.json();
        setParents(data);
      } else {
        toast.error('Error al cargar la lista de padres', {
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Error fetching parents:', error);
      toast.error('Error de conexión al cargar los datos', {
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateParent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const loadingToast = toast.loading('Creando padre...');
    
    try {
      const response = await fetch('/api/admin/parents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.dismiss(loadingToast);
        toast.success('¡Padre creado exitosamente! 🎉', {
          duration: 4000,
        });
        setFormData({ name: '', email: '', password: '', parentType: '' });
        setShowCreateForm(false);
        fetchParents();
      } else {
        const error = await response.json();
        toast.dismiss(loadingToast);
        toast.error(error.message || 'Error al crear el padre', {
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error creating parent:', error);
      toast.dismiss(loadingToast);
      toast.error('Error de conexión al crear el padre', {
        duration: 5000,
      });
    }
  };

  const handleDeleteParent = async (id: string) => {
    // Crear un toast de confirmación personalizado
    toast((t) => (
      <div className="flex flex-col gap-3">
        <div>
          <strong>¿Confirmar eliminación?</strong>
          <p className="text-sm text-gray-600 mt-1">
            Esta acción no se puede deshacer
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
              toast.dismiss(t.id);
              const loadingToast = toast.loading('Eliminando padre...');
              
              try {
                const response = await fetch(`/api/admin/parents/${id}`, {
                  method: 'DELETE',
                });

                if (response.ok) {
                  toast.dismiss(loadingToast);
                  toast.success('Padre eliminado exitosamente', {
                    duration: 3000,
                  });
                  fetchParents();
                } else {
                  toast.dismiss(loadingToast);
                  toast.error('Error al eliminar el padre', {
                    duration: 4000,
                  });
                }
              } catch (error) {
                console.error('Error deleting parent:', error);
                toast.dismiss(loadingToast);
                toast.error('Error de conexión al eliminar el padre', {
                  duration: 4000,
                });
              }
            }}
          >
            Eliminar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancelar
          </Button>
        </div>
      </div>
    ), {
      duration: Infinity,
      style: {
        maxWidth: '400px',
      },
    });
  };

  const handleEditParent = (parent: Parent) => {
    setEditingParent(parent);
    setEditFormData({
      name: parent.name,
      email: parent.email,
      password: '',
      parentType: parent.parentType || ''
    });
    setShowEditForm(true);
  };

  const handleUpdateParent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingParent) return;
    
    const loadingToast = toast.loading('Actualizando padre...');
    
    try {
      const response = await fetch(`/api/admin/parents/${editingParent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        toast.dismiss(loadingToast);
        toast.success('¡Padre actualizado exitosamente! ✅', {
          duration: 4000,
        });
        setEditFormData({ name: '', email: '', password: '', parentType: '' });
        setShowEditForm(false);
        setEditingParent(null);
        fetchParents();
      } else {
        const error = await response.json();
        toast.dismiss(loadingToast);
        toast.error(error.message || 'Error al actualizar el padre', {
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error updating parent:', error);
      toast.dismiss(loadingToast);
      toast.error('Error de conexión al actualizar el padre', {
        duration: 5000,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Padres</h1>
          <p className="text-gray-600 mt-2">Administra los usuarios padres del sistema</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Crear Padre
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Padres</p>
              <p className="text-2xl font-bold text-gray-900">{parents.length}</p>
            </div>
            <Users className="h-8 w-8 text-cyan-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Nadadores</p>
              <p className="text-2xl font-bold text-gray-900">
                {parents.reduce((total, parent) => total + parent._count.children, 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Promedio Hijos/Padre</p>
              <p className="text-2xl font-bold text-gray-900">
                {parents.length > 0 
                  ? (parents.reduce((total, parent) => total + parent._count.children, 0) / parents.length).toFixed(1)
                  : '0'
                }
              </p>
            </div>
            <Calendar className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Formulario de creación */}
      {showCreateForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Crear Nuevo Padre</h3>
          <form onSubmit={handleCreateParent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="parentType">Tipo de Parentesco</Label>
                <Select
                  value={formData.parentType}
                  onValueChange={(value) => setFormData({ ...formData, parentType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {parentTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="relative">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Crear Padre
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Formulario de edición */}
      {showEditForm && editingParent && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Editar Padre: {editingParent.name}</h3>
          <form onSubmit={handleUpdateParent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-name">Nombre Completo</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-parentType">Tipo de Parentesco</Label>
                <Select
                  value={editFormData.parentType}
                  onValueChange={(value) => setEditFormData({ ...editFormData, parentType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {parentTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="relative">
              <Label htmlFor="edit-password">Nueva Contraseña (opcional)</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showEditPassword ? "text" : "password"}
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  placeholder="Dejar vacío para mantener la actual"
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                  onClick={() => setShowEditPassword(!showEditPassword)}
                >
                  {showEditPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Actualizar Padre
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowEditForm(false);
                  setEditingParent(null);
                  setEditFormData({ name: '', email: '', password: '', parentType: '' });
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Lista de padres */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Lista de Padres</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Padre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hijos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {parents.map((parent) => (
                <tr key={parent.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {/* Avatar del padre oculto */}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{parent.name}</div>
                        <div className="text-sm text-gray-500">Padre</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {getParentTypeLabel(parent.parentType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{parent.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {parent._count.children} nadador{parent._count.children !== 1 ? 'es' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(parent.createdAt).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => handleEditParent(parent)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteParent(parent.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {parents.length === 0 && (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay padres registrados</h3>
            <p className="mt-1 text-sm text-gray-500">Comienza creando el primer padre del sistema.</p>
          </div>
        )}
      </Card>
    </div>
  );
}