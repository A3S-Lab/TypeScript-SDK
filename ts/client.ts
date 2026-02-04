/**
 * A3S Code Agent gRPC Client
 *
 * Full implementation of the CodeAgentService interface.
 */

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of this module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Proto file path
const PROTO_PATH = join(__dirname, '..', 'proto', 'code_agent.proto');

// ============================================================================
// Type Definitions
// ============================================================================

// --- Enums ---

export type HealthStatus = 'STATUS_UNKNOWN' | 'STATUS_HEALTHY' | 'STATUS_DEGRADED' | 'STATUS_UNHEALTHY';
export type SessionState = 'SESSION_STATE_UNKNOWN' | 'SESSION_STATE_ACTIVE' | 'SESSION_STATE_PAUSED' | 'SESSION_STATE_COMPLETED' | 'SESSION_STATE_ERROR';
export type MessageRole = 'ROLE_UNKNOWN' | 'ROLE_USER' | 'ROLE_ASSISTANT' | 'ROLE_SYSTEM' | 'ROLE_TOOL';
export type FinishReason = 'FINISH_REASON_UNKNOWN' | 'FINISH_REASON_STOP' | 'FINISH_REASON_LENGTH' | 'FINISH_REASON_TOOL_CALLS' | 'FINISH_REASON_CONTENT_FILTER' | 'FINISH_REASON_ERROR';
export type ChunkType = 'CHUNK_TYPE_UNKNOWN' | 'CHUNK_TYPE_CONTENT' | 'CHUNK_TYPE_TOOL_CALL' | 'CHUNK_TYPE_TOOL_RESULT' | 'CHUNK_TYPE_METADATA' | 'CHUNK_TYPE_DONE';
export type EventType = 'EVENT_TYPE_UNKNOWN' | 'EVENT_TYPE_SESSION_CREATED' | 'EVENT_TYPE_SESSION_DESTROYED' | 'EVENT_TYPE_GENERATION_STARTED' | 'EVENT_TYPE_GENERATION_COMPLETED' | 'EVENT_TYPE_TOOL_CALLED' | 'EVENT_TYPE_TOOL_COMPLETED' | 'EVENT_TYPE_ERROR' | 'EVENT_TYPE_WARNING' | 'EVENT_TYPE_INFO' | 'EVENT_TYPE_CONFIRMATION_REQUIRED' | 'EVENT_TYPE_CONFIRMATION_RECEIVED' | 'EVENT_TYPE_CONFIRMATION_TIMEOUT' | 'EVENT_TYPE_EXTERNAL_TASK_PENDING' | 'EVENT_TYPE_EXTERNAL_TASK_COMPLETED' | 'EVENT_TYPE_PERMISSION_DENIED';
export type SessionLane = 'SESSION_LANE_UNKNOWN' | 'SESSION_LANE_CONTROL' | 'SESSION_LANE_QUERY' | 'SESSION_LANE_EXECUTE' | 'SESSION_LANE_GENERATE';
export type TimeoutAction = 'TIMEOUT_ACTION_UNKNOWN' | 'TIMEOUT_ACTION_REJECT' | 'TIMEOUT_ACTION_AUTO_APPROVE';
export type TaskHandlerMode = 'TASK_HANDLER_MODE_UNKNOWN' | 'TASK_HANDLER_MODE_INTERNAL' | 'TASK_HANDLER_MODE_EXTERNAL' | 'TASK_HANDLER_MODE_HYBRID';
export type PermissionDecision = 'PERMISSION_DECISION_UNKNOWN' | 'PERMISSION_DECISION_ALLOW' | 'PERMISSION_DECISION_DENY' | 'PERMISSION_DECISION_ASK';

// --- Lifecycle Types ---

export interface HealthCheckResponse {
  status: HealthStatus;
  message: string;
  details: Record<string, string>;
}

export interface AgentInfo {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  homepage: string;
}

export interface ToolCapability {
  name: string;
  description: string;
  parameters: string[];
  async: boolean;
}

export interface ModelCapability {
  provider: string;
  model: string;
  features: string[];
}

export interface ResourceLimits {
  maxContextTokens: number;
  maxConcurrentSessions: number;
  maxToolsPerRequest: number;
}

export interface GetCapabilitiesResponse {
  info?: AgentInfo;
  features: string[];
  tools: ToolCapability[];
  models: ModelCapability[];
  limits?: ResourceLimits;
  metadata: Record<string, string>;
}

export interface InitializeResponse {
  success: boolean;
  message: string;
  info?: AgentInfo;
}

export interface ShutdownResponse {
  success: boolean;
  message: string;
}

// --- Session Types ---

export interface LLMConfig {
  provider: string;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface SessionConfig {
  name: string;
  workspace: string;
  llm?: LLMConfig;
  systemPrompt?: string;
  maxContextLength?: number;
  autoCompact?: boolean;
}

export interface ContextUsage {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  messageCount: number;
}

export interface Session {
  sessionId: string;
  config?: SessionConfig;
  state: SessionState;
  contextUsage?: ContextUsage;
  createdAt: number;
  updatedAt: number;
}

export interface CreateSessionResponse {
  sessionId: string;
  session?: Session;
}

export interface DestroySessionResponse {
  success: boolean;
}

export interface ListSessionsResponse {
  sessions: Session[];
}

export interface GetSessionResponse {
  session?: Session;
}

export interface ConfigureSessionResponse {
  session?: Session;
}

// --- Message Types ---

export interface Message {
  role: MessageRole;
  content: string;
  metadata?: Record<string, string>;
}

export interface TextContent {
  text: string;
}

export interface ToolUseContent {
  id: string;
  name: string;
  arguments: string;
}

export interface ToolResultContent {
  toolUseId: string;
  content: string;
  isError: boolean;
}

export interface ContentBlock {
  text?: TextContent;
  toolUse?: ToolUseContent;
  toolResult?: ToolResultContent;
}

export interface ConversationMessage {
  id: string;
  role: string;
  content: ContentBlock[];
  timestamp: number;
  metadata: Record<string, string>;
}

export interface GetMessagesResponse {
  messages: ConversationMessage[];
  totalCount: number;
  hasMore: boolean;
}

// --- Generation Types ---

export interface ToolResult {
  success: boolean;
  output: string;
  error: string;
  metadata: Record<string, string>;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: string;
  result?: ToolResult;
}

export interface Usage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface GenerateResponse {
  sessionId: string;
  message?: Message;
  toolCalls: ToolCall[];
  usage?: Usage;
  finishReason: FinishReason;
  metadata: Record<string, string>;
}

export interface GenerateChunk {
  type: ChunkType;
  sessionId: string;
  content: string;
  toolCall?: ToolCall;
  toolResult?: ToolResult;
  metadata: Record<string, string>;
}

export interface GenerateStructuredResponse {
  sessionId: string;
  data: string;
  usage?: Usage;
  metadata: Record<string, string>;
}

export interface GenerateStructuredChunk {
  sessionId: string;
  data: string;
  done: boolean;
}

// --- Skill Types ---

export interface Skill {
  name: string;
  description: string;
  tools: string[];
  metadata: Record<string, string>;
}

export interface LoadSkillResponse {
  success: boolean;
  toolNames: string[];
}

export interface UnloadSkillResponse {
  success: boolean;
  removedTools: string[];
}

export interface ListSkillsResponse {
  skills: Skill[];
}

// --- Context Types ---

export interface GetContextUsageResponse {
  usage?: ContextUsage;
}

export interface CompactContextResponse {
  success: boolean;
  before?: ContextUsage;
  after?: ContextUsage;
}

export interface ClearContextResponse {
  success: boolean;
}

// --- Event Types ---

export interface AgentEvent {
  type: EventType;
  sessionId?: string;
  timestamp: number;
  message: string;
  data: Record<string, string>;
}

// --- Control Types ---

export interface CancelResponse {
  success: boolean;
}

export interface PauseResponse {
  success: boolean;
}

export interface ResumeResponse {
  success: boolean;
}

// --- HITL Types ---

export interface ConfirmationPolicy {
  enabled: boolean;
  autoApproveTools: string[];
  requireConfirmTools: string[];
  defaultTimeoutMs: number;
  timeoutAction: TimeoutAction;
  yoloLanes: SessionLane[];
}

export interface ConfirmToolExecutionResponse {
  success: boolean;
  error: string;
}

export interface SetConfirmationPolicyResponse {
  success: boolean;
  policy?: ConfirmationPolicy;
}

export interface GetConfirmationPolicyResponse {
  policy?: ConfirmationPolicy;
}

// --- External Task Types ---

export interface LaneHandlerConfig {
  mode: TaskHandlerMode;
  timeoutMs: number;
}

export interface ExternalTask {
  taskId: string;
  sessionId: string;
  lane: SessionLane;
  commandType: string;
  payload: string;
  timeoutMs: number;
  remainingMs: number;
}

export interface SetLaneHandlerResponse {
  success: boolean;
  config?: LaneHandlerConfig;
}

export interface GetLaneHandlerResponse {
  config?: LaneHandlerConfig;
}

export interface CompleteExternalTaskResponse {
  success: boolean;
  error: string;
}

export interface ListPendingExternalTasksResponse {
  tasks: ExternalTask[];
}

// --- Permission Types ---

export interface PermissionRule {
  rule: string;
}

export interface PermissionPolicy {
  deny: PermissionRule[];
  allow: PermissionRule[];
  ask: PermissionRule[];
  defaultDecision: PermissionDecision;
  enabled: boolean;
}

export interface SetPermissionPolicyResponse {
  success: boolean;
  policy?: PermissionPolicy;
}

export interface GetPermissionPolicyResponse {
  policy?: PermissionPolicy;
}

export interface CheckPermissionResponse {
  decision: PermissionDecision;
  matchingRules: string[];
}

export interface AddPermissionRuleResponse {
  success: boolean;
  error: string;
}

// --- Todo Types ---

export interface Todo {
  id: string;
  content: string;
  status: string;
  priority: string;
}

export interface GetTodosResponse {
  todos: Todo[];
}

export interface SetTodosResponse {
  success: boolean;
  todos: Todo[];
}

// --- Provider Types ---

export interface ModelCostInfo {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}

export interface ModelLimitInfo {
  context: number;
  output: number;
}

export interface ModelModalitiesInfo {
  input: string[];
  output: string[];
}

export interface ModelInfo {
  id: string;
  name: string;
  family: string;
  apiKey?: string;
  baseUrl?: string;
  attachment: boolean;
  reasoning: boolean;
  toolCall: boolean;
  temperature: boolean;
  releaseDate?: string;
  modalities?: ModelModalitiesInfo;
  cost?: ModelCostInfo;
  limit?: ModelLimitInfo;
}

export interface ProviderInfo {
  name: string;
  apiKey?: string;
  baseUrl?: string;
  models: ModelInfo[];
}

export interface ListProvidersResponse {
  providers: ProviderInfo[];
  defaultProvider?: string;
  defaultModel?: string;
}

export interface GetProviderResponse {
  provider?: ProviderInfo;
}

export interface AddProviderResponse {
  success: boolean;
  error: string;
  provider?: ProviderInfo;
}

export interface UpdateProviderResponse {
  success: boolean;
  error: string;
  provider?: ProviderInfo;
}

export interface RemoveProviderResponse {
  success: boolean;
  error: string;
}

export interface SetDefaultModelResponse {
  success: boolean;
  error: string;
  provider: string;
  model: string;
}

export interface GetDefaultModelResponse {
  provider?: string;
  model?: string;
}

// ============================================================================
// Client Options
// ============================================================================

export interface A3sClientOptions {
  /** gRPC server address (default: localhost:50051) */
  address?: string;
  /** Use TLS for connection */
  useTls?: boolean;
  /** Connection timeout in milliseconds */
  timeout?: number;
}

// ============================================================================
// gRPC Client Type (dynamic)
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GrpcClient = any;

// ============================================================================
// A3sClient Class
// ============================================================================

/**
 * A3S Code Agent gRPC Client
 *
 * Provides a TypeScript interface to all CodeAgentService RPCs.
 */
export class A3sClient {
  private client: GrpcClient;
  private address: string;

  constructor(options: A3sClientOptions = {}) {
    this.address = options.address || 'localhost:50051';

    // Load proto definition
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: false,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const a3s = protoDescriptor.a3s as any;
    const CodeAgentService = a3s.code.agent.v1.CodeAgentService;

    // Create credentials
    const credentials = options.useTls
      ? grpc.credentials.createSsl()
      : grpc.credentials.createInsecure();

    // Create client
    this.client = new CodeAgentService(this.address, credentials);
  }

  /**
   * Close the client connection
   */
  close(): void {
    this.client.close();
  }

  // ==========================================================================
  // Helper method for promisifying unary calls
  // ==========================================================================

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private promisify<TReq, TRes>(method: string, request: TReq): Promise<TRes> {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.client[method](request, (error: any, response: TRes) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  // ==========================================================================
  // Lifecycle Management
  // ==========================================================================

  /**
   * Check the health status of the agent
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    return this.promisify('healthCheck', {});
  }

  /**
   * Get agent capabilities
   */
  async getCapabilities(): Promise<GetCapabilitiesResponse> {
    return this.promisify('getCapabilities', {});
  }

  /**
   * Initialize the agent with workspace and environment
   */
  async initialize(
    workspace: string,
    env?: Record<string, string>
  ): Promise<InitializeResponse> {
    return this.promisify('initialize', { workspace, env: env || {} });
  }

  /**
   * Shutdown the agent
   */
  async shutdown(): Promise<ShutdownResponse> {
    return this.promisify('shutdown', {});
  }

  // ==========================================================================
  // Session Management
  // ==========================================================================

  /**
   * Create a new session
   */
  async createSession(
    config?: SessionConfig,
    sessionId?: string,
    initialContext?: Message[]
  ): Promise<CreateSessionResponse> {
    return this.promisify('createSession', {
      sessionId,
      config,
      initialContext: initialContext || [],
    });
  }

  /**
   * Destroy a session
   */
  async destroySession(sessionId: string): Promise<DestroySessionResponse> {
    return this.promisify('destroySession', { sessionId });
  }

  /**
   * List all sessions
   */
  async listSessions(): Promise<ListSessionsResponse> {
    return this.promisify('listSessions', {});
  }

  /**
   * Get a specific session
   */
  async getSession(sessionId: string): Promise<GetSessionResponse> {
    return this.promisify('getSession', { sessionId });
  }

  /**
   * Configure a session
   */
  async configureSession(
    sessionId: string,
    config: SessionConfig
  ): Promise<ConfigureSessionResponse> {
    return this.promisify('configureSession', { sessionId, config });
  }

  /**
   * Get messages from a session
   */
  async getMessages(
    sessionId: string,
    limit?: number,
    offset?: number
  ): Promise<GetMessagesResponse> {
    return this.promisify('getMessages', { sessionId, limit, offset });
  }

  // ==========================================================================
  // Code Generation
  // ==========================================================================

  /**
   * Generate a response (unary)
   */
  async generate(
    sessionId: string,
    messages: Message[]
  ): Promise<GenerateResponse> {
    return this.promisify('generate', { sessionId, messages });
  }

  /**
   * Generate a response (streaming)
   */
  streamGenerate(
    sessionId: string,
    messages: Message[]
  ): AsyncIterable<GenerateChunk> {
    const call = this.client.streamGenerate({ sessionId, messages });
    return this.streamToAsyncIterable(call);
  }

  /**
   * Generate structured output (unary)
   */
  async generateStructured(
    sessionId: string,
    messages: Message[],
    schema: string
  ): Promise<GenerateStructuredResponse> {
    return this.promisify('generateStructured', { sessionId, messages, schema });
  }

  /**
   * Generate structured output (streaming)
   */
  streamGenerateStructured(
    sessionId: string,
    messages: Message[],
    schema: string
  ): AsyncIterable<GenerateStructuredChunk> {
    const call = this.client.streamGenerateStructured({
      sessionId,
      messages,
      schema,
    });
    return this.streamToAsyncIterable(call);
  }

  // ==========================================================================
  // Skill Management
  // ==========================================================================

  /**
   * Load a skill into a session
   */
  async loadSkill(
    sessionId: string,
    skillName: string,
    skillContent?: string
  ): Promise<LoadSkillResponse> {
    return this.promisify('loadSkill', { sessionId, skillName, skillContent });
  }

  /**
   * Unload a skill from a session
   */
  async unloadSkill(
    sessionId: string,
    skillName: string
  ): Promise<UnloadSkillResponse> {
    return this.promisify('unloadSkill', { sessionId, skillName });
  }

  /**
   * List available skills
   */
  async listSkills(sessionId?: string): Promise<ListSkillsResponse> {
    return this.promisify('listSkills', { sessionId });
  }

  // ==========================================================================
  // Context Management
  // ==========================================================================

  /**
   * Get context usage for a session
   */
  async getContextUsage(sessionId: string): Promise<GetContextUsageResponse> {
    return this.promisify('getContextUsage', { sessionId });
  }

  /**
   * Compact context for a session
   */
  async compactContext(sessionId: string): Promise<CompactContextResponse> {
    return this.promisify('compactContext', { sessionId });
  }

  /**
   * Clear context for a session
   */
  async clearContext(sessionId: string): Promise<ClearContextResponse> {
    return this.promisify('clearContext', { sessionId });
  }

  // ==========================================================================
  // Event Streaming
  // ==========================================================================

  /**
   * Subscribe to agent events
   */
  subscribeEvents(
    sessionId?: string,
    eventTypes?: string[]
  ): AsyncIterable<AgentEvent> {
    const call = this.client.subscribeEvents({
      sessionId,
      eventTypes: eventTypes || [],
    });
    return this.streamToAsyncIterable(call);
  }

  // ==========================================================================
  // Control Operations
  // ==========================================================================

  /**
   * Cancel an operation
   */
  async cancel(sessionId: string, operationId?: string): Promise<CancelResponse> {
    return this.promisify('cancel', { sessionId, operationId });
  }

  /**
   * Pause a session
   */
  async pause(sessionId: string): Promise<PauseResponse> {
    return this.promisify('pause', { sessionId });
  }

  /**
   * Resume a session
   */
  async resume(sessionId: string): Promise<ResumeResponse> {
    return this.promisify('resume', { sessionId });
  }

  // ==========================================================================
  // Human-in-the-Loop (HITL)
  // ==========================================================================

  /**
   * Confirm or reject tool execution
   */
  async confirmToolExecution(
    sessionId: string,
    toolId: string,
    approved: boolean,
    reason?: string
  ): Promise<ConfirmToolExecutionResponse> {
    return this.promisify('confirmToolExecution', {
      sessionId,
      toolId,
      approved,
      reason,
    });
  }

  /**
   * Set confirmation policy for a session
   */
  async setConfirmationPolicy(
    sessionId: string,
    policy: ConfirmationPolicy
  ): Promise<SetConfirmationPolicyResponse> {
    return this.promisify('setConfirmationPolicy', { sessionId, policy });
  }

  /**
   * Get confirmation policy for a session
   */
  async getConfirmationPolicy(
    sessionId: string
  ): Promise<GetConfirmationPolicyResponse> {
    return this.promisify('getConfirmationPolicy', { sessionId });
  }

  // ==========================================================================
  // External Task Handling
  // ==========================================================================

  /**
   * Set lane handler configuration
   */
  async setLaneHandler(
    sessionId: string,
    lane: SessionLane,
    config: LaneHandlerConfig
  ): Promise<SetLaneHandlerResponse> {
    return this.promisify('setLaneHandler', { sessionId, lane, config });
  }

  /**
   * Get lane handler configuration
   */
  async getLaneHandler(
    sessionId: string,
    lane: SessionLane
  ): Promise<GetLaneHandlerResponse> {
    return this.promisify('getLaneHandler', { sessionId, lane });
  }

  /**
   * Complete an external task
   */
  async completeExternalTask(
    sessionId: string,
    taskId: string,
    success: boolean,
    result?: string,
    error?: string
  ): Promise<CompleteExternalTaskResponse> {
    return this.promisify('completeExternalTask', {
      sessionId,
      taskId,
      success,
      result: result || '',
      error: error || '',
    });
  }

  /**
   * List pending external tasks
   */
  async listPendingExternalTasks(
    sessionId: string
  ): Promise<ListPendingExternalTasksResponse> {
    return this.promisify('listPendingExternalTasks', { sessionId });
  }

  // ==========================================================================
  // Permission System
  // ==========================================================================

  /**
   * Set permission policy for a session
   */
  async setPermissionPolicy(
    sessionId: string,
    policy: PermissionPolicy
  ): Promise<SetPermissionPolicyResponse> {
    return this.promisify('setPermissionPolicy', { sessionId, policy });
  }

  /**
   * Get permission policy for a session
   */
  async getPermissionPolicy(
    sessionId: string
  ): Promise<GetPermissionPolicyResponse> {
    return this.promisify('getPermissionPolicy', { sessionId });
  }

  /**
   * Check permission for a tool call
   */
  async checkPermission(
    sessionId: string,
    toolName: string,
    args: string
  ): Promise<CheckPermissionResponse> {
    return this.promisify('checkPermission', {
      sessionId,
      toolName,
      arguments: args,
    });
  }

  /**
   * Add a permission rule
   */
  async addPermissionRule(
    sessionId: string,
    ruleType: 'allow' | 'deny' | 'ask',
    rule: string
  ): Promise<AddPermissionRuleResponse> {
    return this.promisify('addPermissionRule', { sessionId, ruleType, rule });
  }

  // ==========================================================================
  // Todo/Task Tracking
  // ==========================================================================

  /**
   * Get todos for a session
   */
  async getTodos(sessionId: string): Promise<GetTodosResponse> {
    return this.promisify('getTodos', { sessionId });
  }

  /**
   * Set todos for a session
   */
  async setTodos(sessionId: string, todos: Todo[]): Promise<SetTodosResponse> {
    return this.promisify('setTodos', { sessionId, todos });
  }

  // ==========================================================================
  // Provider Configuration
  // ==========================================================================

  /**
   * List all providers
   */
  async listProviders(): Promise<ListProvidersResponse> {
    return this.promisify('listProviders', {});
  }

  /**
   * Get a specific provider
   */
  async getProvider(name: string): Promise<GetProviderResponse> {
    return this.promisify('getProvider', { name });
  }

  /**
   * Add a new provider
   */
  async addProvider(provider: ProviderInfo): Promise<AddProviderResponse> {
    return this.promisify('addProvider', { provider });
  }

  /**
   * Update an existing provider
   */
  async updateProvider(provider: ProviderInfo): Promise<UpdateProviderResponse> {
    return this.promisify('updateProvider', { provider });
  }

  /**
   * Remove a provider
   */
  async removeProvider(name: string): Promise<RemoveProviderResponse> {
    return this.promisify('removeProvider', { name });
  }

  /**
   * Set the default model
   */
  async setDefaultModel(
    provider: string,
    model: string
  ): Promise<SetDefaultModelResponse> {
    return this.promisify('setDefaultModel', { provider, model });
  }

  /**
   * Get the default model
   */
  async getDefaultModel(): Promise<GetDefaultModelResponse> {
    return this.promisify('getDefaultModel', {});
  }

  // ==========================================================================
  // Helper: Convert gRPC stream to AsyncIterable
  // ==========================================================================

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private streamToAsyncIterable<T>(call: any): AsyncIterable<T> {
    return {
      [Symbol.asyncIterator](): AsyncIterator<T> {
        return {
          next(): Promise<IteratorResult<T>> {
            return new Promise((resolve, reject) => {
              call.once('data', (data: T) => {
                resolve({ value: data, done: false });
              });
              call.once('end', () => {
                resolve({ value: undefined as T, done: true });
              });
              call.once('error', (error: Error) => {
                reject(error);
              });
            });
          },
        };
      },
    };
  }
}
