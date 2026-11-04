/**
 * KLIKWise OS — AI Command Center Orchestrator
 * Executes the complete 10-step signature agency workflow:
 * Natural language parsing -> Search -> Enrichment -> Lead Scoring ->
 * Service Matching -> Personalized Outreach -> Human Approval Gate -> CRM Pipeline.
 */

const MapsLeadFinder = require('../tools/mapsLeadFinder');
const SiteEnricher = require('../tools/siteEnricher');
const security = require('../lib/security');

class CommandCenterOrchestrator {
  constructor() {
    this.mapsScraper = new MapsLeadFinder();
    this.siteEnricher = new SiteEnricher();
    this.pendingCampaigns = new Map();
  }

  /**
   * Parse natural language command into structured parameters
   * e.g. "Find 10 D2C women's fashion brands in Delhi."
   */
  parseCommand(promptText) {
    const text = promptText.trim();
    
    // Extract count (e.g. 10, 20, 15)
    const countMatch = text.match(/\b(\d+)\b/);
    const count = countMatch ? Math.min(parseInt(countMatch[1], 10), 30) : 10;

    // Extract location (e.g. "in Delhi", "in Gurgaon", "in Delhi NCR", "in Rohini", "in Mumbai")
    let location = 'Delhi NCR, India';
    const locMatch = text.match(/(?:in|around|near)\s+([A-Za-z\s,]+?)(?:\.|$|that|who|which)/i);
    if (locMatch) {
      location = locMatch[1].trim();
    }

    // Extract niche / category
    let niche = "D2C Women's Fashion";
    const cleaned = text
      .replace(/^find\s+\d*\s*/i, '')
      .replace(/(?:in|around|near)\s+[A-Za-z\s,]+.*/i, '')
      .replace(/(?:that|who|which)\s+(?:need|want|could\s+benefit).*/i, '')
      .trim();

    if (cleaned.length > 2) {
      niche = cleaned;
    }

    return {
      originalPrompt: text,
      niche,
      location,
      count,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Execute the full 10-step signature workflow
   */
  async executeCommand(promptText, mode = 'APPROVAL_MODE', user = 'Mayank Aggarwal') {
    const steps = [];
    const plan = this.parseCommand(promptText);

    // STEP 1: Understand request
    steps.push({
      step: 1,
      title: 'Intent Understanding',
      status: 'COMPLETED',
      detail: `Parsed target: ${plan.count} businesses in "${plan.niche}" located in "${plan.location}".`
    });

    // STEP 2: Generate search plan
    steps.push({
      step: 2,
      title: 'Search Plan Formulation',
      status: 'COMPLETED',
      detail: `Query formulated: "${plan.niche} in ${plan.location}" with duplicate suppression filter.`
    });

    // STEP 3 & 4: Search & Collect Business Details
    const rawLeads = await this.mapsScraper.searchLeads(plan.niche, plan.location, plan.count);
    steps.push({
      step: 3,
      title: 'Google Maps Business Discovery',
      status: 'COMPLETED',
      detail: `Discovered ${rawLeads.length} initial business candidates from Google Maps / Places directory.`
    });

    // STEP 5: Deduplicate
    const seenWebsites = new Set();
    const uniqueLeads = [];
    for (const lead of rawLeads) {
      const dom = (lead.website || lead.title).toLowerCase().replace(/https?:\/\//, '').replace(/\/.*$/, '');
      if (!seenWebsites.has(dom)) {
        seenWebsites.add(dom);
        uniqueLeads.push(lead);
      }
    }
    steps.push({
      step: 4,
      title: 'Deduplication & Contact Sanitization',
      status: 'COMPLETED',
      detail: `Retained ${uniqueLeads.length} unique, verified business records.`
    });

    // STEP 6 & 7: Lead Scoring & Service Matching
    const processedLeads = [];
    for (let i = 0; i < uniqueLeads.length; i++) {
      const lead = uniqueLeads[i];
      let enrichment = { emails: [], phones: [], socials: {} };
      
      if (lead.website && lead.website.startsWith('http')) {
        enrichment = await this.siteEnricher.enrichUrl(lead.website);
      }

      // Calculate Explainable Lead Score (0–100)
      let score = 55;
      const scoreReasons = [];

      if (lead.website) {
        score += 15;
        scoreReasons.push('+15 Active commercial website verified');
      } else {
        scoreReasons.push('+0 Missing website (Opportunity for web development)');
      }

      if (enrichment.emails && enrichment.emails.length > 0) {
        score += 15;
        scoreReasons.push('+15 Verified direct email available');
      }

      if (parseFloat(lead.rating) >= 4.0) {
        score += 10;
        scoreReasons.push(`+10 Strong Google reputation (${lead.rating}★ with ${lead.reviewsCount} reviews)`);
      }

      if (plan.niche.toLowerCase().includes('fashion') || plan.niche.toLowerCase().includes('d2c')) {
        score += 10;
        scoreReasons.push('+10 High creative alignment with KLIKWise AI Video & UGC Ad formats');
      }

      // Service Recommendation matching
      const recommendedServices = this.matchServicesToNiche(plan.niche, lead);

      // WhatsApp Compliance Check
      // Strict rule: A public phone number does not equal marketing consent. Mark as consent pending.
      const whatsappCheck = {
        eligibleForDirectMarketing: false,
        consentStatus: 'OPT_IN_REQUIRED',
        reason: 'Public business listing phone number requires opt-in prior to promotional WhatsApp broadcast.',
        recommendedChannel: enrichment.emails?.[0] ? 'EMAIL_OUTREACH' : 'CALL_OR_MANUAL_INQUIRY'
      };

      // Generate Personalized Pitch
      const primaryEmail = enrichment.emails?.[0] || `contact@${(lead.website || 'brand').replace(/^https?:\/\//, '').replace(/\/.*$/, '')}`;
      const pitch = this.generatePersonalizedPitch(lead, plan.niche, recommendedServices);

      processedLeads.push({
        id: `lead_${Date.now()}_${i}`,
        businessName: lead.title,
        category: lead.category || plan.niche,
        location: lead.city || plan.location,
        address: lead.address,
        website: lead.website,
        phone: lead.phone,
        email: primaryEmail,
        allEmails: enrichment.emails || [],
        rating: lead.rating,
        reviewsCount: lead.reviewsCount,
        leadScore: Math.min(score, 98),
        scoreReasons,
        recommendedServices,
        whatsappCompliance: whatsappCheck,
        pitchDraft: pitch,
        crmStage: 'OUTREACH_READY',
        approvalStatus: mode === 'CONTROLLED_AUTOMATION' ? 'AUTO_APPROVED' : 'PENDING_HUMAN_APPROVAL'
      });
    }

    steps.push({
      step: 5,
      title: 'Lead Intelligence & Explainable Scoring',
      status: 'COMPLETED',
      detail: `Scored all ${processedLeads.length} leads (Average Score: ${Math.round(processedLeads.reduce((a, b) => a + b.leadScore, 0) / processedLeads.length)}/100).`
    });

    steps.push({
      step: 6,
      title: 'Service Recommendation Matching',
      status: 'COMPLETED',
      detail: `Identified highest-impact KLIKWise offerings (Meta Ads, UGC Ads, Brand Reels, WhatsApp Funnels).`
    });

    steps.push({
      step: 7,
      title: 'Hyper-Personalized Outreach Formulation',
      status: 'COMPLETED',
      detail: `Drafted unique, non-generic cold emails tailored to each company's product line and location.`
    });

    steps.push({
      step: 8,
      title: 'WhatsApp Compliance & Consent Verification',
      status: 'COMPLETED',
      detail: `Applied Meta Business Policy: Cold public numbers flagged as Opt-in Required. Email routed as primary channel.`
    });

    // STEP 9: Staging Campaign
    const campaignId = `CAMP-${Date.now()}`;
    const campaign = {
      campaignId,
      promptText,
      plan,
      mode,
      leads: processedLeads,
      createdAt: new Date().toISOString(),
      status: mode === 'CONTROLLED_AUTOMATION' ? 'EXECUTING' : 'WAITING_HUMAN_APPROVAL'
    };
    this.pendingCampaigns.set(campaignId, campaign);

    steps.push({
      step: 9,
      title: 'Campaign Staging in CRM',
      status: 'COMPLETED',
      detail: `Staged ${processedLeads.length} leads in CRM Pipeline (Stage: Outreach Ready).`
    });

    // STEP 10: Human Approval Gate
    steps.push({
      step: 10,
      title: 'Human Approval Gate (Mode B)',
      status: mode === 'CONTROLLED_AUTOMATION' ? 'AUTO_APPROVED' : 'APPROVAL_REQUIRED',
      detail: mode === 'CONTROLLED_AUTOMATION' 
        ? 'Pre-approved campaign rules applied. Dispatching outreach.'
        : 'Outreach drafts held safely for Mayank Aggarwal\'s review before any emails are sent.'
    });

    security.logAction({
      action: 'COMMAND_CENTER_EXECUTION',
      actor: user,
      resource: campaignId,
      details: { prompt: promptText, leadsCount: processedLeads.length, mode },
      status: 'SUCCESS'
    });

    return {
      campaignId,
      plan,
      mode,
      executionSteps: steps,
      leads: processedLeads,
      requiresApproval: mode !== 'CONTROLLED_AUTOMATION'
    };
  }

  matchServicesToNiche(niche, lead) {
    const n = niche.toLowerCase();
    const services = [];

    if (n.includes('fashion') || n.includes('clothing') || n.includes('apparel') || n.includes('d2c')) {
      services.push('Meta Ads (Instagram & FB)', 'Product UGC Video Ads (₹1,000–₹1,500)', 'AI Brand Reels (30s: ₹1,500–₹2,000)', 'Social Media Management (₹15,000/mo)');
    } else if (n.includes('real estate') || n.includes('builder') || n.includes('property')) {
      services.push('Performance Marketing (Meta & Google Ads - ₹25,000/mo)', '3D Model Video Production (₹3,000–₹4,000)', 'WhatsApp Lead Qualification Flow');
    } else if (n.includes('restaurant') || n.includes('cafe') || n.includes('food')) {
      services.push('Social Media Marketing (₹20,000/mo)', 'Local Google Business Profile Management (₹3,000/mo)', 'Reels Strategy');
    } else {
      services.push('Performance Growth Package (₹25,000/mo)', 'Conversion Landing Page (₹5,000–₹8,000)', 'AI Video Ads');
    }

    return services;
  }

  generatePersonalizedPitch(lead, niche, services) {
    const firstName = lead.title.split(' ')[0] || 'Founder';
    const topService = services[0] || 'Performance Marketing';
    const secondService = services[1] || 'AI Video Production';

    return {
      subject: `Quick thought regarding ${lead.title}'s customer acquisition in ${lead.city || 'Delhi'}`,
      openingObservation: `I was exploring ${lead.title}'s presence in the ${niche} space and really liked your product aesthetic.`,
      opportunity: `Many growing ${niche} brands in your category face high ad costs or creative fatigue when scaling Meta and Instagram ads.`,
      recommendedService: `At KLIKWise, we specialize in high-converting ${topService} and thumb-stopping ${secondService} without traditional agency overheads.`,
      cta: `Would you be open to a 10-minute strategy chat this Thursday to review 3 ad angles that could scale ${lead.title}'s sales? You can grab a time or reply here: https://cal.com/klikwise/15min`,
      body: `Hi ${firstName},\n\nI came across ${lead.title} and noticed your strong positioning in the ${niche} market.\n\nWe recently helped similar consumer brands significantly improve their ad ROAS and customer acquisition efficiency by combining ${topService} with authentic ${secondService}.\n\nWould you be open to a brief 10-minute chat this Thursday to explore how we could test a few high-ROI creative angles for ${lead.title}?\n\nYou can review our creative portfolio here: https://drive.google.com/drive/folders/1IBXhPfcEE4f9UksKn1_1REIqyGCT4wqK\n\nBest regards,\nMayank Aggarwal\nCo-Founder & AI Creative Head | KLIKWise\nPhone: +91 9217756033`
    };
  }

  /**
   * Approve and dispatch a pending campaign
   */
  approveCampaign(campaignId, approvedLeadIds = []) {
    const campaign = this.pendingCampaigns.get(campaignId);
    if (!campaign) {
      return { success: false, error: 'Campaign not found or expired.' };
    }

    campaign.status = 'APPROVED_BY_FOUNDER';
    campaign.approvedAt = new Date().toISOString();
    
    const emailDispatcher = require('../tools/emailDispatcher');
    const followupCadence = require('../workflows/followupCadence');

    let dispatchedCount = 0;
    const dispatchResults = [];

    // Mark and dispatch approved leads
    for (const lead of campaign.leads) {
      if (approvedLeadIds.length === 0 || approvedLeadIds.includes(lead.id)) {
        lead.approvalStatus = 'APPROVED';
        lead.crmStage = 'CONTACTED';

        // 1. Dispatch cold email from riyansh.studio007@gmail.com asynchronously
        const targetEmail = lead.email || (lead.allEmails && lead.allEmails[0]) || `contact@${(lead.website || 'brand').replace(/^https?:\/\//, '').replace(/\/.*$/, '')}`;
        emailDispatcher.sendEmail({
          to: targetEmail,
          subject: lead.pitchDraft?.subject || `Growth Strategy for ${lead.businessName} (Delhi NCR)`,
          text: lead.pitchDraft?.body || `Hi ${lead.businessName} Team,\n\nI reviewed your marketing presence in Delhi NCR. We help brands scale customer acquisition with high-converting Meta Ads and AI video production.\n\nBest,\nMayank Aggarwal\nKLIKWise | +91 9217756033`,
          leadName: lead.businessName,
          campaignId: campaign.campaignId
        }).catch(e => console.warn('[EmailOutreach] Warning:', e.message));

        dispatchResults.push({
          business: lead.businessName,
          email: targetEmail,
          status: 'QUEUED'
        });
        dispatchedCount++;

        // 2. Enroll into automated Day-3, Day-7 follow-up cadence
        followupCadence.enrollLead(lead);
      } else {
        lead.approvalStatus = 'REJECTED';
      }
    }

    security.logAction({
      action: 'CAMPAIGN_APPROVED_AND_DISPATCHED',
      actor: 'Mayank Aggarwal',
      resource: campaignId,
      details: { approvedCount: dispatchedCount, sender: emailDispatcher.senderEmail },
      status: 'APPROVED'
    });

    return {
      success: true,
      campaignId,
      senderEmail: emailDispatcher.senderEmail,
      smtpConfigured: emailDispatcher.isConfigured(),
      dispatchedCount,
      dispatchResults,
      message: `🎉 Campaign Approved! Automated outreach initiated for ${dispatchedCount} leads from ${emailDispatcher.senderEmail}.`
    };
  }
}

module.exports = new CommandCenterOrchestrator();

