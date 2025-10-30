import { NextResponse } from 'next/server'

/**
 * Health check endpoint to verify API keys are configured
 * This helps debug environment variable issues
 */
export async function GET() {
  const hasOpenAI = !!process.env.OPENAI_API_KEY
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY
  
  // Don't expose the actual keys, just check if they exist
  const openAIConfigured = hasOpenAI ? 'configured' : 'missing'
  const anthropicConfigured = hasAnthropic ? 'configured' : 'missing'
  
  // Check which key is actually set
  let activeProvider = 'none'
  if (hasOpenAI && hasAnthropic) {
    activeProvider = 'both'
  } else if (hasOpenAI) {
    activeProvider = 'openai'
  } else if (hasAnthropic) {
    activeProvider = 'anthropic'
  }
  
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    apiKeys: {
      openai: openAIConfigured,
      anthropic: anthropicConfigured,
      activeProvider,
    },
    configured: hasOpenAI || hasAnthropic,
  })
}

