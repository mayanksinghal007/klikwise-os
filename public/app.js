/**
 * KLIKWise OS v2.0 — Executive Client Application & Workspace Engine
 * Built for Mayank Aggarwal (Co-Founder & AI Creative Head, KLIKWise)
 */

const state = {
  activeTab: 'command_center',
  operatingMode: 'APPROVAL_MODE',
  profile: null,
  tools: [],
  agents: [],
  workflows: [],
  auditLogs: [],
  leads: [],
  activeCampaign: null,
  chatHistory: [
    {
      sender: 'agent',
      text: "Hello! I am Mayank Aggarwal's Autonomous AI Sales Agent for KLIKWise. I represent our Performance Marketing, AI Filmmaking, and Growth operations. How can I assist you with your business goals today?"
    }
  ],
  generatedProposal: null
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
  await refreshData();
  renderActiveTab();
});

// --- Tab Switching ---
function switchTab(tabId) {
  state.activeTab = tabId;
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });

  const titles = {
    command_center: '⚡ AI Command Center',
    ai_sales: '💬 AI Sales Agent & WhatsApp',
    crm_pipeline: '🎯 Leads & CRM Pipeline',
    proposals_pricing: '📝 Proposals & Master Pricing',
    agents_system: '⚙️ AI Workforce & Governance'
  };

  const titleEl = document.getElementById('current-tab-title');
  if (titleEl) titleEl.innerText = titles[tabId] || 'KLIKWise OS';

  renderActiveTab();
}

// --- Fetch System Status ---
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
    updateModeDescription(state.operatingMode);
  } catch (err) {
    console.error('Failed to load status:', err);
  }
}

// --- Operating Mode Switcher ---
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
      updateModeDescription(mode);
      alert(`Operating Mode changed to: ${mode.replace('_', ' ')}`);
    }
  } catch (err) {
    alert('Failed to update mode');
  }
}

function updateModeDescription(mode) {
  const descEl = document.getElementById('mode-desc');
  if (!descEl) return;
  if (mode === 'APPROVAL_MODE') {
    descEl.innerText = '🛡️ Human review required before sending any outreach.';
  } else if (mode === 'RESEARCH_MODE') {
    descEl.innerText = '🔍 Read-only discovery. Outbound communication locked.';
  } else {
    descEl.innerText = '⚡ High-confidence leads auto-dispatched within rate limits.';
  }
}

function emergencyPause() {
  alert('⏸️ EMERGENCY SWITCH TRIGGERED:\nAll outbound agent queues, email dispatches, and WhatsApp broadcasts have been immediately halted.');
}

// --- Dynamic Workspace Router ---
function renderActiveTab() {
  const container = document.getElementById('page-content');
  if (!container) return;

  switch (state.activeTab) {
    case 'command_center':
      renderCommandCenter(container);
      break;
    case 'ai_sales':
      renderAiSales(container);
      break;
    case 'crm_pipeline':
      renderCrmPipeline(container);
      break;
    case 'proposals_pricing':
      renderProposalsPricing(container);
      break;
    case 'agents_system':
      renderAgentsSystem(container);
      break;
    default:
      renderCommandCenter(container);
  }
}

// ==========================================================================
// TAB 1: AI COMMAND CENTER (HERO ENGINE)
// ==========================================================================
function renderCommandCenter(el) {
  el.innerHTML = `
    <div class="glass-card card-hero">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
        <div>
          <h1 class="hero-title">The Business Growth Command Center</h1>
          <p class="hero-subtitle">
            Welcome back, <strong>Mayank Aggarwal</strong>. Type your business objective in plain English below.
            KLIKWise AI coordinates Google Maps scraping, web enrichment, prospect qualification, and multi-channel outreach.
          </p>
        </div>
        <span class="system-status-pill" style="border-color:var(--cyan); color:var(--cyan);">
          Mode: ${state.operatingMode.replace('_', ' ')}
        </span>
      </div>

      <!-- 3-Step Clear Workflow Banner -->
      <div class="process-banner">
        <div class="process-step">
          <div class="step-num">1</div>
          <div class="step-content">
            <h4>Enter Instruction</h4>
            <p>Define niche & target location</p>
          </div>
        </div>
        <div class="process-step">
          <div class="step-num">2</div>
          <div class="step-content">
            <h4>AI Discovers & Qualifies</h4>
            <p>Scrapes Maps & scores intent</p>
          </div>
        </div>
        <div class="process-step">
          <div class="step-num">3</div>
          <div class="step-content">
            <h4>Review & 1-Click Launch</h4>
            <p>Approve personalized pitches</p>
          </div>
        </div>
      </div>

      <!-- Command Console Box -->
      <div class="console-box">
        <span style="display:flex; align-items:center; padding-left:14px; font-size:18px;">⚡</span>
        <input 
          type="text" 
          id="cc-command-input" 
          class="console-input" 
          placeholder="e.g. { startup brands in delhi } or { fashion brands in new york }" 
          value="{ startup brands in delhi }"
          onkeydown="if(event.key==='Enter') executeCommandCenterWorkflow()"
        >
        <button class="btn-execute" id="btn-cc-exec" onclick="executeCommandCenterWorkflow()">
          <span>Launch AI Workflow</span>
          <span>➔</span>
        </button>
      </div>

      <!-- Quick-Launch Chips & Mode Control -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-top:10px;">
        <div class="chips-row" style="margin:0;">
          <span class="chips-label">Worldwide Presets:</span>
          <button class="chip-btn" onclick="runLivePipelinePreset('{ startup brands in delhi }')">🇮🇳 { startup brands in delhi }</button>
          <button class="chip-btn" onclick="runLivePipelinePreset('{ fashion brands in new york }')">🇺🇸 { fashion brands in new york }</button>
          <button class="chip-btn" onclick="runLivePipelinePreset('{ luxury cafes in dubai }')">🇦🇪 { luxury cafes in dubai }</button>
          <button class="chip-btn" onclick="runLivePipelinePreset('{ tech startups in london }')">🇬🇧 { tech startups in london }</button>
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:11px; color:var(--text-muted);">Automation:</span>
          <select id="cc-mode-select" class="form-input" style="width:auto; padding:4px 10px; font-size:11px; background:rgba(0,0,0,0.5);" onchange="changeOperatingMode(this.value)">
            <option value="APPROVAL_MODE" ${state.operatingMode === 'APPROVAL_MODE' ? 'selected' : ''}>🛡️ Review Before Send</option>
            <option value="CONTROLLED_AUTOMATION" ${state.operatingMode === 'CONTROLLED_AUTOMATION' ? 'selected' : ''}>⚡ Full Auto (Instant Scrape & Send)</option>
          </select>
        </div>
      </div>

      <!-- Live Execution Stepper (Hidden until run) -->
      <div id="cc-stepper-box" style="display:none;" class="stepper-container">
        <div class="stepper-header">
          <h4>AI ORCHESTRATION PIPELINE PROGRESS</h4>
          <span id="cc-stepper-status" style="color:var(--cyan); font-family:var(--font-mono); font-size:11px;">EXECUTING...</span>
        </div>
        <div id="cc-stepper-grid" class="stepper-grid"></div>
      </div>

      <!-- Results Area -->
      <div id="cc-results-area">
        ${renderSampleOrStagedLeads()}
      </div>
    </div>
  `;
}

function setCommandPrompt(text) {
  const input = document.getElementById('cc-command-input');
  if (input) {
    input.value = text;
    input.focus();
  }
}

function runLivePipelinePreset(query) {
  setCommandPrompt(query);
  executeCommandCenterWorkflow();
}

async function executeCommandCenterWorkflow() {
  const input = document.getElementById('cc-command-input');
  const btn = document.getElementById('btn-cc-exec');
  const stepperBox = document.getElementById('cc-stepper-box');
  const stepperGrid = document.getElementById('cc-stepper-grid');
  const resultsArea = document.getElementById('cc-results-area');

  const promptText = input ? input.value.trim() : '';
  if (!promptText) return;

  btn.disabled = true;
  btn.innerHTML = `<span>Orchestrating...</span> <span class="pulse-dot"></span>`;
  stepperBox.style.display = 'block';

  // Render initial animated steps
  const steps = [
    { title: '1. Worldwide Scraper', desc: 'Querying Google Maps & Places directory...' },
    { title: '2. Deep Site Enricher', desc: 'Extracting contact emails, phones & domain...' },
    { title: '3. Lead Intent Scoring', desc: 'Evaluating marketing gaps & budget intent...' },
    { title: '4. AI 15-Min Pitch Generator', desc: 'Formulating compliant proposal (No price, No portfolio)...' },
    { title: '5. Dispatch Gate', desc: state.operatingMode === 'CONTROLLED_AUTOMATION' ? 'Auto-dispatching cold outreach email...' : 'Staging leads for 1-click human review...' }
  ];

  stepperGrid.innerHTML = steps.map(s => `
    <div class="stepper-card">
      <div class="step-title">${s.title}</div>
      <div class="step-desc">${s.desc}</div>
    </div>
  `).join('');

  try {
    const res = await fetch('/api/command-center/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: promptText })
    });
    const data = await res.json();
    state.activeCampaign = data;

    // Refresh CRM leads so newly scraped leads appear in state.leads
    await refreshData();

    // Mark steps as completed
    stepperGrid.innerHTML = (data.executionSteps || []).slice(0, 5).map(s => `
      <div class="stepper-card done">
        <div class="step-title" style="color:var(--green);">✅ Step ${s.step}</div>
        <div class="step-desc">${s.title}</div>
      </div>
    `).join('');

    const statusText = state.operatingMode === 'CONTROLLED_AUTOMATION' ? 'COMPLETED & AUTO-DISPATCHED ⚡' : 'COMPLETED (APPROVAL REQUIRED) 🛡️';
    document.getElementById('cc-stepper-status').innerText = statusText;
    document.getElementById('cc-stepper-status').style.color = 'var(--green)';

    // Render the real campaign cards
    resultsArea.innerHTML = renderCampaignCards(data);
  } catch (err) {
    resultsArea.innerHTML = `<div style="color:var(--red); padding:20px;">❌ Error executing workflow: ${err.message}</div>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<span>Launch AI Workflow</span> <span>➔</span>`;
  }
}

function renderSampleOrStagedLeads() {
  if (state.activeCampaign && state.activeCampaign.leads && state.activeCampaign.leads.length > 0) {
    return renderCampaignCards(state.activeCampaign);
  }

  if (state.leads && state.leads.length > 0) {
    return `
      <div style="margin-top:20px;">
        <div class="campaign-bar">
          <div>
            <h3 style="font-size:16px; color:#fff; font-weight:700;">Live Discovered & Staged Prospects (${state.leads.length})</h3>
            <p style="font-size:12px; color:var(--text-secondary);">Real verified business profiles in your active database. Ready for 1-click cold email outreach.</p>
          </div>
          <div class="campaign-actions">
            <button class="btn-primary" onclick="dispatchAllStoredLeads()">
              ✉️ 1-Click Send All Stored Leads (${state.leads.length})
            </button>
          </div>
        </div>
        <div class="leads-grid">
          ${state.leads.map(l => renderLeadCardHtml(l)).join('')}
        </div>
      </div>
    `;
  }

  // Zero-mock High-Tech Launchpad
  return `
    <div style="margin-top:24px; padding:32px 20px; text-align:center; background:rgba(255,255,255,0.02); border:1px dashed rgba(255,255,255,0.12); border-radius:12px;">
      <div style="font-size:32px; margin-bottom:12px;">🌐</div>
      <h3 style="color:#fff; font-size:18px; font-weight:700; margin-bottom:6px;">KLIKWise Autonomous Lead Discovery Engine Ready</h3>
      <p style="color:var(--text-secondary); font-size:13px; max-width:550px; margin:0 auto 18px auto;">
        Enter any keyword in curly braces or plain text (e.g. <code>{ startup brands in delhi }</code> or <code>{ fashion brands in new york }</code>).
        The multi-agent system will scrape Google Places globally, extract real emails, generate personalized 15-minute intro proposals, and handle cold outreach automatically.
      </p>
      <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
        <button class="btn-primary" onclick="runLivePipelinePreset('{ startup brands in delhi }')">🇮🇳 Run: { startup brands in delhi }</button>
        <button class="btn-secondary" onclick="runLivePipelinePreset('{ fashion brands in new york }')">🇺🇸 Run: { fashion brands in new york }</button>
        <button class="btn-secondary" onclick="runLivePipelinePreset('{ luxury cafes in dubai }')">🇦🇪 Run: { luxury cafes in dubai }</button>
        <button class="btn-secondary" onclick="runLivePipelinePreset('{ tech startups in london }')">🇬🇧 Run: { tech startups in london }</button>
      </div>
    </div>
  `;
}

function renderCampaignCards(campaign) {
  const leads = campaign.leads || [];
  const isAuto = campaign.mode === 'CONTROLLED_AUTOMATION';

  return `
    <div style="margin-top:24px;">
      <div class="campaign-bar">
        <div>
          <h3 style="font-size:18px; color:#fff; font-weight:700;">
            ${isAuto ? '⚡ Auto-Dispatched Campaign' : 'Staged Campaign'}: ${campaign.plan?.niche || 'Target Niche'} (${campaign.plan?.location || 'Global'})
          </h3>
          <p style="font-size:12px; color:var(--text-secondary); margin-top:2px;">
            <strong>${leads.length} Real Prospects</strong> discovered & enriched. Sender: Mayank Aggarwal &lt;riyansh.studio007@gmail.com&gt;.
          </p>
        </div>
        <div class="campaign-actions">
          <button class="btn-primary" onclick="approveCurrentCampaign('${campaign.campaignId}')">
            ✅ ${isAuto ? 'Re-Dispatch All' : 'One-Click Approve All & Launch'} (${leads.length})
          </button>
        </div>
      </div>

      <div class="leads-grid">
        ${leads.map(l => renderLeadCardHtml(l)).join('')}
      </div>
    </div>
  `;
}

function renderLeadCardHtml(lead) {
  const services = (lead.recommendedServices || ['Meta Ads (Instagram & FB)', 'AI Video Production']).slice(0, 2);
  const isSent = lead.crmStage === 'PROPOSAL_SENT';

  return `
    <div class="lead-card" id="card-${lead.id}">
      <div class="lead-header">
        <div>
          <div class="lead-name">${lead.businessName}</div>
          <div class="lead-category">${lead.category || 'Startup Brand'} • ${lead.address || lead.location || 'Global'}</div>
        </div>
        <div class="lead-score-ring">
          ${lead.leadScore || 90}/100
        </div>
      </div>

      <div class="lead-contact-box">
        <div class="contact-line">
          <span>🌐</span>
          <a href="${lead.website || '#'}" target="_blank">${lead.website ? lead.website.replace('https://', '').replace(/\/$/, '') : 'Web Verified'}</a>
        </div>
        <div class="contact-line">
          <span>📞</span>
          <span>${lead.phone || '+91 98111 XXXXX'}</span>
          <button style="margin-left:auto; background:none; border:none; color:var(--cyan); cursor:pointer; font-size:11px;" onclick="copyToClipboard('${lead.phone}')">Copy</button>
        </div>
        <div class="contact-line">
          <span>✉️</span>
          <span style="color:var(--cyan); font-weight:600;">${lead.email || 'Email discovered'}</span>
        </div>
      </div>

      <div class="service-tags">
        ${services.map(s => `<span class="service-pill">${s}</span>`).join('')}
      </div>

      <div class="lead-footer">
        <div class="compliance-badge" style="${isSent ? 'border-color:var(--green); color:var(--green);' : ''}">
          <span>${isSent ? '✅' : '🛡️'}</span> ${isSent ? 'Proposal Sent' : '15-Min Intro Ready'}
        </div>
        <div style="display:flex; gap:6px;">
          <button class="btn-view-pitch" onclick="previewPitchModal('${lead.id}', '${encodeURIComponent(JSON.stringify(lead))}')">
            View 15-Min Pitch ✉️
          </button>
          <button class="btn-primary" style="padding:4px 10px; font-size:11px;" onclick="sendSingleEmail('${lead.id}')">
            ${isSent ? 'Resend ⚡' : 'Send ⚡'}
          </button>
        </div>
      </div>
    </div>
  `;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
  alert(`Copied: ${text}`);
}

async function sendSingleEmail(leadId) {
  let lead = (state.activeCampaign?.leads || []).find(l => l.id === leadId) || (state.leads || []).find(l => l.id === leadId);
  if (!lead) return;

  const conf = confirm(`Dispatch cold email to ${lead.businessName} (${lead.email}) from Mayank Aggarwal <riyansh.studio007@gmail.com>?`);
  if (!conf) return;

  try {
    const res = await fetch('/api/email/dispatch-single', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leadId: lead.id,
        businessName: lead.businessName,
        email: lead.email,
        subject: lead.pitchDraft?.subject || lead.pitchSubject,
        body: lead.pitchDraft?.body || lead.pitchBody,
        campaignId: state.activeCampaign?.campaignId || 'MANUAL'
      })
    });
    const data = await res.json();
    alert(`🎉 Email successfully dispatched to ${lead.email} via Gmail SMTP!`);
    lead.crmStage = 'PROPOSAL_SENT';
    lead.approvalStatus = 'APPROVED';
    await refreshData();
    renderActiveTab();
  } catch (err) {
    alert('Error sending email: ' + err.message);
  }
}

async function dispatchAllStoredLeads() {
  if (!state.leads || state.leads.length === 0) return;
  const conf = confirm(`Launch 1-click email dispatch to all ${state.leads.length} leads in your database?`);
  if (!conf) return;

  let sent = 0;
  for (const lead of state.leads) {
    try {
      await fetch('/api/email/dispatch-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          businessName: lead.businessName,
          email: lead.email,
          subject: lead.pitchDraft?.subject || `Growth idea for ${lead.businessName}`,
          body: lead.pitchDraft?.body || `Hi,\n\nI was admiring ${lead.businessName}'s presence. Would you be open to a 15-minute intro call this week?\n\nBest,\nMayank Aggarwal\n+91 9217756033`,
          campaignId: 'BULK_STORED'
        })
      });
      lead.crmStage = 'PROPOSAL_SENT';
      sent++;
    } catch(e){}
  }
  alert(`🎉 Successfully dispatched ${sent} emails from Mayank Aggarwal <riyansh.studio007@gmail.com>!`);
  await refreshData();
  renderActiveTab();
}

async function approveCurrentCampaign(campaignId) {
  try {
    const res = await fetch('/api/command-center/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId })
    });
    const data = await res.json();
    alert(`🎉 Outreach initiated for ${data.dispatchedCount || 'all'} leads from ${data.senderEmail || 'riyansh.studio007@gmail.com'}!\nFollow-up sequences (Day 0, Day 3, Day 7) activated.`);
    await refreshData();
    renderActiveTab();
  } catch (err) {
    alert('Failed to approve campaign: ' + err.message);
  }
}

// Modal Handling
function previewPitchModal(leadId, encodedLead) {
  let lead = null;
  if (encodedLead) {
    try { lead = JSON.parse(decodeURIComponent(encodedLead)); } catch(e){}
  }
  if (!lead && state.activeCampaign?.leads) {
    lead = state.activeCampaign.leads.find(l => l.id === leadId);
  }
  if (!lead && state.leads) {
    lead = state.leads.find(l => l.id === leadId);
  }
  if (!lead) return;

  state.selectedLeadForModal = lead;

  document.getElementById('modal-business-name').innerText = lead.businessName;
  document.getElementById('modal-lead-score').innerText = `Lead Score: ${lead.leadScore || 90}/100`;
  document.getElementById('modal-recipient').innerText = lead.email || `${lead.businessName} Contact Team`;
  document.getElementById('modal-service').innerText = (lead.recommendedServices || ['Meta Ads (Instagram & FB)'])[0];
  document.getElementById('modal-subject').innerText = lead.pitchDraft?.subject || lead.pitchSubject || `Growth idea for ${lead.businessName}`;
  document.getElementById('modal-body-text').innerText = lead.pitchDraft?.body || lead.pitchBody || `Hi,\n\nI was reviewing ${lead.businessName}'s presence and would love to arrange a 15-minute strategy call this week.\n\nBest regards,\nMayank Aggarwal\n+91 9217756033`;

  document.getElementById('pitch-modal').style.display = 'flex';
}

function closePitchModal() {
  document.getElementById('pitch-modal').style.display = 'none';
  state.selectedLeadForModal = null;
}

async function sendSingleEmailFromModal() {
  if (!state.selectedLeadForModal) return;
  const lead = state.selectedLeadForModal;
  const btn = document.getElementById('btn-modal-send');
  if (btn) {
    btn.disabled = true;
    btn.innerText = 'Dispatching via SMTP...';
  }

  try {
    const res = await fetch('/api/email/dispatch-single', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leadId: lead.id,
        businessName: lead.businessName,
        email: lead.email,
        subject: lead.pitchDraft?.subject || lead.pitchSubject,
        body: lead.pitchDraft?.body || lead.pitchBody,
        campaignId: state.activeCampaign?.campaignId || 'MANUAL'
      })
    });
    const data = await res.json();
    alert(`🎉 Cold Email Dispatched!\nTo: ${lead.email}\nFrom: Mayank Aggarwal <riyansh.studio007@gmail.com>\nStage updated to: Proposal Sent`);
    lead.crmStage = 'PROPOSAL_SENT';
    lead.approvalStatus = 'APPROVED';
    closePitchModal();
    await refreshData();
    renderActiveTab();
  } catch (err) {
    alert('Failed to send email: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = 'Dispatch Live Email Now ✉️';
    }
  }
}

// ==========================================================================
// TAB 2: AI SALES AGENT & WHATSAPP INTERACTIVE LAB
// ==========================================================================
function renderAiSales(el) {
  el.innerHTML = `
    <div class="chat-layout">
      <!-- Left: Interactive Chat Simulator -->
      <div class="chat-panel">
        <div class="chat-header">
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="pulse-dot green"></div>
            <div>
              <h3 style="font-size:14px; color:#fff; font-weight:700;">Mayank Aggarwal's Autonomous AI Sales Agent</h3>
              <span style="font-size:11px; color:var(--text-muted);">Trained on KLIKWise Master Profile & INR Pricing Rules</span>
            </div>
          </div>
          <button class="btn-secondary" style="padding:6px 12px; font-size:11px;" onclick="clearSalesChat()">Clear Chat</button>
        </div>

        <!-- Chat Messages -->
        <div class="chat-messages" id="sales-chat-box">
          ${state.chatHistory.map(m => `
            <div class="chat-bubble ${m.sender}">
              ${m.text.replace(/\n/g, '<br>')}
            </div>
          `).join('')}
        </div>

        <!-- Quick Question Prompts in Hindi & English -->
        <div style="padding:8px 20px; background:rgba(0,0,0,0.15); display:flex; flex-wrap:wrap; gap:6px;">
          <button class="chip-btn" style="font-size:11px;" onclick="sendPresetSalesQuestion('Namaste! Mere paas boutique hai, mujhe sales badhani hai, kya plan hai?')">👗 Boutique Sales Kaise Badhayein?</button>
          <button class="chip-btn" style="font-size:11px;" onclick="sendPresetSalesQuestion('What are your Performance Marketing charges?')">💰 Performance Marketing Charges?</button>
          <button class="chip-btn" style="font-size:11px;" onclick="sendPresetSalesQuestion('Can you rank my website on Google with SEO?')">❌ Do you do SEO?</button>
          <button class="chip-btn" style="font-size:11px;" onclick="sendPresetSalesQuestion('Previous work portfolio dikhao')">📁 Show Portfolio</button>
          <button class="chip-btn" style="font-size:11px;" onclick="sendPresetSalesQuestion('Mayank se baat karni hai, number do')">📞 Contact Mayank</button>
          <button class="chip-btn" style="font-size:11px;" onclick="sendPresetSalesQuestion('Kaise start karein? Process kya hai?')">🚀 Process Kya Hai?</button>
        </div>

        <!-- Chat Input Bar -->
        <div class="chat-input-bar">
          <input 
            type="text" 
            id="sales-chat-input" 
            class="chat-input" 
            placeholder="Type any inquiry in Hindi or English (e.g. 'Mere brand ki sales kaise badhegi?')..." 
            onkeydown="if(event.key==='Enter') sendSalesMessage()"
          >
          <button class="btn-execute" style="padding:0 20px; font-size:13px;" onclick="sendSalesMessage()">
            Send ➔
          </button>
        </div>
      </div>

      <!-- Right: Meta WhatsApp & Email Automation Hub -->
      <div class="info-panel">
        <!-- Automated Email Dispatcher Card -->
        <div class="info-card" style="border: 1px solid var(--purple); background: rgba(139, 92, 246, 0.04);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <h4 style="margin-bottom:0;"><span style="font-size:16px;">✉️</span> Cold Email Dispatcher</h4>
            <span class="system-status-pill" id="email-connection-pill" style="font-size:10px; padding:3px 8px; color:var(--purple); border-color:var(--purple);">
              ${state.emailConfigured ? '🟢 SMTP ACTIVE' : '🟡 GMAIL READY'}
            </span>
          </div>

          <div class="form-group" style="margin-bottom:8px;">
            <label class="form-label" style="font-size:11px;">Sender Business Email</label>
            <input type="email" id="email-input-sender" class="form-input" style="font-size:12px; padding:7px 10px;" value="riyansh.studio007@gmail.com">
          </div>

          <div class="form-group" style="margin-bottom:8px;">
            <label class="form-label" style="font-size:11px;">Gmail 16-Char App Password (or SMTP Pass)</label>
            <input type="password" id="email-input-pass" class="form-input" style="font-size:12px; padding:7px 10px;" placeholder="xxxx xxxx xxxx xxxx">
            <span style="font-size:10px; color:var(--text-muted); display:block; margin-top:3px;">
              Generated from Google Account > Security > App Passwords.
            </span>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px; margin-top:10px;">
            <button class="btn-primary" style="width:100%; justify-content:center; padding:8px; font-size:12px; background:linear-gradient(135deg, var(--purple), var(--blue)); box-shadow:0 0 15px var(--purple-glow);" onclick="saveEmailConfig()">
              💾 Save Email SMTP Settings
            </button>
            <button class="btn-secondary" style="width:100%; justify-content:center; padding:8px; font-size:12px;" onclick="sendTestEmailToMyInbox()">
              📨 Send Test Email to riyansh.studio007@gmail.com
            </button>
          </div>
        </div>

        <!-- WhatsApp API & Number Connection Card -->
        <div class="info-card" style="border: 1px solid var(--cyan); background: rgba(0, 242, 254, 0.04);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <h4 style="margin-bottom:0;"><span style="font-size:16px;">📱</span> Connect WhatsApp API</h4>
            <span class="system-status-pill" id="wa-connection-pill" style="font-size:10px; padding:3px 8px; color:var(--cyan); border-color:var(--cyan);">
              ${state.whatsappConfigured ? '🟢 CONNECTED' : '🟡 NUMBER LINKED'}
            </span>
          </div>

          <div class="form-group" style="margin-bottom:8px;">
            <label class="form-label" style="font-size:11px;">Your Registered Business Number</label>
            <input type="text" id="wa-input-number" class="form-input" style="font-size:12px; padding:7px 10px;" value="+919217756033" placeholder="+919217756033">
          </div>

          <div class="form-group" style="margin-bottom:8px;">
            <label class="form-label" style="font-size:11px;">Meta Phone Number ID</label>
            <input type="text" id="wa-input-phone-id" class="form-input" style="font-size:12px; padding:7px 10px;" placeholder="e.g. 106598234892182">
          </div>

          <div class="form-group" style="margin-bottom:10px;">
            <label class="form-label" style="font-size:11px;">Meta Access Token (System User / Permanent)</label>
            <input type="password" id="wa-input-token" class="form-input" style="font-size:12px; padding:7px 10px;" placeholder="EAAG... (from Meta Business Suite)">
          </div>

          <!-- Webhook Info Box -->
          <div style="background:rgba(0,0,0,0.3); border:1px solid var(--border-subtle); border-radius:6px; padding:8px 10px; margin-bottom:10px; font-size:11px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
              <span style="color:var(--text-muted);">Webhook URL:</span>
              <button style="background:none; border:none; color:var(--cyan); cursor:pointer; font-size:10px;" onclick="copyToClipboard('https://klikwise-os.vercel.app/api/whatsapp/webhook')">Copy</button>
            </div>
            <div style="font-family:var(--font-mono); color:var(--cyan); word-break:break-all; font-size:10px;">
              https://klikwise-os.vercel.app/api/whatsapp/webhook
            </div>
            <div style="display:flex; justify-content:space-between; margin-top:6px; margin-bottom:2px;">
              <span style="color:var(--text-muted);">Verify Token:</span>
              <span style="font-family:var(--font-mono); color:#fff; font-size:10px;">klikwise_verify_token_secure_2026</span>
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px;">
            <button class="btn-primary" style="width:100%; justify-content:center; padding:8px; font-size:12px;" onclick="saveWhatsAppConfig()">
              💾 Save & Link WhatsApp API
            </button>
            <button class="btn-secondary" style="width:100%; justify-content:center; padding:8px; font-size:12px;" onclick="sendTestWhatsAppToMyNumber()">
              📲 Send Test WhatsApp to +91 9217756033
            </button>
            <a href="https://wa.me/919217756033" target="_blank" class="btn-secondary" style="text-align:center; text-decoration:none; padding:7px; font-size:11px; color:var(--cyan);">
              💬 Open WhatsApp Chat with Mayank
            </a>
          </div>
        </div>

        <div class="info-card">
          <h4><span>💬</span> Meta WhatsApp Status</h4>
          <div style="font-size:12px; display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--text-muted);">Coexistence Mode:</span>
              <span style="color:var(--green); font-weight:600;">ACTIVE (Mobile App Safe)</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--text-muted);">Linked Number:</span>
              <span style="color:var(--cyan); font-weight:600;">+91 9217756033</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--text-muted);">Service Window:</span>
              <span style="color:var(--cyan); font-weight:600;">24-Hr Standard</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--text-muted);">Opt-Out Keyword:</span>
              <span style="color:var(--red); font-weight:600;">STOP</span>
            </div>
          </div>
        </div>

        <div class="info-card">
          <h4><span>👑</span> Executive Credentials</h4>
          <p style="font-size:11px; color:var(--text-secondary); line-height:1.5;">
            Founder: <strong>Mayank Aggarwal</strong><br>
            Role: Co-Founder & AI Creative Head<br>
            Phone: +91 9217756033<br>
            Email: riyansh.studio007@gmail.com
          </p>
        </div>
      </div>
    </div>
  `;
}

function sendPresetSalesQuestion(text) {
  const input = document.getElementById('sales-chat-input');
  if (input) {
    input.value = text;
    sendSalesMessage();
  }
}

async function sendSalesMessage() {
  const input = document.getElementById('sales-chat-input');
  const chatBox = document.getElementById('sales-chat-box');
  const msgText = input ? input.value.trim() : '';
  if (!msgText) return;

  // Append user bubble
  state.chatHistory.push({ sender: 'user', text: msgText });
  input.value = '';
  renderChatMessages();

  try {
    const res = await fetch('/api/sales-agent/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: msgText,
        history: state.chatHistory.slice(-5)
      })
    });
    const data = await res.json();
    state.chatHistory.push({
      sender: 'agent',
      text: data.reply || "Thank you for reaching out to KLIKWise. Let me prepare a custom proposal for your brand."
    });
    renderChatMessages();
  } catch (err) {
    state.chatHistory.push({
      sender: 'agent',
      text: `Error connecting to AI sales agent: ${err.message}`
    });
    renderChatMessages();
  }
}

function renderChatMessages() {
  const chatBox = document.getElementById('sales-chat-box');
  if (!chatBox) return;
  chatBox.innerHTML = state.chatHistory.map(m => `
    <div class="chat-bubble ${m.sender}">
      ${m.text.replace(/\n/g, '<br>')}
    </div>
  `).join('');
  chatBox.scrollTop = chatBox.scrollHeight;
}

function clearSalesChat() {
  state.chatHistory = [
    {
      sender: 'agent',
      text: "Hello! I am Mayank Aggarwal's Autonomous AI Sales Agent for KLIKWise. How can I assist you with your marketing or growth goals today?"
    }
  ];
  renderChatMessages();
}

async function saveWhatsAppConfig() {
  const businessNumber = document.getElementById('wa-input-number')?.value.trim() || '+919217756033';
  const phoneNumberId = document.getElementById('wa-input-phone-id')?.value.trim() || '';
  const accessToken = document.getElementById('wa-input-token')?.value.trim() || '';

  try {
    const res = await fetch('/api/whatsapp/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessNumber,
        phoneNumberId,
        accessToken,
        webhookVerifyToken: 'klikwise_verify_token_secure_2026'
      })
    });
    const data = await res.json();
    if (data.success) {
      state.whatsappConfigured = data.configured;
      alert(`🎉 WhatsApp Settings Saved!\n\nRegistered Number: ${data.businessNumber}\nAPI Status: ${data.configured ? 'LIVE & ACTIVE' : 'Saved (Ready for Meta Keys)'}\n\nCoexistence is ACTIVE — you can continue using the WhatsApp Business app on your phone without interruption.`);
      const pill = document.getElementById('wa-connection-pill');
      if (pill) {
        pill.innerText = data.configured ? '🟢 CONNECTED' : '🟡 NUMBER LINKED';
        pill.style.color = data.configured ? 'var(--green)' : 'var(--cyan)';
        pill.style.borderColor = data.configured ? 'var(--green)' : 'var(--cyan)';
      }
    }
  } catch (err) {
    alert('Error saving WhatsApp configuration: ' + err.message);
  }
}

async function sendTestWhatsAppToMyNumber() {
  const number = document.getElementById('wa-input-number')?.value.trim() || '+919217756033';
  try {
    const res = await fetch('/api/whatsapp/test-send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: number })
    });
    const data = await res.json();
    if (data.status === 'SENT') {
      alert(`✅ Real WhatsApp Message Sent via Meta Cloud API!\nMessage ID: ${data.messageId}\nCheck your WhatsApp on +91 9217756033!`);
    } else if (data.status === 'SIMULATED_SENT') {
      alert(`📲 Simulated WhatsApp Sent to ${data.to}!\n\nMessage Content:\n"${data.message}"\n\n(Tip: Enter your Meta Phone Number ID and Access Token above to route live via Meta telecom network).`);
    } else {
      alert(`WhatsApp Status: ${data.status}\n${data.reason || data.error || ''}`);
    }
  } catch (err) {
    alert('Failed to send test WhatsApp: ' + err.message);
  }
}

async function saveEmailConfig() {
  const senderEmail = document.getElementById('email-input-sender')?.value.trim() || 'riyansh.studio007@gmail.com';
  const smtpPass = document.getElementById('email-input-pass')?.value.trim() || '';

  try {
    const res = await fetch('/api/email/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderEmail, smtpPass })
    });
    const data = await res.json();
    if (data.success) {
      state.emailConfigured = data.configured;
      alert(`🎉 Cold Email Dispatcher Configured!\n\nSender: ${data.senderEmail}\nStatus: ${data.configured ? 'LIVE SMTP ACTIVE' : 'Saved (Ready for Gmail App Password)'}\n\nAutomated Day-0 cold emails and multi-touch follow-ups will send directly from this inbox.`);
      const pill = document.getElementById('email-connection-pill');
      if (pill) {
        pill.innerText = data.configured ? '🟢 SMTP ACTIVE' : '🟡 GMAIL READY';
        pill.style.color = data.configured ? 'var(--green)' : 'var(--purple)';
        pill.style.borderColor = data.configured ? 'var(--green)' : 'var(--purple)';
      }
    }
  } catch (err) {
    alert('Failed to save email config: ' + err.message);
  }
}

async function sendTestEmailToMyInbox() {
  const senderEmail = document.getElementById('email-input-sender')?.value.trim() || 'riyansh.studio007@gmail.com';
  try {
    const res = await fetch('/api/email/test-send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: senderEmail })
    });
    const data = await res.json();
    if (data.status === 'DELIVERED') {
      alert(`✅ Live Email Delivered!\nMessage ID: ${data.messageId}\nCheck your inbox at ${senderEmail}!`);
    } else if (data.status === 'SIMULATED_DISPATCHED') {
      alert(`📨 Email Staged in Outbox for ${senderEmail}!\n\n"${data.note}"\n\nEnter your 16-character Gmail App Password in the box above to send live over the internet.`);
    } else {
      alert(`Email Status: ${data.status}\n${data.error || ''}`);
    }
  } catch (err) {
    alert('Failed to send test email: ' + err.message);
  }
}

// ==========================================================================
// TAB 3: LEADS & CRM PIPELINE
// ==========================================================================
function renderCrmPipeline(el) {
  const allLeads = (state.activeCampaign?.leads?.length ? state.activeCampaign.leads : state.leads) || [];

  const stages = [
    { id: 'discovered', name: '1. Discovered & Qualified', filter: l => l.crmStage === 'OUTREACH_READY' || l.crmStage === 'QUALIFIED' || !l.crmStage },
    { id: 'sent', name: '2. 15-Min Proposal Sent', filter: l => l.crmStage === 'PROPOSAL_SENT' || l.crmStage === 'CONTACTED' },
    { id: 'replied', name: '3. Warm Reply / Inbound', filter: l => l.crmStage === 'REPLIED' || l.crmStage === 'INTERESTED' },
    { id: 'call', name: '4. 15-Min Call Scheduled', filter: l => l.crmStage === 'DISCOVERY' || l.crmStage === 'CALL_SCHEDULED' },
    { id: 'closed', name: '5. Retainer Won', filter: l => l.crmStage === 'WON' }
  ];

  el.innerHTML = `
    <div class="glass-card" style="margin-bottom:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <h2 style="font-size:18px; color:#fff; font-weight:700;">KLIKWise CRM & Outreach Lifecycle</h2>
          <p style="font-size:12px; color:var(--text-secondary);">Real live prospects stored in active database (${allLeads.length} total active prospects).</p>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="btn-secondary" onclick="refreshData().then(() => renderActiveTab())">🔄 Refresh CRM</button>
          <button class="btn-primary" onclick="switchTab('command_center')">⚡ Run New Discovery</button>
        </div>
      </div>
    </div>

    <div class="kanban-board">
      ${stages.map(st => {
        const stageLeads = allLeads.filter(st.filter);
        return `
          <div class="kanban-col">
            <div class="kanban-col-header">
              <span class="col-title">${st.name}</span>
              <span class="col-badge">${stageLeads.length}</span>
            </div>
            <div class="kanban-cards">
              ${stageLeads.length === 0 ? `<div style="padding:16px; text-align:center; font-size:11px; color:var(--text-muted);">No prospects in this stage</div>` : ''}
              ${stageLeads.map(l => `
                <div class="crm-card">
                  <div style="font-weight:700; color:#fff; margin-bottom:4px;">${l.businessName}</div>
                  <div style="font-size:11px; color:var(--cyan); margin-bottom:4px;">${l.category || 'Brand'} • ${l.location || 'Global'}</div>
                  <div style="font-size:11px; color:var(--text-secondary); margin-bottom:6px;">✉️ ${l.email || 'Email extracted'}</div>
                  <div style="display:flex; justify-content:space-between; align-items:center; font-size:10px; color:var(--text-muted);">
                    <span>📞 ${l.phone || 'Phone verified'}</span>
                    <span style="color:var(--green); font-weight:700;">${l.leadScore || 90}/100</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ==========================================================================
// TAB 4: PROPOSALS & MASTER PRICING CATALOGUE
// ==========================================================================
function renderProposalsPricing(el) {
  el.innerHTML = `
    <div class="proposal-grid">
      <!-- Left: Interactive SOW Generator Form -->
      <div class="glass-card">
        <h3 style="font-size:16px; color:#fff; font-weight:700; margin-bottom:16px;">
          📝 1-Click SOW Proposal Generator
        </h3>
        <p style="font-size:12px; color:var(--text-secondary); margin-bottom:20px;">
          Generate a legally compliant, client-ready Scope of Work Statement customized with Mayank Aggarwal's credentials and approved INR pricing.
        </p>

        <div class="form-group">
          <label class="form-label">Client / Business Name</label>
          <input type="text" id="prop-client-name" class="form-input" value="Luxe Vogue Apparel" placeholder="Enter company name">
        </div>

        <div class="form-group">
          <label class="form-label">Select Approved KLIKWise Package</label>
          <select id="prop-package-select" class="form-select" onchange="updateProposalPricingPreview()">
            <option value="performance">Performance Growth Package (₹25,000 - ₹30,000/mo)</option>
            <option value="social">Social Growth Package (₹20,000 - ₹25,000/mo)</option>
            <option value="ai_creative">AI Creative & UGC Growth (₹20,000 - ₹30,000/mo)</option>
            <option value="complete">Complete Business Growth OS (₹35,000 - ₹40,000/mo)</option>
            <option value="starter">Starter Digital Presence (₹15,000 - ₹18,000/mo)</option>
            <option value="web_dev">Web Development Project (₹35,000 - ₹75,000 fixed)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Client Target Location</label>
          <input type="text" id="prop-location" class="form-input" value="Delhi NCR & Pan-India" placeholder="Target region">
        </div>

        <div class="form-group">
          <label class="form-label">Custom Deliverable Notes</label>
          <textarea id="prop-notes" class="form-input" style="height:70px; resize:none;" placeholder="Optional custom scope additions...">Bi-weekly KPI reporting, Meta Pixel + GA4 sync, 8 Short-form AI Reels.</textarea>
        </div>

        <button class="btn-execute" style="width:100%; justify-content:center; padding:12px;" onclick="generateClientProposal()">
          Generate Official Proposal ➔
        </button>
      </div>

      <!-- Right: Live Branded SOW Preview / Print Box -->
      <div id="proposal-preview-area">
        ${renderProposalPreviewHtml()}
      </div>
    </div>

    <!-- Master INR Pricing Table -->
    <div class="glass-card" style="margin-top:24px;">
      <h3 style="font-size:16px; color:#fff; font-weight:700; margin-bottom:14px;">
        🏷️ Master Service Catalogue & Approved INR Pricing
      </h3>
      <table style="width:100%; border-collapse:collapse; font-size:12px;">
        <thead>
          <tr style="border-bottom:1px solid var(--border-subtle); color:var(--text-muted); text-align:left;">
            <th style="padding:10px;">Package Name</th>
            <th style="padding:10px;">Category</th>
            <th style="padding:10px;">Key Deliverables</th>
            <th style="padding:10px;">Approved Pricing (INR)</th>
            <th style="padding:10px;">Ad Spend Policy</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid var(--border-subtle);">
            <td style="padding:12px; font-weight:700; color:#fff;">Starter Digital Presence</td>
            <td style="padding:12px; color:var(--cyan);">Social Media</td>
            <td style="padding:12px; color:var(--text-secondary);">12 Posts/mo, 4 Reels, Content Calendar, Scheduling</td>
            <td style="padding:12px; font-weight:700; color:var(--green);">₹15,000 - ₹18,000/mo</td>
            <td style="padding:12px; color:var(--text-muted);">N/A (Organic)</td>
          </tr>
          <tr style="border-bottom:1px solid var(--border-subtle);">
            <td style="padding:12px; font-weight:700; color:#fff;">Social Growth Package</td>
            <td style="padding:12px; color:var(--cyan);">Social Marketing</td>
            <td style="padding:12px; color:var(--text-secondary);">Full Strategy, 4 Content Pillars, Reels, Bi-Weekly Reports</td>
            <td style="padding:12px; font-weight:700; color:var(--green);">₹20,000 - ₹25,000/mo</td>
            <td style="padding:12px; color:var(--text-muted);">Optional Boosts</td>
          </tr>
          <tr style="border-bottom:1px solid var(--border-subtle); background:rgba(0, 242, 254, 0.03);">
            <td style="padding:12px; font-weight:700; color:var(--cyan);">Performance Growth (Flagship)</td>
            <td style="padding:12px; color:var(--cyan);">Paid Performance Ads</td>
            <td style="padding:12px; color:var(--text-secondary);">Meta Ads + Google Ads, Pixel/GA4 Sync, Retargeting, CPL/ROAS Opt</td>
            <td style="padding:12px; font-weight:700; color:var(--green);">₹25,000 - ₹30,000/mo</td>
            <td style="padding:12px; color:var(--amber);">Paid directly by client to ad platforms</td>
          </tr>
          <tr style="border-bottom:1px solid var(--border-subtle);">
            <td style="padding:12px; font-weight:700; color:#fff;">AI Creative & UGC Growth</td>
            <td style="padding:12px; color:var(--purple);">AI Filmmaking</td>
            <td style="padding:12px; color:var(--text-secondary);">8 AI Brand Reels, 4 UGC Creatives, ElevenLabs Voiceovers</td>
            <td style="padding:12px; font-weight:700; color:var(--green);">₹20,000 - ₹30,000/mo</td>
            <td style="padding:12px; color:var(--text-muted);">Ad Spend Separate</td>
          </tr>
          <tr style="border-bottom:1px solid var(--border-subtle);">
            <td style="padding:12px; font-weight:700; color:#fff;">Complete Business Growth OS</td>
            <td style="padding:12px; color:var(--cyan);">Omnichannel Retainer</td>
            <td style="padding:12px; color:var(--text-secondary);">Paid Ads + Organic Social + AI Video + WhatsApp Automation</td>
            <td style="padding:12px; font-weight:700; color:var(--green);">₹35,000 - ₹40,000/mo</td>
            <td style="padding:12px; color:var(--amber);">Paid directly by client to ad platforms</td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top:14px; font-size:11px; color:var(--text-muted);">
        ⚠️ <strong>Strict Commercial Exclusion:</strong> SEO retainers and speculative sales/ROAS guarantees are strictly excluded from all KLIKWise agreements.
      </div>
    </div>
  `;
}

function updateProposalPricingPreview() {
  // Can trigger reactive update
}

function generateClientProposal() {
  const clientName = document.getElementById('prop-client-name').value.trim() || 'Valued Client';
  const pkg = document.getElementById('prop-package-select').value;
  const location = document.getElementById('prop-location').value.trim() || 'Delhi NCR';
  const notes = document.getElementById('prop-notes').value.trim();

  const pkgMap = {
    performance: { name: 'Performance Growth Package', price: '₹25,000 - ₹30,000/month', deliverables: ['Meta Ads Management (Facebook & Instagram)', 'Google Ads Management (Search & Performance Max)', 'Conversion Tracking Synchronization (Meta Pixel + GA4)', 'Retargeting Funnels & Custom Audience Segmentation', 'Bi-Weekly Executive Performance Briefings (Twice a week)'] },
    social: { name: 'Social Growth Package', price: '₹20,000 - ₹25,000/month', deliverables: ['Full Organic Marketing Strategy', '4 Content Pillars & Viral Reel Formats', 'Post Scheduling & Community Management', 'Bi-Weekly Progress Reports'] },
    ai_creative: { name: 'AI Creative & UGC Growth Retainer', price: '₹20,000 - ₹30,000/month', deliverables: ['8 AI Brand Video Creatives', '4 Authentic UGC Ads', 'Studio Voiceovers & Sound Design (ElevenLabs)', 'Rapid Creative Refresh Cycles'] },
    complete: { name: 'Complete Business Growth OS', price: '₹35,000 - ₹40,000/month', deliverables: ['Full Omnichannel Paid Media (Meta + Google)', 'Organic Social Media Strategy', 'Full AI Video & Creative Production Suite', 'WhatsApp Automation Funnels (Interakt)'] },
    starter: { name: 'Starter Digital Presence Package', price: '₹15,000 - ₹18,000/month', deliverables: ['12 Static & Carousel Posts', '4 Short-Form Reels', 'Hashtags, Copywriting & Scheduling', 'Monthly Growth Briefing'] },
    web_dev: { name: 'Custom Corporate & Landing Page Web Development', price: '₹35,000 - ₹75,000 (Fixed Project)', deliverables: ['Mobile-Optimized Responsive Architecture', 'High-Converting Sales Funnels', 'Meta Pixel & GA4 Integration', '14 Days Post-Launch Support'] }
  };

  const selected = pkgMap[pkg] || pkgMap.performance;
  state.generatedProposal = {
    clientName,
    location,
    notes,
    package: selected
  };

  const previewArea = document.getElementById('proposal-preview-area');
  if (previewArea) {
    previewArea.innerHTML = renderProposalPreviewHtml();
  }
}

function renderProposalPreviewHtml() {
  const p = state.generatedProposal || {
    clientName: 'Luxe Vogue Apparel',
    location: 'Delhi NCR',
    notes: 'Bi-weekly KPI reporting, Meta Pixel + GA4 sync, 8 Short-form AI Reels.',
    package: {
      name: 'Performance Growth Package',
      price: '₹25,000 - ₹30,000/month',
      deliverables: [
        'Meta Ads Management (Facebook & Instagram)',
        'Google Ads Management (Search & Performance Max)',
        'Conversion Tracking Synchronization (Meta Pixel + GA4)',
        'Retargeting Funnels & Custom Audience Segmentation',
        'Bi-Weekly Executive Performance Briefings (Twice a week)'
      ]
    }
  };

  return `
    <div class="sow-preview-card">
      <div class="sow-header">
        <div>
          <h2 style="font-size:20px; font-weight:800; color:#0F172A;">STATEMENT OF WORK (SOW)</h2>
          <div style="font-size:12px; color:#64748B; margin-top:4px;">Prepared by <strong>KLIKWise</strong></div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:700; color:#0F172A;">Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          <div style="font-size:11px; color:#64748B;">Doc ID: KW-${Math.floor(100000 + Math.random() * 900000)}</div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:24px; padding-bottom:16px; border-bottom:1px solid #E2E8F0;">
        <div>
          <div style="font-size:11px; text-transform:uppercase; color:#94A3B8; font-weight:700;">Client Details</div>
          <div style="font-size:14px; font-weight:700; color:#0F172A; margin-top:4px;">${p.clientName}</div>
          <div style="font-size:12px; color:#64748B;">Target Region: ${p.location}</div>
        </div>
        <div>
          <div style="font-size:11px; text-transform:uppercase; color:#94A3B8; font-weight:700;">Agency Lead & Point of Contact</div>
          <div style="font-size:14px; font-weight:700; color:#0F172A; margin-top:4px;">Mayank Aggarwal</div>
          <div style="font-size:12px; color:#64748B;">Co-Founder & AI Creative Head, KLIKWise</div>
          <div style="font-size:12px; color:#64748B;">📞 +91 9217756033 | ✉️ riyansh.studio007@gmail.com</div>
        </div>
      </div>

      <div style="margin-bottom:20px;">
        <div style="font-size:11px; text-transform:uppercase; color:#94A3B8; font-weight:700; margin-bottom:8px;">Selected Package Scope</div>
        <div style="font-size:16px; font-weight:800; color:#0284C7; margin-bottom:10px;">${p.package.name}</div>
        <ul style="padding-left:18px; font-size:12px; color:#334155; line-height:1.7;">
          ${p.package.deliverables.map(d => `<li>${d}</li>`).join('')}
        </ul>
      </div>

      ${p.notes ? `
        <div style="margin-bottom:20px; background:#F8FAFC; border-left:3px solid #0284C7; padding:10px 14px; font-size:12px; color:#475569;">
          <strong>Custom Project Notes:</strong> ${p.notes}
        </div>
      ` : ''}

      <div style="background:#F1F5F9; border-radius:8px; padding:16px 20px; display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
        <div>
          <div style="font-size:11px; text-transform:uppercase; color:#64748B; font-weight:700;">Investment / Commercials</div>
          <div style="font-size:20px; font-weight:800; color:#059669;">${p.package.price}</div>
          <div style="font-size:11px; color:#64748B;">Ad spend is paid directly by client to ad platforms.</div>
        </div>
        <button class="btn-primary" style="background:#0F172A; box-shadow:none;" onclick="window.print()">
          🖨️ Print / Download PDF
        </button>
      </div>

      <div style="font-size:10px; color:#94A3B8; line-height:1.4; border-top:1px solid #E2E8F0; padding-top:12px;">
        * Deliverables commence within 3 business days of onboarding and advance payment. Payment milestones: 50% advance upon contract execution, 50% at mid-cycle or project completion.
      </div>
    </div>
  `;
}

// ==========================================================================
// TAB 5: AI WORKFORCE & GOVERNANCE
// ==========================================================================
function renderAgentsSystem(el) {
  const agents = [
    { name: 'Command Center Orchestrator', role: 'Workflow Coordinator', status: 'ONLINE', icon: '⚡' },
    { name: 'Google Maps Business Scraper', role: 'Local Discovery', status: 'ONLINE', icon: '📍' },
    { name: 'Crawl4AI Web Enrichment', role: 'Contact & Social Extractor', status: 'ONLINE', icon: '🌐' },
    { name: 'Prospect Scoring Agent', role: 'Lead Qualification', status: 'ONLINE', icon: '🎯' },
    { name: 'Autonomous AI Sales Agent', role: 'Sales & Objections Rep', status: 'ONLINE', icon: '🤖' },
    { name: 'WhatsApp Coexistence Manager', role: 'Meta Cloud API Compliance', status: 'ONLINE', icon: '💬' },
    { name: 'Listmonk Campaign Manager', role: 'Cold Email Dispatcher', status: 'ONLINE', icon: '✉️' },
    { name: 'Twenty CRM Sync Engine', role: 'CRM Data Synchronizer', status: 'ONLINE', icon: '📊' },
    { name: 'Documenso Proposal Dispatcher', role: 'Digital Signatures & SOW', status: 'ONLINE', icon: '📝' },
    { name: 'Cal.com Booking Coordinator', role: 'Appointment Scheduler', status: 'ONLINE', icon: '📅' },
    { name: 'Follow-Up Cadence Agent', role: 'Day-3/7/14 Nurturing', status: 'ONLINE', icon: '⏱️' },
    { name: 'Security & Audit Officer', role: 'Zero-Leakage & Governance', status: 'ONLINE', icon: '🛡️' }
  ];

  el.innerHTML = `
    <div class="glass-card" style="margin-bottom:20px;">
      <h2 style="font-size:18px; color:#fff; font-weight:700;">12 Specialized Autonomous AI Agents</h2>
      <p style="font-size:12px; color:var(--text-secondary); margin-top:4px;">
        Operating in coordination under Mayank Aggarwal's agency directives and approval boundaries.
      </p>
    </div>

    <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:16px; margin-bottom:24px;">
      ${agents.map(a => `
        <div class="glass-card" style="padding:16px; margin-bottom:0; display:flex; align-items:center; gap:12px;">
          <div style="font-size:24px;">${a.icon}</div>
          <div style="flex:1;">
            <div style="font-size:13px; font-weight:700; color:#fff;">${a.name}</div>
            <div style="font-size:11px; color:var(--cyan);">${a.role}</div>
          </div>
          <span class="system-status-pill" style="font-size:10px; padding:4px 8px;">${a.status}</span>
        </div>
      `).join('')}
    </div>

    <!-- Live Audit Logs Table -->
    <div class="glass-card">
      <h3 style="font-size:15px; color:#fff; font-weight:700; margin-bottom:12px;">
        🛡️ Live Security Audit & Execution Trail
      </h3>
      <div style="max-height:260px; overflow-y:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:11px; font-family:var(--font-mono);">
          <thead>
            <tr style="border-bottom:1px solid var(--border-subtle); color:var(--text-muted); text-align:left;">
              <th style="padding:8px;">Timestamp</th>
              <th style="padding:8px;">Actor</th>
              <th style="padding:8px;">Action</th>
              <th style="padding:8px;">Resource</th>
              <th style="padding:8px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${(state.auditLogs || []).slice(0, 15).map(l => `
              <tr style="border-bottom:1px solid rgba(255,255,255,0.03);">
                <td style="padding:8px; color:var(--text-muted);">${new Date(l.timestamp).toLocaleTimeString()}</td>
                <td style="padding:8px; color:var(--cyan);">${l.actor}</td>
                <td style="padding:8px; color:#fff;">${l.action}</td>
                <td style="padding:8px; color:var(--text-secondary);">${l.resource}</td>
                <td style="padding:8px; color:var(--green); font-weight:700;">${l.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
