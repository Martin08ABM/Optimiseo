// Proveedor de IA exclusivo para Google Gemini en OptimiSEO
// Elimina todas las dependencias y fallbacks de Claude/OpenRouter

import { estimateCost } from './config';
import { ErrorTracker } from '@/src/lib/logger/errorTracker';

export interface AIProviderConfig {
  apiKey: string;
  model?: string;
}

export interface CompletionRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  tools?: any[];
  maxTokens?: number;
  temperature?: number;
}

export interface CompletionResponse {
  content: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  cost?: number;
}

export class AIProvider {
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const startTime = Date.now();
    
    try {
      const result = await this.callGemini(request);
      const duration = Date.now() - startTime;
      console.log(`AI request completed in ${duration}ms using ${result.model}`);
      
      return result;
    } catch (error) {
      ErrorTracker.trackAnalysisError(error, {
        metadata: {
          provider: 'gemini',
          model: this.config.model,
          hasTools: !!request.tools,
        }
      });
      throw error;
    }
  }

  private async callGemini(request: CompletionRequest): Promise<CompletionResponse> {
    const apiKey = this.config.apiKey;
    
    if (!apiKey) {
      throw new Error('Falta configurar la variable GEMINI_API_KEY en .env.local');
    }
    
    let modelName = this.config.model || 'gemini-2.5-flash';
    
    if (modelName.startsWith('google/')) {
      modelName = modelName.replace('google/', '');
    }

    // Traducir roles: assistant -> model
    const contents = request.messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const body: any = {
      contents,
      generationConfig: {
        temperature: request.temperature ?? 0.85,
        maxOutputTokens: request.maxTokens ?? 4096,
      }
    };

    // Habilitar Google Search Grounding automáticamente para análisis SEO, excepto para reescrituras simples de textos
    const isRewrite = request.maxTokens !== undefined && request.maxTokens <= 1024 && contents[0]?.parts[0]?.text?.includes('copywriting SEO');
    if (!isRewrite) {
      body.tools = [
        {
          googleSearch: {}
        }
      ];
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Gemini API error (${response.status}): ${errorText}`);
    }

    const responseData = await response.json();
    
    const candidate = responseData.candidates?.[0];
    const contentText = candidate?.content?.parts?.[0]?.text || '';
    
    const usage = responseData.usageMetadata;
    const inputTokens = usage?.promptTokenCount || 0;
    const outputTokens = usage?.candidatesTokenCount || 0;
    
    return {
      content: contentText,
      model: modelName,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: usage?.totalTokenCount || (inputTokens + outputTokens),
      },
      cost: estimateCost(modelName, inputTokens, outputTokens),
    };
  }

  // Inicializa el proveedor usando la variable de entorno de Gemini
  static fromEnvironment(): AIProvider {
    const geminiKey = process.env.GEMINI_API_KEY || '';
    
    return new AIProvider({
      apiKey: geminiKey,
      model: 'gemini-2.5-flash',
    });
  }
}

// Inicializa el proveedor de IA con soporte exclusivo de Gemini
export function createAIProvider(config: Partial<AIProviderConfig> = {}): AIProvider {
  const apiKey = config.apiKey || process.env.GEMINI_API_KEY || '';
  
  return new AIProvider({
    apiKey,
    model: config.model || 'gemini-2.5-flash',
  });
}

export default AIProvider;