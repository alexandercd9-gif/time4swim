"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { 
  Users, 
  UserPlus, 
  Plus,
  Trash2,
  Baby
} from "lucide-react";

interface Parent {
  id: string;
  name: string;
  email: string;
  parentType?: string | null;
}

interface Child {
  id: string;
  name: string;
  gender: string;
  birthDate: string;
  parents: Array<{
    user: Parent;
    isActive: boolean;
  }>;
}

export default function ParentChildAssociation() {
  const [children, setChildren] = useState<Child[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [selectedParent, setSelectedParent] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [childrenRes, parentsRes] = await Promise.all([
        fetch('/api/admin/children'),
        fetch('/api/admin/parents')
      ]);

      if (childrenRes.ok && parentsRes.ok) {
        const [childrenData, parentsData] = await Promise.all([
          childrenRes.json(),
          parentsRes.json()
        ]);
        setChildren(childrenData);
        setParents(parentsData);
      } else {
        toast.error('Error al cargar los datos');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleAssociateParent = async () => {
    if (!selectedChild || !selectedParent) {
      toast.error('Selecciona un hijo y un padre');
      return;
    }

    const loadingToast = toast.loading('Asociando padre con hijo...');

    try {
      const response = await fetch('/api/admin/associate-parent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId: selectedChild,
          parentId: selectedParent
        }),
      });

      if (response.ok) {
        toast.dismiss(loadingToast);
        toast.success('¡Padre asociado exitosamente! 🎉');
        setSelectedChild('');
        setSelectedParent('');
        fetchData();
      } else {
        const error = await response.json();
        toast.dismiss(loadingToast);
        toast.error(error.message || 'Error al asociar padre');
      }
    } catch (error) {
      console.error('Error associating parent:', error);
      toast.dismiss(loadingToast);
      toast.error('Error de conexión');
    }
  };

  const handleRemoveParent = async (childId: string, parentId: string) => {
    const loadingToast = toast.loading('Eliminando asociación...');

    try {
      const response = await fetch('/api/admin/associate-parent', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId,
          parentId
        }),
      });

      if (response.ok) {
        toast.dismiss(loadingToast);
        toast.success('Asociación eliminada');
        fetchData();
      } else {
        toast.dismiss(loadingToast);
        toast.error('Error al eliminar asociación');
      }
    } catch (error) {
      console.error('Error removing association:', error);
      toast.dismiss(loadingToast);
      toast.error('Error de conexión');
    }
  };

  const getParentTypeLabel = (type: string | null | undefined) => {
    const types = {
      'PADRE': 'Padre',
      'MADRE': 'Madre',
      'TUTOR': 'Tutor',
      'ABUELO': 'Abuelo',
      'ABUELA': 'Abuela',
      'OTRO': 'Otro'
    };
    return type ? types[type as keyof typeof types] || type : 'No especificado';
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Asociar Padres con Hijos</h1>
        <p className="text-gray-600 mt-2">Permite que múltiples padres vean los mismos nadadores</p>
      </div>

      {/* Formulario de asociación */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Nueva Asociación Padre-Hijo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="child">Seleccionar Hijo</Label>
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar nadador" />
              </SelectTrigger>
              <SelectContent>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name} ({child.gender === 'MALE' ? 'Niño' : 'Niña'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="parent">Seleccionar Padre/Madre</Label>
            <Select value={selectedParent} onValueChange={setSelectedParent}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar padre" />
              </SelectTrigger>
              <SelectContent>
                {parents.map((parent) => (
                  <SelectItem key={parent.id} value={parent.id}>
                    {parent.name} - {getParentTypeLabel(parent.parentType)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button 
              onClick={handleAssociateParent}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Asociar
            </Button>
          </div>
        </div>
      </Card>

      {/* Lista de asociaciones existentes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Asociaciones Existentes</h3>
        
        {children.length === 0 ? (
          <Card className="p-8 text-center">
            <Baby className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay nadadores registrados</h3>
            <p className="mt-1 text-sm text-gray-500">Comienza registrando nadadores en el sistema.</p>
          </Card>
        ) : (
          children.map((child) => (
            <Card key={child.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{child.name}</h4>
                  <p className="text-sm text-gray-500">
                    {child.gender === 'MALE' ? 'Niño' : 'Niña'} - 
                    Nacido: {new Date(child.birthDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {child.parents.length} padre{child.parents.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {child.parents.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No tiene padres asociados</p>
              ) : (
                <div className="space-y-2">
                  {child.parents.map((parentRelation) => (
                    <div 
                      key={parentRelation.user.id} 
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <span className="font-medium">{parentRelation.user.name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({getParentTypeLabel(parentRelation.user.parentType)})
                        </span>
                        <span className="text-sm text-gray-400 ml-2">
                          {parentRelation.user.email}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleRemoveParent(child.id, parentRelation.user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}