/**
 * Chatwoot Omnichannel Support Connector:
 * Manages customer conversations, live chat, and automated AI assistance using native fetch.
 */
class ChatwootSupport {
  constructor(options = {}) {
    this.apiUrl = options.apiUrl || process.env.CHATWOOT_API_URL || 'http://localhost:3002';
    this.apiKey = options.apiKey || process.env.CHATWOOT_API_KEY || '';
    this.accountId = options.accountId || process.env.CHATWOOT_ACCOUNT_ID || '1';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiUrl && this.apiKey.length > 5);
  }

  getHeaders() {
    return {
      'api_access_token': this.apiKey,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Fetch open or pending conversations
   */
  async listConversations(status = 'open') {
    if (!this.isConfigured()) {
      return [
        {
          id: 1,
          status: 'open',
          unread_count: 1,
          meta: { sender: { name: 'Sample Prospect', email: 'prospect@example.com' } },
          last_non_activity_message: { content: 'Hi, what are your monthly pricing packages?' },
          simulated: true
        }
      ];
    }

    try {
      const response = await fetch(
        `${this.apiUrl}/api/v1/accounts/${this.accountId}/conversations?status=${status}`,
        { headers: this.getHeaders() }
      );
      if (response.ok) {
        const data = await response.json();
        return data?.data?.payload || [];
      }
      return [];
    } catch (err) {
      console.error('[Chatwoot] Failed to list conversations:', err.message);
      return [];
    }
  }

  /**
   * Send a reply message into a conversation
   */
  async sendMessage(conversationId, message, isPrivate = false) {
    if (!this.isConfigured()) {
      return { id: `mock-msg-${Date.now()}`, conversationId, message, isPrivate, simulated: true };
    }

    try {
      const response = await fetch(
        `${this.apiUrl}/api/v1/accounts/${this.accountId}/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            content: message,
            message_type: 'outgoing',
            private: isPrivate
          })
        }
      );
      if (response.ok) {
        return await response.json();
      }
      return { error: `HTTP ${response.status}`, fallback: true };
    } catch (err) {
      return { error: err.message, fallback: true };
    }
  }
}

module.exports = ChatwootSupport;
