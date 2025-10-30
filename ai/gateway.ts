import { createGatewayProvider } from '@ai-sdk/gateway'
import { Models } from './constants'
import type { JSONValue } from 'ai'
import type { OpenAIResponsesProviderOptions } from '@ai-sdk/openai'
import type { LanguageModelV2 } from '@ai-sdk/provider'

export async function getAvailableModels() {
  const gateway = gatewayInstance()
  const response = await gateway.getAvailableModels()
  return response.models.map((model) => ({ id: model.id, name: model.name }))
}

export interface ModelOptions {
  model: LanguageModelV2
  providerOptions?: Record<string, Record<string, JSONValue>>
  headers?: Record<string, string>
}

export function getModelOptions(
  modelId: string,
  options?: { reasoningEffort?: 'minimal' | 'low' | 'medium' }
): ModelOptions {
  const gateway = gatewayInstance()
  if (modelId === Models.OpenAIGPT5) {
    return {
      model: gateway(modelId),
      providerOptions: {
        openai: {
          include: ['reasoning.encrypted_content'],
          reasoningEffort: options?.reasoningEffort ?? 'low',
          reasoningSummary: 'auto',
          serviceTier: 'priority',
        } satisfies OpenAIResponsesProviderOptions,
      },
    }
  }

  if (
    modelId === Models.AnthropicClaude4Sonnet ||
    modelId === Models.AnthropicClaude45Sonnet
  ) {
    return {
      model: gateway(modelId),
      headers: { 'anthropic-beta': 'fine-grained-tool-streaming-2025-05-14' },
      providerOptions: {
        anthropic: {
          cacheControl: { type: 'ephemeral' },
        },
      },
    }
  }

  return {
    model: gateway(modelId),
  }
}

function gatewayInstance() {
  // If no gateway URL is set, use direct API access to avoid Vercel rate limits
  // The AI SDK will automatically use ANTHROPIC_API_KEY or OPENAI_API_KEY
  const baseURL = process.env.AI_GATEWAY_BASE_URL
  
  return createGatewayProvider({
    baseURL: baseURL || undefined, // undefined = use direct API provider
  })
}
