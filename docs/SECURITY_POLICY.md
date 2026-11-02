# KLIKWise OS — Security & Governance Policy

## 1. Zero-Trust Architecture

1. **Untrusted Data Isolation**: All data obtained from external web crawlers (`crawl4ai`), Google Maps scraping, or incoming customer emails (`chatwoot`) is treated as untrusted text.
2. **Prompt Injection Shielding**: Any prompt fed into the LLM runtime passes through the `SecurityEngine.sanitizeUntrustedInput()` filter, stripping jailbreak vectors and directive overrides.
3. **Least Privilege Principle**: All tools and system capabilities require granular permission tokens (e.g. `LEADS_SCRAPE`, `CRM_EDIT`, `PROPOSALS_CREATE`, `EMAIL_SEND`).

---

## 2. Role-Based Access Control (RBAC) Matrix

| Permission | OWNER | ADMIN | MANAGER | SALES | MARKETING | CLIENT | VIEWER |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `LEADS_VIEW` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `LEADS_SCRAPE` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `CRM_EDIT` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `EMAIL_DRAFT` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `EMAIL_SEND` | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `PROPOSALS_CREATE` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `PROPOSALS_SEND` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `SETTINGS_EDIT` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `AUDIT_VIEW` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 3. Human-In-The-Loop Approval Gates

The following actions trigger a mandatory approval gate:
- `EMAIL_SEND_BULK`: Outbound email blasts over 10 recipients.
- `DOCUMENSO_EXECUTE_CONTRACT`: Dispatching a legally binding proposal or agreement.
- `DATABASE_PURGE_LEADS`: Deleting customer records or deal history.
- `API_KEY_ROTATION`: Modifying environment tokens or upstream credentials.

---

## 4. Immutable Audit Trail

Every tool execution, parameter set, timestamp, user context, and outcome status is permanently recorded in `data/audit_logs.jsonl`.
Logs cannot be edited through the user interface and are preserved for compliance.

