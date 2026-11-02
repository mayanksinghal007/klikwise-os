const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const BusinessAgent = require('./agent/engine');
const toolRegistry = require('./lib/toolSdk');
const multiAgentCenter = require('./agent/multiAgentCenter');
const workflowEngine = require('./workflows/workflowEngine');
const security = require('./lib/security');
const onboardingWizard = require('./onboardingWizard');
const salesAgent = require('./agent/salesAgent');
const commandCenter = require('./agent/commandCenterOrchestrator');
const whatsappManager = require('./tools/whatsappManager');
const followupCadence = require('./workflows/followupCadence');

const agent = new BusinessAgent();
const PORT = process.env.PORT || 3300;

let currentOperatingMode = 'APPROVAL_MODE'; // RESEARCH_MODE, APPROVAL_MODE (Default), CONTROLLED_AUTOMATION

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

function parseJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return Promise.resolve(req.body);
  }
  if (req.body && typeof req.body === 'string') {
    try {
      return Promise.resolve(JSON.parse(req.body));
    } catch (e) {
      return Promise.resolve({});
    }
  }
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

async function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Support Vercel serverless [...slug] route fallback
  if (req.query && req.query.slug) {
    const slug = Array.isArray(req.query.slug) ? req.query.slug.join('/') : req.query.slug;
    if (!pathname.includes(slug)) {
      pathname = `/api/${slug}`;
    }
  }

  // Handle CORS Pre-flight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // --- API Routes ---
  if (pathname.startsWith('/api')) {
    try {
      // 1. Status / Overview
      if ((pathname === '/api/status' || pathname === '/api' || pathname === '/api/') && req.method === 'GET') {
        const tools = toolRegistry.listAll();
        const agents = multiAgentCenter.listAgents();
        const workflows = workflowEngine.listWorkflows();
        const auditLogs = security.getRecentAuditLogs(20);
        const onboardingStatus = onboardingWizard.calculateCompleteness();
        const activeSequences = followupCadence.listActiveSequences();

        return sendJson(res, 200, {
          product: 'KLIKWise OS',
          version: '2.0.0',
          operatingMode: currentOperatingMode,
          status: 'ONLINE',
          founder: 'Mayank Aggarwal',
          profile: agent.profile,
          onboarding: onboardingStatus,
          tools,
          agents,
          workflows,
          activeSequences,
          auditLogs,
          leads: [
            { id: 'l1', businessName: 'Zivame Fashion Hub', category: "D2C Women's Fashion", website: 'https://zivame.example.com', phone: '+91 9811122334', leadScore: 94, crmStage: 'QUALIFIED' },
            { id: 'l2', businessName: 'Nykaa Luxe Delhi', category: 'Beauty & Cosmetics', website: 'https://nykaa.example.com', phone: '+91 9811133445', leadScore: 92, crmStage: 'OUTREACH_READY' },
            { id: 'l3', businessName: 'DLF Luxury Estates', category: 'Real Estate', website: 'https://dlf.example.com', phone: '+91 9811144556', leadScore: 88, crmStage: 'PROPOSAL_SENT' }
          ]
        });
      }

      // 2. Command Center: Execute Natural Language Command
      if (pathname === '/api/command-center/execute' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const prompt = body.prompt || "Find 10 D2C women's fashion brands in Delhi.";
        const execution = await commandCenter.executeCommand(prompt, currentOperatingMode, 'Mayank Aggarwal');
        return sendJson(res, 200, execution);
      }

      // 3. Command Center: Human Approval Gate
      if (pathname === '/api/command-center/approve' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const result = commandCenter.approveCampaign(body.campaignId, body.approvedLeadIds || []);
        
        // Also enroll approved leads into Follow-Up Cadence
        const campaign = commandCenter.pendingCampaigns.get(body.campaignId);
        if (campaign) {
          for (const lead of campaign.leads) {
            if (lead.approvalStatus === 'APPROVED') {
              followupCadence.enrollLead(lead);
            }
          }
        }
        return sendJson(res, 200, result);
      }

      // 4. Autonomous AI Sales Agent Chat
      if (pathname === '/api/sales-agent/chat' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const response = await salesAgent.handleSalesConversation(
          body.message || '',
          body.history || [],
          body.context || {}
        );
        return sendJson(res, 200, response);
      }

      // 5. Generate Formal Proposal & SOW
      if (pathname === '/api/proposals/generate' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const proposal = salesAgent.generateProposal({
          clientName: body.clientName || 'Valued Client',
          clientEmail: body.clientEmail || 'client@example.com',
          servicePackage: body.servicePackage || 'performance',
          budgetInr: body.budgetInr || '₹25,000/month',
          customNotes: body.customNotes || ''
        });
        return sendJson(res, 200, proposal);
      }

      // 6. WhatsApp Cloud API & Coexistence Endpoints
      if (pathname === '/api/whatsapp/status' && req.method === 'GET') {
        return sendJson(res, 200, {
          isConfigured: whatsappManager.isConfigured(),
          coexistence: whatsappManager.getCoexistenceStatus(),
          approvedTemplates: whatsappManager.getApprovedTemplates()
        });
      }

      if (pathname === '/api/whatsapp/send' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const result = await whatsappManager.sendMessage({
          to: body.to,
          text: body.text,
          templateName: body.templateName,
          hasOptIn: Boolean(body.hasOptIn)
        });
        return sendJson(res, 200, result);
      }

      // Meta Webhook Handshake (GET)
      if (pathname === '/api/whatsapp/webhook' && req.method === 'GET') {
        const verification = whatsappManager.verifyWebhook(parsedUrl.query);
        if (verification.verified) {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end(verification.challenge);
          return;
        }
        return sendJson(res, 403, { error: 'Verification token mismatch' });
      }

      // Meta Webhook Inbound Events (POST)
      if (pathname === '/api/whatsapp/webhook' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const result = await whatsappManager.processIncomingWebhook(body);
        return sendJson(res, 200, result);
      }

      // 7. Follow-Up Manager
      if (pathname === '/api/followups' && req.method === 'GET') {
        return sendJson(res, 200, { sequences: followupCadence.listActiveSequences() });
      }

      // 8. CRM 14-Stage Pipeline Data
      if (pathname === '/api/crm/pipeline' && req.method === 'GET') {
        const stages = [
          'New Lead', 'Researched', 'Qualified', 'Outreach Ready',
          'Contacted', 'Replied', 'Interested', 'Discovery',
          'Proposal Sent', 'Negotiation', 'Won', 'Lost',
          'Follow-up Required', 'Unsubscribed / Do Not Contact'
        ];
        return sendJson(res, 200, { stages });
      }

      // 9. Operating Mode Switcher (Research, Approval, Controlled Automation)
      if (pathname === '/api/settings/mode' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        if (['RESEARCH_MODE', 'APPROVAL_MODE', 'CONTROLLED_AUTOMATION'].includes(body.mode)) {
          currentOperatingMode = body.mode;
          security.logAction({
            action: 'OPERATING_MODE_CHANGED',
            actor: 'Mayank Aggarwal',
            resource: 'SYSTEM_SETTINGS',
            details: { newMode: currentOperatingMode }
          });
          return sendJson(res, 200, { success: true, operatingMode: currentOperatingMode });
        }
        return sendJson(res, 400, { error: 'Invalid mode' });
      }

      // 10. Multi-Agent Orchestration (KLIKWISE AI)
      if (pathname === '/api/orchestrate' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const result = await multiAgentCenter.orchestrate({
          instruction: body.instruction,
          context: { ...body.context, mode: currentOperatingMode }
        });
        return sendJson(res, 200, result);
      }

      // 11. Tool Execution Engine
      if (pathname === '/api/tools/execute' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const result = await toolRegistry.execute(body.toolId, body.input || {}, body.context || {});
        return sendJson(res, 200, result);
      }

      // 12. Audit Logs
      if (pathname === '/api/audit-logs' && req.method === 'GET') {
        return sendJson(res, 200, { logs: security.getRecentAuditLogs(50) });
      }

      return sendJson(res, 404, { error: 'API route not found' });
    } catch (err) {
      console.error('[API Error]', err);
      return sendJson(res, 500, { error: err.message });
    }
  }

  // --- Static File Serving ---
  let filePath = path.resolve(__dirname, '../public', pathname === '/' ? 'index.html' : pathname.slice(1));
  if (!fs.existsSync(filePath)) {
    filePath = path.resolve(__dirname, '../public/index.html');
  }

  const ext = path.extname(filePath);
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Server Error loading asset');
    } else {
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(content);
    }
  });
}

const server = http.createServer(handleRequest);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`\n=========================================================`);
    console.log(`  🚀 KLIKWise OS v2.0 Running at http://localhost:${PORT}`);
    console.log(`  👑 Founder: Mayank Aggarwal | Agency Growth OS`);
    console.log(`  ⚡ 17 Modules, 12 Specialized Agents & Command Center Ready`);
    console.log(`=========================================================\n`);
  });
}

module.exports = server;
module.exports.handleRequest = handleRequest;
