# CLI Commands

Command-line tools to make your life easier when building WhatsApp conversational applications with Wappa.

## Overview

The Wappa CLI provides essential commands for project creation, development, and deployment. Built with [Typer](https://typer.tiangolo.com/) and [Rich](https://rich.readthedocs.io/) for beautiful terminal interfaces.

```bash
wappa --help    # Show all available commands
```

## Core Commands

### Quick Reference Table

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `wappa init` | Create new project | Starting a new conversational app |
| `wappa examples` | Browse example projects | Learning patterns, quick prototypes |
| `wappa dev` | Development server | Building and testing locally |
| `wappa prod` | Production server | Deploying to production |

---

## `wappa init`

Initialize a new Wappa project with proper structure and configuration.

### Syntax
```bash
wappa init [DIRECTORY]
```

### Arguments

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `directory` | string | `.` (current) | Target directory for initialization |

### What It Creates

```
my-project/
├── app/
│   ├── __init__.py         # Package marker
│   ├── main.py            # Wappa application entry point
│   ├── master_event.py    # Main event handler
│   └── scores/            # Business logic directory
│       └── __init__.py
├── .env                   # Environment variables template
└── .gitignore            # Git ignore rules
```

### Usage Examples

```bash
# Initialize in current directory
wappa init

# Create new project directory
wappa init my-whatsapp-app

# Initialize in existing directory
wappa init ./existing-project
```

### Next Steps After Init

The CLI automatically guides you through setup:

1. **Add WhatsApp credentials** to `.env` file
2. **Install dependencies**: `uv sync` 
3. **Start development**: `uv run wappa dev app/main.py`

### Environment Variables Template

```env
# Required WhatsApp Business API credentials
WP_ACCESS_TOKEN=your_access_token_here
WP_PHONE_ID=your_phone_number_id_here  
WP_BID=your_business_id_here

# Optional configuration
REDIS_URL=redis://localhost:6379
LOG_LEVEL=INFO
ENVIRONMENT=development
```

---

## `wappa examples`

Browse and copy example projects with interactive menu interface.

### Syntax
```bash
wappa examples [DIRECTORY]
```

### Arguments

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `directory` | string | `.` (current) | Target directory for example copy |

### Available Examples

| # | Name | Complexity | Key Features |
|---|------|------------|--------------|
| 1 | **Basic Project** | 🟢 Beginner | Message handling, Mark as read, Basic response |
| 2 | **Simple Echo** | 🟢 Beginner | Message echo, Media handling, Clean architecture |
| 3 | **JSON Cache Demo** | 🟡 Intermediate | JSON caching, User management, State handling, Statistics |
| 4 | **Redis Cache Demo** | 🟡 Intermediate | Redis caching, Advanced state, Performance monitoring |
| 5 | **OpenAI Transcription** | 🟡 Intermediate | Audio processing, OpenAI integration, Voice transcription |
| 6 | **Full-Featured App** | 🔴 Advanced | All message types, Media handling, Interactive components, Docker |

### Interactive Menu

The command opens a beautiful interactive table:

```bash
$ wappa examples my-app

🚀 Wappa Example Projects
Choose an example to copy to your project:

┏━━━┳━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ # ┃ Name                ┃ Description                                       ┃ Complexity     ┃ Key Features                                                                     ┃
┡━━━╇━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┩
│ 1 │ Basic Project       │ Minimal Wappa project with basic message handling│ 🟢 Beginner    │ Message handling, Mark as read, Basic response                                  │
│ 2 │ Simple Echo Bot     │ Echoes all incoming messages with acknowledgment │ 🟢 Beginner    │ Message echo, Media handling, Clean architecture                                │
│ 3 │ JSON Cache Demo     │ File-based caching with user management          │ 🟡 Intermediate│ JSON caching, User management, State handling...                                │
│ 4 │ Redis Cache Demo    │ Redis-powered caching with advanced state mgmt   │ 🟡 Intermediate│ Redis caching, Advanced state, Performance monitoring...                        │
│ 5 │ OpenAI Transcription│ Voice message transcription using OpenAI Whisper │ 🟡 Intermediate│ Audio processing, OpenAI integration, Voice transcription                       │
│ 6 │ Full-Featured Bot   │ Complete WhatsApp bot with all features          │ 🔴 Advanced    │ All message types, Media handling, Interactive components...                    │
└───┴─────────────────────┴───────────────────────────────────────────────────┴────────────────┴─────────────────────────────────────────────────────────────────────────────────┘

Enter your choice (1-6) or 'q' to quit:
```

### Usage Examples

```bash
# Show interactive examples menu in current directory
wappa examples

# Copy example to specific directory
wappa examples my-new-app

# Quick selection (non-interactive)
echo "1" | wappa examples simple-echo
```

---

## `wappa dev`

Run development server with auto-reload for rapid iteration.

### Syntax
```bash
wappa dev FILE_PATH [OPTIONS]
```

### Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `file_path` | string | Yes | Path to your Python file containing Wappa app |

### Options

| Option | Short | Type | Default | Description |
|---------|-------|------|---------|-------------|
| `--app` | `-a` | string | `app` | Wappa instance variable name |
| `--host` | `-h` | string | `0.0.0.0` | Host to bind server to |
| `--port` | `-p` | integer | `8000` | Port to bind server to |

### Usage Examples

```bash
# Basic development server
wappa dev main.py

# Custom port and host
wappa dev app/main.py --port 8080 --host 127.0.0.1

# Different app variable name
wappa dev src/app.py --app my_wappa_app

# Nested project structure
wappa dev examples/redis_demo/main.py --port 3000
```

### Development Features

- **Auto-reload**: Automatic restart when code changes
- **Interactive docs**: Available at `http://host:port/docs`
- **Error reporting**: Clear error messages with troubleshooting tips
- **Module resolution**: Smart import handling for nested structures

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| `Module not found` | Missing `app` variable | Ensure `app = Wappa(...)` exists at module level |
| `Port already in use` | Port conflict | Use `--port` with different number |
| `Import errors` | Missing dependencies | Run `uv sync` to install dependencies |

---

## `wappa prod`

Run production server optimized for deployment with multiple workers.

### Syntax
```bash
wappa prod FILE_PATH [OPTIONS]
```

### Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `file_path` | string | Yes | Path to your Python file containing Wappa app |

### Options

| Option | Short | Type | Default | Description |
|---------|-------|------|---------|-------------|
| `--app` | `-a` | string | `app` | Wappa instance variable name |
| `--host` | `-h` | string | `0.0.0.0` | Host to bind server to |
| `--port` | `-p` | integer | `8000` | Port to bind server to |
| `--workers` | `-w` | integer | `1` | Number of worker processes |

### Usage Examples

```bash
# Basic production server
wappa prod main.py

# Multi-worker production server
wappa prod main.py --workers 4

# Custom configuration
wappa prod app/main.py --workers 2 --port 8080 --host 0.0.0.0

# Alternative app variable
wappa prod src/application.py --app my_app --workers 3
```

### Production Considerations

**When to use `dev` vs `prod`:**

| Feature | `wappa dev` | `wappa prod` |
|---------|-------------|--------------|
| **Auto-reload** | ✅ Yes | ❌ No |
| **Workers** | Single process | Multiple workers |
| **Performance** | Development | Optimized |
| **Error handling** | Verbose | Production-safe |
| **Use case** | Local development | Deployment |

### Worker Configuration

```bash
# Single worker (default)
wappa prod main.py --workers 1

# CPU-based workers (recommended)
wappa prod main.py --workers 4

# Conservative for small servers
wappa prod main.py --workers 2
```

**Worker Count Guidelines:**
- **Small server**: 1-2 workers
- **Medium server**: 2-4 workers  
- **Large server**: 4-8 workers
- **Rule of thumb**: `2 × CPU cores` maximum

---

## Module Resolution

Wappa CLI intelligently handles Python module imports for different project structures:

### Flat Structure
```bash
# main.py in root
wappa dev main.py           # → "main:app.asgi"
```

### Nested Structure  
```bash
# app/main.py
wappa dev app/main.py       # → "app.main:app.asgi"

# deeply nested
wappa dev examples/redis_demo/main.py  # → "examples.redis_demo.main:app.asgi"
```

### Custom App Variable
```bash
# If your file has: my_wappa_app = Wappa(...)
wappa dev main.py --app my_wappa_app    # → "main:my_wappa_app.asgi"
```

---

## Advanced Usage

### Environment Integration

The CLI respects environment variables and project configuration:

```bash
# Using environment variables
export WAPPA_HOST=127.0.0.1
export WAPPA_PORT=3000
wappa dev main.py  # Uses environment defaults
```

### Docker Integration

```bash
# Production deployment in Docker
CMD ["wappa", "prod", "main.py", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Start Wappa server
  run: |
    uv run wappa prod main.py --workers 2 --port $PORT &
    sleep 5  # Wait for server startup
```

### Development Workflow

```bash
# Typical development session
wappa init my-app              # 1. Create project
cd my-app                      # 2. Navigate to project
# Edit .env with credentials    # 3. Configure WhatsApp API
uv sync                        # 4. Install dependencies
wappa dev app/main.py          # 5. Start development server
# Make changes...              # 6. Code with auto-reload
wappa prod app/main.py         # 7. Test production build
```

### Performance Tips

**Development:**
- Use `wappa dev` for fastest iteration cycle
- Default port `8000` avoids common conflicts
- Auto-reload watches all project files

**Production:**
- Use `wappa prod` with multiple workers for scalability
- Bind to `0.0.0.0` for external access
- Consider reverse proxy (nginx) for SSL termination

### Troubleshooting Common Issues

| Problem | Symptom | Solution |
|---------|---------|----------|
| **Server won't start** | `Module not found` | Check file path and ensure `app = Wappa(...)` exists |
| **Port conflicts** | `Address already in use` | Use `--port` with different number or kill existing process |
| **Import errors** | `ImportError` during startup | Run `uv sync` and check dependencies |
| **Performance issues** | Slow responses | Use `wappa prod` with `--workers` for production |
| **Module resolution** | `No module named 'app'` | Check file structure matches command path |

### Shell Completion

Enable auto-completion for your shell:

```bash
# Install completion (one-time setup)
wappa --install-completion

# Show completion script (for manual setup)
wappa --show-completion
```

---

## Alternative Execution Methods

### Using uv run

All commands can be prefixed with `uv run` for explicit dependency management:

```bash
# Alternative syntax
uv run wappa init my-app
uv run wappa dev app/main.py
uv run wappa prod app/main.py --workers 4
uv run wappa examples
```

### Direct uvicorn (Advanced)

For advanced server configuration, use uvicorn directly:

```bash
# Development with custom uvicorn settings
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production with advanced worker configuration  
uv run uvicorn app.main:app --workers 4 --host 0.0.0.0 --port 8000 --access-log
```

## Migration from Direct uvicorn

If you're currently using uvicorn directly, here's the migration path:

| Old uvicorn command | New wappa command |
|-------------------|-------------------|
| `uvicorn main:app --reload` | `wappa dev main.py` |
| `uvicorn app.main:app --reload --port 3000` | `wappa dev app/main.py --port 3000` |
| `uvicorn main:app --workers 4` | `wappa prod main.py --workers 4` |
| `uvicorn app.main:my_app --reload` | `wappa dev app/main.py --app my_app` |

**Benefits of wappa CLI:**
- Automatic module resolution for nested projects
- Built-in error handling and troubleshooting
- Consistent command interface across projects
- Rich terminal output with progress indicators
- Example project integration