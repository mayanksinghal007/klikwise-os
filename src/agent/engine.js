const fs = require('fs');
const path = require('path');

// Auto-load .env file if it exists without needing external dotenv
function loadEnv() {
  const envPath = path.resolve(__dirname, '../../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnv();

const MapsLeadFinder = require('../tools/mapsLeadFinder');
const SiteEnricher = require('../tools/siteEnricher');
const TwentyCrm = require('../tools/twentyCrm');
const ListmonkMailer = require('../tools/listmonkMailer');
const CalcomScheduler = require('../tools/calcomScheduler');
const ChatwootSupport = require('../tools/chatwootSupport');
const DocumensoContracts = require('../tools/documensoContracts');
const { buildAgentSystemPrompt, buildPitchPrompt } = require('./prompts');

class BusinessAgent {
  constructor(profilePath) {
    this.profilePath = profilePath || path.resolve(__dirname, '../../config/business_profile.json');
    this.profile = this.loadProfile();

    // Initialize Tool Connectors
    this.mapsScraper = new MapsLeadFinder();
    this.siteEnricher = new SiteEnricher();
    this.crm = new TwentyCrm();
    this.mailer = new ListmonkMailer();
    this.scheduler = new CalcomScheduler();
    this.support = new ChatwootSupport();
    this.contracts = new DocumensoContracts();

    this.apiKey = process.env.GEMINI_API_KEY || '';
  }

  loadProfile() {
    try {
      const data = fs.readFileSync(this.profilePath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.warn(`[BusinessAgent] Could not load profile from ${this.profilePath}. Using default structure.`);
      return { business: { name: 'My Business' }, offerings: [], target_audience: {} };
    }
  }

  updateProfile(newProfile) {
    this.profile = newProfile;
    fs.writeFileSync(this.profilePath, JSON.stringify(newProfile, null, 2), 'utf8');
  }

  /**
   * Generates content using Gemini API via native fetch
   */
  async callGemini(prompt, systemInstruction = '', model = 'gemini-2.5-flash') {
    if (!this.apiKey) {
      return null;
    }

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
      const payload = {
        contents: [{ parts: [{ text: prompt }] }]
      };
      if (systemInstruction) {
        payload.systemInstruction = { parts: [{ text: systemInstruction }] };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return text;
    } catch (err) {
      console.warn('[BusinessAgent] Gemini API call error:', err.message);
      return null;
    }
  }

  /**
   * Generates a hyper-personalized outreach pitch for an enriched lead
   */
  async generatePersonalizedPitch(lead) {
    const bookingLink = this.scheduler.generateBookingLink({
      companyName: lead.title,
      email: lead.email || '',
      notes: `Outreach response for ${lead.title}`
    });

    if (this.apiKey) {
      const prompt = buildPitchPrompt(lead, this.profile);
      const systemInstruction = buildAgentSystemPrompt(this.profile);
      const aiResponse = await this.callGemini(prompt, systemInstruction);

      if (aiResponse) {
        try {
          const cleaned = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          return {
            ...parsed,
            bookingLink
          };
        } catch {
          return {
            subject: `Growth inquiry for ${lead.title}`,
            body: aiResponse,
            bookingLink
          };
        }
      }
    }

    // High-converting smart fallback template
    const t = this.profile.templates || {};
    const business = this.profile.business || {};
    const sender = process.env.SENDER_NAME || 'Founder';

    let body = t.cold_email_body || '';
    body = body
      .replace(/{{first_name}}/g, lead.title.split(' ')[0] || 'there')
      .replace(/{{company_name}}/g, lead.title)
      .replace(/{{industry}}/g, lead.category || business.industry || 'your sector')
      .replace(/{{booking_link}}/g, bookingLink)
      .replace(/{{sender_name}}/g, sender)
      .replace(/{{business_name}}/g, business.name || 'Our Company');

    let subject = (t.cold_email_subject || 'Quick question regarding {{company_name}}')
      .replace(/{{company_name}}/g, lead.title);

    return {
      subject,
      openingHook: `I noticed ${lead.title} is serving clients in ${lead.city || 'your area'}.`,
      body,
      bookingLink
    };
  }

  /**
   * Answer customer inquiries based on business profile
   */
  async answerCustomerInquiry(customerMessage, senderName = 'Client') {
    if (this.apiKey) {
      const systemPrompt = buildAgentSystemPrompt(this.profile);
      const prompt = `Customer inquiry from ${senderName}: "${customerMessage}"\nDraft a helpful, friendly, and concise response according to our offerings and pricing.`;
      const aiResponse = await this.callGemini(prompt, systemPrompt);
      if (aiResponse) {
        return aiResponse;
      }
    }

    const b = this.profile.business || {};
    return `Hello ${senderName},\n\nThank you for reaching out to ${b.name || 'us'}! Regarding your question: "${customerMessage}", our core offerings start at ${this.profile.offerings?.[0]?.pricing?.amount || 'competitive rates'}.\n\nFeel free to schedule a quick call with our team here: ${process.env.CALCOM_BOOKING_URL || 'https://cal.com'}\n\nBest regards,\n${b.name || 'Team'}`;
  }

  /**
   * Run full B2B Autonomous Pipeline
   */
  async runPipeline({ query, location, count = 5, onProgress = null }) {
    const report = {
      timestamp: new Date().toISOString(),
      target: { query, location, count },
      leadsFound: 0,
      enrichedLeads: [],
      crmSynced: 0,
      mailerEnrolled: 0,
      results: []
    };

    const notify = (msg) => {
      if (onProgress) onProgress(msg);
      else console.log(`[Pipeline] ${msg}`);
    };

    notify(`Step 1/5: Searching Google Maps leads for "${query}" in "${location}"...`);
    const rawLeads = await this.mapsScraper.searchLeads(query, location, count);
    report.leadsFound = rawLeads.length;
    notify(`Found ${rawLeads.length} initial leads.`);

    for (let i = 0; i < rawLeads.length; i++) {
      const lead = rawLeads[i];
      notify(`Step 2/5 [${i + 1}/${rawLeads.length}]: Enriching website for "${lead.title}" (${lead.website || 'No website'})...`);
      
      let enriched = { emails: [], phones: [], socials: {} };
      if (lead.website) {
        enriched = await this.siteEnricher.enrichUrl(lead.website);
      }

      const primaryEmail = enriched.emails?.[0] || `contact@${(lead.website || 'business').replace(/^https?:\/\//, '').replace(/\/.*$/, '')}`;
      const fullLead = {
        ...lead,
        email: primaryEmail,
        allEmails: enriched.emails || [],
        phone: lead.phone || enriched.phones?.[0] || '',
        socials: enriched.socials || {},
        summarySnippet: enriched.summarySnippet || ''
      };

      notify(`Step 3/5 [${i + 1}/${rawLeads.length}]: Generating personalized AI sales pitch...`);
      const pitch = await this.generatePersonalizedPitch(fullLead);
      fullLead.pitch = pitch;

      notify(`Step 4/5 [${i + 1}/${rawLeads.length}]: Syncing to Twenty CRM...`);
      const company = await this.crm.createCompany({
        name: fullLead.title,
        domain: fullLead.website,
        address: fullLead.address,
        phone: fullLead.phone
      });

      await this.crm.createPerson({
        firstName: fullLead.title.split(' ')[0] || 'Business',
        lastName: 'Contact',
        email: fullLead.email,
        phone: fullLead.phone,
        companyId: company.id
      });

      await this.crm.createOpportunity({
        name: `Deal - ${fullLead.title}`,
        amount: 2500,
        companyId: company.id
      });
      report.crmSynced++;

      notify(`Step 5/5 [${i + 1}/${rawLeads.length}]: Adding to Listmonk outreach queue...`);
      await this.mailer.addSubscriber({
        email: fullLead.email,
        name: fullLead.title,
        attributes: {
          category: fullLead.category,
          website: fullLead.website,
          booking_link: pitch.bookingLink
        }
      });
      report.mailerEnrolled++;

      report.results.push(fullLead);
    }

    notify(`Pipeline complete! Successfully processed ${report.results.length} leads.`);
    return report;
  }
}

module.exports = BusinessAgent;
