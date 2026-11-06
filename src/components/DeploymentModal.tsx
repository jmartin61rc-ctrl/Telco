import React, { useState } from 'react';
import {
  X,
  GitBranch,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentModal: React.FC<DeploymentModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const gitCommands = `git init
git add .
git commit -m "Initial Commit: Telco Customer Segmentation Platform"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/telco-segmentation-studio.git
git push -u origin main`;

  const vercelJson = `{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-750 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Guía de Publicación en GitHub & Despliegue en Vercel
              </h2>
              <p className="text-xs text-slate-400">
                Paso a paso para versionar el código fuente y llevar la solución a producción
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          
          {/* STEP 1: GITHUB COMMANDS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">
                  1
                </span>
                Comandos de Inicialización en Git & GitHub
              </h3>
              <button
                onClick={() => copyText(gitCommands, 'git')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                {copiedSection === 'git' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'git' ? '¡Copiado!' : 'Copiar Comandos'}</span>
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300">
              <pre>{gitCommands}</pre>
            </div>
          </div>

          {/* STEP 2: VERCEL DEPLOYMENT FLOW */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">
                2
              </span>
              Conexión y Despliegue en Vercel (Paso a Paso)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-100 block">Paso 2.1: Importar Repositorio</span>
                <p className="text-slate-400 text-[11px]">
                  Inicia sesión en <code className="text-blue-400">vercel.com</code>, selecciona <strong>Add New Project</strong> y vincula tu repositorio de GitHub recién creado.
                </p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-100 block">Paso 2.2: Build Settings</span>
                <p className="text-slate-400 text-[11px]">
                  Vercel detecta Vite automáticamente. Build command: <code className="text-emerald-400">npm run build</code>, Output directory: <code className="text-emerald-400">dist</code>.
                </p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-100 block">Paso 2.3: Configurar GEMINI_API_KEY</span>
                <p className="text-slate-400 text-[11px]">
                  En <strong>Environment Variables</strong> añade <code className="text-cyan-300">GEMINI_API_KEY</code> con tu clave de Google AI Studio para habilitar el Módulo 7 en producción.
                </p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-100 block">Paso 2.4: Deploy & Verificación</span>
                <p className="text-slate-400 text-[11px]">
                  Presiona <strong>Deploy</strong>. Vercel generará una URL global con CDN, certificado SSL automático y respuesta en milisegundos.
                </p>
              </div>
            </div>
          </div>

          {/* STEP 3: VERCEL.JSON CONFIGURATION */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">
                  3
                </span>
                Archivo de Configuración vercel.json
              </h3>
              <button
                onClick={() => copyText(vercelJson, 'vercel')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                {copiedSection === 'vercel' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'vercel' ? '¡Copiado!' : 'Copiar vercel.json'}</span>
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300">
              <pre>{vercelJson}</pre>
            </div>
          </div>

          {/* TROUBLESHOOTING */}
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200 space-y-1 text-xs">
            <span className="font-bold flex items-center gap-1.5 text-amber-400">
              <AlertCircle className="w-4 h-4" /> Resolución de Errores Frecuentes
            </span>
            <ul className="list-disc pl-5 space-y-1 text-[11px] text-amber-200/90 pt-1">
              <li><strong>Error 404 en subrutas de Vercel:</strong> El archivo <code>vercel.json</code> resuelve el enrutamiento client-side hacia <code>index.html</code>.</li>
              <li><strong>GEMINI_API_KEY no detectada:</strong> Recuerda redeployar el proyecto en Vercel después de guardar la variable de entorno.</li>
              <li><strong>Tamaño de archivo excedido:</strong> El parser local soporta hojas de cálculo de hasta 100,000 registros fluidamente en memoria.</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg transition-colors"
          >
            Entendido, cerrar guía
          </button>
        </div>

      </div>
    </div>
  );
};
