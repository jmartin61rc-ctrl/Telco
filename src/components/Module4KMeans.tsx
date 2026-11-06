import React from 'react';
import {
  Sliders,
  CheckCircle2,
  RefreshCw,
  Zap,
  Target,
  Hash,
  Activity,
  Layers,
} from 'lucide-react';
import { KMeansModelResult, ProcessedDataset } from '../types/segmentation';

interface Module4KMeansProps {
  model: KMeansModelResult;
  processed: ProcessedDataset;
  manualK: number;
  onKChange: (k: number) => void;
  seed: number;
  onSeedChange: (s: number) => void;
  maxIters: number;
  onMaxItersChange: (iters: number) => void;
  onRerun: () => void;
}

const CLUSTER_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
];

export const Module4KMeans: React.FC<Module4KMeansProps> = ({
  model,
  processed,
  manualK,
  onKChange,
  seed,
  onSeedChange,
  maxIters,
  onMaxItersChange,
  onRerun,
}) => {
  return (
    <div className="space-y-6">
      
      {/* Configuration Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              Configuración y Parámetros del Algoritmo K-Means
            </h2>
            <p className="text-xs text-slate-400">
              Ajuste fino de hiperparámetros: número de clusters, inicialización K-means++ y reproducibilidad
            </p>
          </div>

          <button
            onClick={onRerun}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] self-start lg:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-entrenar Modelo</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
          
          {/* Slider K */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium">Número de Clusters (K):</span>
              <span className="font-bold text-cyan-400 font-mono text-sm px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                K = {manualK}
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={8}
              value={manualK}
              onChange={(e) => onKChange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>K=2</span>
              <span>K=4</span>
              <span>K=6</span>
              <span>K=8</span>
            </div>
          </div>

          {/* Random Seed */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium">Semilla Aleatoria (Seed):</span>
              <span className="font-mono text-slate-400 text-xs">set.seed({seed})</span>
            </div>
            <input
              type="number"
              value={seed}
              onChange={(e) => onSeedChange(Number(e.target.value) || 1)}
              className="w-full bg-slate-950 text-slate-200 border border-slate-750 text-xs rounded-lg p-2 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-[10px] text-slate-500">
              Garantiza replicabilidad exacta como en R <code className="text-slate-400">set.seed()</code>
            </p>
          </div>

          {/* Max Iterations */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium">Iteraciones Máximas:</span>
              <span className="font-mono text-slate-400 text-xs">{maxIters}</span>
            </div>
            <input
              type="number"
              min={10}
              max={300}
              value={maxIters}
              onChange={(e) => onMaxItersChange(Number(e.target.value) || 10)}
              className="w-full bg-slate-950 text-slate-200 border border-slate-750 text-xs rounded-lg p-2 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-[10px] text-slate-500">
              Convergencia alcanzada en {model.iterations} iteraciones ({model.converged ? 'Convergido' : 'Máximo alcanzado'})
            </p>
          </div>

        </div>
      </div>

      {/* Global ANOVA / Variance Explained Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-blue-400" /> Varianza Explicada
          </p>
          <p className="text-2xl font-bold text-white mt-1">
            {model.varianceExplainedPercent}%
          </p>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">BetweenSS / TotSS</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <p className="text-[11px] font-medium text-slate-400">Total Sum of Squares</p>
          <p className="text-2xl font-bold text-slate-200 mt-1 font-mono">
            {model.totSS.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">TotSS</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <p className="text-[11px] font-medium text-slate-400">Between Sum of Squares</p>
          <p className="text-2xl font-bold text-indigo-400 mt-1 font-mono">
            {model.betweenSS.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">BetweenSS</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <p className="text-[11px] font-medium text-slate-400">Inercia (Tot.WithinSS)</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1 font-mono">
            {model.totWithinSS.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">Tot.WithinSS</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <p className="text-[11px] font-medium text-slate-400">Estado de Convergencia</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> {model.iterations} iters
          </p>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">Lloyd Algorithm</p>
        </div>

      </div>

      {/* Cluster Sizes & Relative Proportions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          Distribución de Tamaños y Proporción de Clientes por Cluster
        </h2>

        {/* Visual progress distribution bar */}
        <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex mb-4">
          {model.clusterSizes.map((size, idx) => (
            <div
              key={idx}
              style={{
                width: `${model.clusterPercentages[idx]}%`,
                backgroundColor: CLUSTER_COLORS[idx % CLUSTER_COLORS.length],
              }}
              className="h-full transition-all duration-300"
              title={`Cluster ${idx + 1}: ${size} (${model.clusterPercentages[idx]}%)`}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {model.clusterSizes.map((size, idx) => (
            <div
              key={idx}
              className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 w-1.5 h-full"
                style={{ backgroundColor: CLUSTER_COLORS[idx % CLUSTER_COLORS.length] }}
              />
              <div className="flex justify-between items-center pl-2">
                <span className="text-xs font-bold text-white">Cluster {idx + 1}</span>
                <span className="text-xs font-mono font-bold text-slate-200">
                  {model.clusterPercentages[idx]}%
                </span>
              </div>
              <p className="text-xl font-bold text-white pl-2 mt-1">
                {size.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-400">clientes</span>
              </p>
              <p className="text-[10px] text-slate-500 pl-2 mt-1 font-mono">
                WSS: {model.withinSS[idx].toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Cluster Centroids Table: Scaled vs Original Scale */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              Centros de Cluster (Centroid Coordinates)
            </h2>
            <p className="text-xs text-slate-400">
              Valores promedio de cada variable en escala de negocio original desnormalizada
            </p>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            modelo$centers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Cluster</th>
                <th className="py-2.5 px-3 text-right">Minutos Pref.</th>
                <th className="py-2.5 px-3 text-right">Minutos No Pref.</th>
                <th className="py-2.5 px-3 text-right">Adicionales</th>
                <th className="py-2.5 px-3 text-right">Internet (GB)</th>
                <th className="py-2.5 px-3 text-right">Servicios (0-4)</th>
                <th className="py-2.5 px-3 text-right">Equipo ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {model.centroidsOriginal.map((centroid, cIdx) => (
                <tr key={cIdx} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-2.5 px-3 font-sans font-bold flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: CLUSTER_COLORS[cIdx % CLUSTER_COLORS.length] }}
                    />
                    <span className="text-white">Cluster {cIdx + 1}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-cyan-300">
                    {Math.round(centroid[0])} min
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300">
                    {Math.round(centroid[2])} min
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300">
                    {Math.round(centroid[1])}
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-300">
                    {centroid[3].toFixed(1)} GB
                  </td>
                  <td className="py-2.5 px-3 text-right text-indigo-300 font-bold">
                    {centroid[4].toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-amber-300 font-bold">
                    ${Math.round(centroid[5])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
