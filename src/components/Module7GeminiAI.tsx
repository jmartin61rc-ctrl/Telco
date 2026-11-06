import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  RefreshCw,
  TrendingUp,
  Target,
  ShieldCheck,
  Megaphone,
  Briefcase,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import { GeminiInterpretation, ClusterProfile } from '../types/segmentation';

interface Module7GeminiAIProps {
  interpretation: GeminiInterpretation | null;
  profiles: ClusterProfile[];
  onRegenerate: () => Promise<void>;
  isLoading: boolean;
}

export const Module7GeminiAI: React.FC<Module7GeminiAIProps> = ({
  interpretation,
  profiles,
  onRegenerate,
  isLoading,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopySummary = () => {
    if (!interpretation) return;
    const textToCopy = `RESUMEN EJECUTIVO DE SEGMENTACIÓN TELCO (GEMINI AI)
${interpretation.executiveSummary}

INSIGHTS COMPARATIVOS:
${interpretation.comparativeInsights.map((ins, i) => `${i + 1}. ${ins}`).join('\n')}

ESTRATEGIAS POR CLUSTER:
${interpretation.clusterProfiles
  .map(
    (p) =>
      `• Cluster ${p.clusterId + 1}: ${p.title}
   Marketing: ${p.marketingStrategy}
   Comercial: ${p.commercialStrategy}
   Fidelización: ${p.loyaltyAndRetention}
   Acción Prioritaria: ${p.priorityAction}`
  )
  .join('\n\n')}
`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!interpretation) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-4">
        <Brain className="w-12 h-12 text-blue-400 mx-auto animate-pulse" />
        <h2 className="text-base font-bold text-white">Interpretación Gemini AI Pendiente</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Genera el informe estratégico automatizado analizando centroides, pesos de variables y dinámicas de churn.
        </p>
        <button
          onClick={onRegenerate}
          disabled={isLoading}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isLoading ? 'Analizando con Gemini...' : 'Generar Análisis con Gemini'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Executive Hero Summary Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-800/60 rounded-xl p-6 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-blue-400" />
                <span>Google Gemini 3.8 Flash Enterprise</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {interpretation.isAiGenerated ? 'Respuesta en Vivo de Gemini API' : 'Generador Estratégico Heurístico'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Resumen Ejecutivo para Gerencia General & CMO
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
            </button>

            <button
              onClick={onRegenerate}
              disabled={isLoading}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Analizando...' : 'Regenerar con IA'}</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-200 mt-4 leading-relaxed font-sans max-w-4xl bg-slate-950/70 p-4 rounded-xl border border-slate-800">
          {interpretation.executiveSummary}
        </p>

        {/* Comparative Insights Bullet List */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Observaciones Comparativas Clave
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
            {interpretation.comparativeInsights.map((insight, idx) => (
              <div
                key={idx}
                className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2"
              >
                <span className="text-cyan-400 font-bold font-mono text-xs">#{idx + 1}</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cluster Specific Strategic Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          Estrategias Tácticas por Segmento de Clientes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {interpretation.clusterProfiles.map((cp, idx) => (
            <div
              key={cp.clusterId}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 hover:border-slate-700 transition-colors"
            >
              
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider">
                    Segmento {cp.clusterId + 1}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">{cp.title}</h3>
                </div>
                <span className="px-2.5 py-1 rounded bg-slate-950 text-slate-300 text-xs font-mono border border-slate-800">
                  {profiles[idx]?.percentage || 0}% de la base
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{cp.description}</p>

              {/* 3 Strategy Pillars */}
              <div className="space-y-2.5 text-xs">
                
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                  <div className="text-[11px] font-bold text-blue-400 flex items-center gap-1.5 mb-1">
                    <Megaphone className="w-3.5 h-3.5" /> Estrategia de Marketing & Promoción
                  </div>
                  <p className="text-slate-300 leading-normal">{cp.marketingStrategy}</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                  <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                    <Briefcase className="w-3.5 h-3.5" /> Estrategia Comercial & Canales
                  </div>
                  <p className="text-slate-300 leading-normal">{cp.commercialStrategy}</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                  <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Fidelización & Mitigación de Churn
                  </div>
                  <p className="text-slate-300 leading-normal">{cp.loyaltyAndRetention}</p>
                </div>

              </div>

              {/* Priority Action Highlight */}
              <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/40 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block mb-0.5">
                  Acción Prioritaria Inmediata
                </span>
                <span className="text-slate-200 font-medium">{cp.priorityAction}</span>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Strategic Implementation Roadmap */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-400" />
          Hoja de Ruta de Implementación para el Equipo Comercial
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {interpretation.strategicRoadmap.map((road, idx) => (
            <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="px-2 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-800/40 font-mono text-[11px] font-bold">
                {road.phase}
              </span>
              <p className="text-xs font-semibold text-white pt-1">{road.action}</p>
              <p className="text-[11px] text-emerald-400 font-medium">
                Impacto esperado: <span className="text-slate-300">{road.expectedImpact}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
