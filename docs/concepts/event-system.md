# Handling Messages & Events

WhatsApp sends you events. You handle them. Here's how.

Your conversational app receives three types of events from WhatsApp, but **most of the time you only care about messages**. Wappa makes handling all events simple and predictable.

---

## The Three Event Types

WhatsApp sends your app different types of webhook events. Here's what each one does:

=== "Messages (95% of the time)"

    **When it happens**: User sends you anything - text, images, voice notes, button clicks
    
    ```python
    class MyApp(WappaEventHandler):
        async def process_message(self, webhook):
            # Handle ALL user messages here
            user_id = webhook.user.user_id
            message_text = webhook.get_message_text()
            
            await self.messenger.send_text(f"You said: {message_text}", user_id)
    ```
    
    **What you get**: Complete message data, user info, message type detection

=== "Status Updates (tracking)"

    **When it happens**: Messages you sent change status (delivered, read, failed)
    
    ```python
    async def process_status(self, webhook):
        # Optional - track your message delivery
        status = webhook.status.value  # "sent", "delivered", "read", "failed"
        recipient = webhook.recipient_id
        
        self.logger.info(f"Message {status} for {recipient}")
    ```
    
    **What you get**: Delivery tracking, read receipts, failure notifications

=== "Errors (troubleshooting)"

    **When it happens**: WhatsApp encounters platform errors
    
    ```python
    async def process_error(self, webhook):
        # Optional - handle platform errors gracefully
        error_count = webhook.get_error_count()
        primary_error = webhook.get_primary_error()
        
        self.logger.error(f"WhatsApp error: {primary_error.error_title}")
    ```
    
    **What you get**: Error codes, descriptions, affected users

---

## Message Types - Everything Users Can Send

Your `process_message` method handles all message types. Here's what users can send you:

### Text Messages
```python
# User sends: "Hello there!"
async def process_message(self, webhook):
    if webhook.get_message_type_name() == "text":
        text = webhook.get_message_text()  # "Hello there!"
        await self.messenger.send_text(f"Echo: {text}", webhook.user.user_id)
```

### Media Messages
```python
# User sends: Image, video, audio, document, sticker
async def process_message(self, webhook):
    message_type = webhook.get_message_type_name()
    
    if message_type in ["image", "video", "audio", "document", "sticker"]:
        # Access media details
        media_id = webhook.message.image.id  # (for images)
        mime_type = webhook.message.image.mime_type  # "image/jpeg"
        
        await self.messenger.send_text(f"Nice {message_type}!", webhook.user.user_id)
```

### Interactive Messages
```python
# User clicks button or selects from list
async def process_message(self, webhook):
    if webhook.get_message_type_name() == "interactive":
        selection = webhook.get_interactive_selection()  # Button ID or list item
        
        if selection == "help":
            await self.messenger.send_text("Here's help!", webhook.user.user_id)
```

### Location & Contacts
```python
# User shares location or contact
async def process_message(self, webhook):
    message_type = webhook.get_message_type_name()
    
    if message_type == "location":
        lat = webhook.message.location.latitude
        lng = webhook.message.location.longitude
        await self.messenger.send_text(f"Thanks for location: {lat}, {lng}", webhook.user.user_id)
        
    elif message_type == "contacts":
        contact_count = len(webhook.message.contacts)
        await self.messenger.send_text(f"Got {contact_count} contacts!", webhook.user.user_id)
```

**That's it!** Every message type is handled the same way - check the type, extract the data, respond appropriately.

---

## State Management - Remembering Conversations

Most conversational apps need to remember things between messages. Wappa gives you three caching options:

=== "Memory Cache (Development)"

    **Best for**: Local development, testing, simple apps
    
    ```python
    # Automatic with Wappa() - no configuration needed
    app = Wappa()  # Uses memory cache by default
    
    # In your event handler
    async def process_message(self, webhook):
        user_id = webhook.user.user_id
        
        # Remember user's last message using cache factory
        user_cache = self.cache_factory.create_user_cache()
        cache_key = f"user_data"
        
        await user_cache.set(cache_key, {
            "last_message": webhook.get_message_text(),
            "conversation_step": "greeting"
        })
        
        # Retrieve it later
        user_data = await user_cache.get(cache_key)
        step = user_data.get("conversation_step", "new")
    ```
    
    **Pros**: Instant, no setup, perfect for development  
    **Cons**: Data lost when app restarts

=== "JSON Cache (Simple Persistence)"

    **Best for**: Small apps, file-based persistence, easy debugging
    
    ```python
    # Simple file-based caching
    app = Wappa(cache="json")
    
    # Usage is identical to memory cache
    state_cache = self.cache_factory.create_state_cache()
    cache_key = f"ordering_state"
    
    await user_cache.set(cache_key, {"step": "ordering"})
    user_data = await user_cache.get(cache_key)
    ```
    
    **Pros**: Survives restarts, human-readable files, no external dependencies  
    **Cons**: Slower for high volume, not suitable for multiple app instances

=== "Redis Cache (Production)"

    **Best for**: Production apps, high volume, multiple instances
    
    ```python
    # Production-ready caching
    app = Wappa(cache="redis")
    
    # Same simple interface, powerful backend
    user_cache = self.cache_factory.create_table_cache()
    cache_key = f"user_cart"
    
    await user_cache.set(cache_key, {"cart": ["item1", "item2"]})
    cart_data = await user_cache.get(cache_key)
    ```
    
    **Pros**: High performance, shared between app instances, advanced features  
    **Cons**: Requires Redis server

### Cache Methods You'll Use

```python
# Create cache instance from factory
user_cache = self.cache_factory.create_user_cache()
cache_key = f"user:{user_id}:data"

# Store user data
await user_cache.set(cache_key, {"key": "value"}, ttl=3600)

# Retrieve user data  
user_data = await user_cache.get(cache_key)

# Check if data exists
exists = await user_cache.exists(cache_key)

# Clear user data
await user_cache.delete(cache_key)
```

**Want more advanced caching?** Check our [complete caching guide](../api/cache.md) for sessions, expiration, and Redis patterns.

---

## Practical Event Handling Patterns

=== "Simple Echo App"

    **Perfect for**: Learning, testing, proof of concepts
    
    ```python
    class EchoApp(WappaEventHandler):
        async def process_message(self, webhook):
            # Just echo everything back
            text = webhook.get_message_text()
            await self.messenger.send_text(f"Echo: {text}", webhook.user.user_id)
    ```
    
    **What it does**: Responds to any message with an echo

=== "Customer Service with Buttons"

    **Perfect for**: FAQs, support, menu-driven interactions
    
    ```python
    from wappa.messaging.whatsapp.models.interactive_models import ReplyButton
    
    class CustomerServiceApp(WappaEventHandler):
        async def process_message(self, webhook):
            user_id = webhook.user.user_id
            message = webhook.get_message_text().lower()
            
            # Handle common questions
            if "hours" in message:
                await self.messenger.send_text("We're open Mon-Fri 9AM-6PM", user_id)
            elif "location" in message:
                await self.messenger.send_location(40.7589, -73.9851, user_id, "Find us here!")
            else:
                # Show interactive menu
                buttons = [
                    ReplyButton(id="hours", title="Store Hours"),
                    ReplyButton(id="location", title="Our Location"),
                    ReplyButton(id="support", title="Get Support")
                ]
                await self.messenger.send_button_message(
                    buttons=buttons, 
                    recipient=user_id, 
                    body="How can I help you today?"
                )
    ```
    
    **What it does**: Smart keyword detection + interactive button menu

=== "Conversation Flow with State"

    **Perfect for**: Multi-step processes, ordering, surveys
    
    ```python
    from wappa.messaging.whatsapp.models.interactive_models import ReplyButton
    
    class OrderApp(WappaEventHandler):
        async def process_message(self, webhook):
            user_id = webhook.user.user_id
            message = webhook.get_message_text()
            
            # Get current conversation state using cache factory
            state_cache = self.cache_factory.create_state_cache()
            cache_key = f"state:{user_id}:order"
            
            user_state = await state_cache.get(cache_key) or {}
            current_step = user_state.get("step", "start")
            
            if current_step == "start":
                await state_cache.set(cache_key, {"step": "menu"}, ttl=3600)
                await self._show_menu(user_id)
                
            elif current_step == "menu":
                await state_cache.set(cache_key, {
                    "step": "confirm",
                    "selected_item": message
                }, ttl=3600)
                await self.messenger.send_text(f"Add {message} to cart?", user_id)
                
            elif current_step == "confirm":
                if message.lower() == "yes":
                    item = user_state.get("selected_item")
                    await self.messenger.send_text(f"✅ {item} added to cart!", user_id)
                    await state_cache.delete(cache_key)  # Reset conversation
                else:
                    await self._show_menu(user_id)  # Back to menu
        
        async def _show_menu(self, user_id):
            buttons = [
                ReplyButton(id="pizza", title="🍕 Pizza"),
                ReplyButton(id="burger", title="🍔 Burger"),
                ReplyButton(id="salad", title="🥗 Salad")
            ]
            await self.messenger.send_button_message(
                buttons=buttons,
                recipient=user_id,
                body="What would you like to order?"
            )
    ```
    
    **What it does**: Multi-step ordering flow with state persistence

---

## Error Handling That Actually Helps

### Message Processing Errors
```python
class RobustApp(WappaEventHandler):
    async def process_message(self, webhook):
        try:
            # Your business logic here
            await self._handle_user_message(webhook)
            
        except Exception as e:
            # Log the error with context
            self.logger.error(f"Message processing failed: {e}", exc_info=True)
            
            # Inform the user gracefully
            await self.messenger.send_text(
                "Sorry, I had trouble processing that. Please try again!",
                webhook.user.user_id
            )
```

### Platform Error Handling
```python
async def process_error(self, webhook):
    """Handle WhatsApp platform errors"""
    
    error_count = webhook.get_error_count()
    primary_error = webhook.get_primary_error()
    
    # Log for debugging
    self.logger.error(
        f"WhatsApp platform error: {primary_error.error_code} - {primary_error.error_title}"
    )
    
    # Handle specific error types
    if primary_error.error_code == 131051:  # Unsupported message type
        self.logger.info("User sent unsupported message type - this is normal")
    elif "rate limit" in primary_error.error_title.lower():
        self.logger.warning("Rate limit exceeded - implement backoff strategy")
    else:
        self.logger.error(f"Unexpected platform error: {primary_error}")
```

### Message Delivery Tracking
```python
async def process_status(self, webhook):
    """Track message delivery status"""
    
    status = webhook.status.value
    recipient = webhook.recipient_id
    message_id = webhook.message_id
    
    if status == "failed":
        self.logger.warning(f"Message {message_id} failed to deliver to {recipient}")
        # Maybe retry or try alternative communication
    elif status == "read":
        self.logger.info(f"Message {message_id} was read by {recipient}")
        # Update user engagement metrics
```

---

## Common Patterns & Best Practices

### Message Type Detection
```python
# Simple type checking
message_type = webhook.get_message_type_name()

if message_type == "text":
    # Handle text
elif message_type == "interactive":  
    # Handle button/list selections
elif message_type in ["image", "video", "audio"]:
    # Handle media
else:
    # Handle everything else
```

### User Session Management
```python
async def process_message(self, webhook):
    user_id = webhook.user.user_id
    
    # Always validate dependencies first
    if not self.validate_dependencies():
        return
    
    # Get user session
    session = await self.cache.get_user_state(user_id)
    
    # Process based on session state
    current_flow = session.get("flow", "main_menu")
    
    if current_flow == "main_menu":
        await self._handle_main_menu(webhook)
    elif current_flow == "ordering":
        await self._handle_ordering_flow(webhook, session)
    # ... more flows
```

### Graceful Error Recovery
```python
async def process_message(self, webhook):
    try:
        # Attempt normal processing
        await self._complex_business_logic(webhook)
        
    except ValidationError as e:
        # Handle user input errors
        await self.messenger.send_text(
            "Please check your input and try again.", 
            webhook.user.user_id
        )
        
    except ExternalServiceError as e:
        # Handle external service failures
        await self.messenger.send_text(
            "Service temporarily unavailable. We'll try again shortly.",
            webhook.user.user_id
        )
        
    except Exception as e:
        # Log unexpected errors
        self.logger.error(f"Unexpected error: {e}", exc_info=True)
        
        # Always respond to the user
        await self.messenger.send_text(
            "Something went wrong. Our team has been notified.",
            webhook.user.user_id
        )
```

---

## Quick Reference

### Essential Webhook Properties
```python
# User information
webhook.user.user_id         # "1234567890"
webhook.user.profile_name    # "John Doe" 

# Message details
webhook.get_message_text()           # "Hello!"
webhook.get_message_type_name()      # "text"
webhook.message.message_id           # "wamid.abc123..."

# Interactive selections
webhook.get_interactive_selection()  # "button_id" or "list_item_id"

# Media details (when applicable)
webhook.message.image.id            # Media file ID
webhook.message.image.mime_type     # "image/jpeg"
```

### Cache Operations
```python
# Store data
await self.cache.set_user_state(user_id, {"step": "ordering"})

# Retrieve data
user_data = await self.cache.get_user_state(user_id)
step = user_data.get("step", "start")

# Check existence
if await self.cache.user_exists(user_id):
    # User has previous data
```

### Status Values
```python
# Message status tracking
webhook.status.value  # "sent" | "delivered" | "read" | "failed"
```

---

## Next Steps

Ready to dive deeper? Here's where to go next:

- **[Complete Messaging Guide](messaging.md)** - Send any type of message WhatsApp supports
- **[State Management](state-management.md)** - Caching patterns, Redis, JSON, and memory options
- **[Webhooks API](../api/webhooks.md)** - Complete webhook data structures and methods
- **[Architecture Overview](architecture.md)** - How everything fits together

**Questions?** Check our [example applications](../resources/examples.md) for complete working conversational apps that demonstrate these patterns.