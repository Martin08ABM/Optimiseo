'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { SEOScores } from '@/src/lib/seo/scoreParser';
import type { ScrapedContent } from '@/src/app/api/ai/shared/types';
import RewritePanel from '../RewritePanel';

interface HeroResultsProps {
  result: {
    selection: string;
    provider: string;
    message: string;
    analysisId: string | null;
    scrapedData: Record<string, unknown> | null;
    scores: SEOScores | null;
    targetKeyword?: string;
    competitorData?: any[];
  } | null;
  onSave: () => void;
  onMonitor: () => void;
  saved: boolean;
  monitored: boolean;
  usage?: { used: number; limit: number; remaining: number };
  onReanalyze?: (draftData: { title: string; description: string; h1: string; content: string }) => Promise<void>;
  isReanalyzing?: boolean;
}

export function HeroResults({ 
  result, 
  onSave, 
  onMonitor, 
  saved, 
  monitored,
  usage,
  onReanalyze,
  isReanalyzing
}: HeroResultsProps) {
  // Local state for Active SEO Editor
  const [editorTitle, setEditorTitle] = useState('');
  const [editorDescription, setEditorDescription] = useState('');
  const [editorH1, setEditorH1] = useState('');
  const [editorContent, setEditorContent] = useState('');

  // Sync editor with scrapedData when result changes
  useEffect(() => {
    if (result && result.scrapedData) {
      const data = result.scrapedData as unknown as ScrapedContent;
      setEditorTitle(data.title || '');
      setEditorDescription(data.description || '');
      setEditorH1(data.h1?.[0] || '');
      setEditorContent(data.paragraphs?.join('\n\n') || '');
    }
  }, [result]);

  if (!result) return null;

  // Metric parser for competitor analysis
  const getMetrics = (data: any) => {
    if (!data) return { url: '-', wordCount: 0, h1: 0, h2: 0, h3: 0, images: 0, schema: false };
    return {
      url: data.url || 'Borrador Directo',
      wordCount: data.wordCount || 0,
      h1: data.h1?.length || 0,
      h2: data.h2?.length || 0,
      h3: data.h3?.length || 0,
      images: data.images?.length || 0,
      schema: !!data.schemaMarkup
    };
  };

  const mainMetrics = getMetrics(result.scrapedData);
  const compMetrics = (result.competitorData || []).map(getMetrics);

  const handleApplyText = (elementType: string, text: string) => {
    if (elementType === 'title') {
      setEditorTitle(text);
    } else if (elementType === 'meta-description') {
      setEditorDescription(text);
    } else if (elementType === 'h1') {
      setEditorH1(text);
    } else if (elementType === 'paragraph') {
      const scrapedParas = (result.scrapedData as unknown as ScrapedContent)?.paragraphs || [];
      const paras = editorContent.split(/\n\s*\n/);
      
      let replaced = false;
      for (let i = 0; i < Math.min(scrapedParas.length, 2); i++) {
        const originalPara = scrapedParas[i];
        const indexInEditor = paras.findIndex(p => p.trim() === originalPara.trim());
        if (indexInEditor !== -1) {
          paras[indexInEditor] = text;
          setEditorContent(paras.join('\n\n'));
          replaced = true;
          break;
        }
      }
      
      if (!replaced) {
        if (paras.length > 0) {
          paras[0] = text;
          setEditorContent(paras.join('\n\n'));
        } else {
          setEditorContent(text);
        }
      }
    }
  };

  const handleReanalyzeClick = () => {
    if (onReanalyze) {
      onReanalyze({
        title: editorTitle,
        description: editorDescription,
        h1: editorH1,
        content: editorContent
      });
    }
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Title & Usage Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-700 pb-4">
        <div>
          <h3 className="text-2xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-200">
            Resultados del Análisis
          </h3>
          <p className="text-gray-400 text-xs mt-1">
            Revisa métricas clave, optimiza tu contenido en el editor activo y obtén sugerencias inteligentes.
          </p>
        </div>
        <div className="text-xs bg-gray-800/80 px-3 py-1.5 border border-gray-700 rounded-lg text-gray-400 font-medium">
          Uso diario: <span className="text-white font-bold">{usage?.used || 0}</span>/<span className="text-gray-500">{usage?.limit || 0}</span> ({usage?.remaining || 0} rest.)
        </div>
      </div>

      {/* Competitor Gap Analysis Table */}
      {compMetrics.length > 0 ? (
        <div className="bg-gray-800/60 backdrop-blur-md border border-gray-700/80 rounded-2xl p-5 shadow-xl transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Auditoría de Competidores SERP (Gap Analysis)</h4>
              <p className="text-xs text-gray-400">Comparativa en tiempo real con las mejores páginas posicionadas.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-700/60 bg-gray-900/40">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-800/60">
                  <th className="p-3.5 font-bold text-gray-300 uppercase tracking-wider">Métrica</th>
                  <th className="p-3.5 font-bold text-blue-400 uppercase tracking-wider bg-blue-500/5">Tu Página (Borrador)</th>
                  {compMetrics.map((comp, idx) => (
                    <th key={idx} className="p-3.5 font-bold text-purple-400 uppercase tracking-wider">
                      Competidor {idx + 1}
                      <span className="block text-[9px] text-gray-500 font-normal truncate max-w-[160px] lowercase mt-0.5">
                        {comp.url}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {result.targetKeyword && (
                  <tr className="hover:bg-gray-800/10">
                    <td className="p-3.5 font-semibold text-gray-400">Keyword Objetivo</td>
                    <td className="p-3.5 bg-blue-500/5">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {result.targetKeyword}
                      </span>
                    </td>
                    {compMetrics.map((comp, idx) => (
                      <td key={idx} className="p-3.5">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {result.targetKeyword}
                        </span>
                      </td>
                    ))}
                  </tr>
                )}
                <tr className="hover:bg-gray-800/10">
                  <td className="p-3.5 font-semibold text-gray-400">Extensión (Palabras)</td>
                  <td className="p-3.5 font-bold text-white bg-blue-500/5">{mainMetrics.wordCount}</td>
                  {compMetrics.map((comp, idx) => (
                    <td key={idx} className="p-3.5 text-gray-300 font-medium">{comp.wordCount}</td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-800/10">
                  <td className="p-3.5 font-semibold text-gray-400">Títulos H1</td>
                  <td className="p-3.5 font-bold text-white bg-blue-500/5">{mainMetrics.h1}</td>
                  {compMetrics.map((comp, idx) => (
                    <td key={idx} className="p-3.5 text-gray-300">{comp.h1}</td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-800/10">
                  <td className="p-3.5 font-semibold text-gray-400">Subtítulos H2</td>
                  <td className="p-3.5 font-bold text-white bg-blue-500/5">{mainMetrics.h2}</td>
                  {compMetrics.map((comp, idx) => (
                    <td key={idx} className="p-3.5 text-gray-300">{comp.h2}</td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-800/10">
                  <td className="p-3.5 font-semibold text-gray-400">Subtítulos H3</td>
                  <td className="p-3.5 font-bold text-white bg-blue-500/5">{mainMetrics.h3}</td>
                  {compMetrics.map((comp, idx) => (
                    <td key={idx} className="p-3.5 text-gray-300">{comp.h3}</td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-800/10">
                  <td className="p-3.5 font-semibold text-gray-400">Imágenes Totales</td>
                  <td className="p-3.5 font-bold text-white bg-blue-500/5">{mainMetrics.images}</td>
                  {compMetrics.map((comp, idx) => (
                    <td key={idx} className="p-3.5 text-gray-300">{comp.images}</td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-800/10">
                  <td className="p-3.5 font-semibold text-gray-400">Marcado de Schema</td>
                  <td className="p-3.5 bg-blue-500/5">
                    {mainMetrics.schema ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                        ✓ Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                        ✗ Ausente
                      </span>
                    )}
                  </td>
                  {compMetrics.map((comp, idx) => (
                    <td key={idx} className="p-3.5">
                      {comp.schema ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                          ✓ Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                          ✗ Ausente
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-gray-900/40 border border-gray-700/60 rounded-xl p-4 flex items-start gap-3 transition-colors hover:border-gray-600/60">
          <div className="text-lg p-1 bg-blue-500/10 rounded border border-blue-500/20 select-none">💡</div>
          <p className="text-xs text-gray-400 leading-relaxed">
            <strong className="text-gray-300">Tip de Experto:</strong> Activa el análisis de competidores en <span className="font-semibold text-blue-400">Opciones Avanzadas</span> ingresando tu palabra clave y las URLs del top de la SERP. Analizaremos sus estructuras en paralelo para sugerirte qué añadir exactamente para superarlos.
          </p>
        </div>
      )}

      {/* Double Column Grid: Workspace Left vs SEO Metrics & Insights Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: ACTIVE SEO EDITOR (Workspace) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <svg className="h-4.5 w-4.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editor SEO Activo
              </h4>
              <span className="text-[10px] text-green-400 font-semibold px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20">
                Workspace Sincronizado
              </span>
            </div>

            <div className="space-y-4">
              {/* Meta Title */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Meta Title</label>
                  <span className={`text-[10px] font-semibold ${
                    editorTitle.length >= 40 && editorTitle.length <= 60 ? 'text-green-400' : 'text-yellow-500'
                  }`}>
                    {editorTitle.length}/60 caracteres {editorTitle.length >= 40 && editorTitle.length <= 60 ? '(Óptimo)' : ''}
                  </span>
                </div>
                <input
                  type="text"
                  value={editorTitle}
                  onChange={(e) => setEditorTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-semibold transition-all"
                  placeholder="Escribe el título SEO optimizado..."
                />
              </div>

              {/* Meta Description */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Meta Description</label>
                  <span className={`text-[10px] font-semibold ${
                    editorDescription.length >= 120 && editorDescription.length <= 160 ? 'text-green-400' : 'text-yellow-500'
                  }`}>
                    {editorDescription.length}/160 caracteres {editorDescription.length >= 120 && editorDescription.length <= 160 ? '(Óptimo)' : ''}
                  </span>
                </div>
                <textarea
                  value={editorDescription}
                  onChange={(e) => setEditorDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all resize-y leading-relaxed"
                  placeholder="Escribe una meta descripción persuasiva..."
                />
              </div>

              {/* H1 Tag */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider">Encabezado H1</label>
                <input
                  type="text"
                  value={editorH1}
                  onChange={(e) => setEditorH1(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-semibold transition-all"
                  placeholder="Título H1 del cuerpo del artículo..."
                />
              </div>

              {/* Main Content Body */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Contenido / Cuerpo de Texto</label>
                  <span className="text-[10px] text-gray-400 font-semibold">
                    {editorContent.trim() ? editorContent.trim().split(/\s+/).filter(Boolean).length : 0} palabras | {editorContent.length} caracteres
                  </span>
                </div>
                <textarea
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  rows={12}
                  className="w-full px-3.5 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all resize-y font-sans leading-relaxed text-gray-300"
                  placeholder="Comienza a redactar o edita tu artículo completo aquí. Aplica las sugerencias con un clic y vuelve a analizar..."
                />
              </div>
            </div>

            {/* Reanalyze Trigger */}
            <button
              type="button"
              onClick={handleReanalyzeClick}
              disabled={isReanalyzing || !editorContent.trim()}
              className="mt-2 w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.005] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {isReanalyzing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Calculando Nuevas Métricas SEO...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H12v2.582M12 4v4H8" />
                  </svg>
                  Re-analizar Borrador con IA
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: SEO SCORES & RECOMMENDATIONS */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* SEO Scores Block */}
          {result.scores && (
            <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-2xl p-5 shadow-xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3.5">Puntuaciones del Análisis</h4>
              <div className="grid grid-cols-2 gap-3">
                {result.scores.overall !== undefined && result.scores.overall !== null && (
                  <div className="p-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-center flex flex-col justify-center items-center">
                    <div className="text-3xl font-black text-blue-400 bg-clip-text bg-gradient-to-br from-blue-400 to-indigo-400">
                      {result.scores.overall}
                    </div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">SEO General</div>
                  </div>
                )}
                {result.scores.categories?.legibilidad !== undefined && result.scores.categories?.legibilidad !== null && (
                  <div className="p-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-center flex flex-col justify-center items-center">
                    <div className="text-3xl font-black text-green-400 bg-clip-text bg-gradient-to-br from-green-400 to-emerald-400">
                      {result.scores.categories.legibilidad}
                    </div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Legibilidad</div>
                  </div>
                )}
                {result.scores.categories?.keywords !== undefined && result.scores.categories?.keywords !== null && (
                  <div className="p-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-center flex flex-col justify-center items-center">
                    <div className="text-3xl font-black text-yellow-400 bg-clip-text bg-gradient-to-br from-yellow-400 to-amber-400">
                      {result.scores.categories.keywords}
                    </div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Palabras Clave</div>
                  </div>
                )}
                {result.scores.categories?.contenido !== undefined && result.scores.categories?.contenido !== null && (
                  <div className="p-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-center flex flex-col justify-center items-center">
                    <div className="text-3xl font-black text-purple-400 bg-clip-text bg-gradient-to-br from-purple-400 to-fuchsia-400">
                      {result.scores.categories.contenido}
                    </div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Contenido</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rewrite AI Assistant panel */}
          {result.scrapedData && (
            <RewritePanel 
              scrapedData={result.scrapedData as unknown as ScrapedContent} 
              onApplyText={handleApplyText} 
            />
          )}

          {/* AI Markdown Report */}
          <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-2xl p-5 shadow-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 border-b border-gray-700 pb-2">Diagnóstico y Consejos SEO</h4>
            <div className="prose prose-invert max-w-none text-xs leading-relaxed prose-headings:text-white prose-p:text-gray-300 prose-li:text-gray-300 prose-strong:text-white overflow-y-auto max-h-[500px] pr-1.5 custom-scrollbar">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
              >
                {result.message}
              </ReactMarkdown>
            </div>
          </div>

          {/* Save/Monitor actions */}
          <div className="flex gap-3">
            <button
              onClick={onSave}
              disabled={saved}
              className="flex-1 py-3 px-4 bg-green-600/90 hover:bg-green-600 disabled:bg-gray-800 disabled:border-gray-700 disabled:text-gray-500 border border-transparent text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              {saved ? 'Guardado ✓' : 'Guardar Reporte'}
            </button>
            <button
              onClick={onMonitor}
              disabled={monitored}
              className="flex-1 py-3 px-4 bg-blue-600/90 hover:bg-blue-600 disabled:bg-gray-800 disabled:border-gray-700 disabled:text-gray-500 border border-transparent text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {monitored ? 'Monitoreando ✓' : 'Monitorear Cambios'}
            </button>
          </div>

          {/* ID de análisis */}
          {result.analysisId && (
            <div className="text-[10px] text-gray-500 text-center select-all">
              Análisis ID: {result.analysisId}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}