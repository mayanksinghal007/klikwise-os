/**
 * KLIKWise OS — Security & Governance Engine
 * Implements Role-Based Access Control (RBAC), Human-in-the-Loop Approval Gates,
 * Prompt Injection Sanitization, and Immutable Audit Logging.
 */

const fs = require('fs');
const path = require('path');

// Role Hierarchy & Permissions Definition
const ROLES = {
  OWNER: ['*'],
  ADMIN: [
    'LEADS_VIEW', 'LEADS_SCRAPE', 'LEADS_EXPORT',
    'CRM_VIEW', 'CRM_EDIT', 'CRM_DELETE',
    'EMAIL_VIEW', 'EMAIL_DRAFT', 'EMAIL_SEND',
    'RESEARCH_VIEW', 'RESEARCH_RUN',
    'PROPOSALS_CREATE', 'PROPOSALS_SEND',
    'AGENTS_MANAGE', 'AGENTS_INVOKE',
    'WORKFLOWS_MANAGE', 'WORKFLOWS_RUN',
    'SETTINGS_VIEW', 'SETTINGS_EDIT',
    'AUDIT_VIEW'
  ],
  MANAGER: [
    'LEADS_VIEW', 'LEADS_SCRAPE', 'LEADS_EXPORT',
    'CRM_VIEW', 'CRM_EDIT',
    'EMAIL_VIEW', 'EMAIL_DRAFT', 'EMAIL_SEND',
    'RESEARCH_VIEW', 'RESEARCH_RUN',
    'PROPOSALS_CREATE', 'PROPOSALS_SEND',
    'AGENTS_INVOKE', 'WORKFLOWS_RUN',
    'AUDIT_VIEW'
  ],
  SALES: [
    'LEADS_VIEW', 'LEADS_SCRAPE',
    'CRM_VIEW', 'CRM_EDIT',
    'EMAIL_VIEW', 'EMAIL_DRAFT',
    'RESEARCH_VIEW',
    'PROPOSALS_CREATE',
    'AGENTS_INVOKE'
  ],
  MARKETING: [
    'LEADS_VIEW',
    'EMAIL_VIEW', 'EMAIL_DRAFT', 'EMAIL_SEND',
    'RESEARCH_VIEW', 'RESEARCH_RUN',
    'AGENTS_INVOKE'
  ],
  CLIENT: [
    'PROJECTS_VIEW', 'DOCUMENTS_VIEW', 'CHAT_USE'
  ],
  VIEWER: [
    'LEADS_VIEW', 'CRM_VIEW', 'RESEARCH_VIEW'
  ]
};

class SecurityEngine {
  constructor(auditLogPath) {
    this.auditLogPath = auditLogPath || path.resolve(__dirname, '../../data/audit_logs.jsonl');
    this.ensureLogDir();
  }

  ensureLogDir() {
    const dir = path.dirname(this.auditLogPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Check if a given role has permission to execute an action
   */
  hasPermission(role, action) {
    const perms = ROLES[role];
    if (!perms) return false;
    if (perms.includes('*') || perms.includes(action)) return true;
    return false;
  }

  /**
   * Evaluates if an action requires a Human-in-the-Loop approval gate
   */
  requiresApproval(action, context = {}) {
    const sensitiveActions = [
      'EMAIL_SEND_BULK',
      'DOCUMENSO_EXECUTE_CONTRACT',
      'DATABASE_PURGE_LEADS',
      'API_KEY_ROTATION'
    ];

    if (sensitiveActions.includes(action)) {
      return {
        required: true,
        reason: `Action ${action} has high business consequence and requires explicit human verification.`
      };
    }

    return { required: false };
  }

  /**
   * Sanitizes untrusted text (e.g. scraped websites, incoming emails) to defend against Prompt Injection
   */
  sanitizeUntrustedInput(rawText) {
    if (typeof rawText !== 'string') return '';

    // Patterns used in prompt injection attacks
    const maliciousPatterns = [
      /ignore\s+(all\s+)?(previous|prior)\s+instructions/gi,
      /you\s+are\s+now\s+in\s+developer\s+mode/gi,
      /system\s+override/gi,
      /disregard\s+the\s+above/gi,
      /reveal\s+your\s+(system\s+)?prompt/gi,
      /output\s+all\s+environment\s+variables/gi
    ];

    let sanitized = rawText;
    for (const pattern of maliciousPatterns) {
      sanitized = sanitized.replace(pattern, '[FILTERED_SUSPICIOUS_PROMPT]');
    }

    return sanitized;
  }

  /**
   * Appends an immutable audit log entry
   */
  logAction({ action, actor = 'SYSTEM', resource = 'SYSTEM', details = {}, status = 'SUCCESS' }) {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      actor,
      resource,
      details,
      status
    };

    try {
      fs.appendFileSync(this.auditLogPath, JSON.stringify(entry) + '\n', 'utf8');
    } catch (err) {
      console.error('[SecurityEngine] Failed to write audit log:', err.message);
    }
    return entry;
  }

  /**
   * Reads recent audit logs
   */
  getRecentAuditLogs(limit = 50) {
    try {
      if (!fs.existsSync(this.auditLogPath)) return [];
      const lines = fs.readFileSync(this.auditLogPath, 'utf8').trim().split('\n').filter(Boolean);
      return lines.slice(-limit).map(line => {
        try { return JSON.parse(line); } catch { return null; }
      }).filter(Boolean).reverse();
    } catch (err) {
      return [];
    }
  }
}

module.exports = new SecurityEngine();

