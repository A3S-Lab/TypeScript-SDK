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

## Usage Examples

### Multi-Turn Conversations

```typescript
import { A3sClient } from '@a3s-lab/code';

const client = new A3sClient({ configDir: '~/.a3s' });

async function multiTurnChat() {
  await client.connect();

  const { sessionId } = await client.createSession({
    name: 'chat-session',
    workspace: '/path/to/project',
  });

  // First turn
  for await (const chunk of client.streamGenerate(sessionId, [
    { role: 'ROLE_USER', content: 'List all TypeScript files in this project' }
  ])) {
    if (chunk.content) process.stdout.write(chunk.content);
  }

  // Second turn - context is preserved
  for await (const chunk of client.streamGenerate(sessionId, [
    { role: 'ROLE_USER', content: 'Now analyze the main entry point' }
  ])) {
    if (chunk.content) process.stdout.write(chunk.content);
  }

  // Get conversation history
  const { messages } = await client.getMessages(sessionId, { limit: 10 });
  console.log(`\nConversation has ${messages.length} messages`);

  await client.destroySession(sessionId);
  client.close();
}
```

### Event Subscription

```typescript
import { A3sClient } from '@a3s-lab/code';

const client = new A3sClient();

async function subscribeToEvents() {
  await client.connect();

  const { sessionId } = await client.createSession({
    name: 'event-demo',
    workspace: '/tmp/workspace',
  });

  // Subscribe to all events
  const eventStream = client.subscribeEvents(sessionId);

  // Handle events in background
  (async () => {
    for await (const event of eventStream) {
      console.log(`[${event.type}] ${event.message}`);

      if (event.type === 'EVENT_TYPE_TOOL_CALLED') {
        console.log(`  Tool: ${event.metadata?.tool_name}`);
      }

      if (event.type === 'EVENT_TYPE_CONFIRMATION_REQUIRED') {
        console.log(`  Confirmation needed for: ${event.metadata?.tool_name}`);
      }
    }
  })();

  // Generate with tool usage
  for await (const chunk of client.streamGenerate(sessionId, [
    { role: 'ROLE_USER', content: 'Read the README.md file' }
  ])) {
    if (chunk.content) process.stdout.write(chunk.content);
  }

  await client.destroySession(sessionId);
  client.close();
}
```

### Human-in-the-Loop (HITL)

```typescript
import { A3sClient } from '@a3s-lab/code';

const client = new A3sClient();

async function hitlDemo() {
  await client.connect();

  const { sessionId } = await client.createSession({
    name: 'hitl-demo',
    workspace: '/path/to/project',
  });

  // Set confirmation policy - require approval for bash commands
  await client.setConfirmationPolicy(sessionId, {
    defaultAction: 'TIMEOUT_ACTION_REJECT',
    timeoutMs: 30000,
    rules: [
      {
        toolPattern: 'bash',
        action: 'TIMEOUT_ACTION_REJECT',
        requireConfirmation: true,
      }
    ]
  });

  // Subscribe to events to detect confirmation requests
  const eventStream = client.subscribeEvents(sessionId);

  (async () => {
    for await (const event of eventStream) {
      if (event.type === 'EVENT_TYPE_CONFIRMATION_REQUIRED') {
        const toolName = event.metadata?.tool_name;
        const toolArgs = event.metadata?.tool_args;

        console.log(`\nConfirmation required:`);
        console.log(`  Tool: ${toolName}`);
        console.log(`  Args: ${toolArgs}`);

        // Auto-approve for demo (in real app, prompt user)
        const approved = true;

        await client.confirmToolExecution(sessionId, {
          approved,
          reason: approved ? 'User approved' : 'User rejected',
        });
      }
    }
  })();

  // This will trigger confirmation
  for await (const chunk of client.streamGenerate(sessionId, [
    { role: 'ROLE_USER', content: 'Run "ls -la" command' }
  ])) {
    if (chunk.content) process.stdout.write(chunk.content);
  }

  await client.destroySession(sessionId);
  client.close();
}
```

### Permission Policies

```typescript
import { A3sClient } from '@a3s-lab/code';

const client = new A3sClient();

async function permissionDemo() {
  await client.connect();

  const { sessionId } = await client.createSession({
    name: 'permission-demo',
    workspace: '/path/to/project',
  });

  // Set permission policy - read-only mode
  await client.setPermissionPolicy(sessionId, {
    defaultDecision: 'PERMISSION_DECISION_DENY',
    rules: [
      {
        toolPattern: 'read',
        decision: 'PERMISSION_DECISION_ALLOW',
      },
      {
        toolPattern: 'grep',
        decision: 'PERMISSION_DECISION_ALLOW',
      },
      {
        toolPattern: 'glob',
        decision: 'PERMISSION_DECISION_ALLOW',
      },
      {
        toolPattern: 'ls',
        decision: 'PERMISSION_DECISION_ALLOW',
      },
      {
        toolPattern: 'write',
        decision: 'PERMISSION_DECISION_DENY',
      },
      {
        toolPattern: 'bash',
        decision: 'PERMISSION_DECISION_ASK',
      }
    ]
  });

  // Check permission before operation
  const canWrite = await client.checkPermission(sessionId, {
    toolName: 'write',
    args: { file_path: '/tmp/test.txt' }
  });

  console.log(`Can write: ${canWrite.decision === 'PERMISSION_DECISION_ALLOW'}`);

  // This will be allowed (read-only tools)
  for await (const chunk of client.streamGenerate(sessionId, [
    { role: 'ROLE_USER', content: 'List all files in the current directory' }
  ])) {
    if (chunk.content) process.stdout.write(chunk.content);
  }

  await client.destroySession(sessionId);
  client.close();
}
```

### Provider Configuration

```typescript
import { A3sClient } from '@a3s-lab/code';

const client = new A3sClient();

async function providerDemo() {
  await client.connect();

  // List available providers
  const { providers } = await client.listProviders();
  console.log('Available providers:', providers.map(p => p.name));

  // Add a new provider
  await client.addProvider({
    name: 'openai',
    apiKey: 'sk-...',
    baseUrl: 'https://api.openai.com/v1',
    models: [
      {
        id: 'gpt-4',
        name: 'GPT-4',
        family: 'gpt',
        toolCall: true,
      }
    ]
  });

  // Set default model
  await client.setDefaultModel('openai', 'gpt-4');

  // Get current default
  const { provider, model } = await client.getDefaultModel();
  console.log(`Default: ${provider}/${model}`);

  // Create session with specific model
  const { sessionId } = await client.createSession({
    name: 'openai-session',
    workspace: '/tmp/workspace',
    llmConfig: {
      provider: 'openai',
      model: 'gpt-4',
      temperature: 0.7,
    }
  });

  await client.destroySession(sessionId);
  client.close();
}
```

### Context Management

```typescript
import { A3sClient } from '@a3s-lab/code';

const client = new A3sClient();

async function contextDemo() {
  await client.connect();

  const { sessionId } = await client.createSession({
    name: 'context-demo',
    workspace: '/path/to/project',
  });

  // Have a long conversation...
  for (let i = 0; i < 10; i++) {
    await client.generate(sessionId, [
      { role: 'ROLE_USER', content: `Question ${i + 1}: Tell me about this project` }
    ]);
  }

  // Check context usage
  const usage = await client.getContextUsage(sessionId);
  console.log(`Context tokens: ${usage.totalTokens}/${usage.maxTokens}`);
  console.log(`Messages: ${usage.messageCount}`);

  if (usage.totalTokens > usage.maxTokens * 0.8) {
    console.log('Context is getting full, compacting...');

    // Compact context using LLM summarization
    const result = await client.compactContext(sessionId);
    console.log(`Compacted: ${result.originalMessages} → ${result.compactedMessages} messages`);
    console.log(`Saved: ${result.tokensSaved} tokens`);
  }

  await client.destroySession(sessionId);
  client.close();
}
```

### Skills Management

```typescript
import { A3sClient } from '@a3s-lab/code';
import { readFileSync } from 'fs';

const client = new A3sClient();

async function skillsDemo() {
  await client.connect();

  const { sessionId } = await client.createSession({
    name: 'skills-demo',
    workspace: '/path/to/project',
  });

  // Load a custom skill from markdown file
  const skillContent = readFileSync('./my-skill.md', 'utf-8');

  await client.loadSkill(sessionId, 'my-custom-tool', skillContent);

  // List all available skills
  const { skills } = await client.listSkills(sessionId);
  console.log('Available skills:', skills.map(s => s.name));

  // Use the custom skill
  for await (const chunk of client.streamGenerate(sessionId, [
    { role: 'ROLE_USER', content: 'Use my-custom-tool to process data' }
  ])) {
    if (chunk.content) process.stdout.write(chunk.content);
  }

  // Unload the skill
  await client.unloadSkill(sessionId, 'my-custom-tool');

  await client.destroySession(sessionId);
  client.close();
}
```

### Todo/Task Tracking

```typescript
import { A3sClient } from '@a3s-lab/code';

const client = new A3sClient();

async function todoDemo() {
  await client.connect();

  const { sessionId } = await client.createSession({
    name: 'todo-demo',
    workspace: '/path/to/project',
  });

  // Set initial todos
  await client.setTodos(sessionId, [
    {
      id: '1',
      title: 'Analyze codebase structure',
      description: 'Understand the project layout',
      completed: false,
    },
    {
      id: '2',
      title: 'Fix bug in authentication',
      description: 'User login fails with invalid token',
      completed: false,
    }
  ]);

  // Agent works on tasks...
  await client.generate(sessionId, [
    { role: 'ROLE_USER', content: 'Complete the first todo item' }
  ]);

  // Get updated todos
  const { todos } = await client.getTodos(sessionId);
  console.log('Todos:');
  todos.forEach(todo => {
    const status = todo.completed ? '✓' : '○';
    console.log(`  ${status} ${todo.title}`);
  });

  await client.destroySession(sessionId);
  client.close();
}
```

### Operation Control

```typescript
import { A3sClient } from '@a3s-lab/code';

const client = new A3sClient();

async function controlDemo() {
  await client.connect();

  const { sessionId } = await client.createSession({
    name: 'control-demo',
    workspace: '/path/to/project',
  });

  // Start a long-running operation
  const generatePromise = (async () => {
    for await (const chunk of client.streamGenerate(sessionId, [
      { role: 'ROLE_USER', content: 'Analyze all files in this large project' }
    ])) {
      if (chunk.content) process.stdout.write(chunk.content);
    }
  })();

  // Cancel after 5 seconds
  setTimeout(async () => {
    console.log('\nCancelling operation...');
    await client.cancel(sessionId);
  }, 5000);

  try {
    await generatePromise;
  } catch (error) {
    console.log('Operation was cancelled');
  }

  // Pause and resume
  await client.pause(sessionId);
  console.log('Session paused');

  await client.resume(sessionId);
  console.log('Session resumed');

  await client.destroySession(sessionId);
  client.close();
}
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
