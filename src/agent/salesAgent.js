/**
 * KLIKWise OS — Autonomous AI Sales Representative
 * Acts as KLIKWise's intelligent sales representative under Mayank Aggarwal.
 * Handles prospect discovery, service explanations, objection handling,
 * pricing quotations (strictly INR), portfolio sharing, and proposal drafting.
 */

const fs = require('fs');
const path = require('path');

const PROFILE_PATH = path.resolve(__dirname, '../../config/business_profile.json');

class SalesAgent {
  constructor() {
    this.profile = this.loadProfile();
  }

  loadProfile() {
    try {
      if (fs.existsSync(PROFILE_PATH)) {
        return JSON.parse(fs.readFileSync(PROFILE_PATH, 'utf8'));
      }
    } catch (err) {
      console.warn('[SalesAgent] Failed to read business profile, using defaults.');
    }
    return {};
  }

  /**
   * Handle an inbound prospect inquiry with natural, commercially sharp sales logic
   * @param {string} prospectMessage - Message received from prospect
   * @param {Array} conversationHistory - Prior message history
   * @param {Object} prospectContext - Company name, industry, previous leads record
   */
  async handleSalesConversation(prospectMessage, conversationHistory = [], prospectContext = {}) {
    this.profile = this.loadProfile();
    const cleanMsg = prospectMessage.trim();
    const lower = cleanMsg.toLowerCase();
    const company = prospectContext.companyName || 'your business';

    // 1. Strict Exclusion: SEO inquiries
    if (lower.includes('seo') || lower.includes('search engine optimization') || lower.includes('backlink')) {
      return {
        agent: 'KLIKWise AI Sales Rep',
        reply: `Thanks for asking! At KLIKWise, we specialize exclusively in fast-cycle, performance-driven customer acquisition: Meta Ads, Google Ads, AI Video & UGC Creative Production, Conversion Web Development, and WhatsApp Automation. We do not offer SEO or search ranking retainers as our focus is on immediate, measurable paid media ROI. Would you like to see how our Performance Marketing or AI Video campaigns can generate immediate customer acquisition for ${company}?`,
        intent: 'INQUIRY_SEO_DECLINED',
        recommendedService: 'Performance Marketing',
        escalateToFounder: false
      };
    }

    // 2. Portfolio Request
    if (lower.includes('portfolio') || lower.includes('samples') || lower.includes('past work') || lower.includes('case stud') || lower.includes('previous work')) {
      const portfolioUrl = this.profile.business?.portfolio || 'https://drive.google.com/drive/folders/1IBXhPfcEE4f9UksKn1_1REIqyGCT4wqK';
      return {
        agent: 'KLIKWise AI Sales Rep',
        reply: `Certainly! You can review our verified creative portfolio, brand reels, and campaign creative assets directly here:\n📂 ${portfolioUrl}\n\nOur Co-Founder & AI Creative Head, Mayank Aggarwal, leads creative strategy and ad engineering. Are you interested in video ads, social media growth, or full performance ad management for ${company}?`,
        intent: 'PORTFOLIO_SHARED',
        portfolioUrl,
        escalateToFounder: false
      };
    }

    // 3. Pricing & Rates Request
    if (lower.includes('price') || lower.includes('cost') || lower.includes('rate') || lower.includes('charge') || lower.includes('package') || lower.includes('fee')) {
      return {
        agent: 'KLIKWise AI Sales Rep',
        reply: `Here is our transparent, approved pricing structure (all fees in INR, media spend is separate and paid directly to ad platforms):\n\n• Meta Ads Management: ₹15,000–₹18,000/month (Full campaign setup, custom audiences, retargeting, bi-weekly reviews)\n• Complete Multi-Platform Performance Marketing: ₹35,000–₹40,000/month (Meta, Google, YouTube, Snapchat, WhatsApp funnels)\n• Social Media Management: ₹15,000/month (12 posts + 4 short reels, calendar, captions, scheduling)\n• Social Media Marketing: ₹20,000/month (Full brand strategy, content pillars, organic funnel)\n• AI Brand Reels & UGC Video Ads: ₹1,500–₹4,000 per video (3D models, synthetic presenters, authentic UGC)\n• Conversion Websites: Landing Pages from ₹5,000; 5-Page Corporate from ₹12,000\n\nWhich of these best matches your current priorities for ${company}?`,
        intent: 'PRICING_EXPLAINED',
        escalateToFounder: false
      };
    }

    // 4. Objection: "We already run ads but don't get good results / ROAS is low"
    if (lower.includes('not getting good results') || lower.includes('low roas') || lower.includes('ads not working') || lower.includes('poor results') || lower.includes('wasting money')) {
      return {
        agent: 'KLIKWise AI Sales Rep',
        reply: `Understood, and that is a very common challenge. In 80% of underperforming campaigns, the bottleneck is either creative fatigue (boring static creatives that get scrolled past) or poor audience-to-landing-page alignment.\n\nAt KLIKWise, we address this through high-converting AI video creatives (3D models & hook-tested UGC) combined with strict negative keyword and retargeting architectures. May I know what your current monthly ad spend and primary conversion goal is (leads, calls, or e-commerce purchases)?`,
        intent: 'OBJECTION_POOR_ROAS_ADDRESSED',
        recommendedService: 'Performance Marketing & AI Creatives',
        escalateToFounder: false
      };
    }

    // 5. Discount / Custom Financial Negotiation (Requires Founder Escalation)
    if (lower.includes('discount') || lower.includes('cheaper') || lower.includes('negotiate') || lower.includes('free trial') || lower.includes('less budget') || lower.includes('special price')) {
      return {
        agent: 'KLIKWise AI Sales Rep',
        reply: `Our rate card is already positioned approximately 10–20% below established Indian agency retainers to deliver maximum commercial value with direct execution led by Mayank Aggarwal.\n\nWhile our standard rates are fixed to ensure high-quality delivery, I can connect you directly with Mayank to discuss a customized milestone scope or initial pilot phase that fits your exact budget. Would you like me to book a 15-minute intro call or connect via WhatsApp (+91 9217756033)?`,
        intent: 'DISCOUNT_ESCALATED',
        escalateToFounder: true,
        founderContact: '+91 9217756033'
      };
    }

    // 6. Discovery & Service Qualification (Default response)
    return {
      agent: 'KLIKWise AI Sales Rep',
      reply: `Hello! I am KLIKWise's AI Sales Representative. We help brands like ${company} scale customer acquisition through high-ROI Meta & Google Ads, viral AI video filmmaking, and automated WhatsApp growth systems.\n\nMay I know whether you are looking to scale paid ad performance, produce high-impact video creatives, or launch a new conversion-optimized website?`,
      intent: 'DISCOVERY_QUESTION',
      escalateToFounder: false
    };
  }

  /**
   * Generates a formal, branded KLIKWise SOW proposal
   */
  generateProposal({ clientName, clientEmail, servicePackage, budgetInr, customNotes = '' }) {
    const pkgDetails = this.getServicePackageDetails(servicePackage, budgetInr);
    const dateStr = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

    return {
      proposalId: `KW-PROP-${Date.now()}`,
      createdDate: dateStr,
      client: {
        name: clientName,
        email: clientEmail
      },
      partner: {
        agency: 'KLIKWise',
        lead: 'Mayank Aggarwal',
        designation: 'Co-Founder & AI Creative Head',
        contact: '+91 9217756033',
        email: 'riyansh.studio007@gmail.com',
        portfolio: 'https://drive.google.com/drive/folders/1IBXhPfcEE4f9UksKn1_1REIqyGCT4wqK'
      },
      package: pkgDetails.name,
      deliverables: pkgDetails.deliverables,
      pricing: {
        currency: 'INR',
        amount: pkgDetails.amount,
        adSpendNote: 'Platform advertising spend is strictly separate and paid directly by client to Meta/Google.'
      },
      terms: [
        '50% Advance upon contract signing; 50% prior to final asset/code handover (or 100% monthly advance for retainers).',
        'Includes up to two (2) rounds of creative iterations and revisions.',
        'Reporting delivered bi-weekly (twice a week for remote retainers) with weekly pacing checks.',
        'Client retains 100% intellectual property ownership of all final ad creatives and campaign data.'
      ],
      customNotes,
      status: 'DRAFT_FOR_FOUNDER_APPROVAL'
    };
  }

  getServicePackageDetails(serviceKey, customAmount) {
    const packages = {
      performance: {
        name: 'Performance Growth Package',
        amount: customAmount || '₹25,000/month',
        deliverables: [
          'Full Meta Ads & Google Search/PMax Campaign Setup',
          'Conversion Tracking Integration (Meta Pixel, GA4)',
          '4 High-Converting AI Video Ad Creatives per month',
          'A/B Creative & Audience Retargeting Architecture',
          'Bi-Weekly Performance Briefings (Twice a week)'
        ]
      },
      social: {
        name: 'Social Growth Package',
        amount: customAmount || '₹20,000/month',
        deliverables: [
          'Social Media Management + Full Marketing Strategy',
          '12 Static/Carousel Posts + 4 Short Reels',
          'Monthly Content Calendar, Captions, Hashtags & Scheduling',
          'Organic Inbound DM Funnel & Community Engagement',
          'Monthly Growth & Conversion Review'
        ]
      },
      ai_creative: {
        name: 'AI Creative Growth Package',
        amount: customAmount || '₹25,000/month',
        deliverables: [
          '8 AI Brand Reels & Short-Form Video Ads',
          '4 Authentic UGC-Style Video Creatives',
          'ElevenLabs Voiceovers & Custom Soundscape',
          '3D Character / Synthetic Model Product Showcases',
          'Multi-Platform Ad Resizing (9:16 vertical & 1:1 square)'
        ]
      },
      complete_growth: {
        name: 'Complete Business Growth OS',
        amount: customAmount || '₹35,000/month',
        deliverables: [
          'Full-Funnel Multi-Platform Ads (Meta, Google, YouTube, WhatsApp)',
          'Complete Social Media Strategy & 16 Monthly Content Assets',
          'Full AI Video Filmmaking Suite & UGC Ads',
          'WhatsApp Interakt Automation & Lead Qualification Flows',
          'Weekly Executive Briefing with Mayank Aggarwal'
        ]
      }
    };

    return packages[serviceKey] || packages.performance;
  }
}

module.exports = new SalesAgent();

