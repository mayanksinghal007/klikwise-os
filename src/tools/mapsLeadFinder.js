/**
 * Lead Finder: Queries google-maps-scraper service or provides search simulation.
 */
class MapsLeadFinder {
  constructor(baseUrl = process.env.SCRAPER_SERVICE_URL || 'http://localhost:8080') {
    this.baseUrl = baseUrl;
  }

  /**
   * Search Google Maps leads
   * @param {string} query - Target niche/business (e.g., "Digital Marketing Agency", "Dentists")
   * @param {string} location - City or region (e.g., "Austin, TX", "London, UK")
   * @param {number} limit - Maximum number of leads to fetch
   */
  async searchLeads(query, location, limit = 10) {
    const fullQuery = `${query} in ${location}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${this.baseUrl}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: fullQuery, max_results: limit }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && data.results) {
          return data.results.map(item => this.normalizeLead(item));
        }
      }
    } catch (err) {
      // Scraper service offline or unreachable, fallback to simulation
    }

    return this.generateSimulatedLeads(query, location, limit);
  }

  normalizeLead(raw) {
    return {
      title: raw.title || raw.name || 'Unknown Business',
      category: raw.category || raw.type || 'General',
      address: raw.address || '',
      city: raw.city || '',
      phone: raw.phone || '',
      website: raw.website || raw.link || '',
      rating: raw.total_score || raw.rating || 0,
      reviewsCount: raw.reviews_count || 0,
      mapsUrl: raw.google_url || raw.url || ''
    };
  }

  generateSimulatedLeads(query, location, limit) {
    const slug = query.toLowerCase().replace(/[^a-z0-9]/g, '');
    const results = [];
    for (let i = 1; i <= limit; i++) {
      results.push({
        title: `${query} Pro Group ${i}`,
        category: query,
        address: `${100 + i * 15} Main St, ${location}`,
        city: location,
        phone: `+1 (555) ${100 + i}-${2000 + i}`,
        website: `https://${slug}-example-${i}.com`,
        rating: (4.0 + (i % 10) * 0.1).toFixed(1),
        reviewsCount: 15 + i * 7,
        mapsUrl: `https://maps.google.com/?q=${encodeURIComponent(query + ' ' + location)}`
      });
    }
    return results;
  }
}

module.exports = MapsLeadFinder;
