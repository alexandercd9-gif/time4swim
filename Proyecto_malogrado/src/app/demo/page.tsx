import { DemoStopwatch } from "@/components/demo-stopwatch";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al login
            </Button>
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              ⏱️ Cronómetro de Prueba
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Prueba nuestro cronómetro sin registrarte
            </p>
          </div>
        </div>

        {/* Aviso de limitaciones */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <Lock className="h-5 w-5" />
            <span className="font-semibold">Modo de Prueba</span>
          </div>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            En este modo puedes usar el cronómetro pero no podrás guardar entrenamientos. 
            <Link href="/" className="underline font-medium"> Regístrate</Link> para acceder a todas las funcionalidades.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <DemoStopwatch />
        </div>
      </div>
    </main>
  );
}