const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const BusinessAgent = require('./agent/engine');
const toolRegistry = require('./lib/toolSdk');
const multiAgentCenter = require('./agent/multiAgentCenter');
const workflowEngine = require('./workflows/workflowEngine');
const security = require('./lib/security');
const aiProvider = require('./agent/aiProvider');
const onboardingWizard = require('./onboardingWizard');
const salesAgent = require('./agent/salesAgent');
const commandCenter = require('./agent/commandCenterOrchestrator');
const whatsappManager = require('./tools/whatsappManager');
const followupCadence = require('./workflows/followupCadence');
const emailDispatcher = require('./tools/emailDispatcher');

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

  // Resolve true route on Vercel (supporting rewrite parameter ?path=...)
  const subPath = (req.query && req.query.path) || (parsedUrl.query && parsedUrl.query.path);
  if (subPath) {
    const cleanSubPath = Array.isArray(subPath) ? subPath.join('/') : subPath;
    pathname = `/api/${cleanSubPath}`;
  } else if (pathname === '/api' || pathname === '/api/') {
    pathname = '/api/status';
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
          leads: commandCenter.loadCrmLeads()
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
        const result = await commandCenter.approveCampaign(body.campaignId, body.approvedLeadIds || []);
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
          businessNumber: whatsappManager.businessNumber,
          coexistence: whatsappManager.getCoexistenceStatus(),
          approvedTemplates: whatsappManager.getApprovedTemplates(),
          webhookVerifyToken: whatsappManager.webhookVerifyToken
        });
      }

      // Save or Update WhatsApp Cloud API Credentials
      if (pathname === '/api/whatsapp/config' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const configured = whatsappManager.updateConfig({
          phoneNumberId: body.phoneNumberId,
          accessToken: body.accessToken,
          webhookVerifyToken: body.webhookVerifyToken,
          businessNumber: body.businessNumber
        });

        try {
          const envPath = path.resolve(__dirname, '../.env');
          if (fs.existsSync(envPath)) {
            let envContent = fs.readFileSync(envPath, 'utf8');
            if (!envContent.includes('WHATSAPP_PHONE_NUMBER_ID=')) {
              envContent += `\nWHATSAPP_PHONE_NUMBER_ID=${body.phoneNumberId || ''}\nWHATSAPP_ACCESS_TOKEN=${body.accessToken || ''}\nWHATSAPP_BUSINESS_NUMBER=${body.businessNumber || '+919217756033'}\n`;
            } else {
              if (body.phoneNumberId) envContent = envContent.replace(/WHATSAPP_PHONE_NUMBER_ID=.*/, `WHATSAPP_PHONE_NUMBER_ID=${body.phoneNumberId}`);
              if (body.accessToken) envContent = envContent.replace(/WHATSAPP_ACCESS_TOKEN=.*/, `WHATSAPP_ACCESS_TOKEN=${body.accessToken}`);
              if (body.businessNumber) envContent = envContent.replace(/WHATSAPP_BUSINESS_NUMBER=.*/, `WHATSAPP_BUSINESS_NUMBER=${body.businessNumber}`);
            }
            fs.writeFileSync(envPath, envContent, 'utf8');
          }
        } catch (e) {
          console.warn('[Env] Could not write to .env:', e.message);
        }

        security.logAction({
          action: 'WHATSAPP_CONFIG_UPDATED',
          actor: 'Mayank Aggarwal',
          resource: 'WHATSAPP_CLOUD_API',
          details: { configured, businessNumber: whatsappManager.businessNumber }
        });

        return sendJson(res, 200, {
          success: true,
          configured,
          businessNumber: whatsappManager.businessNumber,
          coexistence: whatsappManager.getCoexistenceStatus()
        });
      }

      // Send Instant Test Message to Mayank Aggarwal's WhatsApp Number
      if (pathname === '/api/whatsapp/test-send' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const targetNumber = body.to || whatsappManager.businessNumber;
        const result = await whatsappManager.sendTestMessage(targetNumber);
        return sendJson(res, 200, result);
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

      // Automated Cold Email & SMTP Dispatcher Endpoints
      if (pathname === '/api/email/status' && req.method === 'GET') {
        return sendJson(res, 200, {
          senderEmail: emailDispatcher.senderEmail,
          senderName: emailDispatcher.senderName,
          isConfigured: emailDispatcher.isConfigured(),
          smtpHost: emailDispatcher.smtpHost,
          smtpPort: emailDispatcher.smtpPort,
          outboxCount: emailDispatcher.outbox.length,
          outbox: emailDispatcher.getOutbox(20)
        });
      }

      if (pathname === '/api/email/config' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const configured = emailDispatcher.updateConfig({
          senderEmail: body.senderEmail,
          senderName: body.senderName,
          smtpPass: body.smtpPass,
          smtpHost: body.smtpHost,
          smtpPort: body.smtpPort
        });

        try {
          const envPath = path.resolve(__dirname, '../.env');
          if (fs.existsSync(envPath)) {
            let envContent = fs.readFileSync(envPath, 'utf8');
            if (body.smtpPass) {
              if (envContent.includes('GMAIL_APP_PASSWORD=')) {
                envContent = envContent.replace(/GMAIL_APP_PASSWORD=.*/, `GMAIL_APP_PASSWORD=${body.smtpPass}`);
              } else {
                envContent += `\nGMAIL_APP_PASSWORD=${body.smtpPass}\n`;
              }
            }
            fs.writeFileSync(envPath, envContent, 'utf8');
          }
        } catch (e) {}

        return sendJson(res, 200, {
          success: true,
          configured,
          senderEmail: emailDispatcher.senderEmail,
          message: configured ? 'SMTP Email Dispatcher is LIVE!' : 'Email configuration saved.'
        });
      }

      if (pathname === '/api/email/test-send' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const target = body.to || emailDispatcher.senderEmail;
        const result = await emailDispatcher.sendTestEmail(target);
        return sendJson(res, 200, result);
      }

      // Dispatch single email directly to a lead
      if (pathname === '/api/email/dispatch-single' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const result = await emailDispatcher.sendEmail({
          to: body.email,
          subject: body.subject || `Quick question regarding ${body.businessName}`,
          text: body.body || '',
          html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;"><p>${(body.body || '').replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p></div>`,
          leadName: body.businessName,
          campaignId: body.campaignId || 'MANUAL'
        });

        // Update lead in CRM
        const crmLeads = commandCenter.loadCrmLeads();
        const updated = crmLeads.map(l => l.id === body.leadId ? { ...l, crmStage: 'PROPOSAL_SENT', approvalStatus: 'APPROVED' } : l);
        commandCenter.saveCrmLeads(updated);

        return sendJson(res, 200, { success: true, result, leadId: body.leadId });
      }

      // CRM Leads endpoint
      if (pathname === '/api/crm/leads' && req.method === 'GET') {
        return sendJson(res, 200, { leads: commandCenter.loadCrmLeads() });
      }

      // AI Settings configuration
      if (pathname === '/api/settings/ai' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        if (body.geminiKey) {
          process.env.GEMINI_API_KEY = body.geminiKey.trim();
          aiProvider.geminiKey = body.geminiKey.trim();
        }
        if (body.openaiKey) {
          process.env.OPENAI_API_KEY = body.openaiKey.trim();
          aiProvider.openaiKey = body.openaiKey.trim();
        }
        return sendJson(res, 200, {
          success: true,
          hasCustomKey: aiProvider.hasCustomKey(),
          message: 'AI Provider settings updated.'
        });
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

      return sendJson(res, 404, { error: 'API route not found', path: pathname });
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
