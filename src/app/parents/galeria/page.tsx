"use client";

import { useEffect, useState } from "react";
import { Camera, Video, Lock, Image as ImageIcon, Calendar, MapPin, Users, X, Play, Medal, Trophy, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Child {
  id: string;
  name: string;
}

interface MediaItem {
  id: string;
  type: 'PHOTO' | 'VIDEO';
  cloudinaryUrl: string;
  thumbnailUrl: string | null;
  title: string | null;
  capturedAt: string;
  duration: number | null;
  medal: string | null;
  position: number | null;
  event: {
    title: string;
    location: string | null;
  } | null;
  swimmers: {
    child: {
      name: string;
    };
    lane: number | null;
  }[];
  moments: {
    time: number;
    label: string;
  }[];
}

interface MediaResponse {
  hasAccess: boolean;
  freeMedia: MediaItem[];
  lockedCount: number;
  allMedia?: MediaItem[];
}

export default function GaleriaPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [mediaData, setMediaData] = useState<MediaResponse | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadMedia();
    }
  }, [selectedChild]);

  async function loadChildren() {
    try {
      const res = await fetch("/api/swimmers", { credentials: "include" });
      const data = await res.json();
      setChildren(data || []);
      if (data && data.length > 0) {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('selectedChildId') : null;
        const exists = stored && data.some((c: any) => c.id === stored);
        setSelectedChild(exists ? stored! : "all");
      }
    } catch (error) {
      console.error("Error loading children:", error);
    }
  }

  async function loadMedia() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedChild !== "all") {
        params.set("childId", selectedChild);
      }
      
      const res = await fetch(`/api/parents/media?${params.toString()}`);
      const data = await res.json();
      setMediaData(data);
    } catch (error) {
      console.error("Error loading media:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleMediaClick(item: MediaItem, isLocked: boolean) {
    if (isLocked) {
      setShowUpgradeModal(true);
    } else {
      setSelectedMedia(item);
    }
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function jumpToMoment(time: number) {
    const video = document.querySelector('video');
    if (video) {
      video.currentTime = time;
      setCurrentVideoTime(time);
    }
  }

  async function handleDelete(mediaId: string, e: React.MouseEvent) {
    e.stopPropagation(); // Prevent opening the media viewer
    
    if (!confirm('¿Estás seguro de eliminar este archivo? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeletingId(mediaId);
    
    try {
      const res = await fetch(`/api/parents/media/delete?mediaId=${mediaId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al eliminar');
      }

      toast.success('✅ Archivo eliminado correctamente');
      
      // Reload media to reflect changes
      await loadMedia();
      
      // Close viewer if it's the deleted item
      if (selectedMedia?.id === mediaId) {
        setSelectedMedia(null);
      }
      
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error(error instanceof Error ? error.message : 'Error al eliminar archivo');
    } finally {
      setDeletingId(null);
    }
  }

  const displayMedia = mediaData?.hasAccess 
    ? (mediaData.allMedia || [])
    : (mediaData?.freeMedia || []);

  const filteredMedia = selectedType === "all" 
    ? displayMedia 
    : displayMedia.filter(m => m.type === selectedType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Camera className="h-7 w-7 text-blue-600" />
            Galería de Medios
          </h1>
          <p className="text-gray-600">Fotos y videos de competencias y entrenamientos</p>
        </div>

        {/* Filters */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-blue-600" />
            <label className="text-sm font-semibold text-gray-900">Filtrar por nadador</label>
          </div>
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger className="h-12 text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">👥 Todos mis hijos</SelectItem>
              {children.map(c => (
                <SelectItem key={c.id} value={c.id}>🏊 {c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Access Warning */}
        {!mediaData?.hasAccess && mediaData && mediaData.lockedCount > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-1">
                  Tienes {mediaData.lockedCount} {mediaData.lockedCount === 1 ? 'archivo bloqueado' : 'archivos bloqueados'}
                </h3>
                <p className="text-sm text-amber-700 mb-3">
                  Desbloquea la galería completa para ver todas las fotos y videos de tus hijos
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    💎 Ver Planes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={selectedType} onValueChange={setSelectedType} className="mb-6 sm:mb-8">
          <TabsList className="grid w-full grid-cols-3 h-12 sm:h-14 bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100">
            <TabsTrigger value="all" className="text-sm sm:text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              ✨ Todos
            </TabsTrigger>
            <TabsTrigger value="PHOTO" className="text-sm sm:text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              📷 Fotos
            </TabsTrigger>
            <TabsTrigger value="VIDEO" className="text-sm sm:text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              🎥 Videos
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Stats */}
        {!loading && filteredMedia.length > 0 && (
          <div className="mb-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-600">
              📊 Mostrando <span className="font-semibold text-gray-900">{filteredMedia.length}</span> {filteredMedia.length === 1 ? 'archivo' : 'archivos'}
              {mediaData && !mediaData.hasAccess && mediaData.lockedCount > 0 && (
                <span className="text-amber-600"> • {mediaData.lockedCount} bloqueados</span>
              )}
            </p>
          </div>
        )}

        {/* Media Grid */}
        {loading ? (
          <div className="text-center py-16 sm:py-24">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Cargando galería...</p>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-16 sm:py-24 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay contenido disponible</h3>
            <p className="text-gray-600 text-sm">Sube fotos desde el formulario de competencias</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredMedia.map((item, idx) => {
              const isLocked = !mediaData?.hasAccess && idx >= (mediaData?.freeMedia.length || 0);
              
              return (
                <div
                  key={item.id}
                  onClick={() => handleMediaClick(item, isLocked)}
                  className={`relative group rounded-2xl overflow-hidden cursor-pointer transition-all bg-white shadow-md ${
                    isLocked ? 'opacity-75' : 'hover:shadow-2xl hover:scale-[1.02]'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative">
                    <img
                      src={item.thumbnailUrl || item.cloudinaryUrl}
                      alt={item.title || 'Media'}
                      className={`w-full h-full object-cover transition-transform ${isLocked ? 'blur-md' : 'group-hover:scale-105'}`}
                    />
                    
                    {/* Lock Overlay */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Lock className="h-12 w-12 text-white" />
                      </div>
                    )}
                    
                    {/* Video Badge */}
                    {item.type === 'VIDEO' && !isLocked && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-red-600 to-pink-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                        <Play className="h-3.5 w-3.5 fill-white" />
                        {item.duration && formatDuration(item.duration)}
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    {!isLocked && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <p className="text-white text-sm font-semibold truncate">
                            {item.title || 'Sin título'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Delete Button */}
                  {!isLocked && (
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      disabled={deletingId === item.id}
                      className="absolute top-3 left-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white p-2 rounded-lg shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                      title="Eliminar archivo"
                    >
                      {deletingId === item.id ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  )}

                  {/* Info */}
                  {!isLocked && (
                    <div className="p-3 sm:p-4 bg-white space-y-2">
                      {/* Nombre de Competencia */}
                      {item.title && (
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs sm:text-sm flex-1 min-w-0">
                            <Trophy className="h-3.5 w-3.5 text-yellow-600 flex-shrink-0" />
                            <span className="font-semibold text-gray-900 truncate">
                              {item.title}
                            </span>
                          </div>
                          {/* Badge de Medalla */}
                          {item.medal && item.medal !== 'NONE' && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${
                              item.medal === 'GOLD' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                              item.medal === 'SILVER' ? 'bg-gray-100 text-gray-700 border border-gray-300' :
                              item.medal === 'BRONZE' ? 'bg-orange-100 text-orange-700 border border-orange-300' :
                              'bg-blue-100 text-blue-700 border border-blue-300'
                            }`}>
                              <Medal className="h-3 w-3" />
                              {item.medal === 'GOLD' ? '🥇' : item.medal === 'SILVER' ? '🥈' : item.medal === 'BRONZE' ? '🥉' : '🏅'}
                            </span>
                          )}
                          {/* Badge de Posición */}
                          {item.position && !item.medal && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-300 flex-shrink-0">
                              {item.position}°
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Fecha y Evento */}
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(item.capturedAt).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short'
                            })}
                          </span>
                        </div>
                        {item.event && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{item.event.title}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Nadadores */}
                      {item.swimmers.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Users className="h-3.5 w-3.5 text-pink-600" />
                          <span className="truncate">
                            {item.swimmers.map(s => s.child.name).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Media Viewer Dialog */}
        <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {selectedMedia?.type === 'VIDEO' ? <Video className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
                  {selectedMedia?.title || 'Vista previa'}
                </div>
                {selectedMedia && (
                  <button
                    onClick={(e) => handleDelete(selectedMedia.id, e)}
                    disabled={deletingId === selectedMedia.id}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    {deletingId === selectedMedia.id ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </>
                    )}
                  </button>
                )}
              </DialogTitle>
            </DialogHeader>
            
            {selectedMedia && (
              <div className="space-y-4">
                {/* Media Content */}
                <div className="bg-black rounded-lg overflow-hidden">
                  {selectedMedia.type === 'VIDEO' ? (
                    <video
                      src={selectedMedia.cloudinaryUrl}
                      controls
                      className="w-full"
                      onTimeUpdate={(e) => setCurrentVideoTime(e.currentTarget.currentTime)}
                    />
                  ) : (
                    <img
                      src={selectedMedia.cloudinaryUrl}
                      alt={selectedMedia.title || 'Media'}
                      className="w-full"
                    />
                  )}
                </div>
                
                {/* Moments Navigation (for videos) */}
                {selectedMedia.type === 'VIDEO' && selectedMedia.moments.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      ⏱️ Momentos clave
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {selectedMedia.moments.map((moment, idx) => (
                        <button
                          key={idx}
                          onClick={() => jumpToMoment(moment.time)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            Math.abs(currentVideoTime - moment.time) < 2
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-blue-100'
                          }`}
                        >
                          {formatDuration(moment.time)} - {moment.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Info */}
                <div className="space-y-3">
                  {selectedMedia.event && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Evento</h4>
                      <p className="text-gray-900">{selectedMedia.event.title}</p>
                      {selectedMedia.event.location && (
                        <p className="text-sm text-gray-600">{selectedMedia.event.location}</p>
                      )}
                    </div>
                  )}
                  
                  {selectedMedia.swimmers.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Nadadores</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMedia.swimmers.map((swimmer, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                            {swimmer.child.name}
                            {swimmer.lane && ` - Carril ${swimmer.lane}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Fecha</h4>
                    <p className="text-gray-900">
                      {new Date(selectedMedia.capturedAt).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Upgrade Modal */}
        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                ✨ Contenido Premium
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Desbloquea la galería completa para ver todas las fotos y videos de tus hijos
              </p>
              
              {mediaData && mediaData.lockedCount > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">📊 Tienes disponible:</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• {mediaData.lockedCount} archivos bloqueados</li>
                    <li>• Fotos HD de competencias</li>
                    <li>• Videos con momentos clave</li>
                    <li>• Descarga ilimitada</li>
                  </ul>
                </div>
              )}
              
              <div className="space-y-2">
                <button
                  onClick={() => window.location.href = '/parents/suscripcion'}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  💎 Ver Planes y Precios
                </button>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  Tal vez después
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
