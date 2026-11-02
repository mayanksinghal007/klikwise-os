/**
 * Site Enricher: Scrapes and extracts contact information, social handles,
 * and key business insights from target company websites using native fetch & parsers.
 */
class SiteEnricher {
  constructor(options = {}) {
    this.timeout = options.timeout || 6000;
    this.userAgent = options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

  /**
   * Enrich a website URL with emails, phone numbers, and social profiles
   * @param {string} url - Website URL
   */
  async enrichUrl(url) {
    if (!url || !url.startsWith('http')) {
      return { url, valid: false, error: 'Invalid URL provided' };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        headers: { 'User-Agent': this.userAgent },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return { url, valid: false, error: `HTTP ${response.status}` };
      }

      const html = await response.text();
      return this.parseHtml(url, html);
    } catch (err) {
      return {
        url,
        valid: false,
        error: err.message,
        emails: [],
        phones: [],
        socials: {}
      };
    }
  }

  parseHtml(url, html) {
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Extract description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1].trim() : '';

    // Extract emails
    const emails = this.extractEmails(html);

    // Extract phones
    const phones = this.extractPhones(html);

    // Extract social links
    const socials = this.extractSocials(html);

    // Extract readable body text snippet (strip tags, scripts, styles)
    const cleanBody = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1000);

    return {
      url,
      valid: true,
      title,
      description,
      emails,
      phones,
      socials,
      summarySnippet: cleanBody
    };
  }

  extractEmails(html) {
    const emails = new Set();

    // Check mailto: links
    const mailtoRegex = /href=["']mailto:([^"'?]+)/gi;
    let match;
    while ((match = mailtoRegex.exec(html)) !== null) {
      const email = match[1].trim().toLowerCase();
      if (this.isValidEmail(email)) {
        emails.add(email);
      }
    }

    // Check regex in text
    const textEmailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = html.match(textEmailRegex) || [];
    for (const item of matches) {
      const clean = item.trim().toLowerCase();
      if (this.isValidEmail(clean)) {
        emails.add(clean);
      }
    }

    return Array.from(emails);
  }

  isValidEmail(email) {
    if (!email || email.length < 5 || email.length > 80) return false;
    const blacklist = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', 'example.com', 'w3.org', 'schema.org', 'sentry.io', 'domain.com'];
    for (const item of blacklist) {
      if (email.includes(item)) return false;
    }
    return true;
  }

  extractPhones(html) {
    const phones = new Set();
    const telRegex = /href=["']tel:([^"']+)["']/gi;
    let match;
    while ((match = telRegex.exec(html)) !== null) {
      const phone = match[1].trim();
      if (phone) phones.add(phone);
    }

    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const matches = html.match(phoneRegex) || [];
    for (const item of matches) {
      const clean = item.trim();
      if (clean.length >= 10 && clean.length <= 18) {
        phones.add(clean);
      }
    }
    return Array.from(phones).slice(0, 3);
  }

  extractSocials(html) {
    const socials = {};
    const linkRegex = /href=["'](https?:\/\/[^"']+)["']/gi;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1];
      if (href.includes('linkedin.com/company/') || href.includes('linkedin.com/in/')) {
        socials.linkedin = href;
      } else if (href.includes('twitter.com/') || href.includes('x.com/')) {
        socials.twitter = href;
      } else if (href.includes('facebook.com/')) {
        socials.facebook = href;
      } else if (href.includes('instagram.com/')) {
        socials.instagram = href;
      }
    }
    return socials;
  }
}

module.exports = SiteEnricher;
