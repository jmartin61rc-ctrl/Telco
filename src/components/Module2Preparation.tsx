import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Code2,
  Layers,
  Scale,
  Calculator,
} from 'lucide-react';
import { ProcessedDataset } from '../types/segmentation';
import { CLUSTERING_VARS, LOG_TRANSFORM_VARS } from '../services/clusteringEngine';

interface Module2PreparationProps {
  processed: ProcessedDataset;
}

export const Module2Preparation: React.FC<Module2PreparationProps> = ({ processed }) => {
  const [viewStep, setViewStep] = useState<'all' | 'raw' | 'log' | 'scaled'>('all');
  const sampleRows = processed.original.slice(0, 6);

  return (
    <div className="space-y-6">
      
      {/* Step Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Step 1: Feature Engineering */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 w-full bg-blue-500" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-blue-400 font-bold uppercase tracking-wider">
              Paso 1: Ingeniería
            </span>
            <Calculator className="w-4 h-4 text-blue-400" />
          </div>
          <h2 className="text-sm font-bold text-white mb-1">Variable Agregada: servicios</h2>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Suma de los 4 servicios telecomunicaciones contratados:
          </p>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs text-blue-300">
            <code>servicios = fijo + largadistancia + internetcasa + numoculto</code>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Rango resultante: 0 a 4 servicios activos simultáneos.
          </p>
        </div>

        {/* Step 2: Log Transformation */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 w-full bg-cyan-500" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
              Paso 2: Transformación
            </span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <h2 className="text-sm font-bold text-white mb-1">log(1 + x) Estabilizadora</h2>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Comprime colas pesadas y asimetría positiva extrema en 4 variables:
          </p>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs text-cyan-300 space-y-0.5">
            <div>• minutos_preferido</div>
            <div>• adicionales</div>
            <div>• minutos_no_preferido</div>
            <div>• internet_gigas</div>
          </div>
        </div>

        {/* Step 3: Standardization */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 w-full bg-emerald-500" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
              Paso 3: Estandarización
            </span>
            <Scale className="w-4 h-4 text-emerald-400" />
          </div>
          <h2 className="text-sm font-bold text-white mb-1">Z-Score Normalization</h2>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Evita que magnitudes monetarias (ej: equipo $1,500) dominen distancias euclidianas:
          </p>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300">
            <code>z = (x - μ) / σ  →  μ = 0, σ² = 1</code>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Aplicado a las 6 variables finales para K-Means.
          </p>
        </div>

      </div>

      {/* Feature Parameters Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-100 mb-1 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-blue-400" />
          Parámetros de Estandarización (Medias y Desviaciones Estándar)
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Valores utilizados para la normalización en la matriz de distancias de K-Means
        </p>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {processed.featureNames.map((col, idx) => (
            <div key={col} className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 font-bold block truncate">
                {col}
              </span>
              <div className="mt-2 text-xs space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Transform:</span>
                  <span className={LOG_TRANSFORM_VARS.includes(col) ? 'text-cyan-400 font-bold' : 'text-slate-400'}>
                    {LOG_TRANSFORM_VARS.includes(col) ? 'log(1+x)' : 'directa'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">μ (media):</span>
                  <span className="text-slate-200">{processed.means[idx].toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">σ (std):</span>
                  <span className="text-slate-200">{processed.stds[idx].toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Matrix Comparison Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Comparativa de Valores por Etapa del Pipeline
            </h2>
            <p className="text-xs text-slate-400">
              Observa cómo se transforman los valores originales a escala Z estandarizada
            </p>
          </div>

          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setViewStep('all')}
              className={`px-2.5 py-1 rounded font-medium ${
                viewStep === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Matriz Completa
            </button>
            <button
              onClick={() => setViewStep('raw')}
              className={`px-2.5 py-1 rounded font-medium ${
                viewStep === 'raw' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. Original
            </button>
            <button
              onClick={() => setViewStep('log')}
              className={`px-2.5 py-1 rounded font-medium ${
                viewStep === 'log' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2. log(1+x)
            </button>
            <button
              onClick={() => setViewStep('scaled')}
              className={`px-2.5 py-1 rounded font-medium ${
                viewStep === 'scaled' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3. Z-Score (Final)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Cliente ID</th>
                {processed.featureNames.map((name) => (
                  <th key={name} className="py-2.5 px-3 text-right">
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sampleRows.map((row, rIdx) => {
                const rawRow = processed.rawMatrix[rIdx];
                const logRow = processed.transformedMatrix[rIdx];
                const scaledRow = processed.scaledMatrix[rIdx];

                return (
                  <tr key={row.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-400 font-sans">
                      Cliente #{row.id}
                    </td>

                    {processed.featureNames.map((name, cIdx) => {
                      if (viewStep === 'raw') {
                        return (
                          <td key={name} className="py-2.5 px-3 text-right text-slate-300">
                            {rawRow[cIdx]}
                          </td>
                        );
                      }
                      if (viewStep === 'log') {
                        return (
                          <td key={name} className="py-2.5 px-3 text-right text-cyan-300">
                            {logRow[cIdx].toFixed(3)}
                          </td>
                        );
                      }
                      if (viewStep === 'scaled') {
                        const val = scaledRow[cIdx];
                        return (
                          <td
                            key={name}
                            className={`py-2.5 px-3 text-right font-bold ${
                              val > 0 ? 'text-emerald-300' : 'text-rose-300'
                            }`}
                          >
                            {val.toFixed(3)}
                          </td>
                        );
                      }

                      // View all: show formatted composite
                      return (
                        <td key={name} className="py-2 px-3 text-right">
                          <span className="text-[11px] text-slate-400">{rawRow[cIdx]}</span>
                          <span className="text-[10px] text-slate-600 mx-1">→</span>
                          <span
                            className={`text-[11px] font-bold ${
                              scaledRow[cIdx] > 0 ? 'text-emerald-400' : 'text-slate-300'
                            }`}
                          >
                            {scaledRow[cIdx].toFixed(2)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Matriz preprocesada con éxito: {processed.scaledMatrix.length} filas ×{' '}
          {processed.featureNames.length} variables estandarizadas listas para K-Means.
        </p>
      </div>

    </div>
  );
};
