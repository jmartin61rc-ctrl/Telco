import React from 'react';
import {
  Users,
  DollarSign,
  Smartphone,
  PhoneCall,
  Wifi,
  Package,
  HeartHandshake,
  Award,
  TrendingUp,
} from 'lucide-react';
import { ClusterProfile } from '../types/segmentation';

interface Module5ProfilingProps {
  profiles: ClusterProfile[];
}

const CLUSTER_BORDER_COLORS = [
  'border-blue-500',
  'border-emerald-500',
  'border-amber-500',
  'border-purple-500',
  'border-pink-500',
  'border-cyan-500',
];

const CLUSTER_BG_COLORS = [
  'from-blue-950/40 to-slate-900',
  'from-emerald-950/40 to-slate-900',
  'from-amber-950/40 to-slate-900',
  'from-purple-950/40 to-slate-900',
  'from-pink-950/40 to-slate-900',
  'from-cyan-950/40 to-slate-900',
];

export const Module5Profiling: React.FC<Module5ProfilingProps> = ({ profiles }) => {
  return (
    <div className="space-y-6">
      
      {/* Overview Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Perfilamiento Integral de Segmentos & Buyer Personas
            </h2>
            <p className="text-xs text-slate-400">
              Caracterización demográfica, capacidad económica, consumo de telecomunicaciones y valor de cliente
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-300 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/50">
            {profiles.length} Segmentos Estratégicos Activos
          </span>
        </div>
      </div>

      {/* Cluster Persona Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((p, idx) => (
          <div
            key={p.clusterId}
            className={`bg-gradient-to-b ${CLUSTER_BG_COLORS[idx % CLUSTER_BG_COLORS.length]} border ${
              CLUSTER_BORDER_COLORS[idx % CLUSTER_BORDER_COLORS.length]
            } rounded-xl p-5 shadow-md flex flex-col justify-between transition-all hover:shadow-lg`}
          >
            <div>
              
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800/80">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    Cluster {p.clusterId + 1}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5 leading-snug">{p.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-cyan-400 font-mono block">
                    {p.percentage}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {p.size.toLocaleString()} clientes
                  </span>
                </div>
              </div>

              {/* Persona Description */}
              <p className="text-xs text-slate-300 mt-3 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
                {p.label}
              </p>

              {/* Core Financial & Usage Metrics */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
                
                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-sans block flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-400" /> Ingreso Promedio
                  </span>
                  <span className="text-sm font-bold text-emerald-400">${p.avgIncome}k / mes</span>
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-sans block flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-amber-400" /> Valor Terminal
                  </span>
                  <span className="text-sm font-bold text-amber-400">${p.avgDeviceVal} USD</span>
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-sans block flex items-center gap-1">
                    <Wifi className="w-3 h-3 text-cyan-400" /> Tráfico de Datos
                  </span>
                  <span className="text-sm font-bold text-cyan-400">{p.avgInternetGb} GB</span>
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-sans block flex items-center gap-1">
                    <PhoneCall className="w-3 h-3 text-blue-400" /> Min. Preferidos
                  </span>
                  <span className="text-sm font-bold text-blue-400">{p.avgPrefMinutes} min</span>
                </div>

              </div>

              {/* Additional Variables */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Servicios Contratados (fijo, ld, ic, no):</span>
                  <span className="font-bold font-mono text-indigo-300">{p.avgServices} de 4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Edad Media de Clientes:</span>
                  <span className="font-bold font-mono text-slate-200">{p.avgAge} años</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Perfil Sociodemográfico:</span>
                  <span className="text-slate-300 font-sans">
                    {p.dominantMarital} • {p.dominantGender}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tasa de Clientes Jubilados:</span>
                  <span className="font-mono text-slate-300">{p.retireeRate}%</span>
                </div>
              </div>

            </div>

            {/* Bottom Strategic Focus Tag */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Enfoque Recomendado
              </span>
              <span className="text-[11px] font-semibold text-slate-200 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                {p.avgIncome > 70
                  ? 'Fidelización VIP'
                  : p.avgInternetGb > 30
                  ? 'Monetización Datos'
                  : p.avgAge > 50
                  ? 'Retención Hogar'
                  : 'Up-Selling Base'}
              </span>
            </div>

          </div>
        ))}
      </div>

      {/* Comparative Cross-Cluster KPI Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          Tabla de Benchmarking Comparativo entre Todos los Segmentos
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Cluster</th>
                <th className="py-2.5 px-3 text-right">Tamaño</th>
                <th className="py-2.5 px-3 text-right">Participación</th>
                <th className="py-2.5 px-3 text-right">Edad Media</th>
                <th className="py-2.5 px-3 text-right">Ingreso ($k)</th>
                <th className="py-2.5 px-3 text-right">Equipo ($)</th>
                <th className="py-2.5 px-3 text-right">Servicios</th>
                <th className="py-2.5 px-3 text-right">Min. Pref</th>
                <th className="py-2.5 px-3 text-right">Datos (GB)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {profiles.map((p, idx) => (
                <tr key={p.clusterId} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-2.5 px-3 font-sans font-bold text-white flex items-center gap-1.5">
                    <span className="text-slate-400">#{p.clusterId + 1}</span>
                    <span>{p.name}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{p.size}</td>
                  <td className="py-2.5 px-3 text-right text-cyan-300 font-bold">{p.percentage}%</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{p.avgAge}a</td>
                  <td className="py-2.5 px-3 text-right text-emerald-300 font-bold">${p.avgIncome}k</td>
                  <td className="py-2.5 px-3 text-right text-amber-300">${p.avgDeviceVal}</td>
                  <td className="py-2.5 px-3 text-right text-indigo-300 font-bold">{p.avgServices}</td>
                  <td className="py-2.5 px-3 text-right text-blue-300">{p.avgPrefMinutes}</td>
                  <td className="py-2.5 px-3 text-right text-cyan-300">{p.avgInternetGb} GB</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
