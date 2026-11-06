import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Database,
  Layers,
  TrendingUp,
  Target,
  Users,
  Compass,
  Brain,
  ShieldCheck,
  Download,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

import { Header } from './components/Header';
import { Module1Exploration } from './components/Module1Exploration';
import { Module2Preparation } from './components/Module2Preparation';
import { Module3OptimalClusters } from './components/Module3OptimalClusters';
import { Module4KMeans } from './components/Module4KMeans';
import { Module5Profiling } from './components/Module5Profiling';
import { Module6Visualizations } from './components/Module6Visualizations';
import { Module7GeminiAI } from './components/Module7GeminiAI';
import { Module8Validation } from './components/Module8Validation';
import { Module9Export } from './components/Module9Export';
import { DeploymentModal } from './components/DeploymentModal';

import { TelcoRecord, GeminiInterpretation } from './types/segmentation';
import { initialCellSegmentationData } from './data/cellSegmentationDataset';
import { generate2DSimulatedData } from './data/simulated2dDataset';
import { getUSArrestsAsTelco } from './data/usArrestsDataset';

import {
  computeSummaryStatistics,
  prepareData,
  computeOptimalKCurve,
  executeFullSegmentation,
  generateClusterProfiles,
  computeClusterboot,
  recommendOptimalK,
} from './services/clusteringEngine';
import { requestGeminiInterpretation, generateOfflineInterpretation } from './services/geminiClient';
import { exportToExcel, exportExecutivePDF } from './services/exportService';

export default function App() {
  // Dataset state
  const [datasetKey, setDatasetKey] = useState<'cell' | 'sim2d' | 'usarrests' | 'custom'>('cell');
  const [datasetName, setDatasetName] = useState<string>('cellsegmentation.xlsx (1,000 telco)');
  const [rawData, setRawData] = useState<TelcoRecord[]>(initialCellSegmentationData);

  // Hyperparameters
  const [kValue, setKValue] = useState<number>(3);
  const [seed, setSeed] = useState<number>(42);
  const [maxIterations, setMaxIterations] = useState<number>(100);

  // Active module tab
  const [activeModule, setActiveModule] = useState<number>(1);

  // AI & Async states
  const [interpretation, setInterpretation] = useState<GeminiInterpretation | null>(null);
  const [isGeminiLoading, setIsGeminiLoading] = useState<boolean>(false);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState<boolean>(false);

  // Compute Exploratory Stats & Data Preparation
  const summaryStats = useMemo(() => computeSummaryStatistics(rawData), [rawData]);
  const processed = useMemo(() => prepareData(rawData), [rawData]);

  // Optimal K curve (K=1 to 10)
  const curveResults = useMemo(
    () => computeOptimalKCurve(processed.scaledMatrix, 10, seed),
    [processed.scaledMatrix, seed]
  );

  // Run full clustering model
  const model = useMemo(
    () => executeFullSegmentation(processed, kValue, seed, maxIterations),
    [processed, kValue, seed, maxIterations]
  );

  // Cluster profiles
  const profiles = useMemo(
    () => generateClusterProfiles(processed.original, model.clusterAssignments, kValue),
    [processed.original, model.clusterAssignments, kValue]
  );

  // Bootstrap validation (clusterboot)
  const [bootstraps, setBootstraps] = useState(() =>
    computeClusterboot(processed.scaledMatrix, kValue, 50, seed)
  );

  // Update bootstraps when model changes
  useEffect(() => {
    const updated = computeClusterboot(processed.scaledMatrix, kValue, 50, seed);
    setBootstraps(updated);
  }, [processed.scaledMatrix, kValue, seed]);

  // Initial interpretation generation
  useEffect(() => {
    // Generate initial interpretation using offline heuristic immediately, then attempt Gemini
    const initialInterp = generateOfflineInterpretation(profiles, model);
    setInterpretation(initialInterp);
  }, [profiles, model]);

  // Handler to switch preloaded datasets
  const handleSelectDataset = (type: 'cell' | 'sim2d' | 'usarrests') => {
    setIsCalculating(true);
    setTimeout(() => {
      if (type === 'cell') {
        setRawData(initialCellSegmentationData);
        setDatasetName('cellsegmentation.xlsx (1,000 telco)');
        setKValue(3);
      } else if (type === 'sim2d') {
        const simData = generate2DSimulatedData(123);
        setRawData(simData);
        setDatasetName('Datos Simulados 2D (300 obs)');
        setKValue(3);
      } else if (type === 'usarrests') {
        const usData = getUSArrestsAsTelco();
        setRawData(usData);
        setDatasetName('USArrests (50 estados)');
        setKValue(4);
      }
      setDatasetKey(type);
      setIsCalculating(false);
    }, 100);
  };

  // Handler for custom uploaded file
  const handleCustomDataLoaded = (customData: TelcoRecord[], filename: string) => {
    setIsCalculating(true);
    setTimeout(() => {
      setRawData(customData);
      setDatasetName(`Archivo subido: ${filename}`);
      setDatasetKey('custom');
      setIsCalculating(false);
      setActiveModule(1);
    }, 100);
  };

  // Trigger Gemini API call
  const handleRegenerateGemini = async () => {
    setIsGeminiLoading(true);
    try {
      const interp = await requestGeminiInterpretation(profiles, model);
      setInterpretation(interp);
    } catch (err) {
      console.error('Error generando Gemini:', err);
    } finally {
      setIsGeminiLoading(false);
    }
  };

  // Revalidate bootstrap
  const handleRevalidateBootstrap = (resamples: number) => {
    setIsValidating(true);
    setTimeout(() => {
      const res = computeClusterboot(processed.scaledMatrix, kValue, resamples, seed);
      setBootstraps(res);
      setIsValidating(false);
    }, 200);
  };

  // Navigation module list
  const modulesList = [
    { id: 1, name: 'M1: Exploración', icon: Database, desc: 'Descriptivos & Histogramas' },
    { id: 2, name: 'M2: Preparación', icon: Layers, desc: 'log(1+x) & Z-Score' },
    { id: 3, name: 'M3: K Óptimo', icon: TrendingUp, desc: 'Codo, Silhouette & Gap' },
    { id: 4, name: 'M4: K-Means', icon: Target, desc: 'Ajuste, Inercia & WSS' },
    { id: 5, name: 'M5: Perfilamiento', icon: Users, desc: 'Personas & KPIs' },
    { id: 6, name: 'M6: Visualizaciones', icon: Compass, desc: 'clusplot, Heatmap & Radar' },
    { id: 7, name: 'M7: Gemini AI', icon: Brain, desc: 'Resumen Ejecutivo & CMO' },
    { id: 8, name: 'M8: Validación', icon: ShieldCheck, desc: 'clusterboot Jaccard' },
    { id: 9, name: 'M9: Exportación', icon: Download, desc: 'Excel, PDF & Scripts' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Application Header */}
      <Header
        currentDatasetName={datasetName}
        onSelectDataset={handleSelectDataset}
        onCustomDataLoaded={handleCustomDataLoaded}
        recordsCount={rawData.length}
        kValue={kValue}
        varianceExplained={model.varianceExplainedPercent}
        onOpenDeploymentModal={() => setIsDeployModalOpen(true)}
        onExportExcel={() => exportToExcel(rawData, profiles, model)}
        onExportPDF={() => exportExecutivePDF(profiles, model, bootstraps, interpretation)}
        onRecalculate={() => {
          setIsCalculating(true);
          setTimeout(() => setIsCalculating(false), 300);
        }}
        isCalculating={isCalculating}
      />

      {/* Main Tab Navigation Bar */}
      <nav aria-label="Módulos analíticos" className="border-b border-slate-800 bg-slate-900/90 sticky top-15 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none">
            {modulesList.map((m) => {
              const Icon = m.icon;
              const isActive = activeModule === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveModule(m.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{m.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Module Subtitle & Context */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-850">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
                Módulo {activeModule} de 9
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">
                {modulesList.find((m) => m.id === activeModule)?.desc}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              {modulesList.find((m) => m.id === activeModule)?.name}
            </h2>
          </div>

          {/* Quick Module Jump Pill */}
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => setActiveModule((prev) => Math.max(1, prev - 1))}
              disabled={activeModule === 1}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-850 disabled:opacity-30 text-slate-300"
            >
              ← Anterior
            </button>
            <span className="text-slate-400 font-mono text-[11px]">
              {activeModule} / {modulesList.length}
            </span>
            <button
              onClick={() => setActiveModule((prev) => Math.min(modulesList.length, prev + 1))}
              disabled={activeModule === modulesList.length}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-850 disabled:opacity-30 text-slate-300"
            >
              Siguiente →
            </button>
          </div>
        </div>

        {/* Dynamic Module Component Rendering */}
        {activeModule === 1 && (
          <Module1Exploration data={rawData} summaryStats={summaryStats} />
        )}

        {activeModule === 2 && (
          <Module2Preparation processed={processed} />
        )}

        {activeModule === 3 && (
          <Module3OptimalClusters
            curveResults={curveResults}
            activeK={kValue}
            onSelectK={(newK) => setKValue(newK)}
          />
        )}

        {activeModule === 4 && (
          <Module4KMeans
            model={model}
            processed={processed}
            manualK={kValue}
            onKChange={(newK) => setKValue(newK)}
            seed={seed}
            onSeedChange={(newSeed) => setSeed(newSeed)}
            maxIters={maxIterations}
            onMaxItersChange={(newIters) => setMaxIterations(newIters)}
            onRerun={() => {
              setIsCalculating(true);
              setTimeout(() => setIsCalculating(false), 200);
            }}
          />
        )}

        {activeModule === 5 && (
          <Module5Profiling profiles={profiles} />
        )}

        {activeModule === 6 && (
          <Module6Visualizations
            data={rawData}
            model={model}
            profiles={profiles}
            processed={processed}
          />
        )}

        {activeModule === 7 && (
          <Module7GeminiAI
            interpretation={interpretation}
            profiles={profiles}
            onRegenerate={handleRegenerateGemini}
            isLoading={isGeminiLoading}
          />
        )}

        {activeModule === 8 && (
          <Module8Validation
            bootstraps={bootstraps}
            profiles={profiles}
            onRevalidate={handleRevalidateBootstrap}
            isValidating={isValidating}
          />
        )}

        {activeModule === 9 && (
          <Module9Export
            data={rawData}
            profiles={profiles}
            model={model}
            bootstraps={bootstraps}
            interpretation={interpretation}
          />
        )}

      </main>

      {/* Deployment & Git Modal */}
      <DeploymentModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Plataforma Empresarial de Segmentación de Clientes • Replicación exacta del notebook de R
          </p>
          <p className="font-mono text-[11px] text-slate-400">
            K-Means • clusplot() • clusterboot() • Google Gemini AI • Excel Export
          </p>
        </div>
      </footer>

    </div>
  );
}
