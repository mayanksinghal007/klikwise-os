/**
 * Twenty CRM Connector:
 * Manages Companies, Contacts (People), Opportunities, and Notes in Twenty CRM using native fetch.
 */
class TwentyCrm {
  constructor(options = {}) {
    this.apiUrl = options.apiUrl || process.env.TWENTY_API_URL || 'http://localhost:3000';
    this.apiKey = options.apiKey || process.env.TWENTY_API_KEY || '';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiUrl && this.apiKey.length > 5);
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Create a company record in Twenty CRM
   */
  async createCompany({ name, domain, address, phone, employees }) {
    if (!this.isConfigured()) {
      return { id: `mock-company-${Date.now()}`, name, domain, simulated: true };
    }

    try {
      const response = await fetch(`${this.apiUrl}/rest/companies`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          name,
          domainName: domain,
          address,
          phone,
          numberOfEmployees: employees || 10
        })
      });

      if (!response.ok) {
        return { error: `HTTP ${response.status}`, fallback: true };
      }
      return await response.json();
    } catch (err) {
      console.error(`[TwentyCRM] Error creating company ${name}:`, err.message);
      return { error: err.message, fallback: true };
    }
  }

  /**
   * Create a contact person in Twenty CRM
   */
  async createPerson({ firstName, lastName, email, phone, companyId, jobTitle }) {
    if (!this.isConfigured()) {
      return { id: `mock-person-${Date.now()}`, firstName, lastName, email, simulated: true };
    }

    try {
      const response = await fetch(`${this.apiUrl}/rest/people`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          name: { firstName, lastName },
          emails: [{ primary: true, address: email }],
          phones: phone ? [{ primary: true, number: phone }] : [],
          companyId,
          jobTitle: jobTitle || 'Lead Contact'
        })
      });

      if (!response.ok) {
        return { error: `HTTP ${response.status}`, fallback: true };
      }
      return await response.json();
    } catch (err) {
      console.error(`[TwentyCRM] Error creating person ${email}:`, err.message);
      return { error: err.message, fallback: true };
    }
  }

  /**
   * Create an opportunity (deal in pipeline)
   */
  async createOpportunity({ name, amount, stage = 'PROSPECTING', companyId }) {
    if (!this.isConfigured()) {
      return { id: `mock-opp-${Date.now()}`, name, amount, stage, simulated: true };
    }

    try {
      const response = await fetch(`${this.apiUrl}/rest/opportunities`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          name,
          amount: { amountMicros: (amount || 2500) * 1000000, currencyCode: 'USD' },
          stage,
          companyId
        })
      });

      if (!response.ok) {
        return { error: `HTTP ${response.status}`, fallback: true };
      }
      return await response.json();
    } catch (err) {
      console.error(`[TwentyCRM] Error creating opportunity ${name}:`, err.message);
      return { error: err.message, fallback: true };
    }
  }
}

module.exports = TwentyCrm;
