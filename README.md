# 📊 Telco Customer Segmentation AI Studio

Plataforma empresarial de ciencia de datos y segmentación de clientes de telecomunicaciones. Esta solución replica fielmente el ejercicio analítico desarrollado originalmente en **R** (utilizando librerías como `cluster`, `factoextra` y `fpc`), transformándolo en una aplicación web interactiva, moderna y lista para producción con interpretación estratégica automatizada mediante **Google Gemini AI**.

---

## 🎯 Objetivo General

Construir una solución analítica de nivel corporativo que:
1. Permita cargar y explorar hojas de cálculo Excel (`cellsegmentation.xlsx`).
2. Reproduzca con exactitud matemática el pipeline de preprocesamiento, log-transformación y estandarización Z-score.
3. Determine el número óptimo de clusters combinando simultáneamente el **Método del Codo (Elbow WSS)**, el **Coeficiente Silhouette** y el **Gap Statistic**.
4. Ejecute **K-Means Clustering** con métricas rigurosas de varianza (`TotSS`, `BetweenSS`, `Tot.WithinSS`).
5. Perfile segmentos comerciales y genere Buyer Personas automáticas.
6. Genere visualizaciones interactivas de alta fidelidad: **clusplot()** (proyección PCA 2D con elipses), Scatter Plots, Heatmaps de centroides, Boxplots y Radar Charts.
7. Integre **Google Gemini 3.8 Flash** en el servidor para generar resúmenes ejecutivos para gerencia y planes de marketing y retención de churn.
8. Valide la estabilidad y consistencia de los clusters mediante **Bootstrap Validation** (`clusterboot()`, coeficientes Jaccard).
9. Permita exportar los datos enriquecidos a **Excel (.xlsx)**, **CSV**, **Informe Ejecutivo en PDF** y scripts de reproducibilidad en R y Python.

---

## 🏗️ Arquitectura de la Solución

```
├── /src
│   ├── /components          # Componentes de UI modular para cada uno de los 9 módulos
│   │   ├── Header.tsx       # Selector de datasets, métricas y acciones globales
│   │   ├── Module1Exploration.tsx   # Exploración, descriptivos, histogramas, IQR
│   │   ├── Module2Preparation.tsx   # log(1+x), Z-score, variable 'servicios'
│   │   ├── Module3OptimalClusters.tsx # Elbow, Silhouette, Gap Statistic, recomendación
│   │   ├── Module4KMeans.tsx        # K-Means, inercia, Tot.WithinSS, BetweenSS, TotSS
│   │   ├── Module5Profiling.tsx     # Personas, demografía, consumo, benchmarks
│   │   ├── Module6Visualizations.tsx# clusplot (PCA 2D), Scatter, Heatmap, Boxplots, Radar
│   │   ├── Module7GeminiAI.tsx      # Gemini 3.8 Flash C-level briefing y estrategias
│   │   ├── Module8Validation.tsx    # clusterboot() bootstrap Jaccard stability
│   │   ├── Module9Export.tsx        # Descarga Excel, CSV, PDF, scripts R & Python
│   │   └── DeploymentModal.tsx      # Guía interactiva Vercel y comandos Git
│   ├── /data                # Datasets precargados (Cell Segmentation, 2D, USArrests)
│   ├── /services            # Motores matemáticos, Gemini client y generador de exportables
│   │   ├── clusteringEngine.ts # Algoritmos de clustering, PCA, bootstrap, silhoutte
│   │   ├── geminiClient.ts     # Conexión con endpoint seguro de Gemini
│   │   └── exportService.ts    # Generación de XLSX, CSV, PDF
│   └── /types               # Tipos TypeScript de alta precisión
├── server.ts                # Backend Express con rutas API y SDK de Gemini
├── vercel.json              # Configuración de despliegue en Vercel
├── package.json             # Dependencias del proyecto
└── README.md                # Documentación oficial
```

---

## 🗂️ Variables del Archivo `cellsegmentation.xlsx`

- **Demográficas / Estructurales:**
  - `region`: Región geográfica del abonado.
  - `edad`: Edad del cliente (18 - 85 años).
  - `estadocivil`: 0 = Soltero, 1 = Casado.
  - `jubilado`: 0 = No, 1 = Sí.
  - `genero`: 0 = Femenino, 1 = Masculino.
  - `ingresos`: Nivel de ingresos mensuales reportados (en miles de USD).
- **Servicios Contratados:**
  - `fijo`: Telefonía fija (0/1).
  - `largadistancia`: Servicio de llamadas internacionales/larga distancia (0/1).
  - `internetcasa`: Banda ancha fija en el hogar (0/1).
  - `numoculto`: Servicio de número privado u oculto (0/1).
- **Comportamiento & Consumo:**
  - `minutos_preferido`: Minutos de voz a números favoritos o de la misma red.
  - `minutos_no_preferido`: Minutos de voz a otras operadoras / números externos.
  - `adicionales`: Minutos o servicios suplementarios consumidos.
  - `internet_gigas`: Consumo de datos móviles en gigabytes (GB).
  - `equipo_dolares`: Valor estimado o costo del dispositivo móvil (USD).

### ⚙️ Lógica de Transformación (R Pipeline)
1. **Feature Engineering:**
   $$\text{servicios} = \text{fijo} + \text{largadistancia} + \text{internetcasa} + \text{numoculto}$$
2. **Transformación Logarítmica:**
   Se aplica $\log(1 + x)$ a las 4 variables con asimetría positiva:
   - `minutos_preferido`
   - `adicionales`
   - `minutos_no_preferido`
   - `internet_gigas`
3. **Estandarización Z-Score:**
   $$z = \frac{x - \mu}{\sigma}$$
   Aplicada a las 6 variables del clustering: `minutos_preferido`, `adicionales`, `minutos_no_preferido`, `internet_gigas`, `servicios`, `equipo_dolares`.

---

## 🚀 Instalación y Ejecución Local

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm o pnpm

### Pasos
```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/telco-segmentation-studio.git
cd telco-segmentation-studio

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Añadir tu GEMINI_API_KEY en .env

# 4. Iniciar servidor de desarrollo (Full-Stack Express + Vite en puerto 3000)
npm run dev
```

Abre tu navegador en: `http://localhost:3000`

---

## 📡 Endpoints del Backend Express

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/upload` | Carga e ingesta de nuevos datasets estructurados |
| `POST` | `/api/preprocessing` | Ejecuta ingeniería de `servicios`, $\log(1+x)$ y $Z$-score |
| `POST` | `/api/kmeans` | Ejecuta K-Means con semilla y retorna $WSS$, $BetweenSS$ y centroides |
| `POST` | `/api/clusters` | Retorna los perfiles comerciales de cada cluster |
| `POST` | `/api/gap-statistic` | Simulación Monte Carlo del estadístico Gap |
| `POST` | `/api/silhouette` | Cálculo de coeficientes de cohesión y separación |
| `GET` | `/api/export` | Descarga de base segmentada en formato CSV |
| `POST` | `/api/gemini` | Generación de análisis estratégico con Google Gemini 3.8 Flash |

---

## 🐙 Comandos para Publicar en GitHub

```bash
git init
git add .
git commit -m "Initial Commit: Solución completa de segmentación telco"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/telco-segmentation-studio.git
git push -u origin main
```

---

## ☁️ Guía Paso a Paso para Despliegue en Vercel

1. **Crear Repositorio en GitHub**: Sube tu código siguiendo los comandos anteriores.
2. **Conectar en Vercel**:
   - Ingresa a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
   - Haz clic en **Add New Project** y selecciona tu repositorio.
3. **Configuración de Compilación (Build & Output Settings)**:
   - Framework Preset: `Vite` (o `Other`).
   - Build Command: `npm run build`.
   - Output Directory: `dist`.
4. **Configurar Variables de Entorno**:
   - En la sección **Environment Variables**, crea:
     - `GEMINI_API_KEY`: Tu clave de API obtenida en Google AI Studio.
5. **Ejecutar Despliegue**:
   - Presiona **Deploy**. Vercel compilará el frontend estático y desplegará la solución globalmente con soporte de enrutamiento SPA mediante el archivo `vercel.json`.
6. **Validación**:
   - Ingresa a la URL provista por Vercel (ej: `https://telco-segmentation-studio.vercel.app`).
   - Verifica la interactividad de los 9 módulos, la descarga del Excel y la generación del informe PDF.

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **Apache-2.0**.
