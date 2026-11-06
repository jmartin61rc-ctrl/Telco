import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  prepareData,
  runKMeans,
  computeOptimalKCurve,
  computeSilhouetteScore,
  generateClusterProfiles,
  computeClusterboot,
} from './src/services/clusteringEngine';
import { initialCellSegmentationData } from './src/data/cellSegmentationDataset';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// Body parser for JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google Gemini AI SDK on the server with User-Agent
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-memory active dataset cache
let currentDataset = [...initialCellSegmentationData];

// 1. API: /api/upload
app.post('/api/upload', (req, res) => {
  try {
    const { data } = req.body;
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: 'No se recibieron registros válidos.' });
    }
    currentDataset = data;
    return res.json({
      success: true,
      message: `Cargados exitosamente ${data.length} registros.`,
      recordsCount: data.length,
      sample: data.slice(0, 5),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. API: /api/preprocessing
app.post('/api/preprocessing', (req, res) => {
  try {
    const inputData = req.body.data || currentDataset;
    const processed = prepareData(inputData);
    return res.json({
      success: true,
      recordsCount: processed.original.length,
      featureNames: processed.featureNames,
      means: processed.means,
      stds: processed.stds,
      sampleRaw: processed.rawMatrix.slice(0, 5),
      sampleTransformed: processed.transformedMatrix.slice(0, 5),
      sampleScaled: processed.scaledMatrix.slice(0, 5),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. API: /api/kmeans
app.post('/api/kmeans', (req, res) => {
  try {
    const { k = 3, seed = 42, maxIterations = 100 } = req.body;
    const inputData = req.body.data || currentDataset;
    const processed = prepareData(inputData);
    const result = runKMeans(processed.scaledMatrix, Number(k), Number(seed), Number(maxIterations));

    return res.json({
      success: true,
      k,
      seed,
      iterations: result.iterations,
      converged: result.converged,
      totWithinSS: result.totWithinSS,
      withinSS: result.withinSS,
      betweenSS: result.betweenSS,
      totSS: result.totSS,
      varianceExplainedPercent: Number(((result.betweenSS / result.totSS) * 100).toFixed(2)),
      centroids: result.centroids,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. API: /api/clusters
app.post('/api/clusters', (req, res) => {
  try {
    const { k = 3, seed = 42 } = req.body;
    const inputData = req.body.data || currentDataset;
    const processed = prepareData(inputData);
    const result = runKMeans(processed.scaledMatrix, Number(k), Number(seed));
    const profiles = generateClusterProfiles(processed.original, result.assignments, Number(k));

    return res.json({
      success: true,
      k,
      profiles,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 5. API: /api/gap-statistic
app.post('/api/gap-statistic', (req, res) => {
  try {
    const { maxK = 10, seed = 42 } = req.body;
    const inputData = req.body.data || currentDataset;
    const processed = prepareData(inputData);
    const curve = computeOptimalKCurve(processed.scaledMatrix, Number(maxK), Number(seed));

    return res.json({
      success: true,
      curve,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 6. API: /api/silhouette
app.post('/api/silhouette', (req, res) => {
  try {
    const { k = 3, seed = 42 } = req.body;
    const inputData = req.body.data || currentDataset;
    const processed = prepareData(inputData);
    const result = runKMeans(processed.scaledMatrix, Number(k), Number(seed));
    const score = computeSilhouetteScore(processed.scaledMatrix, result.assignments, Number(k));

    return res.json({
      success: true,
      k,
      silhouette: score,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 7. API: /api/export
app.get('/api/export', (req, res) => {
  try {
    const processed = prepareData(currentDataset);
    const km = runKMeans(processed.scaledMatrix, 3, 42);

    const headers = [
      'id,cluster,region,edad,ingresos,servicios,minutos_preferido,minutos_no_preferido,adicionales,internet_gigas,equipo_dolares',
    ];
    const rows = processed.original.map((r, i) => {
      const c = km.assignments[i] + 1;
      return `${r.id},${c},${r.region},${r.edad},${r.ingresos},${r.servicios},${r.minutos_preferido},${r.minutos_no_preferido},${r.adicionales},${r.internet_gigas},${r.equipo_dolares}`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="cell_segmentado.csv"');
    return res.send([...headers, ...rows].join('\n'));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 8. API: /api/gemini (Server-side Gemini generation via @google/genai)
app.post('/api/gemini', async (req, res) => {
  try {
    const { profiles, modelMetrics } = req.body;

    if (!ai) {
      if (process.env.GEMINI_API_KEY) {
        ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
      }
    }

    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY no configurada en el servidor. Revise la pestaña Secrets en AI Studio.',
      });
    }

    const prompt = `Eres un Científico de Datos Senior y Chief Marketing Officer en Telecomunicaciones.
Analiza la siguiente segmentación de clientes obtenida mediante K-Means:

MÉTRICAS DEL MODELO:
- Número de Clusters: ${modelMetrics.k}
- Varianza Explicada (BetweenSS/TotSS): ${modelMetrics.varianceExplainedPercent}%
- Total Within SS: ${modelMetrics.totWithinSS}
- Tamaños de cluster: ${JSON.stringify(modelMetrics.clusterSizes)}
- Porcentajes: ${JSON.stringify(modelMetrics.clusterPercentages)}%

PERFILES DE CADA CLUSTER:
${JSON.stringify(profiles, null, 2)}

TAREA:
Genera un análisis ejecutivo estructurado en formato JSON estrictamente válido que contenga:
1. "executiveSummary": Resumen ejecutivo de alto impacto para la junta directiva (máximo 150 palabras).
2. "clusterProfiles": Array con un objeto por cada cluster conteniendo:
   - "clusterId": número
   - "title": Título comercial atractivo
   - "description": Explicación ejecutiva del perfil
   - "keyCharacteristics": Array de 3 viñetas con hechos clave
   - "marketingStrategy": Estrategia de marketing específica
   - "commercialStrategy": Estrategia comercial y de canales
   - "loyaltyAndRetention": Acciones de fidelización y reducción de churn
   - "priorityAction": Acción prioritaria inmediata
3. "comparativeInsights": Array de 4 observaciones comparativas profundas entre clusters.
4. "strategicRoadmap": Array de 3 fases ("Mes 1", "Mes 2-3", "Mes 4-6") con "phase", "action" y "expectedImpact".

RESPONDE ÚNICAMENTE CON UN OBJETO JSON VÁLIDO. SIN TEXTO ADICIONAL ANTES O DESPUÉS.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let interpretation;
    try {
      interpretation = JSON.parse(text);
      interpretation.generatedAt = new Date().toISOString();
      interpretation.isAiGenerated = true;
    } catch (parseErr) {
      console.error('Error parseando JSON de Gemini:', parseErr);
      return res.status(500).json({ error: 'Respuesta de IA no parseable.', rawText: text });
    }

    return res.json({ success: true, interpretation });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    return res.status(500).json({ error: err.message || 'Error invocando Gemini API' });
  }
});

// Mount Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Telco Clustering App] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
