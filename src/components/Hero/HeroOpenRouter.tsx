'use client';

import { useState, useEffect } from "react";
import { HeroForm } from "@/src/components/Hero/HeroForm";
import { HeroResults } from "@/src/components/Hero/HeroResults";
import { AnalysisProgress } from "@/src/components/AnalysisProgress";
import { ErrorBoundary } from "@/src/components/ErrorBoundary";
import type { SEOScores } from "@/src/lib/seo/scoreParser";
import type { ScrapedContent } from "@/src/app/api/ai/shared/types";
import { AnalysisRequestSchema, getValidationErrors } from "@/src/lib/validation/schemas";

interface AnalysisResult {
  selection: string;
  provider: string;
  message: string;
  analysisId: string | null;
  scrapedData: Record<string, unknown> | null;
  scores: SEOScores | null;
  cached?: boolean;
  usage?: { used: number; limit: number; remaining: number };
  targetKeyword?: string;
  competitorData?: any[];
}

interface UsageStats {
  used: number;
  limit: number;
  remaining: number;
}

interface HeroOpenRouterProps {
  isAuthenticated: boolean;
  usage?: UsageStats;
  isPro?: boolean;
}

export default function HeroOpenRouter({ isAuthenticated, usage: initialUsage, isPro }: HeroOpenRouterProps) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageStats | undefined>(initialUsage);
  const [saved, setSaved] = useState(false);
  const [monitored, setMonitored] = useState(false);

  useEffect(() => {
    setUsage(initialUsage);
  }, [initialUsage]);

  const handleSubmit = async ({ 
    url, 
    analysisType, 
    directText, 
    targetKeyword, 
    competitorUrls 
  }: { 
    url: string; 
    analysisType: string;
    directText?: string;
    targetKeyword?: string;
    competitorUrls?: string[];
  }) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setSaved(false);
    setMonitored(false);

    try {
      // Validate input before sending
      const validation = getValidationErrors(AnalysisRequestSchema, {
        prompt: url,
        context: { 
          selection: analysisType,
          url: directText ? undefined : url,
          targetKeyword: targetKeyword || undefined,
          competitorUrls: competitorUrls || undefined,
          directText: directText || undefined
        }
      });

      if (!validation.success) {
        const firstError = Object.values(validation.errors)[0];
        setError(firstError);
        return;
      }

      const response = await fetch('/api/ai/openrouter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: url,
          context: { 
            selection: analysisType,
            url: directText ? undefined : url,
            targetKeyword: targetKeyword || undefined,
            competitorUrls: competitorUrls || undefined,
            directText: directText || undefined
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al analizar la URL');
      }

      setResult(data);
      
      if (data.usage) {
        setUsage(data.usage);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);

      if (errorMessage.includes('limit') || errorMessage.includes('límite')) {
        try {
          const usageResponse = await fetch('/api/subscription/status');
          if (usageResponse.ok) {
            const data = await usageResponse.json();
            if (data.usage) {
              setUsage(data.usage);
            }
          }
        } catch {
          // Ignore usage update errors
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReanalyze = async (draftData: { title: string; description: string; h1: string; content: string }) => {
    await handleSubmit({
      url: draftData.title || 'Borrador de texto',
      analysisType: result?.selection || 'readability-analyzer',
      directText: draftData.content,
      targetKeyword: result?.targetKeyword || undefined,
      competitorUrls: result?.competitorData ? result.competitorData.map((c: any) => c.url).filter(Boolean) : undefined
    });
  };

  const handleSave = () => {
    setSaved(true);
    console.log('Guardando análisis:', result?.analysisId);
  };

  const handleMonitor = () => {
    setMonitored(true);
    console.log('Monitoreando cambios para:', result?.analysisId);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-6 mt-8 items-center max-w-full">
        <div className="text-center max-w-3xl px-4">
          <h1 className="font-title text-white text-xl md:text-2xl font-black mb-3">
            Tu ayudante para impulsar tus páginas optimizando el SEO sin parecer un robot
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Análisis inteligente con IA que detecta problemas y te da soluciones concretas
          </p>
        </div>
        
        <div className="max-w-2xl w-full px-4">
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-white mb-4">Inicia sesión para comenzar</h2>
            <p className="text-gray-400 mb-6">
              Crea una cuenta gratuita y obtén 5 análisis SEO diarios
            </p>
            <a
              href="/auth/login"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Iniciar sesión
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col gap-6 mt-8 items-center max-w-full">
        <div className="text-center max-w-3xl px-4">
          <h1 className="font-title text-white text-xl md:text-2xl font-black mb-3">
            Tu ayudante para impulsar tus páginas optimizando el SEO sin parecer un robot
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Análisis inteligente con IA que detecta problemas y te da soluciones concretas
          </p>
        </div>

        {usage && (
          <div className="w-full max-w-2xl px-4 mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Análisis disponibles hoy:</span>
              <span className={`font-semibold ${
                usage.remaining === 0 ? 'text-red-400' :
                usage.remaining < 3 ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {usage.remaining} / {usage.limit}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  usage.remaining === 0 ? 'bg-red-500' :
                  usage.remaining < 3 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${(usage.remaining / usage.limit) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="w-full max-w-2xl px-4">
          <HeroForm 
            onSubmit={handleSubmit}
            disabled={!isAuthenticated}
            isLoading={loading}
          />
        </div>

        {loading && (
          <div className="w-full max-w-2xl px-4">
            <AnalysisProgress />
          </div>
        )}

        {error && (
          <div className="w-full max-w-2xl px-4">
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          </div>
        )}

        {result && (
          <div className="w-full max-w-4xl px-4">
            <HeroResults
              result={result}
              onSave={handleSave}
              onMonitor={handleMonitor}
              saved={saved}
              monitored={monitored}
              usage={usage}
              onReanalyze={handleReanalyze}
              isReanalyzing={loading}
            />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}