/**
 * KLIKWise OS — Automated Cold Email & Follow-up Dispatcher
 * Dispatches automated cold emails and multi-touch sequences directly from
 * Mayank Aggarwal's business email (riyansh.studio007@gmail.com) via SMTP/Gmail.
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const security = require('../lib/security');

const OUTBOX_FILE = path.resolve(__dirname, '../../data/outbox_emails.json');

class EmailDispatcher {
  constructor() {
    this.senderEmail = process.env.SENDER_EMAIL || 'riyansh.studio007@gmail.com';
    this.senderName = process.env.SENDER_NAME || 'Mayank Aggarwal | KLIKWise';
    this.smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    this.smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
    this.smtpSecure = this.smtpPort === 465;
    this.smtpUser = process.env.SMTP_USER || this.senderEmail;
    this.smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';
    
    this.outbox = this.loadOutbox();
  }

  loadOutbox() {
    try {
      if (fs.existsSync(OUTBOX_FILE)) {
        return JSON.parse(fs.readFileSync(OUTBOX_FILE, 'utf8'));
      }
    } catch (e) {
      console.warn('[EmailDispatcher] Outbox init error:', e.message);
    }
    return [];
  }

  saveOutbox() {
    try {
      const dir = path.dirname(OUTBOX_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(OUTBOX_FILE, JSON.stringify(this.outbox, null, 2), 'utf8');
    } catch (e) {
      console.warn('[EmailDispatcher] Failed to persist outbox:', e.message);
    }
  }

  isConfigured() {
    return Boolean(this.smtpPass && this.smtpPass.length >= 8);
  }

  updateConfig({ senderEmail, senderName, smtpPass, smtpHost, smtpPort }) {
    if (senderEmail) this.senderEmail = senderEmail.trim();
    if (senderName) this.senderName = senderName.trim();
    if (smtpPass) this.smtpPass = smtpPass.trim();
    if (smtpHost) this.smtpHost = smtpHost.trim();
    if (smtpPort) this.smtpPort = parseInt(smtpPort, 10);
    this.smtpUser = this.senderEmail;
    this.smtpSecure = this.smtpPort === 465;
    return this.isConfigured();
  }

  getTransporter() {
    if (!this.isConfigured()) return null;
    return nodemailer.createTransport({
      host: this.smtpHost,
      port: this.smtpPort,
      secure: this.smtpSecure,
      auth: {
        user: this.smtpUser,
        pass: this.smtpPass
      }
    });
  }

  /**
   * Send a cold email or follow-up
   */
  async sendEmail({ to, subject, html, text, leadName = 'Founder', campaignId = null }) {
    const record = {
      id: `mail_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      to,
      from: `"${this.senderName}" <${this.senderEmail}>`,
      subject,
      bodyPreview: (text || html || '').slice(0, 160),
      timestamp: new Date().toISOString(),
      leadName,
      campaignId,
      status: 'QUEUED'
    };

    if (!this.isConfigured()) {
      record.status = 'SIMULATED_DISPATCHED';
      record.note = 'Stored in outbox. Enter your Gmail App Password to send live over internet.';
      this.outbox.unshift(record);
      this.saveOutbox();

      security.logAction({
        action: 'COLD_EMAIL_STAGED',
        actor: this.senderEmail,
        resource: to,
        details: { subject, simulated: true },
        status: 'SUCCESS'
      });

      return {
        success: true,
        status: 'SIMULATED_DISPATCHED',
        messageId: record.id,
        to,
        from: this.senderEmail,
        note: record.note
      };
    }

    try {
      const transporter = this.getTransporter();
      const info = await transporter.sendMail({
        from: `"${this.senderName}" <${this.senderEmail}>`,
        to,
        subject,
        text: text || html.replace(/<[^>]+>/g, ''),
        html: html || `<p>${text.replace(/\n/g, '<br>')}</p>`
      });

      record.status = 'DELIVERED';
      record.messageId = info.messageId;
      this.outbox.unshift(record);
      this.saveOutbox();

      security.logAction({
        action: 'COLD_EMAIL_SENT',
        actor: this.senderEmail,
        resource: to,
        details: { subject, messageId: info.messageId },
        status: 'SUCCESS'
      });

      return {
        success: true,
        status: 'DELIVERED',
        messageId: info.messageId,
        to,
        from: this.senderEmail
      };
    } catch (err) {
      record.status = 'FAILED';
      record.error = err.message;
      this.outbox.unshift(record);
      this.saveOutbox();

      return {
        success: false,
        status: 'FAILED',
        error: err.message
      };
    }
  }

  /**
   * Send test email to Mayank's own inbox
   */
  async sendTestEmail(targetEmail = this.senderEmail) {
    const subject = `🚀 KLIKWise OS Automated Email Test (${new Date().toLocaleTimeString('en-IN')})`;
    const text = `Hi Mayank,\n\nYour automated email dispatcher is working properly from KLIKWise OS.\n\nSender: ${this.senderEmail}\nHost: ${this.smtpHost}:${this.smtpPort}\nStatus: ${this.isConfigured() ? 'LIVE SMTP ACTIVE' : 'SIMULATION MODE (Ready for Gmail App Password)'}\n\nAll cold outreach and follow-up sequences will dispatch from this address.\n\nBest regards,\nKLIKWise OS Engine`;
    
    return this.sendEmail({
      to: targetEmail,
      subject,
      text,
      leadName: 'Mayank Aggarwal',
      campaignId: 'SYS_TEST'
    });
  }

  getOutbox(limit = 30) {
    return this.outbox.slice(0, limit);
  }
}

module.exports = new EmailDispatcher();

