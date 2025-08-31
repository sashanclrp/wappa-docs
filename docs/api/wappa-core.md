# Wappa Class & Core API

*The main class you'll use. Here's everything it can do.*

---

## The 3 Methods You'll Actually Use

99% of the time, you only need these three methods:

```python
from wappa import Wappa

# 1. Create your app
app = Wappa(cache="memory")

# 2. Set your event handler  
app.set_event_handler(MyEventHandler())

# 3. Run your app
app.run()
```

That's it! Everything else is optional.

## Constructor Options

### Basic Usage
```python
# Simplest possible setup
app = Wappa()
```

### Constructor Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `cache` | `"memory"` \| `"json"` \| `"redis"` | `"memory"` | Cache backend for state management |
| `config` | `dict` \| `None` | `None` | FastAPI configuration overrides |

### Cache Type Examples

=== "Memory Cache (Default)"
    
    ```python
    # Fast, non-persistent (perfect for development)
    app = Wappa()  # Same as Wappa(cache="memory")
    ```
    
    **Use for**: Development, testing, simple conversational apps

=== "JSON Cache"
    
    ```python
    # File-based persistence (no setup required)
    app = Wappa(cache="json")
    ```
    
    **Use for**: Small-medium conversational apps, simple deployment

=== "Redis Cache"
    
    ```python
    # High-performance, scalable (requires Redis server)
    app = Wappa(cache="redis")
    # Requires REDIS_URL in .env file
    ```
    
    **Use for**: High-traffic conversational apps, production systems

### FastAPI Configuration Overrides

```python
# Custom FastAPI settings
app = Wappa(
    cache="redis",
    config={
        "title": "My Customer Service Bot",
        "version": "2.0.0", 
        "description": "AI-powered customer support",
        "docs_url": "/api-docs"  # Custom docs path
    }
)
```

## Core Methods

### Essential Methods

#### `set_event_handler(handler)`

Set your event handler - this is where your conversational app logic lives.

```python
from wappa import Wappa, WappaEventHandler

class MyBot(WappaEventHandler):
    async def handle_message(self, message):
        await self.messenger.send_text("Hello!", message.sender_phone)

app = Wappa()
app.set_event_handler(MyBot())  # Your conversational app logic
```

**Parameters**:
- `handler` (`WappaEventHandler`): Your event handler instance

#### `run(host, port, **kwargs)`

Start your conversational app server.

```python
# Simple start
app.run()

# Custom host/port
app.run(host="127.0.0.1", port=3000)

# With uvicorn options
app.run(workers=4, log_level="warning")
```

**Parameters**:
- `host` (`str`): Host to bind to (default: `"0.0.0.0"`)
- `port` (`int`): Port to bind to (default: from `PORT` env var or `8000`)
- `**kwargs`: Additional uvicorn configuration

**Automatic behavior**:
- Development mode: Uses auto-reload
- Production mode: Optimized for performance

#### `create_app()`

Get the FastAPI app instance (useful for custom deployment).

```python
app = Wappa(cache="redis")
app.set_event_handler(MyBot())

# Get FastAPI app for custom deployment
fastapi_app = app.create_app()

# Deploy with gunicorn, hypercorn, etc.
```

**Returns**: `FastAPI` application instance

### Extension Methods

These methods let you customize your Wappa application:

#### `add_plugin(plugin)`

Add functionality through plugins.

```python
from wappa import Wappa
from wappa.plugins import DatabasePlugin, CorsPlugin

app = Wappa(cache="redis")
app.add_plugin(DatabasePlugin("postgresql://..."))
app.add_plugin(CorsPlugin(allow_origins=["*"]))
app.set_event_handler(MyBot())
app.run()
```

**Parameters**:
- `plugin` (`WappaPlugin`): Plugin instance to add

**Returns**: `Wappa` (for method chaining)

#### `add_middleware(middleware_class, priority, **kwargs)`

Add FastAPI middleware with priority control.

```python
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

app = Wappa()
app.add_middleware(CORSMiddleware, priority=30, allow_origins=["*"])
app.add_middleware(GZipMiddleware, priority=40, minimum_size=1000)
```

**Parameters**:
- `middleware_class` (`type`): Middleware class to add
- `priority` (`int`): Execution priority (lower = outer, higher = inner)
- `**kwargs`: Middleware configuration

#### `add_router(router, **kwargs)`

Add custom API routes.

```python
from fastapi import APIRouter

custom_router = APIRouter()

@custom_router.get("/custom")
async def custom_endpoint():
    return {"message": "Custom API endpoint"}

app = Wappa()
app.add_router(custom_router, prefix="/api/v1", tags=["custom"])
```

**Parameters**:
- `router` (`APIRouter`): FastAPI router to include
- `**kwargs`: Arguments for `app.include_router()`

#### `configure(**overrides)`

Override FastAPI application settings.

```python
app = Wappa()
app.configure(
    title="My WhatsApp Bot",
    version="1.0.0",
    description="Custom conversational app description",
    openapi_url="/openapi.json"  # Custom OpenAPI path
)
```

**Parameters**:
- `**overrides`: FastAPI constructor arguments to override

### Lifecycle Methods

#### `add_startup_hook(hook, priority)`

Add functions to run when your app starts.

```python
async def my_startup(app):
    print("Bot is starting up!")
    # Initialize external services, warm up caches, etc.

app = Wappa()
app.add_startup_hook(my_startup, priority=50)
```

**Parameters**:
- `hook` (`Callable`): Async function that takes `(app: FastAPI) -> None`
- `priority` (`int`): Execution priority (lower numbers run first)

#### `add_shutdown_hook(hook, priority)`

Add functions to run when your app shuts down.

```python
async def my_shutdown(app):
    print("Bot is shutting down!")
    # Close connections, save state, cleanup, etc.

app = Wappa()
app.add_shutdown_hook(my_shutdown, priority=50)
```

**Parameters**:
- `hook` (`Callable`): Async function that takes `(app: FastAPI) -> None`  
- `priority` (`int`): Execution priority (higher numbers run first in shutdown)

## Method Chaining

All extension methods support chaining for clean setup:

```python
app = (Wappa(cache="redis")
       .add_middleware(CORSMiddleware, allow_origins=["*"])
       .add_startup_hook(my_startup)
       .configure(title="My Bot"))

app.set_event_handler(MyBot())
app.run()
```

## Properties

### `asgi`

Get the ASGI application instance (useful for deployment).

```python
app = Wappa()
app.set_event_handler(MyBot())

# Get ASGI app for deployment
asgi_app = app.asgi

# Deploy with uvicorn programmatically
import uvicorn
uvicorn.run(asgi_app, host="0.0.0.0", port=8000)
```

**Returns**: `FastAPI` ASGI application

## Real-World Usage Examples

### Simple Echo Bot
```python
from wappa import Wappa, WappaEventHandler

class EchoBot(WappaEventHandler):
    async def handle_message(self, message):
        text = message.get_text()
        await self.messenger.send_text(f"Echo: {text}", message.sender_phone)

# Minimal setup
app = Wappa()
app.set_event_handler(EchoBot())
app.run()
```

### Production Customer Service Bot
```python
from wappa import Wappa
from my_handlers import CustomerServiceHandler
from my_plugins import DatabasePlugin, AnalyticsPlugin

# Production setup with plugins
app = (Wappa(cache="redis")
       .add_plugin(DatabasePlugin("postgresql://..."))
       .add_plugin(AnalyticsPlugin(api_key="..."))
       .configure(
           title="Customer Service Bot",
           version="2.1.0"
       ))

app.set_event_handler(CustomerServiceHandler())
app.run(port=8080)
```

### Custom Deployment
```python
from wappa import Wappa
import uvicorn

# Create app but don't run it
app = Wappa(cache="json")
app.set_event_handler(MyBot())

# Custom uvicorn deployment
uvicorn.run(
    app.asgi,
    host="0.0.0.0",
    port=8000,
    workers=4,
    access_log=False
)
```

## Advanced Usage with WappaBuilder

For complex applications, use `WappaBuilder` directly:

```python
from wappa import WappaBuilder, WappaEventHandler
from wappa.plugins import DatabasePlugin, RedisPlugin

class AdvancedBot(WappaEventHandler):
    async def handle_message(self, message):
        # Your advanced conversational app logic
        pass

# Advanced builder pattern
app = await (WappaBuilder()
             .with_whatsapp(
                 token="your_token",
                 phone_id="your_phone_id", 
                 business_id="your_business_id"
             )
             .with_redis_cache("redis://localhost:6379")
             .with_database("postgresql://...", adapter=PostgreSQLAdapter())
             .with_cors_enabled()
             .with_rate_limiting(requests_per_minute=100)
             .add_custom_middleware(MyMiddleware, priority=40)
             .build())

# Set handler and run normally  
app.set_event_handler(AdvancedBot())
app.run()
```

**For detailed WappaBuilder usage**: See [Cache API](cache.md) guide for advanced patterns.

## Error Handling

The Wappa class provides helpful error messages:

```python
# Missing WhatsApp credentials
app = Wappa()
# ❌ ValueError: WP_ACCESS_TOKEN is required

# Invalid cache type
app = Wappa(cache="invalid")
# ❌ ValueError: Unsupported cache type: invalid. Supported types: memory, redis, json

# Missing event handler
app = Wappa()
app.run()
# ❌ ValueError: Must set event handler with set_event_handler() before running
```

## Performance Notes

### Cache Performance Impact

| Cache Type | Startup Time | Memory Usage | Message Latency |
|------------|--------------|--------------|-----------------|
| **Memory** | ~50ms | Low | ~1ms |
| **JSON** | ~100ms | Low | ~10-50ms |
| **Redis** | ~200ms | Medium | ~2-5ms |

### Production Optimizations

```python
# Development (default)
app = Wappa()  # Memory cache, auto-reload, debug logs

# Production optimized
app = Wappa(cache="redis")  # Persistent cache, no auto-reload
# Set ENVIRONMENT=PROD in .env for additional optimizations
```

## API Reference Summary

### Constructor
```python
Wappa(cache="memory", config=None)
```

### Essential Methods (99% of usage)
```python
app.set_event_handler(handler)  # Set your conversational app logic
app.run(host="0.0.0.0", port=8000)  # Start the server
app.create_app()  # Get FastAPI instance
```

### Extension Methods (when you need more)
```python
app.add_plugin(plugin)  # Add functionality
app.add_middleware(middleware_class, priority=50, **kwargs)  # Add middleware
app.add_router(router, **kwargs)  # Add custom routes
app.configure(**overrides)  # FastAPI settings
app.add_startup_hook(hook, priority=50)  # Startup tasks
app.add_shutdown_hook(hook, priority=50)  # Cleanup tasks
```

### Properties
```python
app.asgi  # FastAPI ASGI application for deployment
```

**Remember**: Start with the 3 essential methods, add complexity only when you need it. The Wappa class grows with your application! 🚀