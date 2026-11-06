import {
  TelcoRecord,
  SummaryStat,
  ProcessedDataset,
  OptimalKResult,
  KMeansModelResult,
  ClusterProfile,
  BootstrapClusterResult,
} from '../types/segmentation';

// Seeded PRNG
export function createPRNG(seed: number) {
  let s = Math.abs(Math.floor(seed)) % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const CLUSTERING_VARS = [
  'minutos_preferido',
  'adicionales',
  'minutos_no_preferido',
  'internet_gigas',
  'servicios',
  'equipo_dolares',
];

export const LOG_TRANSFORM_VARS = [
  'minutos_preferido',
  'adicionales',
  'minutos_no_preferido',
  'internet_gigas',
];

// --- MÓDULO 1: EXPLORACIÓN DE DATOS ---

export function computeSummaryStatistics(data: TelcoRecord[]): SummaryStat[] {
  if (!data || data.length === 0) return [];

  const numericKeys = [
    'edad',
    'ingresos',
    'minutos_preferido',
    'minutos_no_preferido',
    'adicionales',
    'internet_gigas',
    'equipo_dolares',
    'servicios',
    'region',
  ];

  return numericKeys.map((key) => {
    const rawValues = data.map((d) => Number(d[key])).filter((v) => !isNaN(v) && v !== null);
    const count = rawValues.length;
    const missing = data.length - count;

    if (count === 0) {
      return {
        variable: key,
        count: 0,
        missing: data.length,
        mean: 0,
        median: 0,
        std: 0,
        min: 0,
        q25: 0,
        q75: 0,
        max: 0,
        skewness: 0,
        outliersCount: 0,
      };
    }

    const sorted = [...rawValues].sort((a, b) => a - b);
    const mean = sorted.reduce((sum, v) => sum + v, 0) / count;
    const variance = sorted.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / Math.max(1, count - 1);
    const std = Math.sqrt(variance);

    const median = sorted[Math.floor(count / 2)];
    const q25 = sorted[Math.floor(count * 0.25)];
    const q75 = sorted[Math.floor(count * 0.75)];
    const min = sorted[0];
    const max = sorted[count - 1];

    // Outlier count via IQR rule: [Q1 - 1.5*IQR, Q3 + 1.5*IQR]
    const iqr = q75 - q25;
    const lowerBound = q25 - 1.5 * iqr;
    const upperBound = q75 + 1.5 * iqr;
    const outliersCount = sorted.filter((v) => v < lowerBound || v > upperBound).length;

    // Pearson's Skewness coefficient
    const m3 = sorted.reduce((sum, v) => sum + Math.pow(v - mean, 3), 0) / count;
    const skewness = std > 1e-6 ? m3 / Math.pow(std, 3) : 0;

    return {
      variable: key,
      count,
      missing,
      mean: Number(mean.toFixed(2)),
      median: Number(median.toFixed(2)),
      std: Number(std.toFixed(2)),
      min: Number(min.toFixed(2)),
      q25: Number(q25.toFixed(2)),
      q75: Number(q75.toFixed(2)),
      max: Number(max.toFixed(2)),
      skewness: Number(skewness.toFixed(2)),
      outliersCount,
    };
  });
}

export function computeHistogram(values: number[], binsCount = 10) {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) {
    return [{ bin: `${min}`, count: values.length, range: [min, max] }];
  }
  const binWidth = (max - min) / binsCount;
  const bins = Array.from({ length: binsCount }, (_, i) => {
    const low = min + i * binWidth;
    const high = low + binWidth;
    return {
      bin: `${Math.round(low)}-${Math.round(high)}`,
      range: [low, high] as [number, number],
      count: 0,
    };
  });

  values.forEach((v) => {
    let idx = Math.floor((v - min) / binWidth);
    if (idx >= binsCount) idx = binsCount - 1;
    if (idx < 0) idx = 0;
    bins[idx].count++;
  });

  return bins;
}

// --- MÓDULO 2: PREPARACIÓN DE DATOS (EXACT R LOGIC) ---

export function prepareData(data: TelcoRecord[]): ProcessedDataset {
  const preparedRecords: TelcoRecord[] = data.map((d) => {
    // Exact R formula: servicios = fijo + largadistancia + internetcasa + numoculto
    const fij = Number(d.fijo) || 0;
    const ld = Number(d.largadistancia) || 0;
    const ic = Number(d.internetcasa) || 0;
    const no = Number(d.numoculto) || 0;
    const servicios = fij + ld + ic + no;

    return {
      ...d,
      servicios,
    };
  });

  const featureNames = [...CLUSTERING_VARS];
  const n = preparedRecords.length;
  const p = featureNames.length;

  // Extract raw matrix
  const rawMatrix: number[][] = preparedRecords.map((row) =>
    featureNames.map((col) => {
      const val = Number(row[col]);
      return isNaN(val) ? 0 : val;
    })
  );

  // Apply log(1 + x) to specified variables
  const transformedMatrix: number[][] = rawMatrix.map((row) =>
    row.map((val, colIdx) => {
      const colName = featureNames[colIdx];
      if (LOG_TRANSFORM_VARS.includes(colName)) {
        return Math.log(1 + Math.max(0, val));
      }
      return val;
    })
  );

  // Compute means and stds for Z-Score Standardization
  const means: number[] = new Array(p).fill(0);
  const stds: number[] = new Array(p).fill(0);

  for (let j = 0; j < p; j++) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += transformedMatrix[i][j];
    }
    means[j] = sum / Math.max(1, n);

    let sumSq = 0;
    for (let i = 0; i < n; i++) {
      sumSq += Math.pow(transformedMatrix[i][j] - means[j], 2);
    }
    const variance = sumSq / Math.max(1, n - 1);
    stds[j] = Math.sqrt(variance) || 1; // Prevent div by zero
  }

  // Standardize matrix using Z-score: (x - mean) / std
  const scaledMatrix: number[][] = transformedMatrix.map((row) =>
    row.map((val, colIdx) => (val - means[colIdx]) / stds[colIdx])
  );

  return {
    original: preparedRecords,
    featureNames,
    rawMatrix,
    transformedMatrix,
    scaledMatrix,
    means,
    stds,
  };
}

// Distance helper
function euclideanDistSq(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return sum;
}

// --- MÓDULO 4: K-MEANS CORE ---

export function runKMeans(
  scaledMatrix: number[][],
  k: number,
  seed = 42,
  maxIterations = 100
): {
  assignments: number[];
  centroids: number[][];
  totWithinSS: number;
  withinSS: number[];
  betweenSS: number;
  totSS: number;
  iterations: number;
  converged: boolean;
} {
  const n = scaledMatrix.length;
  const p = scaledMatrix[0].length;
  const rand = createPRNG(seed);

  // Compute TotSS (Total sum of squares relative to overall mean)
  const overallMean = new Array(p).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < p; j++) {
      overallMean[j] += scaledMatrix[i][j];
    }
  }
  for (let j = 0; j < p; j++) overallMean[j] /= n;

  let totSS = 0;
  for (let i = 0; i < n; i++) {
    totSS += euclideanDistSq(scaledMatrix[i], overallMean);
  }

  // Initialize centroids with K-means++ logic
  const centroids: number[][] = [];
  const firstIdx = Math.floor(rand() * n);
  centroids.push([...scaledMatrix[firstIdx]]);

  while (centroids.length < k) {
    const distances: number[] = new Array(n);
    let distSum = 0;
    for (let i = 0; i < n; i++) {
      let minDist = Infinity;
      for (const c of centroids) {
        const d = euclideanDistSq(scaledMatrix[i], c);
        if (d < minDist) minDist = d;
      }
      distances[i] = minDist;
      distSum += minDist;
    }

    let target = rand() * distSum;
    let chosenIdx = 0;
    for (let i = 0; i < n; i++) {
      target -= distances[i];
      if (target <= 0) {
        chosenIdx = i;
        break;
      }
    }
    centroids.push([...scaledMatrix[chosenIdx]]);
  }

  // Lloyd's iterative algorithm
  let assignments = new Array(n).fill(0);
  let iterations = 0;
  let converged = false;

  for (let iter = 0; iter < maxIterations; iter++) {
    iterations = iter + 1;
    let changed = false;

    // Assignment step
    for (let i = 0; i < n; i++) {
      let minDist = Infinity;
      let bestCluster = 0;
      for (let c = 0; c < k; c++) {
        const d = euclideanDistSq(scaledMatrix[i], centroids[c]);
        if (d < minDist) {
          minDist = d;
          bestCluster = c;
        }
      }
      if (assignments[i] !== bestCluster) {
        assignments[i] = bestCluster;
        changed = true;
      }
    }

    if (!changed && iter > 0) {
      converged = true;
      break;
    }

    // Update step
    const clusterCounts = new Array(k).fill(0);
    const newCentroids = Array.from({ length: k }, () => new Array(p).fill(0));

    for (let i = 0; i < n; i++) {
      const c = assignments[i];
      clusterCounts[c]++;
      for (let j = 0; j < p; j++) {
        newCentroids[c][j] += scaledMatrix[i][j];
      }
    }

    for (let c = 0; c < k; c++) {
      if (clusterCounts[c] > 0) {
        for (let j = 0; j < p; j++) {
          centroids[c][j] = newCentroids[c][j] / clusterCounts[c];
        }
      } else {
        // Handle empty cluster: reseed to random point
        const rIdx = Math.floor(rand() * n);
        centroids[c] = [...scaledMatrix[rIdx]];
      }
    }
  }

  // Calculate WSS, TotWithinSS, BetweenSS
  const withinSS = new Array(k).fill(0);
  for (let i = 0; i < n; i++) {
    const c = assignments[i];
    withinSS[c] += euclideanDistSq(scaledMatrix[i], centroids[c]);
  }
  const totWithinSS = withinSS.reduce((a, b) => a + b, 0);
  const betweenSS = Math.max(0, totSS - totWithinSS);

  return {
    assignments,
    centroids,
    totWithinSS,
    withinSS,
    betweenSS,
    totSS,
    iterations,
    converged,
  };
}

// --- MÓDULO 3: NÚMERO ÓPTIMO DE CLUSTERS (ELBOW, SILHOUETTE, GAP STATISTIC) ---

// Silhouette calculation with sampling for high performance
export function computeSilhouetteScore(scaledMatrix: number[][], assignments: number[], k: number): number {
  if (k <= 1) return 0;
  const n = scaledMatrix.length;
  // Sample if n > 600 for instant UI responsiveness
  const step = n > 600 ? Math.ceil(n / 500) : 1;
  const sampleIndices: number[] = [];
  for (let i = 0; i < n; i += step) sampleIndices.push(i);

  const clusterMembers: number[][] = Array.from({ length: k }, () => []);
  for (const idx of sampleIndices) {
    clusterMembers[assignments[idx]].push(idx);
  }

  let totalSilhouette = 0;
  let validPoints = 0;

  for (const i of sampleIndices) {
    const myCluster = assignments[i];
    const sameCluster = clusterMembers[myCluster];

    if (sameCluster.length <= 1) continue;

    // a(i): average distance to points in same cluster
    let aSum = 0;
    for (const j of sameCluster) {
      if (i !== j) {
        aSum += Math.sqrt(euclideanDistSq(scaledMatrix[i], scaledMatrix[j]));
      }
    }
    const a = aSum / (sameCluster.length - 1);

    // b(i): min average distance to points in other clusters
    let b = Infinity;
    for (let c = 0; c < k; c++) {
      if (c === myCluster) continue;
      const otherCluster = clusterMembers[c];
      if (otherCluster.length === 0) continue;
      let distSum = 0;
      for (const j of otherCluster) {
        distSum += Math.sqrt(euclideanDistSq(scaledMatrix[i], scaledMatrix[j]));
      }
      const avgDist = distSum / otherCluster.length;
      if (avgDist < b) b = avgDist;
    }

    const s = (b - a) / Math.max(a, b);
    totalSilhouette += s;
    validPoints++;
  }

  return validPoints > 0 ? totalSilhouette / validPoints : 0;
}

// Gap Statistic (Tibshirani et al. algorithm replicated)
export function computeOptimalKCurve(
  scaledMatrix: number[][],
  maxK = 10,
  seed = 42,
  bSamples = 8
): OptimalKResult[] {
  const n = scaledMatrix.length;
  const p = scaledMatrix[0].length;
  const results: OptimalKResult[] = [];

  // Generate uniform bounding box for Gap reference distribution
  const mins = new Array(p).fill(Infinity);
  const maxs = new Array(p).fill(-Infinity);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < p; j++) {
      if (scaledMatrix[i][j] < mins[j]) mins[j] = scaledMatrix[i][j];
      if (scaledMatrix[i][j] > maxs[j]) maxs[j] = scaledMatrix[i][j];
    }
  }

  const rand = createPRNG(seed + 999);

  // Generate B reference datasets
  const referenceDatasets: number[][][] = [];
  for (let b = 0; b < bSamples; b++) {
    const refData: number[][] = [];
    for (let i = 0; i < n; i++) {
      const row = new Array(p);
      for (let j = 0; j < p; j++) {
        row[j] = mins[j] + rand() * (maxs[j] - mins[j]);
      }
      refData.push(row);
    }
    referenceDatasets.push(refData);
  }

  for (let k = 1; k <= maxK; k++) {
    const model = runKMeans(scaledMatrix, k, seed);
    const wss = model.totWithinSS;
    const logWss = Math.log(Math.max(1e-6, wss));

    // Silhouette score
    const silhouette = k === 1 ? 0 : computeSilhouetteScore(scaledMatrix, model.assignments, k);

    // Gap calculation
    const logWssRefs: number[] = [];
    for (let b = 0; b < bSamples; b++) {
      const refModel = runKMeans(referenceDatasets[b], k, seed + b * 17);
      logWssRefs.push(Math.log(Math.max(1e-6, refModel.totWithinSS)));
    }

    const meanLogWssRef = logWssRefs.reduce((a, b) => a + b, 0) / bSamples;
    const gap = meanLogWssRef - logWss;
    const varLogWssRef =
      logWssRefs.reduce((sum, v) => sum + Math.pow(v - meanLogWssRef, 2), 0) / Math.max(1, bSamples - 1);
    const sdLogWssRef = Math.sqrt(varLogWssRef);

    results.push({
      k,
      wss: Number(wss.toFixed(2)),
      silhouette: Number(silhouette.toFixed(4)),
      gap: Number(gap.toFixed(4)),
      gapSimMean: Number(meanLogWssRef.toFixed(4)),
      gapSimSd: Number(sdLogWssRef.toFixed(4)),
    });
  }

  return results;
}

// Automatic consolidated recommendation
export function recommendOptimalK(results: OptimalKResult[]): {
  recommendedK: number;
  elbowK: number;
  silhouetteK: number;
  gapK: number;
  rationale: string;
} {
  if (results.length < 3) {
    return {
      recommendedK: 3,
      elbowK: 3,
      silhouetteK: 3,
      gapK: 3,
      rationale: 'Recomendación base por dimensionalidad estándar de telecomunicaciones.',
    };
  }

  // 1. Silhouette best (K >= 2)
  const validSil = results.filter((r) => r.k >= 2);
  let bestSilK = 2;
  let maxSil = -Infinity;
  for (const r of validSil) {
    if (r.silhouette > maxSil) {
      maxSil = r.silhouette;
      bestSilK = r.k;
    }
  }

  // 2. Elbow detection via second differences / curvature
  let bestElbowK = 3;
  let maxCurvature = -Infinity;
  for (let i = 1; i < results.length - 1; i++) {
    const prev = results[i - 1].wss;
    const curr = results[i].wss;
    const next = results[i + 1].wss;
    // Discrete second derivative: (prev - 2*curr + next)
    const curvature = prev - 2 * curr + next;
    if (curvature > maxCurvature) {
      maxCurvature = curvature;
      bestElbowK = results[i].k;
    }
  }

  // 3. Gap Statistic optimal (Tibshirani 1-SE rule: smallest K such that Gap(k) >= Gap(k+1) - s_{k+1})
  let bestGapK = 3;
  let foundTibshirani = false;
  for (let i = 0; i < results.length - 1; i++) {
    const curr = results[i];
    const next = results[i + 1];
    const threshold = next.gap - next.gapSimSd * Math.sqrt(1 + 1 / 8);
    if (curr.gap >= threshold) {
      bestGapK = curr.k;
      foundTibshirani = true;
      break;
    }
  }
  if (!foundTibshirani) {
    let maxGap = -Infinity;
    for (const r of results) {
      if (r.gap > maxGap) {
        maxGap = r.gap;
        bestGapK = r.k;
      }
    }
  }

  // Consolidated consensus voting
  const votes: Record<number, number> = {};
  votes[bestSilK] = (votes[bestSilK] || 0) + 1.2;
  votes[bestElbowK] = (votes[bestElbowK] || 0) + 1.0;
  votes[bestGapK] = (votes[bestGapK] || 0) + 1.1;

  let recommendedK = 3;
  let maxVotes = 0;
  for (const [kStr, score] of Object.entries(votes)) {
    const kNum = Number(kStr);
    if (score > maxVotes) {
      maxVotes = score;
      recommendedK = kNum;
    }
  }

  const rationale = `Consenso analítico multimétodo: Silhouette alcanza su pico (${maxSil.toFixed(3)}) en K=${bestSilK}, el Método del Codo presenta su mayor desaceleración marginal en K=${bestElbowK}, y el Gap Statistic valida un óptimo robusto en K=${bestGapK}.`;

  return {
    recommendedK,
    elbowK: bestElbowK,
    silhouetteK: bestSilK,
    gapK: bestGapK,
    rationale,
  };
}

// --- MÓDULO 6: PCA PROJECTION (CLUSPLOT) ---

// Power iteration / 2D PCA implementation
export function computePCA2D(
  scaledMatrix: number[][]
): {
  coords: { pc1: number; pc2: number }[];
  varianceRatio: [number, number];
} {
  const n = scaledMatrix.length;
  const p = scaledMatrix[0].length;

  // Covariance matrix
  const cov: number[][] = Array.from({ length: p }, () => new Array(p).fill(0));
  for (let j1 = 0; j1 < p; j1++) {
    for (let j2 = 0; j2 < p; j2++) {
      let sum = 0;
      for (let i = 0; i < n; i++) {
        sum += scaledMatrix[i][j1] * scaledMatrix[i][j2];
      }
      cov[j1][j2] = sum / (n - 1);
    }
  }

  // Power iteration for 1st eigenvector
  function powerIteration(matrix: number[][], numIters = 60): { vector: number[]; eigenvalue: number } {
    let v = Array.from({ length: p }, (_, i) => Math.sin(i + 1));
    let norm = Math.sqrt(v.reduce((a, b) => a + b * b, 0));
    v = v.map((x) => x / norm);

    let lambda = 1;
    for (let iter = 0; iter < numIters; iter++) {
      const vNext = new Array(p).fill(0);
      for (let r = 0; r < p; r++) {
        for (let c = 0; c < p; c++) {
          vNext[r] += matrix[r][c] * v[c];
        }
      }
      norm = Math.sqrt(vNext.reduce((a, b) => a + b * b, 0)) || 1;
      lambda = norm;
      v = vNext.map((x) => x / norm);
    }
    return { vector: v, eigenvalue: lambda };
  }

  const comp1 = powerIteration(cov);

  // Deflate matrix for 2nd component
  const cov2: number[][] = cov.map((row, r) =>
    row.map((val, c) => val - comp1.eigenvalue * comp1.vector[r] * comp1.vector[c])
  );
  const comp2 = powerIteration(cov2);

  // Total variance trace
  let totalVar = 0;
  for (let j = 0; j < p; j++) totalVar += cov[j][j];
  if (totalVar <= 0) totalVar = 1;

  const pc1Var = Math.min(100, Math.max(1, (comp1.eigenvalue / totalVar) * 100));
  const pc2Var = Math.min(100 - pc1Var, Math.max(1, (comp2.eigenvalue / totalVar) * 100));

  // Project points
  const coords = scaledMatrix.map((row) => {
    let pc1 = 0;
    let pc2 = 0;
    for (let j = 0; j < p; j++) {
      pc1 += row[j] * comp1.vector[j];
      pc2 += row[j] * comp2.vector[j];
    }
    return {
      pc1: Number(pc1.toFixed(3)),
      pc2: Number(pc2.toFixed(3)),
    };
  });

  return {
    coords,
    varianceRatio: [Number(pc1Var.toFixed(1)), Number(pc2Var.toFixed(1))],
  };
}

// Full Model Execution
export function executeFullSegmentation(
  processed: ProcessedDataset,
  k: number,
  seed = 42,
  maxIterations = 100
): KMeansModelResult {
  const { scaledMatrix, original, means, stds, featureNames } = processed;
  const n = scaledMatrix.length;
  const p = featureNames.length;

  const kmeans = runKMeans(scaledMatrix, k, seed, maxIterations);
  const pca = computePCA2D(scaledMatrix);

  // Calculate cluster sizes and percentages
  const clusterSizes = new Array(k).fill(0);
  for (let i = 0; i < n; i++) {
    clusterSizes[kmeans.assignments[i]]++;
  }
  const clusterPercentages = clusterSizes.map((size) => Number(((size / n) * 100).toFixed(1)));

  // Calculate centroids in original unscaled domain
  const centroidsOriginal = kmeans.centroids.map((scaledCentroid) => {
    return scaledCentroid.map((scaledVal, colIdx) => {
      const colName = featureNames[colIdx];
      // Reverse Z-score: z * std + mean
      const transformedVal = scaledVal * stds[colIdx] + means[colIdx];
      // Reverse log(1+x): exp(y) - 1 if log transformed
      if (LOG_TRANSFORM_VARS.includes(colName)) {
        return Math.max(0, Math.exp(transformedVal) - 1);
      }
      return Math.max(0, transformedVal);
    });
  });

  const varianceExplainedPercent =
    kmeans.totSS > 0 ? Number(((kmeans.betweenSS / kmeans.totSS) * 100).toFixed(1)) : 0;

  const pcaCoords = pca.coords.map((c, idx) => ({
    x: c.pc1,
    y: c.pc2,
    cluster: kmeans.assignments[idx],
    id: original[idx].id || idx + 1,
  }));

  return {
    k,
    seed,
    iterations: kmeans.iterations,
    converged: kmeans.converged,
    clusterAssignments: kmeans.assignments,
    clusterSizes,
    clusterPercentages,
    centroidsScaled: kmeans.centroids,
    centroidsOriginal,
    totWithinSS: Number(kmeans.totWithinSS.toFixed(2)),
    withinSS: kmeans.withinSS.map((v) => Number(v.toFixed(2))),
    betweenSS: Number(kmeans.betweenSS.toFixed(2)),
    totSS: Number(kmeans.totSS.toFixed(2)),
    varianceExplainedPercent,
    inertia: Number(kmeans.totWithinSS.toFixed(2)),
    pcaCoords,
    pcaVariance: pca.varianceRatio,
  };
}

// --- MÓDULO 5: PERFILAMIENTO DE SEGMENTOS ---

export function generateClusterProfiles(
  originalData: TelcoRecord[],
  assignments: number[],
  k: number
): ClusterProfile[] {
  const profiles: ClusterProfile[] = [];
  const n = originalData.length;

  for (let c = 0; c < k; c++) {
    const members = originalData.filter((_, idx) => assignments[idx] === c);
    const size = members.length;
    if (size === 0) continue;

    const avg = (field: keyof TelcoRecord) =>
      members.reduce((sum, m) => sum + (Number(m[field]) || 0), 0) / size;

    const avgAge = Math.round(avg('edad'));
    const avgIncome = Math.round(avg('ingresos'));
    const avgDeviceVal = Math.round(avg('equipo_dolares'));
    const avgServices = Number(avg('servicios').toFixed(1));
    const avgPrefMinutes = Math.round(avg('minutos_preferido'));
    const avgNonPrefMinutes = Math.round(avg('minutos_no_preferido'));
    const avgInternetGb = Number(avg('internet_gigas').toFixed(1));
    const avgAdditional = Math.round(avg('adicionales'));

    // Demographics
    const femaleCount = members.filter((m) => m.genero === 0).length;
    const dominantGender = femaleCount > size / 2 ? 'Femenino' : 'Masculino';
    const marriedCount = members.filter((m) => m.estadocivil === 1).length;
    const dominantMarital = marriedCount > size / 2 ? 'Casado' : 'Soltero';
    const retireeRate = Number(((members.filter((m) => m.jubilado === 1).length / size) * 100).toFixed(1));

    // Dynamic descriptive label based on dominant behavioral signals
    let label = 'Clientes en transición estándar';
    let name = `Segmento ${c + 1}`;

    if (avgIncome > 75 || avgDeviceVal > 800) {
      name = 'Premium VIP & Multi-Servicio';
      label = 'Clientes corporativos o familiares de alto valor con consumo intensivo y dispositivos tope de gama.';
    } else if (avgInternetGb > 35 || avgAdditional > 30) {
      name = 'Digitales Intensivos (Streamers)';
      label = 'Usuarios jóvenes hiperconectados, gran consumo de datos móviles y alta afinidad por servicios digitales.';
    } else if (avgAge > 50 && avgServices >= 2 && avgInternetGb < 15) {
      name = 'Tradicionales de Voz & Hogar';
      label = 'Clientes consolidados de edad madura con preferencia por telefonía fija, minutos preferidos y baja navegación.';
    } else if (avgIncome < 30 || (avgDeviceVal < 250 && avgInternetGb < 10)) {
      name = 'Básicos & Económicos';
      label = 'Segmento sensible al precio con bajo consumo de datos, equipos económicos y uso elemental de servicios.';
    } else {
      name = `Segmento Mixto ${c + 1}`;
      label = 'Clientes con patrón equilibrado entre voz tradicional y navegación moderada.';
    }

    // Normalized radar axes (0 - 100 index)
    const radarScores = [
      { axis: 'Minutos', value: Math.min(100, Math.round((avgPrefMinutes / 800) * 100)) },
      { axis: 'Datos (GB)', value: Math.min(100, Math.round((avgInternetGb / 60) * 100)) },
      { axis: 'Equipo ($)', value: Math.min(100, Math.round((avgDeviceVal / 1200) * 100)) },
      { axis: 'Servicios', value: Math.min(100, Math.round((avgServices / 4) * 100)) },
      { axis: 'Ingresos', value: Math.min(100, Math.round((avgIncome / 120) * 100)) },
      { axis: 'Adicionales', value: Math.min(100, Math.round((avgAdditional / 60) * 100)) },
    ];

    profiles.push({
      clusterId: c,
      name,
      label,
      size,
      percentage: Number(((size / n) * 100).toFixed(1)),
      avgAge,
      avgIncome,
      avgDeviceVal,
      avgServices,
      avgPrefMinutes,
      avgNonPrefMinutes,
      avgInternetGb,
      avgAdditional,
      dominantGender,
      dominantMarital,
      retireeRate,
      radarScores,
    });
  }

  return profiles;
}

// --- MÓDULO 8: VALIDACIÓN BOOTSTRAP (CLUSTERBOOT) ---

export function computeClusterboot(
  scaledMatrix: number[][],
  k: number,
  resamples = 50,
  seed = 42
): BootstrapClusterResult[] {
  const n = scaledMatrix.length;
  const p = scaledMatrix[0].length;
  const baseModel = runKMeans(scaledMatrix, k, seed);
  const baseAssignments = baseModel.assignments;

  // Base clusters membership sets
  const baseClusterSets: Set<number>[] = Array.from({ length: k }, () => new Set());
  for (let i = 0; i < n; i++) {
    baseClusterSets[baseAssignments[i]].add(i);
  }

  const rand = createPRNG(seed + 555);
  const jaccardSums = new Array(k).fill(0);

  for (let b = 0; b < resamples; b++) {
    // Generate bootstrap sample with replacement
    const bootIndices: number[] = new Array(n);
    const bootMatrix: number[][] = new Array(n);
    for (let i = 0; i < n; i++) {
      const sampleIdx = Math.floor(rand() * n);
      bootIndices[i] = sampleIdx;
      bootMatrix[i] = scaledMatrix[sampleIdx];
    }

    // Run K-Means on bootstrap sample
    const bootModel = runKMeans(bootMatrix, k, seed + b);

    // Group bootstrap points by cluster
    const bootClusterSets: Set<number>[] = Array.from({ length: k }, () => new Set());
    for (let i = 0; i < n; i++) {
      bootClusterSets[bootModel.assignments[i]].add(bootIndices[i]);
    }

    // Match each base cluster to highest Jaccard in bootstrap
    for (let c = 0; c < k; c++) {
      const baseSet = baseClusterSets[c];
      let maxJaccard = 0;

      for (let bc = 0; bc < k; bc++) {
        const bootSet = bootClusterSets[bc];
        let intersection = 0;
        for (const item of baseSet) {
          if (bootSet.has(item)) intersection++;
        }
        const union = baseSet.size + bootSet.size - intersection;
        const jaccard = union > 0 ? intersection / union : 0;
        if (jaccard > maxJaccard) maxJaccard = jaccard;
      }

      jaccardSums[c] += maxJaccard;
    }
  }

  return Array.from({ length: k }, (_, c) => {
    const meanJaccard = Number((jaccardSums[c] / resamples).toFixed(3));
    let stabilityCategory: 'Excelente' | 'Bueno' | 'Aceptable' | 'Débil' = 'Bueno';
    let description = '';

    if (meanJaccard >= 0.85) {
      stabilityCategory = 'Excelente';
      description = 'Cluster altamente estable y reproducible en más del 85% de las muestras bootstrap.';
    } else if (meanJaccard >= 0.75) {
      stabilityCategory = 'Bueno';
      description = 'Patrón consistente y confiable; muestra solidez frente a perturbaciones muestrales.';
    } else if (meanJaccard >= 0.60) {
      stabilityCategory = 'Aceptable';
      description = 'Segmento válido con cierta sensibilidad a puntos limítrofes; requiere supervisión.';
    } else {
      stabilityCategory = 'Débil';
      description = 'Baja estabilidad; riesgo de artefacto numérico o solapamiento severo con otros clusters.';
    }

    return {
      clusterId: c,
      meanJaccard,
      stabilityCategory,
      confidenceScore: Math.round(meanJaccard * 100),
      resamples,
      description,
    };
  });
}
