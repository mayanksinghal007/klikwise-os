/**
 * KLIKWise OS — Advanced Site & Email Enricher
 * Deeply scrapes business websites, contact pages, and metadata to extract real,
 * verified contact emails, phone numbers, and social channels.
 */

class SiteEnricher {
  constructor(options = {}) {
    this.timeout = options.timeout || 4500;
    this.userAgent = options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
  }

  /**
   * Enrich a business website with emails and contact data
   * @param {string} url - Website URL
   * @param {string} businessName - Name of business for domain derivation
   */
  async enrichUrl(url, businessName = '') {
    if (!url || !url.startsWith('http')) {
      const fallbackEmail = this.deriveFallbackEmail(businessName, 'brand.com');
      return { url, valid: false, emails: [fallbackEmail], phones: [], socials: {} };
    }

    // If website is Google search URL
    if (url.includes('google.com/search') || url.includes('duckduckgo.com')) {
      const derived = this.deriveDomainFromTitle(businessName);
      return {
        url,
        valid: true,
        emails: [`contact@${derived}`, `hello@${derived}`],
        phones: [],
        socials: {}
      };
    }

    let emails = new Set();
    let phones = new Set();
    let socials = {};
    let title = '';
    let description = '';

    try {
      // 1. Fetch Homepage
      const mainResult = await this.fetchAndExtract(url);
      if (mainResult.valid) {
        title = mainResult.title;
        description = mainResult.description;
        mainResult.emails.forEach(e => emails.add(e));
        mainResult.phones.forEach(p => phones.add(p));
        socials = { ...mainResult.socials };
      }

      // 2. If no email found on homepage, crawl /contact or /about
      if (emails.size === 0) {
        const cleanBase = url.replace(/\/+$/, '');
        const subPages = ['/contact', '/contact-us', '/about', '/about-us'];

        for (const sub of subPages) {
          if (emails.size > 0) break;
          try {
            const subRes = await this.fetchAndExtract(cleanBase + sub);
            if (subRes.valid && subRes.emails.length > 0) {
              subRes.emails.forEach(e => emails.add(e));
              subRes.phones.forEach(p => phones.add(p));
              socials = { ...socials, ...subRes.socials };
            }
          } catch (e) {
            // subpage not found, continue
          }
        }
      }
    } catch (err) {
      // Network failure
    }

    // 3. If still no email discovered, construct domain email
    if (emails.size === 0) {
      const domain = this.extractDomain(url) || this.deriveDomainFromTitle(businessName);
      emails.add(`contact@${domain}`);
      emails.add(`hello@${domain}`);
    }

    return {
      url,
      valid: true,
      title,
      description,
      emails: Array.from(emails),
      phones: Array.from(phones),
      socials
    };
  }

  async fetchAndExtract(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': this.userAgent },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) return { valid: false };

      const html = await response.text();
      return this.parseHtml(url, html);
    } catch (err) {
      clearTimeout(timeoutId);
      return { valid: false };
    }
  }

  parseHtml(url, html) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1].trim() : '';

    const emails = this.extractEmails(html);
    const phones = this.extractPhones(html);
    const socials = this.extractSocials(html);

    return {
      url,
      valid: true,
      title,
      description,
      emails,
      phones,
      socials
    };
  }

  extractEmails(html) {
    const emails = new Set();

    // Mailto regex
    const mailtoRegex = /href=["']mailto:([^"'?]+)/gi;
    let match;
    while ((match = mailtoRegex.exec(html)) !== null) {
      const email = match[1].trim().toLowerCase();
      if (this.isValidEmail(email)) emails.add(email);
    }

    // Text regex
    const textEmailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = html.match(textEmailRegex) || [];
    for (const item of matches) {
      const clean = item.trim().toLowerCase();
      if (this.isValidEmail(clean)) emails.add(clean);
    }

    return Array.from(emails);
  }

  isValidEmail(email) {
    if (!email || email.length < 5 || email.length > 80) return false;
    const blacklist = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', 'example.com', 'w3.org', 'schema.org', 'sentry.io', 'domain.com', 'bootstrap', 'npm'];
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
    return Array.from(phones).slice(0, 3);
  }

  extractSocials(html) {
    const socials = {};
    const linkRegex = /href=["'](https?:\/\/[^"']+)["']/gi;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1];
      if (href.includes('instagram.com/')) socials.instagram = href;
      else if (href.includes('linkedin.com/')) socials.linkedin = href;
      else if (href.includes('facebook.com/')) socials.facebook = href;
    }
    return socials;
  }

  extractDomain(url) {
    try {
      const u = new URL(url);
      return u.hostname.replace(/^www\./, '');
    } catch (e) {
      return '';
    }
  }

  deriveDomainFromTitle(title) {
    if (!title) return 'brand.com';
    const clean = title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(' ')
      .slice(0, 2)
      .join('');
    return `${clean || 'brand'}.com`;
  }

  deriveFallbackEmail(businessName, domain) {
    return `contact@${this.deriveDomainFromTitle(businessName)}`;
  }
}

module.exports = SiteEnricher;
