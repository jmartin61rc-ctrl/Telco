import React, { useRef } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  Database,
  ExternalLink,
  Sparkles,
  RefreshCw,
  GitBranch,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { TelcoRecord } from '../types/segmentation';

interface HeaderProps {
  currentDatasetName: string;
  onSelectDataset: (name: 'cell' | 'sim2d' | 'usarrests') => void;
  onCustomDataLoaded: (data: TelcoRecord[], filename: string) => void;
  recordsCount: number;
  kValue: number;
  varianceExplained: number;
  onOpenDeploymentModal: () => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
  onRecalculate: () => void;
  isCalculating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentDatasetName,
  onSelectDataset,
  onCustomDataLoaded,
  recordsCount,
  kValue,
  varianceExplained,
  onOpenDeploymentModal,
  onExportExcel,
  onExportPDF,
  onRecalculate,
  isCalculating,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const json = XLSX.utils.sheet_to_json(ws) as any[];

        if (json.length === 0) {
          alert('El archivo está vacío.');
          return;
        }

        // Map and validate columns
        const parsed: TelcoRecord[] = json.map((row, idx) => {
          const fij = Number(row.fijo || row.Fijo || 0);
          const ld = Number(row.largadistancia || row.LargaDistancia || row.largadist || 0);
          const ic = Number(row.internetcasa || row.InternetCasa || 0);
          const no = Number(row.numoculto || row.NumOculto || 0);
          const servicios =
            row.servicios !== undefined ? Number(row.servicios) : fij + ld + ic + no;

          return {
            id: row.id || idx + 1,
            region: Number(row.region || 1),
            edad: Number(row.edad || row.Age || 35),
            estadocivil: Number(row.estadocivil || 0),
            jubilado: Number(row.jubilado || 0),
            genero: Number(row.genero || 0),
            fijo: fij,
            largadistancia: ld,
            internetcasa: ic,
            numoculto: no,
            minutos_preferido: Number(row.minutos_preferido || row.Minutos_Preferido || 200),
            minutos_no_preferido: Number(row.minutos_no_preferido || row.Minutos_No_Preferido || 50),
            adicionales: Number(row.adicionales || row.Adicionales || 5),
            internet_gigas: Number(row.internet_gigas || row.Internet_Gigas || 10),
            equipo_dolares: Number(row.equipo_dolares || row.Equipo_Dolares || 300),
            ingresos: Number(row.ingresos || row.Ingresos || 40),
            servicios,
          };
        });

        onCustomDataLoaded(parsed, file.name);
      } catch (err: any) {
        alert('Error al leer el archivo Excel: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950 text-white sticky top-0 z-40 backdrop-blur-md bg-opacity-95 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
          
          {/* Brand & Title */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/30">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                  Telco Segmenter Pro
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    R Pipeline & Gemini AI
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                K-Means clustering, Elbow, Silhouette, Gap Statistic, <code className="text-cyan-300 font-mono text-[11px]">clusplot()</code> & <code className="text-emerald-300 font-mono text-[11px]">clusterboot()</code>
              </p>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="hidden xl:flex items-center space-x-2 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
              <span className="text-slate-400">Dataset:</span>
              <span className="font-semibold text-slate-200">{currentDatasetName}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
              <span className="text-slate-400">Muestra:</span>
              <span className="font-semibold text-emerald-400">{recordsCount.toLocaleString()} filas</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
              <span className="text-slate-400">K:</span>
              <span className="font-semibold text-cyan-400">{kValue} clusters</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
              <span className="text-slate-400">Varianza Explicada:</span>
              <span className="font-semibold text-indigo-400">{varianceExplained}%</span>
            </div>
          </div>

          {/* Dataset Switcher & Actions */}
          <div className="flex items-center flex-wrap gap-2">
            
            {/* Dataset Selector Dropdown */}
            <div className="relative">
              <select
                aria-label="Seleccionar conjunto de datos"
                className="bg-slate-900 hover:bg-slate-850 text-slate-200 text-xs font-medium py-2 px-3 pr-8 rounded-lg border border-slate-750 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'upload') {
                    fileInputRef.current?.click();
                  } else {
                    onSelectDataset(val as any);
                  }
                }}
              >
                <option value="cell">📊 Caso 1: cellsegmentation.xlsx (1,000 telco)</option>
                <option value="sim2d">🟢 Caso 2: Datos Simulados 2D (Benchmark)</option>
                <option value="usarrests">🏛️ Caso 3: USArrests (Benchmark R)</option>
                <option value="upload">📂 Cargar archivo Excel/CSV propio...</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                ▼
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />

            {/* Recalculate button */}
            <button
              onClick={onRecalculate}
              disabled={isCalculating}
              className="p-2 bg-slate-850 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-750 transition-colors disabled:opacity-50"
              title="Recalcular modelo"
            >
              <RefreshCw className={`w-4 h-4 ${isCalculating ? 'animate-spin text-blue-400' : ''}`} />
            </button>

            {/* Quick Export Menu */}
            <button
              onClick={onExportExcel}
              className="inline-flex items-center gap-1 px-3 py-2 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 text-xs font-medium rounded-lg transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Excel</span>
            </button>

            <button
              onClick={onExportPDF}
              className="inline-flex items-center gap-1 px-3 py-2 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-medium rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF</span>
            </button>

            {/* Vercel & GitHub Guide */}
            <button
              onClick={onOpenDeploymentModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>GitHub / Vercel</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
