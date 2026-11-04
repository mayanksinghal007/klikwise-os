/**
 * KLIKWise OS — Universal AI Intelligence Provider
 * Integrates real AI APIs (OpenAI, Gemini, Groq, Free Public AI via Pollinations.ai)
 * with robust offline fallback for hyper-personalized, high-converting B2B agency outreach.
 * 
 * STRICT COMPLIANCE RULES:
 * 1. NO PRICING in initial cold outreach emails.
 * 2. NO PORTFOLIO links in initial cold outreach emails (portfolio sent only on request).
 * 3. Propose a concise 15-minute strategy/introductory call.
 * 4. Sign-off strictly as Mayank Aggarwal, Co-Founder & AI Creative Head | KLIKWise (+91 9217756033).
 */

class AiProvider {
  constructor() {
    this.geminiKey = process.env.GEMINI_API_KEY || '';
    this.openaiKey = process.env.OPENAI_API_KEY || '';
    this.groqKey = process.env.GROQ_API_KEY || '';
  }

  hasCustomKey() {
    return Boolean(this.geminiKey || this.openaiKey || this.groqKey);
  }

  /**
   * Generate an elite 15-minute call cold email pitch
   */
  async generateOutreachEmail({ businessName, category, location, website, phone }) {
    const prompt = `Write a high-converting, personalized B2B cold email to the founder of "${businessName}" (${category}) in ${location}.
Sender: Mayank Aggarwal, Co-Founder & AI Creative Head at KLIKWise (phone: +91 9217756033, email: riyansh.studio007@gmail.com).

CRITICAL RULES:
1. STRICTLY DO NOT include any pricing, package rates, or fees.
2. STRICTLY DO NOT include any portfolio links or Google Drive links (these will be sent later upon agreement).
3. Compliment their brand positioning in ${location}.
4. Mention that we specialize in Meta Ads and high-engagement AI video creative production that helps consumer brands scale customer acquisition.
5. Offer to share 2-3 specific creative angles on a brief 15-minute discovery call this week if they are open to it.
6. Keep the email concise, professional, warm, and under 150 words.

Return JSON in this format ONLY:
{
  "subject": "Email subject line",
  "openingObservation": "One sentence observation about their brand",
  "opportunity": "One sentence about scaling customer acquisition via creative ads",
  "cta": "Invitation for a 15-minute call",
  "body": "The complete email body text"
}`;

    // 1. Try OpenAI if configured
    if (this.openaiKey) {
      try {
        const res = await this.callOpenAi(prompt);
        if (res) return res;
      } catch (err) {
        console.warn('[AiProvider] OpenAI call failed:', err.message);
      }
    }

    // 2. Try Gemini if configured
    if (this.geminiKey) {
      try {
        const res = await this.callGemini(prompt);
        if (res) return res;
      } catch (err) {
        console.warn('[AiProvider] Gemini call failed:', err.message);
      }
    }

    // 3. Try Free Public AI API (Pollinations OpenAI Endpoint) with 3.5s timeout
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);

      const res = await fetch('https://text.pollinations.ai/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are an elite B2B sales copywriter for KLIKWise. Return valid JSON only.' },
            { role: 'user', content: prompt }
          ],
          model: 'openai',
          response_format: { type: 'json_object' }
        }),
        signal: controller.signal
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = this.parseJsonSafe(content);
          if (parsed && parsed.subject && parsed.body) {
            return this.sanitizePitch(parsed, businessName, location);
          }
        }
      }
    } catch (err) {
      // Public endpoint timed out or rate-limited; proceed to deterministic AI copywriter
    }

    // 4. Fallback: High-Fidelity Deterministic AI Copywriter
    return this.generateDeterministicPitch({ businessName, category, location, website });
  }

  async callOpenAi(prompt) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return this.parseJsonSafe(data.choices?.[0]?.message?.content);
  }

  async callGemini(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt + '\nRespond with raw JSON only.' }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return this.parseJsonSafe(text);
  }

  parseJsonSafe(str) {
    try {
      const cleaned = str.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      return null;
    }
  }

  sanitizePitch(pitch, businessName, location) {
    let body = pitch.body || '';
    // Enforce NO PRICING rule
    body = body.replace(/₹\s*[\d,]+/g, '');
    body = body.replace(/\$\s*[\d,]+/g, '');
    // Enforce NO PORTFOLIO rule
    body = body.replace(/https?:\/\/(?:drive\.google\.com|klikwise\.com\/portfolio)[^\s]*/gi, '');

    // Ensure 15-minute call CTA is present
    if (!body.toLowerCase().includes('15-minute') && !body.toLowerCase().includes('15 min')) {
      body += '\n\nWould you be open to a quick 15-minute call this week to see if we can collaborate?';
    }

    return {
      subject: pitch.subject || `Growth & customer acquisition idea for ${businessName}`,
      openingObservation: pitch.openingObservation || `I was exploring ${businessName}'s presence in ${location} and loved your brand's unique positioning.`,
      opportunity: pitch.opportunity || 'We help growing brands scale customer acquisition through high-converting Meta Ads and AI video creatives.',
      cta: pitch.cta || 'Would you be open to a quick 15-minute intro call this week to discuss a few creative angles?',
      body: body.trim()
    };
  }

  generateDeterministicPitch({ businessName, category, location, website }) {
    const firstName = businessName.split(' ')[0] || 'Team';
    const locClean = location ? location.split(',')[0].trim() : 'your area';

    const subjects = [
      `Quick question regarding ${businessName}'s customer acquisition in ${locClean}`,
      `15-min chat: Scaling ${businessName} with Meta Ads & AI Video?`,
      `Growth idea for ${businessName} — 15 minute call?`
    ];

    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const opening = `I was reviewing ${businessName}'s presence in ${locClean} and really admire the aesthetic and customer appeal of your brand.`;
    const opportunity = `At KLIKWise, we specialize in high-converting Meta Ads and AI-powered short-form video creatives that systematically lower acquisition costs and drive qualified buyers.`;
    const cta = `Would you be open to a brief 15-minute intro call this Thursday or Friday to explore if our growth frameworks could work for ${businessName}?`;

    const body = `Hi ${firstName},

${opening}

${opportunity} We work closely with founders to test high-ROI creative angles that turn social browsers into loyal customers.

${cta} If you're open to connecting, just reply with a time that suits you or let me know if we can schedule a quick 15-minute discussion.

Warm regards,
Mayank Aggarwal
Co-Founder & AI Creative Head | KLIKWise
Phone: +91 9217756033
Email: riyansh.studio007@gmail.com`;

    return {
      subject,
      openingObservation: opening,
      opportunity,
      cta,
      body
    };
  }
}

module.exports = new AiProvider();
