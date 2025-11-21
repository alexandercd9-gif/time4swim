"use client";

import { LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import ProTrialBanner from "@/components/club/ProTrialBanner";
import ProTrialExpiredModal from "@/components/club/ProTrialExpiredModal";
import { useRouter } from "next/navigation";

export default function ClubDashboard() {
  const router = useRouter();
  const [clubInfo, setClubInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  useEffect(() => {
    // Obtener información del club incluyendo estado PRO
    fetch('/api/club/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setClubInfo(data);
        setLoading(false);

        // Verificar si el trial expiró recientemente
        if (data.proTrialExpiresAt && !data.isProActive && !data.isProTrial) {
          const expiryDate = new Date(data.proTrialExpiresAt);
          const today = new Date();
          const daysExpired = Math.floor((today.getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Mostrar modal si expiró hace menos de 7 días (para no ser invasivo)
          // También verificar si el usuario ya lo cerró en esta sesión
          const modalDismissed = sessionStorage.getItem('proExpiredModalDismissed');
          if (daysExpired >= 0 && daysExpired <= 7 && !modalDismissed) {
            setShowExpiredModal(true);
          }
        }
      })
      .catch(err => {
        console.error('Error fetching club info:', err);
        setLoading(false);
      });
  }, []);

  const handleCloseModal = () => {
    setShowExpiredModal(false);
    // Recordar que el usuario cerró el modal en esta sesión
    sessionStorage.setItem('proExpiredModalDismissed', 'true');
  };

  const handleUpgrade = () => {
    router.push('/subscription?type=club&plan=club_pro');
  };

  const getDaysExpired = () => {
    if (!clubInfo?.proTrialExpiresAt) return 0;
    const expiryDate = new Date(clubInfo.proTrialExpiresAt);
    const today = new Date();
    return Math.floor((today.getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <>
      {/* Modal de Trial Expirado */}
      <ProTrialExpiredModal
        isOpen={showExpiredModal}
        onClose={handleCloseModal}
        onUpgrade={handleUpgrade}
        daysExpired={getDaysExpired()}
      />

      <div className="max-w-7xl mx-auto space-y-6 pt-6">
        {/* PRO Trial Banner */}
        {!loading && clubInfo && (
          <ProTrialBanner
            trialExpiresAt={clubInfo.proTrialExpiresAt}
            isProTrial={clubInfo.isProTrial}
            isProActive={clubInfo.isProActive}
          />
        )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-blue-600" />
          Dashboard del Club
        </h1>
        <p className="text-gray-600 mt-2">
          Panel de control y estadísticas generales
        </p>
      </div>

      {/* Estadísticas del club */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="text-3xl font-bold text-blue-600">45</div>
          <div className="text-gray-600">Nadadores Activos</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="text-3xl font-bold text-green-600">8</div>
          <div className="text-gray-600">Entrenadores</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="text-3xl font-bold text-purple-600">12</div>
          <div className="text-gray-600">Grupos de Entrenamiento</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="text-3xl font-bold text-orange-600">5</div>
          <div className="text-gray-600">Competiciones Este Mes</div>
        </div>
      </div>

      {/* Acciones rápidas para club */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Gestionar Club</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
            <i className="fas fa-user-friends text-blue-600 mb-2"></i>
            <div className="font-medium">Gestionar Nadadores</div>
            <div className="text-sm text-gray-600">Inscripciones y altas</div>
          </button>
          <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
            <i className="fas fa-users text-green-600 mb-2"></i>
            <div className="font-medium">Entrenadores</div>
            <div className="text-sm text-gray-600">Staff del club</div>
          </button>
          <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
            <i className="fas fa-trophy text-purple-600 mb-2"></i>
            <div className="font-medium">Competiciones</div>
            <div className="text-sm text-gray-600">Organizar eventos</div>
          </button>
          <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
            <i className="fas fa-receipt text-orange-600 mb-2"></i>
            <div className="font-medium">Pagos y Cuotas</div>
            <div className="text-sm text-gray-600">Gestión financiera</div>
          </button>
        </div>
      </div>
      </div>
    </>
  );
}