# OpenAI API 格式对齐计划

## 目标

在 A3S Code 服务端层面对齐 OpenAI 的数据格式，使 SDK 和服务端都使用 OpenAI 标准格式。

## 当前状态

### Proto 定义 (code_agent.proto)

```protobuf
message Message {
  enum Role {
    ROLE_UNKNOWN = 0;
    ROLE_USER = 1;
    ROLE_ASSISTANT = 2;
    ROLE_SYSTEM = 3;
    ROLE_TOOL = 4;
  }

  Role role = 1;
  string content = 2;
  map<string, string> metadata = 3;
}
```

### OpenAI 标准格式

```json
{
  "role": "user" | "assistant" | "system" | "tool",
  "content": "string" | [ContentPart],
  "name": "optional string",
  "tool_calls": [ToolCall],
  "tool_call_id": "optional string"
}
```

## 修改方案

### 方案 A: 使用字符串角色 (推荐)

修改 proto 文件，使用字符串而不是枚举：

```protobuf
message Message {
  // OpenAI-compatible role: "user", "assistant", "system", "tool"
  string role = 1;

  // Content can be string or array of content parts
  oneof content_type {
    string content = 2;
    ContentParts content_parts = 3;
  }

  // Optional fields for tool messages
  string name = 4;
  repeated ToolCall tool_calls = 5;
  string tool_call_id = 6;
}

message ContentParts {
  repeated ContentPart parts = 1;
}

message ContentPart {
  oneof part_type {
    TextContent text = 1;
    ImageContent image_url = 2;
  }
}

message TextContent {
  string type = 1;  // "text"
  string text = 2;
}

message ImageContent {
  string type = 1;  // "image_url"
  ImageUrl image_url = 2;
}

message ImageUrl {
  string url = 1;
  string detail = 2;  // "auto", "low", "high"
}
```

### 方案 B: 保持枚举但添加转换

保持现有的枚举定义，但在服务端添加转换层：

```rust
// 在 Rust 代码中添加转换
impl From<&str> for MessageRole {
    fn from(s: &str) -> Self {
        match s {
            "user" => MessageRole::User,
            "assistant" => MessageRole::Assistant,
            "system" => MessageRole::System,
            "tool" => MessageRole::Tool,
            _ => MessageRole::Unknown,
        }
    }
}

impl From<MessageRole> for &str {
    fn from(role: MessageRole) -> Self {
        match role {
            MessageRole::User => "user",
            MessageRole::Assistant => "assistant",
            MessageRole::System => "system",
            MessageRole::Tool => "tool",
            _ => "unknown",
        }
    }
}
```

## 需要修改的文件

### 1. Proto 文件

**文件**: `crates/code/proto/code_agent.proto`

修改内容：
- Message 结构体
- ToolCall 结构体
- GenerateResponse 结构体
- GenerateChunk 结构体

### 2. Rust 代码

**文件**: `crates/code/src/convert.rs`

添加 OpenAI 格式转换函数。

**文件**: `crates/code/src/session.rs`

更新消息处理逻辑。

**文件**: `crates/code/src/llm.rs`

更新 LLM 调用时的消息格式。

### 3. SDK 更新

**文件**: `sdk/typescript/ts/client.ts`

更新类型定义以匹配新的 proto 格式。

**文件**: `sdk/typescript/proto/code_agent.proto`

同步更新 proto 文件。

## 实现步骤

### 阶段 1: 添加兼容层 (当前已完成)

✅ SDK 层面添加 OpenAI 格式支持
✅ 自动转换 OpenAI 格式到 A3S 格式
✅ 添加 chatCompletion() 和 streamChatCompletion() 方法

### 阶段 2: 服务端支持 (待实现)

1. 修改 proto 文件，支持字符串角色
2. 更新 Rust 代码，处理两种格式
3. 添加配置选项，选择输出格式
4. 更新测试用例

### 阶段 3: 完全迁移 (可选)

1. 废弃枚举格式
2. 只使用字符串格式
3. 更新所有文档

## 向后兼容性

- 保持对现有枚举格式的支持
- 新增字符串格式支持
- SDK 自动检测并转换格式
- 配置选项控制默认格式

## 测试计划

1. 单元测试：格式转换函数
2. 集成测试：两种格式的消息处理
3. 端到端测试：完整的对话流程
4. 性能测试：转换开销

## 时间估计

- 阶段 1: ✅ 已完成
- 阶段 2: 需要修改服务端代码
- 阶段 3: 可选，根据需求决定

## 参考资料

- [OpenAI Chat Completions API](https://platform.openai.com/docs/api-reference/chat)
- [OpenAI Message Format](https://platform.openai.com/docs/guides/text-generation)
