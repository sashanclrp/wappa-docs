# Quick Start - 10 Minutes to Your First Conversational App

You'll have a working WhatsApp conversational app in 10 minutes. **Really.**

No complex setup. No configuration headaches. Just working code that responds to WhatsApp messages immediately.

---

## Prerequisites (1 minute)

All you need:

- **Python 3.12+** (check with `python --version`)
- **uv package manager** ([install here](https://github.com/astral-sh/uv) - it's fast!)
- **WhatsApp Business API credentials** (we'll get these in Step 2)

That's it. No Docker, no databases, no complex dependencies.

---

## Step 1: Install Wappa (30 seconds)

```bash
# Install Wappa
uv add wapp in your terminala

# Create your first project
uv run wappa init my-echo-app
cd my-echo-app
```

**What you should see:**
```
🚀 Creating new Wappa project: my-echo-app
✅ Project structure created
✅ Example files generated
✅ Dependencies configured

📁 Project created at: ./my-echo-app
💡 Next: Add your WhatsApp credentials to .env
```

Perfect! Your project skeleton is ready.

---

## Step 2: Get WhatsApp Credentials (2 minutes)

WhatsApp needs 3 credentials. Here's the fastest way to get them:

### Quick Option: Use Test Credentials
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app → "Other" → "Business"
3. Add "WhatsApp Business Platform" to your app
4. Copy these 3 values from the "Getting Started" tab:

```bash
# Add to your .env file (created in my-echo-app folder)
WP_ACCESS_TOKEN=your_temporary_access_token_here
WP_PHONE_ID=your_test_phone_number_id_here  
WP_BID=your_whatsapp_business_account_id_here
WP_WEBHOOK_VERIFY_TOKEN=mySecureWebhookToken123
```

**⚠️ The .env file is crucial!** It keeps your credentials secure and separate from your code. Never commit this file to git.

**About the Webhook Token:** The `WP_WEBHOOK_VERIFY_TOKEN` is a security token you create yourself (can be a simple word like "mytoken" or a complex string like "mySecureWebhookToken123"). WhatsApp uses this to verify that webhook requests are coming from your application. You'll use this same token in WhatsApp's webhook settings.

### Need Real Production Credentials?
For production apps with real WhatsApp numbers, follow our [complete WhatsApp setup guide](setup/whatsapp-setup.md). But for now, test credentials work perfectly!

---

## Step 3: Connect Your Webhook to WhatsApp (2 minutes)

Before writing code, you need to connect WhatsApp to your app. This step sets up the communication bridge.

!!! info "What is a Webhook Verify Token?"
    
    The **Webhook Verify Token** is a security password you create yourself to authenticate webhook requests between WhatsApp and your app. Think of it as a secret handshake:
    
    - **Simple option**: `"mytoken"`, `"hello123"`, `"wappa"`
    - **Secure option**: `"mySecureWebhookToken123"`, `"prod-wh-2024-secure"`
    - **What it does**: WhatsApp uses this token to verify your webhook during setup
    - **Important**: Use the SAME token in your `.env` file AND WhatsApp's webhook settings

### Make Your App Internet-Accessible

WhatsApp needs a public URL (not `localhost`) to send messages. Use **ngrok** to create a tunnel:

```bash
# Install ngrok (see https://ngrok.com/docs/getting-started/ for details)
# Then run:
ngrok http 8000
```

**What you should see:**
```
Forwarding  https://abc123.ngrok.io -> http://localhost:8000
```

Copy that `https://` URL - that's your public URL!

### Configure WhatsApp Webhook

1. **Go to your WhatsApp Business app** in Meta for Developers
2. **Navigate to WhatsApp → Configuration → Webhooks**
3. **Callback URL**: Use your ngrok URL + webhook path:
   ```
   https://abc123.ngrok.io/webhook/messenger/YOUR_PHONE_ID/whatsapp
   ```
   *(Replace YOUR_PHONE_ID with your actual phone ID from .env)*
4. **Verify Token**: Enter your `WP_WEBHOOK_VERIFY_TOKEN` (from your .env file)
5. **Click "Verify and Save"**

### Subscribe to Messages

In the webhook panel, **subscribe to "messages"** to receive message events.

**🎉 Your webhook is connected!** WhatsApp can now communicate with your app.

*For detailed setup with screenshots, see our [WhatsApp Setup Guide](setup/whatsapp-setup.md).*

---

## Step 4: Create Your Echo Conversational App (2 minutes)

Let's build an echo conversational app that responds to different message types. Replace the contents of `app/master_event.py`:

```python title="app/master_event.py"
from wappa import WappaEventHandler
from wappa.core.logging import get_logger

logger = get_logger(__name__)

class MyEchoApp(WappaEventHandler):
    async def process_message(self, webhook):
        """Handle all incoming messages"""
        
        # Get message info
        user_id = webhook.user.user_id
        message_text = webhook.get_message_text()
        message_type = webhook.get_message_type_name()
        message_id = webhook.message.message_id
        
        # Mark as read and show typing
        await self.messenger.mark_as_read(message_id=message_id, typing=True)
        
        # Handle different message types
        if message_type.lower() == "text":
            # Echo text messages
            response = f"🔄 You said: {message_text}"
            await self.messenger.send_text(
                recipient=user_id,
                text=response,
                reply_to_message_id=message_id
            )
            
        elif message_type.lower() in ["image", "video", "audio", "document"]:
            # Acknowledge media messages
            response = f"📁 Nice {message_type}! I received your media file."
            await self.messenger.send_text(
                recipient=user_id, 
                text=response,
                reply_to_message_id=message_id
            )
            
        elif message_type.lower() == "location":
            # Acknowledge location sharing
            response = "📍 Thanks for sharing your location!"
            await self.messenger.send_text(
                recipient=user_id,
                text=response,
                reply_to_message_id=message_id
            )
            
        else:
            # Handle other message types
            response = f"🤖 I received a {message_type} message. Echo apps are learning!"
            await self.messenger.send_text(
                recipient=user_id,
                text=response,
                reply_to_message_id=message_id
            )
        
        logger.info(f"✅ Processed {message_type} from {user_id}")
```

**What this code does:**

- **`webhook`**: Contains all the message data WhatsApp sends you
- **`self.messenger`**: Your interface to send messages back to WhatsApp
- **Message types**: Text, images, videos, locations - your app handles them all
- **Reply feature**: Your responses appear as replies to the original message

---

## Step 5: Run Your Conversational App (30 seconds)

```bash
# Start development server with auto-reload
uv run wappa dev app/main.py
```

**What you should see in your terminal:**
```
🚀 Wappa v1.0.0 - Starting Development Server
================================================================

📋 CONFIGURATION STATUS:
  • Access Token: ✅ Configured
  • Phone ID: 1234567890123456
  • Business ID: ✅ Configured
  • Environment: 🛠️ Development

🌐 Starting development server...
💡 Press CTRL+C to stop the server

================================================================
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

Your conversational app is **LIVE**! 🎉

### Check Your Webhook URL

Your server logs show the webhook URL that's ready to use:

```
INFO     [wappa.app] === WHATSAPP WEBHOOK URL ===
INFO     [wappa.app] 📍 Primary Webhook URL: http://localhost:8000/webhook/messenger/757897850740126/whatsapp
INFO     [wappa.app]    • Use this single URL in WhatsApp Business settings
INFO     [wappa.app]    • Handles both verification (GET) and webhooks (POST)
INFO     [wappa.app]    • Auto-configured with your WP_PHONE_ID from .env
```

*You configured this webhook in Step 3 - your app is ready to receive messages!*

---

## Step 6: Test Your Conversational App (1 minute)

1. **Send a test message** to your WhatsApp test number (shown in Meta for Developers)
2. **Your app responds** with an echo of your message
3. **Try different types**: Send an image, location, or voice note

### Bonus: Explore the API

While your app is running, visit **`http://localhost:8000/docs`** in your browser. You'll see the **Swagger documentation** showing all available WhatsApp API endpoints that your app can use!

This is incredibly useful for understanding what your app can do:
- Send messages, media, interactive buttons
- Mark messages as read
- Get webhook data
- Access all WhatsApp Business API features

---

## 🎉 Your Conversational App is Working! Now What?

**Congratulations!** You just built a WhatsApp conversational app that:

✅ Responds to text messages with echoes  
✅ Handles media files (images, videos, audio)  
✅ Acknowledges locations and contacts  
✅ Shows typing indicators and marks messages as read  
✅ Uses professional logging  
✅ Auto-reloads when you change code  

### Next Steps

=== "Make It Smarter"
    
    **Add interactive features:**
    ```python
    # Add buttons to your responses
    buttons = [
        {"id": "option1", "title": "Option 1"},
        {"id": "option2", "title": "Option 2"}
    ]
    await self.messenger.send_button_message(
        buttons, user_id, "Choose an option:"
    )
    ```
    
    **Learn more:** [Complete Messaging Guide](concepts/messaging.md)

=== "Add Memory"
    
    **Remember user conversations:**
    ```python
    # Remember what users say
    await self.cache.set_user_state(user_id, {"last_message": message_text})
    
    # Retrieve it later
    user_data = await self.cache.get_user_state(user_id)
    ```
    
    **Learn more:** [Caching & State Management](api/cache.md)

=== "Go to Production"
    
    **Deploy in 10 minutes:**
    ```bash
    # Deploy to Railway (free tier available)
    railway up
    ```
    
    **Learn more:** [Deploy to Railway](deployment/railway.md)

=== "Explore Examples"
    
    **See real conversational apps:**
    ```bash
    # Browse 6 complete examples
    uv run wappa examples
    ```
    
    **Learn more:** [Example Applications](resources/examples.md)

### Understanding Your Webhook Data

The `webhook` object contains everything WhatsApp sends you. Here are the most useful properties:

```python
# User information
webhook.user.user_id        # "1234567890"
webhook.user.profile_name   # "John Doe"

# Message content
webhook.get_message_text()     # "Hello app!"
webhook.get_message_type_name() # "text"
webhook.message.message_id     # "wamid.abc123..."

# Media messages (when applicable)
webhook.message.image.id       # Media file ID
webhook.message.image.mime_type # "image/jpeg"

# Location messages (when applicable)
webhook.message.location.latitude  # 40.7589
webhook.message.location.longitude # -73.9851
```

### Environment Variables Matter

Your `.env` file keeps credentials secure:

```bash title=".env"
# Required WhatsApp credentials
WP_ACCESS_TOKEN=your_token_here
WP_PHONE_ID=your_phone_id_here  
WP_BID=your_business_id_here
WP_WEBHOOK_VERIFY_TOKEN=your_custom_webhook_token

# Optional settings (with defaults)
LOG_LEVEL=INFO
ENVIRONMENT=development
```

**Why .env is important:**
- ✅ Keeps secrets out of your code
- ✅ Different settings for dev/staging/production
- ✅ Never accidentally commit credentials to git
- ✅ Easy to change without code changes

---

## Troubleshooting

### Conversational App Not Responding?

**Check your logs:**
```bash
# Look for errors in the terminal where your app is running
# Common issues and solutions:

❌ "Missing required configuration: WP_ACCESS_TOKEN"
✅ Add credentials to your .env file

❌ "403 Forbidden" or "Invalid access token"  
✅ Generate a new access token in Meta for Developers

❌ "Webhook verification failed"
✅ Check webhook URL matches in Meta for Developers
```

### Need Help?

- 📖 **[Installation Guide](installation.md)** - Detailed setup instructions
- 🔧 **[WhatsApp Setup](setup/whatsapp-setup.md)** - Complete credential guide  
- 💬 **[WhatsApp Community](https://chat.whatsapp.com/GXXwfkP1ZoA6Ypjnb9mgiv)** - Get help from other developers
- 📚 **[API Reference](api/wappa-core.md)** - Every method documented

---

**Ready for more?** Explore our [Example Applications](resources/examples.md) to see 6 complete conversational apps from basic to production-ready, or join our [WhatsApp community](https://chat.whatsapp.com/GXXwfkP1ZoA6Ypjnb9mgiv) to connect with other developers.

<div style="text-align: center; margin: 2rem 0;">
    <strong>🎯 You just built your first WhatsApp conversational app!</strong><br>
    <span style="color: #666;">Share your success with the community</span>
</div>