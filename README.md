# BizAgent — Autonomous B2B Operations & Growth Agent

BizAgent is an AI-powered agent orchestrator designed to run end-to-end B2B client acquisition, lead enrichment, CRM synchronization, cold email outreach, meeting scheduling, omnichannel customer support, and digital contract signing.

---

## 🏗 Architecture & Integrated Tech Stack

BizAgent connects seven open-source systems into an autonomous business engine:

| Tool | Category | Role |
| :--- | :--- | :--- |
| [**google-maps-scraper**](https://github.com/gosom/google-maps-scraper) | **Lead Generation** | High-speed scraping of local businesses, phone numbers, and websites from Google Maps. |
| [**crawl4ai**](https://github.com/unclecode/crawl4ai) / **SiteEnricher** | **Lead Enrichment** | Deep crawl of target websites to extract decision-maker emails, phone numbers, and social profiles. |
| [**twenty**](https://github.com/twentyhq/twenty) | **CRM** | Modern open-source CRM for tracking leads, contacts, deals, and sales pipelines. |
| [**listmonk**](https://github.com/knadh/listmonk) | **Email Marketing** | Self-hosted email newsletter and cold outreach engine for automated drip campaigns. |
| [**cal.com**](https://github.com/calcom/cal.diy) | **Scheduling** | Booking infrastructure for scheduling discovery calls and demos. |
| [**chatwoot**](https://github.com/chatwoot/chatwoot) | **Omnichannel Support** | Customer messaging and live chat for website visitors, WhatsApp, and email. |
| [**documenso**](https://github.com/documenso/documenso) | **E-Signatures** | Digital contract and proposal signing platform. |

---

## 📁 Project Structure

```
my-busines/
├── config/
│   └── business_profile.json   # Your business niche, services, ICP, pricing, templates
├── src/
│   ├── agent/
│   │   ├── engine.js           # Core AI agent orchestrator
│   │   └── prompts.js          # High-converting sales & objection handling prompts
│   ├── tools/
│   │   ├── mapsLeadFinder.js   # Scrapes / discovers B2B leads
│   │   ├── siteEnricher.js     # Crawls websites for emails, phones & socials
│   │   ├── twentyCrm.js        # Twenty CRM REST/GraphQL connector
│   │   ├── listmonkMailer.js   # Listmonk outreach connector
│   │   ├── calcomScheduler.js  # Cal.com scheduling & booking link generator
│   │   ├── chatwootSupport.js  # Chatwoot omnichannel chat connector
│   │   └── documensoContracts.js # Documenso digital contract signing connector
│   └── cli.js                  # Command Line Interface (CLI) runner
├── .env.example                # Sample environment variables
├── .env                        # Local configuration & API keys
└── package.json
```

---

## 🚀 Quick Start

### 1. View Agent & Connector Status
```bash
node src/cli.js status
```

### 2. Run the Autonomous B2B Lead Pipeline
Scrapes leads, enriches contacts, generates AI pitches, pushes to Twenty CRM, and queues Listmonk outreach:
```bash
node src/cli.js pipeline --query "Dentists" --location "Dallas, TX" --count 5
```

### 3. Enrich Any Business Website
Extracts verified emails, phone numbers, and social links from any website:
```bash
node src/cli.js enrich --url "https://stripe.com"
```

### 4. Generate a Personalized Outreach Email
```bash
node src/cli.js pitch --name "Apex Logistics" --industry "Freight & Logistics"
```

### 5. Test AI Customer Support Auto-Reply
```bash
node src/cli.js reply --message "What are your monthly pricing packages and deliverables?"
```

### 6. Prepare a Digital Contract Signing Draft
```bash
node src/cli.js contract --client "Acme Corp" --email "ceo@acme.com"
```

---

## ⚙️ Customizing with Your Business Details

Edit `config/business_profile.json` with:
- **Business Name & Industry**
- **Core Offerings & Pricing Packages**
- **Target Audience & Ideal Customer Profile (ICP)**
- **Value Propositions & Pain Points**
- **Outreach Email Templates**

Whenever you update `config/business_profile.json`, the agent immediately uses the new details in every pitch, customer reply, and pipeline execution.

