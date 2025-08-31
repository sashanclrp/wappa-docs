# API Reference

Welcome to Wappa's API reference! These detailed guides cover every class, method, and feature you'll use to build production-ready conversational applications.

## What You'll Find

This section provides comprehensive documentation for Wappa's complete API surface:

📚 **[Wappa Core](api/wappa-core.md)** - The main Wappa class and core functionality

🎯 **[Event Handlers](api/event-handlers.md)** - Your event handler class - the heart of your conversational app

💬 **[Messaging API](api/messaging.md)** - Send text, media, interactive messages, and templates

🔗 **[Webhooks API](api/webhooks.md)** - Understand webhook data structures and helper methods

💾 **[Cache API](api/cache.md)** - Memory, JSON file, and Redis caching for state management

⚡ **[CLI Reference](api/cli.md)** - Command-line tools for development and deployment

## How to Use This Reference

**Looking for something specific?** → Use the search bar (top of page) to find methods, classes, or concepts

**Building your first app?** → Start with [**Wappa Core**](api/wappa-core.md) to understand the main class

**Handling messages?** → Check [**Event Handlers**](api/event-handlers.md) for the methods you'll override

**Sending rich messages?** → Explore [**Messaging API**](api/messaging.md) for all message types

**Working with webhooks?** → Reference [**Webhooks API**](api/webhooks.md) for data structures

## Quick API Overview

Here's what Wappa's API looks like at a glance:

```python
from wappa import Wappa, WappaEventHandler

# Core application class
class MyApp(WappaEventHandler):
    # Handle incoming messages
    async def handle_message(self, message):
        # Access the messenger to send responses
        await self.messenger.send_text("Hello!", message.sender_phone)
        
        # Access cache for state management
        user_data = await self.cache.get(f"user:{message.sender_phone}")
        
        # Handle different message types
        if message.type == "text":
            await self.handle_text_message(message)
        elif message.type == "image":
            await self.handle_image_message(message)

# Main application setup
app = Wappa(
    whatsapp_token="your_token",
    whatsapp_phone_id="your_phone_id",
    whatsapp_business_id="your_business_id"
)

# Register your handler
app.register_handler(MyApp())
```

**That's the core pattern.** Everything else builds on these fundamentals.

## API Design Philosophy

Wappa's API follows these principles:

- **Async by default** - All I/O operations are async for better performance
- **Type hints everywhere** - Full TypeScript-style type safety in Python
- **Sensible defaults** - Common configurations work out of the box
- **Progressive disclosure** - Simple things are simple, complex things are possible
- **Built on FastAPI** - Leverages FastAPI's async performance and automatic OpenAPI docs

## Common Patterns

### Message Handling
```python
# Handle different message types
async def handle_message(self, message):
    match message.type:
        case "text":
            await self.handle_text(message)
        case "image":
            await self.handle_image(message)  
        case "interactive":
            await self.handle_button_click(message)
```

### State Management
```python
# Store and retrieve user state
user_state = await self.cache.get(f"user:{phone_number}")
await self.cache.set(f"user:{phone_number}", {"step": "waiting_for_name"})
```

### Sending Messages
```python
# Send different types of messages
await self.messenger.send_text("Hello!", phone_number)
await self.messenger.send_image(image_url, phone_number)
await self.messenger.send_interactive_buttons("Choose:", buttons, phone_number)
```

## Ready to Dive In?

**Just getting started?** → Begin with [**Wappa Core**](api/wappa-core.md) for the essential classes and methods

**Building complex flows?** → Check [**Event Handlers**](api/event-handlers.md) for advanced event handling patterns

**Want to send rich messages?** → Explore [**Messaging API**](api/messaging.md) for interactive buttons, lists, and media

**Need command-line tools?** → Reference [**CLI Reference**](api/cli.md) for development and deployment commands

---

*Complete, practical, and always up-to-date! 📖*