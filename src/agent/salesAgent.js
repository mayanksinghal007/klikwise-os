/**
 * KLIKWise OS — Autonomous AI Sales Representative & Conversation Engine
 * Built for Mayank Aggarwal (Co-Founder & AI Creative Head, KLIKWise)
 * Handles prospect discovery, service explanations, objections, INR pricing,
 * portfolio sharing, and deal closing in English, Hindi & Hinglish.
 */

const fs = require('fs');
const path = require('path');

const PROFILE_PATH = path.resolve(__dirname, '../../config/business_profile.json');

class SalesAgent {
  constructor() {
    this.profile = this.loadProfile();
    this.founder = {
      name: 'Mayank Aggarwal',
      role: 'Co-Founder & AI Creative Head',
      phone: '+91 9217756033',
      email: 'riyansh.studio007@gmail.com',
      portfolio: 'https://drive.google.com/drive/folders/1IBXhPfcEE4f9UksKn1_1REIqyGCT4wqK'
    };
  }

  loadProfile() {
    try {
      if (fs.existsSync(PROFILE_PATH)) {
        return JSON.parse(fs.readFileSync(PROFILE_PATH, 'utf8'));
      }
    } catch (err) {
      console.warn('[SalesAgent] Profile load warning:', err.message);
    }
    return {};
  }

  /**
   * Handle dynamic prospect inquiries with real conversational sales intelligence
   */
  async handleSalesConversation(prospectMessage, conversationHistory = [], prospectContext = {}) {
    this.profile = this.loadProfile();
    const cleanMsg = (prospectMessage || '').trim();
    if (!cleanMsg) {
      return {
        agent: 'KLIKWise AI Sales Rep',
        reply: "Hello! Mayank Aggarwal's KLIKWise agency here. How can I help you scale your business customer acquisition or creative production today?"
      };
    }

    // Try Gemini API if key is available in environment
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey.length > 10) {
      try {
        const aiReply = await this.queryGeminiAI(cleanMsg, conversationHistory, prospectContext, geminiKey);
        if (aiReply) {
          return {
            agent: 'KLIKWise Autonomous AI Sales Rep',
            reply: aiReply,
            source: 'Gemini Generative Engine'
          };
        }
      } catch (err) {
        console.warn('[SalesAgent] Gemini query failed, using built-in conversational AI:', err.message);
      }
    }

    // Built-in Dynamic Conversational Intelligence Engine (English & Hinglish)
    return this.generateConversationalResponse(cleanMsg, conversationHistory, prospectContext);
  }

  /**
   * Generates natural, sharp, contextual responses across business scenarios
   */
  generateConversationalResponse(msg, history = [], context = {}) {
    const lower = msg.toLowerCase();
    const company = context.companyName || 'your brand';
    const isHindi = /(kaise|kya|karo|bhai|mujhe|chahiye|kitna|hoga|kahan|hai|shuru|batao|karenge|hain|aap|apka|karega)/i.test(lower);

    // 1. STRICT EXCLUSION: SEO Retainers
    if (lower.includes('seo') || lower.includes('search engine') || lower.includes('backlink') || lower.includes('ranking on google')) {
      if (isHindi) {
        return {
          agent: 'KLIKWise AI Sales Rep',
          reply: `Dhanyawad poochne ke liye! KLIKWise mein hum strictly **Performance Marketing (Meta Ads, Google Ads)** aur **AI Video / UGC Creative Production** par focus karte hain. We do not offer SEO or search ranking retainers kyunki humara focus direct, measurable revenue aur fast customer acquisition par hota hai.\n\nKya aap dekhna chahenge ki humare Meta Ads aur viral AI Reels se ${company} ko immediate high-intent customers kaise mil sakte hain?`,
          intent: 'INQUIRY_SEO_DECLINED',
          recommendedService: 'Performance Marketing',
          escalateToFounder: false
        };
      }
      return {
        agent: 'KLIKWise AI Sales Rep',
        reply: `Thanks for asking! At KLIKWise, we specialize exclusively in high-ROI, fast-cycle customer acquisition: Meta Ads, Google Performance Max, viral AI Video filmmaking, and automated WhatsApp funnels. We do not offer SEO or search ranking retainers as our focus is on immediate, measurable paid media ROI. Would you like to review how our Performance Marketing campaigns can drive immediate customer acquisition for ${company}?`,
        intent: 'INQUIRY_SEO_DECLINED',
        recommendedService: 'Performance Marketing',
        escalateToFounder: false
      };
    }

    // 2. Portfolio & Proof of Work
    if (lower.includes('portfolio') || lower.includes('sample') || lower.includes('past work') || lower.includes('case stud') || lower.includes('kuch dikhao') || lower.includes('previous work') || lower.includes('kaam dekhna')) {
      const pUrl = this.founder.portfolio;
      if (isHindi) {
        return {
          agent: 'KLIKWise AI Sales Rep',
          reply: `Bilkul! Aap humara verified portfolio, AI Brand Reels, aur live ad creative campaigns directly is link par dekh sakte hain:\n📂 **Google Drive Portfolio:** ${pUrl}\n\nHumare Co-Founder & AI Creative Head, **Mayank Aggarwal**, creative strategy aur performance ad engineering ko lead karte hain. Aap kis format mein sabse zyada interested hain: AI Video Ads, Social Media Growth, ya Complete Performance Ads?`,
          intent: 'PORTFOLIO_SHARED',
          portfolioUrl: pUrl
        };
      }
      return {
        agent: 'KLIKWise AI Sales Rep',
        reply: `Certainly! You can review our verified creative portfolio, brand reels, and live performance campaign assets directly here:\n📂 **Google Drive Portfolio:** ${pUrl}\n\nOur Co-Founder & AI Creative Head, **Mayank Aggarwal**, leads creative strategy and ad engineering. Are you interested in AI video ads, social media growth, or full performance marketing for ${company}?`,
        intent: 'PORTFOLIO_SHARED',
        portfolioUrl: pUrl
      };
    }

    // 3. Pricing, Rates & Packages
    if (lower.includes('price') || lower.includes('cost') || lower.includes('rate') || lower.includes('charge') || lower.includes('package') || lower.includes('fee') || lower.includes('kitna') || lower.includes('paisa') || lower.includes('budget')) {
      if (isHindi) {
        return {
          agent: 'KLIKWise AI Sales Rep',
          reply: `Yeh raha humara approved transparent rate card (sab prices INR ₹ mein hain, aur platform ad spend directly aap Meta/Google ko pay karte hain):\n\n• **Starter Digital Presence:** ₹15,000–₹18,000/month (12 Posts + 4 Reels, Content Calendar, Scheduling)\n• **Social Growth Package:** ₹20,000–₹25,000/month (Full Brand Strategy, 4 Content Pillars, Reels Funnel)\n• **Performance Growth (Meta + Google Ads):** ₹25,000–₹30,000/month (Full Ad Setup, Retargeting, Pixel Sync, Bi-Weekly Reviews)\n• **AI Creative & UGC Video Retainer:** ₹20,000–₹30,000/month (8 AI Brand Reels + 4 Authentic UGC Ads)\n• **Complete Business Growth OS:** ₹35,000–₹40,000/month (Omnichannel Ads + Social + AI Video + WhatsApp Automation)\n\nAapke business ke liye inmein se kaun sa package sabse suitable lagta hai?`,
          intent: 'PRICING_EXPLAINED'
        };
      }
      return {
        agent: 'KLIKWise AI Sales Rep',
        reply: `Here is our approved, transparent pricing structure (all fees in INR, media ad spend is paid directly by client to ad platforms):\n\n• **Starter Digital Presence:** ₹15,000–₹18,000/month (12 Posts + 4 Short Reels, Scheduling, Calendar)\n• **Social Growth Package:** ₹20,000–₹25,000/month (Full Social Strategy, 4 Content Pillars, Reels Marketing)\n• **Performance Growth Package:** ₹25,000–₹30,000/month (Meta Ads + Google Ads, Pixel Sync, CPL/ROAS Opt, Bi-Weekly Briefings)\n• **AI Creative & UGC Retainer:** ₹20,000–₹30,000/month (8 AI Brand Reels + 4 UGC Creatives)\n• **Complete Business Growth OS:** ₹35,000–₹40,000/month (Paid Ads + Organic Social + AI Video + WhatsApp)\n\nWhich package aligns best with your current milestones for ${company}?`,
        intent: 'PRICING_EXPLAINED'
      };
    }

    // 4. Discounts, Negotiation & Budget Constraints
    if (lower.includes('discount') || lower.includes('kam karo') || lower.includes('cheaper') || lower.includes('negotiat') || lower.includes('free trial') || lower.includes('budget kam hai')) {
      if (isHindi) {
        return {
          agent: 'KLIKWise AI Sales Rep',
          reply: `Humare pricing standard Indian agency retainers se already 10–20% below hain taki aapko maximum ROI mile, aur direct execution **Mayank Aggarwal** lead karte hain.\n\nAgar aapka koi specific monthly budget constraint hai, toh main aapko Mayank ke saath direct connect kar sakta hoon custom milestone scope ya initial pilot phase ke liye. Kya aap ek 15-minute intro call ya WhatsApp (+91 9217756033) par discuss karna chahenge?`,
          intent: 'DISCOUNT_ESCALATED',
          escalateToFounder: true,
          founderContact: '+91 9217756033'
        };
      }
      return {
        agent: 'KLIKWise AI Sales Rep',
        reply: `Our rate card is already positioned approximately 10–20% below established Indian agency retainers to deliver maximum commercial value with direct execution led by Mayank Aggarwal.\n\nWhile our standard rates reflect high creative fidelity, I can connect you directly with Mayank to discuss a customized milestone scope or initial pilot phase that fits your exact budget. Would you like me to book a 15-minute intro call or connect via WhatsApp (+91 9217756033)?`,
        intent: 'DISCOUNT_ESCALATED',
        escalateToFounder: true,
        founderContact: '+91 9217756033'
      };
    }

    // 5. "How do we start?" / Process / Onboarding
    if (lower.includes('how to start') || lower.includes('process') || lower.includes('shuru kaise') || lower.includes('kaise shuru') || lower.includes('steps') || lower.includes('onboard')) {
      if (isHindi) {
        return {
          agent: 'KLIKWise AI Sales Rep',
          reply: `Start karna bahut aasan hai! Yeh hai humara 3-Step Process:\n\n1. **Step 1: 15-Minute Strategy Call** — Hum aapke target audience, past ad history aur conversion goals samajhte hain.\n2. **Step 2: Creative Strategy & Pixel Setup (3-5 Din)** — Meta Pixel, GA4 sync aur high-converting AI Video Ads & copy taiyaar karte hain.\n3. **Step 3: Campaign Launch & Optimization** — Ads live ho jaate hain aur aapko twice a week (hafte mein 2 baar) live KPI reports milti hain!\n\nAap kab call schedule karna chahte hain? Main turant slot book kar dunga.`,
          intent: 'PROCESS_EXPLAINED'
        };
      }
      return {
        agent: 'KLIKWise AI Sales Rep',
        reply: `Getting started is simple and seamless! Here is our 3-Step Onboarding Process:\n\n1. **Step 1: 15-Minute Strategy Audit** — We review your target audience, conversion goals, and ad account setup.\n2. **Step 2: Creative Engineering & Tracking (3-5 Days)** — We build your AI video creatives, UGC angles, and configure Meta Pixel + GA4 conversion events.\n3. **Step 3: Campaign Launch & Active Scaling** — Campaigns go live with bi-weekly executive briefings (twice a week) to optimize CAC and ROAS.\n\nWould you like to schedule an introductory strategy session this week?`,
        intent: 'PROCESS_EXPLAINED'
      };
    }

    // 6. Direct Contact / Call / WhatsApp Request
    if (lower.includes('call') || lower.includes('phone') || lower.includes('contact') || lower.includes('whatsapp') || lower.includes('baat karni') || lower.includes('number')) {
      return {
        agent: 'KLIKWise AI Sales Rep',
        reply: `Aap humare Co-Founder **Mayank Aggarwal** se directly connect kar sakte hain:\n\n📞 **Phone / WhatsApp:** +91 9217756033\n✉️ **Email:** riyansh.studio007@gmail.com\n💬 **Direct WhatsApp Link:** https://wa.me/919217756033\n\nHum Delhi NCR based hain aur Pan-India clients ke saath remote aur project retainers manage karte hain. Aap abhi message ya call drop kar sakte hain!`,
        intent: 'CONTACT_SHARED'
      };
    }

    // 7. General Greetings & Open Conversation
    if (/^(hi|hello|hey|namaste|kaise ho|kya hal hai|good morning|good afternoon)/i.test(lower)) {
      if (isHindi) {
        return {
          agent: 'KLIKWise AI Sales Rep',
          reply: `Namaste! Main KLIKWise ka AI Sales Agent hoon, operating under Co-Founder **Mayank Aggarwal**. Hum businesses aur D2C brands ko Meta Ads, viral AI Video filmmaking aur WhatsApp automation ke through scale karne mein help karte hain.\n\nAapka kaun sa business hai, aur abhi aapka primary goal kya hai: naye customers/leads lana, reels banana, ya high-converting website build karna?`,
          intent: 'GREETING_HANDLED'
        };
      }
      return {
        agent: 'KLIKWise AI Sales Rep',
        reply: `Hello! I am KLIKWise's Autonomous AI Sales Representative, working under Co-Founder & AI Creative Head **Mayank Aggarwal**. We help modern brands and local businesses scale revenue through high-ROI Meta & Google Ads, viral AI video filmmaking, and WhatsApp growth funnels.\n\nWhat type of business do you run, and what is your main focus right now: customer lead generation, creative video ads, or full performance marketing?`,
        intent: 'GREETING_HANDLED'
      };
    }

    // 8. General Strategic Inquiry Fallback
    if (isHindi) {
      return {
        agent: 'KLIKWise AI Sales Rep',
        reply: `Samajh gaya! Aapke business ke liye hum high-converting paid ad funnels aur AI video creatives implement kar sakte hain jo direct customers attract karein.\n\nHumara Performance Growth package ₹25,000–₹30,000/month mein full Meta & Google Ads setup, creative A/B testing aur bi-weekly reporting provide karta hai. Kya aap iske baare mein aur detail janna chahenge ya Mayank Aggarwal ke saath ek short call schedule karein?`,
        intent: 'STRATEGY_CONSULT'
      };
    }

    return {
      agent: 'KLIKWise AI Sales Rep',
      reply: `I understand your goal! At KLIKWise, we combine performance-driven paid acquisition with cinematic AI video storytelling to drive predictable customer revenue for brands.\n\nOur flagship Performance Growth package (₹25,000–₹30,000/month) covers full Meta & Google Ads architecture, conversion tracking, retargeting funnels, and bi-weekly briefings. Would you like to review a tailored SOW proposal or book a 15-minute intro with Mayank Aggarwal?`,
      intent: 'STRATEGY_CONSULT'
    };
  }

  /**
   * Optional Gemini API integration for unlimited fluid generative intelligence
   */
  async queryGeminiAI(userMsg, history, context, apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const systemPrompt = `You are the executive AI Sales Representative for KLIKWise, an agency led by Mayank Aggarwal (Co-Founder & AI Creative Head, Phone: +91 9217756033, Email: riyansh.studio007@gmail.com, Portfolio: https://drive.google.com/drive/folders/1IBXhPfcEE4f9UksKn1_1REIqyGCT4wqK).
Core Offerings & Approved Pricing (in INR):
- Starter Digital Presence: ₹15,000–₹18,000/mo
- Social Growth Package: ₹20,000–₹25,000/mo
- Performance Growth (Meta + Google Ads): ₹25,000–₹30,000/mo
- AI Creative & UGC Video Retainer: ₹20,000–₹30,000/mo
- Complete Business Growth OS: ₹35,000–₹40,000/mo
Strict Rules:
- NEVER offer SEO or search ranking services. Explain we focus strictly on high-ROI paid media and AI video.
- All media spend is paid directly by client to ad platforms.
- Match user's language (Hindi / Hinglish or English).
- Be consultative, sharp, polite, and commercially proactive.`;

    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood. I am KLIKWise AI Sales Rep representing Mayank Aggarwal.' }] },
      ...history.map(h => ({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      })),
      { role: 'user', parts: [{ text: userMsg }] }
    ];

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    if (res.ok) {
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    }
    return null;
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
        lead: this.founder.name,
        designation: this.founder.role,
        contact: this.founder.phone,
        email: this.founder.email,
        portfolio: this.founder.portfolio
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
        amount: customAmount || '₹25,000–₹30,000/month',
        deliverables: [
          'Meta Ads Management (Facebook & Instagram)',
          'Google Ads Management (Search & Performance Max)',
          'Conversion Tracking Synchronization (Meta Pixel + GA4)',
          'A/B Creative & Copy Testing Architecture',
          'Bi-Weekly Executive Performance Briefings (Twice a week)'
        ]
      },
      social: {
        name: 'Social Growth Package',
        amount: customAmount || '₹20,000–₹25,000/month',
        deliverables: [
          'Full Marketing Strategy & Content Pillars',
          'Organic Conversion Funnel & Trend Research',
          'Reel Strategy & Viral Hooks Production',
          'Bi-Weekly Growth Reporting'
        ]
      },
      ai_creative: {
        name: 'AI Creative & UGC Video Retainer',
        amount: customAmount || '₹20,000–₹30,000/month',
        deliverables: [
          '8 AI Brand Reels (30–60s) with 3D Models',
          '4 Authentic UGC-Style Ad Creatives',
          'Studio Voiceovers & Sound Design (ElevenLabs)',
          'High-Velocity Ad Creative Testing Iterations'
        ]
      },
      complete: {
        name: 'Complete Business Growth OS',
        amount: customAmount || '₹35,000–₹40,000/month',
        deliverables: [
          'Omnichannel Paid Ads (Meta + Google + YouTube + WhatsApp)',
          'Full Social Media Strategy & Organic Publishing',
          'Full AI Creative Video & Ad Production Suite',
          'WhatsApp Automation Funnels (Interakt / Cloud API)',
          'Conversion Tracking & Weekly Executive Briefings'
        ]
      }
    };

    return packages[serviceKey] || packages.performance;
  }
}

module.exports = new SalesAgent();
