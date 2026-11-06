import React, { useState } from 'react';
import {
  Table,
  Search,
  AlertCircle,
  BarChart2,
  Filter,
  CheckCircle2,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TelcoRecord, SummaryStat } from '../types/segmentation';
import { computeHistogram, LOG_TRANSFORM_VARS } from '../services/clusteringEngine';

interface Module1ExplorationProps {
  data: TelcoRecord[];
  summaryStats: SummaryStat[];
}

export const Module1Exploration: React.FC<Module1ExplorationProps> = ({ data, summaryStats }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHistVar, setSelectedHistVar] = useState<string>('minutos_preferido');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Filter records
  const filteredData = data.filter((row) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      String(row.id).includes(term) ||
      String(row.edad).includes(term) ||
      String(row.ingresos).includes(term) ||
      String(row.minutos_preferido).includes(term)
    );
  });

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const pageData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  // Histogram data for selected variable
  const histValues = data.map((d) => Number(d[selectedHistVar])).filter((v) => !isNaN(v));
  const histogramBins = computeHistogram(histValues, 10);

  const totalOutliers = summaryStats.reduce((acc, s) => acc + s.outliersCount, 0);

  return (
    <div className="space-y-6">
      
      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <p className="text-xs font-medium text-slate-400">Total de Registros</p>
          <p className="text-2xl font-bold text-white mt-1">{data.length.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% registros listos para análisis
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <p className="text-xs font-medium text-slate-400">Variables en Base</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">16 Columnas</p>
          <p className="text-[11px] text-slate-400 mt-1">6 para clustering + demográficas</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <p className="text-xs font-medium text-slate-400">Valores Faltantes (NA)</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">0 (0.0%)</p>
          <p className="text-[11px] text-slate-400 mt-1">Base completa y consistente</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <p className="text-xs font-medium text-slate-400">Anomalías Detectadas (IQR)</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{totalOutliers}</p>
          <p className="text-[11px] text-slate-400 mt-1">Tratadas vía log(1+x) y Z-Score</p>
        </div>
      </div>

      {/* Grid: Statistics Table & Histogram Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Descriptive Statistics Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Table className="w-4 h-4 text-blue-400" />
                Descriptivos Estadísticos de Variables Numéricas
              </h2>
              <p className="text-xs text-slate-400">
                Media, mediana, desviación estándar, percentiles, asimetría y conteo de atípicos
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              R summary()
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Variable</th>
                  <th className="py-2.5 px-2 text-right">Media</th>
                  <th className="py-2.5 px-2 text-right">Mediana</th>
                  <th className="py-2.5 px-2 text-right">Std Dev</th>
                  <th className="py-2.5 px-2 text-right">Mín</th>
                  <th className="py-2.5 px-2 text-right">Q25</th>
                  <th className="py-2.5 px-2 text-right">Q75</th>
                  <th className="py-2.5 px-2 text-right">Máx</th>
                  <th className="py-2.5 px-2 text-right">Asimetría</th>
                  <th className="py-2.5 px-2 text-right">Outliers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {summaryStats.map((st) => (
                  <tr key={st.variable} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-2 px-3 font-sans font-semibold text-slate-200">
                      {st.variable}
                    </td>
                    <td className="py-2 px-2 text-right text-blue-300">{st.mean}</td>
                    <td className="py-2 px-2 text-right text-slate-300">{st.median}</td>
                    <td className="py-2 px-2 text-right text-slate-400">{st.std}</td>
                    <td className="py-2 px-2 text-right text-slate-400">{st.min}</td>
                    <td className="py-2 px-2 text-right text-slate-400">{st.q25}</td>
                    <td className="py-2 px-2 text-right text-slate-400">{st.q75}</td>
                    <td className="py-2 px-2 text-right text-slate-400">{st.max}</td>
                    <td className="py-2 px-2 text-right">
                      <span className={Math.abs(st.skewness) > 1 ? 'text-amber-400' : 'text-slate-400'}>
                        {st.skewness}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] ${
                          st.outliersCount > 0
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                            : 'text-slate-500'
                        }`}
                      >
                        {st.outliersCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Interactive Histogram Generator */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                Histograma Automático
              </h2>
            </div>

            {/* Variable selector */}
            <div className="mb-4">
              <label className="text-[11px] text-slate-400 block mb-1 font-medium">
                Seleccionar variable para graficar distribución:
              </label>
              <select
                aria-label="Seleccionar variable para graficar distribución"
                value={selectedHistVar}
                onChange={(e) => setSelectedHistVar(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 border border-slate-700 text-xs rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {summaryStats.map((st) => (
                  <option key={st.variable} value={st.variable}>
                    {st.variable} (media: {st.mean}, max: {st.max})
                  </option>
                ))}
              </select>
            </div>

            {/* Histogram chart */}
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histogramBins} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis
                    dataKey="bin"
                    stroke="#94a3b8"
                    fontSize={10}
                    interval={1}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Frecuencia" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400">
            <span className="text-slate-300 font-semibold block mb-0.5">Diagnóstico de Distribución:</span>
            {LOG_TRANSFORM_VARS.includes(selectedHistVar)
              ? 'Presenta marcada asimetría positiva típica de telecomunicaciones. La transformación log(1+x) en el Módulo 2 estabiliza la varianza para el clustering.'
              : 'Distribución multimodal o regular apta para estandarización Z-score directa.'}
          </div>
        </div>

      </div>

      {/* Bottom Table: Raw Data Preview with Search & Pagination */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-400" />
              Vista Previa de la Estructura de Datos
            </h2>
            <p className="text-xs text-slate-400">
              Mostrando registros de la base cargada (página {page} de {totalPages})
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por ID, edad, ingresos..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 text-slate-200 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-750 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2 px-2.5">ID</th>
                <th className="py-2 px-2">Región</th>
                <th className="py-2 px-2">Edad</th>
                <th className="py-2 px-2">Est. Civil</th>
                <th className="py-2 px-2">Jubilado</th>
                <th className="py-2 px-2">Género</th>
                <th className="py-2 px-2">Servicios</th>
                <th className="py-2 px-2 text-right">Min. Pref</th>
                <th className="py-2 px-2 text-right">Min. No Pref</th>
                <th className="py-2 px-2 text-right">Adicionales</th>
                <th className="py-2 px-2 text-right">Internet GB</th>
                <th className="py-2 px-2 text-right">Equipo ($)</th>
                <th className="py-2 px-2 text-right">Ingresos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {pageData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-1.5 px-2.5 font-bold text-slate-400">#{row.id}</td>
                  <td className="py-1.5 px-2 font-sans">{row.region}</td>
                  <td className="py-1.5 px-2">{row.edad}</td>
                  <td className="py-1.5 px-2 font-sans">{row.estadocivil === 1 ? 'Casado' : 'Soltero'}</td>
                  <td className="py-1.5 px-2 font-sans">{row.jubilado === 1 ? 'Sí' : 'No'}</td>
                  <td className="py-1.5 px-2 font-sans">{row.genero === 1 ? 'M' : 'F'}</td>
                  <td className="py-1.5 px-2">
                    <span className="px-1.5 py-0.5 rounded bg-blue-950/70 text-blue-300 border border-blue-800/40 font-bold">
                      {row.servicios}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 text-right text-cyan-300">{row.minutos_preferido}</td>
                  <td className="py-1.5 px-2 text-right text-slate-300">{row.minutos_no_preferido}</td>
                  <td className="py-1.5 px-2 text-right text-slate-300">{row.adicionales}</td>
                  <td className="py-1.5 px-2 text-right text-emerald-300">{row.internet_gigas} GB</td>
                  <td className="py-1.5 px-2 text-right text-amber-300">${row.equipo_dolares}</td>
                  <td className="py-1.5 px-2 text-right text-slate-200">${row.ingresos}k</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400 mt-2">
          <span>
            Mostrando {(page - 1) * pageSize + 1} a{' '}
            {Math.min(page * pageSize, filteredData.length)} de {filteredData.length} registros
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 disabled:opacity-40 text-slate-300"
            >
              Anterior
            </button>
            <span className="px-2 py-1 text-slate-300 font-mono">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 disabled:opacity-40 text-slate-300"
            >
              Siguiente
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
