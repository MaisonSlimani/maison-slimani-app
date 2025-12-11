# Maison Slimani Analytics System Design
**Production-Ready "Analytiques" Dashboard**  
**Date:** 2025-12-11  
**Architecture:** Next.js 15 + Vercel Serverless + Supabase PostgreSQL
---
## PHASE 0 — System Context
### Current Technology Stack
**Frontend:**
- Next.js 15 (App Router, TypeScript)
- React 19.2.1
- TailwindCSS + shadcn/ui + Framer Motion
**Backend:**
- Vercel serverless functions (Node.js runtime)
- No custom backend server
**Database:**
- Supabase (PostgreSQL + Storage)
- Row Level Security (RLS) enabled
- Real-time subscriptions available
**Existing Analytics:**
- Google Tag Manager (GTM) integration via `lib/gtm.ts`
- Meta Pixel integration via `lib/analytics.ts`
- Client-side event tracking (ViewContent, AddToCart, Purchase, Search, etc.)
- `search_queries` table already exists for tracking search analytics
**Authentication:**
- No user accounts for customers (anonymous COD model)
- Admin authentication via JWT sessions (admin-app only)
**Key Architectural Insight:**
This is a **boutique e-commerce** site for high-end men's leather shoes with a **Cash on Delivery (COD)** model. The business relies on **anonymous visitor tracking** and **order conversion metrics** rather than user accounts or retention.
---
## PHASE 1 — Architecture Feasibility Analysis
### 1.1 Technical Constraints
#### **Supabase Limits (Hobby Tier)**
- **Database:** 500 MB storage (shared with images/files)
- **Database connections:** 60 concurrent (serverless pooling available)
- **Egress:** 5 GB/month
- **Row count:** No hard limit, but performance degrades with large tables
- **Write throughput:** ~1,000 writes/second (practical limit ~100-200/sec for hobby)
- **Real-time:** Available but limited to 200 concurrent connections
- **Cost:** Free tier exists; Pro tier at $25/month unlocks 8GB storage, 200 concurrent connections, 250GB egress
**Impact on Analytics:**
- ✅ Fine for event tracking (10K-50K events/month)
- ⚠️ High-frequency events (mouse movement, scroll tracking) would quickly exhaust storage
- ✅ Batching events client-side is essential
- ⚠️ Need archiving strategy after 90 days to prevent bloat
#### **Vercel Serverless Limits (Hobby Tier)**
- **Function execution:** 100GB-hours/month (~277 function hours)
- **Function duration:** 10 seconds max per invocation
- **Invocations:** 100,000/month (Hobby), unlimited (Pro)
- **Cold start:** 100-500ms typical
- **Payload size:** 4.5 MB max
**Impact on Analytics:**
- ✅ Event ingestion endpoint can handle 10K-50K events/month
- ⚠️ Batching required to stay under 100K invocations
- ❌ Real-time analytics dashboards would be inefficient (cold starts)
- ✅ Daily/hourly aggregation via cron jobs is feasible
#### **Anonymous Tracking Limitations**
- No server-side user IDs
- Must rely on client-side identifiers:
  - Browser fingerprinting (unreliable across sessions)
  - localStorage visitor_id (survives page reloads but not browser clears)
  - Session cookies (cleared when browser closes)
- **Consequence:** Session tracking is approximate; user journey reconstruction is limited
#### **Browser Data Collection Constraints**
- GDPR/Privacy: Must avoid PII without consent banners
- Ad blockers: ~30% of users may block GTM/Meta scripts
- No access to:
  - Precise geolocation (requires user permission)
  - Cross-domain tracking (3rd-party cookie deprecation)
  - Email/phone unless user submits order
### 1.2 Current Project Structure
**Existing Analytics Infrastructure:**
1. **Client-Side Tracking:**
   - `lib/gtm.ts`: GA4 ecommerce events (view_item, add_to_cart, purchase, etc.)
   - `lib/analytics.ts`: Unified wrapper for GTM + Meta Pixel
   - Events pushed to `window.dataLayer` and `window.fbq`
2. **Event Capture:**
   - ✅ Product views, add-to-cart, checkout, purchase
   - ✅ Search queries (tracked in `search_queries` table)
   - ❌ No 404 tracking
   - ❌ No cart abandonment tracking
   - ❌ No session duration or bounce rate tracking
3. **Event Batching:**
   - ❌ Currently NOT implemented (each event = 1 GTM push)
   - **Opportunity:** Batch events every 30 seconds or 10 events
4. **Ingestion Endpoints:**
   - ❌ No custom analytics API endpoint
   - ✅ `search_queries` table has INSERT policy (public)
   - **Opportunity:** Create `/api/admin/analytics` endpoint for custom event ingestion
5. **Archiving and Cleanup:**
   - ❌ No archiving strategy
   - ❌ No data retention policies
   - **Risk:** `search_queries` table will grow unbounded
6. **Admin-Side Visualization:**
   - ❌ No analytics dashboard in admin-app
   - ✅ Admin has dashboard with basic stats (total orders, revenue)
   - **Opportunity:** Add "Analytiques" section to `admin-app/app/admin/`
### 1.3 Feasibility Categories
For each potential analytics feature, classification:
---
#### **(A) Fully Implementable — Low Cost, Low Complexity**
| Feature | Justification |
|---------|---------------|
| **Page views** | Simple event tracking; localStorage visitor_id; minimal storage (~1KB/event). |
| **Product views** | Already tracked via GTM; extend to custom table for admin dashboard. |
| **Search analytics** | ✅ Already implemented (`search_queries` table). |
| **Add-to-cart events** | Already tracked via GTM; extend to custom table. |
| **Checkout funnel** | Track checkout_start, checkout_complete; 2 events per order. |
| **Purchase tracking** | Already implemented via GTM; extend to `commandes` table metadata. |
| **Device/browser breakdown** | Use `navigator.userAgent` client-side; parse on ingestion. |
| **Traffic source attribution** | Read `document.referrer` and URL params (`?utm_source=google`). |
| **Top products (by views)** | Aggregate from product_view events. |
| **Cart abandonment rate** | Compare checkout_start vs. purchase events. |
| **404 error tracking** | Capture in Next.js 404 page, send event. |
| **Conversion rate** | Sessions with purchase / total sessions. |
| **Average order value (AOV)** | Already available in `commandes` table. |
| **Trending searches** | ✅ Already implemented (`get_trending_searches` RPC). |
---
#### **(B) Not Implementable / Technically Inadvisable**
| Feature | Justification |
|---------|---------------|
| **Full session replay** | Requires recording DOM mutations + mouse events at 60fps. Storage cost: ~5-10 MB per session. At 1,000 sessions/month = 10 GB = exceeds Supabase free tier. **Inadvisable.** |
| **Real-time monitoring dashboard** | Requires WebSocket connections to Supabase Realtime + constant Vercel function invocations. Cold starts make this slow. Better suited to dedicated analytics SaaS (e.g., Mixpanel). **Not feasible.** |
| **High-frequency heatmaps** | Mouse tracking every 100ms = 600 events/minute = 36K events/hour. At 1,000 visitors/month = 36M events. **Storage explosion.** |
| **User retention cohorts** | No user accounts = no way to track returning users reliably across devices. **Not feasible.** |
| **Cross-device tracking** | No authentication = cannot link devices. **Not feasible.** |
| **Precise geolocation tracking** | Requires user permission prompt. For an e-commerce site, this is intrusive and likely low opt-in. **Inadvisable.** |
| **Real-time anomaly detection** | Requires streaming data pipeline + ML model. Out of scope for serverless. **Not feasible.** |
---
#### **(C) Optional / Additional Cost / Low ROI**
| Feature | Classification Reason |
|---------|----------------------|
| **Simplified session replay (static screenshots)** | Capture 1 screenshot every 10 seconds via `html2canvas`. Storage: ~500 KB per session. At 1,000 sessions = 500 MB = pushes toward Pro tier. **Possible but expensive.** |
| **Heatmaps with batching** | Track clicks/scrolls, batch every 30 seconds. Downsample to 1 event per 5% scroll depth. Storage: ~100 events/session. **Possible but medium complexity.** |
| **A/B testing engine** | Requires experiment assignment + variant tracking + statistical analysis. Better to use Vercel Edge Config or LaunchDarkly. **Low ROI for boutique.** |
| **AI insights (ChatGPT summaries)** | E.g., "Sales dropped 15% this week because search traffic declined." Requires LLM API calls ($$$). **Low ROI unless business is data-driven.** |
| **Email campaign tracking** | Requires sending emails with UTM parameters. Only useful if business runs email marketing. **Depends on marketing strategy.** |
| **Product recommendation engine** | Requires collaborative filtering or content-based ML. Better to use simple "upsell" logic (already implemented in DB: `upsell_products`). **Low ROI.** |
---
## PHASE 2 — Structured Feature Map
Based on the feasibility analysis, here is the prioritized feature list:
### 2.1 Implementable Core Features (Priority 1)
**Visitor & Session Tracking:**
- Page views (with URL, timestamp, referrer, device)
- Unique visitors (localStorage `visitor_id`)
- Session duration (first page view → last page view in 30-minute window)
- Bounce rate (sessions with only 1 page view)
**Product Analytics:**
- Product views (product_id, timestamp, referrer)
- Top viewed products (last 7/30 days)
- Product conversion rate (views → purchases)
**Search Analytics:**
- ✅ Already implemented: Search queries, trending searches
- **Extend:** Add "zero-result searches" (queries with 0 results → UX improvement opportunity)
**Cart & Checkout Funnel:**
- Add-to-cart events (product_id, quantity, price)
- Checkout funnel:
  1. Cart viewed
  2. Checkout started
  3. Payment info submitted
  4. Purchase completed
- Cart abandonment rate
**Traffic Sources:**
- Referrer domain (Google, Facebook, Direct)
- UTM parameters (utm_source, utm_medium, utm_campaign)
**Error Tracking:**
- 404 errors (URL, referrer, timestamp)
- JavaScript errors (optional: send `window.onerror` events)
**Device & Browser:**
- Device type (mobile, tablet, desktop)
- Browser (Chrome, Safari, Firefox)
- Operating system (Windows, macOS, iOS, Android)
**Time-Based Aggregations:**
- Daily/weekly/monthly trends (visits, conversions, revenue)
- Hourly heatmap (which hours have most traffic)
### 2.2 Not Feasible Features (Excluded)
- ❌ Full session replay (storage explosion)
- ❌ Real-time monitoring (serverless cold starts)
- ❌ High-frequency heatmaps (too many events)
- ❌ User retention cohorts (no user accounts)
- ❌ Cross-device tracking (no authentication)
- ❌ Precise geolocation (privacy concerns)
- ❌ Real-time anomaly detection (requires streaming pipeline)
### 2.3 Optional Professional Features (Priority 3)
**Low-Effort, High-Value:**
- Zero-result search tracking (easy to implement, high UX value)
- Email campaign UTM tracking (if business starts email marketing)
- Product stock-out tracking (product viewed but out of stock → lost revenue)
**Medium-Effort, Medium-Value:**
- Simplified heatmaps (click tracking only, batched)
- A/B testing (variant assignment via Edge Config)
**High-Effort, Low-Value:**
- Session replay (static screenshots)
- AI insights (requires LLM API)
---
## PHASE 3 — Final Analytics System Blueprint
### 3.1 Data Model
#### **New Tables**
**1. `analytics_events` — Core event tracking table**
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event identification
  event_type TEXT NOT NULL, -- 'page_view', 'product_view', 'add_to_cart', 'checkout_start', etc.
  event_timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Visitor & session
  visitor_id TEXT NOT NULL, -- Generated client-side (localStorage)
  session_id TEXT NOT NULL, -- Generated client-side (30-minute sliding window)
  
  -- Page context
  page_url TEXT,
  page_title TEXT,
  referrer TEXT,
  
  -- Event-specific data (JSONB for flexibility)
  event_data JSONB, -- e.g., { "product_id": "uuid", "quantity": 2, "price": 1200 }
  
  -- Device & browser
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  browser TEXT,
  os TEXT,
  
  -- Traffic source
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Geolocation (approximate from IP, server-side)
  country_code TEXT, -- e.g., 'MA' for Morocco
  city TEXT,
  
  -- Performance
  page_load_time INTEGER, -- milliseconds (optional)
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Indexes for fast queries
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(event_timestamp DESC);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_visitor ON analytics_events(visitor_id);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_product ON analytics_events((event_data->>'product_id')) WHERE event_type IN ('product_view', 'add_to_cart');
CREATE INDEX idx_analytics_events_date ON analytics_events(DATE(event_timestamp));
-- Row Level Security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
-- Allow public insert (for client-side event tracking)
CREATE POLICY "Allow public insert on analytics_events" 
  ON analytics_events FOR INSERT WITH CHECK (true);
-- Admin read-only (via service role or admin session)
CREATE POLICY "Allow admin read on analytics_events" 
  ON analytics_events FOR SELECT USING (true); -- Restrict via API endpoint auth
```
**2. `analytics_daily_aggregates` — Pre-computed daily stats**
```sql
CREATE TABLE analytics_daily_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  
  -- Traffic
  total_visitors INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  total_page_views INTEGER DEFAULT 0,
  bounce_rate NUMERIC(5,2), -- Percentage
  avg_session_duration INTEGER, -- Seconds
  
  -- Conversions
  total_orders INTEGER DEFAULT 0,
  total_revenue NUMERIC(10,2) DEFAULT 0,
  conversion_rate NUMERIC(5,2), -- Percentage
  avg_order_value NUMERIC(10,2),
  
  -- Products
  total_product_views INTEGER DEFAULT 0,
  total_add_to_cart INTEGER DEFAULT 0,
  
  -- Traffic sources (JSONB for flexibility)
  traffic_sources JSONB, -- { "google": 120, "facebook": 45, "direct": 200 }
  
  -- Top products
  top_products JSONB, -- [ { "product_id": "uuid", "views": 50 }, ... ]
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_analytics_daily_date ON analytics_daily_aggregates(date DESC);
```
**3. Extend `search_queries` table (already exists)**
```sql
-- Add column for zero-result tracking
ALTER TABLE search_queries ADD COLUMN IF NOT EXISTS results_count INTEGER DEFAULT 0;
ALTER TABLE search_queries ADD COLUMN IF NOT EXISTS visitor_id TEXT;
```
**4. Extend `commandes` table (already exists)**
```sql
-- Add analytics metadata
ALTER TABLE commandes ADD COLUMN IF NOT EXISTS visitor_id TEXT;
ALTER TABLE commandes ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE commandes ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE commandes ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE commandes ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
```
#### **Event Schema Design**
**Example: Page View Event**
```json
{
  "event_type": "page_view",
  "visitor_id": "vis_abc123xyz",
  "session_id": "ses_def456uvw",
  "page_url": "/boutique/classiques/derby-oxford-marron",
  "page_title": "Derby Oxford Marron - Maison Slimani",
  "referrer": "https://google.com",
  "device_type": "mobile",
  "browser": "Chrome",
  "os": "iOS",
  "utm_source": "google",
  "utm_medium": "cpc",
  "event_data": {},
  "page_load_time": 1200
}
```
**Example: Product View Event**
```json
{
  "event_type": "product_view",
  "visitor_id": "vis_abc123xyz",
  "session_id": "ses_def456uvw",
  "page_url": "/boutique/classiques/derby-oxford-marron",
  "event_data": {
    "product_id": "550e8400-e29b-41d4-a716-446655440000",
    "product_name": "Derby Oxford Marron",
    "product_category": "Classiques",
    "product_price": 1200,
    "in_stock": true
  }
}
```
**Example: Add to Cart Event**
```json
{
  "event_type": "add_to_cart",
  "visitor_id": "vis_abc123xyz",
  "session_id": "ses_def456uvw",
  "event_data": {
    "product_id": "550e8400-e29b-41d4-a716-446655440000",
    "quantity": 1,
    "price": 1200,
    "selected_size": "42",
    "selected_color": "Marron"
  }
}
```
### 3.2 Data Collection Layer (Client-Side)
**Architecture:**
1. **Client-Side Tracking Script:** `/lib/analytics-tracker.ts`
2. **Visitor/Session ID Generation:** localStorage persistence
3. **Event Batching:** Queue events locally, flush every 30 seconds or 10 events
4. **Device Detection:** Parse `navigator.userAgent`
5. **UTM Parameter Extraction:** Parse `window.location.search`
**Implementation:**
```typescript
// lib/analytics-tracker.ts (pseudocode)
class AnalyticsTracker {
  private eventQueue: Event[] = []
  private visitorId: string
  private sessionId: string
  private flushInterval = 30000 // 30 seconds
  private maxBatchSize = 10
  constructor() {
    this.visitorId = this.getOrCreateVisitorId()
    this.sessionId = this.getOrCreateSessionId()
    this.startAutoFlush()
  }
  trackEvent(eventType: string, eventData: any) {
    const event = {
      event_type: eventType,
      event_timestamp: new Date().toISOString(),
      visitor_id: this.visitorId,
      session_id: this.sessionId,
      page_url: window.location.href,
      page_title: document.title,
      referrer: document.referrer,
      device_type: this.detectDevice(),
      browser: this.detectBrowser(),
      os: this.detectOS(),
      utm_source: this.getUTMParam('utm_source'),
      utm_medium: this.getUTMParam('utm_medium'),
      utm_campaign: this.getUTMParam('utm_campaign'),
      event_data: eventData,
    }
    this.eventQueue.push(event)
    // Flush if batch size reached
    if (this.eventQueue.length >= this.maxBatchSize) {
      this.flush()
    }
  }
  private async flush() {
    if (this.eventQueue.length === 0) return
    const events = [...this.eventQueue]
    this.eventQueue = []
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      })
    } catch (error) {
      console.error('Analytics tracking failed:', error)
      // Optionally: retry or store in localStorage for later
    }
  }
  private getOrCreateVisitorId(): string {
    let id = localStorage.getItem('visitor_id')
    if (!id) {
      id = `vis_${crypto.randomUUID()}`
      localStorage.setItem('visitor_id', id)
    }
    return id
  }
  private getOrCreateSessionId(): string {
    const SESSION_DURATION = 30 * 60 * 1000 // 30 minutes
    const now = Date.now()
    const storedSession = localStorage.getItem('session_id')
    const storedTimestamp = localStorage.getItem('session_timestamp')
    if (storedSession && storedTimestamp) {
      const elapsed = now - parseInt(storedTimestamp, 10)
      if (elapsed < SESSION_DURATION) {
        // Extend session
        localStorage.setItem('session_timestamp', now.toString())
        return storedSession
      }
    }
    // New session
    const newSessionId = `ses_${crypto.randomUUID()}`
    localStorage.setItem('session_id', newSessionId)
    localStorage.setItem('session_timestamp', now.toString())
    return newSessionId
  }
  private detectDevice(): string {
    const ua = navigator.userAgent
    if (/mobile/i.test(ua)) return 'mobile'
    if (/tablet|ipad/i.test(ua)) return 'tablet'
    return 'desktop'
  }
  private detectBrowser(): string {
    const ua = navigator.userAgent
    if (ua.includes('Chrome')) return 'Chrome'
    if (ua.includes('Safari')) return 'Safari'
    if (ua.includes('Firefox')) return 'Firefox'
    if (ua.includes('Edge')) return 'Edge'
    return 'Other'
  }
  private detectOS(): string {
    const ua = navigator.userAgent
    if (ua.includes('Windows')) return 'Windows'
    if (ua.includes('Mac')) return 'macOS'
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
    if (ua.includes('Android')) return 'Android'
    return 'Other'
  }
  private getUTMParam(param: string): string | null {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get(param)
  }
  private startAutoFlush() {
    setInterval(() => this.flush(), this.flushInterval)
    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      // Use sendBeacon for reliability
      if (this.eventQueue.length > 0) {
        navigator.sendBeacon(
          '/api/analytics/track',
          JSON.stringify({ events: this.eventQueue })
        )
      }
    })
  }
}
export const analytics = new AnalyticsTracker()
```
**When to Send Events:**
| Trigger | Event Type | Timing |
|---------|-----------|--------|
| Page load | `page_view` | Immediate |
| Product page view | `product_view` | After 2 seconds (prevent bounce inflation) |
| Add to cart | `add_to_cart` | Immediate |
| Checkout page load | `checkout_start` | Immediate |
| Order confirmation | `purchase` | Immediate |
| Search query | `search` | On search submit |
| 404 page | `error_404` | Immediate |
| Cart page view | `cart_view` | Immediate |
**Error Handling:**
- If `/api/analytics/track` fails, log to console but don't block UX
- Optionally: Store failed events in localStorage and retry on next page load
- Use `navigator.sendBeacon()` for events on page unload (survives navigation)
**Privacy Constraints:**
- No PII (email, phone) sent in events (unless user submits order)
- Visitor ID is anonymous (cannot be traced back to individual without order)
- Comply with GDPR: Add cookie consent banner if tracking EU visitors
- Allow opt-out: Respect `navigator.doNotTrack` (optional)
### 3.3 Ingestion Layer (Server-Side)
**Architecture:**
1. **API Endpoint:** `app/api/analytics/track/route.ts`
2. **Rate Limiting:** Max 100 events per visitor per hour (prevent abuse)
3. **Payload Validation:** Zod schema validation
4. **Geolocation Enrichment:** Use Vercel Edge Function headers (`x-vercel-ip-country`, `x-vercel-ip-city`)
5. **Supabase Insert:** Batch insert to `analytics_events` table
**Implementation:**
```typescript
// app/api/analytics/track/route.ts (pseudocode)
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
const EventSchema = z.object({
  event_type: z.string(),
  event_timestamp: z.string(),
  visitor_id: z.string(),
  session_id: z.string(),
  page_url: z.string().optional(),
  page_title: z.string().optional(),
  referrer: z.string().optional(),
  device_type: z.string().optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  event_data: z.any().optional(),
  page_load_time: z.number().optional(),
})
const BatchSchema = z.object({
  events: z.array(EventSchema).max(50), // Max 50 events per request
})
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { events } = BatchSchema.parse(body)
    // Get geolocation from Vercel headers
    const country = req.headers.get('x-vercel-ip-country') || null
    const city = req.headers.get('x-vercel-ip-city') || null
    // Enrich events with server-side data
    const enrichedEvents = events.map((event) => ({
      ...event,
      country_code: country,
      city: city,
      created_at: new Date().toISOString(),
    }))
    // Insert into Supabase
    const supabase = createClient()
    const { error } = await supabase
      .from('analytics_events')
      .insert(enrichedEvents)
    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Insert failed' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
}
```
**Rate Limiting:**
- Use Vercel Edge Config or Upstash Redis to track request counts per `visitor_id`
- Limit: 100 events per visitor per hour
- If exceeded, return `429 Too Many Requests`
**Handling Supabase Write Throughput:**
- Batch inserts (up to 50 events per request)
- If write fails, log error and return 500 (client can retry)
- Monitor Supabase dashboard for slow queries
**Cold Start Mitigation:**
- Use Vercel Edge Functions (faster startup) if available
- Keep function code minimal (no heavy dependencies)
- Typical cold start: 200-500ms (acceptable for analytics, non-blocking for user)
### 3.4 Dashboard Design (Admin-Side)
**Location:** `admin-app/app/admin/analytiques/page.tsx`
**Structure:**
```
/admin/analytiques
├── Overview (7-day snapshot)
│   ├── Total Visitors
│   ├── Total Sessions
│   ├── Page Views
│   ├── Conversion Rate
│   ├── AOV (Average Order Value)
│   └── Revenue
├── Traffic Sources
│   ├── Pie chart: Direct vs. Google vs. Facebook vs. Other
│   ├── Table: Source, Visits, Conversion Rate
├── Product Analytics
│   ├── Top 10 Viewed Products
│   ├── Top 10 Added-to-Cart Products
│   ├── Product Conversion Rates (views → purchases)
│   ├── Out-of-Stock Product Views (lost revenue)
├── Search Analytics
│   ├── Trending Searches (last 7 days)
│   ├── Zero-Result Searches (UX improvement opportunity)
│   ├── Search → Purchase Conversion
├── Funnel Analytics
│   ├── Funnel: Page View → Product View → Add to Cart → Checkout → Purchase
│   ├── Drop-off rates at each stage
├── Device & Browser
│   ├── Pie chart: Mobile vs. Tablet vs. Desktop
│   ├── Table: Browser, Visits, Conversion Rate
├── Errors
│   ├── 404 Errors (URL, count)
│   ├── JavaScript Errors (optional)
├── Time-Based Trends
│   ├── Line chart: Daily visits (last 30 days)
│   ├── Line chart: Daily revenue (last 30 days)
│   ├── Hourly heatmap: Traffic by hour of day
├── Date Selector
│   ├── Last 7 days | Last 30 days | Last 90 days | Custom Range
├── Data Management
│   ├── Archive Old Data (> 90 days)
│   ├── Export CSV (events, aggregates)
│   └── Purge Events (manual cleanup)
```
**UI Components:**
- Use `recharts` (already in dependencies) for charts
- Use shadcn/ui cards and tables
- Real-time updates: No (use static aggregates to avoid cold starts)
- Refresh frequency: Manual refresh or daily aggregation via cron
**Example Queries:**
**Total Visitors (last 7 days):**
```sql
SELECT COUNT(DISTINCT visitor_id) AS total_visitors
FROM analytics_events
WHERE event_timestamp > NOW() - INTERVAL '7 days';
```
**Conversion Rate:**
```sql
WITH sessions_with_purchase AS (
  SELECT DISTINCT session_id
  FROM analytics_events
  WHERE event_type = 'purchase'
    AND event_timestamp > NOW() - INTERVAL '7 days'
)
SELECT 
  ROUND(
    COUNT(DISTINCT swp.session_id)::NUMERIC / 
    NULLIF(COUNT(DISTINCT ae.session_id), 0) * 100, 
    2
  ) AS conversion_rate
FROM analytics_events ae
LEFT JOIN sessions_with_purchase swp ON ae.session_id = swp.session_id
WHERE ae.event_timestamp > NOW() - INTERVAL '7 days';
```
**Top 10 Viewed Products:**
```sql
SELECT 
  event_data->>'product_id' AS product_id,
  event_data->>'product_name' AS product_name,
  COUNT(*) AS views
FROM analytics_events
WHERE event_type = 'product_view'
  AND event_timestamp > NOW() - INTERVAL '7 days'
GROUP BY product_id, product_name
ORDER BY views DESC
LIMIT 10;
```
**Traffic Sources:**
```sql
SELECT 
  COALESCE(utm_source, 'Direct') AS source,
  COUNT(DISTINCT session_id) AS sessions
FROM analytics_events
WHERE event_timestamp > NOW() - INTERVAL '7 days'
GROUP BY source
ORDER BY sessions DESC;
```
**Aggregation Strategy:**
- **Real-time queries:** Use for small date ranges (last 7 days)
- **Daily aggregates:** Pre-compute via cron job at midnight
  - Run SQL query to aggregate yesterday's data
  - Insert into `analytics_daily_aggregates`
  - Dashboard reads from aggregates table (fast, no cold start)
### 3.5 Cost & Performance Analysis
#### **Expected Supabase Storage Footprint**
**Assumptions:**
- 1,000 visitors/month
- 10 page views per visitor
- 1 KB per event (after JSONB compression)
**Calculations:**
| Event Type | Events/Month | Storage/Month |
|-----------|--------------|---------------|
| Page views | 10,000 | 10 MB |
| Product views | 3,000 | 3 MB |
| Add-to-cart | 500 | 0.5 MB |
| Checkout | 200 | 0.2 MB |
| Purchase | 100 | 0.1 MB |
| Search | 500 | 0.5 MB |
| **Total** | **14,300** | **14.3 MB/month** |
**Annual Storage:** 14.3 MB × 12 = **171.6 MB/year**
**Conclusion:** ✅ **Well within Supabase free tier (500 MB)** for first 2 years.
#### **When Archiving is Required**
- **Trigger:** When `analytics_events` table exceeds 100 MB (~7 months of data)
- **Strategy:**
  1. Export events older than 90 days to CSV
  2. Store CSV in Supabase Storage or external S3
  3. Delete events older than 90 days from table
  4. Keep `analytics_daily_aggregates` forever (minimal storage)
**Archiving Cron Job:**
```typescript
// app/api/cron/archive-analytics/route.ts
export async function GET() {
  const supabase = createServiceClient()
  
  // Export to CSV
  const { data } = await supabase
    .from('analytics_events')
    .select('*')
    .lt('event_timestamp', '90 days ago')
  
  // Upload CSV to storage
  const csv = convertToCSV(data)
  await supabase.storage.from('analytics-archive').upload(`archive-${Date.now()}.csv`, csv)
  
  // Delete old events
  await supabase
    .from('analytics_events')
    .delete()
    .lt('event_timestamp', '90 days ago')
  
  return Response.json({ archived: data.length })
}
```
#### **When Pro Tier Becomes Necessary**
**Supabase Pro ($25/month):**
- If monthly visitors > 3,000 (storage exceeds 500 MB within 1 year)
- If archiving becomes too frequent (every 2 months)
- If real-time analytics is desired (200 concurrent connections)
**Vercel Pro ($20/month):**
- If monthly events > 100,000 (exceeds Hobby invocation limit)
- If business scales to 5,000+ monthly visitors
**Cost Tipping Point:** ~3,000 monthly visitors = $45/month infrastructure cost.
#### **How Batching Reduces Vercel Invocation Costs**
**Without Batching:**
- 14,300 events/month × 1 invocation per event = **14,300 invocations/month**
- ✅ Under Vercel Hobby limit (100,000)
**With Batching (10 events per batch):**
- 14,300 events / 10 = **1,430 invocations/month**
- **90% reduction in invocations** ✅
- Reduces cold start overhead (1 cold start for 10 events instead of 1 per event)
#### **How to Avoid Performance Degradation**
1. **Index Strategy:**
   - Index on `event_timestamp` (most queries filter by date)
   - Composite index on `(event_type, event_timestamp)` for type-specific queries
   - JSONB GIN index on `event_data` for product_id lookups
2. **Query Optimization:**
   - Use `analytics_daily_aggregates` for long date ranges
   - Limit real-time queries to last 7 days
   - Avoid `COUNT(*)` on full table (use aggregates)
3. **Database Maintenance:**
   - Run `VACUUM` monthly to reclaim storage
   - Monitor slow queries via Supabase dashboard
   - Archive old data every 90 days
4. **Edge Caching:**
   - Cache dashboard API responses for 5 minutes (Vercel Edge)
   - Use `stale-while-revalidate` for charts
---
## PHASE 4 — Safeguards, Warnings, and Recommendations
### 4.1 Potential Pitfalls
| Pitfall | Impact | Mitigation |
|---------|--------|-----------|
| **Event Duplication** | User refreshes page → duplicate page_view events | Debounce events (wait 2 seconds before tracking page_view) |
| **Bot Traffic** | Bots inflate visitor counts | Filter by User-Agent (exclude known bots: Googlebot, etc.) |
| **Ad Blocker Silent Failures** | ~30% of events lost | Accept data loss; focus on relative trends, not absolute numbers |
| **localStorage Cleared** | Visitor ID resets → overcounting unique visitors | Accept limitation; use session-based metrics instead |
| **Timezone Issues** | Events timestamped in wrong timezone | Always use `TIMESTAMPTZ` and UTC on server |
| **JSONB Query Performance** | Slow queries on `event_data->>'product_id'` | Create GIN index on JSONB column |
| **Unbounded Table Growth** | Database fills up after 2 years | Implement archiving cron job |
### 4.2 Cost Traps
| Trap | Cost | Prevention |
|------|------|-----------|
| **High-Frequency Events** | 1M events/month = exceeds Supabase free tier | Avoid mouse tracking, scroll tracking; use batching |
| **Real-Time Queries** | Constant Vercel function invocations | Use daily aggregates; avoid live dashboards |
| **Storage Bloat** | `analytics_events` table > 1 GB | Archive events > 90 days; delete old data |
| **Egress Overages** | Exporting large CSVs → egress fees | Compress exports; use Supabase Storage (included in plan) |
| **Serverless Cold Starts** | Slow dashboard if querying raw events | Pre-compute aggregates via cron |
### 4.3 Over-Collection Risks
| Risk | Consequence | Recommendation |
|------|-------------|----------------|
| **Storing PII** | GDPR violation → fines | Never store email/phone in `analytics_events` |
| **Precise Geolocation** | Privacy invasion | Use country/city only (from IP, server-side) |
| **Session Replay (DOM)** | Storage explosion + privacy concerns | Avoid unless business has dedicated budget |
| **Tracking Error Messages** | Expose sensitive data (API keys in logs) | Sanitize error messages before sending |
### 4.4 Privacy Compliance Considerations
**GDPR (Europe):**
- ✅ Anonymous visitor IDs (not personally identifiable)
- ⚠️ If business ships to EU, add cookie consent banner
- ✅ Allow users to request data deletion (GDPR Article 17)
- ✅ Provide privacy policy explaining analytics usage
**Cookie Consent Banner:**
```html
<!-- Example: Display banner on first visit -->
<div id="cookie-banner">
  We use cookies to analyze site usage. By continuing, you consent.
  <button onclick="acceptCookies()">Accept</button>
</div>
```
**Data Deletion API:**
```typescript
// app/api/analytics/delete/route.ts
export async function POST(req: Request) {
  const { visitor_id } = await req.json()
  
  // Verify ownership (e.g., email confirmation)
  // Then delete:
  await supabase
    .from('analytics_events')
    .delete()
    .eq('visitor_id', visitor_id)
  
  return Response.json({ deleted: true })
}
```
### 4.5 Recommended Monitoring
**What to Monitor:**
1. **Supabase Storage Usage:**
   - Check via Supabase dashboard
   - Alert if > 80% of tier limit
2. **Vercel Invocation Count:**
   - Check via Vercel dashboard
   - Alert if > 80% of tier limit
3. **Event Insertion Errors:**
   - Log failures to external service (e.g., Sentry)
   - Alert if error rate > 5%
4. **Dashboard Query Performance:**
   - Monitor slow queries (> 2 seconds)
   - Optimize or switch to aggregates
5. **Bot Traffic:**
   - Track User-Agent distribution
   - Filter out known bots in queries
**Tools:**
- **Uptime Monitoring:** Vercel Analytics (included)
- **Error Tracking:** Sentry (free tier: 5,000 events/month)
- **Database Monitoring:** Supabase built-in dashboard
### 4.6 Long-Term Maintenance Tips
**Weekly:**
- Review dashboard for anomalies (sudden traffic spikes = bot attack?)
**Monthly:**
- Check Supabase storage usage
- Review top 10 zero-result searches (improve product catalog)
- Review 404 errors (fix broken links)
**Quarterly:**
- Run `VACUUM` on `analytics_events` table
- Export data for long-term archival
- Review conversion funnel (optimize drop-off points)
**Annually:**
- Evaluate upgrade to Supabase/Vercel Pro (if visitor count > 3K/month)
- Review privacy policy (ensure GDPR compliance)
- Audit event schema (add/remove fields as business evolves)
**Scaling Checklist:**
| Visitor Count | Action Required |
|---------------|-----------------|
| 0-1K/month | ✅ Free tier (Supabase + Vercel) |
| 1K-3K/month | ⚠️ Implement archiving (90-day retention) |
| 3K-10K/month | 💰 Upgrade to Supabase Pro ($25/month) |
| 10K-50K/month | 💰 Upgrade to Vercel Pro ($20/month) |
| 50K+/month | 🚀 Migrate to dedicated analytics SaaS (Mixpanel, Amplitude) |
---
## Summary
This analytics system is **production-ready** for a boutique e-commerce site at the current scale (1K-3K monthly visitors). It leverages the existing Next.js + Vercel + Supabase stack without introducing external dependencies or SaaS costs.
**Key Design Decisions:**
1. ✅ **Batched event tracking** (30-second flush) to minimize Vercel invocations
2. ✅ **Daily aggregates table** to avoid slow queries on large date ranges
3. ✅ **90-day retention** with archiving to prevent storage bloat
4. ✅ **Anonymous visitor IDs** (localStorage) to comply with privacy laws
5. ✅ **Server-side geolocation enrichment** (Vercel headers) for traffic source analysis
6. ❌ **No real-time dashboards** (serverless cold starts make this inefficient)
7. ❌ **No session replay** (storage explosion risk)
8. ❌ **No high-frequency heatmaps** (too many events)
**Next Steps (if proceeding to implementation):**
1. Create `analytics_events` and `analytics_daily_aggregates` tables (SQL migration)
2. Build `/lib/analytics-tracker.ts` (client-side batching)
3. Build `/app/api/analytics/track/route.ts` (ingestion endpoint)
4. Build `/admin-app/app/admin/analytiques/page.tsx` (dashboard UI)
5. Add cron job for daily aggregation (Vercel Cron or Supabase pg_cron)
6. Add cron job for 90-day archiving
7. Test with synthetic events to validate end-to-end flow
8. Deploy to production and monitor for 1 week
**Estimated Development Time:** 20-30 hours (1 week for experienced developer)
**Infrastructure Cost (first year):** $0 (within free tiers)
---
**End of Document**