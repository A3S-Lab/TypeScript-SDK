# Testing with Real Model APIs

This guide explains how to run the SDK examples with real LLM model APIs.

## Prerequisites

1. **A3S Code service** must be running
2. **Model API configuration** in `a3s/.a3s/config.json`
3. **Valid API keys** for your chosen provider

## Configuration

### 1. Configure Model Provider

Edit `a3s/.a3s/config.json` to set your default provider and model:

```json
{
  "defaultProvider": "openai",
  "defaultModel": "kimi-k2.5",
  "providers": [
    {
      "name": "anthropic",
      "apiKey": "your-anthropic-key",
      "baseUrl": "https://api.anthropic.com",
      "models": [...]
    },
    {
      "name": "openai",
      "models": [
        {
          "id": "kimi-k2.5",
          "apiKey": "your-kimi-key",
          "baseUrl": "http://your-kimi-endpoint/v1",
          ...
        }
      ]
    }
  ]
}
```

### 2. Start A3S Code Service

```bash
cd /path/to/a3s

# Stop existing service
pkill -f "a3s-code"

# Start with configuration
./target/debug/a3s-code -d .a3s -w /tmp/a3s-workspace
```

**Important:** Restart the service after changing configuration!

### 3. Run Tests

```bash
cd sdk/typescript/examples
npm install

# Test with KIMI model (recommended)
npm run kimi-test

# Test with default model
npm run dev

# Run chat simulations
npm run chat
npm run code-gen
npm run skill-demo
```

## Available Model Providers

### Anthropic (Claude)

**Models:**
- `claude-opus-4-5-20251101` - Most capable, expensive
- `claude-sonnet-4-20250514` - Balanced performance/cost

**Configuration:**
```json
{
  "defaultProvider": "anthropic",
  "defaultModel": "claude-sonnet-4-20250514",
  "providers": [
    {
      "name": "anthropic",
      "apiKey": "sk-ant-xxx",
      "baseUrl": "https://api.anthropic.com",
      ...
    }
  ]
}
```

**Note:** Anthropic API may have rate limits or service availability issues.

### KIMI K2.5

**Models:**
- `kimi-k2.5` - Chinese-optimized model, good for testing

**Configuration:**
```json
{
  "defaultProvider": "openai",
  "defaultModel": "kimi-k2.5",
  "providers": [
    {
      "name": "openai",
      "models": [
        {
          "id": "kimi-k2.5",
          "apiKey": "sk-xxx",
          "baseUrl": "http://your-endpoint/v1",
          ...
        }
      ]
    }
  ]
}
```

## Troubleshooting

### Error: "503 Service Unavailable"

**Cause:** API service is down or rate limited

**Solution:**
1. Switch to a different model provider
2. Check API key validity
3. Verify base URL is correct
4. Wait and retry later

### Error: "LLM call failed"

**Cause:** Configuration not loaded or incorrect

**Solution:**
1. Verify `a3s/.a3s/config.json` exists and is valid JSON
2. Restart A3S Code service after config changes
3. Check API key is set correctly
4. Verify base URL is accessible

### Session uses wrong model

**Cause:** Service not restarted after config change

**Solution:**
```bash
# Stop service
pkill -f "a3s-code"

# Start with new config
cd /path/to/a3s
./target/debug/a3s-code -d .a3s -w /tmp/a3s-workspace
```

## Example Output

### Successful KIMI Test

```
============================================================
KIMI K2.5 Model Test
============================================================

KIMI Model Configuration:
  Model ID: kimi-k2.5
  Name: KIMI K2.5
  Base URL: http://35.220.164.252:3888/v1
  API Key: (set)

1. Creating A3S client...
✓ Client created

2. Checking agent health...
✓ Health status: STATUS_HEALTHY

3. Creating session with KIMI model...
✓ Session created: c0aba591-bb05-4e05-8abd-44f3530ff763

4. Generating a response...
✓ Response received:
  我是一个 AI 编程助手，能够帮助您编写代码、调试程序、处理文件和解答技术问题。

5. Testing streaming generation...
   Response: 1, 2, 3, 4, 5
✓ Streaming complete

6. Getting context usage...
✓ Context usage:
  Total tokens: 0
  Messages: 0

7. Cleaning up...
✓ Session destroyed

============================================================
All tests passed! ✓
============================================================
```

## Best Practices

1. **Use KIMI for testing** - More reliable than Anthropic API
2. **Restart service after config changes** - Configuration is loaded at startup
3. **Check service logs** - `tail -f /tmp/a3s.log` for debugging
4. **Monitor API usage** - Track token usage with `getContextUsage()`
5. **Handle errors gracefully** - API calls can fail, implement retry logic

## Next Steps

- Explore chat simulation examples: `npm run chat`
- Try code generation: `npm run code-gen`
- Test skill system: `npm run skill-demo`
- Read [examples/README.md](./README.md) for all available examples
