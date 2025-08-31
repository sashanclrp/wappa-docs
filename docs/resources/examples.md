# Example Applications

**Complete, working conversational applications you can learn from**

Six carefully crafted examples from basic message handling to complex interactive workflows. Each example builds on the previous one, introducing new concepts without overwhelming you.

**Start with simple echo, work your way up.**

---

## 🎯 Learning Path

We recommend following this progression:

1. **Basic Project** → Get familiar with Wappa structure
2. **Simple Echo** → Learn message handling patterns  
3. **JSON Cache** → Add persistence and state management
4. **Redis Cache** → Scale up with professional caching
5. **OpenAI Transcript** → Integrate AI services
6. **Full-Featured App** → See everything in action

---

## 📚 Example Gallery

### 1. Basic Project Template
*Your starting point - clean and minimal*

**What it does:**

- Responds with "Welcome to Wappa" to any message
- Demonstrates minimal Wappa application structure
- Perfect foundation for new projects

**What you'll learn:**

- Basic Wappa application setup
- Event handler pattern
- Clean project structure

**Try it yourself:**
```bash
wappa examples my-first-app
# Then select "Basic project template"
```

**Best for:** First-time Wappa developers who want a clean starting point

---

### 2. Simple Echo Application  
*Learn message handling without complexity*

**What it does:**

- Echoes back text messages with "Echo: [your message]"
- Handles all message types (text, media, location, contacts)
- Tracks message count and provides welcome messages
- Professional logging and error handling

**What you'll learn:**

- Message type detection and handling
- Professional error handling patterns
- Clean architecture without external dependencies
- Logging and debugging techniques

**Try it yourself:**
```bash
wappa examples echo-demo
# Then select "Simple echo bot"
```

**Best for:** Understanding core Wappa concepts without caching complexity

---

### 3. JSON Cache Demo
*File-based persistence with SOLID architecture*

**What it does:**

- Uses JSON files for caching (no Redis required)
- User profile management and message history
- Special commands: `/WAPPA`, `/EXIT`, `/HISTORY`, `/STATS`
- SOLID architecture with modular score system

**What you'll learn:**

- File-based caching strategies
- SOLID principles in practice
- Modular architecture with score modules
- User session management
- Command processing patterns

**Try it yourself:**
```bash
wappa examples json-cache-demo
# Then select "JSON cache demo"
```

**Best for:** Learning state management and modular architecture without Redis setup

---

### 4. Redis Cache Demo
*Professional caching with scalable architecture*

**What it does:**

- Redis-powered caching for production scalability
- Advanced user management with analytics
- Same commands as JSON version but with Redis performance
- Comprehensive cache statistics and monitoring

**What you'll learn:**

- Redis integration and configuration
- High-performance caching patterns
- Production-ready error handling
- Cache statistics and monitoring
- Scalable architecture patterns

**Try it yourself:**
```bash
wappa examples redis-cache-demo
# Then select "Redis cache demo"
```

**Best for:** Building production-ready applications with professional caching

---

### 5. OpenAI Transcription
*AI integration for voice processing*

**What it does:**

- Transcribes voice messages using OpenAI Whisper
- Handles audio file download and processing
- Demonstrates AI service integration
- Both file-based and memory-based processing options

**What you'll learn:**

- AI service integration patterns
- Media file handling and processing
- Async external API calls
- Audio processing workflows
- Error handling for external services

**Try it yourself:**
```bash
wappa examples ai-transcription
# Then select "OpenAI transcription"
```

**Best for:** Adding AI capabilities to your conversational applications

---

### 6. Full-Featured Application
*Production-ready showcase with everything*

**What it does:**

- Complete interactive command system (`/button`, `/list`, `/cta`, `/location`)
- Media relay functionality using media_id
- Comprehensive metadata extraction for all message types
- State management with TTL expiration
- User analytics and activity tracking
- Professional architecture with handler separation

**What you'll learn:**

- Interactive button and list workflows
- Media relay and file serving
- Complex state management patterns
- Production-ready architecture
- Comprehensive error handling
- Performance monitoring and analytics

**Try it yourself:**
```bash
wappa examples full-demo
# Then select "Full-featured bot"
```

**Best for:** Understanding the full potential of WhatsApp Business API features

---

## 🚀 Getting Started with Examples

### Quick Access
```bash
# Interactive examples browser
wappa examples

# Copy specific example to current directory
wappa examples .

# Copy to named directory  
wappa examples my-app-name
```

### Running Examples
Each example includes detailed setup instructions, but the general pattern is:

```bash
# Navigate to your example
cd your-example-directory

# Install dependencies
uv sync

# Configure environment (copy .env.example to .env)
cp .env.example .env
# Edit .env with your WhatsApp credentials

# Run the application
uv run python -m app.main
```

---

## 🎓 Learning Recommendations

### For Beginners
Start with **Basic Project** → **Simple Echo** to understand core concepts without distractions.

### For Developers with Experience
Jump to **JSON Cache Demo** if you want to see modular architecture, or **Redis Cache Demo** if you need production patterns.

### For AI Integration
Check out **OpenAI Transcript** to see how external AI services integrate with Wappa.

### For Production Projects
Study **Full-Featured Application** to see professional patterns for interactive workflows and comprehensive error handling.

---

## 💡 What Each Example Teaches

| Concept | Basic | Echo | JSON | Redis | AI | Full |
|---------|-------|------|------|-------|----|----- |
| **Message Handling** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Professional Logging** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **State Management** | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| **Caching Strategies** | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| **SOLID Architecture** | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| **Interactive Commands** | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| **External API Integration** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Media Processing** | ❌ | Basic | ❌ | ❌ | ✅ | ✅ |
| **Production Patterns** | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |

---

## 🛠️ Customizing Examples

Each example is designed to be:

- **Copy-pasteable** - Working code you can run immediately
- **Modifiable** - Clear structure for adding your own features  
- **Educational** - Comments and documentation explain the "why"
- **Progressive** - Each builds on concepts from simpler examples

Don't just copy the code - **understand the patterns**. The examples show you proven ways to structure WhatsApp conversational applications that scale from prototype to production.

---

## 🤔 Which Example Should I Start With?

**"I'm new to Wappa"** → Start with **Basic Project**, then **Simple Echo**

**"I need caching but no Redis setup"** → **JSON Cache Demo**

**"I'm building something serious"** → **Redis Cache Demo** 

**"I want to add AI features"** → **OpenAI Transcript**

**"Show me everything Wappa can do"** → **Full-Featured Application**

**"I just want to see what's possible"** → Jump straight to **Full-Featured**, then go back to study the progression

---

*Remember: These aren't just code samples - they're your learning companions. Each one solves real problems you'll encounter building WhatsApp conversational applications.*