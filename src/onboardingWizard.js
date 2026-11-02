/**
 * KLIKWise OS — Onboarding & Business Profile Configuration Wizard
 * Calculates setup completeness and updates the unified business knowledge layer.
 */

const fs = require('fs');
const path = require('path');

const PROFILE_PATH = path.resolve(__dirname, '../config/business_profile.json');

class OnboardingWizard {
  constructor(profilePath = PROFILE_PATH) {
    this.profilePath = profilePath;
  }

  loadProfile() {
    try {
      if (fs.existsSync(this.profilePath)) {
        return JSON.parse(fs.readFileSync(this.profilePath, 'utf8'));
      }
    } catch (err) {
      console.error('[OnboardingWizard] Error reading profile:', err.message);
    }
    return {};
  }

  saveProfile(profileData) {
    fs.writeFileSync(this.profilePath, JSON.stringify(profileData, null, 2), 'utf8');
    return this.calculateCompleteness(profileData);
  }

  /**
   * Evaluates setup completion score (0-100%) and returns pending action items
   */
  calculateCompleteness(profile = null) {
    const p = profile || this.loadProfile();
    const checks = [
      { key: 'business.name', label: 'Company Name', weight: 10, valid: Boolean(p.business?.name && p.business.name !== 'My Business') },
      { key: 'business.industry', label: 'Industry & Niche', weight: 10, valid: Boolean(p.business?.industry) },
      { key: 'business.website', label: 'Business Website', weight: 5, valid: Boolean(p.business?.website && !p.business.website.includes('example.com')) },
      { key: 'business.contact_email', label: 'Business Email', weight: 10, valid: Boolean(p.business?.contact_email && !p.business.contact_email.includes('example.com')) },
      { key: 'business.phone', label: 'Contact Phone', weight: 5, valid: Boolean(p.business?.phone) },
      { key: 'offerings', label: 'Core Services & Pricing', weight: 15, valid: Boolean(Array.isArray(p.offerings) && p.offerings.length > 0) },
      { key: 'target_audience.ideal_customer_profile', label: 'Ideal Customer Profile (ICP)', weight: 15, valid: Boolean(p.target_audience?.ideal_customer_profile) },
      { key: 'target_audience.value_propositions', label: 'Value Propositions', weight: 10, valid: Boolean(p.target_audience?.value_propositions?.length > 0) },
      { key: 'outreach_strategy.booking_link', label: 'Cal.com Booking URL', weight: 10, valid: Boolean(p.outreach_strategy?.booking_link && !p.outreach_strategy.booking_link.includes('your-username')) },
      { key: 'templates.cold_email_body', label: 'Cold Outreach Template', weight: 10, valid: Boolean(p.templates?.cold_email_body) }
    ];

    let score = 0;
    const completedItems = [];
    const missingItems = [];

    for (const item of checks) {
      if (item.valid) {
        score += item.weight;
        completedItems.push(item.label);
      } else {
        missingItems.push(item.label);
      }
    }

    return {
      completionPercentage: score,
      isFullyConfigured: score >= 90,
      completedItems,
      missingItems,
      totalSteps: checks.length,
      completedSteps: completedItems.length
    };
  }
}

module.exports = new OnboardingWizard();

