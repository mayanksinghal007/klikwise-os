/**
 * Documenso E-Signature Connector:
 * Prepares service agreements, contracts, and proposals for digital signature using native fetch.
 */
class DocumensoContracts {
  constructor(options = {}) {
    this.apiUrl = options.apiUrl || process.env.DOCUMENSO_API_URL || 'http://localhost:3003';
    this.apiKey = options.apiKey || process.env.DOCUMENSO_API_KEY || '';
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
   * Create a service contract signing request
   */
  async createContract({ title, recipientName, recipientEmail, servicePackage, amount }) {
    if (!this.isConfigured()) {
      return {
        id: `mock-doc-${Date.now()}`,
        title: title || `Service Agreement - ${servicePackage || 'B2B Services'}`,
        status: 'DRAFT',
        recipientName,
        recipientEmail,
        signingUrl: `https://documenso.example.com/sign/mock-${Date.now()}`,
        simulated: true
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/api/v1/documents`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          title: title || `Service Agreement - ${recipientName}`,
          recipients: [
            {
              name: recipientName,
              email: recipientEmail,
              role: 'SIGNER'
            }
          ],
          meta: { servicePackage, amount }
        })
      });

      if (!response.ok) {
        return { error: `HTTP ${response.status}`, fallback: true };
      }
      return await response.json();
    } catch (err) {
      console.error('[Documenso] Failed to create contract:', err.message);
      return { error: err.message, fallback: true };
    }
  }

  /**
   * Check status of a contract
   */
  async getStatus(documentId) {
    if (!this.isConfigured() || String(documentId).startsWith('mock-')) {
      return { id: documentId, status: 'PENDING_SIGNATURE', simulated: true };
    }

    try {
      const response = await fetch(`${this.apiUrl}/api/v1/documents/${documentId}`, {
        headers: this.getHeaders()
      });
      if (response.ok) {
        return await response.json();
      }
      return { id: documentId, error: `HTTP ${response.status}`, status: 'UNKNOWN' };
    } catch (err) {
      return { id: documentId, error: err.message, status: 'UNKNOWN' };
    }
  }
}

module.exports = DocumensoContracts;
