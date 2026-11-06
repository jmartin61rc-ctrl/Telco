import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  FileText,
  Code2,
  Copy,
  Check,
  CheckCircle2,
  Terminal,
  ExternalLink,
  Layers,
} from 'lucide-react';
import {
  exportToExcel,
  exportToCSV,
  exportExecutivePDF,
  getRScriptTemplate,
  getPythonScriptTemplate,
} from '../services/exportService';
import {
  TelcoRecord,
  ClusterProfile,
  KMeansModelResult,
  BootstrapClusterResult,
  GeminiInterpretation,
} from '../types/segmentation';

interface Module9ExportProps {
  data: TelcoRecord[];
  profiles: ClusterProfile[];
  model: KMeansModelResult;
  bootstraps: BootstrapClusterResult[];
  interpretation: GeminiInterpretation | null;
}

export const Module9Export: React.FC<Module9ExportProps> = ({
  data,
  profiles,
  model,
  bootstraps,
  interpretation,
}) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'r' | 'python'>('r');
  const [copiedCode, setCopiedCode] = useState(false);

  const rCode = getRScriptTemplate();
  const pyCode = getPythonScriptTemplate();

  const handleCopyCode = () => {
    const text = activeCodeTab === 'r' ? rCode : pyCode;
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* File Downloads Hero Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-100 mb-1 flex items-center gap-2">
          <Download className="w-4 h-4 text-blue-400" />
          Descarga de Resultados & Entregables de Negocio
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Exporta la base completa enriquecida con etiquetas de cluster, métricas de rendimiento e informe PDF
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Excel Export Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-emerald-700/60 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-2">
                <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                  .XLSX
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">cell_segmentado.xlsx</h3>
              <p className="text-xs text-slate-400 mt-1">
                Libro Excel multihistorial con 3 hojas: Clientes Segmentados, Centroides y Métricas del Modelo.
              </p>
            </div>
            <button
              onClick={() => exportToExcel(data, profiles, model)}
              className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Excel</span>
            </button>
          </div>

          {/* CSV Export Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-blue-700/60 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-6 h-6 text-blue-400" />
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/40">
                  .CSV
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">cell_segmentado.csv</h3>
              <p className="text-xs text-slate-400 mt-1">
                Formato plano estándar separado por comas, listo para cargar en SQL, CRM o data warehouses.
              </p>
            </div>
            <button
              onClick={() => exportToCSV(data, model)}
              className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar CSV</span>
            </button>
          </div>

          {/* PDF Report Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-rose-700/60 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Download className="w-6 h-6 text-rose-400" />
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/40">
                  .PDF
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Informe Ejecutivo</h3>
              <p className="text-xs text-slate-400 mt-1">
                Documento ejecutivo con metodología, métricas de varianza, perfiles de buyer persona e informe Gemini.
              </p>
            </div>
            <button
              onClick={() => exportExecutivePDF(profiles, model, bootstraps, interpretation)}
              className="mt-4 w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Generar Informe PDF</span>
            </button>
          </div>

        </div>
      </div>

      {/* Reproducible Code Scripts (R and Python) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              Scripts de Reproducibilidad en R y Python
            </h2>
            <p className="text-xs text-slate-400">
              Código completo y verificado para ejecutar exactamente este pipeline en RStudio o Jupyter Notebook
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setActiveCodeTab('r')}
                className={`px-3 py-1 rounded font-medium ${
                  activeCodeTab === 'r' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                R (Script Original)
              </button>
              <button
                onClick={() => setActiveCodeTab('python')}
                className={`px-3 py-1 rounded font-medium ${
                  activeCodeTab === 'python' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Python (Scikit-Learn)
              </button>
            </div>

            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? '¡Copiado!' : 'Copiar Código'}</span>
            </button>
          </div>
        </div>

        <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
          <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>{activeCodeTab === 'r' ? 'pipeline_clustering.R' : 'pipeline_clustering.py'}</span>
            <span className="text-slate-500">UTF-8 • Listo para producción</span>
          </div>
          <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-96 leading-relaxed">
            <code>{activeCodeTab === 'r' ? rCode : pyCode}</code>
          </pre>
        </div>
      </div>

    </div>
  );
};
