/**
 * KLIKWise OS — Official Meta WhatsApp Cloud API & Compliance Engine
 * Handles Meta Cloud API integration, webhook verification, 24h customer service windows,
 * approved message templates, opt-in enforcement, and WhatsApp Business Coexistence.
 */

const fs = require('fs');
const path = require('path');
const security = require('../lib/security');

class WhatsAppManager {
  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v19.0';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.webhookVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'klikwise_verify_token_secure_2026';
    this.businessNumber = '+919217756033';
    
    // In-memory conversation state & opt-out registry
    this.optedOutNumbers = new Set();
    this.activeConversations = new Map();
  }

  isConfigured() {
    return Boolean(this.phoneNumberId && this.accessToken && this.accessToken.length > 10);
  }

  /**
   * Evaluates WhatsApp Business Coexistence compatibility
   * Allows Mayank Aggarwal to use his existing WhatsApp Business App on his phone
   * alongside Cloud API automation without disconnecting his mobile app.
   */
  getCoexistenceStatus() {
    return {
      supported: true,
      currentNumber: this.businessNumber,
      coexistenceType: 'META_CLOUD_API_COEXISTENCE',
      recommendation: 'Use WhatsApp Business Coexistence so you can continue using the WhatsApp Business mobile app on +91 9217756033 while KLIKWise OS handles automated webhook listening and template approvals.',
      instructions: [
        '1. Ensure phone number +91 9217756033 is registered under Meta Business Portfolio.',
        '2. Enable Cloud API without deregistering the WhatsApp Business App on your Android/iOS device.',
        '3. Add the Webhook URL (https://your-domain.com/api/whatsapp/webhook) to Meta Developer App.'
      ]
    };
  }

  /**
   * Verify Meta Webhook handshake (GET /api/whatsapp/webhook)
   */
  verifyWebhook(query) {
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    if (mode === 'subscribe' && token === this.webhookVerifyToken) {
      return { verified: true, challenge };
    }
    return { verified: false };
  }

  /**
   * Process incoming WhatsApp Webhook events (POST /api/whatsapp/webhook)
   */
  async processIncomingWebhook(body) {
    try {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (!value || !value.messages) {
        return { status: 'NO_MESSAGES' };
      }

      const message = value.messages[0];
      const fromNumber = message.from;
      const text = message.text?.body || '';

      // Check for Opt-Out intent ("STOP", "UNSUBSCRIBE", "NO")
      if (/^(stop|unsubscribe|cancel|optout|no)$/i.test(text.trim())) {
        this.optedOutNumbers.add(fromNumber);
        security.logAction({
          action: 'WHATSAPP_OPT_OUT',
          actor: fromNumber,
          resource: 'WHATSAPP_COMPLIANCE',
          details: { reason: 'User requested opt-out' }
        });
        return {
          status: 'OPTED_OUT',
          from: fromNumber,
          actionTaken: 'Number added to suppression list. Promotional messages blocked.'
        };
      }

      // Record active conversation & timestamp (opens 24h customer service window)
      const convKey = `wa_${fromNumber}`;
      this.activeConversations.set(convKey, {
        phoneNumber: fromNumber,
        lastCustomerMessageTime: Date.now(),
        lastMessage: text,
        contactName: value.contacts?.[0]?.profile?.name || 'Prospect'
      });

      return {
        status: 'MESSAGE_RECEIVED',
        from: fromNumber,
        text,
        serviceWindowOpen: true
      };
    } catch (err) {
      console.error('[WhatsAppManager] Error processing webhook:', err.message);
      return { status: 'ERROR', error: err.message };
    }
  }

  /**
   * Check if a number is eligible for communication according to Meta compliance
   */
  checkCompliance(phoneNumber, hasExplicitOptIn = false) {
    if (this.optedOutNumbers.has(phoneNumber)) {
      return {
        allowed: false,
        reason: 'Recipient has opted out of promotional messages.'
      };
    }

    const conv = this.activeConversations.get(`wa_${phoneNumber}`);
    const now = Date.now();
    const isWithin24HourWindow = conv && (now - conv.lastCustomerMessageTime) < (24 * 60 * 60 * 1000);

    if (isWithin24HourWindow) {
      return {
        allowed: true,
        type: 'CUSTOMER_SERVICE_WINDOW',
        reason: 'User sent a message within the last 24 hours. Free-form text allowed.'
      };
    }

    if (hasExplicitOptIn) {
      return {
        allowed: true,
        type: 'PRE_APPROVED_TEMPLATE_ONLY',
        reason: 'Explicit opt-in recorded. Requires Meta pre-approved template.'
      };
    }

    return {
      allowed: false,
      reason: 'No active 24-hour service window and no verified opt-in. Sending cold promotional WhatsApp messages to numbers discovered via Google Maps is strictly prohibited by Meta policy.'
    };
  }

  /**
   * Send WhatsApp message (live or simulated in dev mode)
   */
  async sendMessage({ to, text, templateName = null, hasOptIn = false }) {
    const compliance = this.checkCompliance(to, hasOptIn);
    if (!compliance.allowed) {
      return {
        status: 'BLOCKED_BY_POLICY',
        reason: compliance.reason,
        to
      };
    }

    if (!this.isConfigured()) {
      return {
        status: 'SIMULATED_SENT',
        to,
        message: text || `[Template: ${templateName}]`,
        deliveryType: compliance.type,
        simulated: true
      };
    }

    try {
      const payload = {
        messaging_product: 'whatsapp',
        to,
        type: templateName ? 'template' : 'text',
      };

      if (templateName) {
        payload.template = {
          name: templateName,
          language: { code: 'en' }
        };
      } else {
        payload.text = { body: text };
      }

      const response = await fetch(`${this.apiUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { status: 'FAILED', error: errorText };
      }

      const data = await response.json();
      return { status: 'SENT', messageId: data.messages?.[0]?.id };
    } catch (err) {
      return { status: 'ERROR', error: err.message };
    }
  }

  /**
   * Return verified pre-approved templates
   */
  getApprovedTemplates() {
    return [
      {
        id: 'klikwise_discovery_followup',
        name: 'klikwise_discovery_followup',
        category: 'MARKETING',
        language: 'en',
        status: 'APPROVED',
        bodyText: 'Hello {{1}}, Mayank Aggarwal here from KLIKWise. Regarding our discussion on {{2}}, here is your customized proposal & portfolio: {{3}}.'
      },
      {
        id: 'klikwise_meeting_reminder',
        name: 'klikwise_meeting_reminder',
        category: 'UTILITY',
        language: 'en',
        status: 'APPROVED',
        bodyText: 'Hi {{1}}, this is a quick reminder for your scheduled growth strategy session with KLIKWise today at {{2}}. Meeting link: {{3}}'
      }
    ];
  }
}

module.exports = new WhatsAppManager();

