# Messaging API - Send Anything

Complete reference for everything you can send through WhatsApp. Copy these examples and modify them for your conversational app.

## Quick Reference

Here's what you can send and when to use each:

| Message Type | When to Use | Example Use Case |
|--------------|-------------|------------------|
| **Text** | Most common - announcements, confirmations | "Order confirmed! Tracking: ORD123" |
| **Image** | Product photos, receipts, infographics | Product showcase, receipt images |
| **Video** | Demos, tutorials, marketing | Product demos, how-to videos |
| **Audio** | Voice messages, announcements | Personal messages, audio updates |
| **Document** | Catalogs, forms, contracts | PDF catalog, price list, invoice |
| **Sticker** | Fun reactions, branding | Thank you reactions, branded stickers |
| **Buttons** | Quick choices (max 3 options) | Yes/No, menu options, quick actions |
| **Lists** | Many options (up to 100 items) | Product categories, service options |
| **Call-to-Action** | Drive to website/app | "Visit our store", "Download app" |
| **Contact** | Share business/team contact | Customer service, sales rep |
| **Location** | Share business address | Store location, delivery address |
| **Templates** | Pre-approved business messages | Order confirmations, promotions |

---

## How Messaging Works in Wappa

In your event handler, you have access to `self.messenger` - your gateway to sending anything:

```python
from wappa import WappaEventHandler

class MyApp(WappaEventHandler):
    async def handle_message(self, webhook):
        # The messenger is automatically injected
        await self.messenger.send_text("Hello!", webhook.user.user_id)
        
        # You also have access to the media handler
        upload_result = await self.messenger.media_handler.upload_media("image.jpg")
        if upload_result.success:
            await self.messenger.send_image(upload_result.media_id, webhook.user.user_id)
```

**That's the pattern.** Everything else is just different methods on `self.messenger`.

---

## Text Messages

### `send_text()`

Send text messages up to 4,096 characters:

```python
# Simple text
await self.messenger.send_text("Hello there!", recipient_phone)

# Multi-line with formatting
await self.messenger.send_text(
    """🎉 Order Confirmed!

📋 Order: ORD123
💰 Total: $89.99
📅 Delivery: March 15

Thank you for your purchase!""", 
    recipient_phone
)

# Reply to a specific message
await self.messenger.send_text(
    "Thanks for your message!", 
    recipient_phone,
    reply_to_message_id="wamid.123456"
)

# Disable URL preview
await self.messenger.send_text(
    "Check this link: https://example.com (no preview)", 
    recipient_phone,
    disable_preview=True
)
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | `str` | ✅ | Message text (1-4096 characters) |
| `recipient` | `str` | ✅ | Recipient phone number or ID |
| `reply_to_message_id` | `str \| None` | ❌ | Message ID to reply to (creates thread) |
| `disable_preview` | `bool` | ❌ | Disable URL preview (default: False) |

#### Returns

`MessageResult` object with:
- `success`: Boolean indicating if message was sent
- `message_id`: WhatsApp message ID for tracking
- `error`: Error message if failed
- `recipient`: Recipient identifier
- `platform`: Always "whatsapp"

---

## Media Messages

### `send_image()`

Send images (JPEG/PNG, up to 5MB):

```python
# Image from URL with caption
await self.messenger.send_image(
    "https://example.com/product.jpg",
    recipient_phone,
    caption="Check out our new product! 📸"
)

# Local image file
await self.messenger.send_image(
    "assets/welcome.jpg",  # Local file path
    recipient_phone,
    caption="Welcome to our store! 🛍️"
)

# Using media_id (for already uploaded media)
await self.messenger.send_image(
    "1234567890123456",  # media_id from previous upload
    recipient_phone,
    caption="Reusing uploaded image! ♻️"
)

# Image without caption
await self.messenger.send_image(
    "https://example.com/logo.png",
    recipient_phone
)
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `image_source` | `str \| Path` | ✅ | Image URL, file path, or media_id |
| `recipient` | `str` | ✅ | Recipient phone number or ID |
| `caption` | `str \| None` | ❌ | Image caption (max 1024 chars) |
| `reply_to_message_id` | `str \| None` | ❌ | Message ID to reply to |

### `send_video()`

Send videos (MP4/3GP, up to 16MB):

```python
# Product demo video
await self.messenger.send_video(
    "https://example.com/demo.mp4",
    recipient_phone,
    caption="See our product in action! 🎬"
)

# Local video file
await self.messenger.send_video(
    "videos/tutorial.mp4",
    recipient_phone,
    caption="Quick tutorial - 30 seconds ⏱️"
)

# Reuse uploaded video
await self.messenger.send_video(
    "9876543210987654",  # media_id
    recipient_phone,
    caption="Product demo (cached) 🎥"
)
```

### `send_audio()`

Send audio files (AAC/AMR/MP3/OGG, up to 16MB):

```python
# Voice message (no caption support)
await self.messenger.send_audio(
    "audio/greeting.ogg",
    recipient_phone
)

# Music or podcast
await self.messenger.send_audio(
    "https://example.com/podcast.mp3",
    recipient_phone
)

# Reuse uploaded audio
await self.messenger.send_audio(
    "1111222233334444",  # media_id
    recipient_phone
)
```

### `send_document()`

Send documents (PDF/DOC/XLS/PPT, up to 100MB):

```python
# PDF catalog with custom filename
await self.messenger.send_document(
    "catalogs/products.pdf",
    recipient_phone,
    filename="Product_Catalog_2025.pdf",
    caption="Our complete product catalog 📋"
)

# Excel price list
await self.messenger.send_document(
    "https://example.com/prices.xlsx",
    recipient_phone,
    caption="Updated pricing - effective immediately"
)

# Reuse uploaded document
await self.messenger.send_document(
    "5555666677778888",  # media_id
    recipient_phone,
    filename="Manual.pdf",
    caption="Product manual (cached) 📄"
)
```

### `send_sticker()`

Send stickers (WebP only, 500KB max):

```python
# Fun sticker (no caption support)
await self.messenger.send_sticker(
    "stickers/thumbs_up.webp",
    recipient_phone
)

# Reuse uploaded sticker
await self.messenger.send_sticker(
    "9999888877776666",  # media_id
    recipient_phone
)
```

### Media Specifications

| Media Type | Max Size | Formats | Caption | media_id Support |
|------------|----------|---------|---------|------------------|
| **Image** | 5MB | JPG, PNG | ✅ Yes | ✅ Yes |
| **Video** | 16MB | MP4, 3GP | ✅ Yes | ✅ Yes |
| **Audio** | 16MB | AAC, AMR, MP3, OGG | ❌ No | ✅ Yes |
| **Document** | 100MB | PDF, DOC, XLS, PPT, TXT | ✅ Yes | ✅ Yes |
| **Sticker** | 500KB | WebP | ❌ No | ✅ Yes |

---

## Interactive Messages

### `send_button_message()` {#button-messages}

Send up to 3 quick reply buttons:

```python
from wappa.models import ReplyButton

# Simple Yes/No buttons
buttons = [
    ReplyButton(id="yes", title="Yes, please! ✅"),
    ReplyButton(id="no", title="No, thanks ❌")
]

await self.messenger.send_button_message(
    "Would you like to receive our newsletter?",
    buttons,
    recipient_phone
)

# Customer service menu with header/footer
support_buttons = [
    ReplyButton(id="track_order", title="📦 Track Order"),
    ReplyButton(id="return_item", title="↩️ Return Item"), 
    ReplyButton(id="talk_human", title="💬 Talk to Human")
]

await self.messenger.send_button_message(
    "How can we help you today?",
    support_buttons,
    recipient_phone,
    header="🛠️ Customer Support",
    footer="We're here to help!"
)
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `body` | `str` | ✅ | Main message text (max 1024 chars) |
| `buttons` | `list[ReplyButton]` | ✅ | Up to 3 buttons |
| `recipient` | `str` | ✅ | Recipient phone number or ID |
| `header` | `str \| None` | ❌ | Header text (max 60 chars) |
| `footer` | `str \| None` | ❌ | Footer text (max 60 chars) |
| `reply_to_message_id` | `str \| None` | ❌ | Message ID to reply to |

#### Button Limits
- **Maximum 3 buttons** per message
- **Button titles**: 20 characters max
- **Button IDs**: 256 characters max (use descriptive IDs!)

### `send_list_message()` {#list-messages}

Send lists with up to 100 items organized in sections:

```python
from wappa.models import ListSection, ListRow

# Product categories
sections = [
    ListSection(
        title="📱 Electronics",
        rows=[
            ListRow(id="phones", title="Smartphones", description="Latest iPhone, Samsung"),
            ListRow(id="laptops", title="Laptops", description="MacBook, Dell, HP"),
            ListRow(id="accessories", title="Accessories", description="Cases, chargers, cables")
        ]
    ),
    ListSection(
        title="👕 Clothing",
        rows=[
            ListRow(id="mens", title="Men's Fashion", description="Shirts, pants, shoes"),
            ListRow(id="womens", title="Women's Fashion", description="Dresses, tops, accessories")
        ]
    )
]

await self.messenger.send_list_message(
    "What would you like to browse?",
    sections,
    "🛍️ Browse Categories",  # Button text
    recipient_phone,
    header="Welcome to our store!",
    footer="Tap to explore our collection"
)
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `body` | `str` | ✅ | Main message text (max 4096 chars) |
| `sections` | `list[ListSection]` | ✅ | Up to 10 sections |
| `button_text` | `str` | ✅ | Text for list button (max 20 chars) |
| `recipient` | `str` | ✅ | Recipient phone number or ID |
| `header` | `str \| None` | ❌ | Header text (max 60 chars) |
| `footer` | `str \| None` | ❌ | Footer text (max 60 chars) |
| `reply_to_message_id` | `str \| None` | ❌ | Message ID to reply to |

#### List Limits
- **Maximum 10 sections** per list
- **Maximum 10 rows** per section  
- **Section titles**: 24 characters max
- **Row titles**: 24 characters max
- **Row descriptions**: 72 characters max
- **All row IDs must be unique** across the entire list

### `send_cta_message()`

Send call-to-action buttons that link to external URLs:

```python
# Drive traffic to website
await self.messenger.send_cta_message(
    "Check out our new summer collection!",
    "🛍️ Shop Now",  # Button text
    "https://yourstore.com/summer",  # Button URL
    recipient_phone,
    header="🌞 Summer Sale",
    footer="Free shipping on orders over $50"
)

# App download
await self.messenger.send_cta_message(
    "Download our mobile app for exclusive deals!",
    "📱 Download App",
    "https://apps.apple.com/app/yourapp",
    recipient_phone
)
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `body` | `str` | ✅ | Main message text |
| `button_text` | `str` | ✅ | Text on the button |
| `button_url` | `str` | ✅ | URL to open (must start with http/https) |
| `recipient` | `str` | ✅ | Recipient phone number or ID |
| `header` | `str \| None` | ❌ | Header text |
| `footer` | `str \| None` | ❌ | Footer text |
| `reply_to_message_id` | `str \| None` | ❌ | Message ID to reply to |

---

## Template Messages

### `send_text_template()`

Send pre-approved business templates:

```python
# Order confirmation template
await self.messenger.send_text_template(
    template_name="order_confirmation",
    recipient=customer_phone,
    body_parameters=[
        {"type": "text", "text": "John"},      # {{1}} - Customer name
        {"type": "text", "text": "ORD123"},    # {{2}} - Order number  
        {"type": "text", "text": "$89.99"}     # {{3}} - Total amount
    ],
    language_code="en"
)
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `template_name` | `str` | ✅ | WhatsApp-approved template name |
| `recipient` | `str` | ✅ | Recipient phone number |
| `body_parameters` | `list[dict] \| None` | ❌ | Parameters for {{1}}, {{2}}, {{3}} placeholders |
| `language_code` | `str` | ❌ | BCP-47 language code (default: "es") |

### `send_media_template()`

Templates with image/video headers:

```python
# Product announcement with image
await self.messenger.send_media_template(
    template_name="product_announcement",
    recipient=customer_phone,
    media_type="image",
    media_url="https://yourstore.com/new-product.jpg",
    body_parameters=[
        {"type": "text", "text": "Summer Collection"},
        {"type": "text", "text": "30% OFF"}
    ]
)
```

### `send_location_template()`

Templates with location headers:

```python
# Store location template
await self.messenger.send_location_template(
    template_name="store_location",
    recipient=customer_phone,
    latitude="37.7749",
    longitude="-122.4194", 
    name="Our Main Store",
    address="123 Market St, San Francisco, CA",
    body_parameters=[
        {"type": "text", "text": "Downtown Store"}
    ]
)
```

---

## Specialized Messages

### `send_contact()`

Share contact information using convenient helper models:

```python
from wappa.models import BusinessContact, PersonalContact, ContactCard

# Quick business contact (easiest way)
business = BusinessContact(
    business_name="Mimeia Hotel",
    phone="+1234567890",
    email="contact@mimeia.com",
    website="https://mimeia.com",
    address="123 Business St, City"
)

await self.messenger.send_contact(
    business.to_contact_card(),
    recipient_phone
)

# Quick personal contact
personal = PersonalContact(
    first_name="Sarah",
    last_name="Johnson", 
    phone="+1234567890",
    email="sarah@company.com"
)

await self.messenger.send_contact(
    personal.to_contact_card(),
    recipient_phone
)

# Full contact card with all details
from wappa.models import ContactCard, ContactName, ContactPhone, PhoneType

contact_card = ContactCard(
    name=ContactName(
        formatted_name="Dr. John Smith",
        first_name="John",
        last_name="Smith",
        prefix="Dr."
    ),
    phones=[
        ContactPhone(phone="+1234567890", type=PhoneType.WORK),
        ContactPhone(phone="+1234567891", type=PhoneType.CELL)
    ],
    emails=[{
        "email": "john@hospital.com", 
        "type": "WORK"
    }],
    org={
        "company": "City Hospital",
        "department": "Cardiology", 
        "title": "Senior Cardiologist"
    }
)

await self.messenger.send_contact(contact_card, recipient_phone)
```

### `send_location()`

Share geographic location using helper models:

```python
from wappa.models import LocationMessage

# Using LocationMessage model (validates coordinates)
location = LocationMessage(
    recipient=recipient_phone,
    latitude=37.7749,
    longitude=-122.4194,
    name="Mimeia Hotel",
    address="123 Market Street, San Francisco, CA"
)

await self.messenger.send_location(
    latitude=location.latitude,
    longitude=location.longitude,
    recipient=location.recipient,
    name=location.name,
    address=location.address
)

# Quick location sharing (direct method)
await self.messenger.send_location(
    latitude=37.7749,
    longitude=-122.4194,
    recipient_phone,
    name="Our Main Store",
    address="123 Market Street, San Francisco, CA"
)
```

### `send_location_request()`

Request user's location using helper models:

```python
from wappa.models import LocationRequestMessage

# Using LocationRequestMessage model (validates text length)
location_request = LocationRequestMessage(
    recipient=recipient_phone,
    body="Please share your location so we can find the nearest store and provide accurate delivery estimates."
)

await self.messenger.send_location_request(
    location_request.body,
    location_request.recipient
)

# Quick location request (direct method)
await self.messenger.send_location_request(
    "Please share your location so we can find the nearest store.",
    recipient_phone
)
```

---

## Media Handler API

Access advanced media operations through `self.messenger.media_handler`:

### Upload Media

```python
# Upload and get media_id for reuse
upload_result = await self.messenger.media_handler.upload_media("logo.png")
if upload_result.success:
    # Reuse the media_id multiple times
    media_id = upload_result.media_id
    
    await self.messenger.send_image(media_id, recipient1)
    await self.messenger.send_image(media_id, recipient2)
    await self.messenger.send_image(media_id, recipient3)

# Upload from bytes
with open("document.pdf", "rb") as f:
    file_data = f.read()

upload_result = await self.messenger.media_handler.upload_media_from_bytes(
    file_data, 
    "application/pdf", 
    "catalog.pdf"
)
```

### Download Media

```python
# Download user-sent media to process it
async def handle_message(self, webhook):
    if webhook.type == "image":
        # Get the media_id from the webhook
        media_id = webhook.image.id
        
        # Download as bytes for processing
        download_result = await self.messenger.media_handler.get_media_as_bytes(media_id)
        if download_result.success:
            # Process the image data
            image_data = download_result.file_data
            processed_image = await process_image(image_data)
            
            # Send processed result back
            await self.messenger.send_text("Image processed successfully! ✅", webhook.user.user_id)

# Download to temporary file
async with self.messenger.media_handler.download_media_tempfile(media_id, '.jpg') as result:
    if result.success:
        # File automatically cleaned up when context exits
        processed_file = await process_image_file(result.file_path)
```

### Media Handler Methods

| Method | Purpose | Returns |
|--------|---------|---------|
| `upload_media(file_path)` | Upload file, get media_id | `MediaUploadResult` |
| `upload_media_from_bytes(data, type, name)` | Upload from memory | `MediaUploadResult` |
| `get_media_info(media_id)` | Get media URL and metadata | `MediaInfoResult` |
| `get_media_as_bytes(media_id)` | Download to memory | `MediaDownloadResult` |
| `download_media(media_id, path)` | Download to file | `MediaDownloadResult` |
| `download_media_tempfile(media_id)` | Download to temp file | Context manager |
| `delete_media(media_id)` | Delete from WhatsApp servers | `MediaDeleteResult` |
| `validate_media_type(mime_type)` | Check if MIME type supported | `bool` |
| `validate_file_size(size, mime_type)` | Check if file size allowed | `bool` |

---

## Reading Messages

### `mark_as_read()`

Mark messages as read (good UX practice):

```python
# Simple mark as read
await self.messenger.mark_as_read(message_id)

# Mark as read with typing indicator
await self.messenger.mark_as_read(message_id, typing=True)
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message_id` | `str` | ✅ | WhatsApp message ID to mark as read |
| `typing` | `bool` | ❌ | Show typing indicator (default: False) |

---

## Error Handling

All messaging methods return `MessageResult` objects. Always check for success:

```python
# Good error handling
result = await self.messenger.send_text("Hello!", recipient_phone)
if result.success:
    self.logger.info(f"Message sent! ID: {result.message_id}")
else:
    self.logger.error(f"Failed to send message: {result.error}")
    
    # Handle specific errors
    if "401" in str(result.error):
        # Authentication issue
        await self.messenger.send_text(
            "Service temporarily unavailable. Please try again.",
            recipient_phone
        )
    elif "rate limit" in str(result.error).lower():
        # Rate limited - wait and retry
        await asyncio.sleep(1)
        # Retry logic here
```

### Common Error Codes

| Error | Meaning | Solution |
|-------|---------|----------|
| `FILE_NOT_FOUND` | Media file doesn't exist | Check file path |
| `MIME_TYPE_UNSUPPORTED` | Invalid file format | Use supported formats |
| `FILE_SIZE_EXCEEDED` | File too large | Compress or use smaller file |
| `INVALID_RECIPIENT` | Bad phone number | Validate phone format |
| `RATE_LIMIT_EXCEEDED` | Too many messages | Implement backoff |
| `AUTHENTICATION_FAILED` | Invalid WhatsApp token | Check credentials |

---

## Rate Limiting & Best Practices

### WhatsApp Rate Limits

#### Business-Initiated Messages Only (Templates)
- **Unverified accounts**: 250 business-initiated messages/day
- **Verified accounts**: 1,000 business-initiated messages/day (Tier 1)
- **Higher tiers**: 10,000 (Tier 2), 100,000 (Tier 3), unlimited (Tier 4)
- **Tier upgrades**: Automatic based on message quality and volume

#### Customer Service Window (User-Initiated)
- **No limits** when user starts or continues conversation
- **24-hour window** after user's last message
- **Unlimited responses** during active conversations

For complete details, see [WhatsApp Business Platform Messaging Limits](https://developers.facebook.com/docs/whatsapp/messaging-limits/)

### Best Practices

#### 1. Batch Operations
```python
# ❌ Don't send messages one by one
for user in users:
    await self.messenger.send_text("Update!", user.phone)

# ✅ Batch with delays
for i, user in enumerate(users):
    await self.messenger.send_text("Update!", user.phone)
    if i % 10 == 0:  # Pause every 10 messages
        await asyncio.sleep(1)
```

#### 2. Cache Media IDs
```python
# ❌ Upload same image multiple times
for customer in customers:
    await self.messenger.send_image("logo.png", customer.phone)

# ✅ Upload once, reuse media_id
upload_result = await self.messenger.media_handler.upload_media("logo.png")
if upload_result.success:
    logo_media_id = upload_result.media_id
    
    for customer in customers:
        await self.messenger.send_image(logo_media_id, customer.phone)
```

#### 3. Smart Error Recovery
```python
async def send_with_retry(self, message_func, max_retries=3):
    for attempt in range(max_retries):
        try:
            result = await message_func()
            if result.success:
                return result
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            await asyncio.sleep(2 ** attempt)  # Exponential backoff
```

#### 4. Message Sequencing
```python
# ❌ Overwhelming users
await self.messenger.send_text("Welcome!", user_id)
await self.messenger.send_image("logo.jpg", user_id)  
await self.messenger.send_button_message("What next?", buttons, user_id)

# ✅ Spaced interaction
await self.messenger.send_text("Welcome to our store! 👋", user_id)
# Wait for user response or trigger, then continue...
```

---

## Complete API Reference

### MessageResult Object

Every messaging method returns a `MessageResult`:

```python
class MessageResult:
    success: bool           # True if message sent successfully
    message_id: str | None  # WhatsApp message ID for tracking  
    recipient: str         # Recipient identifier
    error: str | None      # Error message if failed
    error_code: str | None # Error code for programmatic handling
    platform: str          # Always "whatsapp"
    tenant_id: str         # Your phone_number_id
```

### Usage Example

```python
async def send_welcome_sequence(self, user_id: str):
    # Send welcome text
    text_result = await self.messenger.send_text(
        "Welcome to our store! 🎉", 
        user_id
    )
    
    if not text_result.success:
        self.logger.error(f"Failed to send welcome: {text_result.error}")
        return
    
    # Send store image
    image_result = await self.messenger.send_image(
        "assets/store-front.jpg",
        user_id,
        caption="Our beautiful store location 🏪"
    )
    
    # Show menu options
    from wappa.models import ReplyButton
    
    buttons = [
        ReplyButton(id="browse", title="🛍️ Browse Products"),
        ReplyButton(id="support", title="💬 Get Support"),
        ReplyButton(id="location", title="📍 Store Location")
    ]
    
    button_result = await self.messenger.send_button_message(
        "What would you like to do first?",
        buttons,
        user_id,
        footer="We're here to help!"
    )
    
    if button_result.success:
        self.logger.info(f"Welcome sequence completed for {user_id}")
```

---

## Auto-Generated API Documentation

Wappa automatically generates interactive API documentation for all messaging endpoints! When you run your conversational app, visit:

**`http://localhost:8000/docs`** (or your custom port)

This gives you a complete interactive API explorer where you can:

### Available API Endpoints

| Endpoint Category | Endpoints | What You Can Do |
|------------------|-----------|-----------------|
| **Messages** | `/api/whatsapp/messages/` | Send text, mark as read, get limits |
| **Media** | `/api/whatsapp/media/` | Upload, send images/videos/audio/docs, download |
| **Interactive** | `/api/whatsapp/interactive/` | Send buttons, lists, call-to-action messages |
| **Templates** | `/api/whatsapp/templates/` | Send business templates, get status |
| **Specialized** | `/api/whatsapp/specialized/` | Send contacts, locations, location requests |
| **Webhooks** | `/api/webhooks/` | Handle incoming WhatsApp webhooks |
| **Health** | `/health` | Service health checks and monitoring |

### Interactive Features

**🧪 Test Messages Directly**: Try any endpoint right from your browser
- Upload media files and get media_ids
- Send test messages to your WhatsApp number  
- Validate parameters before sending
- See real API responses and error messages

**📋 Copy cURL Commands**: Get ready-to-use cURL commands for external integration

**🔍 Explore Data Models**: See all request/response schemas with examples

### Example API Usage

```bash
# Send text message via API
curl -X POST "http://localhost:8000/api/whatsapp/messages/send-text" \
     -H "Content-Type: application/json" \
     -d '{
       "text": "Hello from the API!",
       "recipient": "+1234567890"
     }'

# Upload media and get media_id
curl -X POST "http://localhost:8000/api/whatsapp/media/upload" \
     -F "file=@product.jpg" \
     -F "media_type=image/jpeg"

# Send interactive buttons
curl -X POST "http://localhost:8000/api/whatsapp/interactive/send-buttons" \
     -H "Content-Type: application/json" \
     -d '{
       "body": "Choose an option:",
       "buttons": [
         {"id": "yes", "title": "✅ Yes"},
         {"id": "no", "title": "❌ No"}
       ],
       "recipient": "+1234567890"
     }'
```

**Why This Matters**: You can integrate Wappa with external systems, build admin panels, or test messages without writing code!

!!! tip "Pro Tip"
    Use the `/docs` interface to test your message flows before integrating them into your conversational app. It's much faster than coding and testing!

---

## What's Next?

Now you know every messaging method in Wappa! Ready to handle responses?

- **[Event System Guide](../concepts/event-system.md)** - Handle user responses and build conversation flows
- **[Webhook Data Reference](webhooks.md)** - Understand the data WhatsApp sends you
- **[Configuration Guide](../concepts/configuration.md)** - Set up your messaging credentials

---

<div style="text-align: center; margin: 3rem 0; padding: 2rem; border: 1px solid var(--md-default-fg-color--lightest); border-radius: 12px; background: transparent;">
    <h3 style="margin: 0 0 1rem 0;">📨 Messaging API Master!</h3>
    <p style="margin: 0 0 1.5rem 0; opacity: 0.8;">
        You can now send any type of WhatsApp message. Time to handle user responses!
    </p>
    
    <a href="../concepts/event-system" class="md-button md-button--primary" style="
        background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
        border: none;
        border-radius: 8px;
        padding: 12px 32px;
        font-size: 16px;
        font-weight: 600;
        text-decoration: none;
        color: white;
        box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
        transition: all 0.3s ease;
        display: inline-block;
        margin: 0.5rem;
    ">🔄 Learn Event Handling</a>
</div>