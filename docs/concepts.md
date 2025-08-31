# Core Concepts

Welcome to Wappa's core concepts! These guides explain how Wappa works under the hood and help you build sophisticated conversational applications.

## What You'll Learn

This section covers everything you need to understand Wappa's architecture and capabilities:

🏗️ **[Architecture](concepts/architecture.md)** - How Wappa is structured and why it works so well

🔄 **[Event System](concepts/event-system.md)** - The heart of Wappa - how messages become events

💾 **[State Management](concepts/state-management.md)** - Keep track of conversations and user data

💬 **[Messaging](concepts/messaging.md)** - Everything you can send to users (and how)

⚙️ **[Configuration](concepts/configuration.md)** - Settings, environment variables, and customization

## How Wappa Works

Wappa follows a simple but powerful pattern:

```python
# 1. Messages come in as webhooks
WhatsApp → Wappa Webhook → Event Dispatcher

# 2. Events trigger your handlers  
Event Dispatcher → Your Event Handler → Business Logic

# 3. Handlers send responses
Business Logic → Messenger → WhatsApp → User
```

**That's the entire flow.** Everything else is just making this pattern more powerful with state management, interactive messages, media handling, and plugins.

## Start Here

**Just built your first app?** → Read [**Architecture**](concepts/architecture.md) to understand what you just created

**Ready for interactive messages?** → Jump to [**Messaging**](concepts/messaging.md) to see all the cool stuff you can send

**Building complex workflows?** → Check out [**Event System**](concepts/event-system.md) and [**State Management**](concepts/state-management.md)

**Want to customize everything?** → Explore [**Configuration**](concepts/configuration.md) for advanced setup

---

*Understanding the concepts makes everything click! 💡*