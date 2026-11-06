import React from 'react';
import {
  TrendingUp,
  Layers,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceDot,
} from 'recharts';
import { OptimalKResult } from '../types/segmentation';
import { recommendOptimalK } from '../services/clusteringEngine';

interface Module3OptimalClustersProps {
  curveResults: OptimalKResult[];
  activeK: number;
  onSelectK: (k: number) => void;
}

export const Module3OptimalClusters: React.FC<Module3OptimalClustersProps> = ({
  curveResults,
  activeK,
  onSelectK,
}) => {
  const recommendation = recommendOptimalK(curveResults);

  // Find exact points for reference dots
  const elbowPoint = curveResults.find((r) => r.k === recommendation.elbowK);
  const silPoint = curveResults.find((r) => r.k === recommendation.silhouetteK);
  const gapPoint = curveResults.find((r) => r.k === recommendation.gapK);

  return (
    <div className="space-y-6">
      
      {/* Consolidated Recommendation Hero Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 border border-blue-800/60 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-blue-400" /> Consenso Analítico de 3 Métodos
              </span>
              <span className="text-xs text-slate-400">R factoextra & cluster</span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Recomendación Automática: K ={' '}
              <span className="text-cyan-400 text-2xl font-black">{recommendation.recommendedK}</span> Clusters
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {recommendation.rationale}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {activeK !== recommendation.recommendedK ? (
              <button
                onClick={() => onSelectK(recommendation.recommendedK)}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-105"
              >
                <span>Aplicar K = {recommendation.recommendedK}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> K = {activeK} Activo en el Modelo
              </div>
            )}
          </div>
        </div>

        {/* Three Individual Method Summary Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/80">
          <div
            onClick={() => onSelectK(recommendation.elbowK)}
            className="cursor-pointer bg-slate-900/80 hover:bg-slate-850 p-3 rounded-lg border border-slate-800 transition-colors"
          >
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">1. Método del Codo (WSS)</span>
              <span className="font-bold text-blue-400 font-mono">K = {recommendation.elbowK}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Mayor desaceleración en la suma de cuadrados interna (WSS).
            </p>
          </div>

          <div
            onClick={() => onSelectK(recommendation.silhouetteK)}
            className="cursor-pointer bg-slate-900/80 hover:bg-slate-850 p-3 rounded-lg border border-slate-800 transition-colors"
          >
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">2. Silhouette Score</span>
              <span className="font-bold text-emerald-400 font-mono">K = {recommendation.silhouetteK}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Máxima cohesión intra-cluster y separación inter-cluster.
            </p>
          </div>

          <div
            onClick={() => onSelectK(recommendation.gapK)}
            className="cursor-pointer bg-slate-900/80 hover:bg-slate-850 p-3 rounded-lg border border-slate-800 transition-colors"
          >
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">3. Gap Statistic</span>
              <span className="font-bold text-amber-400 font-mono">K = {recommendation.gapK}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Regla de 1 error estándar vs distribución nula uniforme.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: 3 Interactive Curves */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Elbow WSS Curve */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                Método del Codo (WSS)
              </h2>
              <p className="text-[11px] text-slate-400">Total Within-Cluster Sum of Squares</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/40">
              Óptimo: K={recommendation.elbowK}
            </span>
          </div>

          <div className="h-56 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={curveResults} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="k" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()}`, 'Tot.WithinSS']}
                  labelFormatter={(k) => `Clusters: K = ${k}`}
                />
                <Line
                  type="monotone"
                  dataKey="wss"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#3b82f6' }}
                  activeDot={{ r: 6 }}
                />
                {elbowPoint && (
                  <ReferenceDot
                    x={elbowPoint.k}
                    y={elbowPoint.wss}
                    r={6}
                    fill="#38bdf8"
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Punto de inflexión donde disminuye el beneficio marginal de añadir clusters adicionales.
          </p>
        </div>

        {/* Chart 2: Silhouette Score Curve */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                Coeficiente Silhouette
              </h2>
              <p className="text-[11px] text-slate-400">Promedio global (-1 a +1)</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">
              Óptimo: K={recommendation.silhouetteK}
            </span>
          </div>

          <div className="h-56 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={curveResults.filter((r) => r.k >= 2)}
                margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="k" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`${val}`, 'Silhouette']}
                  labelFormatter={(k) => `Clusters: K = ${k}`}
                />
                <Line
                  type="monotone"
                  dataKey="silhouette"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                />
                {silPoint && (
                  <ReferenceDot
                    x={silPoint.k}
                    y={silPoint.silhouette}
                    r={6}
                    fill="#34d399"
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Valores cercanos a 1 indican que los clientes están muy bien emparejados con su cluster.
          </p>
        </div>

        {/* Chart 3: Gap Statistic Curve */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Estadístico Gap
              </h2>
              <p className="text-[11px] text-slate-400">Diferencia vs distribución nula</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/40">
              Óptimo: K={recommendation.gapK}
            </span>
          </div>

          <div className="h-56 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={curveResults} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="k" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`${val}`, 'Gap(k)']}
                  labelFormatter={(k) => `Clusters: K = ${k}`}
                />
                <Line
                  type="monotone"
                  dataKey="gap"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#f59e0b' }}
                  activeDot={{ r: 6 }}
                />
                {gapPoint && (
                  <ReferenceDot
                    x={gapPoint.k}
                    y={gapPoint.gap}
                    r={6}
                    fill="#fbbf24"
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Estimador formal de Tibshirani (2001) para descartar estructuras agrupadas espurias.
          </p>
        </div>

      </div>

      {/* Numerical Comparison Table K=1 to K=10 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-100 mb-3">
          Tabla Consolidada de Métricas de Selección (K = 1 hasta 10)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">K (Clusters)</th>
                <th className="py-2.5 px-3 text-right">Tot.WithinSS (WSS)</th>
                <th className="py-2.5 px-3 text-right">Silhouette Promedio</th>
                <th className="py-2.5 px-3 text-right">Gap(k)</th>
                <th className="py-2.5 px-3 text-right">Simulación E*[log(WSS)]</th>
                <th className="py-2.5 px-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {curveResults.map((r) => {
                const isCurrent = r.k === activeK;
                const isOptimal = r.k === recommendation.recommendedK;

                return (
                  <tr
                    key={r.k}
                    className={`hover:bg-slate-850/50 transition-colors ${
                      isCurrent ? 'bg-blue-950/20' : ''
                    }`}
                  >
                    <td className="py-2 px-3 font-sans font-bold flex items-center gap-1.5">
                      <span className="text-slate-100">K = {r.k}</span>
                      {isOptimal && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] border border-amber-500/30">
                          Óptimo
                        </span>
                      )}
                      {isCurrent && (
                        <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 text-[10px] border border-blue-500/30">
                          Activo
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right text-blue-300">{r.wss.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right text-emerald-300">
                      {r.k === 1 ? 'N/A' : r.silhouette}
                    </td>
                    <td className="py-2 px-3 text-right text-amber-300">{r.gap}</td>
                    <td className="py-2 px-3 text-right text-slate-400">{r.gapSimMean}</td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => onSelectK(r.k)}
                        className={`px-2 py-0.5 rounded text-[11px] font-sans transition-colors ${
                          isCurrent
                            ? 'bg-slate-800 text-slate-400 cursor-default'
                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                        }`}
                      >
                        {isCurrent ? 'Seleccionado' : 'Elegir'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
