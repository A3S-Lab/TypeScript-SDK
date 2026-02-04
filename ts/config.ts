/**
 * Configuration utilities for A3S Code Agent SDK
 */

export interface A3sConfig {
  /** gRPC server address */
  address: string;
  /** Default provider name */
  defaultProvider?: string;
  /** Default model ID */
  defaultModel?: string;
  /** API key for the default provider */
  apiKey?: string;
  /** Base URL override */
  baseUrl?: string;
}

export interface ModelConfig {
  provider: string;
  model: string;
  apiKey?: string;
  baseUrl?: string;
}

/**
 * Get configuration from environment variables
 *
 * Environment variables:
 * - A3S_ADDRESS: gRPC server address (default: localhost:50051)
 * - A3S_DEFAULT_PROVIDER: Default provider name
 * - A3S_DEFAULT_MODEL: Default model ID
 * - A3S_API_KEY: API key for the default provider
 * - A3S_BASE_URL: Base URL override
 */
export function getConfig(): A3sConfig {
  return {
    address: process.env.A3S_ADDRESS || 'localhost:50051',
    defaultProvider: process.env.A3S_DEFAULT_PROVIDER,
    defaultModel: process.env.A3S_DEFAULT_MODEL,
    apiKey: process.env.A3S_API_KEY,
    baseUrl: process.env.A3S_BASE_URL,
  };
}

/**
 * Get model configuration from environment or defaults
 */
export function getModelConfig(): ModelConfig | undefined {
  const config = getConfig();

  if (!config.defaultProvider || !config.defaultModel) {
    return undefined;
  }

  return {
    provider: config.defaultProvider,
    model: config.defaultModel,
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
  };
}

/**
 * Get the default model identifier string
 * Returns format: "provider/model" or undefined if not configured
 */
export function getDefaultModel(): string | undefined {
  const config = getConfig();

  if (!config.defaultProvider || !config.defaultModel) {
    return undefined;
  }

  return `${config.defaultProvider}/${config.defaultModel}`;
}

/**
 * Print current configuration to console (for debugging)
 */
export function printConfig(): void {
  const config = getConfig();

  console.log('A3S Configuration:');
  console.log(`  Address: ${config.address}`);
  console.log(`  Default Provider: ${config.defaultProvider || '(not set)'}`);
  console.log(`  Default Model: ${config.defaultModel || '(not set)'}`);
  console.log(`  API Key: ${config.apiKey ? '(set)' : '(not set)'}`);
  console.log(`  Base URL: ${config.baseUrl || '(not set)'}`);
}
