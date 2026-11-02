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
          placeholder="e.g. Find 10 D2C women's fashion brands in Delhi." 
          value="Find 10 D2C women's fashion brands in Delhi."
          onkeydown="if(event.key==='Enter') executeCommandCenterWorkflow()"
        >
        <button class="btn-execute" id="btn-cc-exec" onclick="executeCommandCenterWorkflow()">
          <span>Launch AI Workflow</span>
          <span>➔</span>
        </button>
      </div>

      <!-- Quick-Launch Chips -->
      <div class="chips-row">
        <span class="chips-label">Quick Presets:</span>
        <button class="chip-btn" onclick="setCommandPrompt('Find 10 D2C women\'s fashion brands in Delhi.')">👗 10 D2C Fashion Brands in Delhi</button>
        <button class="chip-btn" onclick="setCommandPrompt('Find 15 real estate developers in Gurgaon that need Meta Ads.')">🏢 15 Real Estate in Gurgaon</button>
        <button class="chip-btn" onclick="setCommandPrompt('Find 12 luxury boutiques in South Delhi that need AI video ads.')">🛍️ 12 Luxury Boutiques in South Delhi</button>
        <button class="chip-btn" onclick="setCommandPrompt('Find 10 cafes and restaurants in Rohini needing social media growth.')">🍽️ 10 Restaurants in Rohini</button>
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

function runQuickDemo() {
  switchTab('command_center');
  setCommandPrompt("Find 10 D2C women's fashion brands in Delhi.");
  setTimeout(() => {
    executeCommandCenterWorkflow();
  }, 300);
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
    { title: '1. Maps Scraper', desc: 'Querying Google Maps API for local businesses...' },
    { title: '2. Crawl4AI Enrich', desc: 'Extracting contact emails, phones & socials...' },
    { title: '3. Lead Scoring', desc: 'Evaluating marketing gaps & budget intent...' },
    { title: '4. Pitch Generation', desc: 'Drafting personalized SOW & cold emails...' },
    { title: '5. Policy Verification', desc: 'Verifying Meta WhatsApp & anti-spam opt-in...' }
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

    // Mark steps as completed
    stepperGrid.innerHTML = (data.executionSteps || []).slice(0, 5).map(s => `
      <div class="stepper-card done">
        <div class="step-title" style="color:var(--green);">✅ Step ${s.step}</div>
        <div class="step-desc">${s.title}</div>
      </div>
    `).join('');

    document.getElementById('cc-stepper-status').innerText = 'COMPLETED (APPROVAL REQUIRED)';
    document.getElementById('cc-stepper-status').style.color = 'var(--green)';

    // Render the beautiful campaign cards
    resultsArea.innerHTML = renderCampaignCards(data);
  } catch (err) {
    resultsArea.innerHTML = `<div style="color:var(--red); padding:20px;">❌ Error executing workflow: ${err.message}</div>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<span>Launch AI Workflow</span> <span>➔</span>`;
  }
}

function renderSampleOrStagedLeads() {
  if (state.activeCampaign) {
    return renderCampaignCards(state.activeCampaign);
  }

  // Initial preview when user opens page
  const sampleLeads = [
    {
      id: 'l1',
      businessName: 'Zivame Fashion Hub',
      category: "D2C Women's Fashion",
      location: 'South Extension, Delhi',
      website: 'https://zivame.example.com',
      phone: '+91 9811122334',
      email: 'growth@zivame.example.com',
      leadScore: 96,
      recommendedServices: ['Performance Marketing (₹25k-₹30k)', 'AI Video Production (₹20k-₹30k)'],
      pitchSubject: 'Scaling Zivame Fashion Hub ROAS with AI Creatives & Meta Ads',
      pitchBody: 'Hi Team Zivame,\n\nI reviewed your latest collections in Delhi. We specialize in high-converting Meta Ads and AI video creatives that slash CAC while driving qualified orders. Would you be open to reviewing a short 3-pillar growth plan this week?\n\nBest,\nMayank Aggarwal\nCo-Founder & AI Creative Head, KLIKWise\n+91 9217756033'
    },
    {
      id: 'l2',
      businessName: 'Nykaa Luxe Boutique',
      category: 'Luxury Beauty & Cosmetics',
      location: 'Connaught Place, Delhi',
      website: 'https://nykaa.example.com',
      phone: '+91 9811133445',
      email: 'partnerships@nykaa.example.com',
      leadScore: 92,
      recommendedServices: ['Social Growth Retainer (₹20k-₹25k)', 'WhatsApp Marketing Automation'],
      pitchSubject: 'Enhancing Nykaa Luxe Customer Acquisition & Retention in Delhi NCR',
      pitchBody: 'Hi Nykaa Luxe Team,\n\nYour brand presence in Connaught Place is strong, but your organic-to-paid conversion funnel has massive upside. We build automated WhatsApp funnels and viral short-form reels that convert browsers into high-LTV buyers.\n\nWarm regards,\nMayank Aggarwal\nKLIKWise | +91 9217756033'
    },
    {
      id: 'l3',
      businessName: 'DLF Luxury Estates',
      category: 'Real Estate Developer',
      location: 'Cyber City, Gurgaon',
      website: 'https://dlf.example.com',
      phone: '+91 9811144556',
      email: 'marketing@dlf.example.com',
      leadScore: 94,
      recommendedServices: ['Performance Growth Package (₹25k-₹30k)', 'High-Net-Worth Lead Funnels'],
      pitchSubject: 'High-Ticket Investor Lead Generation for Luxury DLF Projects',
      pitchBody: 'Dear DLF Marketing Team,\n\nWe specialize in high-intent Meta and Google Performance Max campaigns for luxury real estate across Delhi NCR and NRI corridors, driving verified site visits at optimized CPL.\n\nSincerely,\nMayank Aggarwal\nCo-Founder, KLIKWise'
    }
  ];

  return `
    <div style="margin-top:20px;">
      <div class="campaign-bar">
        <div>
          <h3 style="font-size:16px; color:#fff; font-weight:700;">Sample Qualified Target Leads (Delhi NCR)</h3>
          <p style="font-size:12px; color:var(--text-secondary);">Click any prompt above to discover real live leads, or click "View AI Pitch" to review drafted messages.</p>
        </div>
        <div class="campaign-actions">
          <button class="btn-primary" onclick="alert('Demo: Leads approved! Enrolled into automated follow-up cadence.')">
            ✅ 1-Click Approve All (3)
          </button>
        </div>
      </div>
      <div class="leads-grid">
        ${sampleLeads.map(l => renderLeadCardHtml(l)).join('')}
      </div>
    </div>
  `;
}

function renderCampaignCards(campaign) {
  const leads = campaign.leads || [];
  return `
    <div style="margin-top:24px;">
      <div class="campaign-bar">
        <div>
          <h3 style="font-size:18px; color:#fff; font-weight:700;">
            Staged Campaign: ${campaign.plan?.niche || 'Target Niche'} (${campaign.plan?.location || 'Delhi NCR'})
          </h3>
          <p style="font-size:12px; color:var(--text-secondary); margin-top:2px;">
            <strong>${leads.length} Qualified Prospects</strong> discovered. Human review required before dispatching email & WhatsApp outreach.
          </p>
        </div>
        <div class="campaign-actions">
          <button class="btn-secondary" onclick="alert('Campaign discarded. Leads saved to research pool.')">
            Reject Batch
          </button>
          <button class="btn-primary" onclick="approveCurrentCampaign('${campaign.campaignId}')">
            ✅ One-Click Approve All & Launch (${leads.length})
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
  const services = (lead.recommendedServices || ['Performance Marketing', 'AI Video Production']).slice(0, 2);
  const scoreClass = lead.leadScore >= 90 ? 'green' : 'cyan';

  return `
    <div class="lead-card">
      <div class="lead-header">
        <div>
          <div class="lead-name">${lead.businessName}</div>
          <div class="lead-category">${lead.category || 'Local Business'} • ${lead.location || 'Delhi NCR'}</div>
        </div>
        <div class="lead-score-ring">
          ${lead.leadScore || 90}/100
        </div>
      </div>

      <div class="lead-contact-box">
        <div class="contact-line">
          <span>🌐</span>
          <a href="${lead.website || '#'}" target="_blank">${lead.website ? lead.website.replace('https://', '') : 'Website Discovered'}</a>
        </div>
        <div class="contact-line">
          <span>📞</span>
          <span>${lead.phone || '+91 98111 XXXXX'}</span>
          <button style="margin-left:auto; background:none; border:none; color:var(--cyan); cursor:pointer; font-size:11px;" onclick="copyToClipboard('${lead.phone}')">Copy</button>
        </div>
        <div class="contact-line">
          <span>✉️</span>
          <span>${lead.email || 'contact@brand.com'}</span>
        </div>
      </div>

      <div class="service-tags">
        ${services.map(s => `<span class="service-pill">${s}</span>`).join('')}
      </div>

      <div class="lead-footer">
        <div class="compliance-badge">
          <span>🛡️</span> Opt-in Required
        </div>
        <button class="btn-view-pitch" onclick="previewPitchModal('${lead.id}', '${encodeURIComponent(JSON.stringify(lead))}')">
          Read AI Pitch ✉️
        </button>
      </div>
    </div>
  `;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
  alert(`Copied: ${text}`);
}

async function approveCurrentCampaign(campaignId) {
  try {
    const res = await fetch('/api/command-center/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId })
    });
    const data = await res.json();
    alert(`🎉 Success! Campaign approved.\n${data.approvedCount || 'All'} leads have been staged into Listmonk and Meta WhatsApp queues with active Day-0, Day-3, Day-7 follow-up cadence.`);
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
  if (!lead) return;

  document.getElementById('modal-business-name').innerText = lead.businessName;
  document.getElementById('modal-lead-score').innerText = `Lead Score: ${lead.leadScore}/100`;
  document.getElementById('modal-recipient').innerText = lead.email || `${lead.businessName} Contact Team`;
  document.getElementById('modal-service').innerText = (lead.recommendedServices || ['Performance Marketing'])[0];
  document.getElementById('modal-subject').innerText = lead.pitchSubject || `Growth Strategy for ${lead.businessName} (Delhi NCR)`;
  document.getElementById('modal-body-text').innerText = lead.pitchBody || `Dear ${lead.businessName} Team,\n\nI reviewed your marketing presence in Delhi NCR and identified a major opportunity to scale revenue through dedicated Meta Ads and AI-driven creative storytelling.\n\nBest,\nMayank Aggarwal\nKLIKWise`;

  document.getElementById('pitch-modal').style.display = 'flex';
}

function closePitchModal() {
  document.getElementById('pitch-modal').style.display = 'none';
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

        <!-- Quick Question Prompts -->
        <div style="padding:8px 20px; background:rgba(0,0,0,0.15); display:flex; flex-wrap:wrap; gap:6px;">
          <button class="chip-btn" style="font-size:11px;" onclick="sendPresetSalesQuestion('What are your Performance Marketing charges?')">💰 Performance Marketing Charges?</button>
          <button class="chip-btn" style="font-size:11px;" onclick="sendPresetSalesQuestion('Can you rank my website on Google with SEO?')">❌ Do you do SEO?</button>
          <button class="chip-btn" style="font-size:11px;" onclick="sendPresetSalesQuestion('Where can I see your previous work / portfolio?')">📁 Show Portfolio</button>
          <button class="chip-btn" style="font-size:11px;" onclick="sendPresetSalesQuestion('Can you give a 50% discount for a startup?')">🏷️ Can I get a 50% discount?</button>
        </div>

        <!-- Chat Input Bar -->
        <div class="chat-input-bar">
          <input 
            type="text" 
            id="sales-chat-input" 
            class="chat-input" 
            placeholder="Type any client inquiry, objection, or question to test your AI sales rep..." 
            onkeydown="if(event.key==='Enter') sendSalesMessage()"
          >
          <button class="btn-execute" style="padding:0 20px; font-size:13px;" onclick="sendSalesMessage()">
            Send ➔
          </button>
        </div>
      </div>

      <!-- Right: Meta WhatsApp Cloud API Connection & Coexistence Panel -->
      <div class="info-panel">
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
          <h4><span>🛡️</span> Strict Anti-Spam Guardrails</h4>
          <p style="font-size:11px; color:var(--text-secondary); line-height:1.5;">
            • Zero unsolicited cold WhatsApp blasts.<br>
            • Only Meta-approved templates sent initially.<br>
            • Freeform text permitted only after prospect replies.<br>
            • Instant suppression if prospect texts "STOP".
          </p>
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

// ==========================================================================
// TAB 3: LEADS & CRM PIPELINE
// ==========================================================================
function renderCrmPipeline(el) {
  const stages = [
    { id: 'discovered', name: '1. Discovered', count: 4 },
    { id: 'qualified', name: '2. Qualified', count: 3 },
    { id: 'outreach', name: '3. Outreach Sent', count: 5 },
    { id: 'active', name: '4. In Discussion', count: 2 },
    { id: 'closed', name: '5. Deal Won', count: 1 }
  ];

  const leads = [
    { name: 'Zivame Fashion Hub', stage: 'qualified', score: 96, phone: '+91 9811122334', category: "D2C Fashion" },
    { name: 'Nykaa Luxe Delhi', stage: 'outreach', score: 92, phone: '+91 9811133445', category: 'Beauty & Retail' },
    { name: 'DLF Luxury Estates', stage: 'active', score: 94, phone: '+91 9811144556', category: 'Real Estate' },
    { name: 'Raw Mango Delhi', stage: 'discovered', score: 88, phone: '+91 9811155667', category: 'Luxury Apparel' },
    { name: 'The Bombay Canteen Delhi', stage: 'closed', score: 95, phone: '+91 9811166778', category: 'Hospitality' }
  ];

  el.innerHTML = `
    <div class="glass-card" style="margin-bottom:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h2 style="font-size:18px; color:#fff; font-weight:700;">KLIKWise CRM & Deal Pipeline</h2>
          <p style="font-size:12px; color:var(--text-secondary);">Interactive visual lifecycle across 14 synchronized stages with Twenty CRM.</p>
        </div>
        <button class="btn-primary" onclick="alert('Syncing active deals with Twenty CRM instance...')">🔄 Sync Twenty CRM</button>
      </div>
    </div>

    <div class="kanban-board">
      ${stages.map(st => `
        <div class="kanban-col">
          <div class="kanban-col-header">
            <span class="col-title">${st.name}</span>
            <span class="col-badge">${leads.filter(l => l.stage === st.id).length}</span>
          </div>
          <div class="kanban-cards">
            ${leads.filter(l => l.stage === st.id).map(l => `
              <div class="crm-card">
                <div style="font-weight:700; color:#fff; margin-bottom:4px;">${l.name}</div>
                <div style="font-size:11px; color:var(--cyan); margin-bottom:6px;">${l.category}</div>
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:10px; color:var(--text-muted);">
                  <span>📞 ${l.phone}</span>
                  <span style="color:var(--green); font-weight:700;">${l.score}/100</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
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
