# Quick Start Guide

Get a WhatsApp bot running in 5 minutes.

## Prerequisites

- Python 3.12+
- WhatsApp Business API credentials
- uv or pip package manager

## Step 1: Installation

```bash
# Using uv (recommended)
uv add wappa

# Or using pip
pip install wappa
```

## Step 2: Get WhatsApp Credentials

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create WhatsApp Business App
3. Get your credentials:
   - Access Token
   - Phone Number ID
   - Business Account ID

## Step 3: Create Project

```bash
# Initialize new project
wappa init my-bot
cd my-bot

# Create .env file
WP_ACCESS_TOKEN=your_access_token
WP_PHONE_ID=your_phone_number_id
WP_BID=your_business_id
```

## Step 4: Simple Echo Bot

Create `main.py`:

```python
from wappa import Wappa, WappaEventHandler
from wappa.webhooks import IncomingMessageWebhook

class EchoBot(WappaEventHandler):
    async def process_message(self, webhook: IncomingMessageWebhook) -> None:
        # Get message details
        user_id = webhook.user.user_id
        message_text = webhook.get_message_text()
        
        # Send echo response
        result = await self.messenger.send_text(
            recipient=user_id,
            text=f"🔄 You said: {message_text}"
        )
        
        if result.success:
            self.logger.info(f"Echo sent: {result.message_id}")

# Create and run app
app = Wappa()
app.set_event_handler(EchoBot())

if __name__ == "__main__":
    app.run()
```

## Step 5: Run Your Bot

```bash
uv run python main.py
```

## Step 6: Test It

1. Send a message to your WhatsApp Business number
2. Bot should echo your message back
3. Check logs for processing details

## Next Steps

- [Complete Installation Guide](installation.md)
- [Build Your First App](first-app.md)
- [Understanding Architecture](concepts/architecture.md)