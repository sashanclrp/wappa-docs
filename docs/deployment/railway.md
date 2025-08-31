# Deploy to Railway in 10 Minutes

**From local development to production in minutes**

Ready to launch your Wappa conversational application? Railway makes deployment ridiculously simple. No complex configurations, no DevOps headaches—just pure focus on building great WhatsApp experiences.

## 🚂 Why Railway?

Railway is the perfect match for Wappa applications:

- **Zero-config deployments** - Detects your Dockerfile automatically
- **Built-in Redis** - Add Redis with one click, no setup required
- **Automatic scaling** - Handles traffic spikes without intervention
- **Free tier friendly** - Perfect for development and small projects
- **Production ready** - SSL, CDN, and monitoring included

**The result?** Your conversational app running on global infrastructure in under 10 minutes.

## ✅ Prerequisites

Before we start, make sure you have:

1. **Railway account** - [Sign up here](https://railway.app) (free tier available)
2. **Railway CLI installed** - We'll do this in Step 1
3. **WhatsApp Business API credentials** - Access token, phone ID, and business ID
4. **Your Wappa project working locally** - Test it first!

!!! tip "First time with Railway?"
    No worries! We'll walk through everything step by step.

## 🚀 Step-by-Step Deployment

### Step 1: Install Railway CLI

=== "macOS/Linux"
    ```bash
    # Install via npm (requires Node.js 16+)
    npm install -g @railway/cli
    
    # Verify installation
    railway --version
    ```

=== "Windows"
    ```powershell
    # Install via npm
    npm install -g @railway/cli
    
    # Verify installation
    railway --version
    ```

### Step 2: Login to Railway

```bash
# This opens your browser for authentication
railway login
```

**✅ Success indicator**: You'll see "Logged in as [your-email]"

### Step 3: Create Your Railway Project

Navigate to your Wappa project directory and initialize:

```bash
# In your project directory (e.g., wappa_full_example/)
cd your-wappa-project

# Initialize Railway project
railway init

# Select "Create new project"
# Choose a memorable project name (e.g., "my-whatsapp-app")
```

**✅ Success indicator**: You'll see "Project created: [project-name]"

### Step 4: Add Redis Service

Your conversational app needs Redis for state management. Railway makes this trivial:

```bash
# Add Redis with one command
railway add redis
```

**✅ Success indicator**: Redis service appears in your Railway dashboard

!!! info "Redis URL Magic"
    Railway automatically creates the `REDIS_URL` environment variable as `redis://redis.railway.internal:6379`. No manual configuration needed!

### Step 5: Deploy Your Application

Here's where the magic happens:

```bash
# Deploy to Railway
railway up
```

Railway will:
- 🔍 Detect your `Dockerfile`
- 🏗️ Build your container 
- 🚀 Deploy to production infrastructure
- 🌐 Generate your public URL

**✅ Success indicator**: You'll see "Deployment successful" with your app URL

### Step 6: Configure Environment Variables

Set your WhatsApp credentials in Railway:

```bash
# Set WhatsApp Business API credentials
railway variables set WP_ACCESS_TOKEN=your_access_token_here
railway variables set WP_PHONE_ID=your_phone_number_id_here  
railway variables set WP_BID=your_business_id_here
railway variables set WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_token_here
```

!!! tip "Dashboard Alternative"
    Prefer a visual interface? Set variables in Railway Dashboard → Your Service → Variables tab.

The Redis URL is automatically configured as:
```bash
REDIS_URL=redis://redis.railway.internal:6379
```

### Step 7: Configure WhatsApp Webhook

Now connect WhatsApp to your deployed app:

1. **Get your Railway URL** from the dashboard or CLI:
   ```bash
   railway status
   ```

2. **Configure webhook in Meta for Developers**:
   - Webhook URL: `https://your-app.up.railway.app/webhook/messenger/YOUR_PHONE_ID/whatsapp`
   - Verify Token: `your_webhook_token_here`

3. **Test your webhook**:
   ```bash
   curl "https://your-app.up.railway.app/health"
   ```

**✅ Success indicator**: Health check returns 200 OK

## 🎉 Your Conversational App is Live!

**Congratulations!** Your Wappa application is now running on production infrastructure with:

- **✅ Automatic scaling** - Handles traffic spikes
- **✅ SSL certificate** - Secure HTTPS by default  
- **✅ Redis caching** - Fast state management
- **✅ Global CDN** - Fast worldwide response
- **✅ Health monitoring** - Automatic issue detection

### Test Your Deployment

Send a test message to your WhatsApp Business number. You should see:

1. **Echo response** - Your message echoed back
2. **Interactive commands** - Try `/button` or `/list`
3. **Logs in Railway** - Check Railway dashboard → Logs tab

## 🔧 Managing Your Deployment

### View Real-Time Logs

```bash
# Follow logs in real-time
railway logs

# Or view in Railway Dashboard → Deployments → View Logs
```

### Update Your App

Made changes? Deploy updates instantly:

```bash
# Deploy latest changes
railway up
```

### Add Custom Domain (Optional)

```bash
# Add your custom domain
railway domain add yourdomain.com

# Or via Railway Dashboard → Settings → Domains
```

## 🚨 Troubleshooting

### Build Failures

**Problem**: Deployment fails during build
```bash
# Check build logs
railway logs --deployment

# Common solutions:
# • Ensure Dockerfile exists in project root
# • Verify uv.lock file is present
# • Check Python version compatibility (3.12+)
```

### Environment Variable Issues

**Problem**: App starts but doesn't work
```bash
# List current variables
railway variables

# Check for missing required variables:
# WP_ACCESS_TOKEN, WP_PHONE_ID, WP_BID, WHATSAPP_WEBHOOK_VERIFY_TOKEN
```

### Redis Connection Problems

**Problem**: Cache-related errors in logs
```bash
# Verify Redis service exists
railway status

# Check Redis URL format
railway variables get REDIS_URL
# Should be: redis://redis.railway.internal:6379
```

### Webhook Not Responding

**Problem**: WhatsApp messages not reaching your app

1. **Verify webhook URL format**:
   ```
   https://your-app.up.railway.app/webhook/messenger/YOUR_PHONE_ID/whatsapp
   ```

2. **Test webhook endpoint**:
   ```bash
   curl -X GET "https://your-app.up.railway.app/webhook/messenger/YOUR_PHONE_ID/whatsapp?hub.verify_token=YOUR_TOKEN&hub.challenge=test"
   ```

3. **Check WhatsApp Business API settings** in Meta for Developers

## 💡 Pro Tips

### Development Workflow

```bash
# Pull production environment for local development
railway run -- uv run python -m app.main

# This runs your local app with production environment variables
```

### Monitoring

```bash
# Check deployment status
railway status

# View application metrics in Railway Dashboard
# Monitor Redis usage and performance
```

### Scaling

Railway automatically scales based on traffic, but you can configure:

- **Vertical scaling** - More CPU/memory per instance
- **Horizontal scaling** - More instances (Pro plan required)
- **Auto-sleep** - Saves costs by sleeping during low traffic

## 🎯 What's Next?

Your conversational application is now live! Here are some next steps:

1. **[Monitor your app →](https://docs.railway.com/guides/monitoring)** - Track performance and user engagement
2. **[Configure custom domain →](https://docs.railway.com/guides/public-networking#custom-domains)** - Use your own domain
3. **[Add CI/CD →](https://docs.railway.com/guides/github-autodeploys)** - Automatic deployments from GitHub
4. **[Scale your app →](https://docs.railway.com/guides/optimize-usage)** - Optimize for higher traffic

## 💰 Railway Pricing

### Hobby Plan (Free)
- $5 credit/month
- Perfect for development and testing
- No credit card required

### Pro Plan ($20/month)
- Unlimited usage
- Custom domains
- Auto-scaling
- Priority support

!!! success "You're Live! 🎉"
    Your Wappa conversational application is now running on production infrastructure. Send a message to your WhatsApp Business number and watch the magic happen!

---

**Built with ❤️ using the Wappa Framework**