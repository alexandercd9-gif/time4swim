import ModernLoginForm from "@/components/modern-login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="container-fluid vh-100 p-0 login-page">
      <div className="row g-0 h-100">
        {/* Columna izquierda - Solo visible en desktop */}
        <div className="col-lg-6 d-none d-lg-flex login-left-column align-items-center justify-content-center">
          <div className="text-center text-white px-5">
            <div className="mb-5">
              <div className="mb-4">
                <Image 
                  src="/logo.png" 
                  alt="Time4Swim" 
                  width={120} 
                  height={120}
                  className="img-fluid"
                />
              </div>
              <h1 className="display-4 fw-bold mb-3">Time4Swim</h1>
              <p className="lead fs-3 mb-4">Sistema Profesional de Gestión Acuática</p>
            </div>
            
            <div className="row g-4 mt-5">
              <div className="col-6">
                <div className="text-center">
                  <div className="feature-icon rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
                    <span className="fs-2">👨‍👩‍👧</span>
                  </div>
                  <h6>Para Padres</h6>
                  <small className="text-white-50">Seguimiento de progreso</small>
                </div>
              </div>
              <div className="col-6">
                <div className="text-center">
                  <div className="feature-icon rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
                    <span className="fs-2">🏊</span>
                  </div>
                  <h6>Para Clubes</h6>
                  <small className="text-white-50">Gestión de nadadores</small>
                </div>
              </div>
              <div className="col-6">
                <div className="text-center">
                  <div className="feature-icon rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
                    <span className="fs-2">⏱️</span>
                  </div>
                  <h6>Cronómetro</h6>
                  <small className="text-white-50">Precisión profesional</small>
                </div>
              </div>
              <div className="col-6">
                <div className="text-center">
                  <div className="feature-icon rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
                    <span className="fs-2">📊</span>
                  </div>
                  <h6>Estadísticas</h6>
                  <small className="text-white-50">Análisis detallado</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Columna derecha - Siempre visible */}
        <div className="col-12 col-lg-6 d-flex align-items-center justify-content-center bg-light">
          <div className="w-100 px-3 px-lg-5" style={{maxWidth: '450px'}}>
            {/* Logo en móvil */}
            <div className="text-center d-lg-none mb-5">
              <div className="mb-3">
                <Image 
                  src="/logo.png" 
                  alt="Time4Swim" 
                  width={80} 
                  height={80}
                  className="img-fluid"
                />
              </div>
              <h1 className="display-5 fw-bold text-primary mb-2">Time4Swim</h1>
              <p className="text-muted">Sistema de Gestión Acuática</p>
            </div>
            
            <ModernLoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}