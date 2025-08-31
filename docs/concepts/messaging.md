# Sending Messages - The Complete Guide

Everything you can send to users (and how). No theory, just working code you can copy and paste.

## The 30-Second Version

With Wappa, sending messages is stupidly simple:

```python
from wappa import WappaEventHandler

class MyApp(WappaEventHandler):
    async def handle_message(self, webhook):
        # Text message
        await self.messenger.send_text("Hello there!", webhook.user.user_id)
        
        # Image with caption
        await self.messenger.send_image(
            "https://example.com/image.jpg", 
            webhook.user.user_id, 
            caption="Check this out!"
        )
        
        # Interactive buttons
        from wappa.models import ReplyButton
        buttons = [
            ReplyButton(id="yes", title="Yes"),
            ReplyButton(id="no", title="No")
        ]
        await self.messenger.send_button_message(
            "Do you like this?", 
            buttons, 
            webhook.user.user_id
        )
```

That's it. Everything else is just variations on these patterns.

---

## Message Types: From Simple to Spectacular

### 1. Text Messages (The Foundation)

The bread and butter of WhatsApp conversations:

```python
# Simple text
await self.messenger.send_text("Hello!", recipient_phone)

# Multi-line text  
await self.messenger.send_text(
    """Welcome to our service!
    
Here's what you can do:
• Get support
• Check your order
• Browse products""", 
    recipient_phone
)

# Text with emojis (WhatsApp loves emojis)
await self.messenger.send_text("🎉 Welcome! Thanks for joining us! 🚀", recipient_phone)
```

**Pro Tips:**

- Keep messages under 4096 characters
- Use emojis liberally - WhatsApp users expect them
- Break long messages into multiple shorter ones
- Use line breaks for better readability

### 2. Media Messages (Pictures, Videos, Audio)

Show don't tell - media messages get 10x more engagement:

#### Images

```python
# Send image from URL
await self.messenger.send_image(
    "https://example.com/product.jpg",
    recipient_phone,
    caption="Our latest product! 📸"
)

# Send local image file
await self.messenger.send_image(
    "assets/welcome_image.jpg",  # Local file path
    recipient_phone,
    caption="Welcome to our store! 🛍️"
)

# Send using media_id (for already uploaded media)
await self.messenger.send_image(
    "1234567890123456",  # media_id from previous upload
    recipient_phone,
    caption="Reusing uploaded image! ♻️"
)

# Send image without caption
await self.messenger.send_image(
    "https://example.com/logo.png",
    recipient_phone
)
```

#### Videos

```python
# Short promotional video from URL
await self.messenger.send_video(
    "https://example.com/promo.mp4",
    recipient_phone,
    caption="See our product in action! 🎬"
)

# Local video file
await self.messenger.send_video(
    "videos/tutorial.mp4",
    recipient_phone,
    caption="Quick tutorial - 30 seconds ⏱️"
)

# Reuse uploaded video using media_id
await self.messenger.send_video(
    "9876543210987654",  # media_id from Meta upload
    recipient_phone,
    caption="Product demo (reused media) 🎥"
)
```

#### Voice Messages & Audio

```python
# Voice message from local file (great for personal touch)
await self.messenger.send_audio(
    "audio/personal_greeting.ogg",
    recipient_phone
)

# Music or podcast from URL
await self.messenger.send_audio(
    "https://example.com/podcast_episode.mp3",
    recipient_phone
)

# Reuse uploaded audio using media_id
await self.messenger.send_audio(
    "1111222233334444",  # media_id from Meta upload
    recipient_phone
)
```

#### Documents

```python
# PDF catalog from local file
await self.messenger.send_document(
    "catalogs/product_catalog.pdf",
    recipient_phone,
    caption="Our complete product catalog 📋"
)

# Price list from URL
await self.messenger.send_document(
    "https://example.com/prices.xlsx",
    recipient_phone,
    caption="Updated pricing - effective immediately"
)

# Reuse uploaded document using media_id
await self.messenger.send_document(
    "5555666677778888",  # media_id from Meta upload
    recipient_phone,
    caption="Product manual (cached) 📄"
)
```

### Media Specifications & Limits

| Media Type | Max Size | Supported Formats | Recommended Use | Caption Support |
|------------|----------|-------------------|-----------------|-----------------|
| **Images** | 5MB | JPG, PNG | Photos, graphics, product images | ✅ Yes |
| **Videos** | 16MB | MP4, 3GP | Product demos, tutorials, marketing | ✅ Yes |
| **Audio** | 16MB | AAC, AMR, MP3, MP4, OGG | Voice messages, music, podcasts | ❌ No |
| **Documents** | 100MB | PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, TXT | Catalogs, price lists, forms | ✅ Yes |
| **Stickers** | 500KB | WebP (animated), 100KB (static) | Fun reactions, branding | ❌ No |

**Media Best Practices:**

- **Use `media_id`** for frequently sent content (logos, catalogs) - upload once, send many times
- **Optimize file sizes** - smaller files send faster and use less user data
- **Add captions** when supported - they boost engagement significantly
- **Choose the right format** - MP4 for videos, JPG for photos, PNG for graphics with text
- **Test on mobile** - ensure media displays well on small screens

!!! tip "Performance Tip"
    Upload popular media to Meta once and reuse the `media_id`. This saves bandwidth, improves delivery speed, and reduces API costs.

For complete media API details, see **[Messaging API Reference](../api/messaging.md)**.

---

## Interactive Messages: The Secret Sauce 🔥

This is where Wappa gets really powerful. Interactive messages turn conversations into workflows.

### Button Messages (Quick Replies)

Perfect for yes/no questions, menu options, or quick actions:

```python
from wappa.models import ReplyButton

# Simple Yes/No question
yes_no_buttons = [
    ReplyButton(id="confirm_yes", title="Yes, please! ✅"),
    ReplyButton(id="confirm_no", title="No, thanks ❌")
]

await self.messenger.send_button_message(
    "Would you like to receive our daily newsletter?",
    yes_no_buttons,
    recipient_phone
)

# Product category selection
category_buttons = [
    ReplyButton(id="electronics", title="📱 Electronics"),
    ReplyButton(id="clothing", title="👕 Clothing"), 
    ReplyButton(id="books", title="📚 Books")
]

await self.messenger.send_button_message(
    "What are you shopping for today?",
    category_buttons,
    recipient_phone
)

# Customer service menu
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

**Button Message Rules:**

- Maximum 3 buttons per message
- Button titles: 20 characters max
- Button IDs: 256 characters max (use descriptive IDs!)
- Headers and footers are optional but recommended

!!! info "API Details"
    For complete button message parameters and response handling, see **[Messaging API Reference](../api/messaging.md#button-messages)**.

### List Messages (When You Have Many Options)

When 3 buttons aren't enough, use lists:

```python
from wappa.models import ListSection, ListRow

# Product categories with subcategories
electronics_section = ListSection(
    title="📱 Electronics",
    rows=[
        ListRow(id="phones", title="Smartphones", description="Latest iPhone, Samsung, Google"),
        ListRow(id="laptops", title="Laptops", description="MacBook, ThinkPad, Surface"),
        ListRow(id="accessories", title="Accessories", description="Cases, chargers, headphones")
    ]
)

clothing_section = ListSection(
    title="👕 Clothing", 
    rows=[
        ListRow(id="mens", title="Men's Fashion", description="Shirts, pants, shoes"),
        ListRow(id="womens", title="Women's Fashion", description="Dresses, accessories, shoes"),
        ListRow(id="kids", title="Kids' Clothes", description="Fun and comfortable styles")
    ]
)

await self.messenger.send_list_message(
    "What would you like to browse?",
    [electronics_section, clothing_section],
    "🛍️ Browse Categories",
    recipient_phone,
    header="Welcome to our store!",
    footer="Tap to explore our collection"
)

# Restaurant menu example
starters_section = ListSection(
    title="🥗 Starters",
    rows=[
        ListRow(id="caesar_salad", title="Caesar Salad", description="Fresh romaine, parmesan, croutons"),
        ListRow(id="soup_day", title="Soup of the Day", description="Ask your server for today's special"),
        ListRow(id="bruschetta", title="Bruschetta", description="Toasted bread with fresh tomatoes")
    ]
)

mains_section = ListSection(
    title="🍝 Main Courses",
    rows=[
        ListRow(id="pasta_carbonara", title="Pasta Carbonara", description="Traditional recipe with pancetta"),
        ListRow(id="grilled_salmon", title="Grilled Salmon", description="With seasonal vegetables"),
        ListRow(id="chicken_parmesan", title="Chicken Parmesan", description="Breaded cutlet with marinara")
    ]
)

await self.messenger.send_list_message(
    "What would you like to order?",
    [starters_section, mains_section],
    "📋 View Menu",
    recipient_phone,
    header="Tony's Italian Restaurant",
    footer="Buon appetito! 🇮🇹"
)
```

**List Message Rules:**

- Maximum 10 sections per list
- Maximum 10 rows per section
- Section titles: 24 characters max
- Row titles: 24 characters max
- Row descriptions: 72 characters max
- All row IDs must be unique across the entire list

!!! info "API Details"
    For complete list message structure and validation rules, see **[Messaging API Reference](../api/messaging.md#list-messages)**.

### Call-to-Action Messages (Drive Traffic)

Perfect for sending users to your website, app, or external content:

```python
# Drive traffic to your website
await self.messenger.send_cta_message(
    "Check out our new summer collection! Fresh styles, perfect for the season.",
    "🛍️ Shop Now",
    "https://yourstore.com/summer-collection",
    recipient_phone,
    header="🌞 Summer Sale",
    footer="Free shipping on orders over $50"
)

# Link to app download
await self.messenger.send_cta_message(
    "Download our mobile app for exclusive deals and faster checkout.",
    "📱 Download App", 
    "https://apps.apple.com/app/yourapp",
    recipient_phone,
    header="Get Our Mobile App"
)

# Link to support portal
await self.messenger.send_cta_message(
    "Need help with your order? Our support portal has tracking, returns, and FAQs.",
    "🆘 Get Support",
    "https://support.yourstore.com",
    recipient_phone
)
```

**Why Interactive Messages Are Amazing:**

- **Higher engagement**: Users are 3x more likely to respond
- **Better UX**: No typing errors, faster interactions
- **Analytics**: You can track which buttons get clicked
- **Professional look**: Makes your conversational app feel polished and modern

---

## Advanced Messaging Patterns

### Conversation Flows with State

Chain interactive messages together for complex workflows:

```python
from wappa import WappaEventHandler
from wappa.models import ReplyButton, ListSection, ListRow

class OrderApp(WappaEventHandler):
    async def handle_message(self, webhook):
        user_id = webhook.user.user_id
        message_text = webhook.get_message_text()
        
        # Get user's current step in the ordering process
        user_cache = self.cache_factory.create_user_cache()
        current_step = await user_cache.get("order_step") or "start"
        
        if current_step == "start":
            await self._show_main_menu(user_id)
        elif current_step == "category_selected":
            await self._show_products(user_id, webhook)
        elif current_step == "product_selected":
            await self._confirm_order(user_id, webhook)
    
    async def _show_main_menu(self, user_id):
        buttons = [
            ReplyButton(id="browse_products", title="🛍️ Browse Products"),
            ReplyButton(id="track_order", title="📦 Track Order"),
            ReplyButton(id="support", title="💬 Support")
        ]
        
        await self.messenger.send_button_message(
            "Welcome to our store! What would you like to do?",
            buttons,
            user_id
        )
        
        # Save state
        user_cache = self.cache_factory.create_user_cache()
        await user_cache.set("order_step", "menu_shown")
    
    async def _show_products(self, user_id, webhook):
        # Handle button click
        if webhook.interactive and webhook.interactive.button_reply:
            button_id = webhook.interactive.button_reply.id
            
            if button_id == "browse_products":
                # Show product categories
                sections = [
                    ListSection(
                        title="📱 Electronics",
                        rows=[
                            ListRow(id="iphone_15", title="iPhone 15 Pro", description="Latest Apple smartphone"),
                            ListRow(id="samsung_s24", title="Samsung S24", description="Android flagship phone"),
                        ]
                    ),
                    ListSection(
                        title="💻 Computers", 
                        rows=[
                            ListRow(id="macbook_air", title="MacBook Air M3", description="Lightweight powerhouse"),
                            ListRow(id="dell_xps", title="Dell XPS 13", description="Premium Windows laptop"),
                        ]
                    )
                ]
                
                await self.messenger.send_list_message(
                    "What are you looking for?",
                    sections,
                    "Browse Products",
                    user_id
                )
                
                user_cache = self.cache_factory.create_user_cache()
                await user_cache.set("order_step", "category_selected")
```

### Handling Interactive Responses

When users click buttons or select from lists:

```python
async def handle_message(self, webhook):
    # Check if this is an interactive response
    if webhook.interactive:
        if webhook.interactive.button_reply:
            # Handle button click
            button_id = webhook.interactive.button_reply.id
            button_title = webhook.interactive.button_reply.title
            
            await self.messenger.send_text(
                f"You clicked: {button_title}",
                webhook.user.user_id
            )
            
        elif webhook.interactive.list_reply:
            # Handle list selection
            selected_id = webhook.interactive.list_reply.id
            selected_title = webhook.interactive.list_reply.title
            
            await self.messenger.send_text(
                f"You selected: {selected_title}",
                webhook.user.user_id
            )
    else:
        # Handle regular text message
        message_text = webhook.get_message_text()
        await self.messenger.send_text(f"You said: {message_text}", webhook.user.user_id)
```

### Smart Media Messaging

Combine media with interactive elements for maximum impact:

```python
# Product showcase with purchase button
await self.messenger.send_image(
    "https://yourstore.com/products/summer-dress.jpg",
    recipient_phone,
    caption="Summer Floral Dress - $89.99\n✨ 30% off this weekend only!"
)

# Follow with purchase options
purchase_buttons = [
    ReplyButton(id="buy_now", title="💳 Buy Now"),
    ReplyButton(id="add_cart", title="🛒 Add to Cart"),
    ReplyButton(id="more_info", title="ℹ️ More Info")
]

await self.messenger.send_button_message(
    "Interested in this dress?",
    purchase_buttons,
    recipient_phone
)

# Video demo with interactive follow-up
await self.messenger.send_video(
    "https://yourstore.com/demos/dress-styling.mp4",
    recipient_phone,
    caption="3 ways to style this dress 👗"
)

styling_buttons = [
    ReplyButton(id="casual_style", title="👕 Casual Look"),
    ReplyButton(id="formal_style", title="💼 Office Look"),
    ReplyButton(id="party_style", title="🎉 Party Look")
]

await self.messenger.send_button_message(
    "Which styling video would you like to see?",
    styling_buttons,
    recipient_phone
)
```

---

## The Complete Message Type Reference

### Basic Messages

```python
# Text message
await self.messenger.send_text("Hello world!", recipient_phone)

# Mark message as read (good UX practice)
await self.messenger.mark_as_read(message_id)
```

!!! info "API Reference"
    For all available messaging methods and parameters, see **[Messaging API Reference](../api/messaging.md)**.

### Media Messages

```python
# Image
await self.messenger.send_image(
    image_url_or_path,
    recipient_phone,
    caption="Optional caption"
)

# Video  
await self.messenger.send_video(
    video_url_or_path,
    recipient_phone,
    caption="Optional caption"
)

# Audio (voice messages or music)
await self.messenger.send_audio(
    audio_url_or_path,
    recipient_phone
)

# Document (PDF, Excel, Word, etc.)
await self.messenger.send_document(
    document_url_or_path,
    recipient_phone,
    caption="Optional caption"
)

# Sticker (fun and engaging)
await self.messenger.send_sticker(
    sticker_url_or_path,
    recipient_phone
)
```

### Interactive Messages

```python
from wappa.models import ReplyButton, ListSection, ListRow

# Button message (max 3 buttons)
buttons = [
    ReplyButton(id="option1", title="Option 1"),
    ReplyButton(id="option2", title="Option 2"),
    ReplyButton(id="option3", title="Option 3")
]

await self.messenger.send_button_message(
    "Choose an option:",
    buttons,
    recipient_phone,
    header="Optional header text",
    footer="Optional footer text"
)

# List message (max 10 sections, 10 rows each)
sections = [
    ListSection(
        title="Section 1",
        rows=[
            ListRow(id="row1", title="Row 1", description="Description"),
            ListRow(id="row2", title="Row 2", description="Description")
        ]
    )
]

await self.messenger.send_list_message(
    "Select from our options:",
    sections,
    "View Options",  # Button text
    recipient_phone,
    header="Optional header",
    footer="Optional footer"
)

# Call-to-Action message (external links)
await self.messenger.send_cta_message(
    "Visit our website for the full catalog!",
    "🌐 Visit Website",
    "https://yourwebsite.com",
    recipient_phone,
    header="Optional header",
    footer="Optional footer"
)
```

### Specialized Messages

```python
# Share contact information
await self.messenger.send_contact(
    contact_name="John Doe",
    contact_phone="1234567890",
    recipient_phone,
    contact_email="john@example.com"  # Optional
)

# Share location
await self.messenger.send_location(
    latitude=37.7749,
    longitude=-122.4194,
    recipient_phone,
    name="Our Store Location",
    address="123 Main St, San Francisco, CA"
)

# Request user's location
await self.messenger.send_location_request(
    "Please share your location so we can find the nearest store.",
    recipient_phone
)
```

---

## WhatsApp Templates (Business Messages)

Templates are pre-approved messages for business communications. Great for notifications, confirmations, and updates:

```python
# Simple text template
await self.messenger.send_text_template(
    template_name="order_confirmation",
    recipient_phone,
    parameters=["John", "ORD123", "$89.99"]  # Values for {{1}}, {{2}}, {{3}}
)

# Template with media header
await self.messenger.send_media_template(
    template_name="product_announcement", 
    recipient_phone,
    media_type="image",
    media_url="https://yourstore.com/product-image.jpg",
    parameters=["New Summer Collection", "30% OFF"]
)

# Template with location
await self.messenger.send_location_template(
    template_name="store_location",
    recipient_phone,
    latitude=37.7749,
    longitude=-122.4194,
    parameters=["Downtown Store", "123 Main St"]
)
```

**Template Requirements:**

- Templates must be pre-approved by WhatsApp
- Use for transactional messages (confirmations, alerts, updates)
- Parameters replace {{1}}, {{2}}, {{3}} placeholders
- Can include buttons, headers, and dynamic content

!!! info "Template API"
    For template message structure and approval process, see **[Messaging API Reference](../api/messaging.md#template-messages)**.

---

## Real-World Usage Patterns

### E-commerce App Example

```python
class EcommerceAppHandler(WappaEventHandler):
    async def handle_message(self, webhook):
        user_id = webhook.user.user_id
        
        if webhook.interactive and webhook.interactive.button_reply:
            await self._handle_button_click(webhook)
        elif webhook.interactive and webhook.interactive.list_reply:
            await self._handle_list_selection(webhook)
        else:
            await self._handle_text_message(webhook)
    
    async def _handle_text_message(self, webhook):
        message = webhook.get_message_text().lower()
        user_id = webhook.user.user_id
        
        if "help" in message or "start" in message:
            await self._show_main_menu(user_id)
        elif "products" in message:
            await self._show_product_categories(user_id)
        elif "contact" in message:
            await self._show_contact_info(user_id)
        else:
            await self._show_help_message(user_id)
    
    async def _show_main_menu(self, user_id):
        buttons = [
            ReplyButton(id="browse_products", title="🛍️ Shop Now"),
            ReplyButton(id="track_order", title="📦 Track Order"),
            ReplyButton(id="customer_service", title="💬 Support")
        ]
        
        await self.messenger.send_button_message(
            "Welcome to our store! What would you like to do?",
            buttons,
            user_id,
            header="🏪 Welcome!",
            footer="We're here to help you find what you need"
        )
    
    async def _show_product_categories(self, user_id):
        # Show product image first
        await self.messenger.send_image(
            "https://yourstore.com/featured-products.jpg",
            user_id,
            caption="Featured products this week! 🌟"
        )
        
        # Then show categories
        sections = [
            ListSection(
                title="👕 Clothing",
                rows=[
                    ListRow(id="mens_clothing", title="Men's Fashion", description="Shirts, pants, accessories"),
                    ListRow(id="womens_clothing", title="Women's Fashion", description="Dresses, tops, shoes"),
                    ListRow(id="kids_clothing", title="Kids' Fashion", description="Fun styles for children")
                ]
            ),
            ListSection(
                title="📱 Electronics", 
                rows=[
                    ListRow(id="smartphones", title="Smartphones", description="Latest iPhone, Samsung"),
                    ListRow(id="laptops", title="Laptops", description="MacBook, Dell, HP"),
                    ListRow(id="accessories", title="Tech Accessories", description="Cases, chargers, cables")
                ]
            )
        ]
        
        await self.messenger.send_list_message(
            "What type of products are you looking for?",
            sections,
            "Browse Categories",
            user_id,
            footer="Tap to explore our collection"
        )
```

### Customer Service App Example

```python
class CustomerServiceHandler(WappaEventHandler):
    async def handle_message(self, webhook):
        user_id = webhook.user.user_id
        
        if webhook.interactive and webhook.interactive.button_reply:
            button_id = webhook.interactive.button_reply.id
            
            if button_id == "track_order":
                await self._handle_order_tracking(user_id)
            elif button_id == "return_item":
                await self._handle_returns(user_id)
            elif button_id == "talk_human":
                await self._transfer_to_human(user_id)
        else:
            await self._show_support_menu(user_id)
    
    async def _handle_order_tracking(self, user_id):
        await self.messenger.send_text(
            "Please provide your order number (e.g., ORD123456):",
            user_id
        )
        
        # Set state to expect order number
        user_cache = self.cache_factory.create_user_cache()
        await user_cache.set("expecting", "order_number")
    
    async def _transfer_to_human(self, user_id):
        # Send confirmation
        await self.messenger.send_text(
            "🤝 Connecting you with a human agent...\n\nAverage wait time: 2 minutes",
            user_id
        )
        
        # Send agent contact
        await self.messenger.send_contact(
            contact_name="Sarah - Customer Support",
            contact_phone="1234567890",
            recipient_phone=user_id,
            contact_email="sarah@yourcompany.com"
        )
        
        # Follow up with store location if relevant
        await self.messenger.send_location(
            latitude=37.7749,
            longitude=-122.4194,
            recipient_phone=user_id,
            name="Our Main Store",
            address="123 Customer Service Blvd, San Francisco, CA"
        )
```

---

## Best Practices from Real Usage

### 1. Message Sequencing

**Don't overwhelm users** - space out your messages:

```python
# ❌ Bad: Send everything at once
await self.messenger.send_text("Welcome!", user_id)
await self.messenger.send_image("welcome.jpg", user_id)
await self.messenger.send_button_message("What next?", buttons, user_id)

# ✅ Good: Give users time to read
await self.messenger.send_text("Welcome to our store! 👋", user_id)

# Wait for user response or trigger, then:
await self.messenger.send_image(
    "featured-products.jpg", 
    user_id, 
    caption="Check out what's new this week! ✨"
)

# Then show options:
buttons = [ReplyButton(id="browse", title="🛍️ Browse")]
await self.messenger.send_button_message("Ready to shop?", buttons, user_id)
```

### 2. Error Handling That Helps Users

```python
async def send_product_info(self, product_id: str, user_id: str):
    try:
        product = await self.get_product(product_id)
        
        await self.messenger.send_image(
            product.image_url,
            user_id,
            caption=f"{product.name} - ${product.price}"
        )
        
    except ProductNotFound:
        # Don't just say "error" - give them options
        buttons = [
            ReplyButton(id="browse_all", title="🛍️ Browse All"),
            ReplyButton(id="search_again", title="🔍 Search Again"),
            ReplyButton(id="talk_human", title="💬 Get Help")
        ]
        
        await self.messenger.send_button_message(
            "Sorry, I couldn't find that product. What would you like to do?",
            buttons,
            user_id
        )
        
    except Exception as e:
        self.logger.error(f"Error sending product info: {e}")
        
        await self.messenger.send_text(
            "Something went wrong on our end. Our team has been notified. Please try again in a moment.",
            user_id
        )
```

### 3. Make Messages Scannable

**Use formatting to make messages easy to scan:**

```python
# ❌ Hard to read
await self.messenger.send_text(
    "Your order ORD123 has been confirmed. Total: $89.99. Items: iPhone case, screen protector. Shipping to 123 Main St. Expected delivery: March 15.",
    user_id
)

# ✅ Easy to scan
await self.messenger.send_text(
    """🎉 Order Confirmed!

📋 Order: ORD123
💰 Total: $89.99

📦 Items:
• iPhone 15 Pro Case - Blue
• Screen Protector - Clear

🚚 Shipping to:
123 Main St, San Francisco, CA

📅 Expected delivery: March 15""",
    user_id
)
```

### 4. Progressive Disclosure

**Start simple, add complexity as needed:**

```python
# Level 1: Simple menu
main_buttons = [
    ReplyButton(id="shop", title="🛍️ Shop"),
    ReplyButton(id="support", title="💬 Support"),
    ReplyButton(id="account", title="👤 Account")
]

# Level 2: Detailed options (only after they choose "support")
support_sections = [
    ListSection(
        title="📦 Orders",
        rows=[
            ListRow(id="track_order", title="Track My Order", description="Get real-time updates"),
            ListRow(id="cancel_order", title="Cancel Order", description="Cancel recent orders"),
            ListRow(id="return_item", title="Return Item", description="Start return process")
        ]
    ),
    ListSection(
        title="💬 Help",
        rows=[
            ListRow(id="faq", title="FAQ", description="Frequently asked questions"),
            ListRow(id="live_chat", title="Live Chat", description="Talk to a human agent"),
            ListRow(id="call_us", title="Call Us", description="Get our phone number")
        ]
    )
]
```

### 5. Confirmation Patterns

**Always confirm important actions:**

```python
# After user selects "cancel_order"
cancel_buttons = [
    ReplyButton(id="confirm_cancel", title="✅ Yes, Cancel"),
    ReplyButton(id="keep_order", title="❌ Keep Order"),
    ReplyButton(id="modify_order", title="✏️ Modify Instead")
]

await self.messenger.send_button_message(
    f"Are you sure you want to cancel order {order_id}?\n\n⚠️ This action cannot be undone.",
    cancel_buttons,
    user_id,
    header="🚨 Confirm Cancellation"
)
```

---

## Message Templates for Copy-Paste

### Welcome Series

```python
# Welcome message with next steps
welcome_buttons = [
    ReplyButton(id="get_started", title="🚀 Get Started"),
    ReplyButton(id="learn_more", title="📖 Learn More"),
    ReplyButton(id="contact_us", title="💬 Contact Us")
]

await self.messenger.send_button_message(
    f"Welcome to {business_name}! 🎉\n\nWe're excited to have you here. What would you like to do first?",
    welcome_buttons,
    user_id,
    header=f"👋 Welcome to {business_name}!"
)
```

### Order Confirmations

```python
# Order confirmation with tracking
await self.messenger.send_text(
    f"""✅ Order Confirmed!

📋 Order #{order_number}
💰 Total: ${total_amount}
📅 Expected delivery: {delivery_date}

📦 We'll send tracking info when your order ships!""",
    user_id
)

# Follow with options
order_buttons = [
    ReplyButton(id="view_order", title="👀 View Order"),
    ReplyButton(id="change_delivery", title="📍 Change Address"),
    ReplyButton(id="cancel_order", title="❌ Cancel Order")
]

await self.messenger.send_button_message(
    "Need to make any changes?",
    order_buttons,
    user_id
)
```

### Support Escalation

```python
# When app can't help
escalation_buttons = [
    ReplyButton(id="try_again", title="🔄 Try Again"),
    ReplyButton(id="talk_human", title="👤 Talk to Human"),
    ReplyButton(id="call_us", title="📞 Call Us")
]

await self.messenger.send_button_message(
    "I'm having trouble understanding your request. How would you prefer to get help?",
    escalation_buttons,
    user_id,
    header="🤔 Need More Help?"
)
```

### Feedback Collection

```python
# Simple satisfaction survey
satisfaction_buttons = [
    ReplyButton(id="very_happy", title="😍 Love it!"),
    ReplyButton(id="satisfied", title="😊 Good"),
    ReplyButton(id="not_happy", title="😐 Could be better")
]

await self.messenger.send_button_message(
    "How was your experience with us today?",
    satisfaction_buttons,
    user_id,
    header="📝 Quick Feedback",
    footer="Your feedback helps us improve!"
)
```

---

## Pro Tips for Conversational Apps

### 1. Use Emojis Strategically
- **Status indicators**: ✅ ❌ ⏳ 🔄
- **Actions**: 🛍️ 📦 💬 🔍
- **Emotions**: 🎉 😊 🤔 😍
- **Categories**: 📱 👕 🏠 🚗

### 2. Keep Button Text Short and Clear
```python
# ❌ Too verbose
ReplyButton(id="continue_shopping", title="Continue Shopping for More Products")

# ✅ Clear and concise  
ReplyButton(id="continue_shopping", title="🛍️ Keep Shopping")
```

### 3. Use Headers and Footers Effectively
```python
await self.messenger.send_button_message(
    "Which payment method would you prefer?",
    payment_buttons,
    user_id,
    header="💳 Payment Options",      # Sets context
    footer="All payments are secure"   # Provides reassurance
)
```

### 4. Create Message Flows, Not Individual Messages
Think in terms of **conversations**, not just single messages. Each message should lead naturally to the next step.

### 5. Test Everything on Real WhatsApp
What looks good in code might feel clunky in the actual WhatsApp interface. Always test your interactive flows on a real device.

---

## What's Next?

You now know how to send every type of WhatsApp message! Ready to put it all together?

- **[Event System Guide](event-system.md)** - Handle user responses and build conversation flows
- **[Quick Start](../quickstart.md)** - Build your first complete conversational app

---

<div style="text-align: center; margin: 3rem 0; padding: 2rem; border: 1px solid var(--md-default-fg-color--lightest); border-radius: 12px; background: transparent;">
    <h3 style="margin: 0 0 1rem 0;">💬 Message Master Achieved!</h3>
    <p style="margin: 0 0 1.5rem 0; opacity: 0.8;">
        You can now send any type of WhatsApp message. Time to build amazing conversations!
    </p>
    
    <a href="../quickstart" class="md-button md-button--primary" style="
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
    ">🚀 Build Your First App</a>
</div>