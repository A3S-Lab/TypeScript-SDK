# A3S Code TypeScript SDK

<p align="center">
  <strong>TypeScript/JavaScript Client for A3S Code Agent</strong>
</p>

<p align="center">
  <em>Full-featured gRPC client for building AI coding agent applications</em>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#api-reference">API Reference</a>
</p>

---

## Overview

**@a3s-lab/code** is the official TypeScript SDK for [A3S Code](https://github.com/a3s-lab/a3s), providing a complete gRPC client implementation for the CodeAgentService API. Build AI-powered coding assistants, IDE integrations, and automation tools with full access to A3S Code's capabilities.

### Why This SDK?

- **Complete API Coverage**: All 28+ RPCs from CodeAgentService
- **Type-Safe**: Full TypeScript definitions for all types and enums
- **Async/Await**: Modern Promise-based API with streaming support
- **Flexible Configuration**: Environment variables, config files, or programmatic setup

## Features

| Category | Features |
|----------|----------|
| **Lifecycle** | Health check, capabilities, initialization, shutdown |
| **Sessions** | Create, list, get, delete sessions with persistence |
| **Generation** | Streaming responses, context compaction, abort support |
| **Tools** | Register/unregister skills, list available tools |
| **Context** | Add/clear context, manage conversation history |
| **Control** | Abort operations, cancel confirmations |
| **Events** | Subscribe to real-time agent events |
| **HITL** | Human-in-the-loop confirmations and responses |
| **Permissions** | Fine-grained permission policies |
| **Todos** | Task tracking for multi-step workflows |
| **Providers** | Multi-provider LLM configuration |

## Installation

```bash
npm install @a3s-lab/code
# or
yarn add @a3s-lab/code
# or
pnpm add @a3s-lab/code
```

## Quick Start

```typescript
import { A3sClient } from '@a3s-lab/code';

// Create client with default config
const client = new A3sClient();

// Or with explicit address
const client = new A3sClient({ address: 'localhost:4088' });

// Or load from config file
const client = new A3sClient({ configPath: '/path/to/config.json' });

async function main() {
  // Connect to the agent
  await client.connect();

  // Check health
  const health = await client.healthCheck();
  console.log('Agent status:', health.status);

  // Create a session
  const session = await client.createSession({
    workspace: '/path/to/project',
    systemPrompt: 'You are a helpful coding assistant.',
  });

  // Generate a response (streaming)
  const stream = client.generateStream(session.id, [
    { role: 'user', content: 'Explain this codebase structure' }
  ]);

  for await (const chunk of stream) {
    if (chunk.type === 'text') {
      process.stdout.write(chunk.content);
    }
  }

  // Clean up
  await client.deleteSession(session.id);
  await client.close();
}

main().catch(console.error);
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `A3S_ADDRESS` | gRPC server address | `localhost:4088` |
| `A3S_API_KEY` | API key for LLM provider | - |
| `A3S_DEFAULT_PROVIDER` | Default LLM provider | - |
| `A3S_DEFAULT_MODEL` | Default model ID | - |

### Config File

```json
{
  "address": "localhost:4088",
  "defaultProvider": "anthropic",
  "defaultModel": "claude-sonnet-4-20250514",
  "providers": [
    {
      "name": "anthropic",
      "apiKey": "sk-ant-...",
      "models": [
        { "id": "claude-sonnet-4-20250514", "name": "Claude Sonnet 4" }
      ]
    }
  ]
}
```

## API Reference

### Client Methods

#### Lifecycle

| Method | Description |
|--------|-------------|
| `connect()` | Connect to the gRPC server |
| `close()` | Close the connection |
| `healthCheck()` | Check agent health status |
| `getCapabilities()` | Get agent capabilities |
| `initialize(workspace, env?)` | Initialize the agent |
| `shutdown()` | Shutdown the agent |

#### Sessions

| Method | Description |
|--------|-------------|
| `createSession(config)` | Create a new session |
| `listSessions()` | List all sessions |
| `getSession(id)` | Get session by ID |
| `deleteSession(id)` | Delete a session |

#### Generation

| Method | Description |
|--------|-------------|
| `generate(sessionId, messages)` | Generate response (non-streaming) |
| `generateStream(sessionId, messages)` | Generate response (streaming) |
| `compactContext(sessionId)` | Compact session context |

#### Tools & Skills

| Method | Description |
|--------|-------------|
| `loadSkill(sessionId, name, content)` | Load a skill |
| `unloadSkill(sessionId, name)` | Unload a skill |
| `listSkills(sessionId?)` | List loaded skills |

#### Control

| Method | Description |
|--------|-------------|
| `abort(sessionId)` | Abort running operation |
| `cancelConfirmation(sessionId)` | Cancel pending confirmation |

### Types

See `ts/types.ts` for complete type definitions including:

- `SessionConfig`, `Session`
- `Message`, `MessageRole`
- `GenerateResponse`, `GenerateChunk`
- `HealthStatus`, `HealthStatusCode`
- `ProviderInfo`, `ModelInfo`
- `Todo`, `Skill`, `AgentEvent`

## Development

```bash
# Install dependencies
just install

# Build
just build

# Run tests
just test

# Run tests with coverage
just test-cov

# Type check
just check

# Lint
just lint

# Format
just fmt

# All checks
just ci
```

## A3S Ecosystem

This SDK is part of the A3S ecosystem:

| Project | Package | Purpose |
|---------|---------|---------|
| [a3s](https://github.com/a3s-lab/a3s) | `a3s-code` | AI coding agent framework |
| [sdk/typescript](.) | `@a3s-lab/code` | TypeScript SDK (this package) |
| [sdk/python](../python) | `a3s-code` | Python SDK |

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built by <a href="https://github.com/a3s-lab">A3S Lab</a>
</p>
