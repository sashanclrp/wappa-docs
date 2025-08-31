# Installation & Environment Setup

Everything you need to install Wappa and set up your development environment. We'll get you from zero to working conversational app in minutes, not hours.

**Skip the details?** Go straight to [Quick Start](quickstart.md) for the fastest path to a working app.

---

## Installation Methods

Wappa supports multiple installation methods. We recommend **uv** for the best experience.

=== "uv (Recommended)"

    ```bash
    # Install Wappa using uv (fast and modern)
    uv add wappa
    
    # Create your first project
    uv run wappa init my-app
    cd my-app
    
    # Install dependencies and start developing
    uv sync
    ```
    
    **Why uv?** It's blazingly fast, handles Python versions automatically, and has excellent dependency resolution.

=== "pip (Traditional)"

    ```bash
    # Create virtual environment (recommended)
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    
    # Install Wappa
    pip install wappa
    
    # Create your first project
    wappa init my-app
    cd my-app
    ```

=== "Poetry (Alternative)"

    ```bash
    # Initialize new project with Poetry
    poetry new my-app
    cd my-app
    
    # Add Wappa as dependency
    poetry add wappa
    
    # Initialize Wappa project structure
    poetry run wappa init .
    ```

### Installing uv

New to uv? It's the modern Python package manager that's faster and more reliable than pip.

=== "Linux & macOS"

    ```bash
    # Install uv using the official installer
    curl -LsSf https://astral.sh/uv/install.sh | sh
    
    # Or using pip if you prefer
    pip install uv
    ```

=== "Windows"

    ```bash
    # Install using PowerShell
    powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
    
    # Or using pip
    pip install uv
    ```

**Learn more about uv:** Visit [uv.astral.sh](https://uv.astral.sh) for complete documentation and advanced features.

!!! tip "Throughout this documentation"
    We use `uv` in all examples because it's faster, more reliable, and handles dependency conflicts better than traditional tools. All commands work with pip/poetry by replacing `uv run` with the appropriate command.

---

## WhatsApp Business API Setup

To send and receive WhatsApp messages, you need credentials from Meta's WhatsApp Business Platform.

### Quick Summary

1. **Go to** [Meta for Developers](https://developers.facebook.com/)
2. **Create** a new app → "Other" → "Business"  
3. **Add** "WhatsApp Business Platform" product
4. **Copy** 3 credentials from the "Getting Started" tab:
   - Access Token (`WP_ACCESS_TOKEN`)
   - Phone Number ID (`WP_PHONE_ID`) 
   - Business Account ID (`WP_BID`)
5. **Create** your own webhook verify token (`WP_WEBHOOK_VERIFY_TOKEN`)

### Test vs Production

**For Development:** Use the temporary test credentials (valid for 24 hours) - perfect for getting started.

**For Production:** You'll need to verify your business and get permanent credentials. This involves business verification and can take a few days.

**Need detailed setup with screenshots?** Follow our complete [WhatsApp Business API Setup Guide](setup/whatsapp-setup.md).

---

## Environment Variables

Wappa uses environment variables to keep your credentials secure and configuration flexible.

### Required Variables

Create a `.env` file in your project root with these **required** credentials:

```bash title=".env"
# WhatsApp Business API Credentials (Required)
WP_ACCESS_TOKEN=your_access_token_here
WP_PHONE_ID=your_phone_number_id_here  
WP_BID=your_business_account_id_here
WP_WEBHOOK_VERIFY_TOKEN=your_custom_webhook_token
```

### Complete Configuration

Here's the full `.env` template with all available options:

```bash title=".env - Complete Configuration"
# ================================================================
# WAPPA WHATSAPP FRAMEWORK CONFIGURATION
# ================================================================

# General Configuration
PORT=8000
TIME_ZONE=America/Bogota

# DEBUG or INFO or WARNING or ERROR or CRITICAL
LOG_LEVEL=DEBUG
LOG_DIR=./logs
## Environment DEV or PROD
ENVIRONMENT=DEV  

# WhatsApp Graph API
BASE_URL=https://graph.facebook.com/
API_VERSION=v23.0

# WhatsApp Business API Credentials
WP_ACCESS_TOKEN=
WP_PHONE_ID=
WP_BID=

# Webhook Configuration
WHATSAPP_WEBHOOK_VERIFY_TOKEN=

# Redis Configuration (Optional - uncomment to enable Redis persistence)
REDIS_URL=redis://localhost:6379/
REDIS_MAX_CONNECTIONS=64

# Optional: AI Tools
# OPENAI_API_KEY=
```

### Environment Variable Explanations

| Variable | Description | Example |
|----------|-------------|---------|
| `WP_ACCESS_TOKEN` | **Required.** WhatsApp API access token from Meta | `EAAx...` (long string) |
| `WP_PHONE_ID` | **Required.** Your WhatsApp Business phone number ID | `123456789012345` |
| `WP_BID` | **Required.** Your WhatsApp Business Account ID | `987654321098765` |
| `WP_WEBHOOK_VERIFY_TOKEN` | **Required.** Custom token you create for webhook security | `mySecureToken123` |
| `PORT` | Server port (default: 8000) | `8000`, `3000`, `80` |
| `LOG_LEVEL` | Logging detail level | `DEBUG`, `INFO`, `WARNING` |
| `ENVIRONMENT` | Runtime environment | `DEV`, `PROD` |
| `REDIS_URL` | Redis connection string (optional) | `redis://localhost:6379/` |

### Security Best Practices

- ✅ **Never commit `.env` files** to version control
- ✅ **Use different `.env` files** for development/staging/production
- ✅ **Create strong webhook verify tokens** (mix of letters, numbers, symbols)
- ✅ **Regenerate tokens regularly** in production
- ❌ **Don't hardcode credentials** in your source code

```bash
# Add .env to your .gitignore file
echo ".env" >> .gitignore
```

---

## Project Structure

When you run `wappa init`, you get this clean project structure:

```
my-app/
├── app/
│   ├── __init__.py
│   ├── main.py             # Wappa app instance
│   ├── master_event.py     # Your event handler
|   └──scores/              # Your business logic goes here
├── .env                    # Environment variables (keep secret!)
├── .gitignore              # Git ignore file
├── pyproject.toml          # Project dependencies (uv/pip)
└── README.md               # Project documentation
```

**Key Files:**

- **`app/main.py`** - Your Wappa application entry point
- **`app/master_event.py`** - Where you handle WhatsApp messages
- **`.env`** - Your credentials and configuration
- **`scores/`** - Empty directory for your custom business logic

---

## Development vs Production

Choose the right command for your environment. Wappa automatically detects your environment using the `ENVIRONMENT` variable in your `.env` file.

=== "wappa dev (Development)"

    ```bash
    # Development server with auto-reload
    uv run wappa dev app/main.py
    
    # With custom port
    uv run wappa dev app/main.py --port 3000
    
    # Features enabled in development:
    # ✅ Auto-reload on code changes
    # ✅ Detailed debug logging
    # ✅ API documentation at /docs
    # ✅ Interactive API explorer
    # ✅ Better error messages
    ```
    
    Perfect for local development and testing. Changes to your code automatically restart the server.

=== "wappa prod (Production)"

    ```bash
    # Production server (optimized for performance)
    uv run wappa prod app/main.py --workers 4
    
    # With custom configuration
    uv run wappa prod app/main.py --workers 2 --port 8080
    
    # Features in production:
    # ✅ Multiple worker processes
    # ✅ Optimized for performance  
    # ✅ Reduced logging overhead
    # ✅ Better memory management
    # ❌ No auto-reload (for stability)
    ```
    
    Optimized for production deployment with multiple workers and better performance.

=== "uvicorn (Advanced)"

    ```bash
    # Direct uvicorn control (advanced deployment)
    uv run uvicorn app.main:app.asgi \
        --host 0.0.0.0 \
        --port 8000 \
        --workers 4 \
        --access-log \
        --loop uvloop
    
    # For Docker deployments
    uv run uvicorn app.main:app.asgi \
        --host 0.0.0.0 \
        --port $PORT \
        --workers $WEB_CONCURRENCY \
        --worker-class uvicorn.workers.UvicornWorker
    ```
    
    Full control over uvicorn configuration. Best for Docker containers and advanced deployments where you need specific uvicorn settings.

---

## Troubleshooting Installation Issues

### Command Not Found: `wappa`

**Problem:** `bash: wappa: command not found`

**Solutions:**
```bash
# If using uv, use this instead:
uv run wappa init my-app

# Or install globally:
uv tool install wappa
```

### Wrong Path Error

**Problem:** `ModuleNotFoundError` or `No such file or directory`

**Common mistakes:**
```bash
# ❌ Wrong paths
uv run wappa dev main.py          # Missing app/ directory
uv run wappa dev src/main.py      # Wrong directory structure

# ✅ Correct paths  
uv run wappa dev app/main.py      # Correct!
cd app && uv run wappa dev main.py  # Also works
```

### Missing Environment Variables

**Problem:** `Missing required configuration: WP_ACCESS_TOKEN`

**Solution:**
```bash
# Check your .env file exists and contains:
cat .env

# Should show:
WP_ACCESS_TOKEN=your_token_here
WP_PHONE_ID=your_phone_id_here
# ... etc
```

### Port Already in Use

**Problem:** `[Errno 48] Address already in use`

**Solutions:**
```bash
# Use a different port
uv run wappa dev app/main.py --port 3000

# Or kill the process using port 8000
lsof -ti:8000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :8000   # Windows (then kill PID)
```

### Import Errors

**Problem:** `ImportError: No module named 'wappa'`

**Solutions:**
```bash
# Make sure Wappa is installed in your environment
uv add wappa

# If using pip/virtualenv:
pip list | grep wappa  # Should show wappa version

# Check you're in the right directory
ls app/main.py  # Should exist
```

### Webhook Verification Failed  

**Problem:** WhatsApp says webhook verification failed

**Solutions:**
```bash
# Check these match exactly:
# 1. Webhook URL in Meta for Developers
https://your-domain.com/webhook/messenger/YOUR_PHONE_ID/whatsapp

# 2. Verify token in Meta for Developers
# Must match WP_WEBHOOK_VERIFY_TOKEN in your .env

# 3. Your server must be running and accessible
curl https://your-domain.com/webhook/messenger/YOUR_PHONE_ID/whatsapp
```

### Redis Connection Issues

**Problem:** `ConnectionRefusedError: [Errno 61] Connection refused`

**Solution:** This only happens if you're using Redis caching:
```bash
# Option 1: Use memory caching instead (for development)
# In your code:
app = Wappa(cache="memory")  # Instead of cache="redis"

# Option 2: Install and start Redis
# macOS:
brew install redis
brew services start redis

# Ubuntu/Debian:
sudo apt install redis-server
sudo systemctl start redis-server

# Docker:
docker run -d -p 6379:6379 redis:alpine
```

### Development vs Production Issues

**Problem:** Works in development but fails in production

**Common causes:**
- Environment variables not set on production server
- Different Python version
- Missing dependencies
- Firewall blocking webhook port

**Debug checklist:**
```bash
# Check environment variables are set:
echo $WP_ACCESS_TOKEN  # Should show your token

# Check Python version matches:
python --version  # Should be 3.12+

# Check dependencies:
uv sync  # or pip install -r requirements.txt

# Check webhook URL is accessible:
curl https://yourapp.com/webhook/messenger/PHONE_ID/whatsapp
```

---

## Quick Verification

Test your installation is working:

```bash
# 1. Check Wappa is installed
uv run wappa --help

# 2. Create a test project  
uv run wappa init test-app
cd test-app

# 3. Check project structure
ls -la  # Should show app/, .env, etc.

# 4. Start the server (will fail without credentials - that's expected)
uv run wappa dev app/main.py
```

If you see the server starting (even if it complains about missing credentials), your installation is working correctly!

---

## Next Steps

✅ **Installation complete!** Now you're ready to build your first conversational app.

<div style="text-align: center; margin: 3rem 0; padding: 2rem; border: 1px solid var(--md-default-fg-color--lightest); border-radius: 12px; background: transparent;">
    <h3 style="margin: 0 0 1rem 0; font-size: 1.5rem;">🎯 Ready to Build Your First Conversational App?</h3>
    <p style="margin: 0 0 1.5rem 0; opacity: 0.8; font-size: 1.1rem;">
        You have Wappa installed and configured. Let's build something amazing in 10 minutes!
    </p>
    
    <a href="quickstart" class="md-button md-button--primary" style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 8px;
        padding: 12px 32px;
        font-size: 16px;
        font-weight: 600;
        text-decoration: none;
        color: white;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        transition: all 0.3s ease;
        display: inline-block;
        margin: 0.5rem;
    ">🚀 Start Quick Start Guide</a>
</div>

### Alternative Learning Paths:

- 📖 **[WhatsApp Setup Guide](setup/whatsapp-setup.md)** - Detailed credential setup with screenshots  
- 💡 **[Example Applications](resources/examples.md)** - See 6 complete conversational apps
- 🏗️ **[Architecture Guide](concepts/architecture.md)** - Understand how Wappa works

**Need help?** Join our [WhatsApp community](https://chat.whatsapp.com/GXXwfkP1ZoA6Ypjnb9mgiv) or check the [troubleshooting section](#troubleshooting-installation-issues) above.