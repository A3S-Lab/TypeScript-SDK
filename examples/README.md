# A3S Code SDK Examples

Comprehensive examples demonstrating all features of the A3S Code TypeScript SDK.

## Available Examples

| Example | Description | Features |
|---------|-------------|----------|
| `simple-test.ts` | Basic SDK usage | Health check, sessions, generation, streaming |
| `storage-configuration.ts` | Storage types | Memory vs File storage, persistence |
| `hitl-confirmation.ts` | HITL system | Auto-approve, require-confirm, timeout behavior |
| `external-tasks.ts` | External task handling | Lane handlers, task delegation, sandbox execution |
| `provider-config.ts` | Provider management | Add providers, configure models, switch models |
| `todo-tracking.ts` | Task tracking | Create tasks, track status, priorities |
| `context-management.ts` | Context management | Monitor usage, compact, clear context |
| `code-review-agent.ts` | **Complete example** | Combines all features for production use |
| `permission-policy.ts` | Permission control | Set policies, check permissions, add rules |
| `event-streaming.ts` | Real-time events | Subscribe to events, monitor execution |
| `skill-management.ts` | Skill system | List, load, use, and unload skills |

## Prerequisites

1. **A3S Code Agent must be running** on `localhost:4088` (default)
   - Or set `A3S_ADDRESS` environment variable

2. **Node.js 18+**

3. **Configuration directory** - Examples use `a3s/.a3s` as the configuration directory
   - This directory should contain `config.json` with provider and model settings

## Installation

```bash
npm install
```

## Configuration

The examples automatically use the configuration from `a3s/.a3s/config.json`, which includes:

- Default provider and model settings
- API keys for LLM providers
- Model capabilities and limits

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `A3S_ADDRESS` | Agent gRPC address | `localhost:4088` |
| `ANTHROPIC_API_KEY` | Anthropic API key | (optional) |
| `OPENAI_API_KEY` | OpenAI API key | (optional) |

### Example

```bash
export A3S_ADDRESS=localhost:4088
export ANTHROPIC_API_KEY=sk-ant-xxx
npm run storage
```

## Running Examples

### Quick Run (with tsx, no build)

```bash
# Basic examples
npm run dev              # Simple test
npm run storage          # Storage configuration
npm run hitl             # HITL confirmation (interactive)
npm run external-tasks   # External task handling
npm run provider         # Provider configuration
npm run todo             # Todo tracking
npm run context          # Context management

# Complete example
npm run code-review      # Code review agent (combines all features)

# Advanced examples
npm run permission       # Permission policy
npm run events           # Event streaming
npm run skills           # Skill management
```

### Build and Run

```bash
# Build all examples
npm run build

# Run built examples
npm test
```

## Example Details

### 1. Simple Test (`simple-test.ts`)

**Demonstrates:**
- Client creation with config directory
- Health check and capabilities
- Session management (create, list, destroy)
- Context usage tracking
- Basic text generation
- Streaming generation
- Message history retrieval

**Run:**
```bash
npm run dev
```

### 2. Storage Configuration (`storage-configuration.ts`)

**Demonstrates:**
- Memory storage (temporary, no persistence)
- File storage (persistent, survives restarts)
- Use cases for each storage type
- Session lifecycle management

**Run:**
```bash
npm run storage
```

### 3. HITL Confirmation (`hitl-confirmation.ts`)

**Demonstrates:**
- Configure auto-approve and require-confirm tools
- Handle confirmation requests interactively
- Timeout behavior (reject/auto-approve)
- YOLO mode for specific lanes

**Run:**
```bash
npm run hitl
```

**Note:** This example requires user interaction to approve/reject tool executions.

### 4. External Task Handling (`external-tasks.ts`)

**Demonstrates:**
- Configure lane handlers (Internal/External/Hybrid)
- Poll and process external tasks
- Complete tasks with results
- Use case: Secure sandbox execution

**Run:**
```bash
npm run external-tasks
```

### 5. Provider Configuration (`provider-config.ts`)

**Demonstrates:**
- Add multiple providers (Anthropic, OpenAI)
- Configure model costs and limits
- Set default models
- Switch models per session
- List available providers

**Run:**
```bash
npm run provider
```

### 6. Todo/Task Tracking (`todo-tracking.ts`)

**Demonstrates:**
- Create and manage task lists
- Track status (pending/in_progress/completed/cancelled)
- Set priorities (high/medium/low)
- Agent interaction with tasks
- Task statistics

**Run:**
```bash
npm run todo
```

### 7. Context Management (`context-management.ts`)

**Demonstrates:**
- Monitor context usage
- Manual and automatic compaction
- Clear context for fresh starts
- Auto-compact configuration
- Context monitoring loop

**Run:**
```bash
npm run context
```

### 8. Code Review Agent (`code-review-agent.ts`) ⭐

**Complete example** combining multiple features:
- Persistent file storage
- Read-only permissions
- HITL confirmation
- Task tracking
- Context management

This demonstrates how to build a production-ready, secure code review agent.

**Run:**
```bash
npm run code-review
```

### 9. Permission Policy (`permission-policy.ts`)

**Demonstrates:**
- Setting permission policies
- Allow/deny specific tool executions
- Checking permissions before execution
- Adding permission rules dynamically

**Run:**
```bash
npm run permission
```

### 10. Event Streaming (`event-streaming.ts`)

**Demonstrates:**
- Subscribing to real-time agent events
- Handling different event types
- Monitoring agent execution
- Tracking tool usage and progress

**Run:**
```bash
npm run events
```

### 11. Skill Management (`skill-management.ts`)

**Demonstrates:**
- Listing available skills
- Loading skills dynamically
- Using skill capabilities in generation
- Unloading skills when done

**Run:**
```bash
npm run skills
```

## Expected Output

### Storage Configuration Example

```
==========================================================
Storage Configuration Example
==========================================================

1. Creating temporary session (memory storage)...
✓ Temporary session created: abc-123
  Storage: Memory (no persistence)

2. Creating persistent session (file storage)...
✓ Persistent session created: def-456
  Storage: File (persists across restarts)
  Sessions will be saved to: /tmp/workspace/sessions/
```

### Code Review Agent Example

```
==========================================================
Code Review Agent - Complete Example
==========================================================

Step 1: Creating persistent session...
✓ Session created: review-789
  Storage: File (persistent)
  Workspace: /tmp/code-review-workspace

Step 2: Configuring read-only permissions...
✓ Permissions configured:
  ✓ Read-only access to codebase
  ✓ Safe git commands allowed
  ✓ Write operations blocked

Step 3: Configuring HITL confirmation...
✓ HITL configured:
  ✓ Auto-approve: Read, Glob, Grep
  ✓ Require confirm: Bash commands
  ✓ YOLO lanes: Query (read operations)

...
```

## Troubleshooting

### Connection Refused

Make sure the A3S Code Agent is running:

```bash
# In the a3s directory
./target/debug/a3s-code -d .a3s -w /tmp/workspace
```

### Module Not Found

```bash
npm install
```

### API Key Errors

Set the required API keys:

```bash
export ANTHROPIC_API_KEY=your-key-here
export OPENAI_API_KEY=your-key-here
```

## Project Structure

```
examples/
├── src/
│   ├── simple-test.ts              # Basic SDK usage
│   ├── storage-configuration.ts    # Storage types
│   ├── hitl-confirmation.ts        # HITL system
│   ├── external-tasks.ts           # External task handling
│   ├── provider-config.ts          # Provider management
│   ├── todo-tracking.ts            # Task tracking
│   ├── context-management.ts       # Context management
│   ├── code-review-agent.ts        # Complete example ⭐
│   ├── permission-policy.ts        # Permission system
│   ├── event-streaming.ts          # Event subscription
│   └── skill-management.ts         # Skill loading
├── dist/                            # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

## Learn More

- [SDK Documentation](../README.md)
- [Usage Guide](../../../../docs/usage-examples.md)
- [API Reference](../docs/api.md)

## License

MIT
