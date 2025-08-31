# Webhook Data Reference

*Data structures for everything WhatsApp sends you*

**You don't need to understand the raw format, but here it is.** Wappa transforms WhatsApp's complex webhook JSON into clean, predictable Python objects with helpful methods.

---

## The Three Webhook Types

WhatsApp sends your conversational app three types of webhooks. Wappa handles the complexity and gives you simple interfaces:

=== "IncomingMessageWebhook (95% of the time)"

    **When**: User sends you anything - text, images, voice notes, button clicks, location
    
    **What you get**: Clean message data with helper methods
    
    ```python
    async def process_message(self, webhook):
        # Everything you need is here
        user_id = webhook.user.user_id                    # "1234567890123"
        message_text = webhook.get_message_text()         # "Hello!"
        message_type = webhook.get_message_type_name()    # "text"
        timestamp = webhook.timestamp                     # datetime object
        platform = webhook.platform                      # PlatformType.WHATSAPP
        
        # Optional context information  
        was_forwarded = webhook.was_forwarded()           # bool
        has_business_context = webhook.has_business_context()  # bool
        raw_data = webhook.get_raw_webhook_data()         # dict (for debugging)
    ```

=== "StatusWebhook (delivery tracking)"

    **When**: Messages you sent change status - delivered, read, failed
    
    **What you get**: Delivery tracking and billing context
    
    ```python
    async def process_status(self, webhook):
        # Track your message delivery
        message_id = webhook.message_id                   # "wamid.abc123..."
        status = webhook.status.value                     # "delivered", "read", "failed"
        recipient = webhook.recipient_id                  # "1234567890123"
        timestamp = webhook.timestamp                     # datetime object
        
        # Check delivery status
        delivered = webhook.is_delivered_status()         # bool
        failed = webhook.is_failed_status()               # bool
        
        # Error handling for failed messages
        if webhook.has_errors():
            error = webhook.get_primary_error()           # ErrorDetailBase
            print(f"Failed: {error.error_title}")
    ```

=== "ErrorWebhook (troubleshooting)"

    **When**: WhatsApp encounters platform-level errors
    
    **What you get**: Structured error information with context
    
    ```python
    async def process_error(self, webhook):
        # Handle platform errors
        error_count = webhook.get_error_count()           # int
        primary_error = webhook.get_primary_error()       # ErrorDetailBase
        error_codes = webhook.get_error_codes()           # [131051, 131052]
        
        # Error classification
        is_critical = webhook.has_critical_errors()       # bool (5xx codes)
        is_retryable = webhook.has_retryable_errors()     # bool
        
        # Detailed error information
        error_title = primary_error.error_title          # "Unsupported message type"
        error_code = primary_error.error_code            # 131051
    ```

---

## IncomingMessageWebhook Reference

### Core Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `tenant` | `TenantBase` | Business account identification | Contains phone_number_id, business_id |
| `user` | `UserBase` | User who sent the message | Contains user_id, phone_number, profile_name |
| `message` | `BaseMessage` | The actual message content | Text, media, interactive, location, etc. |
| `timestamp` | `datetime` | When message was received | `2025-01-15T10:30:45Z` |
| `platform` | `PlatformType` | Source platform | `PlatformType.WHATSAPP` |
| `webhook_id` | `str` | Unique webhook identifier | `webhook_123456789` |

### Essential Methods

| Method | Returns | Description | Example |
|--------|---------|-------------|---------|
| `get_message_text()` | `str` | Text content or empty string | `"Hello there!"` |
| `get_message_type_name()` | `str` | Message type identifier | `"text"`, `"image"`, `"interactive"` |
| `get_interactive_selection()` | `str \| None` | Button/list selection ID | `"help_button"`, `"product_123"` |
| `was_forwarded()` | `bool` | Check if message was forwarded | `True`/`False` |
| `has_business_context()` | `bool` | From business interaction | `True`/`False` |
| `has_ad_referral()` | `bool` | From advertisement click | `True`/`False` |
| `get_sender_display_name()` | `str` | User's display name | `"John Doe"` |
| `get_raw_webhook_data()` | `dict \| None` | Original JSON payload | Full webhook dict |

### User Information (`webhook.user`)

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `user_id` | `str` | WhatsApp user ID | `"1234567890123"` |
| `phone_number` | `str` | User's phone number | `"+1234567890"` |
| `profile_name` | `str \| None` | User's display name | `"John Doe"` |
| `get_display_name()` | `str` | Name or phone fallback | `"John Doe"` |

### Business Context (`webhook.business_context`)

Available when message originated from business interactions (catalog, buttons).

| Property | Type | Description |
|----------|------|-------------|
| `contextual_message_id` | `str` | Original business message ID |
| `catalog_id` | `str \| None` | Product catalog ID |
| `product_retailer_id` | `str \| None` | Product ID from catalog |
| `has_product_context()` | `bool` | Check if involves product |

---

## Message Types & Data Access

### Text Messages

```python
# Basic text message
if webhook.get_message_type_name() == "text":
    text = webhook.get_message_text()                    # "Hello!"
    message_id = webhook.message.message_id              # "wamid.abc123..."
    
    # Reply context (if replying to another message)
    if webhook.message.has_context():
        context = webhook.message.get_context()
        original_id = context.original_message_id        # ID of replied message
```

### Interactive Messages (Buttons & Lists)

```python
# Button or list selection
if webhook.get_message_type_name() == "interactive":
    selection = webhook.get_interactive_selection()      # "help_button"
    
    # Access interactive details
    interactive_type = webhook.message.interactive_type  # InteractiveType.BUTTON_REPLY
    option_title = webhook.message.selected_option_title # "Get Help"
    original_msg = webhook.message.original_message_id   # Interactive message ID
    
    # Check selection type
    is_button = webhook.message.is_button_reply()        # bool
    is_list = webhook.message.is_list_reply()            # bool
```

### Media Messages

```python
# Image, video, audio, document, sticker
if webhook.get_message_type_name() in ["image", "video", "audio", "document", "sticker"]:
    media_id = webhook.message.media_id                  # "media_abc123"
    file_size = webhook.message.file_size                # 1024000 (bytes)
    caption = webhook.message.caption                    # "Check this out!"
    
    # Download information
    download_info = webhook.message.get_download_info()  # dict with URL/headers
    
    # Type-specific properties
    if webhook.message.is_image():
        mime_type = webhook.message.media_type           # MediaType.IMAGE_JPEG
    elif webhook.message.is_audio():
        duration = webhook.message.duration              # 30 (seconds)
        is_voice = webhook.message.is_voice_message()    # bool
```

### Location Messages

```python
if webhook.get_message_type_name() == "location":
    lat = webhook.message.latitude                       # 40.7589
    lng = webhook.message.longitude                      # -73.9851
    address = webhook.message.address                    # "New York, NY"
    name = webhook.message.location_name                 # "Central Park"
```

### Contact Messages

```python
if webhook.get_message_type_name() == "contact":
    name = webhook.message.contact_name                  # "John Doe"
    phone = webhook.message.contact_phone                # "+1234567890"
    contact_data = webhook.message.contact_data          # dict with all contact info
```

---

## StatusWebhook Reference

### Core Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `tenant` | `TenantBase` | Business account identification | Contains phone_number_id, business_id |
| `message_id` | `str` | ID of message this status refers to | `"wamid.abc123..."` |
| `status` | `MessageStatus` | Current message status | `MessageStatus.DELIVERED` |
| `recipient_id` | `str` | User who received the message | `"1234567890123"` |
| `timestamp` | `datetime` | When status update occurred | `2025-01-15T10:30:45Z` |
| `platform` | `PlatformType` | Source platform | `PlatformType.WHATSAPP` |

### Status Check Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `is_delivered_status()` | `bool` | Message was delivered or read |
| `is_failed_status()` | `bool` | Message delivery failed |
| `has_errors()` | `bool` | Status includes error information |
| `get_primary_error()` | `ErrorDetailBase \| None` | First error if failed |
| `is_billable_message()` | `bool` | Message is billable |

### Status Values

| Status | Description | When It Happens |
|--------|-------------|-----------------|
| `"sent"` | Message sent to WhatsApp | Immediately after sending |
| `"delivered"` | Message reached user's device | Within seconds |
| `"read"` | User opened the message | When user reads it |
| `"failed"` | Message delivery failed | Various error conditions |

---

## ErrorWebhook Reference

### Core Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `tenant` | `TenantBase` | Business account identification | Contains phone_number_id, business_id |
| `errors` | `list[ErrorDetailBase]` | List of error details | Multiple errors possible |
| `timestamp` | `datetime` | When errors occurred | `2025-01-15T10:30:45Z` |
| `error_level` | `str` | Error severity level | `"system"`, `"app"`, `"account"` |
| `platform` | `PlatformType` | Source platform | `PlatformType.WHATSAPP` |

### Error Analysis Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `get_primary_error()` | `ErrorDetailBase` | First/main error |
| `get_error_count()` | `int` | Number of errors |
| `has_critical_errors()` | `bool` | Any 5xx server errors |
| `has_retryable_errors()` | `bool` | Any temporary errors |
| `get_error_codes()` | `list[int]` | All error codes |

### Error Detail Properties

Each error in the `errors` list has these properties:

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `error_code` | `int` | Numeric error code | `131051` |
| `error_title` | `str` | Human-readable title | `"Unsupported message type"` |
| `error_message` | `str` | Detailed error message | `"Message type is not supported"` |
| `is_temporary_error()` | `bool` | Can be retried | Method to check retryability |

---

## Raw vs Clean Interface

### What WhatsApp Actually Sends (Raw)

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "987654321",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "+1555123456",
          "phone_number_id": "123456789"
        },
        "contacts": [{
          "profile": {
            "name": "John Doe"
          },
          "wa_id": "1234567890123"
        }],
        "messages": [{
          "from": "1234567890123",
          "id": "wamid.abc123def456",
          "timestamp": "1642678845",
          "text": {
            "body": "Hello there!"
          },
          "type": "text"
        }]
      },
      "field": "messages"
    }]
  }]
}
```

### What Wappa Gives You (Clean)

```python
# No JSON parsing needed!
async def process_message(self, webhook):
    # Clean, typed access
    user_id = webhook.user.user_id              # "1234567890123"
    user_name = webhook.user.profile_name       # "John Doe" 
    message_text = webhook.get_message_text()   # "Hello there!"
    timestamp = webhook.timestamp               # datetime(2022, 1, 20, 10, 0, 45)
    
    # Helper methods work across all message types
    message_type = webhook.get_message_type_name()  # "text"
    
    # Optional: access raw data for debugging
    raw_json = webhook.get_raw_webhook_data()   # Full original JSON
```

---

## Common Patterns & Helper Methods

### Message Type Detection

```python
# Simple type checking
message_type = webhook.get_message_type_name()

if message_type == "text":
    text = webhook.get_message_text()
elif message_type == "interactive":
    selection = webhook.get_interactive_selection()
elif message_type in ["image", "video", "audio", "document"]:
    media_id = webhook.message.media_id
    caption = webhook.message.caption
elif message_type == "location":
    lat, lng = webhook.message.latitude, webhook.message.longitude
```

### Interactive Message Handling

```python
# Handle button and list selections
if webhook.get_message_type_name() == "interactive":
    selection = webhook.get_interactive_selection()  # "help", "product_123"
    
    # Pattern matching on selection IDs
    if selection == "help":
        await self.messenger.send_text("Here's help!", webhook.user.user_id)
    elif selection.startswith("product_"):
        product_id = selection.replace("product_", "")
        await self.show_product_details(product_id, webhook.user.user_id)
```

### Context Detection

```python
# Check message context
if webhook.was_forwarded():
    # Handle forwarded messages differently
    await self.messenger.send_text("Thanks for forwarding that!", webhook.user.user_id)

if webhook.has_business_context():
    # User interacted with catalog or business buttons
    context = webhook.business_context
    if context.has_product_context():
        product_id = context.product_retailer_id
        # Handle product inquiry
        
if webhook.has_ad_referral():
    # User came from advertisement
    referral = webhook.ad_referral
    campaign_id = referral.source_id
    # Track ad conversion
```

### Error Handling Patterns

```python
# Status webhook error handling
async def process_status(self, webhook):
    if webhook.is_failed_status() and webhook.has_errors():
        error = webhook.get_primary_error()
        
        if error.error_code == 131051:  # Unsupported message type
            self.logger.info("User sent unsupported message - normal")
        elif "rate limit" in error.error_title.lower():
            self.logger.warning("Rate limited - implement backoff")
            # Implement retry logic
        else:
            self.logger.error(f"Message delivery failed: {error.error_title}")

# Error webhook handling  
async def process_error(self, webhook):
    if webhook.has_critical_errors():
        # 5xx server errors - escalate
        await self.notify_admin(webhook.get_error_codes())
    elif webhook.has_retryable_errors():
        # Temporary issues - retry later
        await self.schedule_retry(webhook)
```

---

## Edge Cases & Gotchas

### Message Type Edge Cases

```python
# Some users send unsupported message types
if webhook.get_message_type_name() == "unsupported":
    # WhatsApp couldn't process the message type
    await self.messenger.send_text(
        "Sorry, I can't process that type of message.",
        webhook.user.user_id
    )

# Empty text messages (rare but possible)
if webhook.get_message_type_name() == "text":
    text = webhook.get_message_text()
    if not text.strip():
        # Handle empty message
        return
```

### Interactive Message Gotchas

```python
# Interactive selections might be None
selection = webhook.get_interactive_selection()
if not selection:
    self.logger.warning("Interactive message with no selection")
    return

# Original message might not exist anymore
if webhook.get_message_type_name() == "interactive":
    original_id = webhook.message.original_message_id
    # This message ID might be from a different conversation
```

### Media Message Considerations

```python
# Media files have size limits and expiration
if webhook.message.is_image():
    file_size = webhook.message.file_size
    if file_size and file_size > 16 * 1024 * 1024:  # 16MB
        await self.messenger.send_text(
            "Image too large. Please send smaller file.",
            webhook.user.user_id
        )
        return
    
    # Media URLs expire after some time
    download_info = webhook.message.get_download_info()
    # Download immediately or store media_id for later retrieval
```

### Status Webhook Timing

```python
# Status updates might arrive out of order
async def process_status(self, webhook):
    # A "read" might arrive before "delivered" due to network timing
    status = webhook.status.value
    
    # Don't assume linear progression: sent → delivered → read
    # Always check the actual status value
```

---

## Debugging with Raw Data

### Inspecting Raw Webhooks

```python
async def process_message(self, webhook):
    # Enable in development to see raw WhatsApp JSON
    if settings.is_development:
        raw_data = webhook.get_raw_webhook_data()
        self.logger.debug(f"Raw webhook: {json.dumps(raw_data, indent=2)}")
    
    # Your processing logic here
```

### Common Debug Patterns

```python
# Log webhook summaries
summary = webhook.get_summary()
self.logger.info(f"Processing: {summary}")

# Output example:
# {
#   "webhook_type": "incoming_message",
#   "platform": "whatsapp", 
#   "message_type": "text",
#   "sender": "1234567890123",
#   "tenant": "123456789",
#   "timestamp": "2025-01-15T10:30:45Z"
# }
```

### Webhook Validation

```python
class MyApp(WappaEventHandler):
    async def process_message(self, webhook):
        # Always validate dependencies first
        if not self.validate_dependencies():
            self.logger.error("Dependencies not properly injected")
            return
        
        # Get dependency status for debugging
        status = self.get_dependency_status()
        self.logger.debug(f"Dependencies: {status}")
```

---

## Next Steps

Now that you understand webhook data structures:

- **[Event System Guide](../concepts/event-system.md)** - Practical event handling patterns
- **[Messaging Guide](../concepts/messaging.md)** - Send any type of message WhatsApp supports  
- **[State Management](../concepts/state-management.md)** - Remember conversations between messages
- **[Event Handlers](event-handlers.md)** - See error handling examples in practice

**Need working examples?** Check our [example applications](../resources/examples.md) to see webhook handling in action.