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
  Trash2,
  Baby,
  Heart,
  Send
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

export default function FamilyManagement() {
  const [children, setChildren] = useState<Child[]>([]);
  const [allParents, setAllParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedChildForInvite, setSelectedChildForInvite] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [childrenRes, parentsRes] = await Promise.all([
        fetch('/api/family/children'),
        fetch('/api/admin/parents')
      ]);

      if (childrenRes.ok && parentsRes.ok) {
        const [childrenData, parentsData] = await Promise.all([
          childrenRes.json(),
          parentsRes.json()
        ]);
        setChildren(childrenData);
        setAllParents(parentsData);
      } else {
        toast.error('Error al cargar los datos familiares');
      }
    } catch (error) {
      console.error('Error fetching family data:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteParent = async () => {
    if (!inviteEmail || !selectedChildForInvite) {
      toast.error('Selecciona un hijo y escribe el email del padre a invitar');
      return;
    }

    // Buscar el padre por email
    const parentToInvite = allParents.find(p => p.email.toLowerCase() === inviteEmail.toLowerCase());
    
    if (!parentToInvite) {
      toast.error('No se encontró un padre registrado con ese email');
      return;
    }

    const loadingToast = toast.loading('Enviando invitación...');

    try {
      const response = await fetch('/api/family/associate-parent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId: selectedChildForInvite,
          parentId: parentToInvite.id
        }),
      });

      if (response.ok) {
        toast.dismiss(loadingToast);
        toast.success('¡Padre asociado exitosamente! 🎉');
        setInviteEmail('');
        setSelectedChildForInvite('');
        fetchData();
      } else {
        const error = await response.json();
        toast.dismiss(loadingToast);
        toast.error(error.message || 'Error al asociar padre');
      }
    } catch (error) {
      console.error('Error inviting parent:', error);
      toast.dismiss(loadingToast);
      toast.error('Error de conexión');
    }
  };

  const handleRemoveParent = async (childId: string, parentId: string, parentName: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <div>
          <strong>¿Quitar acceso familiar?</strong>
          <p className="text-sm text-gray-600 mt-1">
            {parentName} ya no podrá ver este nadador
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
              toast.dismiss(t.id);
              const loadingToast = toast.loading('Quitando acceso...');
              
              try {
                const response = await fetch('/api/family/associate-parent', {
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
                  toast.success('Acceso removido exitosamente');
                  fetchData();
                } else {
                  toast.dismiss(loadingToast);
                  toast.error('Error al quitar acceso');
                }
              } catch (error) {
                console.error('Error removing access:', error);
                toast.dismiss(loadingToast);
                toast.error('Error de conexión');
              }
            }}
          >
            Quitar Acceso
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

  const getParentTypeLabel = (type: string | null | undefined) => {
    const types = {
      'PADRE': 'Padre',
      'MADRE': 'Madre',
      'TUTOR': 'Tutor',
      'ABUELO': 'Abuelo',
      'ABUELA': 'Abuela',
      'OTRO': 'Otro'
    };
    return type ? types[type as keyof typeof types] || type : 'Familiar';
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
        <h1 className="text-3xl font-bold text-gray-900">Gestión Familiar</h1>
        <p className="text-gray-600 mt-2">Comparte el acceso a tus hijos con otros familiares</p>
      </div>

      {/* Formulario de invitación */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-semibold">Invitar Familiar</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="child">Seleccionar Hijo</Label>
            <Select value={selectedChildForInvite} onValueChange={setSelectedChildForInvite}>
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
            <Label htmlFor="email">Email del Familiar</Label>
            <Input
              id="email"
              type="email"
              placeholder="ejemplo@email.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          
          <div className="flex items-end">
            <Button 
              onClick={handleInviteParent}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Dar Acceso
            </Button>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 <strong>Tip:</strong> El familiar debe estar registrado en el sistema con ese email. 
            Si no está registrado, contacta al administrador para que lo cree primero.
          </p>
        </div>
      </Card>

      {/* Lista de hijos y sus familiares */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Accesos Familiares por Hijo</h3>
        
        {children.length === 0 ? (
          <Card className="p-8 text-center">
            <Baby className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tienes hijos registrados</h3>
            <p className="mt-1 text-sm text-gray-500">Comienza registrando a tus nadadores.</p>
          </Card>
        ) : (
          children.map((child) => (
            <Card key={child.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <Baby className="h-5 w-5 text-blue-500" />
                    {child.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {child.gender === 'MALE' ? 'Niño' : 'Niña'} - 
                    Nacido: {new Date(child.birthDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {child.parents.length} familiar{child.parents.length !== 1 ? 'es' : ''} con acceso
                </span>
              </div>
              
              {child.parents.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Solo tú tienes acceso a este nadador</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Familiares con acceso:</p>
                  {child.parents.map((parentRelation) => (
                    <div 
                      key={parentRelation.user.id} 
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-gray-500" />
                        <div>
                          <span className="font-medium">{parentRelation.user.name}</span>
                          <span className="text-sm text-purple-600 ml-2">
                            ({getParentTypeLabel(parentRelation.user.parentType)})
                          </span>
                          <div className="text-sm text-gray-500">
                            <Mail className="h-3 w-3 inline mr-1" />
                            {parentRelation.user.email}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleRemoveParent(
                          child.id, 
                          parentRelation.user.id, 
                          parentRelation.user.name
                        )}
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