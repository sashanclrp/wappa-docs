# Configuration & Settings

*Environment variables, settings, and making your conversational app configurable*

**Most conversational applications only need 4 environment variables.** We'll start there, then show you when and how to add more sophisticated configuration.

---

## The Essential Four Variables

Every Wappa conversational app needs these WhatsApp credentials in your `.env` file:

```bash title=".env"
# The 4 essential variables
WP_ACCESS_TOKEN=your_whatsapp_access_token_here
WP_PHONE_ID=your_whatsapp_phone_id_here
WP_BID=your_whatsapp_business_id_here
WP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token_here
```

**That's it.** Your app will work with just these four variables.

---

## Minimal vs Full Configuration

=== "Minimal Setup (4 variables)"

    **Perfect for**: Getting started, simple conversational apps, proof of concepts
    
    ```bash title=".env"
    # WhatsApp credentials (required)
    WP_ACCESS_TOKEN=EAAxxxx...
    WP_PHONE_ID=1234567890123456
    WP_BID=9876543210987654
    WP_WEBHOOK_VERIFY_TOKEN=myapp_2025_verify
    ```
    
    ```python title="app/main.py"
    from wappa import Wappa
    from wappa.core.config import settings
    
    # Simple app - automatically uses your .env variables
    app = Wappa()
    
    # Settings available anywhere in your app
    print(f"Running on port: {settings.port}")  # Default: 8000
    print(f"WhatsApp Phone: {settings.wp_phone_id}")
    ```
    
    **Automatic defaults you get:**
    - Port: `8000` 
    - Memory cache: Built-in
    - Log level: `INFO`
    - Environment: `DEV`

=== "Production Setup (optimized)"

    **Perfect for**: Production apps, high volume, team environments
    
    ```bash title=".env"
    # WhatsApp credentials (required)
    WP_ACCESS_TOKEN=EAAxxxx...
    WP_PHONE_ID=1234567890123456  
    WP_BID=9876543210987654
    WP_WEBHOOK_VERIFY_TOKEN=prod_secure_token_2025
    
    # Production optimizations
    ENVIRONMENT=PROD
    PORT=8080
    LOG_LEVEL=WARNING
    
    # Redis for state management
    REDIS_URL=redis://localhost:6379
    REDIS_MAX_CONNECTIONS=128
    
    # External services
    OPENAI_API_KEY=sk-xxx...  # For AI features
    ```
    
    ```python title="app/main.py"
    from wappa import WappaBuilder
    from wappa.core.config import settings
    
    # Production app with optimizations
    app = (WappaBuilder()
           .with_whatsapp_from_env()  # Uses environment variables
           .with_redis_cache()        # Production state management
           .with_cors_enabled()       # API access
           .with_rate_limiting()      # Protect against abuse
           .build())
    
    # All your custom settings available
    if settings.is_production:
        print("🚀 Production mode active")
    ```

=== "Custom Configuration (advanced)"

    **Perfect for**: Custom integrations, multi-environment, complex apps
    
    ```bash title=".env"
    # Core WhatsApp 
    WP_ACCESS_TOKEN=EAAxxxx...
    WP_PHONE_ID=1234567890123456
    WP_BID=9876543210987654
    
    # Custom business logic
    STRIPE_API_KEY=sk_live_xxx...
    DATABASE_URL=postgresql://...
    SMTP_SERVER=smtp.gmail.com
    MAX_CART_ITEMS=10
    NOTIFICATION_WEBHOOK=https://hooks.slack.com/...
    
    # Advanced framework
    LOG_DIR=/var/log/wappa
    TIME_ZONE=America/New_York
    API_VERSION=v21.0
    ```
    
    See [Extending Settings](#extending-settings) below for adding custom variables.

---

## Development vs Production

What changes when you go from development to production?

### Development (Default)
```bash title=".env"
# Minimal development setup
WP_ACCESS_TOKEN=your_temp_token
WP_PHONE_ID=test_phone_id  
WP_BID=test_business_id
WP_WEBHOOK_VERIFY_TOKEN=dev_verify_token_2025
ENVIRONMENT=DEV  # Optional, this is the default
```

**Development gives you:**

- ✅ **Memory cache** - data resets when app restarts (perfect for testing)
- ✅ **INFO logging** - see everything happening
- ✅ **Auto-reload** - code changes restart the app
- ✅ **Detailed errors** - full error messages for debugging

### Production
```bash title=".env"
# Production-optimized setup
WP_ACCESS_TOKEN=your_production_token
WP_PHONE_ID=your_real_phone_id
WP_BID=your_real_business_id
WP_WEBHOOK_VERIFY_TOKEN=prod_secure_verify_token_2025
ENVIRONMENT=PROD

# Production optimizations
REDIS_URL=redis://production-server:6379
LOG_LEVEL=WARNING
PORT=8080
```

**Production gives you:**

- ✅ **Redis cache** - persistent state across restarts and multiple instances
- ✅ **WARNING logging** - only important events logged
- ✅ **Error resilience** - graceful error handling
- ✅ **Performance optimized** - faster response times

### Quick Production Checklist

| Setting | Development | Production | Why? |
|---------|------------|------------|------|
| `ENVIRONMENT` | `DEV` | `PROD` | Controls logging, error handling |
| Cache | Memory | Redis | Persistent state, multiple instances |
| `LOG_LEVEL` | `INFO` | `WARNING` | Performance, log volume |
| `WP_WEBHOOK_VERIFY_TOKEN` | Simple | Complex | Security requirement |

---

## Security Best Practices

### Environment Variables Security

!!! warning "Never Commit Secrets"
    
    **Always use `.env` files for credentials.** Never put secrets directly in code:
    
    ```python
    # ❌ NEVER do this
    app = Wappa(
        whatsapp_token="EAAxxxxxx",  # Exposed in code!
        phone_id="1234567890"        # Visible to everyone!
    )
    
    # ✅ Always do this  
    app = Wappa()  # Reads from .env automatically
    ```

### Token Security Levels

=== "Development (Simple)"

    ```bash
    # Simple tokens for development
    WP_WEBHOOK_VERIFY_TOKEN=myapp2025
    OPENAI_API_KEY=sk-dev-xxx...
    ```
    
    **Good for**: Local development, testing

=== "Production (Secure)"

    ```bash
    # Complex tokens for production
    WP_WEBHOOK_VERIFY_TOKEN=wappa_prod_webhook_verify_2025_secure_token_v1
    OPENAI_API_KEY=sk-prod-xxx...
    ```
    
    **Required for**: Production deployment, team environments

### File Security

```bash
# Add to .gitignore (automatically included in wappa init)
.env
.env.local
.env.production
*.log
logs/
```

**Key principle**: If it's secret, it goes in `.env`. If it's not secret, it can be in code.

---

## Extending Settings

Need custom environment variables? Here's how to add them to Wappa's settings system:

### Step 1: Extend the Settings Class

Create your own settings class that extends Wappa's settings:

```python title="app/config/custom_settings.py"
import os
from wappa.core.config.settings import Settings as WappaSettings

class CustomSettings(WappaSettings):
    """Extended settings with your custom environment variables."""
    
    def __init__(self):
        # Initialize parent settings first
        super().__init__()
        
        # Add your custom variables
        self.stripe_api_key: str | None = os.getenv("STRIPE_API_KEY")
        self.max_cart_items: int = int(os.getenv("MAX_CART_ITEMS", "10"))
        self.notification_webhook: str | None = os.getenv("NOTIFICATION_WEBHOOK")
        self.smtp_server: str = os.getenv("SMTP_SERVER", "localhost")
        self.database_url: str | None = os.getenv("DATABASE_URL")
        
        # Validate your custom settings
        self._validate_custom_settings()
    
    def _validate_custom_settings(self):
        """Validate your custom environment variables."""
        if self.is_production and not self.stripe_api_key:
            raise ValueError("STRIPE_API_KEY required in production")
        
        if self.max_cart_items < 1 or self.max_cart_items > 50:
            raise ValueError("MAX_CART_ITEMS must be between 1 and 50")

# Create your custom settings instance
settings = CustomSettings()
```

### Step 2: Use Your Extended Settings

```python title="app/main.py"
from wappa import Wappa
from .config.custom_settings import settings  # Your extended settings

app = Wappa()

# Access both Wappa and custom settings
print(f"WhatsApp Phone: {settings.wp_phone_id}")      # From Wappa
print(f"Max Cart Items: {settings.max_cart_items}")   # Your custom setting
print(f"Stripe Key Set: {bool(settings.stripe_api_key)}")  # Your custom setting
```

### Step 3: Environment Variables

```bash title=".env"
# Standard Wappa variables
WP_ACCESS_TOKEN=xxx
WP_PHONE_ID=xxx
WP_BID=xxx

# Your custom variables
STRIPE_API_KEY=sk_live_xxx...
MAX_CART_ITEMS=25
NOTIFICATION_WEBHOOK=https://hooks.slack.com/services/xxx
SMTP_SERVER=smtp.gmail.com
DATABASE_URL=postgresql://user:pass@localhost/myapp
```

### Step 4: Use in Event Handlers

```python title="app/master_event.py"
from wappa import WappaEventHandler
from .config.custom_settings import settings

class MyApp(WappaEventHandler):
    async def process_message(self, webhook):
        user_id = webhook.user.user_id
        message = webhook.get_message_text()
        
        # Use your custom settings
        if "cart" in message and len(user_cart) >= settings.max_cart_items:
            await self.messenger.send_text(
                f"Cart full! Maximum {settings.max_cart_items} items allowed.",
                user_id
            )
        
        # Access Wappa settings too
        self.logger.info(f"App version: {settings.version}")
```

### Advanced Settings Patterns

```python title="app/config/custom_settings.py"
class AdvancedSettings(WappaSettings):
    def __init__(self):
        super().__init__()
        
        # Environment-specific settings
        self.debug_mode: bool = os.getenv("DEBUG", "false").lower() == "true"
        self.enable_analytics: bool = os.getenv("ENABLE_ANALYTICS", "true").lower() == "true"
        
        # Computed properties
        self.database_pool_size: int = (
            int(os.getenv("DB_POOL_SIZE", "20")) if self.is_production 
            else int(os.getenv("DB_POOL_SIZE", "5"))
        )
        
        # Feature flags
        self.enable_ai_responses: bool = bool(self.openai_api_key)
        self.enable_payments: bool = bool(os.getenv("STRIPE_API_KEY"))
    
    @property
    def is_debug_enabled(self) -> bool:
        """Check if debug mode is enabled (only in development)."""
        return self.is_development and self.debug_mode
    
    def get_database_config(self) -> dict:
        """Get database configuration based on environment."""
        if not self.database_url:
            return {"type": "none"}
        
        return {
            "url": self.database_url,
            "pool_size": self.database_pool_size,
            "ssl_required": self.is_production
        }
```

---

## Configuration Examples

### Simple Conversational App
```bash title=".env"
# Just the essentials
WP_ACCESS_TOKEN=EAAxxxx
WP_PHONE_ID=1234567890
WP_BID=9876543210
WP_WEBHOOK_VERIFY_TOKEN=myapp_verify_2025
```

### E-commerce Conversational App
```bash title=".env"
# WhatsApp + payments
WP_ACCESS_TOKEN=EAAxxxx
WP_PHONE_ID=1234567890
WP_BID=9876543210
STRIPE_API_KEY=sk_live_xxx
MAX_CART_ITEMS=25
REDIS_URL=redis://localhost:6379
```

### AI-Powered Customer Service
```bash title=".env"
# WhatsApp + AI
WP_ACCESS_TOKEN=EAAxxxx
WP_PHONE_ID=1234567890
WP_BID=9876543210
OPENAI_API_KEY=sk-xxx
REDIS_URL=redis://localhost:6379
LOG_LEVEL=INFO
```

### Multi-Environment Setup
```bash title=".env.development"
ENVIRONMENT=DEV
WP_ACCESS_TOKEN=temp_dev_token
WP_PHONE_ID=test_phone_id
LOG_LEVEL=DEBUG
```

```bash title=".env.production"
ENVIRONMENT=PROD
WP_ACCESS_TOKEN=prod_token
WP_PHONE_ID=real_phone_id
LOG_LEVEL=WARNING
REDIS_URL=redis://prod-server:6379
```

---

## Environment Detection

Wappa automatically detects your environment and adjusts behavior:

```python
from wappa.core.config import settings

# Environment checks
if settings.is_development:
    print("🛠️ Development mode - detailed logging enabled")
    
if settings.is_production:
    print("🚀 Production mode - optimized for performance")

# Feature availability
if settings.has_redis:
    print("📊 Redis cache available")
else:
    print("💾 Using memory cache")

# Version info
print(f"Wappa version: {settings.version}")
```

### Environment-Specific Behavior

| Feature | Development | Production |
|---------|-------------|------------|
| **Cache** | Memory (resets on restart) | Redis (persistent) |
| **Logging** | `INFO` (verbose) | `WARNING` (essential only) |
| **Errors** | Full details shown | User-friendly messages |
| **Performance** | Debug-friendly | Optimized |
| **Validation** | Relaxed | Strict |

---

## Built-in Settings Reference

### WhatsApp Configuration
```python
settings.wp_access_token    # Your WhatsApp access token
settings.wp_phone_id        # Your WhatsApp phone number ID  
settings.wp_bid             # Your WhatsApp business account ID
settings.whatsapp_webhook_verify_token  # Webhook security token
```

### Server Configuration  
```python
settings.port               # Server port (default: 8000)
settings.log_level          # Logging level (INFO, WARNING, ERROR)
settings.environment        # DEV or PROD
settings.time_zone          # Timezone (default: UTC)
```

### Optional Integrations
```python
settings.openai_api_key     # OpenAI API key (for AI features)
settings.redis_url          # Redis connection URL
settings.redis_max_connections  # Redis connection pool size
```

### Computed Properties
```python
settings.is_development     # True if ENVIRONMENT=DEV
settings.is_production      # True if ENVIRONMENT=PROD  
settings.has_redis          # True if REDIS_URL is set
settings.owner_id           # Same as wp_phone_id
settings.version            # Wappa framework version
```

---

## Advanced Configuration Patterns

### Dynamic Settings Based on Environment

```python title="app/config/dynamic_settings.py"
import os
from wappa.core.config.settings import Settings as WappaSettings

class DynamicSettings(WappaSettings):
    def __init__(self):
        super().__init__()
        
        # Database configuration changes by environment
        if self.is_production:
            self.database_url = os.getenv("DATABASE_URL")  # Required in prod
            self.cache_ttl = 3600  # 1 hour cache
            self.rate_limit = 100  # Higher limits
        else:
            self.database_url = os.getenv("DATABASE_URL", "sqlite:///dev.db")  # SQLite for dev
            self.cache_ttl = 300   # 5 minute cache
            self.rate_limit = 10   # Lower limits for testing
        
        # Feature flags
        self.enable_webhook_logging = os.getenv("WEBHOOK_LOGGING", "true").lower() == "true"
        self.enable_message_encryption = self.is_production  # Only in production
        
    def get_webhook_config(self) -> dict:
        """Get webhook-specific configuration."""
        return {
            "verify_token": self.whatsapp_webhook_verify_token,
            "logging_enabled": self.enable_webhook_logging,
            "rate_limit": self.rate_limit
        }
```

### Settings Validation

```python title="app/config/validated_settings.py"  
from wappa.core.config.settings import Settings as WappaSettings

class ValidatedSettings(WappaSettings):
    def __init__(self):
        super().__init__()
        
        # Your custom variables with validation
        self.max_file_size = self._get_file_size("MAX_FILE_SIZE", "10MB")
        self.allowed_domains = self._get_list("ALLOWED_DOMAINS", ["localhost", "myapp.com"])
        self.admin_users = self._get_list("ADMIN_USERS", [])
        
    def _get_file_size(self, env_var: str, default: str) -> int:
        """Parse file size from environment variable."""
        size_str = os.getenv(env_var, default)
        if size_str.endswith("MB"):
            return int(size_str[:-2]) * 1024 * 1024
        elif size_str.endswith("KB"):
            return int(size_str[:-2]) * 1024
        return int(size_str)
    
    def _get_list(self, env_var: str, default: list) -> list:
        """Parse comma-separated list from environment variable."""
        value = os.getenv(env_var)
        if not value:
            return default
        return [item.strip() for item in value.split(",")]
```

---

## Configuration Best Practices

### Naming Conventions
```bash
# ✅ Good naming
WP_ACCESS_TOKEN=xxx         # Clear prefix
STRIPE_API_KEY=xxx          # Service + purpose
MAX_CART_ITEMS=10           # Descriptive
ENABLE_ANALYTICS=true       # Boolean flags

# ❌ Avoid these
TOKEN=xxx                   # Too vague
KEY=xxx                     # Which key?
MAX=10                      # Max what?
```

### Default Values Strategy
```python
# ✅ Good defaults
self.cache_ttl = int(os.getenv("CACHE_TTL", "3600"))      # 1 hour default
self.max_retries = int(os.getenv("MAX_RETRIES", "3"))     # Reasonable default
self.debug = os.getenv("DEBUG", "false").lower() == "true"  # Safe default

# ❌ No defaults for secrets
self.api_key = os.getenv("API_KEY")  # None if not set - good!
```

### Multi-Environment Management

```bash
# Use different .env files per environment
.env.development    # Local development
.env.staging        # Staging server  
.env.production     # Production server

# Load with: python-dotenv
# load_dotenv(f".env.{environment}")
```

---

## Troubleshooting Configuration

### Common Issues

| Error | Cause | Solution |
|-------|-------|----------|
| `WP_ACCESS_TOKEN is required` | Missing WhatsApp credentials | Add to `.env` file |
| `Redis connection failed` | Invalid `REDIS_URL` | Check Redis server or use memory cache |
| `Settings validation failed` | Invalid environment variable | Check variable format and values |

### Debug Your Configuration
```python
from wappa.core.config import settings

# Print all settings (safe for development)
if settings.is_development:
    print("📋 Current Configuration:")
    print(f"  Environment: {settings.environment}")
    print(f"  Port: {settings.port}")
    print(f"  Redis: {'✅' if settings.has_redis else '❌'}")
    print(f"  OpenAI: {'✅' if settings.openai_api_key else '❌'}")
```

### Validation Checks
```python
# Add to your app startup
def validate_configuration():
    """Validate your app's configuration on startup."""
    errors = []
    
    # Check required custom settings
    if settings.is_production and not getattr(settings, 'database_url', None):
        errors.append("DATABASE_URL required in production")
    
    if getattr(settings, 'max_cart_items', 0) > 100:
        errors.append("MAX_CART_ITEMS too high (max: 100)")
    
    if errors:
        raise ValueError(f"Configuration errors: {', '.join(errors)}")
    
    print("✅ Configuration validation passed")

# Call during app startup
validate_configuration()
```

---

## Next Steps

Ready to learn more about Wappa configuration?

- **[Environment Setup](../setup/whatsapp-setup.md)** - Complete WhatsApp credential setup
- **[Production Deployment](../deployment/railway.md)** - Deploy with proper configuration
- **[State Management](state-management.md)** - Advanced caching and persistence
- **[Production Checklist](../deployment/production-checklist.md)** - Production security checklist

**Need examples?** All [example applications](../resources/examples.md) show different configuration patterns from minimal to advanced.