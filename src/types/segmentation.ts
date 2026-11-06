/**
 * Types and interfaces for the Telco Customer Segmentation platform
 */

export interface TelcoRecord {
  id: number;
  region: number;
  edad: number;
  estadocivil: number; // 0: Soltero, 1: Casado
  jubilado: number; // 0: No, 1: Sí
  genero: number; // 0: Femenino, 1: Masculino
  fijo: number;
  largadistancia: number;
  internetcasa: number;
  numoculto: number;
  minutos_preferido: number;
  minutos_no_preferido: number;
  adicionales: number;
  internet_gigas: number;
  equipo_dolares: number;
  ingresos: number; // en miles de dólares o dólares
  // Derived variables
  servicios?: number;
  cluster?: number;
  [key: string]: any;
}

export interface SummaryStat {
  variable: string;
  count: number;
  missing: number;
  mean: number;
  median: number;
  std: number;
  min: number;
  q25: number;
  q75: number;
  max: number;
  skewness: number;
  outliersCount: number;
}

export interface ProcessedDataset {
  original: TelcoRecord[];
  featureNames: string[];
  rawMatrix: number[][];
  transformedMatrix: number[][]; // log(1+x) applied where specified
  scaledMatrix: number[][]; // Z-score standardized
  means: number[];
  stds: number[];
}

export interface OptimalKResult {
  k: number;
  wss: number; // Within-cluster sum of squares
  silhouette: number; // Silhouette score (-1 to 1)
  gap: number; // Gap statistic
  gapSimMean: number;
  gapSimSd: number;
}

export interface KMeansModelResult {
  k: number;
  seed: number;
  iterations: number;
  converged: boolean;
  clusterAssignments: number[];
  clusterSizes: number[];
  clusterPercentages: number[];
  centroidsScaled: number[][];
  centroidsOriginal: number[][];
  totWithinSS: number;
  withinSS: number[];
  betweenSS: number;
  totSS: number;
  varianceExplainedPercent: number;
  inertia: number;
  pcaCoords: { x: number; y: number; cluster: number; id: number }[];
  pcaVariance: [number, number]; // [PC1 var %, PC2 var %]
}

export interface ClusterProfile {
  clusterId: number;
  name: string;
  label: string;
  size: number;
  percentage: number;
  avgAge: number;
  avgIncome: number;
  avgDeviceVal: number;
  avgServices: number;
  avgPrefMinutes: number;
  avgNonPrefMinutes: number;
  avgInternetGb: number;
  avgAdditional: number;
  dominantGender: string;
  dominantMarital: string;
  retireeRate: number;
  radarScores: { axis: string; value: number }[];
}

export interface BootstrapClusterResult {
  clusterId: number;
  meanJaccard: number;
  stabilityCategory: 'Excelente' | 'Bueno' | 'Aceptable' | 'Débil';
  confidenceScore: number;
  resamples: number;
  description: string;
}

export interface GeminiInterpretation {
  executiveSummary: string;
  clusterProfiles: {
    clusterId: number;
    title: string;
    description: string;
    keyCharacteristics: string[];
    marketingStrategy: string;
    commercialStrategy: string;
    loyaltyAndRetention: string;
    priorityAction: string;
  }[];
  comparativeInsights: string[];
  strategicRoadmap: {
    phase: string;
    action: string;
    expectedImpact: string;
  }[];
  generatedAt: string;
  isAiGenerated: boolean;
}
