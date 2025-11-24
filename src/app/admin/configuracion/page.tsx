"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, Key, Save, Eye, EyeOff, CheckCircle2, AlertCircle, DollarSign, Tag, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ConfiguracionPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
          <Settings className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>
          <p className="text-sm text-gray-600">Configura pagos y promociones</p>
        </div>
      </div>
      
      <Tabs defaultValue="procesador" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="procesador" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Procesador de Pago
          </TabsTrigger>
          <TabsTrigger value="culqi" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Culqi
          </TabsTrigger>
          <TabsTrigger value="mercadopago" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            MercadoPago
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="procesador" className="mt-6">
          <ProcessorSelection />
        </TabsContent>
        
        <TabsContent value="culqi" className="mt-6">
          <CulqiConfiguration />
        </TabsContent>
        
        <TabsContent value="mercadopago" className="mt-6">
          <MercadoPagoConfiguration />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProcessorSelection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeProcessor, setActiveProcessor] = useState<string>('culqi');

  useEffect(() => {
    fetchActiveProcessor();
  }, []);

  const fetchActiveProcessor = async () => {
    try {
      // El endpoint retorna todos los procesadores disponibles
      // El primero en la lista es el activo
      const res = await fetch('/api/config/payment-processor');
      if (res.ok) {
        const data = await res.json();
        // Si hay procesadores, usar el primero como activo
        if (data.processors && data.processors.length > 0) {
          setActiveProcessor(data.processors[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching processor:', error);
      setActiveProcessor('culqi');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessorChange = (processorId: string) => {
    setActiveProcessor(processorId);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/config/processor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          enabledProcessors: [activeProcessor] 
        })
      });

      if (res.ok) {
        toast.success('✅ Procesador de pago actualizado');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Error al actualizar');
      }
    } catch (error) {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Seleccionar Procesador de Pagos Activo
          </CardTitle>
          <CardDescription>
            Elige qué sistema de pagos usarán tus usuarios al suscribirse
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Opciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Culqi */}
            <div 
              onClick={() => handleProcessorChange('culqi')}
              className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                activeProcessor === 'culqi'
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="processor"
                  checked={activeProcessor === 'culqi'}
                  onChange={() => handleProcessorChange('culqi')}
                  className="mt-1 w-4 h-4"
                />
                <div>
                  <h3 className="font-semibold text-lg mb-1">🇵🇪 Culqi</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Procesador de pagos peruano. Ideal para e-commerce.
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>✅ Tarjetas locales</div>
                    <div>✅ Comisión: ~3.5% + IGV</div>
                    <div>⚠️ Orientado a e-commerce</div>
                  </div>
                </div>
              </div>
            </div>

            {/* MercadoPago */}
            <div 
              onClick={() => handleProcessorChange('mercadopago')}
              className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                activeProcessor === 'mercadopago'
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="processor"
                  checked={activeProcessor === 'mercadopago'}
                  onChange={() => handleProcessorChange('mercadopago')}
                  className="mt-1 w-4 h-4"
                />
                <div>
                  <h3 className="font-semibold text-lg mb-1">💙 MercadoPago</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Líder en Latinoamérica. Soporta suscripciones recurrentes.
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>✅ Suscripciones nativas</div>
                    <div>✅ Comisión: ~4% + IGV</div>
                    <div>✅ Excelente para SaaS</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botón guardar */}
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar Selección'}
          </Button>

          {/* Info */}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">💡 Recomendación</p>
                  <p>
                    Configura <strong>ambos procesadores</strong> en sus respectivas pestañas y luego
                    selecciona cuál estará activo. Podrás cambiar entre ellos en cualquier momento.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

function MercadoPagoConfiguration() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [config, setConfig] = useState({
    mercadopagoPublicKey: "",
    mercadopagoAccessToken: "",
    mercadopagoMode: "test" // test | live
  });
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/config/mercadopago', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setConfig({
          mercadopagoPublicKey: data.mercadopagoPublicKey || "",
          mercadopagoAccessToken: data.mercadopagoAccessToken || "",
          mercadopagoMode: data.mercadopagoMode || "test"
        });
        setIsConfigured(!!data.mercadopagoPublicKey && !!data.mercadopagoAccessToken);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!config.mercadopagoPublicKey.trim() || !config.mercadopagoAccessToken.trim()) {
      toast.error('Ambas credenciales son requeridas');
      return;
    }

    // Validar formatos básicos
    const keyPrefix = config.mercadopagoMode === 'test' ? 'TEST-' : 'APP_USR-';
    if (!config.mercadopagoPublicKey.startsWith(keyPrefix)) {
      toast.error(`La Public Key debe comenzar con ${keyPrefix}`);
      return;
    }
    if (!config.mercadopagoAccessToken.startsWith(keyPrefix)) {
      toast.error(`El Access Token debe comenzar con ${keyPrefix}`);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/config/mercadopago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(config)
      });

      if (res.ok) {
        toast.success('✅ Configuración de MercadoPago guardada');
        setIsConfigured(true);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Error al guardar configuración');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Error al conectar con el servidor');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estado de Configuración */}
      <Card className={isConfigured ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            {isConfigured ? (
              <>
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">✅ MercadoPago configurado</p>
                  <p className="text-sm text-green-700">Las credenciales de MercadoPago están listas</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-6 w-6 text-orange-600" />
                <div>
                  <p className="font-semibold text-orange-900">⚠️ MercadoPago no configurado</p>
                  <p className="text-sm text-orange-700">Agrega tus credenciales para habilitar MercadoPago</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Formulario de Configuración */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            Credenciales de MercadoPago
          </CardTitle>
          <CardDescription>
            Obtén tus credenciales desde: <a href="https://www.mercadopago.com.pe/developers/panel/app" target="_blank" className="text-blue-600 hover:underline">Developers Panel</a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            {/* Modo */}
            <div className="space-y-2">
              <Label>Modo de Operación</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="test"
                    checked={config.mercadopagoMode === "test"}
                    onChange={(e) => setConfig({ ...config, mercadopagoMode: e.target.value })}
                    className="w-4 h-4"
                  />
                  <span>Test (Pruebas)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="live"
                    checked={config.mercadopagoMode === "live"}
                    onChange={(e) => setConfig({ ...config, mercadopagoMode: e.target.value })}
                    className="w-4 h-4"
                  />
                  <span>Live (Producción)</span>
                </label>
              </div>
              <p className="text-xs text-gray-500">
                {config.mercadopagoMode === 'test' 
                  ? '🔧 Modo prueba: Usa credenciales TEST-xxxxx' 
                  : '🚀 Modo producción: Usa credenciales APP_USR-xxxxx'}
              </p>
            </div>

            {/* Public Key */}
            <div className="space-y-2">
              <Label htmlFor="publicKey">Public Key</Label>
              <Input
                id="publicKey"
                type="text"
                placeholder={config.mercadopagoMode === 'test' ? 'TEST-xxxxx-xxxxx-xxxxx' : 'APP_USR-xxxxx-xxxxx-xxxxx'}
                value={config.mercadopagoPublicKey}
                onChange={(e) => setConfig({ ...config, mercadopagoPublicKey: e.target.value })}
              />
            </div>

            {/* Access Token */}
            <div className="space-y-2">
              <Label htmlFor="accessToken">Access Token</Label>
              <div className="relative">
                <Input
                  id="accessToken"
                  type={showAccessToken ? "text" : "password"}
                  placeholder={config.mercadopagoMode === 'test' ? 'TEST-xxxxx-xxxxx-xxxxx' : 'APP_USR-xxxxx-xxxxx-xxxxx'}
                  value={config.mercadopagoAccessToken}
                  onChange={(e) => setConfig({ ...config, mercadopagoAccessToken: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowAccessToken(!showAccessToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showAccessToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Guía de prueba */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-2">💳 Tarjetas de prueba de MercadoPago</p>
              <div className="space-y-1 font-mono text-xs">
                <div><strong>Visa aprobada:</strong> 4509 9535 6623 3704</div>
                <div><strong>Mastercard aprobada:</strong> 5031 7557 3453 0604</div>
                <div><strong>CVV:</strong> Cualquier 3 dígitos (ej: 123)</div>
                <div><strong>Fecha:</strong> Cualquier fecha futura</div>
                <div><strong>Nombre:</strong> APRO (para aprobar) / OTHE (para rechazar)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info de Seguridad */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">🔒 Seguridad</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Las credenciales se guardan cifradas en la base de datos</li>
                <li>El Access Token nunca se envía al navegador</li>
                <li>Usa modo <strong>Test</strong> hasta estar listo para producción</li>
                <li>Las credenciales de TEST no funcionan en producción y viceversa</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CulqiConfiguration() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [config, setConfig] = useState({
    culqiPublicKey: "",
    culqiSecretKey: "",
    culqiMode: "test" // test | live
  });
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/config/culqi', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setConfig({
          culqiPublicKey: data.culqiPublicKey || "",
          culqiSecretKey: data.culqiSecretKey || "",
          culqiMode: data.culqiMode || "test"
        });
        setIsConfigured(!!data.culqiPublicKey && !!data.culqiSecretKey);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!config.culqiPublicKey.trim() || !config.culqiSecretKey.trim()) {
      toast.error('Ambas API Keys son requeridas');
      return;
    }

    // Validar formatos básicos
    if (!config.culqiPublicKey.startsWith('pk_')) {
      toast.error('La Public Key debe comenzar con pk_');
      return;
    }
    if (!config.culqiSecretKey.startsWith('sk_')) {
      toast.error('La Secret Key debe comenzar con sk_');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/config/culqi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(config)
      });

      if (res.ok) {
        toast.success('✅ Configuración guardada exitosamente');
        setIsConfigured(true);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Error al guardar configuración');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Error al conectar con el servidor');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      toast.loading('Probando conexión con Culqi...');
      
      const res = await fetch('/api/admin/config/culqi/test', {
        method: 'POST',
        credentials: 'include'
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        toast.success('✅ Conexión exitosa con Culqi');
      } else {
        toast.error('❌ Error de conexión: ' + (data.error || 'Verifica tus credenciales'));
      }
    } catch (error) {
      toast.error('❌ Error al probar conexión');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estado de Configuración */}
      <Card className={isConfigured ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            {isConfigured ? (
              <>
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">✅ Sistema de pagos configurado</p>
                  <p className="text-sm text-green-700">Los usuarios pueden realizar pagos automáticos</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-6 w-6 text-orange-600" />
                <div>
                  <p className="font-semibold text-orange-900">⚠️ Sistema de pagos no configurado</p>
                  <p className="text-sm text-orange-700">Configura las credenciales de Culqi para habilitar pagos</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Formulario de Configuración */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            Credenciales de Culqi
          </CardTitle>
          <CardDescription>
            Obtén tus credenciales desde: <a href="https://panel.culqi.com/" target="_blank" className="text-blue-600 hover:underline">panel.culqi.com</a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            {/* Modo */}
            <div className="space-y-2">
              <Label>Modo de Operación</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="test"
                    checked={config.culqiMode === "test"}
                    onChange={(e) => setConfig({ ...config, culqiMode: e.target.value })}
                    className="w-4 h-4"
                  />
                  <span>Test (Pruebas)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="live"
                    checked={config.culqiMode === "live"}
                    onChange={(e) => setConfig({ ...config, culqiMode: e.target.value })}
                    className="w-4 h-4"
                  />
                  <span>Live (Producción)</span>
                </label>
              </div>
            </div>

            {/* Public Key */}
            <div className="space-y-2">
              <Label htmlFor="publicKey">Public Key</Label>
              <Input
                id="publicKey"
                type="text"
                placeholder="pk_test_..."
                value={config.culqiPublicKey}
                onChange={(e) => setConfig({ ...config, culqiPublicKey: e.target.value })}
              />
            </div>

            {/* Secret Key */}
            <div className="space-y-2">
              <Label htmlFor="secretKey">Secret Key</Label>
              <div className="relative">
                <Input
                  id="secretKey"
                  type={showSecretKey ? "text" : "password"}
                  placeholder="sk_test_..."
                  value={config.culqiSecretKey}
                  onChange={(e) => setConfig({ ...config, culqiSecretKey: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
              
              {isConfigured && (
                <Button type="button" variant="outline" onClick={handleTestConnection}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Probar Conexión
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info de Seguridad */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">🔒 Seguridad</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Las credenciales se guardan cifradas</li>
                <li>La Secret Key nunca se envía completa al navegador</li>
                <li>Usa modo <strong>Test</strong> hasta estar listo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PromocionesConfiguration() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<any>(null);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await fetch('/api/admin/promotions', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPromotions(data);
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta promoción?')) return;

    try {
      const res = await fetch(`/api/admin/promotions?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        toast.success('Promoción eliminada');
        fetchPromotions();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Error al eliminar');
      }
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const handleEdit = (promotion: any) => {
    setEditingPromotion(promotion);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPromotion(null);
    fetchPromotions();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showForm) {
    return <PromotionForm promotion={editingPromotion} onClose={handleFormClose} />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-blue-600" />
                Códigos Promocionales
              </CardTitle>
              <CardDescription>
                Códigos de descuento para planes de 3 meses prepago
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva Promoción
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {promotions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Tag className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No hay promociones creadas</p>
              <p className="text-sm mb-4">Crea códigos como "DEPORCLUB" con descuentos especiales</p>
              <Button onClick={() => setShowForm(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Promoción
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descuento</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duración</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vigencia</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usos</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {promotions.map((promo) => (
                    <tr key={promo.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono font-bold">{promo.code}</td>
                      <td className="px-4 py-3 text-sm">{promo.name}</td>
                      <td className="px-4 py-3 text-sm">
                        {promo.discountType === 'PERCENTAGE' 
                          ? `${promo.discountValue}%` 
                          : `S/${promo.discountValue}`}
                      </td>
                      <td className="px-4 py-3 text-sm">{promo.durationMonths} meses</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="text-xs">
                          <div>{new Date(promo.startDate).toLocaleDateString()}</div>
                          <div className="text-gray-500">→ {new Date(promo.endDate).toLocaleDateString()}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {promo.currentUses}/{promo.maxUses || '∞'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          promo.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {promo.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(promo)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(promo.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Tag className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">💡 Cómo funcionan las promociones</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Se aplican solo a planes de <strong>3 meses prepago</strong></li>
                <li>Los padres ingresan el código al elegir su plan</li>
                <li>Si usan código promocional, NO tienen período de prueba (pagan inmediatamente)</li>
                <li>Después del período promocional, vuelven a tarifa mensual normal</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PromotionForm({ promotion, onClose }: { promotion?: any, onClose: () => void }) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: promotion?.code || '',
    name: promotion?.name || '',
    description: promotion?.description || '',
    discountType: promotion?.discountType || 'PERCENTAGE',
    discountValue: promotion?.discountValue || '',
    durationMonths: promotion?.durationMonths || 3,
    startDate: promotion?.startDate ? new Date(promotion.startDate).toISOString().split('T')[0] : '',
    endDate: promotion?.endDate ? new Date(promotion.endDate).toISOString().split('T')[0] : '',
    maxUses: promotion?.maxUses || '',
    isActive: promotion?.isActive !== undefined ? promotion.isActive : true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = '/api/admin/promotions';
      const method = promotion ? 'PUT' : 'POST';
      const body = promotion ? { ...formData, id: promotion.id } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      if (res.ok) {
        toast.success(promotion ? 'Promoción actualizada' : 'Promoción creada');
        onClose();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Error al guardar');
      }
    } catch (error) {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{promotion ? 'Editar' : 'Nueva'} Promoción</CardTitle>
        <CardDescription>Configura los detalles del código promocional</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="DEPORCLUB"
                maxLength={20}
                required
                disabled={!!promotion}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Promoción de lanzamiento"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="30% de descuento en plan de 3 meses"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de descuento *</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="discountType"
                    value="PERCENTAGE"
                    checked={formData.discountType === 'PERCENTAGE'}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  />
                  <span>Porcentaje (%)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="discountType"
                    value="FIXED"
                    checked={formData.discountType === 'FIXED'}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  />
                  <span>Monto fijo (S/)</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountValue">
                {formData.discountType === 'PERCENTAGE' ? 'Porcentaje (%)' : 'Monto (S/)'}  *
              </Label>
              <Input
                id="discountValue"
                type="number"
                step={formData.discountType === 'FIXED' ? '0.01' : '1'}
                min="0"
                max={formData.discountType === 'PERCENTAGE' ? '100' : undefined}
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="durationMonths">Duración (meses) *</Label>
              <Input
                id="durationMonths"
                type="number"
                min="1"
                max="12"
                value={formData.durationMonths}
                onChange={(e) => setFormData({ ...formData, durationMonths: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha inicio *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha fin *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxUses">Usos máximos (opcional)</Label>
              <Input
                id="maxUses"
                type="number"
                min="1"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                placeholder="Ilimitado"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                Activa
              </Label>
              <p className="text-xs text-gray-500">Los códigos inactivos no se pueden usar</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Guardando...' : (promotion ? 'Actualizar' : 'Crear')}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
