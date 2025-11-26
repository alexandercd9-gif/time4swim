# 🛠️ CÓMO AGREGAR KUSHKI AL ADMIN (Manual)

**CUÁNDO HACER ESTO:** Después de obtener credenciales de Kushki (en ~5 días)

El archivo `/admin/configuracion/page.tsx` es muy grande (1113 líneas) y se corrompe con ediciones automáticas. Por eso debes hacerlo MANUALMENTE.

---

## 📋 Pasos (son solo 2 cambios pequeños)

### **PASO 1: Agregar pestaña de Kushki**

**Archivo:** `src/app/admin/configuracion/page.tsx`

**BUSCA la línea 26:** 
```tsx
<TabsList className="grid w-full grid-cols-3">
```

**CÁMBIALA por:**
```tsx
<TabsList className="grid w-full grid-cols-4">
```

**BUSCA la línea 31-34 (después de la pestaña "Procesador de Pago"):**
```tsx
          </TabsTrigger>
          <TabsTrigger value="culqi" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Culqi
```

**AGREGA ESTAS LÍNEAS JUSTO ANTES del TabsTrigger de Culqi:**
```tsx
          <TabsTrigger value="kushki" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Kushki
          </TabsTrigger>
```

**Debería quedar así:**
```tsx
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="procesador" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Procesador de Pago
          </TabsTrigger>
          <TabsTrigger value="kushki" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Kushki
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
```

---

### **PASO 2: Agregar contenido de la pestaña**

**BUSCA la línea 43-47:**
```tsx
        <TabsContent value="procesador" className="mt-6">
          <ProcessorSelection />
        </TabsContent>
        
        <TabsContent value="culqi" className="mt-6">
```

**AGREGA ESTAS LÍNEAS JUSTO ANTES del TabsContent de Culqi:**
```tsx
        <TabsContent value="kushki" className="mt-6">
          <KushkiConfiguration />
        </TabsContent>
        
```

**Debería quedar así:**
```tsx
        <TabsContent value="procesador" className="mt-6">
          <ProcessorSelection />
        </TabsContent>
        
        <TabsContent value="kushki" className="mt-6">
          <KushkiConfiguration />
        </TabsContent>
        
        <TabsContent value="culqi" className="mt-6">
          <CulqiConfiguration />
        </TabsContent>
```

---

### **PASO 3: Agregar el componente KushkiConfiguration**

**AL FINAL del archivo** (después de `CulqiConfiguration` pero antes del último `}`), **AGREGA:**

```tsx
function KushkiConfiguration() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [config, setConfig] = useState({
    kushkiPublicKey: "",
    kushkiPrivateKey: "",
    kushkiMode: "test" // test | live
  });
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/config/kushki', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setConfig({
          kushkiPublicKey: data.kushkiPublicKey || "",
          kushkiPrivateKey: data.kushkiPrivateKey || "",
          kushkiMode: data.kushkiMode || "test"
        });
        setIsConfigured(!!data.kushkiPublicKey && !!data.kushkiPrivateKey);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!config.kushkiPublicKey.trim() || !config.kushkiPrivateKey.trim()) {
      toast.error('Ambas credenciales son requeridas');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/config/kushki', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(config)
      });

      if (res.ok) {
        toast.success('✅ Configuración de Kushki guardada');
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
                  <p className="font-semibold text-green-900">✅ Kushki configurado</p>
                  <p className="text-sm text-green-700">Las credenciales de Kushki están listas</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-6 w-6 text-orange-600" />
                <div>
                  <p className="font-semibold text-orange-900">⚠️ Kushki no configurado</p>
                  <p className="text-sm text-orange-700">Agrega tus credenciales para habilitar Kushki</p>
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
            Credenciales de Kushki
          </CardTitle>
          <CardDescription>
            Obtén tus credenciales desde: <a href="https://console.kushkipagos.com" target="_blank" className="text-blue-600 hover:underline">console.kushkipagos.com</a>
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
                    checked={config.kushkiMode === "test"}
                    onChange={(e) => setConfig({ ...config, kushkiMode: e.target.value })}
                    className="w-4 h-4"
                  />
                  <span>Test (Pruebas)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="live"
                    checked={config.kushkiMode === "live"}
                    onChange={(e) => setConfig({ ...config, kushkiMode: e.target.value })}
                    className="w-4 h-4"
                  />
                  <span>Live (Producción)</span>
                </label>
              </div>
              <p className="text-xs text-gray-500">
                {config.kushkiMode === 'test' 
                  ? '🔧 Modo prueba: Usa credenciales de sandbox' 
                  : '🚀 Modo producción: Usa credenciales de producción'}
              </p>
            </div>

            {/* Public Key */}
            <div className="space-y-2">
              <Label htmlFor="publicKey">Public Merchant ID</Label>
              <Input
                id="publicKey"
                type="text"
                placeholder="10000..."
                value={config.kushkiPublicKey}
                onChange={(e) => setConfig({ ...config, kushkiPublicKey: e.target.value })}
              />
            </div>

            {/* Private Key */}
            <div className="space-y-2">
              <Label htmlFor="privateKey">Private Merchant ID</Label>
              <div className="relative">
                <Input
                  id="privateKey"
                  type={showPrivateKey ? "text" : "password"}
                  placeholder="pm-..."
                  value={config.kushkiPrivateKey}
                  onChange={(e) => setConfig({ ...config, kushkiPrivateKey: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
              <p className="font-semibold mb-2">💳 Tarjetas de prueba de Kushki</p>
              <div className="space-y-1 font-mono text-xs">
                <div><strong>Visa aprobada:</strong> 4000100011112224</div>
                <div><strong>Mastercard aprobada:</strong> 5451951574925480</div>
                <div><strong>CVV:</strong> 123</div>
                <div><strong>Fecha:</strong> 12/25</div>
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
                <li>El Private Key nunca se envía al navegador</li>
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
```

---

## ✅ **Checklist de Verificación:**

Después de hacer los cambios:
- [ ] Las pestañas son 4 (Procesador, Kushki, Culqi, MercadoPago)
- [ ] Al hacer clic en "Kushki" se muestra el formulario
- [ ] El servidor reiniciado sin errores
- [ ] Puedes guardar credenciales

---

**Última actualización:** 2025-11-24
