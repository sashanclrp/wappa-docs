# Caching in Wappa - Remember Everything

*Conversational apps need memory. Here's how Wappa remembers everything between messages.*

---

## Why Caching Matters

WhatsApp sends your conversational app individual messages with no memory of previous conversations. Without caching, your app is essentially goldfish-brained.

**The solution**: Wappa gives your app three types of memory:

| Cache Type | Purpose | Example Use Case |
|------------|---------|------------------|
| **State Cache** | Conversation flows | Pizza ordering steps, support tickets |
| **User Cache** | User profiles & preferences | Names, language, subscription status |
| **Table Cache** | Shared business data | Product catalogs, order tracking |

**Copy these examples and modify them for your conversational app.**

---

## How Caching Works in Wappa

In your event handler, you have automatic access to three cache instances:

```python
from wappa import WappaEventHandler
from pydantic import BaseModel

class UserProfile(BaseModel):
    name: str
    language: str = "en"
    subscription: str = "free"

class Product(BaseModel):
    name: str
    price: float
    available: bool = True

class MyApp(WappaEventHandler):
    async def handle_message(self, webhook):
        # 🔥 Three caches automatically injected!
        
        # State cache - conversation flows (user-specific)
        await self.state_cache.set("pizza_order", {"step": "size", "toppings": []})
        
        # User cache - user profiles with Pydantic models (user-specific)
        user = UserProfile(name="John", language="en")
        await self.user_cache.set("profile", user)
        
        # Table cache - shared data with Pydantic models (tenant-wide)
        product = Product(name="Large Pizza", price=15.99)
        await self.table_cache.set("products", "pizza_large", product)
```

**Key insight**: Wappa handles all key generation and context injection automatically. You never manually build cache keys!

---

## Cache Types Deep Dive

### State Cache - Conversation Memory

**Purpose**: Track conversation steps, handler states, and user flows

```python
from pydantic import BaseModel
from datetime import datetime

# Using Pydantic models (recommended)
class PizzaOrder(BaseModel):
    step: str = "start"
    size: str | None = None
    toppings: list[str] = []
    total: float = 0.0
    created_at: datetime = datetime.now()

# Store Pydantic model directly
order = PizzaOrder(step="toppings", size="large", toppings=["pepperoni", "mushrooms"], total=15.99)
await self.state_cache.set("pizza_order", order)

# Or use dict format
await self.state_cache.set("pizza_order", {
    "step": "toppings",
    "size": "large", 
    "toppings": ["pepperoni", "mushrooms"],
    "total": 15.99
})

# Get conversation state with Pydantic model
order_state = await self.state_cache.get("pizza_order", models=PizzaOrder)
if order_state and order_state.step == "toppings":
    await self.messenger.send_text("Add more toppings or type 'done'", webhook.user.user_id)

# Or get as dict
order_dict = await self.state_cache.get("pizza_order")
if order_dict and order_dict["step"] == "toppings":
    await self.messenger.send_text("Add more toppings or type 'done'", webhook.user.user_id)

# Support ticket tracking
await self.state_cache.set("support_ticket", {
    "ticket_id": "T123",
    "category": "billing",
    "status": "open",
    "agent_assigned": None
})
```

#### Key Pattern
```
tenant:state:handler_name:user_id
Example: "hotel123:state:pizza_order:1234567890"
```

### User Cache - User Profiles

**Purpose**: Store user data, preferences, and profiles

```python
from pydantic import BaseModel
from datetime import datetime

class UserProfile(BaseModel):
    name: str
    language: str = "en"
    phone: str
    subscription: str = "free"
    preferences: dict = {"notifications": True, "marketing": False}
    message_count: int = 0
    last_seen: datetime = datetime.now()

# Using Pydantic model (recommended)
user = UserProfile(
    name="Sarah Johnson",
    language="es", 
    phone="1234567890",
    subscription="premium",
    message_count=1
)

await self.user_cache.set("profile", user)

# Or use dict format
user_dict = {
    "name": "Sarah Johnson",
    "language": "es", 
    "phone": "1234567890",
    "subscription": "premium",
    "preferences": {"notifications": True, "marketing": False},
    "message_count": 1
}

await self.user_cache.set("profile", user_dict)

# Get user data with Pydantic model
user = await self.user_cache.get("profile", models=UserProfile)
if user:
    welcome_lang = "¡Hola!" if user.language == "es" else "Hello!"
    await self.messenger.send_text(f"{welcome_lang} {user.name}!", webhook.user.user_id)

# Or get as dict
user_dict = await self.user_cache.get("profile")
if user_dict:
    welcome_lang = "¡Hola!" if user_dict["language"] == "es" else "Hello!"
    await self.messenger.send_text(f"{welcome_lang} {user_dict['name']}!", webhook.user.user_id)
```

#### Key Pattern
```
tenant:user:user_id
Example: "hotel123:user:1234567890"
```

### Table Cache - Shared Business Data

**Purpose**: Products, orders, lookup tables, and shared business data

```python
from pydantic import BaseModel

class Product(BaseModel):
    name: str
    price: float
    category: str
    available: bool = True
    toppings: list[str] = []

# Using Pydantic model (recommended)
product = Product(
    name="Large Pizza",
    price=15.99,
    category="pizza",
    available=True,
    toppings=["cheese", "pepperoni", "mushrooms"]
)

await self.table_cache.set("products", "pizza_large", product)

# Or use dict format
await self.table_cache.set("products", "pizza_large", {
    "name": "Large Pizza",
    "price": 15.99,
    "category": "pizza",
    "available": True,
    "toppings": ["cheese", "pepperoni", "mushrooms"]
})

# Order tracking with Pydantic model
class Order(BaseModel):
    customer_id: str
    items: list[dict]
    total: float
    status: str = "pending"
    estimated_time: str | None = None

order = Order(
    customer_id="1234567890",
    items=[{"product": "pizza_large", "quantity": 2}],
    total=31.98,
    status="preparing",
    estimated_time="25 minutes"
)

await self.table_cache.set("orders", "order_12345", order)

# Get shared data with Pydantic model
product = await self.table_cache.get("products", "pizza_large", models=Product)
if product and product.available:
    await self.messenger.send_text(f"🍕 {product.name}: ${product.price}", webhook.user.user_id)

# Or get as dict
product_dict = await self.table_cache.get("products", "pizza_large")
if product_dict and product_dict["available"]:
    await self.messenger.send_text(f"🍕 {product_dict['name']}: ${product_dict['price']}", webhook.user.user_id)
```

#### Key Pattern  
```
tenant:df:table_name:pkid:record_id
Example: "hotel123:df:products:pkid:pizza_large"
```

---

## Pydantic BaseModel Support

Wappa's caching system provides **first-class support for Pydantic models** with automatic serialization and deserialization:

### Why Use Pydantic Models?

```python
from pydantic import BaseModel, Field
from datetime import datetime

class UserProfile(BaseModel):
    name: str
    phone: str = Field(..., pattern=r"^\d{10,15}$")
    language: str = "en"
    message_count: int = Field(default=0, ge=0)
    last_seen: datetime = Field(default_factory=datetime.now)
    preferences: dict = {"notifications": True}

# ✅ Type safety and validation
user = UserProfile(name="John", phone="1234567890")

# ✅ Auto-complete in your IDE
user.message_count += 1
user.last_seen = datetime.now()

# ✅ Validation on creation
try:
    bad_user = UserProfile(name="", phone="invalid")  # Raises validation error
except ValidationError as e:
    print(f"Invalid data: {e}")
```

### Store and Retrieve Pydantic Models

```python
class ConversationState(BaseModel):
    current_step: str = "start"
    context: dict = {}
    started_at: datetime = Field(default_factory=datetime.now)
    
class OrderData(BaseModel):
    items: list[str] = []
    total: float = 0.0
    customer_id: str

# Store Pydantic model directly
state = ConversationState(current_step="ordering", context={"flow": "pizza"})
await self.state_cache.set("conversation", state, ttl=1800)

# Retrieve as Pydantic model (recommended)
state = await self.state_cache.get("conversation", models=ConversationState)
if state:
    print(f"Current step: {state.current_step}")  # Type-safe access
    print(f"Duration: {datetime.now() - state.started_at}")

# Retrieve as dict (if you need dict format)
state_dict = await self.state_cache.get("conversation")
if state_dict:
    print(f"Current step: {state_dict['current_step']}")
```

### BaseModel with All Cache Types

```python
# State cache with models
class ChatFlow(BaseModel):
    step: str
    data: dict = {}

flow = ChatFlow(step="greeting", data={"language": "en"})
await self.state_cache.set("chat_flow", flow)
retrieved_flow = await self.state_cache.get("chat_flow", models=ChatFlow)

# User cache with models  
class Customer(BaseModel):
    name: str
    email: str | None = None
    tier: str = "basic"

customer = Customer(name="Alice", email="alice@example.com", tier="premium")
await self.user_cache.set("profile", customer)
retrieved_customer = await self.user_cache.get("profile", models=Customer)

# Table cache with models
class MenuItem(BaseModel):
    name: str
    price: float
    category: str
    ingredients: list[str] = []

menu_item = MenuItem(name="Margherita Pizza", price=12.99, category="pizza", ingredients=["tomato", "mozzarella"])
await self.table_cache.set("menu", "margherita", menu_item)
retrieved_item = await self.table_cache.get("menu", "margherita", models=MenuItem)
```

### Advanced BaseModel Operations

```python
# Field operations with BaseModel validation
class UserStats(BaseModel):
    message_count: int = 0
    login_count: int = 0
    points: int = 0

# Set individual fields (maintains model structure)
await self.user_cache.set_field("stats", "message_count", 5)
await self.user_cache.set_field("stats", "points", 100)

# Increment fields atomically
new_count = await self.user_cache.increment_field("stats", "message_count", 1)
new_points = await self.user_cache.increment_field("stats", "points", 10)

# Get as BaseModel for type safety
stats = await self.user_cache.get("stats", models=UserStats)
if stats:
    total_engagement = stats.message_count + stats.login_count
```

---

## Complete Cache API Reference

### Core ICache Methods

| Method | Purpose | Parameters | Returns |
|--------|---------|------------|---------|
| `get(key, models=None)` | Get cached data | `key: str`, `models: type[BaseModel] \| None` | `dict \| BaseModel \| None` |
| `set(key, data, ttl=None)` | Store data with TTL | `key: str`, `data: dict \| BaseModel`, `ttl: int \| None` | `bool` |
| `delete(key)` | Remove cached data | `key: str` | `bool` |
| `exists(key)` | Check if key exists | `key: str` | `bool` |
| `get_field(key, field)` | Get specific field | `key: str`, `field: str` | `Any \| None` |
| `set_field(key, field, value, ttl=None)` | Set specific field | `key: str`, `field: str`, `value: Any`, `ttl: int` | `bool` |
| `increment_field(key, field, increment=1, ttl=None)` | Atomic increment | `key: str`, `field: str`, `increment: int`, `ttl: int` | `int \| None` |
| `append_to_list(key, field, value, ttl=None)` | Append to list field | `key: str`, `field: str`, `value: Any`, `ttl: int` | `bool` |
| `get_ttl(key)` | Get remaining TTL | `key: str` | `int` |
| `set_ttl(key, ttl)` | Set TTL for key | `key: str`, `ttl: int` | `bool` |

### Advanced Cache Operations

```python
# Hash field operations
await self.user_cache.set_field("profile", "last_seen", "2025-01-15T10:30:00Z")
last_seen = await self.user_cache.get_field("profile", "last_seen")

# Atomic counters
new_count = await self.user_cache.increment_field("stats", "message_count", 1)
await self.user_cache.increment_field("stats", "login_count", 1, ttl=3600)

# List operations
await self.state_cache.append_to_list("order", "items", "pizza_large", ttl=1800)
await self.state_cache.append_to_list("order", "items", "coke_medium")

# TTL management
remaining_time = await self.state_cache.get_ttl("pizza_order")  # Returns seconds
await self.state_cache.set_ttl("pizza_order", 3600)  # Extend to 1 hour
```

### Helper Methods

```python
# Create standardized table keys
from wappa.domain.interfaces.cache_interface import ICache

table_key = ICache.create_table_key("products", "pizza_large")
# Returns: "products:pizza_large"

await self.table_cache.set(table_key, product_data)
```

---

## Cache Backends - Choose Your Storage

### Memory Cache (Development)
```python
from wappa import WappaBuilder

app = (WappaBuilder()
       .with_memory_cache()  # Fast, lost on restart
       .build())
```

**When to use**: Local development, testing, prototyping
- ✅ **Fastest performance** - no network calls
- ✅ **Zero setup** - works out of the box
- ❌ **Data lost on restart** - not persistent
- ❌ **Single process only** - no scaling

### JSON Cache (Simple Persistence)
```python
app = (WappaBuilder()
       .with_json_cache()  # File-based, persistent
       .build())
```

**When to use**: Single-server deployment, simple persistence needs
- ✅ **Persistent storage** - survives restarts
- ✅ **Human-readable** - can inspect cache files
- ✅ **Zero dependencies** - no external services
- ❌ **Single server only** - doesn't scale horizontally

**File structure**:
```
cache/
├── states/     # Conversation states
├── users/      # User profiles  
└── tables/     # Shared business data
```

### Redis Cache (Production)
```python
app = (WappaBuilder()
       .with_redis_cache("redis://localhost:6379")  # Scalable, fast
       .build())
```

**When to use**: Production, multiple servers, high performance
- ✅ **Horizontally scalable** - multiple app instances
- ✅ **High performance** - optimized for caching
- ✅ **Advanced features** - pub/sub, atomic operations
- ❌ **External dependency** - requires Redis server

**Database allocation**:
- **DB 0**: User cache (user profiles)
- **DB 1**: State cache (conversation flows)  
- **DB 2**: Table cache (shared business data)

---

## Cache Factory System

### ICacheFactory Interface

The cache factory creates context-aware cache instances:

```python
from wappa.persistence import create_cache_factory

# Create factory class for your chosen backend
factory_class = create_cache_factory("redis")  # or "json", "memory"

# Initialize with context (done automatically by Wappa)
cache_factory = factory_class(
    tenant_id="hotel123",
    user_id="1234567890"
)

# Create cache instances (auto-injected into your event handler)
state_cache = cache_factory.create_state_cache()    # User-specific
user_cache = cache_factory.create_user_cache()     # User-specific
table_cache = cache_factory.create_table_cache()   # Tenant-wide
```

### Factory Methods

| Method | Purpose | Context | Returns |
|--------|---------|---------|---------|
| `create_state_cache()` | Conversation flows | `tenant_id + user_id` | User-scoped cache |
| `create_user_cache()` | User profiles | `tenant_id + user_id` | User-scoped cache |
| `create_table_cache()` | Shared business data | `tenant_id only` | Tenant-scoped cache |

### Backend Factories

```python
# Redis factory with database isolation
from wappa.persistence.redis import RedisCacheFactory
redis_factory = RedisCacheFactory(tenant_id="hotel123", user_id="1234567890")

# JSON factory with file-based storage
from wappa.persistence.json import JSONCacheFactory  
json_factory = JSONCacheFactory(tenant_id="hotel123", user_id="1234567890")

# Memory factory with in-process storage
from wappa.persistence.memory import MemoryCacheFactory
memory_factory = MemoryCacheFactory(tenant_id="hotel123", user_id="1234567890")
```

---

## Key Generation & Namespacing

Wappa's `KeyFactory` automatically generates namespaced keys for data isolation:

### Automatic Key Generation

| Cache Type | Your Call | Generated Key | Isolation |
|------------|-----------|---------------|-----------|
| **State** | `state_cache.set("pizza_order", data)` | `hotel123:state:pizza_order:1234567890` | Per user |
| **User** | `user_cache.set("profile", data)` | `hotel123:user:1234567890` | Per user |
| **Table** | `table_cache.set("products", "pizza_large", data)` | `hotel123:df:products:pkid:pizza_large` | Per tenant |

### Key Factory Configuration

```python
from wappa.persistence.redis.redis_handler.utils.key_factory import KeyFactory

# Default configuration
key_factory = KeyFactory(
    user_prefix="user",      # User cache prefix
    handler_prefix="state",  # State cache prefix  
    table_prefix="df",       # Table cache prefix
    pk_marker="pkid"         # Primary key marker
)

# Generate keys manually (rarely needed)
user_key = key_factory.user("hotel123", "1234567890")
# Returns: "hotel123:user:1234567890"

state_key = key_factory.handler("hotel123", "pizza_order", "1234567890") 
# Returns: "hotel123:state:pizza_order:1234567890"

table_key = key_factory.table("hotel123", "products", "pizza_large")
# Returns: "hotel123:df:products:pkid:pizza_large"
```

### Key Safety & Sanitization

```python
# Keys are automatically sanitized
table_key = ICache.create_table_key("user:profiles", "john:smith:123")
# Returns: "user_profiles:john_smith_123" (colons replaced with underscores)
```

---

## Practical Examples

### Pizza Ordering Flow

```python
from pydantic import BaseModel
from datetime import datetime

class PizzaOrder(BaseModel):
    step: str = "start"
    size: str | None = None
    toppings: list[str] = []
    total: float = 0.0
    created_at: datetime = datetime.now()

class PizzaOrderHandler(WappaEventHandler):
    async def handle_message(self, webhook):
        message = webhook.get_message_text().lower()
        
        # Get current order state with Pydantic model
        order = await self.state_cache.get("pizza_order", models=PizzaOrder)
        if not order:
            order = PizzaOrder()  # Create new order
        
        if order.step == "start":
            order.step = "size"
            await self.state_cache.set("pizza_order", order, ttl=1800)  # 30 min
            await self.messenger.send_text("🍕 What size pizza? (small/medium/large)", webhook.user.user_id)
            
        elif order.step == "size" and message in ["small", "medium", "large"]:
            order.size = message
            order.step = "toppings"
            await self.state_cache.set("pizza_order", order, ttl=1800)
            await self.messenger.send_text("🧀 What toppings? (pepperoni/mushrooms/cheese)", webhook.user.user_id)
            
        elif order.step == "toppings":
            order.toppings = message.split(",")
            order.step = "confirm"
            
            # Calculate total from table cache
            size_prices = {"small": 8.99, "medium": 12.99, "large": 15.99}
            order.total = size_prices[order.size]
            
            await self.state_cache.set("pizza_order", order, ttl=1800)
            
            await self.messenger.send_text(
                f"📋 Order Summary:\n"
                f"Size: {order.size.title()}\n" 
                f"Toppings: {', '.join(order.toppings)}\n"
                f"Total: ${order.total:.2f}\n\n"
                f"Confirm? (yes/no)",
                webhook.user.user_id
            )
```

### User Profile Management

```python
class UserProfileHandler(WappaEventHandler):
    async def handle_message(self, webhook):
        # Get or create user profile
        user = await self.user_cache.get("profile") or {
            "name": webhook.user.user_name,
            "phone": webhook.user.user_id,
            "message_count": 0,
            "language": "en",
            "subscription": "free"
        }
        
        # Increment message counter atomically
        new_count = await self.user_cache.increment_field("profile", "message_count", 1)
        
        # Update last seen
        await self.user_cache.set_field("profile", "last_seen", "2025-01-15T10:30:00Z", ttl=86400)
        
        # Save updated profile
        await self.user_cache.set("profile", user, ttl=86400)  # 24 hours
        
        # Add to activity history
        await self.user_cache.append_to_list("profile", "recent_messages", {
            "text": webhook.get_message_text(),
            "timestamp": "2025-01-15T10:30:00Z"
        }, ttl=604800)  # 7 days
```

### Product Catalog Management

```python
class ProductCatalogHandler(WappaEventHandler):
    async def setup_catalog(self):
        """Initialize product catalog in table cache."""
        products = [
            {"id": "pizza_small", "name": "Small Pizza", "price": 8.99, "category": "pizza"},
            {"id": "pizza_large", "name": "Large Pizza", "price": 15.99, "category": "pizza"},
            {"id": "coke_can", "name": "Coke Can", "price": 1.99, "category": "drinks"}
        ]
        
        for product in products:
            await self.table_cache.set("products", product["id"], product, ttl=86400)
    
    async def handle_browse_products(self, webhook):
        # Get all products (this is simplified - real implementation might use different approach)
        pizza_small = await self.table_cache.get("products", "pizza_small")
        pizza_large = await self.table_cache.get("products", "pizza_large") 
        coke = await self.table_cache.get("products", "coke_can")
        
        catalog_text = "🛒 **Menu**:\n"
        for product in [pizza_small, pizza_large, coke]:
            if product:
                catalog_text += f"• {product['name']}: ${product['price']}\n"
        
        await self.messenger.send_text(catalog_text, webhook.user.user_id)
```

---

## Cache Backend Configuration

### Configure During App Setup

```python
from wappa import WappaBuilder

# Memory cache (development)
app = (WappaBuilder()
       .with_whatsapp(token="...", phone_id="...", business_id="...")
       .with_memory_cache()
       .build())

# JSON cache (simple persistence)  
app = (WappaBuilder()
       .with_whatsapp(token="...", phone_id="...", business_id="...")
       .with_json_cache()
       .build())

# Redis cache (production)
app = (WappaBuilder()
       .with_whatsapp(token="...", phone_id="...", business_id="...")
       .with_redis_cache("redis://localhost:6379")
       .build())
```

### Backend-Specific Features

#### Redis Advanced Features
```python
# Redis supports more advanced operations
await self.state_cache.set("pizza_order", order_data, ttl=1800)

# Check remaining time
remaining = await self.state_cache.get_ttl("pizza_order")
if remaining < 300:  # Less than 5 minutes
    await self.state_cache.set_ttl("pizza_order", 1800)  # Extend to 30 min
```

#### JSON File Inspection
```python
# JSON cache creates readable files you can inspect:
# cache/users/hotel123_+1234567890.json
# cache/states/hotel123_pizza_order_+1234567890.json  
# cache/tables/hotel123_products_pizza_large.json
```

---

## Error Handling & Best Practices

### Robust Error Handling

```python
async def safe_cache_operation(self, webhook):
    try:
        # Always check if cache operations succeed
        success = await self.state_cache.set("conversation", {"step": "greeting"})
        if not success:
            self.logger.error("Failed to save conversation state")
            # Fallback: continue without state or retry
            
        # Handle missing data gracefully
        user_data = await self.user_cache.get("profile")
        if not user_data:
            # Create default user data
            user_data = {"name": "Guest", "language": "en"}
            await self.user_cache.set("profile", user_data)
            
    except Exception as e:
        self.logger.error(f"Cache operation failed: {e}")
        # Always have a fallback plan
        await self.messenger.send_text("Service temporarily unavailable", webhook.user.user_id)
```

### TTL Best Practices

```python
# Recommended TTL values by data type
TTL_VALUES = {
    "conversation_state": 1800,    # 30 minutes - active conversations
    "user_profile": 86400,        # 24 hours - user data
    "product_catalog": 86400,     # 24 hours - business data  
    "temporary_data": 600,        # 10 minutes - short-term data
    "session_data": 3600,         # 1 hour - session info
    "analytics": 604800           # 7 days - historical data
}

# Apply appropriate TTL
await self.state_cache.set("pizza_order", order_data, ttl=TTL_VALUES["conversation_state"])
await self.user_cache.set("profile", user_data, ttl=TTL_VALUES["user_profile"])
```

### Cache Key Naming Conventions

```python
# ✅ Good key names (descriptive, hierarchical)
await self.state_cache.set("pizza_order", order_data)
await self.state_cache.set("support_ticket", ticket_data)
await self.state_cache.set("user_onboarding", onboarding_data)

# ✅ Good table keys (noun_adjective format)
await self.table_cache.set("products", "pizza_large", product_data)
await self.table_cache.set("orders", "order_12345", order_data)
await self.table_cache.set("customers", "customer_john", customer_data)

# ❌ Avoid generic keys
await self.state_cache.set("data", some_data)      # Too generic
await self.state_cache.set("temp", temp_data)      # Not descriptive
```

### Performance Optimization

```python
# Batch operations when possible
async def update_multiple_products(self, products):
    for product_id, product_data in products.items():
        await self.table_cache.set("products", product_id, product_data)
        # Consider adding small delay for rate limiting
        
# Use field operations for partial updates
await self.user_cache.set_field("profile", "last_seen", current_time)  # Faster than full profile update
await self.table_cache.set_field("products", "pizza_large", "available", False)  # Quick availability toggle
```

---

## Common Patterns & Use Cases

### Conversation State Machine

```python
class ConversationHandler(WappaEventHandler):
    async def handle_message(self, webhook):
        # Get current conversation state
        state = await self.state_cache.get("conversation") or {"step": "start", "context": {}}
        message = webhook.get_message_text().lower()
        
        if state["step"] == "start":
            if "order" in message:
                await self._start_order_flow(webhook, state)
            elif "support" in message:
                await self._start_support_flow(webhook, state)
        elif state["step"] == "ordering":
            await self._handle_order_step(webhook, state, message)
        elif state["step"] == "support":
            await self._handle_support_step(webhook, state, message)
    
    async def _start_order_flow(self, webhook, state):
        state.update({"step": "ordering", "context": {"type": "order"}})
        await self.state_cache.set("conversation", state, ttl=1800)
        await self.messenger.send_text("🍕 Let's start your order! What would you like?", webhook.user.user_id)
```

### User Preference Management

```python
class UserPreferenceHandler(WappaEventHandler):
    async def handle_language_change(self, webhook, language):
        # Update user preference
        await self.user_cache.set_field("profile", "language", language)
        
        # Get localized response
        responses = {
            "en": "Language updated to English! 🇺🇸",
            "es": "¡Idioma cambiado a Español! 🇪🇸", 
            "fr": "Langue changée en Français! 🇫🇷"
        }
        
        response = responses.get(language, responses["en"])
        await self.messenger.send_text(response, webhook.user.user_id)
```

### Analytics & Statistics

```python
class AnalyticsHandler(WappaEventHandler):
    async def track_message_stats(self, webhook):
        # Daily message counter
        today = datetime.now().strftime("%Y-%m-%d")
        await self.table_cache.increment_field("stats", f"messages_{today}", 1, ttl=86400)
        
        # Popular commands tracking
        message = webhook.get_message_text()
        if message.startswith("/"):
            command = message.split()[0]
            await self.table_cache.increment_field("stats", f"command_{command}", 1, ttl=604800)
        
        # Active users today
        user_key = f"active_users_{today}"
        await self.table_cache.append_to_list("stats", user_key, webhook.user.user_id, ttl=86400)
```

---

## What's Next?

You now understand Wappa's complete caching system! Ready to build stateful conversational apps?

- **[State Management Guide](../concepts/state-management.md)** - Advanced conversation flow patterns
- **[Event Handling](event-handlers.md)** - Integrate caching with your event handlers  
- **[Configuration](../concepts/configuration.md)** - Set up your cache backend

---

<div style="text-align: center; margin: 3rem 0; padding: 2rem; border: 1px solid var(--md-default-fg-color--lightest); border-radius: 12px; background: transparent;">
    <h3 style="margin: 0 0 1rem 0;">💾 Caching API Master!</h3>
    <p style="margin: 0 0 1.5rem 0; opacity: 0.8;">
        Your conversational app now has perfect memory. Time to build complex conversation flows!
    </p>
    
    <a href="../concepts/state-management" class="md-button md-button--primary" style="
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        border: none;
        border-radius: 8px;
        padding: 12px 32px;
        font-size: 16px;
        font-weight: 600;
        text-decoration: none;
        color: white;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        transition: all 0.3s ease;
        display: inline-block;
        margin: 0.5rem;
    ">🧠 Advanced State Management</a>
</div>