# Production Readiness Checklist

Before you launch - things to double-check. This practical checklist helps you deploy your Wappa conversational application with confidence, covering the essentials without being paranoid.

## 🔒 Security Checklist

### Environment Variables
- **Never commit credentials to Git** - Use `.env` files locally, platform secrets in production
- **Rotate WhatsApp tokens regularly** - Set calendar reminders for quarterly rotation
- **Use strong webhook verify tokens** - Generate random 32+ character strings
- **Validate required variables** - All 4 essential vars: `WP_ACCESS_TOKEN`, `WP_PHONE_ID`, `WP_BID`, `WHATSAPP_WEBHOOK_VERIFY_TOKEN`

```bash
# Good webhook verify token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=sk_9x2mF8nP4kL7qR1vE6wY3uI0sA5bC8dZ

# Bad webhook verify token  
WHATSAPP_WEBHOOK_VERIFY_TOKEN=secret123
```

### Container Security
- **Run as non-root user** - Wappa's Dockerfile creates `wappa` user (UID 1000)
- **Use official base images** - `python:3.12-slim` recommended
- **Keep base images updated** - Regular security updates
- **Limit container permissions** - No privileged access needed

### API Security
- **Enable HTTPS only** - All platforms handle SSL automatically
- **Validate webhook signatures** - Wappa validates WhatsApp webhooks automatically
- **Rate limiting configured** - Use platform rate limiting or Wappa plugins
- **Health check endpoints secured** - `/health` endpoint should not expose sensitive data

## ⚙️ Configuration Validation

### Core Configuration
- **Environment detection working** - `ENVIRONMENT=PROD` for production
- **Port configuration correct** - Use platform-provided `PORT` env var
- **Timezone configured** - Set `TIME_ZONE` for accurate timestamps
- **Log level appropriate** - `INFO` for production, `DEBUG` for troubleshooting

```python
# Validate your configuration
from wappa.core.config.settings import settings

# These should all pass in production
assert settings.wp_access_token, "Access token required"
assert settings.wp_phone_id, "Phone ID required" 
assert settings.wp_bid, "Business ID required"
assert settings.is_production, "Environment should be PROD"
```

### Cache Configuration
- **Cache backend selected** - Memory (default), JSON file, or Redis
- **Redis connection tested** - If using Redis, verify connectivity
- **Cache TTL configured** - Appropriate expiration times for user data
- **Cache persistence planned** - Consider data loss during restarts

**Cache Selection Guide:**
- **Memory**: Single instance, fast, data lost on restart
- **JSON**: File-based persistence, good for small scale
- **Redis**: Multi-instance, persistent, best for production scale

### WhatsApp Webhook Setup  
- **Webhook URL format correct** - `https://your-domain.com/webhook/messenger/{PHONE_ID}/whatsapp`
- **Webhook verification working** - Test with WhatsApp's verification
- **Message delivery tested** - Send test message end-to-end
- **Interactive features tested** - Buttons, lists, CTAs working

## 📊 Monitoring & Logging Setup

### Application Monitoring
- **Health checks configured** - `/health` endpoint responding
- **Application metrics** - Response times, error rates, message volume
- **Resource monitoring** - CPU, memory, disk usage tracking
- **Uptime monitoring** - External service pinging your app

```bash
# Test health endpoints
curl https://your-app.com/health
curl https://your-app.com/health/detailed

# Should return {"status": "healthy", ...}
```

### Logging Strategy
- **Structured logging enabled** - Wappa provides JSON logging automatically
- **Log levels configured** - `INFO` for production, `ERROR` for alerts
- **Log rotation setup** - Prevent disk space issues
- **Sensitive data filtered** - No tokens or user data in logs

**Wappa Logging Features:**
- Automatic request/response logging
- Webhook processing metrics
- Error tracking with context
- Performance measurement

### Platform-Specific Monitoring

#### Railway
- **Railway metrics dashboard** - CPU, memory, requests tracked automatically
- **Log aggregation** - `railway logs` for centralized viewing
- **Deployment notifications** - Configure Slack/Discord webhooks

#### Heroku
- **Papertrail addon** - Centralized log management
- **New Relic addon** - Application performance monitoring
- **Heroku metrics** - Dyno performance tracking

#### AWS/DigitalOcean
- **CloudWatch/Monitoring** - Custom metrics and alerting
- **Log aggregation** - ELK stack or managed logging service
- **Auto-scaling rules** - Based on CPU/memory thresholds

## 🚨 Error Handling & Graceful Degradation

### Application-Level Error Handling
- **Webhook processing errors** - Graceful handling with user notifications
- **WhatsApp API errors** - Retry logic for transient failures
- **Cache unavailability** - Fallback to memory cache if Redis fails
- **Dependency failures** - Continue with reduced functionality

```python
# Example graceful degradation
class MyHandler(WappaEventHandler):
    async def process_message(self, webhook: IncomingMessageWebhook):
        try:
            # Try Redis cache first
            user_cache = self.cache_factory.create_user_cache()
            user_data = await user_cache.get(webhook.user.user_id)
        except Exception:
            # Fallback to memory cache
            self.logger.warning("Redis unavailable, using memory cache")
            user_data = None
        
        # Continue processing with or without cache data
```

### Infrastructure Error Handling
- **Restart policies configured** - Automatic container restart on failure
- **Health check timeouts** - Reasonable timeout values (30s recommended)
- **Circuit breaker pattern** - Prevent cascade failures
- **Backup strategies** - Redis backup, configuration backup

### User Experience During Errors
- **Friendly error messages** - No technical details exposed to users
- **Fallback responses** - Generic helpful responses when processing fails
- **Error acknowledgment** - Let users know you received their message
- **Recovery instructions** - Help users retry or contact support

## 🚀 Deployment Platform Checklist

### Railway (Recommended for Simplicity)
- **Dockerfile optimized** - Single-stage build, non-root user
- **railway.toml configured** - Health checks, restart policies
- **Redis plugin added** - `railway add redis`
- **Environment variables set** - Via Railway dashboard
- **Custom domain configured** - If needed for production

```bash
# Railway deployment checklist
railway login
railway init
railway up
railway add redis
railway variables set WP_ACCESS_TOKEN=your_token
# Configure remaining variables...
```

### Heroku
- **Procfile created** - `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Redis addon** - Heroku Redis or external provider
- **Config vars set** - All environment variables via dashboard
- **Buildpack specified** - Python buildpack auto-detected

```bash
# Heroku deployment checklist  
heroku create your-app-name
heroku addons:create heroku-redis:mini
heroku config:set WP_ACCESS_TOKEN=your_token
# Configure remaining variables...
git push heroku main
```

### DigitalOcean App Platform
- **App spec configured** - YAML specification for services
- **Managed Redis** - DigitalOcean managed database
- **Environment variables** - Via App Platform dashboard
- **Health checks enabled** - HTTP health check configured

### AWS (ECS/Fargate)
- **ECS task definition** - Container configuration
- **ElastiCache Redis** - Managed Redis service
- **Secrets Manager** - For sensitive environment variables
- **Application Load Balancer** - With health checks
- **CloudWatch monitoring** - Logs and metrics collection

### Docker Compose (Self-Hosted)
- **docker-compose.yml** - Multi-service configuration
- **Redis service** - Persistent volume configured
- **Nginx reverse proxy** - SSL termination and load balancing
- **Volume persistence** - Logs and data persistence
- **Backup strategy** - Regular Redis and configuration backups

## ✅ Pre-Launch Validation

### Functional Testing
- **Send test message** - Basic text message works end-to-end
- **Interactive features** - Buttons, lists, CTAs respond correctly
- **Media handling** - Images, videos, documents process properly
- **Error scenarios** - Invalid inputs handled gracefully
- **Load testing** - Application handles expected message volume

### WhatsApp Integration
- **Webhook verification** - WhatsApp successfully verifies your endpoint
- **Message delivery** - Messages reach users' WhatsApp
- **Status webhooks** - Delivery status updates received
- **Error webhooks** - Platform errors handled appropriately

### Performance Validation
- **Response times** - Under 5 seconds for webhook processing
- **Memory usage** - Stable memory consumption over time
- **Cache performance** - Cache hit rates and response times acceptable
- **Concurrent users** - Multiple simultaneous conversations handled

### Security Validation
- **Webhook signature validation** - Only authentic WhatsApp webhooks processed
- **Access token security** - No tokens exposed in logs or responses
- **User data protection** - PII handled according to privacy policies
- **Rate limiting effective** - Abuse prevention working

## 🎯 Launch with Confidence

### Day-of-Launch Checklist
- **Monitoring dashboards ready** - Know where to check for issues
- **Alert notifications configured** - Get notified of critical errors
- **Support documentation ready** - Know how to help users with issues
- **Rollback plan prepared** - Quick way to revert if needed
- **Team notifications sent** - Stakeholders know about the launch

### Post-Launch Monitoring (First 24 Hours)
- **Watch error rates** - Should stay under 1% 
- **Monitor response times** - Keep under 5 seconds
- **Check user feedback** - Are people using it successfully?
- **Validate cache performance** - Redis/cache backend performing well
- **Review logs** - Look for unexpected patterns or errors

### Success Metrics
- **Message processing rate** - 95%+ messages processed successfully
- **Response time** - 99% of webhooks processed under 5 seconds  
- **Uptime** - 99.9% availability target
- **User satisfaction** - Positive user interactions and feedback

## 🔧 Platform-Specific Production Tips

### Railway
- **Pros**: Zero-config deployments, automatic SSL, integrated Redis
- **Cons**: Newer platform, pricing scales with usage
- **Best for**: Quick deployment, startups, prototypes

### Heroku  
- **Pros**: Mature platform, extensive addon ecosystem, simple git-based deployment
- **Cons**: More expensive at scale, dyno limitations
- **Best for**: Established teams, complex addon requirements

### DigitalOcean
- **Pros**: Predictable pricing, good performance, managed databases
- **Cons**: More configuration required, fewer managed services
- **Best for**: Cost-conscious deployments, predictable workloads

### AWS
- **Pros**: Comprehensive services, enterprise features, global infrastructure
- **Cons**: Complex configuration, steep learning curve, can be expensive
- **Best for**: Enterprise deployments, complex integrations, high scale

## 📚 Essential Commands by Platform

### Railway
```bash
# Deployment
railway up
railway logs
railway variables set KEY=value

# Health check
curl https://your-app.up.railway.app/health
```

### Heroku
```bash
# Deployment  
git push heroku main
heroku logs --tail
heroku config:set KEY=value

# Health check
curl https://your-app.herokuapp.com/health
```

### Docker
```bash
# Production with Redis
docker-compose --profile nginx up -d
docker-compose logs -f
docker-compose ps

# Health check
curl http://localhost:8000/health
```

---

**🚀 You're ready to launch!** Your Wappa conversational application is configured for production success. The framework handles the complex parts - you focus on creating great user experiences.

**Remember**: Start with simple deployment (Railway), then scale to more complex platforms as your needs grow. You can always migrate later.