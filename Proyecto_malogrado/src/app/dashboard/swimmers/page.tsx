"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Users, Trophy, Activity, Eye, ExternalLink } from "lucide-react";
import SwimmerForm from "@/components/SwimmerForm";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface Swimmer {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  club?: {
    id: string;
    name: string;
  };
  coach?: string;
  photo?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    records: number;
    trainings: number;
  };
  createdAt: string;
}

export default function SwimmersPage() {
  const [swimmers, setSwimmers] = useState<Swimmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSwimmer, setEditingSwimmer] = useState<Swimmer | null>(null);

  const fetchSwimmers = async () => {
    try {
      // Agregar timestamp para evitar cache
      const response = await fetch(`/api/swimmers?t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setSwimmers(data);
      } else {
        toast.error('Error al cargar nadadores');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwimmers();
  }, []);

  const handleCreate = () => {
    setEditingSwimmer(null);
    setFormOpen(true);
  };

  const handleEdit = (swimmer: Swimmer) => {
    setEditingSwimmer(swimmer);
    setFormOpen(true);
  };

  const handleDelete = async (swimmer: Swimmer) => {
    if (confirm(`¿Estás seguro de eliminar a ${swimmer.name}?`)) {
      try {
        const response = await fetch(`/api/swimmers/${swimmer.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          toast.success('Nadador eliminado exitosamente');
          fetchSwimmers();
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Error al eliminar nadador');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error de conexión');
      }
    }
  };

  const handleFormSuccess = () => {
    fetchSwimmers();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nadadores</h1>
            <p className="text-muted-foreground">
              Gestiona la información de los nadadores
            </p>
          </div>
        </div>
        <div className="rounded-lg border p-8">
          <div className="text-center text-muted-foreground">
            <p>Cargando nadadores...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nadadores</h1>
          <p className="text-muted-foreground">
            Gestiona la información de los nadadores
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Users className="mr-2 h-4 w-4" />
          Agregar Nadador
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Total Nadadores</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{swimmers.length}</p>
          <p className="text-xs text-gray-500 mt-1">
            {swimmers.filter(s => s.gender === 'MALE').length} masculinos, {swimmers.filter(s => s.gender === 'FEMALE').length} femeninos
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold">Entrenamientos</h3>
          </div>
          <p className="text-2xl font-bold mt-2">
            {swimmers.reduce((total, swimmer) => total + swimmer._count.trainings, 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Promedio: {swimmers.length > 0 ? Math.round(swimmers.reduce((total, swimmer) => total + swimmer._count.trainings, 0) / swimmers.length) : 0} por nadador
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold">Competencias</h3>
          </div>
          <p className="text-2xl font-bold mt-2">
            {swimmers.reduce((total, swimmer) => total + swimmer._count.records, 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Promedio: {swimmers.length > 0 ? Math.round(swimmers.reduce((total, swimmer) => total + swimmer._count.records, 0) / swimmers.length) : 0} por nadador
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold">Clubs Activos</h3>
          </div>
          <p className="text-2xl font-bold mt-2">
            {new Set(swimmers.map(s => s.club).filter(Boolean)).size}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Clubs diferentes registrados
          </p>
        </div>
      </div>

      {/* Swimmers List */}
      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium">Nadador</th>
                <th className="text-left p-4 font-medium">Edad</th>
                <th className="text-left p-4 font-medium">Género</th>
                <th className="text-left p-4 font-medium">Club</th>
                <th className="text-left p-4 font-medium">Entrenador</th>
                <th className="text-left p-4 font-medium">Padre/Tutor</th>
                <th className="text-left p-4 font-medium">Estadísticas</th>
                <th className="text-right p-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {swimmers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center space-y-4">
                      <Users className="h-12 w-12 text-gray-300" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">No hay nadadores registrados</h3>
                        <p className="text-gray-500 mt-1">
                          Comienza agregando el primer nadador al sistema
                        </p>
                      </div>
                      <Button onClick={handleCreate} className="mt-4">
                        <Users className="mr-2 h-4 w-4" />
                        Agregar Primer Nadador
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                swimmers.map((swimmer) => (
                  <tr key={swimmer.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        {swimmer.photo ? (
                          <img
                            src={swimmer.photo}
                            alt={swimmer.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{swimmer.name}</p>
                          <p className="text-sm text-gray-500">
                            Registrado: {formatDate(swimmer.createdAt)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium">{calculateAge(swimmer.birthDate)} años</span>
                      <p className="text-sm text-gray-500">
                        {formatDate(swimmer.birthDate)}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        swimmer.gender === 'MALE' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-pink-100 text-pink-800'
                      }`}>
                        {swimmer.gender === 'MALE' ? 'Masculino' : 'Femenino'}
                      </span>
                    </td>
                    <td className="p-4">
                      {swimmer.club?.name || (
                        <span className="text-gray-400">Sin club</span>
                      )}
                    </td>
                    <td className="p-4">
                      {swimmer.coach || (
                        <span className="text-gray-400">Sin entrenador</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{swimmer.user.name}</p>
                        <p className="text-sm text-gray-500">{swimmer.user.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <Activity className="h-3 w-3 text-green-500" />
                          <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                            {swimmer._count.trainings} entrenamientos
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Trophy className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
                            {swimmer._count.records} competencias
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <Link href={`/dashboard/swimmers/${swimmer.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(swimmer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(swimmer)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Swimmer Form Modal */}
      <SwimmerForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={handleFormSuccess}
        swimmer={editingSwimmer}
      />
    </div>
  );
}