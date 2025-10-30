

import MetricCard from "@/components/MetricCard";
import { Users, School, BarChart, Medal } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <MetricCard icon={<Users size={32} />} label="Usuarios" value={120} trend="+5% esta semana" color="blue" />
      <MetricCard icon={<School size={32} />} label="Clubes" value={12} trend="+1" color="cyan" />
      <MetricCard icon={<BarChart size={32} />} label="Nadadores" value={542} trend="+12" color="green" />
      <MetricCard icon={<Medal size={32} />} label="Competiciones" value={16} color="yellow" />
    </div>
    // ...puedes agregar más componentes aquí
  );
}
