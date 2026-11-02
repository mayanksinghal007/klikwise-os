/**
 * KLIKWise OS — Multi-Agent AI Workforce (12 Specialized Agents)
 * Central Orchestrator: KLIKWISE AI
 * Coordinated Workforce sharing unified context, database, and strict pricing rules.
 */

const toolRegistry = require('../lib/toolSdk');
const security = require('../lib/security');
const salesAgent = require('./salesAgent');
const commandCenter = require('./commandCenterOrchestrator');
const followupCadence = require('../workflows/followupCadence');

const SPECIALIZED_12_AGENTS = [
  {
    id: 'agent_command_center',
    name: 'Command Center Agent',
    role: 'Natural Language Workflow Orchestrator',
    description: 'Understands complex business instructions and coordinates multi-step agency operations.',
    tools: ['google_maps_scrape', 'crawl4ai_enrich', 'twenty_crm_sync', 'listmonk_outreach'],
    systemPrompt: 'You parse natural language commands, formulate search plans, and coordinate multi-agent execution.'
  },
  {
    id: 'agent_business_research',
    name: 'Business Research Agent',
    role: 'Market & Prospect Discovery',
    description: 'Discovers verified commercial businesses on Google Maps and extracts publicly available contact data.',
    tools: ['google_maps_scrape', 'crawl4ai_enrich'],
    systemPrompt: 'Extract accurate business directories, public contact points, and verified social profiles.'
  },
  {
    id: 'agent_lead_qualification',
    name: 'Lead Qualification Agent',
    role: 'Explainable ICP Lead Scoring',
    description: 'Calculates 0–100 lead scores based on industry fit, website presence, and contactability.',
    tools: [],
    systemPrompt: 'Evaluate business fit against KLIKWise target sectors. Explain scoring factors transparently.'
  },
  {
    id: 'agent_personalisation',
    name: 'Personalisation Agent',
    role: 'Tailored Hook & Angle Formulation',
    description: 'Reviews prospect websites and crafts bespoke outreach referencing their specific product line and opportunities.',
    tools: ['crawl4ai_enrich'],
    systemPrompt: 'Never generate generic copy. Formulate genuine business observations and relevant growth angles.'
  },
  {
    id: 'agent_email_outreach',
    name: 'Email Outreach Agent',
    role: 'Compliant Email Delivery & Tracking',
    description: 'Manages authenticated cold email sequences, bounce prevention, and reply classification.',
    tools: ['listmonk_outreach'],
    systemPrompt: 'Ensure compliant, permission-based email sequences with clear credibility points and portfolio links.'
  },
  {
    id: 'agent_whatsapp',
    name: 'WhatsApp Business Agent',
    role: 'Official Meta Cloud API & Coexistence',
    description: 'Handles 24h customer service conversations, template approvals, and strict opt-in compliance.',
    tools: [],
    systemPrompt: 'Strictly observe Meta WhatsApp policies. Enforce opt-in rules and pre-approved templates.'
  },
  {
    id: 'agent_sales',
    name: 'AI Sales Representative',
    role: 'Discovery, Objection Handling & Closing',
    description: 'Represents KLIKWise and Mayank Aggarwal in customer discovery, shares portfolio, and handles objections.',
    tools: [],
    systemPrompt: 'Be consultative, confident, and commercially sharp. Never promise guaranteed ROAS or unlisted discounts.'
  },
  {
    id: 'agent_pricing',
    name: 'Pricing & Rate Card Agent',
    role: 'Approved Pricing Integrity',
    description: 'Enforces official INR pricing across all Meta, Google, AI Video, UGC, and web development services (NO SEO).',
    tools: [],
    systemPrompt: 'Quote only from the official KLIKWise rate card. Strictly decline SEO inquiries.'
  },
  {
    id: 'agent_proposal',
    name: 'Proposal & SOW Agent',
    role: 'Formal SOW & Quotation Generator',
    description: 'Generates branded PDF/HTML service proposals with transparent deliverables, milestones, and payment terms.',
    tools: ['documenso_contract'],
    systemPrompt: 'Format crystal-clear project scope documents with two revision rounds and client-owned ad spend notes.'
  },
  {
    id: 'agent_followup',
    name: 'Follow-Up Cadence Agent',
    role: 'Day 0, 3, 7, 14 Lifecycle Manager',
    description: 'Executes timed follow-up touches, automatically pausing when a prospect replies.',
    tools: [],
    systemPrompt: 'Deliver value-added insights in follow-ups rather than generic check-ins. Immediately halt on opt-outs.'
  },
  {
    id: 'agent_crm',
    name: 'CRM Pipeline Agent',
    role: '14-Stage Pipeline Management',
    description: 'Synchronizes all activities, conversations, deals, and stages in the central CRM database.',
    tools: ['twenty_crm_sync'],
    systemPrompt: 'Maintain real-time pipeline integrity across all 14 sales stages without duplicate records.'
  },
  {
    id: 'agent_reporting',
    name: 'Reporting & Analytics Agent',
    role: 'Performance & Executive Briefings',
    description: 'Generates bi-weekly client performance briefings and daily founder executive summaries.',
    tools: [],
    systemPrompt: 'Synthesize real unit economics (CAC, CPL, ROAS, qualified leads) into concise executive dashboards.'
  }
];

class MultiAgentOrchestrator {
  constructor() {
    this.agents = new Map();
    for (const agent of SPECIALIZED_12_AGENTS) {
      this.agents.set(agent.id, agent);
    }
  }

  listAgents() {
    return Array.from(this.agents.values()).map(a => ({
      id: a.id,
      name: a.name,
      role: a.role,
      description: a.description,
      toolCount: a.tools.length
    }));
  }

  getAgent(agentId) {
    return this.agents.get(agentId);
  }

  /**
   * Orchestrate natural language requests through the 12 specialized agents
   */
  async orchestrate({ instruction, context = {} }) {
    const startTime = Date.now();
    const sanitizedInstruction = security.sanitizeUntrustedInput(instruction);
    const lower = sanitizedInstruction.toLowerCase();

    // 1. Natural Language Command Center execution (e.g., "Find 10 D2C fashion brands in Delhi")
    if (lower.startsWith('find') || lower.includes('search') || lower.includes('scrape') || lower.includes('brands in') || lower.includes('stores in') || lower.includes('businesses in')) {
      const mode = context.mode || 'APPROVAL_MODE';
      const execution = await commandCenter.executeCommand(sanitizedInstruction, mode, context.user || 'Mayank Aggarwal');
      return {
        orchestrator: 'KLIKWISE AI',
        assignedAgent: this.agents.get('agent_command_center'),
        instruction: sanitizedInstruction,
        executionPlan: execution,
        durationMs: Date.now() - startTime,
        summary: `Command Center Agent formulated search plan and discovered ${execution.leads.length} qualified leads for "${execution.plan.niche}" in "${execution.plan.location}".`
      };
    }

    // 2. Sales / Pricing / Objection conversation
    if (lower.includes('price') || lower.includes('cost') || lower.includes('portfolio') || lower.includes('roas') || lower.includes('seo') || lower.includes('discount')) {
      const salesResult = await salesAgent.handleSalesConversation(sanitizedInstruction, [], context);
      return {
        orchestrator: 'KLIKWISE AI',
        assignedAgent: this.agents.get('agent_sales'),
        instruction: sanitizedInstruction,
        salesResponse: salesResult,
        durationMs: Date.now() - startTime,
        summary: salesResult.reply
      };
    }

    // 3. Default CEO / Executive Assistant routing
    const defaultAgent = this.agents.get('agent_command_center');
    return {
      orchestrator: 'KLIKWISE AI',
      assignedAgent: defaultAgent,
      instruction: sanitizedInstruction,
      durationMs: Date.now() - startTime,
      summary: `KLIKWISE AI received your instruction. Try entering an actionable command such as: "Find 10 D2C women's fashion brands in Delhi" or "Find 15 real estate businesses in Gurgaon".`
    };
  }
}

module.exports = new MultiAgentOrchestrator();
