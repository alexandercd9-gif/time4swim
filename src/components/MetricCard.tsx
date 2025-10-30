import { ReactNode } from "react";

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  color?: "blue" | "green" | "yellow" | "cyan";
}

const colorMap = {
  blue: "border-blue-400 text-blue-500",
  green: "border-green-400 text-green-500",
  yellow: "border-yellow-400 text-yellow-500",
  cyan: "border-cyan-400 text-cyan-500",
};

export default function MetricCard({ icon, label, value, trend, color = "blue" }: MetricCardProps) {
  return (
    <div className={`bg-white/70 backdrop-blur-md rounded-xl shadow-md p-5 flex flex-col items-center glassmorphism border-l-4 ${colorMap[color]}`}>
      <div className={`mb-2 ${colorMap[color]}`}>{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
      {trend && <div className="mt-1 text-xs text-green-500">{trend}</div>}
    </div>
  );
}
