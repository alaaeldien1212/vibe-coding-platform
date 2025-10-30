# Fixing Vercel AI Rate Limiting Error

## ⚠️ Problem

You're seeing this error:
```
Free credits temporarily have rate limits in place due to abuse. 
Purchase credits at https://vercel.com/...
```

This happens because **Vercel's free AI credits are rate-limited**. You need to add your own AI provider API key.

## ✅ Solution: Add Your Own API Key

### Option 1: OpenAI (Recommended)

1. **Get an OpenAI API key**:
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Copy it (starts with `sk-...`)

2. **Add to Vercel**:
   - Go to your project in Vercel dashboard
   - Navigate to **Settings** → **Environment Variables**
   - Add a new variable:
     - **Name**: `OPENAI_API_KEY`
     - **Value**: Your API key (e.g., `sk-...`)
     - **Environment**: All (Production, Preview, Development)
   - Click **Save**

3. **Redeploy**:
   - Go to **Deployments**
   - Click **"..."** on the latest deployment
   - Click **Redeploy**

### Option 2: Anthropic (Claude)

1. **Get an Anthropic API key**:
   - Go to https://console.anthropic.com/
   - Create a new API key
   - Copy it (starts with `sk-ant-...`)

2. **Add to Vercel**:
   - Same steps as OpenAI above, but use:
     - **Name**: `ANTHROPIC_API_KEY`
     - **Value**: Your Anthropic API key

### Option 3: Both (For Flexibility)

You can add both keys and the app will use whichever is available.

## 🔧 Verify the Fix

After adding your API key and redeploying:

1. Go to your deployment URL
2. Try sending a message in the chat
3. The rate limit error should be gone ✅

## 💰 Cost Considerations

### OpenAI Pricing (GPT-4)
- **GPT-4o**: ~$2.50 per 1M input tokens, ~$10 per 1M output tokens
- **GPT-4o-mini**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- Typical conversation: $0.01 - $0.10

### Anthropic Pricing (Claude)
- **Claude 3.5 Sonnet**: ~$3 per 1M input tokens, ~$15 per 1M output tokens
- **Claude 3 Haiku**: ~$0.25 per 1M input tokens, ~$1.25 per 1M output tokens
- Typical conversation: $0.02 - $0.15

### Free Tiers
- **OpenAI**: $5 free credits for new accounts
- **Anthropic**: Limited free credits for testing

## 🎛️ Optional: Configure Model Selection

You can control which AI model to use in the settings of the deployed app, or configure it via code.

### In the UI:
1. Open the deployed app
2. Click the settings icon
3. Select your preferred model

### In Code:
Edit `ai/constants.ts` to change the default model:
```typescript
export const DEFAULT_MODEL = 'gpt-4o-mini' // Cheaper option
// or
export const DEFAULT_MODEL = 'claude-3-5-sonnet-20241022' // If using Anthropic
```

## 📊 Monitor Usage

### OpenAI
- Dashboard: https://platform.openai.com/usage
- Set usage limits to avoid surprises

### Anthropic
- Console: https://console.anthropic.com/
- Monitor API usage in real-time

## 🔒 Security Best Practices

1. **Never commit API keys** to git
2. **Use environment variables** in Vercel
3. **Set usage limits** in your AI provider dashboard
4. **Monitor costs** regularly
5. **Rotate keys** if compromised

## ❓ Troubleshooting

### Still seeing rate limit errors?

1. **Check environment variables are set**:
   - Go to Vercel → Settings → Environment Variables
   - Verify `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` exists

2. **Redeploy after adding variables**:
   - Environment variables don't apply to existing deployments
   - You must redeploy after adding them

3. **Check API key is valid**:
   - Test your key at https://platform.openai.com/playground
   - Or use curl:
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

4. **Verify billing is active**:
   - OpenAI: https://platform.openai.com/account/billing
   - Anthropic: https://console.anthropic.com/settings/billing

### Error: "Invalid API key"

- Check you copied the full key
- Regenerate a new key if needed
- Make sure it's added to Vercel correctly

### Error: "Insufficient funds"

- Add billing information to your AI provider account
- Top up your balance if needed

## 🚀 Quick Setup Script

For local development, create a `.env.local` file:

```bash
# Copy this and fill in your keys
OPENAI_API_KEY=sk-...
# or
ANTHROPIC_API_KEY=sk-ant-...

# Then run:
pnpm dev
```

## 📝 Summary

**The fix is simple**:
1. Get an API key from OpenAI or Anthropic
2. Add it to Vercel environment variables
3. Redeploy your application
4. The rate limit error will disappear ✅

**Cost**: Typical usage costs $0.01-$0.10 per conversation.

---

Need help? Check the [OpenAI docs](https://platform.openai.com/docs) or [Anthropic docs](https://docs.anthropic.com/).

