'use client';

import { useState } from 'react';

interface HeroFormProps {
  onSubmit: (data: { 
    url: string; 
    analysisType: string; 
    directText?: string; 
    targetKeyword?: string; 
    competitorUrls?: string[] 
  }) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function HeroForm({ onSubmit, disabled, isLoading }: HeroFormProps) {
  const [activeTab, setActiveTab] = useState<'url' | 'text'>('url');
  const [url, setUrl] = useState('');
  const [directText, setDirectText] = useState('');
  const [textTitle, setTextTitle] = useState('');
  const [analysisType, setAnalysisType] = useState('readability-analyzer');
  const [urlError, setUrlError] = useState('');
  
  // Advanced options states
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [targetKeyword, setTargetKeyword] = useState('');
  const [competitor1, setCompetitor1] = useState('');
  const [competitor2, setCompetitor2] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError('');

    if (!analysisType.trim()) {
      setUrlError('Por favor selecciona un tipo de análisis');
      return;
    }

    if (activeTab === 'url') {
      if (!url.trim()) {
        setUrlError('Por favor ingresa una URL válida');
        return;
      }
      
      const competitorUrls = [competitor1, competitor2]
        .map(u => u.trim())
        .filter(u => u.length > 0);

      onSubmit({ 
        url, 
        analysisType, 
        targetKeyword: targetKeyword.trim() || undefined,
        competitorUrls: competitorUrls.length > 0 ? competitorUrls : undefined
      });
    } else {
      if (!directText.trim()) {
        setUrlError('Por favor escribe o pega algún texto para analizar');
        return;
      }

      onSubmit({ 
        url: textTitle.trim() || 'Borrador de texto', 
        analysisType,
        directText: directText.trim(),
        targetKeyword: targetKeyword.trim() || undefined
      });
    }
  };

  const analysisOptions = [
    { value: 'readability-analyzer', label: 'Análisis de Legibilidad' },
    { value: 'keyword-density', label: 'Densidad de Palabras Clave' },
    { value: 'title-content-match', label: 'Coherencia Título-Contenido' },
    { value: 'title-rewriter', label: 'Sugerencias de Títulos' },
    { value: 'keyword-extractor', label: 'Extracción de Keywords' },
    { value: 'meta-description', label: 'Análisis de Metadatos' },
    { value: 'content-completeness', label: 'Integridad del Contenido' },
  ];

  return (
    <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-2xl p-6 shadow-xl w-full">
      {/* Tabs selector */}
      <div className="flex border-b border-gray-700 mb-6 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          disabled={isLoading}
          className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 flex justify-center items-center gap-2 ${
            activeTab === 'url'
              ? 'border-blue-500 text-blue-400 font-bold'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          Analizar URL
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('text')}
          disabled={isLoading}
          className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 flex justify-center items-center gap-2 ${
            activeTab === 'text'
              ? 'border-blue-500 text-blue-400 font-bold'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Texto Directo
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tab 1: URL input */}
        {activeTab === 'url' && (
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase text-gray-400 tracking-wider">URL de tu sitio web</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://tu-sitio-web.com/mi-articulo"
              disabled={disabled || isLoading}
              className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-all placeholder-gray-500"
              required={activeTab === 'url'}
            />
          </div>
        )}

        {/* Tab 2: Direct Text inputs */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase text-gray-400 tracking-wider">Título del borrador (H1)</label>
              <input
                type="text"
                value={textTitle}
                onChange={(e) => setTextTitle(e.target.value)}
                placeholder="Título del artículo u optimización"
                disabled={disabled || isLoading}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-all placeholder-gray-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase text-gray-400 tracking-wider">Contenido del artículo</label>
              <textarea
                value={directText}
                onChange={(e) => setDirectText(e.target.value)}
                placeholder="Escribe, edita o pega tu contenido completo aquí para realizar una optimización de SEO en tiempo real..."
                disabled={disabled || isLoading}
                rows={8}
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-all placeholder-gray-500 resize-y font-sans text-sm leading-relaxed"
                required={activeTab === 'text'}
              />
              <div className="text-right text-xs text-gray-500">
                {directText.trim().split(/\s+/).filter(Boolean).length} palabras | {directText.length} caracteres
              </div>
            </div>
          </div>
        )}

        {/* Common: Analysis selection */}
        <div className="space-y-2">
          <label htmlFor="selection" className="block text-xs font-semibold uppercase text-gray-400 tracking-wider">Tipo de Análisis</label>
          <select
            id="selection"
            value={analysisType}
            onChange={(e) => setAnalysisType(e.target.value)}
            disabled={disabled || isLoading}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-all cursor-pointer"
            required
          >
            {analysisOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-gray-800">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Collapsible advanced options (Auditoría SEO) */}
        <div className="border border-gray-700 rounded-xl bg-gray-900/50 overflow-hidden transition-all duration-300">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            aria-expanded={showAdvanced}
            aria-controls="hero-advanced-options"
            className="w-full flex justify-between items-center px-4 py-3 text-sm font-semibold text-gray-300 hover:bg-gray-700/30 transition-colors"
          >
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-blue-400" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Opciones Avanzadas (Auditoría de Competidores)
            </span>
            <svg
              className={`h-4 w-4 text-gray-500 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              aria-hidden="true"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAdvanced && (
            <div id="hero-advanced-options" className="p-4 border-t border-gray-700 space-y-4 bg-gray-900/80">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-400">Palabra Clave Objetivo (Target Keyword)</label>
                <input
                  type="text"
                  value={targetKeyword}
                  onChange={(e) => setTargetKeyword(e.target.value)}
                  placeholder="Ej: mejores zapatillas running"
                  disabled={disabled || isLoading}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all"
                />
              </div>

              {activeTab === 'url' && (
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-gray-400">URLs de Competidores Directos (SERP)</label>
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={competitor1}
                      onChange={(e) => setCompetitor1(e.target.value)}
                      placeholder="https://competidor-1.com/su-articulo"
                      disabled={disabled || isLoading}
                      className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all"
                    />
                    <input
                      type="url"
                      value={competitor2}
                      onChange={(e) => setCompetitor2(e.target.value)}
                      placeholder="https://competidor-2.com/su-articulo"
                      disabled={disabled || isLoading}
                      className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all"
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 leading-tight block">
                    * El scraping se realiza de forma segura en paralelo. Esto nos permite comparar y darte consejos específicos sobre qué añadir para superarlos.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {urlError && (
          <div className="p-3 bg-red-900/30 border border-red-500/50 text-red-200 text-sm rounded-xl">
            {urlError}
          </div>
        )}

        <button
          type="submit"
          disabled={disabled || isLoading}
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Ejecutando Análisis SEO...
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Iniciar Análisis Completo
            </>
          )}
        </button>
      </form>
    </div>
  );
}