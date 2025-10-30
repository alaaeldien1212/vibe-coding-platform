# Deployment Guide

This guide covers deploying the Vibe Coding Platform with Trigger.dev integration to production.

## 📋 Pre-Deployment Checklist

- [ ] Node.js 22.x or higher installed
- [ ] Git repository set up
- [ ] AI provider API key (OpenAI, Anthropic, etc.)
- [ ] Vercel account (for hosting)
- [ ] Optional: Trigger.dev account (for cloud execution)

## 🚀 Deploy to Vercel

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add OPENAI_API_KEY
   # or
   vercel env add ANTHROPIC_API_KEY
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit with Trigger.dev integration"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/vibe-coding-platform.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Environment Variables**
   
   In the Vercel dashboard, add these environment variables:
   
   **Required:**
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```
   or
   ```
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

   **Optional (for Trigger.dev cloud):**
   ```
   TRIGGER_PROJECT_ID=your_trigger_project_id
   TRIGGER_API_KEY=your_trigger_api_key
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be live at `https://your-app.vercel.app`

## 🔧 Configuration for Production

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `OPENAI_API_KEY` | Yes* | OpenAI API key | `sk-...` |
| `ANTHROPIC_API_KEY` | Yes* | Anthropic API key | `sk-ant-...` |
| `TRIGGER_PROJECT_ID` | No | Trigger.dev project ID | `proj_abc123` |
| `TRIGGER_API_KEY` | No | Trigger.dev API key | `tr_dev_...` |
| `NEXT_PUBLIC_APP_URL` | No | Public app URL | `https://your-app.vercel.app` |

\* At least one AI provider API key is required

### Vercel Settings

1. **Build Settings**
   - Framework Preset: `Next.js`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

2. **Function Settings**
   - Node.js Version: `22.x`
   - Memory: 1024 MB (recommended)
   - Max Duration: 60s (or as needed)

## 🎯 Deploy Trigger.dev Tasks (Optional)

For cloud-based sandbox execution with Trigger.dev:

### 1. Create Trigger.dev Account

1. Visit [trigger.dev](https://trigger.dev) and sign up
2. Create a new project
3. Copy your Project ID and API Key

### 2. Configure Environment

Add to Vercel environment variables:
```bash
TRIGGER_PROJECT_ID=your_project_id
TRIGGER_API_KEY=your_api_key
```

### 3. Deploy Tasks

From your local machine:

```bash
# Install Trigger.dev CLI
npm install -g @trigger.dev/cli

# Login to Trigger.dev
npx trigger.dev@latest login

# Deploy tasks
npm run trigger:deploy
```

### 4. Update Trigger Client (Optional)

To use remote execution instead of local, modify `lib/trigger-client.ts`:

```typescript
import { tasks } from "@trigger.dev/sdk/v3";

// In TriggerSandbox.create()
static async create(options: {
  timeout?: number;
  ports?: number[];
}): Promise<TriggerSandbox> {
  // Use remote task execution
  const result = await tasks.trigger("create-sandbox", options);
  const sandboxInfo = result.output as SandboxInfo;
  return new TriggerSandbox(sandboxInfo);
}
```

## 🔒 Security Considerations

### Production Security

1. **API Keys**
   - Store all API keys as environment variables
   - Never commit API keys to git
   - Rotate keys regularly

2. **Rate Limiting**
   - Implement rate limiting for API endpoints
   - Monitor usage and costs

3. **Sandbox Isolation**
   - Use Trigger.dev cloud for better isolation
   - Implement timeouts and resource limits
   - Monitor sandbox creation and cleanup

4. **Authentication**
   - Consider adding authentication for production use
   - Implement usage quotas per user

### Recommended Security Enhancements

```typescript
// Add to app/api/chat/route.ts
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  // Add rate limiting
  const identifier = req.headers.get('x-forwarded-for') || 'anonymous'
  const { success } = await rateLimit.check(identifier)
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }
  
  // ... rest of the code
}
```

## 📊 Monitoring and Logging

### Vercel Analytics

Enable Vercel Analytics for monitoring:

1. Go to your project in Vercel dashboard
2. Navigate to "Analytics"
3. Enable Web Analytics

### Trigger.dev Monitoring

If using Trigger.dev cloud:

1. View task runs in Trigger.dev dashboard
2. Monitor execution times and errors
3. Set up alerts for failures

### Application Logs

View logs in Vercel:
```bash
vercel logs
```

Or in Vercel dashboard:
1. Go to your project
2. Click "Logs"
3. Filter by function or time range

## 🧪 Testing Deployment

### 1. Health Check

After deployment, test the following:

1. **Homepage loads**: Visit your deployment URL
2. **Chat works**: Send a test message
3. **Sandbox creation**: Ask AI to create a sandbox
4. **Code execution**: Request a simple script to run
5. **File operations**: Test file generation

### 2. Automated Tests

Create a test script `scripts/test-deployment.js`:

```javascript
const fetch = require('node-fetch');

const DEPLOYMENT_URL = process.env.DEPLOYMENT_URL || 'http://localhost:3000';

async function testDeployment() {
  console.log('Testing deployment at:', DEPLOYMENT_URL);
  
  // Test 1: Homepage
  const homeResponse = await fetch(DEPLOYMENT_URL);
  console.log('✓ Homepage:', homeResponse.ok ? 'OK' : 'FAILED');
  
  // Test 2: API Health
  const apiResponse = await fetch(`${DEPLOYMENT_URL}/api/models`);
  console.log('✓ API:', apiResponse.ok ? 'OK' : 'FAILED');
  
  // Add more tests as needed
}

testDeployment().catch(console.error);
```

Run tests:
```bash
DEPLOYMENT_URL=https://your-app.vercel.app node scripts/test-deployment.js
```

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

### Preview Deployments

Create preview deployments for pull requests:

1. Create a new branch
   ```bash
   git checkout -b feature/new-feature
   ```

2. Make changes and push
   ```bash
   git add .
   git commit -m "Add new feature"
   git push origin feature/new-feature
   ```

3. Create a pull request on GitHub
4. Vercel creates a preview deployment automatically

## 🐛 Troubleshooting

### Build Failures

**Error: "Module not found"**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Error: "Type errors"**
```bash
# Check types locally
npm run type-check
```

### Runtime Errors

**Error: "API key not found"**
- Verify environment variables are set in Vercel dashboard
- Check variable names match exactly

**Error: "Sandbox creation failed"**
- Check Trigger.dev configuration
- Verify timeout settings
- Review error logs

### Performance Issues

**Slow response times**
- Enable Vercel Edge caching
- Optimize AI model selection
- Increase Vercel function memory

**Sandbox cleanup not working**
- Check timeout configuration
- Verify cleanup logic in `sandbox-manager.ts`
- Monitor disk usage

## 📈 Scaling Considerations

### For High Traffic

1. **Upgrade Vercel Plan**
   - Pro or Enterprise for better limits
   - More concurrent executions

2. **Use Trigger.dev Cloud**
   - Offload execution to Trigger.dev
   - Better isolation and scaling
   - Distributed execution

3. **Implement Caching**
   - Cache AI responses
   - Cache file operations
   - Use CDN for static assets

4. **Queue Management**
   - Implement job queues for long-running tasks
   - Use background processing
   - Rate limit sandbox creation

## 🎉 Post-Deployment

### 1. Share Your Deployment

- Add deployment URL to README
- Update GitHub repository description
- Share with @komiljon-ocapital (as per task requirements)

### 2. Monitor Usage

- Check Vercel analytics daily
- Monitor Trigger.dev task runs
- Review API usage and costs

### 3. Gather Feedback

- Test with real users
- Monitor error rates
- Iterate on improvements

## 📞 Support

If you encounter issues:

1. Check [TRIGGER_INTEGRATION.md](./TRIGGER_INTEGRATION.md) for technical details
2. Review Vercel deployment logs
3. Check Trigger.dev dashboard (if using)
4. Open an issue on GitHub

---

**Deployment checklist complete! 🚀**

Your Vibe Coding Platform with Trigger.dev integration is now live and ready to use.

