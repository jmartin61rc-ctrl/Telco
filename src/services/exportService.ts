import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import {
  TelcoRecord,
  ClusterProfile,
  KMeansModelResult,
  OptimalKResult,
  GeminiInterpretation,
  BootstrapClusterResult,
} from '../types/segmentation';

/**
 * Exports data to Microsoft Excel (.xlsx) with multiple sheets
 */
export function exportToExcel(
  records: TelcoRecord[],
  profiles: ClusterProfile[],
  model: KMeansModelResult
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Segmented Customers
  const customerRows = records.map((r, idx) => ({
    ID: r.id || idx + 1,
    Cluster: (r.cluster !== undefined ? r.cluster : model.clusterAssignments[idx]) + 1,
    Edad: r.edad,
    Ingresos_k: r.ingresos,
    Servicios_Total: r.servicios,
    Min_Preferido: r.minutos_preferido,
    Min_No_Preferido: r.minutos_no_preferido,
    Adicionales: r.adicionales,
    Internet_GB: r.internet_gigas,
    Equipo_Dolares: r.equipo_dolares,
    Region: r.region,
    Fijo: r.fijo,
    LargaDistancia: r.largadistancia,
    InternetCasa: r.internetcasa,
    NumOculto: r.numoculto,
    EstadoCivil: r.estadocivil === 1 ? 'Casado' : 'Soltero',
    Jubilado: r.jubilado === 1 ? 'Sí' : 'No',
    Genero: r.genero === 1 ? 'M' : 'F',
  }));
  const wsCustomers = XLSX.utils.json_to_sheet(customerRows);
  XLSX.utils.book_append_sheet(wb, wsCustomers, 'Clientes_Segmentados');

  // Sheet 2: Centroids and Profiles
  const profileRows = profiles.map((p) => ({
    Cluster: p.clusterId + 1,
    Nombre: p.name,
    Clientes: p.size,
    Porcentaje: `${p.percentage}%`,
    Edad_Promedio: p.avgAge,
    Ingreso_Promedio: `$${p.avgIncome}`,
    Equipo_Promedio: `$${p.avgDeviceVal}`,
    Servicios_Promedio: p.avgServices,
    Min_Preferido_Promedio: p.avgPrefMinutes,
    Min_No_Preferido_Promedio: p.avgNonPrefMinutes,
    Internet_GB_Promedio: p.avgInternetGb,
    Adicionales_Promedio: p.avgAdditional,
    Genero_Dominante: p.dominantGender,
    Tasa_Jubilados: `${p.retireeRate}%`,
  }));
  const wsProfiles = XLSX.utils.json_to_sheet(profileRows);
  XLSX.utils.book_append_sheet(wb, wsProfiles, 'Perfiles_Centroides');

  // Sheet 3: Statistical Metrics
  const metricRows = [
    { Metrica: 'Número Óptimo K', Valor: model.k },
    { Metrica: 'Total SS (TotSS)', Valor: model.totSS },
    { Metrica: 'Total Within SS (Tot.WithinSS)', Valor: model.totWithinSS },
    { Metrica: 'Between SS (BetweenSS)', Valor: model.betweenSS },
    { Metrica: 'Varianza Explicada (%)', Valor: `${model.varianceExplainedPercent}%` },
    { Metrica: 'Iteraciones de Convergencia', Valor: model.iterations },
    { Metrica: 'Semilla Aleatoria (Seed)', Valor: model.seed },
  ];
  const wsMetrics = XLSX.utils.json_to_sheet(metricRows);
  XLSX.utils.book_append_sheet(wb, wsMetrics, 'Metricas_Modelo');

  XLSX.writeFile(wb, 'cell_segmentado.xlsx');
}

/**
 * Exports raw segmented data to CSV
 */
export function exportToCSV(records: TelcoRecord[], model: KMeansModelResult) {
  const headers = [
    'id',
    'cluster',
    'region',
    'edad',
    'estadocivil',
    'jubilado',
    'genero',
    'fijo',
    'largadistancia',
    'internetcasa',
    'numoculto',
    'minutos_preferido',
    'minutos_no_preferido',
    'adicionales',
    'internet_gigas',
    'equipo_dolares',
    'ingresos',
    'servicios',
  ];

  const rows = records.map((r, idx) => {
    const c = (r.cluster !== undefined ? r.cluster : model.clusterAssignments[idx]) + 1;
    return [
      r.id || idx + 1,
      c,
      r.region,
      r.edad,
      r.estadocivil,
      r.jubilado,
      r.genero,
      r.fijo,
      r.largadistancia,
      r.internetcasa,
      r.numoculto,
      r.minutos_preferido,
      r.minutos_no_preferido,
      r.adicionales,
      r.internet_gigas,
      r.equipo_dolares,
      r.ingresos,
      r.servicios,
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'cell_segmentado.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates and downloads an Executive PDF Report
 */
export function exportExecutivePDF(
  profiles: ClusterProfile[],
  model: KMeansModelResult,
  bootstraps: BootstrapClusterResult[],
  interpretation?: GeminiInterpretation | null
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let y = 20;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('INFORME EJECUTIVO DE SEGMENTACIÓN TELCO', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Análisis K-Means, Validación Bootstrap & Recomendaciones Estratégicas AI', 14, 23);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')} | K = ${model.k} Clusters`, 14, 28);

  y = 42;

  // Model KPIs Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 182, 24, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Métricas Globales del Modelo', 18, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Varianza Explicada: ${model.varianceExplainedPercent}% (BetweenSS / TotSS)`, 18, y + 14);
  doc.text(`Inercia Total (Tot.WithinSS): ${model.totWithinSS.toLocaleString()}`, 18, y + 19);
  doc.text(`BetweenSS: ${model.betweenSS.toLocaleString()}`, 110, y + 14);
  doc.text(`Convergencia: ${model.iterations} iteraciones (Semilla ${model.seed})`, 110, y + 19);

  y += 32;

  // Cluster Profiles Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('Perfiles de Segmentos Identificados', 14, y);
  y += 6;

  profiles.forEach((p, idx) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    const boot = bootstraps.find((b) => b.clusterId === p.clusterId);

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, y, 182, 28, 2, 2, 'F');

    // Accent line
    const colors = [
      [59, 130, 246], // blue
      [16, 185, 129], // emerald
      [245, 158, 11], // amber
      [139, 92, 246], // purple
      [236, 72, 153], // pink
    ];
    const cColor = colors[idx % colors.length];
    doc.setFillColor(cColor[0], cColor[1], cColor[2]);
    doc.rect(14, y, 3, 28, 'F');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`Cluster ${p.clusterId + 1}: ${p.name} (${p.size} clientes - ${p.percentage}%)`, 20, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(p.label, 20, y + 11, { maxWidth: 170 });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(
      `Edad: ${p.avgAge}a | Ingresos: $${p.avgIncome}k | Equipo: $${p.avgDeviceVal} | Datos: ${p.avgInternetGb} GB | Min. Pref: ${p.avgPrefMinutes}`,
      20,
      y + 19
    );

    if (boot) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Estabilidad Bootstrap: ${boot.stabilityCategory} (Jaccard: ${boot.meanJaccard})`,
        20,
        y + 24
      );
    }

    y += 33;
  });

  // AI Interpretation & Recommendations
  if (interpretation) {
    if (y > 220) {
      doc.addPage();
      y = 20;
    }

    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text('Resumen Ejecutivo & Estrategias Gemini AI', 14, y);
    y += 7;

    doc.setFillColor(238, 242, 255);
    doc.setDrawColor(199, 210, 254);
    doc.roundedRect(14, y, 182, 34, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(interpretation.executiveSummary || 'Análisis completado.', 18, y + 6, {
      maxWidth: 174,
      lineHeightFactor: 1.3,
    });

    y += 40;

    // Strategic Roadmap Actions
    if (interpretation.strategicRoadmap && interpretation.strategicRoadmap.length > 0) {
      if (y > 240) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('Hoja de Ruta Estratégica Inmediata:', 14, y);
      y += 6;

      interpretation.strategicRoadmap.slice(0, 3).forEach((item) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`• [${item.phase}] ${item.action}`, 16, y);
        y += 4;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(`  Impacto: ${item.expectedImpact}`, 18, y);
        y += 6;
      });
    }
  }

  doc.save('Reporte_Segmentacion_Ejecutivo.pdf');
}

/**
 * Returns R script replicating the exact analysis
 */
export function getRScriptTemplate(): string {
  return `# ==============================================================================
# SEGMENTACIÓN DE CLIENTES TELCO (K-MEANS) - CÓDIGO R DE PRODUCCIÓN
# Archivo fuente: cellsegmentation.xlsx
# ==============================================================================

# 1. Carga de librerías
library(readxl)
library(dplyr)
library(ggplot2)
library(cluster)     # Para clusplot, silhouette
library(fpc)         # Para clusterboot
library(factoextra)  # Para fviz_nbclust, fviz_cluster

# 2. Lectura y Preprocesamiento
datos <- read_excel("cellsegmentation.xlsx")

# Creación de variable servicios
datos <- datos %>%
  mutate(servicios = fijo + largadistancia + internetcasa + numoculto)

# Selección de variables para clustering
vars_clustering <- c("minutos_preferido", "adicionales", "minutos_no_preferido",
                     "internet_gigas", "servicios", "equipo_dolares")

df_cluster <- datos[, vars_clustering]

# Transformación log(1+x)
vars_log <- c("minutos_preferido", "adicionales", "minutos_no_preferido", "internet_gigas")
df_cluster[vars_log] <- log(1 + df_cluster[vars_log])

# Estandarización Z-score
df_scaled <- scale(df_cluster)

# 3. Determinación de K Óptimo
# Método del Codo (Elbow)
fviz_nbclust(df_scaled, kmeans, method = "wss", k.max = 10) +
  labs(title = "Método del Codo - WSS Óptimo")

# Silhouette
fviz_nbclust(df_scaled, kmeans, method = "silhouette", k.max = 10) +
  labs(title = "Puntaje Silhouette Óptimo")

# Gap Statistic
gap_stat <- clusGap(df_scaled, FUN = kmeans, nstart = 25, K.max = 10, B = 50)
fviz_gap_stat(gap_stat)

# 4. Ajuste K-Means
set.seed(42)
k_optimo <- 3
modelo_km <- kmeans(df_scaled, centers = k_optimo, nstart = 25, iter.max = 100)

# Métricas del modelo
print(paste("Tot.WithinSS:", round(modelo_km$tot.withinss, 2)))
print(paste("BetweenSS:", round(modelo_km$betweenss, 2)))
print(paste("TotSS:", round(modelo_km$totss, 2)))
print(paste("% Varianza Explicada:", round((modelo_km$betweenss / modelo_km$totss) * 100, 2)))

# 5. Visualización clusplot
clusplot(df_scaled, modelo_km$cluster, color = TRUE, shade = TRUE,
         labels = 2, lines = 0, main = "Clusplot - Proyección PCA 2D")

# 6. Validación Bootstrap con clusterboot
set.seed(42)
cboot <- clusterboot(df_scaled, B = 100, bootmethod = "boot",
                     clustermethod = kmeansCBI, krange = k_optimo, seed = 42)
print("Índices de estabilidad Jaccard por cluster:")
print(cboot$bootmean)

# 7. Perfilamiento
datos$cluster <- as.factor(modelo_km$cluster)
perfil <- datos %>%
  group_by(cluster) %>%
  summarise(
    n = n(),
    edad_media = mean(edad),
    ingreso_medio = mean(ingresos),
    equipo_medio = mean(equipo_dolares),
    servicios_medio = mean(servicios),
    gb_medio = mean(internet_gigas)
  )
print(perfil)
write.csv(datos, "cell_segmentado_R.csv", row.names = FALSE)
`;
}

/**
 * Returns Python / Scikit-learn script replicating the analysis
 */
export function getPythonScriptTemplate(): string {
  return `# ==============================================================================
# SEGMENTACIÓN DE CLIENTES TELCO (K-MEANS) - PYTHON / SCIKIT-LEARN
# Archivo fuente: cellsegmentation.xlsx
# ==============================================================================

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.decomposition import PCA

# 1. Carga de datos
df = pd.read_excel('cellsegmentation.xlsx')

# 2. Feature Engineering
df['servicios'] = df['fijo'] + df['largadistancia'] + df['internetcasa'] + df['numoculto']

features = ['minutos_preferido', 'adicionales', 'minutos_no_preferido',
            'internet_gigas', 'servicios', 'equipo_dolares']

X = df[features].copy()

# Transformación log(1+x)
log_features = ['minutos_preferido', 'adicionales', 'minutos_no_preferido', 'internet_gigas']
for col in log_features:
    X[col] = np.log1p(X[col])

# Estandarización Z-score
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 3. K-Means
k = 3
km = KMeans(n_clusters=k, random_state=42, n_init=25, max_iter=300)
df['cluster'] = km.fit_predict(X_scaled)

# 4. Métricas
sil = silhouette_score(X_scaled, km.labels_)
print(f"Silhouette Score (k={k}): {sil:.4f}")
print(f"Inercia (Tot.WithinSS): {km.inertia_:.2f}")

# 5. Exportar
df.to_csv('cell_segmentado_py.csv', index=False)
print("Segmentación completada con éxito.")
`;
}
