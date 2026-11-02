# KLIKWise OS — Production Operator Runbook

## 1. System Overview

KLIKWise OS is an autonomous business operating system that connects seven open-source engines:
- **`gosom/google-maps-scraper`**: B2B local business discovery & lead scraping (port 8080)
- **`unclecode/crawl4ai`**: Playwright-based website intelligence and contact extraction (port 11235)
- **`twentyhq/twenty`**: Multi-tenant CRM for companies, contacts, and deal pipelines (port 3000)
- **`knadh/listmonk`**: High-throughput newsletter, broadcast, and cold email outreach (port 9000)
- **`calcom/cal.diy`**: Scheduling infrastructure & calendar synchronization (port 3001)
- **`chatwoot/chatwoot`**: Omnichannel live chat, WhatsApp, and customer support inbox (port 3002)
- **`documenso/documenso`**: Digital contract authoring and e-signatures (port 3003)
- **`klikwise-core`**: Central command center, multi-agent AI workforce, and API gateway (port 3300)

---

## 2. Quick Operations

### Local Execution (Node.js)
```bash
# Start Web UI & API Server
npm start

# Run Automated Tests
npm test

# Run CLI Pipeline
npm run pipeline -- --query "Dentists" --location "Chicago, IL" --count 5
```

### Production Docker Deployment
```bash
# Spin up complete stack in detached mode
docker compose -f docker-compose.prod.yml up -d

# Verify all containers are healthy
docker compose -f docker-compose.prod.yml ps

# View live service logs
docker compose -f docker-compose.prod.yml logs -f klikwise-core
```

---

## 3. Database Management & Migrations

The database is powered by PostgreSQL 15+ with `pgvector` for RAG knowledge storage:
```bash
# Run Prisma schema migrations
npx prisma migrate deploy

# Open visual database browser
npx prisma studio
```

---

## 4. Backups & Disaster Recovery

### Automated PostgreSQL Backup
```bash
docker exec -t klikwise_postgres pg_dumpall -c -U postgres > backup_$(date +%Y%m%d).sql
```

### Restoring from Backup
```bash
cat backup_YYYYMMDD.sql | docker exec -i klikwise_postgres psql -U postgres -d klikwise_prod
```

---

## 5. Security & Incident Response

- **Audit Logs**: All tool executions and human approval gates are appended to `data/audit_logs.jsonl`.
- **Prompt Injection Defense**: Inbound website scrapes and emails are scrubbed by `SecurityEngine.sanitizeUntrustedInput()` before LLM inference.
- **Human Approval Escalation**: Bulk emails (`EMAIL_SEND_BULK`) and contract executions (`DOCUMENSO_EXECUTE_CONTRACT`) are automatically suspended until approved by an `ADMIN` or `OWNER` user.

