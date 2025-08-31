# Event Handlers

Your event handler class - the heart of your conversational application. The `WappaEventHandler` abstract base class provides the foundation for handling all WhatsApp webhook events.

## Overview

The `WappaEventHandler` follows the Template Method pattern to provide a structured approach to webhook processing:

1. **Framework Pre-processing**: Automatic logging and validation
2. **Custom Business Logic**: Your implementation (required for messages, optional for status/errors)
3. **Framework Post-processing**: Cleanup and metrics collection

```python
from wappa import WappaEventHandler
from wappa.webhooks import IncomingMessageWebhook, StatusWebhook, ErrorWebhook

class MyHandler(WappaEventHandler):
    
    async def process_message(self, webhook: IncomingMessageWebhook):
        # Required: Your message processing logic
        await self.messenger.send_text("Hello!", webhook.user.user_id)
    
    async def process_status(self, webhook: StatusWebhook):
        # Optional: Custom status handling
        pass
    
    async def process_error(self, webhook: ErrorWebhook):
        # Optional: Custom error handling  
        pass
```

## Base Class API Reference

### Core Methods

| Method | Required | Description | Parameters |
|--------|----------|-------------|------------|
| `process_message()` | **Yes** | Handle incoming messages | `webhook: IncomingMessageWebhook` |
| `process_status()` | No | Handle delivery status updates | `webhook: StatusWebhook` |
| `process_error()` | No | Handle platform errors | `webhook: ErrorWebhook` |

### Dependency Access

The framework injects these dependencies per-request:

| Property | Type | Description | Always Available |
|----------|------|-------------|------------------|
| `self.messenger` | `IMessenger` | Send messages, mark as read, manage typing | **Yes** |
| `self.cache_factory` | `CacheFactory` | Create cache instances (Memory/JSON/Redis) | **Yes** |
| `self.logger` | `Logger` | Structured logging with module context | **Yes** |

### Utility Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `validate_dependencies()` | `bool` | Check if required dependencies are injected |
| `get_dependency_status()` | `dict` | Get detailed dependency injection status |
| `get_message_stats()` | `dict` | Message processing statistics |
| `get_status_stats()` | `dict` | Status webhook statistics |
| `get_error_stats()` | `dict` | Error webhook statistics |
| `get_all_stats()` | `dict` | Combined webhook processing statistics |

## Implementation Patterns

### Basic Message Handler

Simple conversational application that echoes messages:

```python
class SimpleEchoHandler(WappaEventHandler):
    
    async def process_message(self, webhook: IncomingMessageWebhook):
        # Validate dependencies (recommended)
        if not self.validate_dependencies():
            self.logger.error("Dependencies not available")
            return
        
        # Extract message data
        user_id = webhook.user.user_id
        message_text = webhook.get_message_text()
        message_type = webhook.get_message_type_name()
        
        # Mark as read with typing indicator
        await self.messenger.mark_as_read(
            message_id=webhook.message.message_id, 
            typing=True
        )
        
        # Send echo response
        echo_text = f"🔄 Echo: {message_text}"
        await self.messenger.send_text(
            recipient=user_id,
            text=echo_text,
            reply_to_message_id=webhook.message.message_id
        )
```

### Advanced Handler with State Management

Complex conversational application with user tracking and interactive features:

```python
class AdvancedHandler(WappaEventHandler):
    
    def __init__(self):
        super().__init__()
        self._message_count = 0
        self._user_cache = None
    
    async def process_message(self, webhook: IncomingMessageWebhook):
        self._message_count += 1
        
        # Setup cache (always available - Memory by default)
        if not self._user_cache:
            self._user_cache = self.cache_factory.create_user_cache()
        
        user_id = webhook.user.user_id
        message_text = webhook.get_message_text()
        
        # Track user activity (cache always available)
        user_data = await self._user_cache.get(user_id) or {}
        user_data['last_message'] = message_text
        user_data['message_count'] = user_data.get('message_count', 0) + 1
        await self._user_cache.set(user_id, user_data, ttl=86400)  # 24h
        
        # Process based on message content
        if message_text.startswith('/'):
            await self._handle_command(webhook, message_text)
        else:
            await self._handle_regular_message(webhook)
    
    async def process_status(self, webhook: StatusWebhook):
        # Track delivery statistics
        status = webhook.status.value
        self.logger.info(f"Message {status} for {webhook.recipient_id}")
    
    async def process_error(self, webhook: ErrorWebhook):
        # Handle platform errors with custom logic
        error_count = webhook.get_error_count()
        primary_error = webhook.get_primary_error()
        
        self.logger.error(
            f"WhatsApp error: {primary_error.error_code} - {primary_error.error_title}"
        )
        
        # Implement custom error recovery logic here
```

## Message Processing Workflow

### 1. Dependency Injection

The framework injects dependencies per-request to ensure proper multi-tenant support:

```python
async def process_message(self, webhook: IncomingMessageWebhook):
    # Always validate dependencies first
    if not self.validate_dependencies():
        self.logger.error("Cannot process - dependencies missing")
        return
    
    # Dependencies are now available:
    # self.messenger - WhatsApp messaging client
    # self.cache_factory - Cache backend factory (may be None)
    # self.logger - Configured logger instance
```

### 2. Webhook Data Extraction

Extract information from the webhook using built-in methods:

```python
# User information
user_id = webhook.user.user_id          # Phone number
user_name = webhook.user.profile_name   # Display name

# Message information  
message_id = webhook.message.message_id
message_text = webhook.get_message_text()      # Text content or None
message_type = webhook.get_message_type_name() # "text", "image", "audio", etc.

# Message metadata
timestamp = webhook.message.timestamp
reply_to = webhook.message.context.message_id if webhook.message.context else None
```

### 3. Message Acknowledgment

Mark messages as read to provide user feedback:

```python
# Basic read acknowledgment
await self.messenger.mark_as_read(message_id=webhook.message.message_id)

# With typing indicator (recommended)
await self.messenger.mark_as_read(
    message_id=webhook.message.message_id,
    typing=True  # Shows typing indicator while processing
)
```

### 4. Response Handling

Send responses using the messenger interface:

```python
# Simple text response
result = await self.messenger.send_text(
    recipient=user_id,
    text="Your message here",
    reply_to_message_id=webhook.message.message_id  # Creates reply context
)

# Check if send was successful
if result.success:
    self.logger.info(f"Message sent: {result.message_id}")
else:
    self.logger.error(f"Send failed: {result.error}")
```

## Cache Integration

The cache factory is always available (defaults to Memory cache, or JSON/Redis if configured):

```python
async def process_message(self, webhook: IncomingMessageWebhook):
    # Create cache instances (always available)
    user_cache = self.cache_factory.create_user_cache()
    state_cache = self.cache_factory.create_state_cache()
    
    # Store user data
    user_data = {
        'name': webhook.user.profile_name,
        'last_seen': time.time(),
        'message_count': user_data.get('message_count', 0) + 1
    }
    await user_cache.set(webhook.user.user_id, user_data, ttl=86400)
    
    # Manage conversation state
    await state_cache.set(
        f"conversation_{webhook.user.user_id}", 
        {'step': 'greeting', 'data': {}},
        ttl=3600
    )
```

## Error Handling Best Practices

### Graceful Error Recovery

```python
async def process_message(self, webhook: IncomingMessageWebhook):
    try:
        # Your main processing logic
        await self._process_business_logic(webhook)
        
    except Exception as e:
        self.logger.error(f"Processing failed: {e}", exc_info=True)
        
        # Send user-friendly error response
        await self._send_error_response(webhook, str(e))

async def _send_error_response(self, webhook: IncomingMessageWebhook, error_details: str):
    """Send helpful error message to user."""
    try:
        error_message = (
            "❌ Sorry, something went wrong processing your message.\n"
            "Please try again in a moment."
        )
        
        await self.messenger.send_text(
            recipient=webhook.user.user_id,
            text=error_message,
            reply_to_message_id=webhook.message.message_id
        )
    except Exception as send_error:
        self.logger.error(f"Failed to send error response: {send_error}")
```

### Dependency Validation

```python
async def process_message(self, webhook: IncomingMessageWebhook):
    # Validate required dependencies
    if not self.validate_dependencies():
        self.logger.error("Cannot process message - missing dependencies")
        return
    
    # Cache is always available (Memory by default)
    user_cache = self.cache_factory.create_user_cache()
    # Proceed with full functionality
```

## Performance and Statistics

### Message Processing Metrics

Track performance and usage statistics:

```python
class MetricsHandler(WappaEventHandler):
    
    def __init__(self):
        super().__init__()
        self._start_time = time.time()
        self._message_count = 0
        self._processing_times = []
    
    async def process_message(self, webhook: IncomingMessageWebhook):
        start = time.time()
        self._message_count += 1
        
        try:
            # Your processing logic
            await self._handle_message(webhook)
            
            # Record successful processing time
            processing_time = time.time() - start
            self._processing_times.append(processing_time)
            
            self.logger.info(
                f"Message processed in {processing_time:.2f}s "
                f"(total: {self._message_count})"
            )
            
        except Exception as e:
            self.logger.error(f"Processing failed after {time.time() - start:.2f}s: {e}")
    
    def get_performance_stats(self):
        """Get handler performance metrics."""
        if not self._processing_times:
            return {"message_count": self._message_count, "avg_time": 0}
        
        avg_time = sum(self._processing_times) / len(self._processing_times)
        return {
            "message_count": self._message_count,
            "avg_processing_time": avg_time,
            "total_uptime": time.time() - self._start_time
        }
```

## Common Patterns

### Command Pattern Implementation

Handle slash commands with clean separation:

```python
async def process_message(self, webhook: IncomingMessageWebhook):
    message_text = webhook.get_message_text()
    
    # Check for commands
    if message_text and message_text.startswith('/'):
        await self._handle_command(webhook, message_text)
    else:
        await self._handle_regular_message(webhook)

async def _handle_command(self, webhook: IncomingMessageWebhook, command_text: str):
    """Route commands to specific handlers."""
    command = command_text.split()[0].lower()
    
    command_map = {
        '/help': self._handle_help_command,
        '/start': self._handle_start_command,
        '/settings': self._handle_settings_command,
    }
    
    handler = command_map.get(command)
    if handler:
        await handler(webhook)
    else:
        await self.messenger.send_text(
            recipient=webhook.user.user_id,
            text=f"Unknown command: {command}"
        )
```

### State Management Pattern

Implement multi-step conversations with state persistence:

```python
async def process_message(self, webhook: IncomingMessageWebhook):
    user_id = webhook.user.user_id
    
    # Check for active conversation state
    if self.cache_factory:
        state_cache = self.cache_factory.create_state_cache()
        current_state = await state_cache.get(f"conversation_{user_id}")
        
        if current_state:
            await self._handle_state_message(webhook, current_state)
        else:
            await self._handle_new_conversation(webhook)

async def _handle_state_message(self, webhook: IncomingMessageWebhook, state: dict):
    """Handle message based on conversation state."""
    step = state.get('step')
    
    if step == 'collecting_name':
        await self._collect_name(webhook, state)
    elif step == 'collecting_email':
        await self._collect_email(webhook, state)
    # ... handle other steps
```

## Next Steps

- **Webhook Types**: Learn about [`IncomingMessageWebhook`, `StatusWebhook`, `ErrorWebhook`](webhooks.md)
- **Messaging Interface**: Explore the [`IMessenger` interface](./messaging.md) for sending responses
- **Cache Management**: Understand [state management and caching](../concepts/state-management.md)
- **Examples**: Browse [example implementations](../resources/examples.md) for complete patterns

The event handler is where your conversational application logic lives - everything else is framework infrastructure that supports your implementation.