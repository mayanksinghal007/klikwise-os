/**
 * Listmonk Mailer:
 * Manages subscriber lists, campaigns, and outreach sequences using native fetch.
 */
class ListmonkMailer {
  constructor(options = {}) {
    this.apiUrl = options.apiUrl || process.env.LISTMONK_API_URL || 'http://localhost:9000';
    this.username = options.username || process.env.LISTMONK_API_USER || 'admin';
    this.password = options.password || process.env.LISTMONK_API_PASS || 'admin';
  }

  isConfigured() {
    return Boolean(this.apiUrl && this.username && this.password && process.env.LISTMONK_API_USER !== 'admin');
  }

  getAuthHeaders() {
    const token = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    return {
      'Authorization': `Basic ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Add a lead to an outreach list
   */
  async addSubscriber({ email, name, attributes = {}, listIds = [1] }) {
    if (!this.isConfigured()) {
      return { id: `mock-sub-${Date.now()}`, email, name, simulated: true };
    }

    try {
      const response = await fetch(`${this.apiUrl}/api/subscribers`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          email,
          name,
          status: 'enabled',
          lists: listIds,
          attribs: attributes,
          preconfirm_subscriptions: true
        })
      });

      if (!response.ok) {
        return { error: `HTTP ${response.status}`, fallback: true };
      }
      return await response.json();
    } catch (err) {
      console.error(`[Listmonk] Failed to add subscriber ${email}:`, err.message);
      return { error: err.message, email, fallback: true };
    }
  }

  /**
   * Retrieve all subscriber lists
   */
  async getLists() {
    if (!this.isConfigured()) {
      return [{ id: 1, name: 'Default B2B Outreach List', type: 'public', simulated: true }];
    }

    try {
      const response = await fetch(`${this.apiUrl}/api/lists`, {
        headers: this.getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        return data?.data?.results || [];
      }
      return [{ id: 1, name: 'Default B2B Outreach List', fallback: true }];
    } catch (err) {
      return [{ id: 1, name: 'Default B2B Outreach List', fallback: true }];
    }
  }
}

module.exports = ListmonkMailer;
