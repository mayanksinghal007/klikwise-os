/**
 * KLIKWise OS — Follow-Up Cadence & Lifecycle Manager
 * Implements the Day 0, Day 3, Day 7, Day 14 follow-up engine.
 * Automatically halts when prospects reply or request opt-outs.
 */

const security = require('../lib/security');

class FollowUpCadence {
  constructor() {
    this.sequences = new Map();
  }

  /**
   * Enroll a lead into the follow-up cadence
   */
  enrollLead(lead) {
    const sequenceId = `SEQ-${lead.id || Date.now()}`;
    const now = Date.now();

    const sequence = {
      sequenceId,
      leadId: lead.id,
      businessName: lead.businessName || lead.title,
      email: lead.email,
      phone: lead.phone,
      status: 'ACTIVE', // ACTIVE, PAUSED_REPLIED, STOPPED_OPT_OUT, COMPLETED
      currentStep: 0,
      createdAt: new Date(now).toISOString(),
      steps: [
        {
          day: 0,
          type: 'INITIAL_OUTREACH',
          scheduledAt: new Date(now).toISOString(),
          status: 'SENT',
          subject: `Quick thought regarding ${lead.businessName || lead.title}'s customer acquisition`
        },
        {
          day: 3,
          type: 'FOLLOWUP_1',
          scheduledAt: new Date(now + 3 * 86400000).toISOString(),
          status: 'PENDING',
          subject: `3 ad creative observations for ${lead.businessName || lead.title}`
        },
        {
          day: 7,
          type: 'FOLLOWUP_2',
          scheduledAt: new Date(now + 7 * 86400000).toISOString(),
          status: 'PENDING',
          subject: `Competitor creative insights in your sector`
        },
        {
          day: 14,
          type: 'FINAL_FOLLOWUP',
          scheduledAt: new Date(now + 14 * 86400000).toISOString(),
          status: 'PENDING',
          subject: `Closing the loop regarding ${lead.businessName || lead.title}`
        }
      ]
    };

    this.sequences.set(sequenceId, sequence);
    return sequence;
  }

  /**
   * Automatically pauses follow-up when prospect replies
   */
  handleProspectReply(leadId, replyText) {
    for (const [id, seq] of this.sequences.entries()) {
      if (seq.leadId === leadId || seq.email === leadId) {
        seq.status = 'PAUSED_REPLIED';
        seq.lastReply = replyText;
        seq.lastReplyAt = new Date().toISOString();

        security.logAction({
          action: 'FOLLOWUP_PAUSED_REPLY_RECEIVED',
          actor: 'AUTOMATION',
          resource: id,
          details: { reply: replyText, business: seq.businessName }
        });

        return { paused: true, sequenceId: id, message: 'Prospect replied. Automated follow-ups suspended for AI/Human sales handling.' };
      }
    }
    return { paused: false };
  }

  /**
   * Permanently stops communication when opt-out is detected
   */
  handleOptOut(leadId, reason = 'Unsubscribed') {
    for (const [id, seq] of this.sequences.entries()) {
      if (seq.leadId === leadId || seq.email === leadId) {
        seq.status = 'STOPPED_OPT_OUT';
        seq.optOutReason = reason;

        security.logAction({
          action: 'FOLLOWUP_STOPPED_OPT_OUT',
          actor: 'PROSPECT',
          resource: id,
          details: { reason, business: seq.businessName }
        });

        return { stopped: true, sequenceId: id };
      }
    }
    return { stopped: false };
  }

  listActiveSequences() {
    return Array.from(this.sequences.values());
  }
}

module.exports = new FollowUpCadence();

