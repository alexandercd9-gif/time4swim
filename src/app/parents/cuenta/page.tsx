"use client";

import { useState, useEffect, useRef } from "react";
import { CreditCard, Calendar, Users, Download, AlertCircle, Check, X, Crown, FileText, Settings, Camera, User as UserIcon, Trash2 } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { toast } from "react-hot-toast";

// Función para mostrar el mensaje del add-on de galería de medios
const showMediaGalleryMessage = () => {
  toast(
    (t) => (
      <div className="flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">📸</span>
              Galería de Medios
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Guarda fotos y videos de las competencias por solo <span className="font-semibold text-purple-600">+S/15/mes</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              <span className="font-semibold text-amber-600">⚠️ Límite: Max 30MB por archivo</span>
            </p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        <button
          onClick={() => {
            toast.dismiss(t.id);
          }}
          className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Entendido
        </button>
      </div>
    ),
    {
      duration: 8000,
      position: "top-center",
      style: {
        maxWidth: "400px",
        padding: "20px",
      },
    }
  );
};

// Componente para la foto de perfil
function ProfilePhotoSection() {
  const { user, setUser } = useUser();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.profilePhoto) {
      setProfilePhoto(user.profilePhoto);
      setPreviewUrl(user.profilePhoto);
    }
  }, [user]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 2MB');
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!previewUrl) return;

    setUploading(true);
    try {
      const response = await fetch('/api/user/update-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo: previewUrl }),
      });

      if (!response.ok) throw new Error('Error al subir la foto');

      const data = await response.json();
      setProfilePhoto(previewUrl);
      
      // Actualizar el contexto del usuario
      if (user) {
        setUser({ ...user, profilePhoto: previewUrl });
      }

      toast.success('Foto de perfil actualizada correctamente');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Error al subir la foto. Intenta nuevamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar tu foto de perfil?')) return;

    setUploading(true);
    try {
      const response = await fetch('/api/user/update-photo', {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar la foto');

      setProfilePhoto(null);
      setPreviewUrl(null);
      
      // Actualizar el contexto del usuario
      if (user) {
        setUser({ ...user, profilePhoto: null });
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast.success('Foto de perfil eliminada correctamente');
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Error al eliminar la foto. Intenta nuevamente.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Configuración de Cuenta</h2>
      
      <div className="space-y-6">
        {/* Foto de Perfil */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-600" />
            Foto de Perfil
          </h3>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Preview */}
            <div className="relative">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Foto de perfil"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-white shadow-lg">
                  <UserIcon className="h-16 w-16 text-white" />
                </div>
              )}
            </div>

            {/* Controles */}
            <div className="flex-1 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="photo-upload"
              />
              
              <div className="flex flex-wrap gap-3">
                <label
                  htmlFor="photo-upload"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Seleccionar Foto
                </label>
                
                {previewUrl && previewUrl !== profilePhoto && (
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Guardar Foto
                      </>
                    )}
                  </button>
                )}
                
                {profilePhoto && (
                  <button
                    onClick={handleDelete}
                    disabled={uploading}
                    className="px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                )}
              </div>
              
              <p className="text-xs text-gray-600">
                Formatos aceptados: JPG, PNG, GIF. Tamaño máximo: 2MB
              </p>
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Notificaciones por Email</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
              <span className="text-sm text-gray-700">Notificar vencimiento de suscripción</span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
              <span className="text-sm text-gray-700">Enviar resumen mensual de pagos</span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm text-gray-700">Novedades y actualizaciones</span>
            </label>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">
                Configuración en desarrollo
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Las notificaciones por email estarán disponibles próximamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CuentaPage() {
  const [accountData, setAccountData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [activeTab, setActiveTab] = useState("plan");
  const [showAddonModal, setShowAddonModal] = useState(false);
  const [addonAction, setAddonAction] = useState<'activate' | 'deactivate'>('activate');
  const [addonLoading, setAddonLoading] = useState(false);
  const [showMediaGalleryModal, setShowMediaGalleryModal] = useState(false);
  const [activatingAddon, setActivatingAddon] = useState(false);
  
  // Variable para saber si tiene el add-on activado
  const hasMediaGalleryAddon = accountData?.subscription?.mediaGalleryAddon || false;

  const fetchAccountData = async () => {
    try {
      const response = await fetch('/api/parents/account');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        console.error('Error en API:', response.status, errorData);
        throw new Error(errorData.error || 'Error al cargar datos');
      }
      const data = await response.json();
      setAccountData(data);
    } catch (error) {
      console.error('Error fetching account data:', error);
      toast.error(`No se pudieron cargar los datos de tu cuenta. ${error instanceof Error ? error.message : ''}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountData();
  }, []);

  const handleActivateMediaGallery = async () => {
    setActivatingAddon(true);
    try {
      const response = await fetch('/api/parents/subscription/activate-media-gallery', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Error al activar el add-on');

      const data = await response.json();
      
      toast.success('¡Add-on activado! Ya puedes subir fotos y videos en tus competencias');
      setShowMediaGalleryModal(false);
      
      // Recargar datos de la cuenta
      await fetchAccountData();
    } catch (error) {
      console.error('Error activating add-on:', error);
      toast.error('Error al activar el add-on. Intenta nuevamente.');
    } finally {
      setActivatingAddon(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const response = await fetch('/api/parents/cancel-subscription', { method: 'POST' });
      if (!response.ok) throw new Error('Error al cancelar');
      toast.success('Suscripción cancelada exitosamente');
      setShowCancelModal(false);
      window.location.reload();
    } catch (error) {
      toast.error('Error al cancelar suscripción');
    }
  };

  const handleAddonToggle = async () => {
    setAddonLoading(true);
    try {
      const enable = addonAction === 'activate';
      const response = await fetch('/api/parents/subscription/toggle-addon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar');
      }
      
      const data = await response.json();
      toast.success(data.message);
      setShowAddonModal(false);
      fetchAccountData();
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar el add-on');
    } finally {
      setAddonLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!accountData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar datos</h2>
        <p className="text-gray-600">Por favor, intenta recargar la página</p>
      </div>
    );
  }

  const { subscription, payments } = accountData;
  const daysUntilRenewal = subscription?.currentPeriodEnd 
    ? Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  const planColors = {
    PARENT_BASIC: "bg-gray-100 text-gray-800",
    PARENT_FAMILY: "bg-purple-100 text-purple-800",
    PARENT_PREMIUM: "bg-blue-100 text-blue-800",
    TRIAL: "bg-green-100 text-green-800"
  };

  const planBadgeColor = planColors[subscription?.plan as keyof typeof planColors] || "bg-gray-100 text-gray-800";

  const tabs = [
    { id: "plan", label: "Mi Plan", icon: Crown },
    { id: "pagos", label: "Historial", icon: CreditCard },
    { id: "facturacion", label: "Facturación", icon: FileText },
    { id: "media", label: "Fotos y Videos", icon: Camera },
    { id: "configuracion", label: "Configuración", icon: Settings }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="h-6 w-6 text-blue-600" /> Mi Cuenta
        </h1>
        <p className="text-gray-600">Gestiona tu suscripción y facturación</p>
      </div>

        {/* Tabs Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Tab: Mi Plan */}
            {activeTab === "plan" && (
              <div className="space-y-6">
                {/* Plan Badge */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Plan Actual</h2>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${planBadgeColor}`}>
                    {subscription?.planName || "Trial"}
                  </span>
                </div>

                {/* Plan Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Precio */}
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="p-3 bg-blue-600 rounded-lg">
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Precio Mensual</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {subscription?.price ? `S/. ${subscription.price}` : 'S/. 0'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {subscription?.price ? 'Renovación automática' : 'Periodo de prueba'}
                      </p>
                    </div>
                  </div>

                  {/* Próximo Cobro */}
                  <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="p-3 bg-green-600 rounded-lg">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        {subscription?.currentPeriodEnd ? 'Próximo Cobro' : 'Fin de Trial'}
                      </p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {subscription?.currentPeriodEnd 
                          ? new Date(subscription.currentPeriodEnd).toLocaleDateString('es-PE', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })
                          : 'No disponible'
                        }
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {daysUntilRenewal > 0 ? `En ${daysUntilRenewal} días` : 'Selecciona un plan'}
                      </p>
                    </div>
                  </div>

                  {/* Método de Pago */}
                  <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="p-3 bg-purple-600 rounded-lg">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Método de Pago</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {subscription?.cardLastFour 
                          ? `${subscription.cardBrand || 'Tarjeta'} •••• ${subscription.cardLastFour}`
                          : 'Sin método de pago'
                        }
                      </p>
                      {subscription?.cardLastFour ? (
                        <button className="text-xs text-purple-600 hover:text-purple-700 mt-1 font-medium">
                          Actualizar tarjeta
                        </button>
                      ) : (
                        <Link href="/subscription" className="text-xs text-purple-600 hover:text-purple-700 mt-1 block font-medium">
                          Agregar método de pago
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Nadadores */}
                  <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg border border-orange-100">
                    <div className="p-3 bg-orange-600 rounded-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 font-medium">Nadadores Registrados</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {subscription?.childrenCount || 0} de {subscription?.maxChildren || 3}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-orange-600 h-2 rounded-full transition-all"
                          style={{ width: `${((subscription?.childrenCount || 0) / (subscription?.maxChildren || 3)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Límite Alert */}
                {(subscription?.childrenCount || 0) >= (subscription?.maxChildren || 3) && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-orange-900 mb-1">
                          Límite alcanzado
                        </p>
                        <p className="text-xs text-orange-700 mb-2">
                          Has usado todos los espacios disponibles en tu plan.
                        </p>
                        <Link
                          href="/subscription"
                          className="text-xs text-orange-600 hover:text-orange-700 font-medium underline"
                        >
                          Mejorar a plan superior
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
                  <Link
                    href="/subscription"
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    {subscription?.price ? 'Cambiar Plan' : 'Seleccionar Plan'}
                  </Link>
                  <Link
                    href="/parents/children"
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Gestionar Nadadores
                  </Link>
                </div>

                {/* Zona de Peligro - Solo si tiene suscripción activa */}
                {subscription?.price > 0 && subscription?.status === 'ACTIVE' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-6">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Cancelar Suscripción</h3>
                    <p className="text-sm text-red-700 mb-4">
                      Al cancelar perderás acceso a todas las funcionalidades premium.
                    </p>
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-600 hover:text-white transition-colors"
                    >
                      Cancelar Suscripción
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Historial de Pagos */}
            {activeTab === "pagos" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Historial de Pagos</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Plan
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monto
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Factura
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments && payments.length > 0 ? (
                        payments.map((payment: any) => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(payment.date).toLocaleDateString('es-PE', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                              {payment.plan}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                              S/. {payment.amount.toFixed(2)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Check className="h-3 w-3" />
                                Pagado
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                <Download className="h-4 w-4" />
                                Descargar
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-12 text-center">
                            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">No hay pagos registrados</p>
                            <p className="text-sm text-gray-400 mt-1">Estás en periodo de prueba gratuito</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab: Facturación */}
            {activeTab === "facturacion" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Datos de Facturación</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        RUC/DNI
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="12345678"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Razón Social / Nombre
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nombre completo"
                        disabled
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Av. Principal 123, Lima"
                      disabled
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          Funcionalidad próximamente
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          Pronto podrás editar tus datos de facturación desde aquí.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Fotos y Videos (Galería de Medios) */}
            {activeTab === "media" && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Camera className="h-6 w-6 text-purple-600" />
                      Galería de Medios
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Guarda fotos y videos de las competencias de tus nadadores
                    </p>
                  </div>
                  {!hasMediaGalleryAddon && (
                    <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                      Add-on Opcional
                    </span>
                  )}
                </div>

                {/* Estado del Add-on */}
                <div className={`rounded-xl p-6 ${hasMediaGalleryAddon ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200' : 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${hasMediaGalleryAddon ? 'bg-green-100' : 'bg-purple-100'}`}>
                      <Camera className={`h-6 w-6 ${hasMediaGalleryAddon ? 'text-green-600' : 'text-purple-600'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-2 ${hasMediaGalleryAddon ? 'text-green-900' : 'text-purple-900'}`}>
                        {hasMediaGalleryAddon ? '✅ Add-on Activado' : '🔒 Add-on No Activado'}
                      </h3>
                      <p className={`text-sm mb-4 ${hasMediaGalleryAddon ? 'text-green-700' : 'text-purple-700'}`}>
                        {hasMediaGalleryAddon 
                          ? 'Puedes subir fotos y videos en cada competencia que registres. Revive los mejores momentos de tus nadadores.'
                          : 'Agrega este add-on para guardar fotos y videos de las competencias de tus nadadores.'
                        }
                      </p>
                      
                      {hasMediaGalleryAddon ? (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-300 rounded-lg">
                          <span className="text-2xl">🎁</span>
                          <span className="text-sm font-semibold text-green-800">Activado GRATIS por el administrador</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowMediaGalleryModal(true)}
                          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
                        >
                          💳 Agregar por +S/15/mes
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Información sobre límites y uso */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card: Límites */}
                  <div className="bg-white border-2 border-blue-200 rounded-xl p-5">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      📊 Límites de Archivos
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                        <span className="text-sm text-gray-700">📷 Fotos</span>
                        <span className="text-sm font-bold text-blue-700">Máx. 2MB</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                        <span className="text-sm text-gray-700">🎥 Videos</span>
                        <span className="text-sm font-bold text-purple-700">Máx. 30MB</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">📁 Por competencia</span>
                        <span className="text-sm font-bold text-gray-700">Máx. 2 archivos</span>
                      </div>
                    </div>
                  </div>

                  {/* Card: Consejos */}
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-5">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      💡 Consejos Útiles
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-0.5">•</span>
                        <span>Comprime videos grandes antes de subir</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-0.5">•</span>
                        <span>Usa formato horizontal para videos</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-0.5">•</span>
                        <span>Fotos claras y bien iluminadas</span>
                      </li>
                    </ul>
                    <div className="mt-4 pt-3 border-t border-yellow-300">
                      <a 
                        href="https://www.freeconvert.com/video-compressor" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium underline flex items-center gap-1"
                      >
                        🔗 Herramienta de compresión gratuita
                        <span className="text-xs">↗</span>
                      </a>
                      <p className="text-xs text-gray-600 mt-1">
                        Recomendado: Reduce al 35% del tamaño original
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cómo usar */}
                {hasMediaGalleryAddon && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      📝 ¿Cómo subir fotos y videos?
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          1
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Crea o edita una competencia</p>
                          <p className="text-xs text-gray-600 mt-1">Ve a la sección de competencias</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          2
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Busca la sección "Fotos y Videos"</p>
                          <p className="text-xs text-gray-600 mt-1">Aparece después de "Información Adicional"</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          3
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Activa el checkbox y sube</p>
                          <p className="text-xs text-gray-600 mt-1">Máximo 2 archivos por competencia</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Configuración */}
            {activeTab === "configuracion" && (
              <ProfilePhotoSection />
            )}
          </div>
        </div>

      {/* Modal de Cancelación */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">¿Cancelar Suscripción?</h3>
            </div>

            <p className="text-gray-600 mb-6">
              {subscription?.currentPeriodEnd 
                ? `Tu suscripción se cancelará al final del periodo actual (${new Date(subscription.currentPeriodEnd).toLocaleDateString('es-PE')}). Después de esa fecha perderás acceso a:`
                : 'Perderás acceso a:'
              }
            </p>

            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <X className="h-4 w-4 text-red-500" />
                Registro de tiempos
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <X className="h-4 w-4 text-red-500" />
                Historial completo
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <X className="h-4 w-4 text-red-500" />
                Análisis de progreso
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <X className="h-4 w-4 text-red-500" />
                Gestión de múltiples nadadores
              </li>
            </ul>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Mantener Plan
              </button>
              <button
                onClick={handleCancelSubscription}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Sí, Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Add-ons */}
      {showAddonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                  <Camera className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Galería de Medios</h3>
                  <p className="text-purple-100 text-sm">Fotos y videos de competencia</p>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6">
              {addonAction === 'activate' ? (
                <>
                  <p className="text-gray-700 mb-6">
                    ¿Deseas activar la <strong>Galería de Medios</strong>?
                  </p>

                  <div className="bg-white rounded-xl p-4 border-2 border-purple-200 mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-700 font-medium">Costo mensual adicional:</span>
                      <span className="text-2xl font-bold text-purple-600">S/15</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-2">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Sube fotos y videos de competencias</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Galería ilimitada por nadador</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Archivos hasta 50MB</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-gray-700 mb-6">
                    ¿Deseas desactivar la <strong>Galería de Medios</strong>?
                  </p>

                  <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-900 mb-2">
                          Perderás acceso a:
                        </p>
                        <ul className="space-y-1 text-sm text-amber-800">
                          <li className="flex items-center gap-2">
                            <X className="h-3 w-3" />
                            Subir nuevas fotos y videos
                          </li>
                          <li className="flex items-center gap-2">
                            <X className="h-3 w-3" />
                            Galería de competencias
                          </li>
                        </ul>
                        <p className="text-xs text-amber-700 mt-3">
                          Se descontarán <strong>S/15/mes</strong> de tu próxima factura
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddonModal(false)}
                  disabled={addonLoading}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-white transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddonToggle}
                  disabled={addonLoading}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all disabled:opacity-50 ${
                    addonAction === 'activate'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                      : 'bg-amber-600 text-white hover:bg-amber-700'
                  }`}
                >
                  {addonLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Procesando...
                    </span>
                  ) : (
                    addonAction === 'activate' ? 'Activar' : 'Desactivar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Activación de Galería de Medios */}
      {showMediaGalleryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <Camera className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Activar Galería de Medios
                </h3>
                <p className="text-sm text-gray-600">
                  Add-on para guardar fotos y videos de competencias
                </p>
              </div>
            </div>

            {/* Contenido */}
            <div className="space-y-4 mb-6">
              {/* Precio actual */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Tu plan actual:</span>
                  <span className="text-lg font-bold text-gray-900">
                    S/{Number(accountData?.subscription?.currentPrice || 0)}/mes
                  </span>
                </div>
                <div className="flex items-center justify-between text-purple-700">
                  <span className="text-sm font-medium">+ Galería de Medios:</span>
                  <span className="text-lg font-bold">+S/15/mes</span>
                </div>
              </div>

              {/* Nuevo precio */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Nuevo total mensual:</span>
                  <span className="text-2xl font-bold text-purple-600">
                    S/{Number(accountData?.subscription?.currentPrice || 0) + 15}/mes
                  </span>
                </div>
              </div>

              {/* Información importante */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-900 mb-1">
                      ¡Disponible de inmediato!
                    </p>
                    <p className="text-xs text-green-700">
                      El add-on se activa ahora y podrás usarlo de inmediato. El cargo de <strong>+S/15</strong> se aplicará en tu próxima fecha de renovación ({accountData?.subscription?.nextBillingDate ? new Date(accountData.subscription.nextBillingDate).toLocaleDateString('es-PE', { day: 'numeric', month: 'long' }) : 'próxima factura'}).
                    </p>
                  </div>
                </div>
              </div>

              {/* Características */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700">Incluye:</p>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-purple-600" />
                    Subir fotos y videos en competencias
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-purple-600" />
                    Hasta 2 archivos por competencia
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-purple-600" />
                    Máx. 30MB por archivo
                  </li>
                </ul>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowMediaGalleryModal(false)}
                disabled={activatingAddon}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleActivateMediaGallery}
                disabled={activatingAddon}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 shadow-lg"
              >
                {activatingAddon ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Activando...
                  </span>
                ) : (
                  'Confirmar y Activar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
