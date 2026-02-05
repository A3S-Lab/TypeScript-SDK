/**
 * A3S Code Agent TypeScript SDK
 *
 * This module exports the main client and configuration utilities
 * for interacting with the A3S Code Agent Service.
 */

export { A3sClient, StorageType, SessionLane, TimeoutAction, TaskHandlerMode } from './client.js';
export type {
  A3sClientOptions,
  // Lifecycle types
  HealthStatus,
  HealthCheckResponse,
  AgentInfo,
  ToolCapability,
  ModelCapability,
  ResourceLimits,
  GetCapabilitiesResponse,
  InitializeResponse,
  ShutdownResponse,
  // Session types
  LLMConfig,
  SessionConfig,
  ContextUsage,
  SessionState,
  Session,
  CreateSessionResponse,
  DestroySessionResponse,
  ListSessionsResponse,
  GetSessionResponse,
  ConfigureSessionResponse,
  // Message types
  MessageRole,
  Message,
  TextContent,
  ToolUseContent,
  ToolResultContent,
  ContentBlock,
  ConversationMessage,
  GetMessagesResponse,
  // Generation types
  ToolResult,
  ToolCall,
  Usage,
  FinishReason,
  GenerateResponse,
  ChunkType,
  GenerateChunk,
  GenerateStructuredResponse,
  GenerateStructuredChunk,
  // Skill types
  Skill,
  LoadSkillResponse,
  UnloadSkillResponse,
  ListSkillsResponse,
  // Context types
  GetContextUsageResponse,
  CompactContextResponse,
  ClearContextResponse,
  // Event types
  EventType,
  AgentEvent,
  // Control types
  CancelResponse,
  PauseResponse,
  ResumeResponse,
  // HITL types
  SessionLaneType,
  TimeoutActionType,
  ConfirmationPolicy,
  ConfirmToolExecutionResponse,
  SetConfirmationPolicyResponse,
  GetConfirmationPolicyResponse,
  // External task types
  TaskHandlerModeType,
  LaneHandlerConfig,
  ExternalTask,
  SetLaneHandlerResponse,
  GetLaneHandlerResponse,
  CompleteExternalTaskResponse,
  ListPendingExternalTasksResponse,
  // Permission types
  PermissionDecision,
  PermissionRule,
  PermissionPolicy,
  SetPermissionPolicyResponse,
  GetPermissionPolicyResponse,
  CheckPermissionResponse,
  AddPermissionRuleResponse,
  // Todo types
  Todo,
  GetTodosResponse,
  SetTodosResponse,
  // Provider types
  ModelCostInfo,
  ModelLimitInfo,
  ModelModalitiesInfo,
  ModelInfo,
  ProviderInfo,
  ListProvidersResponse,
  GetProviderResponse,
  AddProviderResponse,
  UpdateProviderResponse,
  RemoveProviderResponse,
  SetDefaultModelResponse,
  GetDefaultModelResponse,
} from './client.js';

export {
  getConfig,
  getModelConfig,
  getDefaultModel,
  printConfig,
  loadConfigFromFile,
  loadConfigFromDir,
  loadDefaultConfig,
} from './config.js';

export type {
  A3sConfig,
  ProviderConfig,
  ModelConfigEntry,
  ModelConfig,
} from './config.js';
