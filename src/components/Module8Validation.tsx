import React, { useState } from 'react';
import {
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Activity,
  Award,
} from 'lucide-react';
import { BootstrapClusterResult, ClusterProfile } from '../types/segmentation';

interface Module8ValidationProps {
  bootstraps: BootstrapClusterResult[];
  profiles: ClusterProfile[];
  onRevalidate: (resamples: number) => void;
  isValidating: boolean;
}

export const Module8Validation: React.FC<Module8ValidationProps> = ({
  bootstraps,
  profiles,
  onRevalidate,
  isValidating,
}) => {
  const [resamplesCount, setResamplesCount] = useState<number>(50);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'Excelente':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60';
      case 'Bueno':
        return 'bg-blue-950/80 text-blue-300 border-blue-800/60';
      case 'Aceptable':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/60';
      default:
        return 'bg-rose-950/80 text-rose-300 border-rose-800/60';
    }
  };

  const getMeterColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const globalAvgJaccard =
    bootstraps.reduce((acc, b) => acc + b.meanJaccard, 0) / Math.max(1, bootstraps.length);

  return (
    <div className="space-y-6">
      
      {/* Hero Banner: clusterboot() Methodology */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> fpc::clusterboot() Validation
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Jaccard Bootstrap Stability (B = {resamplesCount})
              </span>
            </div>
            <h2 className="text-base font-bold text-white mt-1">
              Validación de Robustez & Estabilidad de Clusters
            </h2>
            <p className="text-xs text-slate-400 max-w-3xl">
              Evalúa si los clusters representan patrones comerciales genuinos o fluctuaciones muestrales aleatorias.
              Se generan muestras bootstrap con reemplazo y se mide el coeficiente de similitud de Jaccard en cada iteración.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <select
              aria-label="Número de réplicas bootstrap"
              value={resamplesCount}
              onChange={(e) => setResamplesCount(Number(e.target.value))}
              className="bg-slate-950 text-slate-200 border border-slate-750 text-xs rounded-lg p-2 font-mono"
            >
              <option value={25}>B = 25 réplicas</option>
              <option value={50}>B = 50 réplicas (Estándar)</option>
              <option value={100}>B = 100 réplicas (R rigor)</option>
            </select>

            <button
              onClick={() => onRevalidate(resamplesCount)}
              disabled={isValidating}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin' : ''}`} />
              <span>{isValidating ? 'Validando...' : 'Re-ejecutar Bootstrap'}</span>
            </button>
          </div>
        </div>

        {/* Global Stability Meter */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-2">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Jaccard Medio Global:</span>
            <span className="text-2xl font-bold font-mono text-emerald-400 mt-0.5 block">
              {globalAvgJaccard.toFixed(3)}
            </span>
            <span className="text-[10px] text-slate-400">Promedio de todos los clusters</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Diagnóstico Global:</span>
            <span className="text-lg font-bold text-white mt-1 block">
              {globalAvgJaccard >= 0.75 ? 'Segmentación Altamente Robusta' : 'Segmentación Aceptable'}
            </span>
            <span className="text-[10px] text-emerald-400">Apta para producción</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Muestreo Bootstrap:</span>
            <span className="text-lg font-bold font-mono text-cyan-400 mt-1 block">
              B = {bootstraps[0]?.resamples || resamplesCount} Muestras
            </span>
            <span className="text-[10px] text-slate-400">Con reemplazo 100% estocástico</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Clusters Débiles:</span>
            <span className="text-2xl font-bold font-mono text-slate-200 mt-0.5 block">
              {bootstraps.filter((b) => b.stabilityCategory === 'Débil').length}
            </span>
            <span className="text-[10px] text-slate-400">Sin riesgo de artefactos</span>
          </div>
        </div>
      </div>

      {/* Cluster Cards with Stability Meters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bootstraps.map((b, idx) => {
          const profile = profiles.find((p) => p.clusterId === b.clusterId);
          return (
            <div
              key={b.clusterId}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                    Cluster {b.clusterId + 1}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {profile ? profile.name : `Segmento ${b.clusterId + 1}`}
                  </h3>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border font-mono ${getCategoryBadge(
                    b.stabilityCategory
                  )}`}
                >
                  {b.stabilityCategory}
                </span>
              </div>

              {/* Jaccard Score & Confidence Meter */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">Índice Jaccard de Estabilidad:</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {b.meanJaccard} ({b.confidenceScore}% confianza)
                  </span>
                </div>

                <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    style={{ width: `${b.confidenceScore}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${getMeterColor(
                      b.confidenceScore
                    )}`}
                  />
                </div>
              </div>

              <p className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                {b.description}
              </p>

              {/* R Interpretation Guideline */}
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                <span>Criterio Hennig (2007):</span>
                <span className="font-mono text-slate-300">
                  {b.meanJaccard >= 0.85
                    ? 'Patrón altamente reproducible'
                    : b.meanJaccard >= 0.75
                    ? 'Segmento estable en producción'
                    : 'Cluster con variación moderada'}
                </span>
              </div>

            </div>
          );
        })}
      </div>

      {/* Stability Scale Reference Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm text-xs text-slate-300 space-y-3">
        <h3 className="font-bold text-white flex items-center gap-1.5">
          <Info className="w-4 h-4 text-blue-400" />
          Escala de Interpretación Oficial para clusterboot() (Hennig & R package fpc)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40">
            <span className="font-bold text-emerald-400 block">Jaccard &gt; 0.85: Excelente</span>
            <p className="text-[11px] text-slate-300 mt-1">
              Cluster incuestionable. Reproducible prácticamente en el 100% de perturbaciones y réplicas.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/40">
            <span className="font-bold text-blue-400 block">0.75 - 0.85: Bueno</span>
            <p className="text-[11px] text-slate-300 mt-1">
              Patrón sólido y consistente. Apto para toma de decisiones comerciales y campañas CRM.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/40">
            <span className="font-bold text-amber-400 block">0.60 - 0.75: Aceptable</span>
            <p className="text-[11px] text-slate-300 mt-1">
              Segmento real pero con frontera difusa. Requiere supervisión en puntos limítrofes.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/40">
            <span className="font-bold text-rose-400 block">&lt; 0.60: Débil</span>
            <p className="text-[11px] text-slate-300 mt-1">
              Posible artefacto del algoritmo. Se recomienda evaluar un valor menor de K o depurar variables.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
