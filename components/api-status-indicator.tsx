import { cn } from '@/lib/utils'

interface Props {
  className?: string
}

export async function ApiStatusIndicator({ className }: Props) {
  // Check which API keys are configured
  const hasOpenAI = !!process.env.OPENAI_API_KEY
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY
  
  const isConfigured = hasOpenAI || hasAnthropic
  
  // Determine which provider is active
  let provider = 'Not Configured'
  if (hasOpenAI && hasAnthropic) {
    provider = 'OpenAI + Anthropic'
  } else if (hasOpenAI) {
    provider = 'OpenAI'
  } else if (hasAnthropic) {
    provider = 'Anthropic'
  }
  
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border',
        isConfigured
          ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400'
          : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400',
        className
      )}
      title={
        isConfigured
          ? `AI API Connected: ${provider}`
          : 'No AI API key configured. Add OPENAI_API_KEY or ANTHROPIC_API_KEY to environment variables.'
      }
    >
      {/* Status Indicator Dot */}
      <div
        className={cn(
          'w-2 h-2 rounded-full',
          isConfigured ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        )}
      />
      
      {/* Provider Text - Hidden on mobile */}
      <span className="hidden md:inline">
        {isConfigured ? provider : 'API Not Configured'}
      </span>
      
      {/* Mobile: Just show "API" text */}
      <span className="md:hidden">
        {isConfigured ? 'API' : '!API'}
      </span>
    </div>
  )
}

