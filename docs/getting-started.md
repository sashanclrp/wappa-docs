# Getting Started

Welcome to Wappa! You're about to build powerful WhatsApp conversational applications in Python with minimal setup and maximum flexibility.

## What You'll Learn

This section will get you from zero to a working WhatsApp application in minutes:

📦 **[Installation](installation.md)** - Get Wappa installed and your environment ready

⚡ **[Quick Start](quickstart.md)** - Build your first WhatsApp Conversational App in 5 minutes

## What Wappa Does

Wappa is an open-source Python framework that makes building WhatsApp Business applications simple:

```python
from wappa import Wappa, WappaEventHandler

class MyApp(WappaEventHandler):
    async def handle_message(self, message):
        await self.messenger.send_text(f"Hello {message.sender_name}!", message.sender_phone)

app = Wappa(
    whatsapp_token="your_token",
    whatsapp_phone_id="your_phone_id", 
    whatsapp_business_id="your_business_id"
)
app.register_handler(MyApp())
```

**That's it.** Three things: handle messages, send responses, register your handler.

## Ready to Start?

**New to Wappa?** → Start with [**Quick Start**](quickstart.md) for a 5-minute working example

**Need to install first?** → Go to [**Installation**](installation.md) for setup instructions

**Want to understand more?** → Check out [**Core Concepts**](concepts/architecture.md) after you've built something working

---

*Let's build something amazing together! 🚀*