# Wappa - WhatsApp Business Framework

<div style="text-align: center; margin: 2rem 0;">
<img src="assets/wappa.gif" alt="Wappa Logo" style="max-width: 300px; height: auto;" />
</div>

## Build WhatsApp conversational applications in Python, fast

You have a working WhatsApp conversational app in **5 lines of code**. Yes, really.

```python
from wappa import Wappa, WappaEventHandler

class MasterEventHandler(WappaEventHandler):
    async def process_message(self, webhook):
        await self.messenger.send_text("Hello! 👋", webhook.user.user_id)

app = Wappa()
app.set_event_handler(MasterEventHandler())
```

**That's it.** Your conversational app responds to every message with a greeting.

**It's that simple. Let's learn more.**

## Why Wappa?

### **5-Second Setup, Not 5-Hour Configuration**

Most WhatsApp frameworks require hours of boilerplate. Wappa gives you a working conversational app immediately.

```python
# Other frameworks - 50+ lines of setup
# Authentication, webhook routing, message parsing...

# Wappa - Your business logic only
class MyApp(WappaEventHandler):
    async def process_message(self, webhook):
        # Just write what your app should do
        await self.messenger.send_text("Welcome!", webhook.user.user_id)
```

### **Smart Defaults, Easy Overrides**

Everything works out of the box, but you can customize anything.

=== "Default (Memory Cache)"

    ```python
    # Default: In-memory caching - perfect for development
    app = Wappa(cache="memory")
    app.set_event_handler(MyEventHandler())
    ```

=== "Redis Caching"

    ```python
    # Production: Redis caching (requires REDIS_URL in settings)
    app = Wappa(cache="redis")
    app.set_event_handler(MyEventHandler())
    
    # Automatic Redis plugin integration
    # Uses settings.redis_url from environment
    ```

=== "Enterprise Full Customization"

    ```python
    # Enterprise: Full customization with WappaBuilder
    from wappa.core.factory import WappaBuilder
    from wappa.core.plugins import RedisPlugin, CORSPlugin, RateLimitPlugin
    
    builder = WappaBuilder()
    builder.add_plugin(RedisPlugin())
    builder.add_plugin(CORSPlugin(allow_origins=["*"]))
    builder.add_plugin(RateLimitPlugin())
    app_instance = builder.build()
    
    # Or use Wappa with plugins and middleware
    app = Wappa(cache="redis")
    app.add_plugin(CORSPlugin(allow_origins=["*"]))
    app.add_middleware(SomeMiddleware, priority=30)
    app.add_startup_hook(my_startup_function, priority=50)
    app.set_event_handler(MyEventHandler())
    ```

### **All Message Types, Zero Complexity**

Send anything WhatsApp supports with simple method calls.

```python
from wappa.messaging.whatsapp.models.interactive_models import ReplyButton

# Text messages
await self.messenger.send_text("Hello!", user_id)

# Interactive buttons with proper schemas
buttons = [
    ReplyButton(id="yes", title="Yes"), 
    ReplyButton(id="no", title="No")
]
await self.messenger.send_button_message(
    buttons=buttons, 
    recipient=user_id, 
    body="Confirm order?"
)

# Media files
await self.messenger.send_image("/path/to/image.jpg", user_id, "Check this out!")

# Templates, lists, locations, contacts... it's all there
```

### **Production-Ready from Day One**

Built for scale, optimized for developer experience.

**Built-in features you'd spend weeks building:**

✅ Plugin-based architecture with WappaBuilder  
✅ Multiple cache backends (memory, JSON, Redis)  
✅ Event-driven webhook handling with dependency injection  
✅ Structured logging with context management  
✅ Built-in middleware support (CORS, auth, rate limiting)  
✅ Lifecycle management (startup/shutdown hooks)

---

## Installation (30 Seconds)

Install Wappa using `uv` (the fast Python package manager):

```bash
# Install Wappa
uv add wappa

# Create your first conversational app
uv run wappa init my-app
cd my-app

# Add your WhatsApp credentials to .env
echo "WP_ACCESS_TOKEN=your_token_here" >> .env
echo "WP_PHONE_ID=your_phone_id_here" >> .env
echo "WP_BID=your_business_id_here" >> .env
```

**Don't have WhatsApp credentials yet?** Follow our [WhatsApp Setup Guide](setup/whatsapp-setup.md) (5 minutes).

---

## Run Your Conversational App

=== "Development"

    ```bash
    # Start development server with auto-reload
    uv run wappa dev app/main.py

    # Your app is now running at http://localhost:8000
    # Any code changes automatically restart the server
    ```

=== "Production"

    ```bash
    # Using Wappa CLI (recommended for most cases)
    uv run wappa prod app/main.py --workers 4

    # Your production app is running with 4 workers
    # Optimized for performance and stability
    ```

=== "Production (uvicorn)"

    ```bash
    # Direct uvicorn control (advanced deployment)
    uv run uvicorn app.main:app.asgi \
        --host 0.0.0.0 \
        --port 8000 \
        --workers 4 \
        --access-log \
        --loop uvloop

    # Full control over uvicorn configuration
    # Best for Docker containers and advanced deployments
    ```

---

## Quick Examples

=== "Echo App (1 minute)"

    ```python
    # app/master_event.py
    from wappa import WappaEventHandler

    class EchoApp(WappaEventHandler):
        async def process_message(self, webhook):
            # Echo back whatever the user sent
            message_text = webhook.message.text.body
            await self.messenger.send_text(f"You said: {message_text}", webhook.user.user_id)
    ```

=== "Customer Service (5 minutes)"

    ```python
    from wappa.messaging.whatsapp.models.interactive_models import ReplyButton
    
    class CustomerServiceApp(WappaEventHandler):
        async def process_message(self, webhook):
            user_message = webhook.message.text.body.lower()
            user_id = webhook.user.user_id
            
            if "hours" in user_message:
                await self.messenger.send_text("We're open Mon-Fri 9AM-6PM", user_id)
            elif "support" in user_message:
                await self.messenger.send_text("Connecting you with support...", user_id)
            else:
                # Show interactive menu using proper Wappa schemas
                buttons = [
                    ReplyButton(id="hours", title="Store Hours"),
                    ReplyButton(id="support", title="Get Support"),
                    ReplyButton(id="location", title="Find Us")
                ]
                await self.messenger.send_button_message(
                    buttons=buttons,
                    recipient=user_id,
                    body="How can I help you today?"
                )
    ```

=== "Advanced: Order Processing with State"

    ```python
    class OrderApp(WappaEventHandler):
        async def process_message(self, webhook):
            user_id = webhook.user.user_id
            
            # Get user's current state (handled automatically by Wappa)
            user_state = await self.cache.get_user_state(user_id)
            
            if user_state.get("step") == "ordering":
                # User is in ordering flow
                product = webhook.message.text.body
                await self.cache.set_user_state(user_id, {"step": "confirm", "product": product})
                await self.messenger.send_text(f"Add {product} to cart?", user_id)
            else:
                # Start new conversation
                await self.cache.set_user_state(user_id, {"step": "ordering"})
                await self.messenger.send_text("What would you like to order?", user_id)
    ```

**Want more examples?** Browse our [6 complete example applications](resources/examples.md) from basic to production-ready.

---

## Convinced? Let's Build Something Real

Ready to create your first production conversational app? Our Quick Start guide walks you through building a complete customer service application in 5 minutes.

<a href="quickstart" class="md-button md-button--primary" style="
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
    text-decoration: none;
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    transition: all 0.3s ease;
    display: inline-block;
    margin: 1rem 0;
">🚀 Start Building →</a>

Or explore what's possible:

- **[Complete API Reference](api/wappa-core.md)** - Every method, explained with examples
- **[Example Applications](resources/examples.md)** - 6 real conversational apps you can learn from  
- **[Deployment Guide](deployment/railway.md)** - From code to production in 10 minutes
- **[Advanced Features](api/cache.md)** - Caching, state management, multi-tenant apps

---

**Ready to start?** Create your first conversational app now:

```bash
uv add wappa && uv run wappa init my-app
```

*Copy and paste this command to get started instantly! 🎯*

**Questions?** [Join our WhatsApp community](https://chat.whatsapp.com/GXXwfkP1ZoA6Ypjnb9mgiv) for help and discussions.