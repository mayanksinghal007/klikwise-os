/**
 * KLIKWise OS v2.0 — Comprehensive Verification & Acceptance Test Suite
 * Validates the 17-Module Architecture, 12 Specialized Agents,
 * Command Center Orchestrator ("Find 10 D2C women's fashion brands in Delhi"),
 * AI Sales Representative, WhatsApp Compliance, and Follow-Up Cadence.
 */

const assert = require('assert');
const toolRegistry = require('../src/lib/toolSdk');
const multiAgentCenter = require('../src/agent/multiAgentCenter');
const security = require('../src/lib/security');
const commandCenter = require('../src/agent/commandCenterOrchestrator');
const salesAgent = require('../src/agent/salesAgent');
const whatsappManager = require('../src/tools/whatsappManager');
const followupCadence = require('../src/workflows/followupCadence');

async function runTests() {
  console.log('======================================================');
  console.log('    KLIKWise OS v2.0 — Master Verification Suite      ');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
    }
  }

  async function testAsync(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
    }
  }

  // 1. Tool Registry Tests
  test('Tool Registry initializes all 7 repository adapters', () => {
    const tools = toolRegistry.listAll();
    assert(tools.length >= 7);
  });

  // 2. The 12 Specialized AI Agents Tests
  test('Multi-Agent Center registers all 12 specialized agents', () => {
    const agents = multiAgentCenter.listAgents();
    assert.strictEqual(agents.length, 12, `Expected 12 specialized agents, found ${agents.length}`);
    const agentIds = agents.map(a => a.id);
    assert(agentIds.includes('agent_command_center'));
    assert(agentIds.includes('agent_business_research'));
    assert(agentIds.includes('agent_lead_qualification'));
    assert(agentIds.includes('agent_personalisation'));
    assert(agentIds.includes('agent_email_outreach'));
    assert(agentIds.includes('agent_whatsapp'));
    assert(agentIds.includes('agent_sales'));
    assert(agentIds.includes('agent_pricing'));
    assert(agentIds.includes('agent_proposal'));
    assert(agentIds.includes('agent_followup'));
    assert(agentIds.includes('agent_crm'));
    assert(agentIds.includes('agent_reporting'));
  });

  // 3. Signature Workflow: Natural Language Command Center
  await testAsync('Command Center executes: "Find 10 D2C women\'s fashion brands in Delhi"', async () => {
    const prompt = "Find 10 D2C women's fashion brands in Delhi.";
    const result = await commandCenter.executeCommand(prompt, 'APPROVAL_MODE', 'Mayank Aggarwal');
    
    assert(result.campaignId.startsWith('CAMP-'));
    assert.strictEqual(result.plan.count, 10);
    assert(result.plan.location.toLowerCase().includes('delhi'));
    assert.strictEqual(result.leads.length, 10);
    assert.strictEqual(result.requiresApproval, true); // Enforces Mode B approval gate!
    
    // Check first lead structure
    const first = result.leads[0];
    assert(first.businessName);
    assert(first.leadScore >= 50 && first.leadScore <= 100);
    assert(first.recommendedServices.length > 0);
    assert(first.whatsappCompliance.consentStatus === 'OPT_IN_REQUIRED');
    assert(first.pitchDraft.subject.length > 10);
  });

  // 4. Human-In-The-Loop Approval Action
  await testAsync('Command Center approves and dispatches staged campaign', async () => {
    const prompt = "Find 5 real estate businesses in Gurgaon";
    const staged = await commandCenter.executeCommand(prompt, 'APPROVAL_MODE');
    const approval = commandCenter.approveCampaign(staged.campaignId);
    
    assert.strictEqual(approval.success, true);
    assert.strictEqual(approval.dispatchedCount, 5);
  });

  // 5. Autonomous AI Sales Agent Inquiries & Objections
  await testAsync('AI Sales Agent strictly declines SEO inquiries', async () => {
    const res = await salesAgent.handleSalesConversation('Do you provide SEO services for our website?');
    assert.strictEqual(res.intent, 'INQUIRY_SEO_DECLINED');
    assert(res.reply.includes('do not offer SEO'));
  });

  await testAsync('AI Sales Agent shares verified Google Drive portfolio', async () => {
    const res = await salesAgent.handleSalesConversation('Can I see your past creative work and portfolio?');
    assert.strictEqual(res.intent, 'PORTFOLIO_SHARED');
    assert(res.reply.includes('drive.google.com/drive/folders/1IBXhPfcEE4f9UksKn1_1REIqyGCT4wqK'));
  });

  await testAsync('AI Sales Agent quotes approved INR prices', async () => {
    const res = await salesAgent.handleSalesConversation('How much do you charge for Meta ads and video reels?');
    assert.strictEqual(res.intent, 'PRICING_EXPLAINED');
    assert(res.reply.includes('₹15,000–₹18,000/month'));
    assert(res.reply.includes('₹35,000–₹40,000/month'));
  });

  await testAsync('AI Sales Agent escalates discount requests to Mayank Aggarwal', async () => {
    const res = await salesAgent.handleSalesConversation('Can we get a 50% discount on the retainer?');
    assert.strictEqual(res.intent, 'DISCOUNT_ESCALATED');
    assert.strictEqual(res.escalateToFounder, true);
    assert.strictEqual(res.founderContact, '+91 9217756033');
  });

  // 6. Meta WhatsApp Compliance & Coexistence Tests
  test('WhatsApp Manager enforces Meta opt-in policies and blocks unsolicited cold broadcasts', () => {
    const check = whatsappManager.checkCompliance('+919876543210', false);
    assert.strictEqual(check.allowed, false);
    assert(check.reason.includes('strictly prohibited'));
  });

  test('WhatsApp Manager handles user STOP / opt-out requests instantly', async () => {
    const fakeWebhook = {
      entry: [{
        changes: [{
          value: {
            messages: [{
              from: '919876543210',
              text: { body: 'STOP' }
            }]
          }
        }]
      }]
    };
    const res = await whatsappManager.processIncomingWebhook(fakeWebhook);
    assert.strictEqual(res.status, 'OPTED_OUT');
    assert(whatsappManager.optedOutNumbers.has('919876543210'));
  });

  // 7. Follow-Up Cadence (Day 0, 3, 7, 14)
  test('Follow-Up Cadence enrolls lead and auto-pauses when prospect replies', () => {
    const seq = followupCadence.enrollLead({ id: 'test_lead_1', businessName: 'Delhi Boutique', email: 'owner@delhiboutique.com' });
    assert.strictEqual(seq.steps.length, 4);
    assert.strictEqual(seq.steps[0].day, 0);
    assert.strictEqual(seq.steps[1].day, 3);
    assert.strictEqual(seq.steps[2].day, 7);
    assert.strictEqual(seq.steps[3].day, 14);

    // Simulate reply
    const replyRes = followupCadence.handleProspectReply('test_lead_1', 'Yes, I would be interested in learning more.');
    assert.strictEqual(replyRes.paused, true);
    assert.strictEqual(seq.status, 'PAUSED_REPLIED');
  });

  // 8. Formal Proposal & SOW Generation
  test('Proposal Generator creates branded SOW with Mayank Aggarwal credentials', () => {
    const prop = salesAgent.generateProposal({
      clientName: 'DLF Luxury Partner',
      clientEmail: 'dlf@example.com',
      servicePackage: 'performance'
    });
    assert(prop.proposalId.startsWith('KW-PROP-'));
    assert.strictEqual(prop.partner.lead, 'Mayank Aggarwal');
    assert.strictEqual(prop.partner.contact, '+91 9217756033');
    assert(prop.pricing.amount.includes('₹25,000'));
    assert(prop.deliverables.length >= 4);
  });

  console.log(`\nResults: ${passed}/${total} test suites passed.`);
  if (passed === total) {
    console.log('🎉 ALL KLIKWISE OS v2.0 ACCEPTANCE CRITERIA VERIFIED & PASSING!\n');
  } else {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
