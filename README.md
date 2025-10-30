# Vibe Coding Platform with Trigger.dev Integration

An AI-powered coding assistant that creates, modifies, and executes code in isolated sandbox environments. This version replaces the Vercel Sandbox with **Trigger.dev workflows** for code execution while maintaining the same user experience.

## 🌟 Features

- **AI-Powered Code Generation**: Uses advanced AI models to generate code based on natural language descriptions
- **Isolated Sandbox Execution**: Runs code in isolated environments with real-time output streaming
- **File Management**: Create, edit, and manage files within sandboxes
- **Real-time Logs**: Stream command output and errors in real-time
- **Multi-Language Support**: Supports Node.js, Python, and other languages
- **Trigger.dev Integration**: Replaces Vercel Sandbox with Trigger.dev for flexible, scalable execution

## 🚀 Quick Start

### Prerequisites

- Node.js 22.x or higher
- npm or yarn
- An AI provider API key (OpenAI, Anthropic, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd vibe-coding-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   # AI Provider API Key (required)
   OPENAI_API_KEY=your_openai_api_key_here
   # or
   ANTHROPIC_API_KEY=your_anthropic_api_key_here

   # Trigger.dev (optional - only needed for cloud deployment)
   # TRIGGER_PROJECT_ID=your_project_id
   # TRIGGER_API_KEY=your_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

1. **Start a Conversation**: Type a request in the chat interface, e.g., "Create a simple Express.js server"

2. **Sandbox Creation**: The AI will automatically create a sandbox environment

3. **Code Generation**: Files will be generated and uploaded to the sandbox

4. **Command Execution**: Commands will run automatically with real-time output

5. **Preview Results**: Access running applications through the provided URLs

## 🏗️ Architecture

### Trigger.dev Integration

This project replaces Vercel Sandbox with a custom implementation that:

- **Local Execution**: Runs sandboxes locally using Node.js child processes (default)
- **Trigger.dev Ready**: Can be deployed to Trigger.dev cloud for distributed execution
- **API Compatible**: Maintains the same API as Vercel Sandbox for seamless integration

See [TRIGGER_INTEGRATION.md](./TRIGGER_INTEGRATION.md) for detailed documentation.

### Key Components

```
├── ai/                       # AI tools and integrations
│   └── tools/               # Sandbox operations (create, run, files)
├── trigger/                 # Trigger.dev tasks and sandbox management
│   ├── sandbox-manager.ts   # Sandbox lifecycle
│   ├── command-executor.ts  # Command execution
│   └── index.ts            # Trigger.dev tasks
├── lib/
│   └── trigger-client.ts   # API-compatible wrapper
├── app/                    # Next.js app routes
└── components/             # React components
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start Next.js dev server
npm run build           # Build for production
npm run start           # Start production server
npm run type-check      # Check TypeScript types

# Trigger.dev (optional)
npm run trigger:dev     # Start Trigger.dev local development
npm run trigger:deploy  # Deploy tasks to Trigger.dev cloud
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` | Yes | API key for AI provider |
| `TRIGGER_PROJECT_ID` | No | Trigger.dev project ID (cloud only) |
| `TRIGGER_API_KEY` | No | Trigger.dev API key (cloud only) |

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Trigger.dev integration"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Add environment variables (see above)
   - Deploy

3. **Configure Environment**
   - Add your AI API key in the Vercel dashboard
   - Optionally add Trigger.dev credentials for cloud execution

### Deploy Trigger.dev Tasks (Optional)

For cloud-based sandbox execution:

1. **Sign up for Trigger.dev**
   - Visit [trigger.dev](https://trigger.dev)
   - Create a new project

2. **Configure Environment**
   ```bash
   TRIGGER_PROJECT_ID=your_project_id
   TRIGGER_API_KEY=your_api_key
   ```

3. **Deploy Tasks**
   ```bash
   npm run trigger:deploy
   ```

## 🔧 Configuration

### Sandbox Settings

Configure sandbox behavior in `trigger/sandbox-manager.ts`:

```typescript
// Default timeout: 10 minutes
const TIMEOUT = 600000;

// Sandbox base directory
const SANDBOX_BASE_DIR = path.join(os.tmpdir(), 'vibe-sandboxes');
```

### Trigger.dev Settings

Configure Trigger.dev in `trigger.config.ts`:

```typescript
export default defineConfig({
  project: process.env.TRIGGER_PROJECT_ID || "proj_dev",
  maxDuration: 300, // 5 minutes
  dirs: ["./trigger"],
});
```

## 📚 Documentation

- [Trigger.dev Integration Guide](./TRIGGER_INTEGRATION.md) - Detailed architecture and design decisions
- [Original Vibe Demo](https://oss-vibe-coding-platform.vercel.app/) - Reference implementation
- [Trigger.dev Docs](https://trigger.dev/docs) - Trigger.dev documentation

## 🎯 Project Structure

- **`ai/`**: AI tools that interact with sandboxes
- **`trigger/`**: Sandbox management and command execution
- **`lib/trigger-client.ts`**: API-compatible Sandbox wrapper
- **`app/`**: Next.js pages and API routes
- **`components/`**: React UI components

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is based on the [Vercel Vibe Coding Platform](https://github.com/vercel/examples/tree/main/apps/vibe-coding-platform).

## 🙏 Acknowledgments

- **Vercel** for the original Vibe Coding Platform
- **Trigger.dev** for the execution platform
- **Vercel AI SDK** for AI integration
- **Next.js** for the framework

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the [TRIGGER_INTEGRATION.md](./TRIGGER_INTEGRATION.md) for detailed documentation

---

**Built with ❤️ using Next.js, Trigger.dev, and Vercel AI SDK**
