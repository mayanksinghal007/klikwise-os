/**
 * Cal.com Scheduler Connector:
 * Generates personalized booking links and checks availability using native fetch.
 */
class CalcomScheduler {
  constructor(options = {}) {
    this.apiUrl = options.apiUrl || process.env.CALCOM_API_URL || 'https://api.cal.com/v2';
    this.apiKey = options.apiKey || process.env.CALCOM_API_KEY || '';
    this.bookingUrl = options.bookingUrl || process.env.CALCOM_BOOKING_URL || 'https://cal.com/my-business/15min';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Generates a prefilled booking URL for a specific prospect
   */
  generateBookingLink({ name, email, notes, companyName }) {
    try {
      const url = new URL(this.bookingUrl);
      if (name) url.searchParams.set('name', name);
      if (email) url.searchParams.set('email', email);
      if (notes) url.searchParams.set('notes', notes);
      if (companyName) url.searchParams.set('company', companyName);
      return url.toString();
    } catch {
      return this.bookingUrl;
    }
  }

  /**
   * Fetch user event types (e.g. 15-min discovery, 30-min demo)
   */
  async getEventTypes() {
    if (!this.isConfigured()) {
      return [
        { id: 101, title: '15-Min Discovery Call', length: 15, slug: '15min', simulated: true },
        { id: 102, title: '30-Min Demo & Strategy', length: 30, slug: '30min', simulated: true }
      ];
    }

    try {
      const response = await fetch(`${this.apiUrl}/event-types`, { headers: this.getHeaders() });
      if (response.ok) {
        const data = await response.json();
        return data?.data || [];
      }
      return [{ id: 101, title: '15-Min Discovery Call', length: 15, slug: '15min', fallback: true }];
    } catch (err) {
      return [{ id: 101, title: '15-Min Discovery Call', length: 15, slug: '15min', fallback: true }];
    }
  }
}

module.exports = CalcomScheduler;
