"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { Plus, Pencil, Trash2, Users, RefreshCcw, LayoutGrid, Table as TableIcon } from "lucide-react";
import SwimmerForm from "@/components/SwimmerForm";
import { calculateCategory } from "@/lib/categories";

interface ChildItem {
  id: string;
  name: string;
  birthDate: string;
  gender: "MALE" | "FEMALE";
  coach?: string | null;
  photo?: string | null;
  club?: { id: string; name: string } | null;
  _count?: { records: number; trainings: number };
}

export default function ParentChildrenPage() {
  const [children, setChildren] = useState<ChildItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<ChildItem | null>(null);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const loadChildren = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/swimmers", { credentials: "include" });
      if (!res.ok) throw new Error("No se pudieron cargar los nadadores");
      const data = await res.json();
      setChildren(data);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar tus nadadores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChildren();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return children;
    return children.filter((c) =>
      [c.name, c.coach, c.club?.name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [children, query]);

  const openCreate = () => {
    setEditing(null);
    setOpenForm(true);
  };

  const openEdit = (child: ChildItem) => {
    setEditing(child);
    setOpenForm(true);
  };

  const removeChild = async (id: string) => {
    const child = children.find((c) => c.id === id);
    if (!child) return;
    const ok = confirm(`¿Eliminar a ${child.name}? Esta acción no se puede deshacer.`);
    if (!ok) return;
    try {
      setBusyId(id);
      const res = await fetch(`/api/swimmers/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "No se pudo eliminar");
      }
      toast.success("Nadador eliminado");
      setChildren((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al eliminar");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" /> Mis Hijos
            </h1>
            <p className="text-gray-600">Administra a tus nadadores: crea, edita y elimina.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadChildren} disabled={loading}>
              <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Actualizar
            </Button>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> Agregar nadador
            </Button>
          </div>
        </div>

        {/* Filtros y Vista */}
        <div className="mb-4 flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Buscar por nombre, entrenador o club"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="flex-1 sm:flex-none"
            >
              <TableIcon className="h-4 w-4 mr-2" />
              Tabla
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="flex-1 sm:flex-none"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Tarjetas
            </Button>
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10">
            <div className="text-center text-gray-500">Cargando…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10">
            <div className="text-center text-gray-500">
              No hay nadadores. Crea el primero con el botón "Agregar nadador".
            </div>
          </div>
        ) : (
          <>
            {/* Vista Tabla */}
            {viewMode === 'table' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Fecha de nacimiento</TableHead>
                    <TableHead>Género</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Club</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => {
                    const category = calculateCategory(c.birthDate);
                    return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {c.photo ? (
                            <img src={c.photo} alt={c.name} className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-200" />
                          )}
                          <div>
                            <div>{c.name}</div>
                            <div className="text-xs text-gray-500">{c._count?.records || 0} records · {c._count?.trainings || 0} entrenamientos</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(c.birthDate).toLocaleDateString()}</TableCell>
                      <TableCell>{c.gender === 'MALE' ? 'Masculino' : 'Femenino'}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {category.name}
                        </span>
                      </TableCell>
                      <TableCell>{c.club?.name || '—'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                            <Pencil className="h-4 w-4 mr-1" /> Editar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => removeChild(c.id)} disabled={busyId === c.id}>
                            <Trash2 className="h-4 w-4 mr-1" /> {busyId === c.id ? 'Eliminando…' : 'Eliminar'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            )}

            {/* Vista Tarjetas */}
            {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((c) => {
                const category = calculateCategory(c.birthDate);
                return (
                  <div key={c.id} className="bg-white rounded-lg border shadow-sm p-4 space-y-4">
                    {/* Header con foto y nombre */}
                    <div className="flex items-center gap-3">
                      {c.photo ? (
                        <img src={c.photo} alt={c.name} className="h-12 w-12 rounded-full object-cover" />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <Users className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{c.name}</h3>
                        <p className="text-sm text-gray-500">
                          {c._count?.records || 0} records · {c._count?.trainings || 0} entrenamientos
                        </p>
                      </div>
                    </div>

                    {/* Información */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Fecha de nacimiento:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(c.birthDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Género:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {c.gender === 'MALE' ? 'Masculino' : 'Femenino'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Categoría:</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {category.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Club:</span>
                        <span className="text-sm font-medium text-gray-900">{c.club?.name || '—'}</span>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => openEdit(c)}
                        className="flex-1"
                      >
                        <Pencil className="h-4 w-4 mr-1" /> Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => removeChild(c.id)} 
                        disabled={busyId === c.id}
                        className="flex-1"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> {busyId === c.id ? 'Eliminando…' : 'Eliminar'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </>
        )}
      </div>

      {/* Modal Crear/Editar */}
      <SwimmerForm
        isOpen={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditing(null);
        }}
        onSuccess={() => {
          setOpenForm(false);
          setEditing(null);
          loadChildren();
        }}
        swimmer={editing ? {
          id: editing.id,
          name: editing.name,
          birthDate: editing.birthDate,
          gender: editing.gender,
          club: editing.club ? { id: editing.club.id, name: editing.club.name } : undefined,
          coach: editing.coach || undefined,
          photo: editing.photo || undefined,
        } : null}
      />
    </div>
  );
}
