"use client";


export default function AdminDashboard() {
  return (
    <div className="container py-5">
      <h1 className="mb-5 text-center">Dashboard Administrador</h1>
      <div className="row g-4 justify-content-center">
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">Usuarios Totales</h5>
              <p className="display-5 fw-bold text-primary">1,234</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">Clubes Activos</h5>
              <p className="display-5 fw-bold text-success">27</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">Nadadores</h5>
              <p className="display-5 fw-bold text-info">542</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">Competiciones</h5>
              <p className="display-5 fw-bold text-warning">16</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
