/**
 * KLIKWise OS — Standardized Tool SDK & Registry
 * Provides a uniform interface for all 7 upstream repositories and system capabilities.
 */

const security = require('./security');
const MapsLeadFinder = require('../tools/mapsLeadFinder');
const SiteEnricher = require('../tools/siteEnricher');
const TwentyCrm = require('../tools/twentyCrm');
const ListmonkMailer = require('../tools/listmonkMailer');
const CalcomScheduler = require('../tools/calcomScheduler');
const ChatwootSupport = require('../tools/chatwootSupport');
const DocumensoContracts = require('../tools/documensoContracts');

class ToolRegistry {
  constructor() {
    this.tools = new Map();
    this.initDefaultTools();
  }

  /**
   * Register a standardized tool
   */
  register(toolDef) {
    if (!toolDef.id || typeof toolDef.execute !== 'function') {
      throw new Error(`Invalid tool definition: must have 'id' and 'execute' function.`);
    }
    this.tools.set(toolDef.id, toolDef);
  }

  get(toolId) {
    return this.tools.get(toolId);
  }

  listAll() {
    return Array.from(this.tools.values()).map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      requiredPermission: t.requiredPermission,
      originRepo: t.originRepo,
      requiresApproval: t.requiresApproval || false
    }));
  }

  /**
   * Execute a tool with security checks and audit logging
   */
  async execute(toolId, input, context = {}) {
    const tool = this.tools.get(toolId);
    if (!tool) {
      throw new Error(`Tool not found: ${toolId}`);
    }

    const role = context.role || 'MANAGER';
    if (!security.hasPermission(role, tool.requiredPermission)) {
      security.logAction({
        action: `TOOL_DENIED_${toolId}`,
        actor: context.user || 'ANONYMOUS',
        resource: toolId,
        details: { reason: `Role ${role} lacks ${tool.requiredPermission}` },
        status: 'DENIED'
      });
      throw new Error(`Access denied: Role ${role} cannot execute ${tool.name}.`);
    }

    // Check Human-in-the-Loop approval gate
    if (tool.requiresApproval && !context.isApproved) {
      security.logAction({
        action: `TOOL_APPROVAL_PENDING_${toolId}`,
        actor: context.user || 'AGENT',
        resource: toolId,
        details: { input },
        status: 'APPROVAL_REQUIRED'
      });
      return {
        status: 'PENDING_APPROVAL',
        message: `Action requires human confirmation before proceeding.`,
        toolId,
        input
      };
    }

    const startTime = Date.now();
    try {
      if (typeof tool.validate === 'function') {
        const validation = tool.validate(input);
        if (!validation.valid) {
          throw new Error(`Input validation failed: ${validation.error}`);
        }
      }

      const result = await tool.execute(input, context);
      const durationMs = Date.now() - startTime;

      security.logAction({
        action: `TOOL_EXECUTED_${toolId}`,
        actor: context.user || 'AGENT',
        resource: toolId,
        details: { input, durationMs },
        status: 'SUCCESS'
      });

      return {
        status: 'SUCCESS',
        toolId,
        durationMs,
        data: result
      };
    } catch (err) {
      const durationMs = Date.now() - startTime;
      security.logAction({
        action: `TOOL_FAILED_${toolId}`,
        actor: context.user || 'AGENT',
        resource: toolId,
        details: { input, error: err.message, durationMs },
        status: 'FAILED'
      });
      return {
        status: 'ERROR',
        toolId,
        durationMs,
        error: err.message
      };
    }
  }

  initDefaultTools() {
    const maps = new MapsLeadFinder();
    const enricher = new SiteEnricher();
    const crm = new TwentyCrm();
    const mailer = new ListmonkMailer();
    const scheduler = new CalcomScheduler();
    const support = new ChatwootSupport();
    const contracts = new DocumensoContracts();

    // 1. Google Maps Lead Finder Tool
    this.register({
      id: 'google_maps_scrape',
      name: 'Google Maps Business Prospector',
      originRepo: 'gosom/google-maps-scraper',
      description: 'Discovers verified B2B business leads, addresses, phones, and websites by niche & location.',
      requiredPermission: 'LEADS_SCRAPE',
      requiresApproval: false,
      validate: (input) => ({ valid: Boolean(input.query && input.location) }),
      execute: async (input) => await maps.searchLeads(input.query, input.location, input.count || 5),
      healthCheck: async () => ({ status: 'ONLINE', endpoint: maps.baseUrl })
    });

    // 2. Crawl4AI Deep Website Enricher Tool
    this.register({
      id: 'crawl4ai_enrich',
      name: 'Crawl4AI Web Intelligence & Contact Extractor',
      originRepo: 'unclecode/crawl4ai',
      description: 'Crawls target website to extract verified emails, direct phone numbers, and company summaries.',
      requiredPermission: 'RESEARCH_RUN',
      requiresApproval: false,
      validate: (input) => ({ valid: Boolean(input.url && input.url.startsWith('http')) }),
      execute: async (input) => await enricher.enrichUrl(input.url),
      healthCheck: async () => ({ status: 'ONLINE' })
    });

    // 3. Twenty CRM Synchronizer
    this.register({
      id: 'twenty_crm_sync',
      name: 'Twenty CRM Company & Lead Synchronizer',
      originRepo: 'twentyhq/twenty',
      description: 'Creates or updates companies, people, and deals inside Twenty CRM.',
      requiredPermission: 'CRM_EDIT',
      requiresApproval: false,
      execute: async (input) => {
        const company = await crm.createCompany({
          name: input.businessName,
          domain: input.website,
          address: input.address,
          phone: input.phone
        });
        const person = await crm.createPerson({
          firstName: (input.businessName || 'Business').split(' ')[0],
          lastName: 'Contact',
          email: input.email,
          phone: input.phone,
          companyId: company.id
        });
        const deal = await crm.createOpportunity({
          name: `Pipeline Deal - ${input.businessName}`,
          amount: input.amount || 2500,
          companyId: company.id
        });
        return { company, person, deal };
      },
      healthCheck: async () => ({ status: crm.isConfigured() ? 'CONFIGURED' : 'DEV_MODE' })
    });

    // 4. Listmonk Email Outreach
    this.register({
      id: 'listmonk_outreach',
      name: 'Listmonk Outbound Sequence Enroller',
      originRepo: 'knadh/listmonk',
      description: 'Enrolls qualified prospects into automated marketing or cold email sequences.',
      requiredPermission: 'EMAIL_SEND',
      requiresApproval: true, // Human-in-the-loop gate
      execute: async (input) => await mailer.addSubscriber({
        email: input.email,
        name: input.name,
        attributes: input.attributes || {}
      }),
      healthCheck: async () => ({ status: mailer.isConfigured() ? 'CONFIGURED' : 'DEV_MODE' })
    });

    // 5. Cal.com Scheduler
    this.register({
      id: 'calcom_schedule',
      name: 'Cal.com Meeting Link Generator',
      originRepo: 'calcom/cal.diy',
      description: 'Generates prospect-personalized calendar booking URLs with meeting details prefilled.',
      requiredPermission: 'CRM_VIEW',
      requiresApproval: false,
      execute: async (input) => scheduler.generateBookingLink(input),
      healthCheck: async () => ({ status: scheduler.isConfigured() ? 'CONFIGURED' : 'ACTIVE_LINK_MODE' })
    });

    // 6. Chatwoot Omnichannel Support
    this.register({
      id: 'chatwoot_support',
      name: 'Chatwoot Client Messaging',
      originRepo: 'chatwoot/chatwoot',
      description: 'Fetches conversations and drafts customer service replies across live chat and WhatsApp.',
      requiredPermission: 'CRM_VIEW',
      requiresApproval: false,
      execute: async (input) => {
        if (input.action === 'list') {
          return await support.listConversations();
        }
        return await support.sendMessage(input.conversationId, input.message);
      },
      healthCheck: async () => ({ status: support.isConfigured() ? 'CONFIGURED' : 'DEV_MODE' })
    });

    // 7. Documenso E-Sign Contracts
    this.register({
      id: 'documenso_contract',
      name: 'Documenso Digital Contract Generator',
      originRepo: 'documenso/documenso',
      description: 'Generates client proposals, service agreements, and digital signing envelopes.',
      requiredPermission: 'PROPOSALS_CREATE',
      requiresApproval: true, // Human-in-the-loop gate
      execute: async (input) => await contracts.createContract({
        recipientName: input.clientName,
        recipientEmail: input.clientEmail,
        servicePackage: input.servicePackage,
        amount: input.amount
      }),
      healthCheck: async () => ({ status: contracts.isConfigured() ? 'CONFIGURED' : 'DEV_MODE' })
    });
  }
}

module.exports = new ToolRegistry();

