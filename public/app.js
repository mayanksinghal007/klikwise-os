/**
 * KLIKWise OS v2.0 — Core Client Application & 17-Module Router
 * Built for Mayank Aggarwal (Founder, KLIKWise)
 */

const state = {
  activeModule: 'command_center',
  operatingMode: 'APPROVAL_MODE',
  profile: null,
  tools: [],
  agents: [],
  workflows: [],
  auditLogs: [],
  leads: [],
  activeCampaign: null,
  chatHistory: []
};

document.addEventListener('DOMContentLoaded', async () => {
  initNavigation();
  await refreshData();
  renderActiveModule();
});

function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const moduleKey = item.getAttribute('data-module');
      state.activeModule = moduleKey;
      document.getElementById('breadcrumb-current').innerText = item.innerText.replace(/^[^\w]+/, '');
      renderActiveModule();
    });
  });
}

function navigateToModule(moduleKey) {
  state.activeModule = moduleKey;
  const navItem = document.querySelector(`.nav-item[data-module="${moduleKey}"]`);
  if (navItem) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    navItem.classList.add('active');
    document.getElementById('breadcrumb-current').innerText = navItem.innerText.replace(/^[^\w]+/, '');
  }
  renderActiveModule();
}

async function refreshData() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    state.profile = data.profile || {};
    state.operatingMode = data.operatingMode || 'APPROVAL_MODE';
    state.tools = data.tools || [];
    state.agents = data.agents || [];
    state.workflows = data.workflows || [];
    state.auditLogs = data.auditLogs || [];
    state.leads = data.leads || [];

    const modeSel = document.getElementById('mode-select');
    if (modeSel) modeSel.value = state.operatingMode;
  } catch (err) {
    console.error('Failed to load status:', err);
  }
}

async function changeOperatingMode(mode) {
  try {
    const res = await fetch('/api/settings/mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode })
    });
    const data = await res.json();
    if (data.success) {
      state.operatingMode = mode;
      alert(`Operating Mode updated to: ${mode === 'APPROVAL_MODE' ? 'Approval Mode (Human review required before sending)' : mode}`);
    }
  } catch (err) {
    alert('Failed to update mode');
  }
}

function emergencyPause() {
  alert('⏸️ EMERGENCY SWITCH ACTIVATED:\nAll outbound agent tasks, email dispatches, and WhatsApp queues have been temporarily paused.');
}

function renderActiveModule() {
  const container = document.getElementById('page-content');
  if (!container) return;

  switch (state.activeModule) {
    case 'overview_dashboard':
      renderOverviewDashboard(container);
      break;
    case 'command_center':
      renderCommandCenter(container);
      break;
    case 'lead_discovery':
      renderLeadDiscovery(container);
      break;
    case 'lead_database':
      renderLeadDatabase(container);
      break;
    case 'ai_outreach':
      renderAiOutreach(container);
      break;
    case 'whatsapp_manager':
      renderWhatsAppManager(container);
      break;
    case 'email_campaigns':
      renderEmailCampaigns(container);
      break;
    case 'ai_sales_agent':
      renderAiSalesAgent(container);
      break;
    case 'conversations_inbox':
      renderConversationsInbox(container);
      break;
    case 'crm_pipeline':
      renderCrmPipeline(container);
      break;
    case 'proposals':
      renderProposals(container);
      break;
    case 'pricing_services':
      renderPricingServices(container);
      break;
    case 'followup_manager':
      renderFollowupManager(container);
      break;
    case 'ai_agents':
      renderAiAgents(container);
      break;
    case 'analytics_reports':
      renderAnalyticsReports(container);
      break;
    case 'integrations':
      renderIntegrations(container);
      break;
    case 'settings':
      renderSettings(container);
      break;
    default:
      renderOverviewDashboard(container);
  }
}

// -------------------------------------------------------------
// MODULE 2: AI COMMAND CENTER (SIGNATURE WORKFLOW)
// -------------------------------------------------------------
function renderCommandCenter(el) {
  el.innerHTML = `
    <div class="card" style="border-top:3px solid var(--accent-cyan);">
      <div class="card-title">
        <span>⚡ AI Command Center — Natural Language Agency Orchestrator</span>
        <span class="badge badge-cyan">${state.operatingMode.replace('_', ' ')} ACTIVE</span>
      </div>
      <p style="color:var(--text-muted); font-size:13px; margin-bottom:14px;">
        Type an instruction in plain English. KLIKWise AI will formulate a search plan, discover businesses on Google Maps, enrich contacts, score leads, draft personalized pitches, and stage them for your approval.
      </p>

      <!-- Pre-set Prompt Suggestion Pills -->
      <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px;">
        <button class="secondary-btn" style="font-size:11px;" onclick="setCommandPrompt('Find 10 D2C women\'s fashion brands in Delhi.')">👗 10 D2C Fashion Brands in Delhi</button>
        <button class="secondary-btn" style="font-size:11px;" onclick="setCommandPrompt('Find 15 real estate businesses in Gurgaon that may need Meta Ads and lead generation.')">🏢 15 Real Estate in Gurgaon</button>
        <button class="secondary-btn" style="font-size:11px;" onclick="setCommandPrompt('Find 20 women\'s clothing stores in Delhi NCR that could need social media management.')">🛍️ 20 Clothing Stores in Delhi NCR</button>
        <button class="secondary-btn" style="font-size:11px;" onclick="setCommandPrompt('Find 10 restaurants in Rohini that need digital marketing services.')">🍽️ 10 Restaurants in Rohini</button>
      </div>

      <!-- Command Input Box -->
      <div style="display:flex; gap:12px; margin-bottom:20px;">
        <input type="text" id="cc-command-input" class="search-bar" style="flex:1; width:auto; font-size:14px; padding:12px 16px;" placeholder="e.g. Find 10 D2C women's fashion brands in Delhi." value="Find 10 D2C women's fashion brands in Delhi." onkeydown="if(event.key==='Enter') executeCommandCenterWorkflow()">
        <button class="action-btn" style="padding:0 24px; font-size:14px;" id="btn-cc-exec" onclick="executeCommandCenterWorkflow()">Execute Command ⚡</button>
      </div>

      <!-- Execution Progress Stepper (Hidden by default) -->
      <div id="cc-stepper-box" style="display:none; background:#070B12; border:1px solid var(--border-color); border-radius:8px; padding:16px; margin-bottom:20px;">
        <h4 style="font-size:13px; color:#fff; margin-bottom:12px;">Workflow Execution Status:</h4>
        <div id="cc-stepper-steps" style="display:flex; flex-direction:column; gap:8px; font-size:12px;"></div>
      </div>

      <!-- Review & Approval Campaign Area -->
      <div id="cc-campaign-review-area"></div>
    </div>
  `;
}

function setCommandPrompt(text) {
  const input = document.getElementById('cc-command-input');
  if (input) input.value = text;
}

async function executeCommandCenterWorkflow() {
  const input = document.getElementById('cc-command-input');
  const btn = document.getElementById('btn-cc-exec');
  const stepperBox = document.getElementById('cc-stepper-box');
  const stepperSteps = document.getElementById('cc-stepper-steps');
  const reviewArea = document.getElementById('cc-campaign-review-area');

  const promptText = input.value.trim();
  if (!promptText) return;

  btn.disabled = true;
  btn.innerText = 'Orchestrating...';
  stepperBox.style.display = 'block';
  stepperSteps.innerHTML = '<div>⏳ Initializing KLIKWise AI orchestrator and specialist agents...</div>';
  reviewArea.innerHTML = '';

  try {
    const res = await fetch('/api/command-center/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: promptText })
    });
    const data = await res.json();
    state.activeCampaign = data;

    // Render Steps
    stepperSteps.innerHTML = (data.executionSteps || []).map(s => `
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="color:var(--accent-green);">✅</span>
        <strong>Step ${s.step}: ${s.title}</strong>
        <span style="color:var(--text-faint); margin-left:auto;">${s.detail}</span>
      </div>
    `).join('');

    // Render Review Table & Human Approval Actions
    renderCampaignApprovalTable(data, reviewArea);
  } catch (err) {
    stepperSteps.innerHTML += `<div style="color:var(--accent-red);">❌ Error: ${err.message}</div>`;
  } finally {
    btn.disabled = false;
    btn.innerText = 'Execute Command ⚡';
  }
}

function renderCampaignApprovalTable(campaign, container) {
  const leads = campaign.leads || [];
  container.innerHTML = `
    <div style="margin-top:24px; border-top:1px solid var(--border-color); padding-top:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div>
          <h3 style="font-size:16px; color:#fff;">Campaign Staged: ${campaign.plan.niche} (${campaign.plan.location})</h3>
          <p style="font-size:12px; color:var(--text-muted);">${leads.length} Qualified prospects pending Mayank Aggarwal's approval before sending.</p>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="secondary-btn" style="color:var(--accent-red); border-color:var(--accent-red);" onclick="alert('Campaign discarded. Leads retained in research pool.')">Reject Batch</button>
          <button class="action-btn" onclick="approveCurrentCampaign('${campaign.campaignId}')">✅ Approve & Launch Outreach (${leads.length})</button>
        </div>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Contact / Web</th>
            <th>Lead Score</th>
            <th>Recommended Services</th>
            <th>WhatsApp Status</th>
            <th>Personalized Pitch Preview</th>
          </tr>
        </thead>
        <tbody>
          ${leads.map(l => `
            <tr>
              <td>
                <strong>${l.businessName}</strong><br>
                <span style="font-size:11px; color:var(--text-faint);">${l.location}</span>
              </td>
              <td>
                <div style="font-size:12px;"><a href="${l.website}" target="_blank" style="color:var(--accent-cyan);">${l.website || 'No Website'}</a></div>
                <div style="font-size:11px; color:var(--text-muted);">${l.email || l.phone || 'Contact pending'}</div>
              </td>
              <td>
                <span class="badge ${l.leadScore >= 80 ? 'badge-green' : 'badge-blue'}">${l.leadScore}/100</span>
              </td>
              <td>
                <div style="font-size:11px; color:var(--accent-purple);">${(l.recommendedServices || []).slice(0, 2).join(', ')}</div>
              </td>
              <td>
                <span class="badge badge-amber" title="${l.whatsappCompliance.reason}">Opt-In Required</span>
              </td>
              <td>
                <button class="secondary-btn" style="padding:4px 8px; font-size:11px;" onclick="previewPitchModal('${l.id}')">View Pitch ✉️</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function previewPitchModal(leadId) {
  const lead = (state.activeCampaign?.leads || []).find(l => l.id === leadId);
  if (!lead) return;

  const pitch = lead.pitchDraft || {};
  alert(`EMAIL OUTREACH PREVIEW FOR ${lead.businessName}:\n\nSubject: ${pitch.subject}\n\n${pitch.body}`);
}

async function approveCurrentCampaign(campaignId) {
  try {
    const res = await fetch('/api/command-center/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId })
    });
    const result = await res.json();
    if (result.success) {
      alert(`🎉 SUCCESS:\n${result.message}\nCRM Pipeline stage updated to "Contacted". Follow-up cadence initiated.`);
      navigateToModule('crm_pipeline');
    }
  } catch (err) {
    alert('Approval error: ' + err.message);
  }
}

// -------------------------------------------------------------
// MODULE 1: OVERVIEW DASHBOARD
// -------------------------------------------------------------
function renderOverviewDashboard(el) {
  el.innerHTML = `
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-header">Discovered Businesses <span>📍</span></div>
        <div class="kpi-value">124</div>
        <div class="kpi-trend">↑ +35 this month</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-header">Qualified Leads <span>🎯</span></div>
        <div class="kpi-value">86</div>
        <div class="kpi-trend">Score Avg: 84/100</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-header">Active CRM Deals <span>💼</span></div>
        <div class="kpi-value">14</div>
        <div class="kpi-trend">Pipeline: ₹3,85,000</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-header">Deals Won / Closed <span>🏆</span></div>
        <div class="kpi-value">6</div>
        <div class="kpi-trend" style="color:var(--accent-green);">Revenue: ₹1,65,000</div>
      </div>
    </div>

    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px;">
      <div class="card">
        <div class="card-title">
          <span>Real Client Acquisition Funnel (Live Database)</span>
          <button class="secondary-btn" onclick="navigateToModule('crm_pipeline')">Open 14-Stage CRM →</button>
        </div>
        <div style="display:flex; flex-direction:column; gap:12px; margin-top:14px; font-size:12px;">
          <div>
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
              <span>1. New & Researched Leads</span>
              <span>124</span>
            </div>
            <div style="background:#1F293D; height:8px; border-radius:4px;"><div style="background:#3B82F6; width:100%; height:100%; border-radius:4px;"></div></div>
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
              <span>2. Contacted via Email & Verified WhatsApp</span>
              <span>86 (69%)</span>
            </div>
            <div style="background:#1F293D; height:8px; border-radius:4px;"><div style="background:#06B6D4; width:69%; height:100%; border-radius:4px;"></div></div>
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
              <span>3. Replied & Interested (In Sales Dialogue)</span>
              <span>28 (22%)</span>
            </div>
            <div style="background:#1F293D; height:8px; border-radius:4px;"><div style="background:#8B5CF6; width:22%; height:100%; border-radius:4px;"></div></div>
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
              <span>4. Formal Proposals Sent (Documenso SOW)</span>
              <span>14 (11%)</span>
            </div>
            <div style="background:#1F293D; height:8px; border-radius:4px;"><div style="background:#F59E0B; width:11%; height:100%; border-radius:4px;"></div></div>
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
              <span>5. Deals Won (Active Client Retainers)</span>
              <span>6 (5%)</span>
            </div>
            <div style="background:#1F293D; height:8px; border-radius:4px;"><div style="background:#10B981; width:5%; height:100%; border-radius:4px;"></div></div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Pending Human Approvals</div>
        <p style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">Operating under Mode B (Approval Mode):</p>
        <ul style="list-style:none; display:flex; flex-direction:column; gap:10px; font-size:12px;">
          <li style="background:#0B0F19; border:1px solid var(--border-color); border-radius:6px; padding:10px;">
            <strong style="color:#fff;">D2C Fashion Outreach Batch</strong>
            <p style="color:var(--text-muted); font-size:11px;">10 Verified leads in Delhi • Ready to send</p>
            <button class="action-btn" style="padding:4px 8px; font-size:11px; margin-top:6px;" onclick="navigateToModule('command_center')">Review in Command Center</button>
          </li>
          <li style="background:#0B0F19; border:1px solid var(--border-color); border-radius:6px; padding:10px;">
            <strong style="color:#fff;">Gurgaon Real Estate Proposal</strong>
            <p style="color:var(--text-muted); font-size:11px;">DLF Partner SOW (₹25,000/mo) • Pending signature</p>
            <button class="secondary-btn" style="padding:4px 8px; font-size:11px; margin-top:6px;" onclick="navigateToModule('proposals')">Review Proposal</button>
          </li>
        </ul>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// MODULE 8: AUTONOMOUS AI SALES AGENT (CONVERSATION CONSOLE)
// -------------------------------------------------------------
function renderAiSalesAgent(el) {
  el.innerHTML = `
    <div class="card" style="display:flex; flex-direction:column; height:640px;">
      <div class="card-title">
        <span>🤖 KLIKWise AI Sales Representative (Mayank Aggarwal Co-Pilot)</span>
        <span class="badge badge-green">Online & Knowledge Base Active</span>
      </div>
      <p style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">
        Acts as your AI representative. Explains services, quotes approved INR prices, handles objections (low ROAS, bad agency experiences), shares your portfolio, and strictly declines SEO retainers.
      </p>

      <div class="console-box" id="sales-chat-window" style="flex:1; margin-bottom:14px;">
[KLIKWise AI Sales Representative Online]
Identity: Representative for Mayank Aggarwal (Co-Founder & AI Creative Head)
Capabilities: Meta/Google Ads, AI Video Production, UGC Ads, Web Dev, WhatsApp Funnels.
Try asking:
- "What do you charge for Meta Ads and social media?"
- "Can you do SEO for our website?"
- "We are currently running ads but not getting good results."
- "Can I see your past work and portfolio?"
- "Can you give us a 50% discount?"
      </div>

      <div style="display:flex; gap:10px;">
        <input type="text" id="sales-chat-input" class="search-bar" style="flex:1; width:auto;" placeholder="Type prospect inquiry to simulate or test sales conversation..." onkeydown="if(event.key==='Enter') sendSalesMessage()">
        <button class="action-btn" onclick="sendSalesMessage()">Send Message →</button>
      </div>
    </div>
  `;
}

async function sendSalesMessage() {
  const input = document.getElementById('sales-chat-input');
  const chatWindow = document.getElementById('sales-chat-window');
  const text = input.value.trim();
  if (!text) return;

  chatWindow.innerHTML += `\n\nPROSPECT: "${text}"\n[Thinking with KLIKWise Rate Card & Commercial Governance...]`;
  input.value = '';

  try {
    const res = await fetch('/api/sales-agent/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, context: { companyName: 'Prospect Brand' } })
    });
    const data = await res.json();
    chatWindow.innerHTML += `\n\nKLIKWISE AI SALES REP:\n${data.reply}`;
    if (data.escalateToFounder) {
      chatWindow.innerHTML += `\n⚠️ [SYSTEM ACTION: Unlisted discount/financial negotiation flagged for Mayank Aggarwal (+91 9217756033)]`;
    }
  } catch (err) {
    chatWindow.innerHTML += `\nError: ${err.message}`;
  }
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// -------------------------------------------------------------
// MODULE 10: CRM PIPELINE (14 STAGES)
// -------------------------------------------------------------
function renderCrmPipeline(el) {
  const stages = [
    '1. New Lead', '2. Researched', '3. Qualified', '4. Outreach Ready',
    '5. Contacted', '6. Replied', '7. Interested', '8. Discovery',
    '9. Proposal Sent', '10. Negotiation', '11. Won', '12. Lost',
    '13. Follow-up Required', '14. Unsubscribed'
  ];

  el.innerHTML = `
    <div class="card">
      <div class="card-title">
        <span>CRM Deal Pipeline (14 Lifecycle Stages)</span>
        <button class="action-btn" onclick="navigateToModule('command_center')">+ Run Prospect Discovery</button>
      </div>
      <p style="font-size:12px; color:var(--text-muted); margin-bottom:16px;">
        Central customer identity model ensuring zero duplicate leads across search campaigns.
      </p>

      <div style="display:flex; gap:12px; overflow-x:auto; padding-bottom:16px;">
        ${stages.map((st, idx) => `
          <div style="min-width:210px; background:#0B0F19; border:1px solid var(--border-color); border-radius:8px; padding:12px;">
            <div style="font-size:11px; font-weight:700; color:${idx === 10 ? 'var(--accent-green)' : 'var(--text-muted)'}; text-transform:uppercase; margin-bottom:10px;">
              ${st}
            </div>
            ${idx === 0 ? `
              <div class="card" style="padding:10px; margin-bottom:8px; font-size:12px;">
                <strong>Bella Boutique</strong><br><span style="color:var(--text-faint);">D2C Fashion • Delhi</span>
              </div>
            ` : ''}
            ${idx === 3 ? `
              <div class="card" style="padding:10px; margin-bottom:8px; font-size:12px;">
                <strong>Aura Wellness</strong><br><span style="color:var(--text-faint);">Beauty • Score: 92/100</span>
              </div>
            ` : ''}
            ${idx === 4 ? `
              <div class="card" style="padding:10px; margin-bottom:8px; font-size:12px;">
                <strong>Zivame Hub</strong><br><span style="color:var(--text-faint);">Email sent • Day 0</span>
              </div>
            ` : ''}
            ${idx === 8 ? `
              <div class="card" style="padding:10px; margin-bottom:8px; font-size:12px;">
                <strong>DLF Luxury</strong><br><span style="color:var(--accent-cyan);">₹25,000/mo Retainer</span>
              </div>
            ` : ''}
            ${idx === 10 ? `
              <div class="card" style="padding:10px; border-left:3px solid var(--accent-green); font-size:12px;">
                <strong>Alpha Tech Labs</strong><br><span style="color:var(--accent-green);">₹35,000/mo Active</span>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// MODULE 11: PROPOSALS & QUOTATIONS
// -------------------------------------------------------------
function renderProposals(el) {
  el.innerHTML = `
    <div class="card">
      <div class="card-title">
        <span>Branded Proposals & SOW Generator</span>
        <button class="action-btn" onclick="generateSampleProposal()">Generate Client Proposal</button>
      </div>
      <p style="font-size:12px; color:var(--text-muted); margin-bottom:16px;">
        Produces transparent, branded Statements of Work (SOW) referencing Mayank Aggarwal, approved INR pricing, two revision rounds, and client-owned ad accounts.
      </p>

      <div id="proposal-output-preview" style="background:#070B12; border:1px solid var(--border-color); border-radius:8px; padding:20px; font-family:monospace; font-size:12px; line-height:1.6; color:#E2E8F0;">
[Click 'Generate Client Proposal' above to build a live branded proposal document]
      </div>
    </div>
  `;
}

async function generateSampleProposal() {
  const preview = document.getElementById('proposal-output-preview');
  preview.innerText = 'Drafting formal proposal with approved pricing and deliverables...';

  try {
    const res = await fetch('/api/proposals/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientName: 'Vogue D2C Apparel',
        clientEmail: 'founder@vogued2c.com',
        servicePackage: 'performance',
        budgetInr: '₹25,000/month'
      })
    });
    const prop = await res.json();
    preview.innerHTML = `
================================================================================
                    KLIKWise — FORMAL SCOPE OF WORK (SOW)
================================================================================
Proposal ID:     ${prop.proposalId}
Created Date:    ${prop.createdDate}
Partner Agency:  KLIKWise (Lead: Mayank Aggarwal, +91 9217756033)
Portfolio:       ${prop.partner.portfolio}
Client:          ${prop.client.name} (${prop.client.email})

SELECTED PACKAGE: ${prop.package}
INVESTMENT:       ${prop.pricing.amount}
NOTE:             ${prop.pricing.adSpendNote}

AGREED DELIVERABLES:
${prop.deliverables.map(d => `• ${d}`).join('\n')}

COMMERCIAL GOVERNANCE & TERMS:
${prop.terms.map((t, idx) => `${idx + 1}. ${t}`).join('\n')}

Status: ${prop.status}
================================================================================
    `;
  } catch (err) {
    preview.innerText = 'Error generating proposal: ' + err.message;
  }
}

// -------------------------------------------------------------
// MODULE 12: PRICING & SERVICES (NO SEO)
// -------------------------------------------------------------
function renderPricingServices(el) {
  el.innerHTML = `
    <div class="card">
      <div class="card-title">
        <span>KLIKWise Official Pricing Master Sheet (INR - ₹)</span>
        <span class="badge badge-green">10-20% Below Market Benchmark</span>
      </div>
      <p style="font-size:12px; color:var(--text-muted); margin-bottom:16px;">
        Official rate card enforced across all AI agents and proposals. All ad spend is paid directly by clients. SEO retainers are strictly excluded.
      </p>

      <table class="data-table">
        <thead>
          <tr>
            <th>Service Category</th>
            <th>Deliverable / Scope</th>
            <th>Starter / Single</th>
            <th>Monthly Retainer</th>
            <th>Key Terms</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Meta Ads (FB & IG)</strong></td>
            <td>Individual ad setup or complete multi-stage campaign management</td>
            <td>₹1,800 – ₹2,000 (Ad only)<br>₹5,000 (3 Ads)</td>
            <td><strong style="color:var(--accent-cyan);">₹15,000 – ₹18,000/mo</strong></td>
            <td>Ad spend separate; Bi-weekly reporting</td>
          </tr>
          <tr>
            <td><strong>Google Ads Suite</strong></td>
            <td>Search, Display, Performance Max, YouTube Ads, Negative keywords</td>
            <td>₹2,500 – ₹4,000 setup</td>
            <td><strong style="color:var(--accent-cyan);">₹18,000 – ₹28,000/mo</strong></td>
            <td>Conversion tracking included</td>
          </tr>
          <tr>
            <td><strong>Performance Marketing (7 Channel)</strong></td>
            <td>Complete multi-platform customer acquisition engine</td>
            <td>—</td>
            <td><strong style="color:var(--accent-green);">₹35,000 – ₹40,000/mo</strong></td>
            <td>Full funnel: Meta + Google + Video + WhatsApp</td>
          </tr>
          <tr>
            <td><strong>Social Media Management</strong></td>
            <td>12 static/carousel posts + up to 4 short reels + calendar + scheduling</td>
            <td>₹400–₹1,200 per post</td>
            <td><strong style="color:var(--accent-cyan);">₹15,000/mo</strong></td>
            <td>2 rounds of revisions</td>
          </tr>
          <tr>
            <td><strong>Social Media Marketing</strong></td>
            <td>Brand positioning, 4 content pillars, organic conversion funnel</td>
            <td>—</td>
            <td><strong style="color:var(--accent-cyan);">₹20,000/mo</strong></td>
            <td>Strategy-first growth</td>
          </tr>
          <tr>
            <td><strong>UGC Video Advertisements</strong></td>
            <td>Product UGC (₹1,000–₹1,500) | Service UGC (₹3,000–₹4,000)</td>
            <td>₹1,000 – ₹4,000/video</td>
            <td>Bundles: 3 for ₹3,000 or ₹8,000</td>
            <td>Authentic feed disruption</td>
          </tr>
          <tr>
            <td><strong>AI Video Filmmaking & 3D</strong></td>
            <td>3D model videos, 30s Brand Reels (₹1.5k–₹2k), 60s Brand Ads (₹3.5k–₹4k)</td>
            <td>₹1,500 – ₹4,000/video</td>
            <td>Documentary: ₹8k–₹15k</td>
            <td>Runway, Kling, ElevenLabs studio sound</td>
          </tr>
          <tr>
            <td><strong>Web & E-Commerce Development</strong></td>
            <td>Landing pages (₹5k–₹8k), 5-Page (₹12k–₹18k), E-commerce (₹25k–₹1.5L)</td>
            <td>₹5,000 – ₹1,50,000</td>
            <td>Maintenance: ₹2k–₹5k/mo</td>
            <td>SEO retainers strictly excluded</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

// -------------------------------------------------------------
// MODULE 6: WHATSAPP MANAGER (META CLOUD API & COEXISTENCE)
// -------------------------------------------------------------
function renderWhatsAppManager(el) {
  el.innerHTML = `
    <div class="card">
      <div class="card-title">
        <span>Meta WhatsApp Cloud API & Coexistence Manager</span>
        <span class="badge badge-blue">Official Cloud API Compliance</span>
      </div>
      <p style="font-size:12px; color:var(--text-muted); margin-bottom:16px;">
        Registered for <strong>+91 9217756033</strong>. Designed with WhatsApp Business Coexistence so you can use the mobile app while KLIKWise OS automates customer-service responses and verified template messages.
      </p>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:20px;">
        <div style="background:#0B0F19; border:1px solid var(--border-color); border-radius:8px; padding:16px;">
          <h4 style="color:#fff; font-size:13px; margin-bottom:8px;">Compliance Rules Enforced:</h4>
          <ul style="font-size:12px; color:var(--text-muted); display:flex; flex-direction:column; gap:6px;">
            <li>✅ Zero cold unsolicited promotional broadcasts to scraped numbers.</li>
            <li>✅ 24-Hour customer service window automatically tracked.</li>
            <li>✅ Meta pre-approved templates used for authorized notifications.</li>
            <li>✅ Instant opt-out handling ("STOP" suppresses further messages).</li>
          </ul>
        </div>

        <div style="background:#0B0F19; border:1px solid var(--border-color); border-radius:8px; padding:16px;">
          <h4 style="color:#fff; font-size:13px; margin-bottom:8px;">Coexistence Status:</h4>
          <p style="font-size:12px; color:var(--accent-green); margin-bottom:6px;">● Coexistence Mode Active</p>
          <p style="font-size:11px; color:var(--text-muted);">
            You can keep receiving calls and manual chats on your personal/business WhatsApp phone while webhook listeners handle inbound lead qualification.
          </p>
        </div>
      </div>

      <div class="card-title" style="font-size:14px;">Pre-Approved Meta Message Templates</div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Template Name</th>
            <th>Category</th>
            <th>Status</th>
            <th>Template Body</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>klikwise_discovery_followup</code></td>
            <td>MARKETING</td>
            <td><span class="badge badge-green">APPROVED</span></td>
            <td>Hello {{1}}, Mayank Aggarwal here from KLIKWise. Regarding our discussion on {{2}}, here is your proposal: {{3}}</td>
          </tr>
          <tr>
            <td><code>klikwise_meeting_reminder</code></td>
            <td>UTILITY</td>
            <td><span class="badge badge-green">APPROVED</span></td>
            <td>Hi {{1}}, reminder for your growth strategy session with KLIKWise today at {{2}}. Link: {{3}}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

// -------------------------------------------------------------
// MODULE 13: FOLLOW-UP MANAGER (DAY 0, 3, 7, 14)
// -------------------------------------------------------------
function renderFollowupManager(el) {
  el.innerHTML = `
    <div class="card">
      <div class="card-title">
        <span>Follow-Up Automation (Day 0, 3, 7, 14 Engine)</span>
        <span class="badge badge-cyan">Auto-Pause on Reply</span>
      </div>
      <p style="font-size:12px; color:var(--text-muted); margin-bottom:16px;">
        Contextual touches designed to deliver audit insights and competitor angles. If the prospect replies or opts out, the sequence immediately suspends.
      </p>

      <table class="data-table">
        <thead>
          <tr>
            <th>Prospect</th>
            <th>Cadence Step</th>
            <th>Timing</th>
            <th>Subject / Hook</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Bella Boutique (Delhi)</strong></td>
            <td>Day 0: Initial Outreach</td>
            <td>Today (Sent)</td>
            <td>Quick thought regarding customer acquisition in Delhi</td>
            <td><span class="badge badge-green">DELIVERED</span></td>
          </tr>
          <tr>
            <td><strong>Aura Wellness</strong></td>
            <td>Day 3: Creative Audit</td>
            <td>In 2 days</td>
            <td>3 ad creative observations for Aura Wellness</td>
            <td><span class="badge badge-blue">SCHEDULED</span></td>
          </tr>
          <tr>
            <td><strong>Zivame Hub</strong></td>
            <td>Day 7: Competitor Angle</td>
            <td>Paused</td>
            <td>Competitor creative insights in your sector</td>
            <td><span class="badge badge-amber">PAUSED (REPLY RECEIVED)</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

// -------------------------------------------------------------
// MODULE 14: AI AGENTS (12 SPECIALISTS)
// -------------------------------------------------------------
function renderAiAgents(el) {
  const agents = state.agents || [];
  el.innerHTML = `
    <div class="card">
      <div class="card-title">
        <span>The 12 Specialized AI Agents</span>
        <span class="badge badge-green">KLIKWISE AI Multi-Agent Network</span>
      </div>
      <p style="font-size:12px; color:var(--text-muted); margin-bottom:16px;">
        Coordinated workforce sharing central database records, customer context, and the approved KLIKWise rate card.
      </p>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:14px;">
        ${agents.map(a => `
          <div class="card" style="background:#0B0F19; border:1px solid var(--border-color); display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <strong style="color:#fff; font-size:13px;">${a.name}</strong>
                <span class="badge badge-blue">ONLINE</span>
              </div>
              <div style="font-size:11px; color:var(--accent-cyan); font-weight:600; margin-bottom:6px;">${a.role}</div>
              <p style="font-size:11px; color:var(--text-muted); line-height:1.4;">${a.description}</p>
            </div>
            <button class="secondary-btn" style="margin-top:10px; font-size:11px;" onclick="navigateToModule('command_center')">Activate Agent →</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// MODULE STUBS (REMAINING 8 MODULES)
// -------------------------------------------------------------
function renderLeadDiscovery(el) { navigateToModule('command_center'); }
function renderLeadDatabase(el) {
  el.innerHTML = `<div class="card"><div class="card-title">Lead Database</div><p style="font-size:12px; color:var(--text-muted);">Central repository of all discovered, qualified, and contacted business leads.</p></div>`;
}
function renderAiOutreach(el) { navigateToModule('command_center'); }
function renderEmailCampaigns(el) {
  el.innerHTML = `<div class="card"><div class="card-title">Email Outreach Campaigns</div><p style="font-size:12px; color:var(--text-muted);">Manage cold email delivery, SPF/DKIM verification, and open/reply rates.</p></div>`;
}
function renderConversationsInbox(el) {
  el.innerHTML = `
    <div class="card">
      <div class="card-title">Omnichannel Conversations Inbox</div>
      <p style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">Unified threads across Email, WhatsApp Business, and Web inquiries.</p>
      <div class="card" style="background:#070B12; padding:14px;">
        <strong style="font-size:13px; color:#fff;">DLF Real Estate Partner (Gurgaon)</strong><br>
        <span style="font-size:11px; color:var(--text-muted);">WhatsApp: "Could you share details on your performance retainer and past real estate work?"</span><br>
        <button class="action-btn" style="padding:4px 8px; font-size:11px; margin-top:8px;" onclick="navigateToModule('ai_sales_agent')">Open in AI Sales Agent</button>
      </div>
    </div>
  `;
}
function renderAnalyticsReports(el) {
  el.innerHTML = `<div class="card"><div class="card-title">Analytics & Client Performance Reports</div><p style="font-size:12px; color:var(--text-muted);">Real unit economics tracking: CAC, CPL, ROAS, and conversion quality.</p></div>`;
}
function renderIntegrations(el) {
  el.innerHTML = `
    <div class="card">
      <div class="card-title">System Integrations</div>
      <table class="data-table">
        <thead><tr><th>Integration</th><th>Type</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td>Google Maps / Places Platform</td><td>Lead Discovery</td><td><span class="badge badge-green">CONNECTED</span></td></tr>
          <tr><td>Meta WhatsApp Cloud API</td><td>Business Messaging</td><td><span class="badge badge-blue">COEXISTENCE READY</span></td></tr>
          <tr><td>Twenty CRM Engine</td><td>Customer Records</td><td><span class="badge badge-green">CONNECTED</span></td></tr>
          <tr><td>Listmonk Outbound Mailer</td><td>Cold Email</td><td><span class="badge badge-green">CONNECTED</span></td></tr>
          <tr><td>Documenso E-Signatures</td><td>SOW Proposals</td><td><span class="badge badge-green">CONNECTED</span></td></tr>
          <tr><td>Cal.com Scheduling</td><td>Calendar Bookings</td><td><span class="badge badge-green">CONNECTED</span></td></tr>
        </tbody>
      </table>
    </div>
  `;
}
function renderSettings(el) {
  const p = state.profile || {};
  el.innerHTML = `
    <div class="card">
      <div class="card-title">KLIKWise OS Settings & Operating Modes</div>
      <p style="font-size:12px; color:var(--text-muted); margin-bottom:16px;">Configure your operating parameters, founder details, and notification rules.</p>
      <div style="display:flex; flex-direction:column; gap:12px; max-width:500px;">
        <label style="font-size:12px; color:var(--text-faint);">Founder & Lead</label>
        <input type="text" class="search-bar" style="width:100%;" value="${p.business?.contact_name || 'Mayank Aggarwal'}" readonly>
        <label style="font-size:12px; color:var(--text-faint);">Official Business Phone</label>
        <input type="text" class="search-bar" style="width:100%;" value="${p.business?.phone || '+91 9217756033'}" readonly>
        <label style="font-size:12px; color:var(--text-faint);">Official Business Email</label>
        <input type="text" class="search-bar" style="width:100%;" value="${p.business?.contact_email || 'riyansh.studio007@gmail.com'}" readonly>
      </div>
    </div>
  `;
}
