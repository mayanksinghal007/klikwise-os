# KLIKWise OS — REST API & Tool SDK Reference

Base URL: `http://localhost:3300/api`

---

## 1. System Endpoints

### `GET /api/status`
Returns high-level system diagnostics, registered tools, active agents, current business profile, and onboarding setup progress.

**Response `200 OK`:**
```json
{
  "product": "KLIKWise OS",
  "version": "1.0.0",
  "status": "ONLINE",
  "onboarding": {
    "completionPercentage": 60,
    "isFullyConfigured": false,
    "completedItems": ["Company Name", "Industry & Niche"],
    "missingItems": ["Cal.com Booking URL"]
  },
  "tools": [...],
  "agents": [...]
}
```

---

## 2. Multi-Agent Orchestration

### `POST /api/orchestrate`
Routes a high-level natural language instruction through the central **KLIKWISE AI** orchestrator to the appropriate specialist agent.

**Request:**
```json
{
  "instruction": "Find 10 dental clinics on Google Maps in Austin, TX",
  "context": { "user": "founder@klikwise.com", "role": "OWNER" }
}
```

**Response `200 OK`:**
```json
{
  "orchestrator": "KLIKWISE AI",
  "assignedAgent": {
    "id": "agent_lead_generator",
    "name": "Lead Generation Agent",
    "role": "B2B Prospect Discovery"
  },
  "durationMs": 42,
  "summary": "Assigned to Lead Generation Agent. Successfully planned and evaluated task execution."
}
```

---

## 3. Tool Execution Engine

### `POST /api/tools/execute`
Executes an integrated upstream tool through the standardized Tool SDK interface with RBAC enforcement and immutable audit logging.

**Request:**
```json
{
  "toolId": "crawl4ai_enrich",
  "input": { "url": "https://stripe.com" },
  "context": { "role": "MANAGER", "isApproved": true }
}
```

**Response `200 OK`:**
```json
{
  "status": "SUCCESS",
  "toolId": "crawl4ai_enrich",
  "durationMs": 280,
  "data": {
    "valid": true,
    "title": "Stripe | Financial Infrastructure",
    "emails": ["support@stripe.com"],
    "socials": { "twitter": "https://twitter.com/stripe" }
  }
}
```

---

## 4. Autonomous Lead Pipeline

### `POST /api/pipeline`
Executes the automated 5-step growth workflow:
1. Google Maps B2B search
2. Crawl4AI website contact enrichment
3. Personalized pitch generation
4. Twenty CRM company and deal synchronization
5. Listmonk cold outreach campaign enrollment

**Request:**
```json
{
  "query": "Commercial Real Estate",
  "location": "Dallas, TX",
  "count": 5
}
```

---

## 5. Onboarding Wizard

### `POST /api/onboarding`
Updates the business knowledge base and recalculates the onboarding completion meter.

**Request:**
```json
{
  "business": {
    "name": "KLIKWise Digital",
    "industry": "Performance Marketing",
    "website": "https://klikwise.com"
  }
}
```

