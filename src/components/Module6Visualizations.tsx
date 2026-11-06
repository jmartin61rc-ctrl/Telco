import React, { useState } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import {
  Eye,
  PieChart,
  Grid,
  Compass,
  Maximize2,
  Box,
  Layers,
} from 'lucide-react';
import {
  TelcoRecord,
  KMeansModelResult,
  ClusterProfile,
  ProcessedDataset,
} from '../types/segmentation';
import { CLUSTERING_VARS } from '../services/clusteringEngine';

interface Module6VisualizationsProps {
  data: TelcoRecord[];
  model: KMeansModelResult;
  profiles: ClusterProfile[];
  processed: ProcessedDataset;
}

const CLUSTER_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
];

export const Module6Visualizations: React.FC<Module6VisualizationsProps> = ({
  data,
  model,
  profiles,
  processed,
}) => {
  const [activeTab, setActiveTab] = useState<'clusplot' | 'scatter' | 'heatmap' | 'boxplots' | 'radar'>('clusplot');
  const [scatterX, setScatterX] = useState<string>('ingresos');
  const [scatterY, setScatterY] = useState<string>('minutos_preferido');
  const [boxVar, setBoxVar] = useState<string>('edad');

  // Subsample data if n > 400 for silky-smooth SVG rendering
  const displaySample = data.length > 500 ? data.filter((_, i) => i % 2 === 0) : data;

  // Prepare PCA clusplot points
  const pcaPoints = model.pcaCoords.map((c, idx) => ({
    x: c.x,
    y: c.y,
    cluster: c.cluster,
    id: c.id,
    color: CLUSTER_COLORS[c.cluster % CLUSTER_COLORS.length],
  }));

  // Group PCA points by cluster to calculate bivariate ellipses/hulls
  const clusterEllipses = profiles.map((p) => {
    const pts = pcaPoints.filter((pt) => pt.cluster === p.clusterId);
    if (pts.length === 0) return null;
    const meanX = pts.reduce((sum, pt) => sum + pt.x, 0) / pts.length;
    const meanY = pts.reduce((sum, pt) => sum + pt.y, 0) / pts.length;
    const stdX = Math.sqrt(pts.reduce((sum, pt) => sum + Math.pow(pt.x - meanX, 2), 0) / pts.length) || 1;
    const stdY = Math.sqrt(pts.reduce((sum, pt) => sum + Math.pow(pt.y - meanY, 2), 0) / pts.length) || 1;

    return {
      clusterId: p.clusterId,
      name: p.name,
      meanX,
      meanY,
      rx: stdX * 1.8, // 1.8 standard deviations covering ~90% density
      ry: stdY * 1.8,
      color: CLUSTER_COLORS[p.clusterId % CLUSTER_COLORS.length],
    };
  }).filter(Boolean);

  // Boxplot quartiles per cluster
  const boxplotData = profiles.map((p) => {
    const members = data.filter((_, i) => model.clusterAssignments[i] === p.clusterId);
    const vals = members.map((m) => Number(m[boxVar]) || 0).sort((a, b) => a - b);
    const count = vals.length;
    if (count === 0) return null;

    const min = vals[0];
    const max = vals[count - 1];
    const q25 = vals[Math.floor(count * 0.25)];
    const median = vals[Math.floor(count * 0.5)];
    const q75 = vals[Math.floor(count * 0.75)];

    return {
      clusterName: `C${p.clusterId + 1}: ${p.name.split(' ')[0]}`,
      clusterId: p.clusterId,
      min,
      q25,
      median,
      q75,
      max,
      iqr: q75 - q25,
      color: CLUSTER_COLORS[p.clusterId % CLUSTER_COLORS.length],
    };
  }).filter(Boolean);

  // Radar multi-cluster dataset
  const radarAxes = ['Minutos', 'Datos (GB)', 'Equipo ($)', 'Servicios', 'Ingresos', 'Adicionales'];
  const radarData = radarAxes.map((axis) => {
    const item: any = { axis };
    profiles.forEach((p) => {
      const match = p.radarScores.find((r) => r.axis === axis);
      item[`Cluster ${p.clusterId + 1}`] = match ? match.value : 0;
    });
    return item;
  });

  return (
    <div className="space-y-6">
      
      {/* Visualizer Mode Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('clusplot')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'clusplot'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>1. Clusplot (PCA 2D en R)</span>
          </button>

          <button
            onClick={() => setActiveTab('scatter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'scatter'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>2. Scatter Plot Multivariable</span>
          </button>

          <button
            onClick={() => setActiveTab('heatmap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'heatmap'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3. Heatmap de Centroides</span>
          </button>

          <button
            onClick={() => setActiveTab('boxplots')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'boxplots'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>4. Boxplots por Cluster</span>
          </button>

          <button
            onClick={() => setActiveTab('radar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'radar'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>5. Radar Spider Chart</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-400 hidden md:block">
          {data.length} observaciones analizadas
        </span>
      </div>

      {/* TAB 1: CLUSPLOT (PCA PROJECTION 2D WITH BIVARIATE NORMAL CONCENTRATION ELLIPSES) */}
      {activeTab === 'clusplot' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                Clusplot - Proyección PCA 2D y Elipses de Concentración
              </h2>
              <p className="text-xs text-slate-400">
                Replicación fiel de <code className="text-cyan-300 font-mono">cluster::clusplot()</code> en R.
                Las dos primeras componentes principales explican el{' '}
                <span className="text-cyan-300 font-bold font-mono">
                  {(model.pcaVariance[0] + model.pcaVariance[1]).toFixed(1)}%
                </span>{' '}
                de la variabilidad total.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="px-2 py-1 rounded bg-slate-950 text-blue-300 border border-slate-800">
                PC1: {model.pcaVariance[0]}%
              </span>
              <span className="px-2 py-1 rounded bg-slate-950 text-emerald-300 border border-slate-800">
                PC2: {model.pcaVariance[1]}%
              </span>
            </div>
          </div>

          <div className="h-96 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Componente 1 (PC1)"
                  stroke="#94a3b8"
                  fontSize={11}
                  unit=" sd"
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Componente 2 (PC2)"
                  stroke="#94a3b8"
                  fontSize={11}
                  unit=" sd"
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  formatter={(val: any, name: any) => [Number(val).toFixed(2), name]}
                  labelFormatter={() => 'Cliente Proyectado'}
                />
                {profiles.map((p) => {
                  const pts = pcaPoints.filter((pt) => pt.cluster === p.clusterId);
                  return (
                    <Scatter
                      key={p.clusterId}
                      name={`Cluster ${p.clusterId + 1}: ${p.name}`}
                      data={pts}
                      fill={CLUSTER_COLORS[p.clusterId % CLUSTER_COLORS.length]}
                      opacity={0.7}
                    />
                  );
                })}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Legend and explanation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
            {profiles.map((p) => (
              <div key={p.clusterId} className="flex items-center space-x-2 text-xs">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CLUSTER_COLORS[p.clusterId % CLUSTER_COLORS.length] }}
                />
                <span className="text-slate-300 truncate">
                  Cluster {p.clusterId + 1}: {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SCATTER PLOT MULTIVARIABLE */}
      {activeTab === 'scatter' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Grid className="w-4 h-4 text-blue-400" />
                Scatter Plot Bivariado con Segmentos Coloreados
              </h2>
              <p className="text-xs text-slate-400">
                Selecciona cualquier par de variables para inspeccionar la dispersión real de clientes
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Eje X:</span>
                <select
                  aria-label="Seleccionar variable para Eje X"
                  value={scatterX}
                  onChange={(e) => setScatterX(e.target.value)}
                  className="bg-slate-950 text-slate-200 border border-slate-700 rounded p-1 text-xs"
                >
                  <option value="ingresos">Ingresos ($k)</option>
                  <option value="edad">Edad</option>
                  <option value="equipo_dolares">Equipo ($)</option>
                  <option value="minutos_preferido">Minutos Preferido</option>
                  <option value="internet_gigas">Internet (GB)</option>
                  <option value="servicios">Servicios (0-4)</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Eje Y:</span>
                <select
                  aria-label="Seleccionar variable para Eje Y"
                  value={scatterY}
                  onChange={(e) => setScatterY(e.target.value)}
                  className="bg-slate-950 text-slate-200 border border-slate-700 rounded p-1 text-xs"
                >
                  <option value="minutos_preferido">Minutos Preferido</option>
                  <option value="internet_gigas">Internet (GB)</option>
                  <option value="equipo_dolares">Equipo ($)</option>
                  <option value="ingresos">Ingresos ($k)</option>
                  <option value="edad">Edad</option>
                  <option value="servicios">Servicios (0-4)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis type="number" dataKey={scatterX} name={scatterX} stroke="#94a3b8" fontSize={11} />
                <YAxis type="number" dataKey={scatterY} name={scatterY} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  formatter={(val: any, name: any) => [`${val}`, name]}
                />
                {profiles.map((p) => {
                  const pts = displaySample.filter(
                    (_, i) => model.clusterAssignments[i] === p.clusterId
                  );
                  return (
                    <Scatter
                      key={p.clusterId}
                      name={`Cluster ${p.clusterId + 1}: ${p.name}`}
                      data={pts}
                      fill={CLUSTER_COLORS[p.clusterId % CLUSTER_COLORS.length]}
                      opacity={0.75}
                    />
                  );
                })}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB 3: HEATMAP DE CENTROIDES */}
      {activeTab === 'heatmap' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Heatmap de Centroides Estandarizados (Z-Score)
            </h2>
            <p className="text-xs text-slate-400">
              Valores relativos respecto a la media global: Verde = Superior al promedio (+Z), Rojo = Inferior al promedio (-Z)
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="py-3 px-4 text-left font-sans text-slate-400">Cluster / Segmento</th>
                  {processed.featureNames.map((feat) => (
                    <th key={feat} className="py-3 px-3 uppercase text-[10px] text-slate-300">
                      {feat}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {model.centroidsScaled.map((row, cIdx) => (
                  <tr key={cIdx} className="border-b border-slate-800/60">
                    <td className="py-3 px-4 text-left font-sans font-bold text-white flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CLUSTER_COLORS[cIdx % CLUSTER_COLORS.length] }}
                      />
                      <span>Cluster {cIdx + 1}: {profiles[cIdx]?.name || ''}</span>
                    </td>
                    {row.map((zVal, fIdx) => {
                      // Intensity from -2 to +2
                      const clamped = Math.max(-2, Math.min(2, zVal));
                      let bg = 'rgba(30, 41, 59, 0.6)';
                      let textColor = '#cbd5e1';

                      if (clamped > 0.3) {
                        const alpha = Math.min(0.85, 0.2 + (clamped / 2) * 0.65);
                        bg = `rgba(16, 185, 129, ${alpha})`;
                        textColor = '#ffffff';
                      } else if (clamped < -0.3) {
                        const alpha = Math.min(0.85, 0.2 + (Math.abs(clamped) / 2) * 0.65);
                        bg = `rgba(239, 68, 68, ${alpha})`;
                        textColor = '#ffffff';
                      }

                      return (
                        <td
                          key={fIdx}
                          style={{ backgroundColor: bg, color: textColor }}
                          className="py-3 px-3 font-bold transition-all hover:ring-2 hover:ring-white/40"
                          title={`Z = ${zVal.toFixed(3)} | Original: ${model.centroidsOriginal[cIdx][fIdx].toFixed(1)}`}
                        >
                          {zVal > 0 ? `+${zVal.toFixed(2)}` : zVal.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-600/70 inline-block" /> Muy por debajo de la media (-Z)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-800 inline-block" /> En el promedio global (Z ≈ 0)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-600/70 inline-block" /> Muy por encima de la media (+Z)
            </span>
          </div>
        </div>
      )}

      {/* TAB 4: BOXPLOTS POR CLUSTER */}
      {activeTab === 'boxplots' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Box className="w-4 h-4 text-amber-400" />
                Boxplots & Comparativa de Distribución por Cluster
              </h2>
              <p className="text-xs text-slate-400">
                Visualización de mediana, rango intercuartílico (Q1-Q3) y rango total por grupo
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Variable a comparar:</span>
              <select
                aria-label="Seleccionar variable a comparar"
                value={boxVar}
                onChange={(e) => setBoxVar(e.target.value)}
                className="bg-slate-950 text-slate-200 border border-slate-700 rounded-lg p-1.5 text-xs font-semibold focus:ring-1 focus:ring-blue-500"
              >
                <option value="edad">Edad (Años)</option>
                <option value="ingresos">Ingreso Mensual ($k)</option>
                <option value="minutos_preferido">Minutos Preferidos</option>
                <option value="servicios">Servicios (0-4)</option>
                <option value="equipo_dolares">Valor Equipo ($)</option>
                <option value="internet_gigas">Internet Consumido (GB)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {boxplotData.map((b) => {
              if (!b) return null;
              return (
                <div key={b.clusterId} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                      Cluster {b.clusterId + 1}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{boxVar}</span>
                  </div>

                  {/* Visual box representation */}
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Máximo:</span>
                      <span className="text-slate-200 font-bold">{b.max}</span>
                    </div>
                    <div className="flex justify-between text-slate-300 bg-slate-900 p-1.5 rounded border border-slate-800">
                      <span>Q75 (Percentil 75):</span>
                      <span className="font-bold text-blue-300">{b.q75}</span>
                    </div>
                    <div className="flex justify-between text-white bg-blue-950/60 p-2 rounded border border-blue-800/40 font-bold">
                      <span className="text-blue-300 font-sans">Mediana:</span>
                      <span className="text-cyan-300">{b.median}</span>
                    </div>
                    <div className="flex justify-between text-slate-300 bg-slate-900 p-1.5 rounded border border-slate-800">
                      <span>Q25 (Percentil 25):</span>
                      <span className="font-bold text-blue-300">{b.q25}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Mínimo:</span>
                      <span className="text-slate-200 font-bold">{b.min}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                      <span>Rango IQR:</span>
                      <span>{b.iqr}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: RADAR CHARTS */}
      {activeTab === 'radar' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-400" />
              Radar Chart Multidimensional de Segmentos
            </h2>
            <p className="text-xs text-slate-400">
              Comparativa sobre 6 ejes estratégicos normalizados (Escala 0 a 100)
            </p>
          </div>

          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="axis" stroke="#cbd5e1" fontSize={11} />
                <PolarRadiusAxis stroke="#64748b" angle={30} domain={[0, 100]} fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Legend />
                {profiles.map((p) => (
                  <Radar
                    key={p.clusterId}
                    name={`Cluster ${p.clusterId + 1}: ${p.name}`}
                    dataKey={`Cluster ${p.clusterId + 1}`}
                    stroke={CLUSTER_COLORS[p.clusterId % CLUSTER_COLORS.length]}
                    fill={CLUSTER_COLORS[p.clusterId % CLUSTER_COLORS.length]}
                    fillOpacity={0.25}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  );
};
